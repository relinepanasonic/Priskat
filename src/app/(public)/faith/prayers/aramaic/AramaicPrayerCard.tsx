"use client";

import { useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { useReadAloud } from "@/lib/readAloud";
import type { AramaicPrayer } from "@/lib/aramaic";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

/** One Aramaic prayer: the Aramaic line, its meaning, and a Listen button that reads it line by line. */
export default function AramaicPrayerCard({ prayer }: { prayer: AramaicPrayer }) {
  const items = useMemo(() => prayer.lines.map((l, i) => ({ verse: i + 1, text: l.say })), [prayer]);
  const tts = useReadAloud(items, "id");

  const toggle = () => (tts.playing ? tts.stop() : void tts.play());

  return (
    <section className="rounded-2xl border bg-[#14171c] p-4" style={{ borderColor: `${GOLD}33` }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white" style={serif}>{prayer.title}</h2>
          <p className="text-xs text-brand-muted">{prayer.indoTitle}</p>
        </div>
        <button
          onClick={toggle}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-95 ${tts.playing ? "bg-amber-500 text-white" : "bg-brand-gold text-brand-dark"}`}
        >
          {tts.playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
          {tts.playing ? "Berhenti" : "Dengarkan"}
        </button>
      </div>

      <div className="space-y-3">
        {prayer.lines.map((l, i) => {
          const active = tts.current === i + 1;
          return (
            <div key={i} className={`rounded-xl p-2.5 transition-colors ${active ? "bg-amber-400/15" : ""}`}>
              <p className="text-[17px] font-semibold leading-snug text-[#EAE5D9]" style={serif}>{l.aram}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-brand-muted">{l.indo}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
