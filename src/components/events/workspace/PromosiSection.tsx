"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Megaphone, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SettingsTab } from "@/components/events/EventRegAdmin";
import { registerLink } from "@/lib/eventReg";
import { useEventData } from "./useEventData";

const STATUSES = [
  { id: "draft", label: "Belum dipromosikan", hint: "Masih disiapkan", tone: "border-gray-500/50 text-gray-300", on: "bg-gray-500/20 border-gray-400 text-white" },
  { id: "active", label: "Sedang dipromosikan", hint: "Link dan poster sedang dibagikan", tone: "border-emerald-500/40 text-emerald-300", on: "bg-emerald-500/20 border-emerald-400 text-emerald-200" },
  { id: "closed", label: "Promosi selesai", hint: "Tidak dipromosikan lagi", tone: "border-amber-500/40 text-amber-300", on: "bg-amber-500/20 border-amber-400 text-amber-200" },
] as const;

/** Promotion center: the promotion status, the registration link to share, and the registration settings. */
export default function PromosiSection({ eventId }: { eventId: string }) {
  const { event, settings, loading, reload } = useEventData(eventId);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat...</p>;
  if (!event) return <p className="py-10 text-center text-sm text-gray-500">Event tidak ditemukan.</p>;

  const link = settings?.public_code ? registerLink(settings.public_code) : null;
  const shareText = `*${event.title}*\nDaftar di sini: ${link ?? ""}`;

  async function setStatus(status: string) {
    setBusy(true); setError(null);
    const { error: err } = await (createClient() as any).from("events").update({ promo_status: status }).eq("id", eventId);
    setBusy(false);
    if (err) { setError(`Belum bisa mengubah status: ${err.message}`); return; }
    await reload();
  }

  async function copy() {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold"><Megaphone className="h-4 w-4" /> Status promosi</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STATUSES.map((s) => {
            const on = event.promo_status === s.id;
            return (
              <button key={s.id} disabled={busy} onClick={() => void setStatus(s.id)} aria-pressed={on}
                className={`rounded-xl border px-3 py-3 text-left transition ${on ? s.on : s.tone + " hover:bg-white/5"} disabled:opacity-60`}>
                <span className="block text-sm font-bold">{s.label}</span>
                <span className="block text-[11px] opacity-80">{s.hint}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>

      {event.banner_image_url && (
        <div className="overflow-hidden rounded-2xl border border-[#2a2d35]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.banner_image_url} alt="Poster" className="max-h-96 w-full bg-black/30 object-contain" />
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Bagikan link pendaftaran</p>
        {link ? (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-[#1a1d24] p-2.5">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{link.replace("https://", "")}</span>
              <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Tersalin" : "Salin"}</button>
              <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Buka link" className="shrink-0 rounded-lg border border-[#333] p-1.5 text-brand-light"><ExternalLink className="h-4 w-4" /></a>
            </div>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950"><MessageCircle className="h-4 w-4" /> Bagikan ke WhatsApp</a>
          </>
        ) : (
          <p className="text-xs text-brand-muted">Simpan pengaturan pendaftaran di bawah sekali, lalu link pendek muncul di sini.</p>
        )}
      </div>

      <SettingsTab eventId={eventId} settings={settings} onSaved={() => void reload()} design={false} />
    </div>
  );
}
