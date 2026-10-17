import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VOTD_POOL, jakartaDay, verseOfDayIndex, type VerseRef } from "@/lib/votd";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

// Verse of the Day (same for everyone today) or a random verse (?random=1).
//   GET /api/bible/votd?lang=id
const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => [b.no, b]));

/** TB text carries Hebrew verse markers "(34-9)" and Psalm headings; keep only the verse itself. */
function clean(text: string) {
  let t = text;
  const markers = [...t.matchAll(/\(\d+-\d+\)\s*/g)];
  if (markers.length) {
    const last = markers[markers.length - 1];
    t = t.slice((last.index ?? 0) + last[0].length);
  }
  return t.replace(/^(Mazmur|Nyanyian|Dari|Untuk|Doa|Pengajaran|Syair)\s[^.]*\.\s+(?=[A-Z])/, "").trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "id";
  const random = url.searchParams.get("random") === "1";
  const tr = lang === "id" ? "TB" : "NRSV-CE";
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });

  const start = random ? Math.floor(Math.random() * VOTD_POOL.length) : verseOfDayIndex();
  // Try the chosen verse; if a translation is missing it, take the next one in the pool
  for (let k = 0; k < 5; k++) {
    const [book, chapter, from, to] = VOTD_POOL[(start + k) % VOTD_POOL.length] as VerseRef;
    const { data } = await db
      .from("bible_verses")
      .select("verse, content")
      .eq("translation", tr)
      .eq("book_no", book)
      .eq("chapter", chapter)
      .gte("verse", from)
      .lte("verse", to ?? from)
      .order("verse");
    const rows = (data as { verse: number; content: string }[]) ?? [];
    if (!rows.length) continue;

    const meta = BOOKS.get(book);
    const name = meta ? (lang === "id" ? meta.name : meta.name_en) : "";
    return NextResponse.json(
      {
        book, chapter, from, to: to ?? from,
        reference: `${name} ${chapter}:${from}${to ? `-${to}` : ""}`,
        text: rows.map((r) => clean(r.content)).join(" "),
        day: jakartaDay(),
      },
      { headers: { "Cache-Control": random ? "no-store" : "public, s-maxage=1800, stale-while-revalidate=3600" } }
    );
  }
  return NextResponse.json({ error: "Ayat tidak ditemukan." }, { status: 404 });
}
