"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { Field, inputCls } from "./ui";
import type { WorkspaceEvent } from "./useEventData";

const MAX_PICTURES = 3;

/** Questions that are easy to answer; the answers become a good promotional text. */
const QUESTIONS: { key: string; label: string; placeholder: string; rows?: number }[] = [
  { key: "untuk", label: "Untuk siapa acara ini?", placeholder: "Mis. para ayah dan calon ayah Katolik di Surabaya" },
  { key: "dapat", label: "Apa yang akan peserta dapatkan atau alami?", placeholder: "Mis. belajar menjadi imam di keluarga, persekutuan, dan doa bersama", rows: 2 },
  { key: "beda", label: "Apa yang membuat acara ini istimewa? Kenapa harus ikut sekarang?", placeholder: "Mis. pertama kalinya diadakan di Pacet, hanya 25 orang pertama dapat harga khusus", rows: 2 },
  { key: "pengisi", label: "Siapa pembicara atau pengisi acaranya?", placeholder: "Mis. Romo Yohanes dan tim Pria Sejati Katolik" },
  { key: "termasuk", label: "Apa saja yang sudah termasuk?", placeholder: "Mis. penginapan 2 malam, makan, dan materi" },
  { key: "ayat", label: "Ayat atau kutipan tema (opsional)", placeholder: "Mis. Bapa, ke dalam tangan-Mu kuserahkan nyawaku (Luk 23:46)" },
  { key: "ajakan", label: "Kalimat ajakan di akhir (opsional)", placeholder: "Mis. Daftar sekarang dan ajak sahabatmu, tempat terbatas!" },
];

const tidy = (s: string | undefined) => (s ?? "").trim().replace(/[.\s]+$/g, "");

/** The promotional text, put together from the answers. Written in Indonesian, in short paragraphs. */
function compose(a: Record<string, string>, title: string, tagline: string | null): string {
  const untuk = tidy(a.untuk), dapat = tidy(a.dapat), beda = tidy(a.beda), pengisi = tidy(a.pengisi), termasuk = tidy(a.termasuk), ayat = tidy(a.ayat), ajakan = tidy(a.ajakan);
  const out: string[] = [];
  out.push([tagline ? `${tidy(tagline)}.` : "", untuk ? `${title} hadir untuk ${untuk}.` : `${title} sudah dibuka.`, dapat ? `Di sini kamu akan ${dapat}.` : ""].filter(Boolean).join(" "));
  if (beda) out.push(`${beda.charAt(0).toUpperCase()}${beda.slice(1)}.`);
  const mid = [pengisi ? `Bersama ${pengisi}.` : "", termasuk ? `Sudah termasuk: ${termasuk}.` : ""].filter(Boolean).join(" ");
  if (mid) out.push(mid);
  if (ayat) out.push(`“${ayat}”`);
  out.push(ajakan ? `${ajakan.charAt(0).toUpperCase()}${ajakan.slice(1)}${/[!?]$/.test(ajakan) ? "" : "."}` : "Yuk daftar sekarang dan ajak sahabatmu. Tempat terbatas!");
  return out.join("\n\n");
}

/** Promotional Event: up to 3 pictures, the guided questions, and the promotional text that people read before they register. */
export default function PromoContent({ event, reload }: { event: WorkspaceEvent; reload: () => Promise<void> }) {
  const [images, setImages] = useState<string[]>(event.promo_images ?? []);
  const [answers, setAnswers] = useState<Record<string, string>>(event.promo_answers ?? {});
  const [text, setText] = useState(event.promo_text ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function addPicture(file: File) {
    setUploading(true); setMsg(null);
    try {
      // the event's own folder in the design bucket: its admins and leaders may write there
      const url = await uploadImage(file, "event-designs", `${event.id}/promo-${Date.now()}.webp`);
      setImages((cur) => [...cur, url].slice(0, MAX_PICTURES));
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message || "Gambar belum bisa diunggah." });
    } finally {
      setUploading(false);
    }
  }

  function write() {
    if (!tidy(answers.untuk)) { setMsg({ ok: false, text: "Jawab dulu pertanyaan pertama: untuk siapa acara ini?" }); return; }
    if (text.trim() && !confirm("Teks promosi yang sekarang akan diganti dengan hasil dari jawabanmu. Lanjut?")) return;
    setText(compose(answers, event.title, event.tagline));
    setMsg({ ok: true, text: "Paragraf sudah disusun. Ubah sesukamu, lalu simpan." });
  }

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await (createClient() as any).from("events").update({ promo_text: text.trim() || null, promo_images: images, promo_answers: answers }).eq("id", event.id);
    setBusy(false);
    if (error) { setMsg({ ok: false, text: /promo_/.test(error.message) ? "Jalankan 136_event_promo_content.sql dulu." : `Belum bisa menyimpan: ${error.message}` }); return; }
    setMsg({ ok: true, text: "Tersimpan. Ini yang dibaca orang di halaman event sebelum mendaftar." });
    await reload();
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Foto (maksimal {MAX_PICTURES})</p>
        <div className="grid grid-cols-3 gap-2.5">
          {images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#2a2d35] bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages(images.filter((x) => x !== src))} aria-label="Hapus foto" className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1 text-white hover:bg-red-500"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {images.length < MAX_PICTURES && (
            <label className={`flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#444] text-xs text-brand-muted hover:border-brand-gold/60 ${uploading ? "opacity-60" : ""}`}>
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              {uploading ? "Mengunggah" : "Tambah foto"}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { const x = e.target.files?.[0]; if (x) void addPicture(x); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <p className="text-[11px] text-brand-muted">Foto potret 4:5 paling pas. Tampil di halaman event, di bawah poster utama.</p>
      </div>

      {/* PC: the questions on the left, the written text on the right */}
      <div className="grid items-start gap-5 border-t border-[#2a2d35] pt-5 md:grid-cols-2 md:gap-8">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Jawab dulu, paragraf disusun otomatis</p>
        {QUESTIONS.map((q) => (
          <Field key={q.key} label={q.label}>
            {q.rows ? (
              <textarea value={answers[q.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} rows={q.rows} placeholder={q.placeholder} className={`${inputCls} rounded-2xl`} />
            ) : (
              <input value={answers[q.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} placeholder={q.placeholder} className={inputCls} />
            )}
          </Field>
        ))}
        <button type="button" onClick={write} className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/50 py-2.5 text-sm font-bold text-brand-gold hover:bg-brand-gold/10"><Sparkles className="h-4 w-4" /> Susun paragraf promosi</button>
      </div>

      <div className="space-y-2 border-t border-[#2a2d35] pt-5 md:border-t-0 md:pt-0">
        <Field label="Teks promosi" hint="Boleh diubah sendiri. Pisahkan paragraf dengan baris kosong.">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} maxLength={4000} placeholder="Tulis sendiri di sini, atau jawab pertanyaan di atas lalu tekan Susun paragraf promosi." className={`${inputCls} rounded-2xl leading-relaxed`} />
        </Field>
        {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</p>}
        <button onClick={save} disabled={busy || uploading} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan promosi"}</button>
      </div>
      </div>
    </div>
  );
}
