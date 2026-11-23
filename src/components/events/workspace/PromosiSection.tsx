"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEventData } from "./useEventData";
import { Collapse } from "./ui";
import BannerPanel from "./BannerPanel";
import BroadcastPanel from "./BroadcastPanel";
import PromoLinks from "./PromoLinks";

const STATUSES = [
  { id: "draft", label: "Belum dipromosikan", on: "border-gray-400 bg-gray-500/20 text-white" },
  { id: "active", label: "Sedang dipromosikan", on: "border-emerald-400 bg-emerald-500/15 text-emerald-200" },
  { id: "closed", label: "Promosi selesai", on: "border-amber-400 bg-amber-500/15 text-amber-200" },
] as const;

/** Promosi in three boxes that open and close: 1. upload the photo, 2. the link, 3. the WhatsApp broadcast. */
export default function PromosiSection({ eventId }: { eventId: string }) {
  const { event, settings, loading, reload } = useEventData(eventId);
  const [busy, setBusy] = useState(false);
  const [openFoto, setOpenFoto] = useState(true);
  const [openLink, setOpenLink] = useState(false);
  const [openWa, setOpenWa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat...</p>;
  if (!event) return <p className="py-10 text-center text-sm text-gray-500">Event tidak ditemukan.</p>;

  async function setStatus(status: string) {
    setBusy(true); setError(null);
    const { error: err } = await (createClient() as any).from("events").update({ promo_status: status }).eq("id", eventId);
    setBusy(false);
    if (err) { setError(`Belum bisa mengubah status: ${err.message}`); return; }
    await reload();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-brand-muted">Status promosi</span>
        {STATUSES.map((s) => {
          const on = event.promo_status === s.id;
          return (
            <button key={s.id} disabled={busy} onClick={() => void setStatus(s.id)} aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition disabled:opacity-60 ${on ? s.on : "border-[#333] text-gray-300 hover:bg-white/5"}`}>
              {on && <Check className="h-3.5 w-3.5" />}{s.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}

      {/* 1. the picture */}
      <Collapse title="1. Upload foto" subtitle="Banner gratis di aplikasi (1 per event), lalu banner tambahan atau Running Banner" open={openFoto} onToggle={() => setOpenFoto((v) => !v)}>
        <BannerPanel key={`${settings?.default_link}-${settings?.external_link}`} eventId={eventId} />
      </Collapse>

      {/* 2. where people are sent */}
      <Collapse title="2. Link URL" subtitle="Link pendaftaran Ruang Iman, link lain (Google Form), dan mana yang jadi default" open={openLink} onToggle={() => setOpenLink((v) => !v)}>
        <PromoLinks eventId={eventId} settings={settings} onSaved={() => void reload()} />
      </Collapse>

      {/* 3. the messages */}
      <Collapse title="3. WA Broadcast" subtitle="Template pesan siap pakai untuk panitia: ajakan, pembayaran, QR, pengingat, terima kasih" open={openWa} onToggle={() => setOpenWa((v) => !v)}>
        <BroadcastPanel key={`${settings?.default_link}-${settings?.external_link}`} eventId={eventId} />
      </Collapse>
    </div>
  );
}
