"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Pause, Play, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localDay } from "@/lib/activity";
import { useReadAloud } from "@/lib/readAloud";

const serif = { fontFamily: "'Lora', Georgia, serif" };
const CATEGORIES = ["basic_prayer", "bunda_maria", "doa_harian", "tobat_syukur"];
const WAIT = 30;

const fmtDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
};

type Prayer = { id: string; title: string; body: string };

/** Tebus Hari: pray one short prayer given at random to make up a missed day. */
export default function TebusHariDialog({ missedDay, onClose, onDone }: { missedDay: string; onClose: () => void; onDone: () => void }) {
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(WAIT);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("prayers" as any).select("id, title_id, title_en").eq("is_published", true).in("category", CATEGORIES).limit(200);
      const list = (data as any[]) ?? [];
      if (list.length === 0) { setError("Belum ada doa yang bisa dipakai. Coba lagi nanti."); return; }
      const pick = list[Math.floor(Math.random() * list.length)];
      const { data: full } = await supabase.from("prayers" as any).select("body_id, body_en").eq("id", pick.id).single();
      setPrayer({ id: pick.id, title: pick.title_id || pick.title_en, body: (full as any)?.body_id || (full as any)?.body_en || "" });
    })();
  }, []);

  // The "Amin" button unlocks after a pause, so the prayer is actually read
  useEffect(() => {
    if (!prayer || left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [prayer, left]);

  const items = useMemo(() => (prayer ? [{ verse: 1, text: prayer.body }] : []), [prayer]);
  const tts = useReadAloud(items, "id", prayer?.title);

  async function redeem() {
    if (!prayer) return;
    setBusy(true);
    setError(null);
    tts.stop();
    const { error } = await createClient().rpc("redeem_day", { p_missed: missedDay, p_today: localDay(), p_ref: prayer.id });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setFinished(true);
    window.dispatchEvent(new Event("activity-recorded"));
    window.setTimeout(onDone, 1400);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl border border-brand-gold/30 bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-2xl md:rounded-3xl"
      >
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>

        {finished ? (
          <div className="py-10 text-center">
            <Flame className="mx-auto h-14 w-14 fill-violet-400 text-violet-300" />
            <h3 className="mt-3 text-xl font-bold">Hari ditebus 🙏</h3>
            <p className="mt-1 text-sm text-brand-muted">Nyalamu terjaga. Terima kasih sudah kembali berdoa.</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Tebus Hari</p>
            <h3 className="mt-1 text-xl font-bold" style={serif}>{fmtDay(missedDay)} terlewat</h3>
            <p className="mt-1 text-sm text-brand-muted">Tidak apa-apa. Doakan satu doa ini dengan tenang untuk menebusnya.</p>

            <div className="mt-4 min-h-[140px] flex-1 overflow-y-auto rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
              {!prayer && !error && <p className="text-sm text-brand-muted">Memilih doa…</p>}
              {prayer && (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-brand-gold" style={serif}>{prayer.title}</h4>
                    <button
                      onClick={() => (tts.playing ? tts.stop() : void tts.play())}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold"
                    >
                      {tts.playing ? <Pause className="h-3 w-3" fill="currentColor" /> : <Play className="h-3 w-3" fill="currentColor" />}
                      {tts.playing ? "Berhenti" : "Dengarkan"}
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{prayer.body}</p>
                </>
              )}
            </div>

            {error && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <button
              onClick={redeem}
              disabled={!prayer || left > 0 || busy}
              className="mt-4 w-full rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark transition disabled:opacity-50"
            >
              {busy ? "…" : left > 0 && prayer ? `Amin (${left})` : "Amin, tebus hari ini"}
            </button>
            <button onClick={onClose} className="mt-2 w-full py-2 text-xs text-brand-muted">Nanti saja</button>
          </>
        )}
      </div>
    </div>
  );
}
