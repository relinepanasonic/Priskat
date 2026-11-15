"use client";

import { useEffect, useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { useReadAloud } from "@/lib/readAloud";
import { recordActivity } from "@/lib/activity";
import { BENEDICT_CROSS, BENEDICT_LINES } from "@/lib/benediktus";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

/** The Medal of Saint Benedict prayer in Latin with its meaning. "Dengarkan" reads the Latin line by line; tap a line to hear just that one. */
export default function BenedictPrayer() {
  const lines = useMemo(() => [BENEDICT_CROSS, ...BENEDICT_LINES], []);
  const items = useMemo(() => lines.map((l, i) => ({ verse: i + 1, text: l.latin })), [lines]);
  const tts = useReadAloud(items, "la");

  // A prayer is read slowly
  const { setRate } = tts;
  useEffect(() => { setRate(0.75); }, [setRate]);

  const toggle = () => {
    if (tts.playing) { tts.stop(); return; }
    void recordActivity("prayer", "benediktus");
    void tts.play();
  };

  return (
    <section className="rounded-2xl border bg-[#14171c] p-4" style={{ borderColor: `${GOLD}33` }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white" style={serif}>Doa Medali Santo Benediktus</h2>
          <p className="text-xs text-brand-muted">Dalam bahasa Latin, dengan artinya</p>
        </div>
        <button
          onClick={toggle}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-95 ${tts.playing ? "bg-amber-500 text-white" : "bg-brand-gold text-brand-dark"}`}
        >
          {tts.playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
          {tts.playing ? "Berhenti" : "Dengarkan"}
        </button>
      </div>

      <div className="space-y-2.5">
        {lines.map((l, i) => {
          const active = tts.current === i + 1;
          return (
            <button
              key={l.latin}
              type="button"
              onClick={() => { tts.stop(); window.setTimeout(() => void tts.play(i + 1), 50); }}
              className={`block w-full rounded-xl p-3 text-left transition-colors ${active ? "bg-amber-400/15" : "bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{l.letters}</span>
                <span className="text-[10px] text-brand-muted">{l.where}</span>
              </span>
              <span className="mt-1 block text-[18px] font-semibold leading-snug text-[#EAE5D9]" style={serif}>{l.latin}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-brand-muted">{l.indo}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
