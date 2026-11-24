"use client";

import { useState } from "react";
import {
  Check,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Printer,
  ScanLine,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScanTab } from "@/components/events/EventRegAdmin";
import {
  TICKET_GRADIENTS,
  TICKET_TEMPLATES,
  gradientOf,
  sizeOf,
  templateOf,
  type TicketSize,
} from "@/lib/ticketDesign";
import { useEventData } from "./useEventData";
import { Collapse } from "./ui";

const db = () => createClient() as any;

/** QR & Absensi: scan attendance, print lanyard/A5 QR cards, and design the participant card in a live side-by-side studio. */
export default function QrSection({ eventId }: { eventId: string }) {
  const { regs, settings, loading, reload } = useEventData(eventId);
  const [scanning, setScanning] = useState(false);
  const [size, setSize] = useState<TicketSize | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [gradient, setGradient] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tick, setTick] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
        Memuat data QR & absensi...
      </div>
    );
  }

  // Use saved design until the admin edits a value
  const curSize = size ?? sizeOf(settings?.ticket_size);
  const curTemplate = templateOf(template ?? settings?.ticket_template);
  const curGradientObj = gradientOf(gradient ?? settings?.ticket_gradient);
  const curGradient = curGradientObj.id;
  const curBg = bgUrl ?? settings?.ticket_bg_url ?? "";
  const approved = regs.filter((r) => r.status === "approved").length;
  const present = regs.filter((r) => r.checked_in_at).length;
  const pct = approved > 0 ? Math.round((present / approved) * 100) : 0;

  const hasUnsavedChanges =
    size !== null || template !== null || gradient !== null || bgUrl !== null;

  const preview = `/api/events/${eventId}/ticket-preview?size=${curSize}&template=${curTemplate}&gradient=${curGradient}${
    curBg ? `&bg=${encodeURIComponent(curBg)}` : "&nobg=1"
  }&v=${tick}`;

  function bumpPreview() {
    setPreviewLoading(true);
    setTick((t) => t + 1);
  }

  async function uploadBg(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${eventId}/design-${Date.now()}.${ext}`;
      const supabase = createClient();
      const up = await supabase.storage
        .from("event-designs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) {
        throw new Error("Gambar belum bisa diunggah. Pastikan JPG, PNG, atau WEBP di bawah 8 MB.");
      }
      setBgUrl(supabase.storage.from("event-designs").getPublicUrl(path).data.publicUrl);
      bumpPreview();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error } = await db().from("event_reg_settings").upsert({
      event_id: eventId,
      ticket_size: curSize,
      ticket_template: curTemplate,
      ticket_gradient: curGradient,
      ticket_bg_url: curBg || null,
    });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: `Belum bisa menyimpan: ${error.message}` });
      return;
    }
    setMsg({ ok: true, text: "Desain tersimpan. QR yang dicetak memakai desain ini." });
    setSize(null);
    setTemplate(null);
    setGradient(null);
    setBgUrl(null);
    await reload();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {/* Top 2-column overview: Scan & Live Attendance | Print QR Lanyard */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Scan QR & Attendance */}
        <section className="card-lux flex flex-col justify-between gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                Absensi Hari-H
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">Scan QR Peserta</h2>
              <p className="mt-0.5 text-xs text-brand-muted">
                Arahkan kamera ke kartu QR peserta untuk mencatat kehadiran otomatis.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-xs font-bold text-brand-gold">
              {pct}%
            </span>
          </div>

          {/* Live Attendance Bar */}
          <div className="space-y-2 rounded-xl border border-white/5 bg-black/25 p-3.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-brand-muted">Kehadiran tercatat</span>
              <span className="font-semibold text-white">
                <span className="text-base font-bold text-brand-gold">{present}</span>
                <span className="text-brand-muted"> / {approved} peserta lunas</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b8924f] via-brand-gold to-[#f3d69b] transition-all duration-500"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#c8a15e] via-brand-gold to-[#e5c485] px-5 py-3.5 text-sm font-bold text-brand-dark shadow-lg shadow-brand-gold/15 transition hover:brightness-105 active:scale-[0.99]"
            >
              <ScanLine className="h-5 w-5" strokeWidth={2.2} />
              Mulai Scan QR
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/events/${eventId}/attendance?format=xlsx`}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-brand-light transition hover:border-brand-gold/40 hover:bg-white/[0.06]"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                Absensi Excel
              </a>
              <a
                href={`/api/events/${eventId}/attendance?format=pdf`}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-brand-light transition hover:border-brand-gold/40 hover:bg-white/[0.06]"
              >
                <FileText className="h-4 w-4 text-rose-400" />
                Absensi PDF
              </a>
            </div>
          </div>
        </section>

        {/* Right: Print QR for Lanyard / A5 */}
        <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">
              Cetak Kartu
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Cetak QR untuk Lanyard</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-brand-muted">
              Satu halaman PDF per peserta yang sudah lunas, sesuai ukuran cetak asli menggunakan desain kartu di bawah.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-muted">Ukuran cetak</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  ["card", "Lanyard / Kartu", "55 × 85 mm"],
                  ["a5", "Ukuran A5", "148 × 210 mm"],
                ] as [TicketSize, string, string][]
              ).map(([k, label, dim]) => {
                const active = curSize === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSize(k);
                      bumpPreview();
                    }}
                    className={`flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition ${
                      active
                        ? "border-brand-gold bg-brand-gold/10 text-white shadow-sm shadow-brand-gold/10"
                        : "border-[#2c303a] bg-[#0f1216] text-brand-light hover:border-white/20"
                    }`}
                  >
                    <span className={`text-xs font-bold ${active ? "text-brand-gold" : "text-white"}`}>
                      {label}
                    </span>
                    <span className="mt-0.5 text-[11px] text-brand-muted">{dim}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <a
            href={`/api/events/${eventId}/tickets?size=${curSize}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/50 bg-brand-gold/15 px-5 py-3.5 text-sm font-bold text-brand-gold transition hover:bg-brand-gold hover:text-brand-dark active:scale-[0.99]"
          >
            <Printer className="h-4 w-4" />
            Cetak Semua QR (PDF)
          </a>
        </section>
      </div>

      {/* Bottom: Live Split-Screen Card Designer Studio */}
      <Collapse
        title="Bikin Kartu Peserta"
        subtitle="Atur template, warna latar, atau gambar sendiri dengan pratinjau langsung"
        open={designOpen}
        onToggle={() => setDesignOpen((v) => !v)}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_290px] lg:items-start">
          {/* Left: Controls */}
          <div className="space-y-5">
            {/* Template Picker */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                1. Pilih Template
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {TICKET_TEMPLATES.map((t) => {
                  const active = curTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTemplate(t.id);
                        bumpPreview();
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                        active
                          ? "border-brand-gold bg-brand-gold/15 text-brand-gold shadow-sm shadow-brand-gold/10"
                          : "border-[#2e323c] bg-[#0f1216] text-brand-light hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gradient Swatches */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                  2. Warna Latar
                </p>
                <span className="text-[11px] font-medium text-brand-gold">
                  {curGradientObj.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {TICKET_GRADIENTS.map((g) => {
                  const active = curGradient === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGradient(g.id);
                        bumpPreview();
                      }}
                      aria-label={g.label}
                      title={g.label}
                      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition hover:scale-105 ${
                        active
                          ? "border-brand-gold ring-2 ring-brand-gold/30"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      style={{
                        background: `linear-gradient(160deg, ${g.stops[0]}, ${g.stops[1]})`,
                      }}
                    >
                      {active && <Check className="h-4 w-4 text-white drop-shadow" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-brand-muted">
                Dipakai otomatis apabila tidak mengunggah gambar latar sendiri.
              </p>
            </div>

            {/* Custom Background Upload */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                3. Gambar Latar Sendiri (Opsional)
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <label
                  className={`relative flex flex-1 min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#3f4451] bg-[#0f1216] px-4 py-3 text-xs font-semibold text-brand-light transition hover:border-brand-gold/60 hover:text-white ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-brand-gold" />
                  )}
                  <span>
                    {uploading
                      ? "Mengunggah gambar…"
                      : curBg
                        ? "Ganti gambar latar"
                        : "Unggah gambar latar (JPG/PNG/WEBP)"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const x = e.target.files?.[0];
                      if (x) void uploadBg(x);
                      e.target.value = "";
                    }}
                  />
                </label>

                {curBg && (
                  <button
                    type="button"
                    onClick={() => {
                      setBgUrl("");
                      bumpPreview();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-brand-muted">
                Gunakan gambar potret beresolusi tinggi. Nama dan QR Code ditaruh di bagian bawah, jadi sisakan ruang bersih di area tersebut.
              </p>
            </div>

            {/* Save Bar */}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-6 py-3 text-sm font-bold text-brand-dark shadow-md shadow-brand-gold/15 transition hover:bg-brand-gold-hover active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {busy ? "Menyimpan…" : "Simpan Desain"}
              </button>

              {hasUnsavedChanges && !msg && (
                <span className="text-xs text-amber-300/90">
                  Ada perubahan yang belum disimpan
                </span>
              )}

              {msg && (
                <p
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    msg.ok
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                      : "bg-red-500/15 text-red-300 border border-red-500/25"
                  }`}
                >
                  {msg.text}
                </p>
              )}
            </div>
          </div>

          {/* Right: Live Preview Studio Stage */}
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(214,176,114,0.14),rgba(12,14,18,0.95)_70%)] p-5 lg:sticky lg:top-6">
            <div className="mb-3 flex w-full items-center justify-between text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-brand-muted">
                Pratinjau Langsung
              </span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-medium text-brand-light">
                {curSize === "card" ? "55×85 mm" : "A5"} ·{" "}
                {TICKET_TEMPLATES.find((t) => t.id === curTemplate)?.label}
              </span>
            </div>

            <div className="relative flex min-h-[300px] w-full items-center justify-center">
              {previewLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={preview}
                src={preview}
                alt="Contoh kartu peserta"
                onLoad={() => setPreviewLoading(false)}
                onError={() => setPreviewLoading(false)}
                className="w-52 rounded-xl border border-white/15 shadow-2xl shadow-black/70 transition-opacity duration-200"
              />
            </div>

            <p className="mt-3 text-center text-[11px] text-brand-muted">
              Contoh tampilan kartu yang akan dicetak
            </p>
          </div>
        </div>
      </Collapse>

      {/* QR Scanner Modal */}
      {scanning && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/90 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-[#1a1d24] p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Scan QR untuk absensi</p>
              <button
                type="button"
                onClick={() => setScanning(false)}
                aria-label="Tutup"
                className="rounded-lg p-1.5 text-brand-muted transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ScanTab eventId={eventId} present={present} total={approved} onDone={() => void reload()} />
          </div>
        </div>
      )}
    </div>
  );
}
