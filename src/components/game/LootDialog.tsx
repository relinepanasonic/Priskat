"use client";

import { useState } from "react";
import { Gift, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localDay } from "@/lib/activity";
import { cardByKey, frameByKey, NAME_COLORS } from "@/lib/gameCatalog";

type Reward =
  | { type: "points"; amount: number; big?: boolean }
  | { type: "card"; key: string; big?: boolean }
  | { type: "cosmetic"; item_type: "frame" | "name_color"; key: string; big?: boolean };

const serif = { fontFamily: "'Lora', Georgia, serif" };

/** Berkat Harian: open the daily chest after the first prayer of the day. */
export default function LootDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setOpening(true);
    setError(null);
    const { data, error } = await createClient().rpc("claim_loot", { p_day: localDay() });
    if (error) { setOpening(false); setError(error.message); return; }
    window.setTimeout(() => { setReward(data as Reward); setOpening(false); window.dispatchEvent(new Event("activity-recorded")); }, 900);
  }

  const card = reward?.type === "card" ? cardByKey(reward.key) : null;
  const frame = reward?.type === "cosmetic" && reward.item_type === "frame" ? frameByKey(reward.key) : null;
  const color = reward?.type === "cosmetic" && reward.item_type === "name_color" ? NAME_COLORS.find((c) => c.key === reward.key) : null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4" onClick={reward ? onDone : onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-3xl border border-brand-gold/40 bg-gradient-to-b from-[#241f12] to-[#14171c] p-6 text-center text-white shadow-2xl">
        <button onClick={reward ? onDone : onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>

        {!reward ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Berkat Harian</p>
            <div className={`mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-gold/15 ${opening ? "animate-bounce" : "animate-pulse"}`}>
              <Gift className="h-14 w-14 text-brand-gold" />
            </div>
            <h3 className="mt-5 text-xl font-bold" style={serif}>Kamu sudah berdoa hari ini</h3>
            <p className="mt-1 text-sm text-brand-muted">Ambil berkatmu. Gratis, setiap hari.</p>
            {error && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
            <button onClick={open} disabled={opening} className="mt-5 w-full rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark disabled:opacity-60">
              {opening ? "Membuka…" : "Buka berkat"}
            </button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">{reward.big ? "Berkat Besar · 7 hari berturut-turut" : "Berkat Harian"}</p>
            {reward.type === "points" && (
              <>
                <div className="mt-5 text-6xl">✨</div>
                <h3 className="mt-3 text-3xl font-extrabold text-amber-300">+{reward.amount} poin</h3>
                <p className="mt-1 text-sm text-brand-muted">Tuhan memberkati doamu hari ini.</p>
              </>
            )}
            {card && (
              <>
                <div className="mx-auto mt-5 w-44 rounded-2xl border-2 border-brand-gold/60 bg-gradient-to-b from-[#2a2414] to-[#15130c] p-4 shadow-[0_0_30px_rgba(214,176,114,0.35)]">
                  <div className="text-5xl">{card.emoji}</div>
                  <p className="mt-2 text-sm font-bold text-brand-gold" style={serif}>{card.name}</p>
                  <p className="mt-1 text-[11px] leading-snug text-gray-300">{card.text}</p>
                </div>
                <h3 className="mt-4 text-lg font-bold">Kartu baru!</h3>
                <p className="text-sm text-brand-muted">Tersimpan di Album di halaman Koleksi.</p>
              </>
            )}
            {frame && (
              <>
                <div className="mt-5 text-6xl">{frame.emoji || "🖼️"}</div>
                <h3 className="mt-3 text-lg font-bold">Bingkai baru: {frame.name}</h3>
                <p className="text-sm text-brand-muted">Pakai di halaman Koleksi.</p>
              </>
            )}
            {color && (
              <>
                <div className="mt-5 text-6xl">🎨</div>
                <h3 className="mt-3 text-lg font-bold">Warna nama baru: {color.name}</h3>
                <p className="text-sm text-brand-muted">Pakai di halaman Koleksi.</p>
              </>
            )}
            <button onClick={onDone} className="mt-6 w-full rounded-xl border border-brand-gold py-3 text-sm font-bold text-brand-gold">Amin, terima kasih</button>
          </>
        )}
      </div>
    </div>
  );
}
