"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Megaphone, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerLink } from "@/lib/eventReg";
import { formatWeekdayDate, formatTime } from "@/lib/utils";
import { useEventData } from "./useEventData";
import { Card } from "./ui";
import { LinkPesertaButton, getRegisterLink } from "./LinkPeserta";

const STATUSES = [
  { id: "draft", label: "Belum dipromosikan", hint: "Masih disiapkan", off: "border-[#333] text-gray-300", on: "border-gray-400 bg-gray-500/20 text-white" },
  { id: "active", label: "Sedang dipromosikan", hint: "Poster dan link sedang dibagikan", off: "border-[#333] text-gray-300", on: "border-emerald-400 bg-emerald-500/15 text-emerald-200" },
  { id: "closed", label: "Promosi selesai", hint: "Tidak dipromosikan lagi", off: "border-[#333] text-gray-300", on: "border-amber-400 bg-amber-500/15 text-amber-200" },
] as const;

/** Promosi: only the promotion. The status, the poster, the link and a ready text to share. */
export default function PromosiSection({ eventId }: { eventId: string }) {
  const { event, settings, loading, reload } = useEventData(eventId);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat...</p>;
  if (!event) return <p className="py-10 text-center text-sm text-gray-500">Event tidak ditemukan.</p>;

  const link = settings?.public_code ? registerLink(settings.public_code) : null;
  const when = event.event_date ? `${formatWeekdayDate(event.event_date)}, ${formatTime(event.event_date)} WIB` : "";
  // a ready text for WhatsApp and social media: name, tagline, when, where and the link
  const parts: (string | null | undefined | false)[] = [
    `*${event.title}*`, event.tagline, "", when && `📅 ${when}`, event.location && `📍 ${event.location}`, "",
    link ? `Daftar di sini: ${link}` : "Pendaftaran segera dibuka.",
  ];
  const caption = parts.filter((x): x is string => typeof x === "string").join("\n");

  async function setStatus(status: string) {
    setBusy(true); setError(null);
    const { error: err } = await (createClient() as any).from("events").update({ promo_status: status }).eq("id", eventId);
    setBusy(false);
    if (err) { setError(`Belum bisa mengubah status: ${err.message}`); return; }
    await reload();
  }

  async function copy(text: string, what: "link" | "text") {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(null), 1800); } catch { /* ignore */ }
  }

  return (
    <div className="space-y-5">
      <Card title="Status promosi">
        <div className="grid gap-2 sm:grid-cols-3">
          {STATUSES.map((s) => {
            const on = event.promo_status === s.id;
            return (
              <button key={s.id} disabled={busy} onClick={() => void setStatus(s.id)} aria-pressed={on}
                className={`rounded-xl border px-3.5 py-3 text-left transition disabled:opacity-60 ${on ? s.on : `${s.off} hover:bg-white/5`}`}>
                <span className="flex items-center gap-1.5 text-sm font-bold">{on && <Check className="h-4 w-4" />}{s.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-80">{s.hint}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </Card>

      {event.banner_image_url && (
        <Card title="Poster">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.banner_image_url} alt="Poster" className="mx-auto max-h-96 rounded-xl bg-black/30 object-contain" />
          <a href={event.banner_image_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-semibold text-brand-light hover:bg-white/5"><ExternalLink className="h-4 w-4" /> Buka poster ukuran penuh</a>
        </Card>
      )}

      <Card title="Link pendaftaran" hint="Bagikan lewat WhatsApp, Instagram, atau email.">
        {link ? (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-black/30 p-2.5">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{link.replace("https://", "")}</span>
              <button type="button" onClick={() => void copy(link, "link")} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark">{copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "link" ? "Tersalin" : "Salin"}</button>
              <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Buka link" className="shrink-0 rounded-lg border border-[#333] p-1.5 text-brand-light"><ExternalLink className="h-4 w-4" /></a>
            </div>
          </>
        ) : (
          <LinkPesertaButton run={() => getRegisterLink(eventId)} title="Buat link pendaftaran" />
        )}
      </Card>

      <Card title="Teks promosi" hint="Sudah berisi nama event, tagline, waktu, tempat, dan link. Salin lalu tempel di WhatsApp atau Instagram.">
        <textarea readOnly value={caption} rows={7} className="w-full resize-none rounded-2xl border border-[#333] bg-black/30 px-3.5 py-3 text-sm leading-relaxed text-gray-200 focus:outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void copy(caption, "text")} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5">{copied === "text" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === "text" ? "Tersalin" : "Salin teks"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-brand-muted"><Megaphone className="h-3.5 w-3.5" /> Nama, tagline, tanggal, dan tempat diubah di tab Tentang.</p>
      </Card>
    </div>
  );
}
