"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Image as ImageIcon, Printer, ScanLine, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScanTab } from "@/components/events/EventRegAdmin";
import { TICKET_GRADIENTS, TICKET_TEMPLATES, gradientOf, sizeOf, templateOf, type TicketSize } from "@/lib/ticketDesign";
import { useEventData } from "./useEventData";

const db = () => createClient() as any;

/** QR and absensi: one button to scan, print the QR for lanyards, and design what the printed ticket looks like. */
export default function QrSection({ eventId }: { eventId: string }) {
  const { regs, settings, loading, reload } = useEventData(eventId);
  const [scanning, setScanning] = useState(false);
  const [size, setSize] = useState<TicketSize | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [gradient, setGradient] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat...</p>;

  // the saved design until the admin changes something
  const curSize = size ?? sizeOf(settings?.ticket_size);
  const curTemplate = templateOf(template ?? settings?.ticket_template);
  const curGradient = gradientOf(gradient ?? settings?.ticket_gradient).id;
  const curBg = bgUrl ?? settings?.ticket_bg_url ?? "";
  const approved = regs.filter((r) => r.status === "approved").length;
  const present = regs.filter((r) => r.checked_in_at).length;

  const preview = `/api/events/${eventId}/ticket-preview?size=${curSize}&template=${curTemplate}&gradient=${curGradient}${curBg ? `&bg=${encodeURIComponent(curBg)}` : "&nobg=1"}&v=${tick}`;

  async function uploadBg(file: File) {
    setUploading(true); setMsg(null);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${eventId}/design-${Date.now()}.${ext}`;
      const supabase = createClient();
      const up = await supabase.storage.from("event-designs").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) throw new Error("Gambar belum bisa diunggah. Pastikan JPG, PNG, atau WEBP di bawah 8 MB.");
      setBgUrl(supabase.storage.from("event-designs").getPublicUrl(path).data.publicUrl);
      setTick((t) => t + 1);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await db().from("event_reg_settings").upsert({
      event_id: eventId, ticket_size: curSize, ticket_template: curTemplate, ticket_gradient: curGradient, ticket_bg_url: curBg || null,
    });
    setBusy(false);
    setMsg(error ? `Belum bisa menyimpan: ${error.message}` : "Desain tersimpan. QR yang dicetak memakai desain ini.");
    if (!error) { setSize(null); setTemplate(null); setGradient(null); setBgUrl(null); await reload(); }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <button onClick={() => setScanning(true)} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-gold py-5 text-lg font-bold text-brand-dark hover:opacity-90">
          <ScanLine className="h-6 w-6" /> Scan QR
        </button>
        <p className="text-center text-sm text-brand-light">Hadir <b className="text-brand-gold">{present}</b> dari <b className="text-white">{approved}</b> peserta yang disetujui</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Cetak QR untuk lanyard</p>
        <div className="grid grid-cols-2 gap-2">
          {([["card", "Lanyard (55 x 85 mm)"], ["a5", "A5 (148 x 210 mm)"]] as [TicketSize, string][]).map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setSize(k); setTick((t) => t + 1); }} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${curSize === k ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-[#333] text-brand-light"}`}>{l}</button>
          ))}
        </div>
        <a href={`/api/events/${eventId}/tickets?size=${curSize}`} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark"><Printer className="h-4 w-4" /> Cetak semua QR (PDF)</a>
        <p className="text-[11px] text-brand-muted">Satu halaman per peserta yang disetujui, sebesar ukuran cetak aslinya. Memakai desain yang tersimpan di bawah.</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={`/api/events/${eventId}/attendance?format=xlsx`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light"><FileSpreadsheet className="h-4 w-4" /> Absensi Excel</a>
          <a href={`/api/events/${eventId}/attendance?format=pdf`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light"><FileText className="h-4 w-4" /> Absensi PDF</a>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Desain QR lanyard</p>

        <div>
          <p className="mb-2 text-xs font-semibold text-brand-muted">Template</p>
          <div className="grid grid-cols-5 gap-1.5">
            {TICKET_TEMPLATES.map((t) => (
              <button key={t.id} type="button" onClick={() => { setTemplate(t.id); setTick((x) => x + 1); }} className={`rounded-lg border px-1 py-2 text-[11px] font-semibold ${curTemplate === t.id ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-[#333] text-brand-light"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-brand-muted">Warna latar (dipakai kalau tidak ada gambar latar)</p>
          <div className="grid grid-cols-5 gap-2">
            {TICKET_GRADIENTS.map((g) => (
              <button key={g.id} type="button" onClick={() => { setGradient(g.id); setTick((x) => x + 1); }} aria-label={g.label} title={g.label}
                className={`h-10 rounded-lg border-2 ${curGradient === g.id ? "border-brand-gold" : "border-transparent"}`}
                style={{ background: `linear-gradient(180deg, ${g.stops[0]}, ${g.stops[1]})` }} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#444] py-3 text-sm font-semibold text-brand-light ${uploading ? "opacity-60" : ""}`}>
            <ImageIcon className="h-4 w-4" /> {uploading ? "Mengunggah…" : curBg ? "Ganti gambar latar" : "Unggah gambar latar sendiri"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { const x = e.target.files?.[0]; if (x) void uploadBg(x); e.target.value = ""; }} />
          </label>
          {curBg && (
            <button type="button" onClick={() => { setBgUrl(""); setTick((x) => x + 1); }} className="flex items-center gap-1 text-xs font-semibold text-red-300 underline"><X className="h-3 w-3" /> Hapus gambar latar</button>
          )}
          <p className="text-[11px] leading-relaxed text-brand-muted">Gambar potret, makin besar makin tajam. Nama dan QR Code ditaruh di panel di bagian bawah, jadi sisakan ruang di sana.</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-brand-muted">Pratinjau</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={preview} src={preview} alt="Contoh tiket" className="mx-auto w-56 rounded-xl border border-[#333] bg-black/30" />
        </div>

        {msg && <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-brand-light">{msg}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan desain"}</button>
      </div>

      {scanning && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/90 p-4">
          <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl bg-[#1a1d24] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Scan QR untuk absensi</p>
              <button onClick={() => setScanning(false)} aria-label="Tutup" className="rounded-lg p-1.5 text-brand-muted hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <ScanTab eventId={eventId} present={present} total={approved} onDone={() => void reload()} />
          </div>
        </div>
      )}
    </div>
  );
}
