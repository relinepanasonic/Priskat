import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cleanVerse } from "@/lib/bibleText";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

/**
 * Human-sounding Bible reading (Azure neural voices).
 *   GET /api/tts?b=24&c=31&v=3[-5]&lang=id&voice=f|m     one verse (or a short range)
 *   GET /api/tts?b=24&c=31&intro=1&lang=id&voice=f        "Yeremia pasal 31"
 * The text always comes from our own database (never from the caller), and every
 * answer is cached on the CDN for a year, so each verse is synthesised once.
 * No AZURE_SPEECH_KEY → 501 and the app falls back to the phone's own voice.
 */
const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => [b.no, b]));
const VOICES = {
  id: { f: "id-ID-GadisNeural", m: "id-ID-ArdiNeural", locale: "id-ID" },
  en: { f: "en-US-JennyNeural", m: "en-US-GuyNeural", locale: "en-US" },
} as const;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(request: Request) {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const geminiKey = process.env.GEMINI_API_KEY;
  const want = process.env.TTS_PROVIDER; // optional: "azure" | "gemini"
  const provider = want === "gemini" && geminiKey ? "gemini" : want === "azure" && azureKey && region ? "azure" : azureKey && region ? "azure" : geminiKey ? "gemini" : null;
  if (!provider) return NextResponse.json({ error: "tts-disabled" }, { status: 501 });

  const p = new URL(request.url).searchParams;
  const book = Number(p.get("b"));
  const chapter = Number(p.get("c"));
  const gender = p.get("voice") === "m" ? "m" : "f";
  let lang: "id" | "en" = p.get("lang") === "en" ? "en" : "id";
  const meta = BOOKS.get(book);
  if (!meta || !Number.isInteger(chapter) || chapter < 1 || chapter > meta.chapter) return NextResponse.json({ error: "bad-ref" }, { status: 400 });

  let text = "";
  if (p.get("intro") === "1") {
    const iv = (p.get("v") ?? "").match(/^(d{1,3})(?:-(d{1,3}))?$/);
    const idv = iv ? ` ayat ${iv[1]}${iv[2] ? ` sampai ${iv[2]}` : ""}` : "";
    const env = iv ? ` verse ${iv[1]}${iv[2] ? ` to ${iv[2]}` : ""}` : "";
    text = lang === "id" ? `${meta.name} pasal ${chapter}${idv}` : `${meta.name_en} chapter ${chapter}${env}`;
  } else {
    const m = (p.get("v") ?? "").match(/^(\d{1,3})(?:-(\d{1,3}))?$/);
    if (!m) return NextResponse.json({ error: "bad-ref" }, { status: 400 });
    const from = Number(m[1]);
    const to = Math.min(Number(m[2] ?? m[1]), from + 9);

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    // The Indonesian TB has no deuterocanonical books: those are read in English
    if (lang === "id" && book >= 67) lang = "en";
    const { data } = await db
      .from("bible_verses")
      .select("verse, content")
      .eq("translation", lang === "id" ? "TB" : "NRSV-CE")
      .eq("book_no", book)
      .eq("chapter", chapter)
      .gte("verse", from)
      .lte("verse", to)
      .order("verse");
    const rows = (data as { verse: number; content: string }[]) ?? [];
    if (!rows.length) return NextResponse.json({ error: "not-found" }, { status: 404 });
    text = rows.map((r) => cleanVerse(r.content)).join(" ").slice(0, 2500);
  }

  if (provider === "gemini") return geminiSpeech(text, lang, gender, geminiKey!);

  const key = azureKey!;
  const v = VOICES[lang];
  const ssml = `<speak version="1.0" xml:lang="${v.locale}"><voice name="${v[gender]}"><prosody rate="-4%">${esc(text)}</prosody></voice></speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "ruang-iman",
    },
    body: ssml,
  });
  if (!res.ok) return NextResponse.json({ error: "tts-failed" }, { status: 502 });

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}

/** Gemini speech: returns raw 24 kHz 16-bit mono PCM, wrapped here as a WAV file. */
async function geminiSpeech(text: string, lang: "id" | "en", gender: "f" | "m", key: string) {
  const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  const voiceName = gender === "m" ? "Charon" : "Kore";
  const style = lang === "id"
    ? "Bacakan ayat Alkitab ini dalam bahasa Indonesia dengan suara tenang, hangat, dan khidmat, tidak terburu-buru: "
    : "Read this Bible verse slowly in a calm, warm and reverent voice: ";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: style + text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "tts-failed" }, { status: 502 });
  const json = await res.json();
  const b64: string | undefined = json?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
  if (!b64) return NextResponse.json({ error: "tts-failed" }, { status: 502 });

  const pcm = Buffer.from(b64, "base64");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24); header.writeUInt32LE(48000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return new Response(Buffer.concat([header, pcm]), {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}
