"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { recordStreakCheckIn } from "@/lib/streak";

/** 7 flames = a week of praying every day. Lit flames = consecutive days so far (restarts after day 7). */
export default function HomeStreak({ isEn }: { isEn: boolean }) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    setStreak(recordStreakCheckIn().currentStreak);
  }, []);

  if (streak === null) return <div className="h-[84px]" aria-hidden />;

  const lit = ((streak - 1) % 7) + 1;
  const weeks = Math.floor((streak - 1) / 7);

  return (
    <div className="rounded-[20px] border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
          {isEn ? "7-day prayer streak" : "7 hari berdoa berturut-turut"}
        </span>
        <span className="text-xs font-bold text-amber-200">{streak} {isEn ? (streak === 1 ? "day" : "days") : "hari"}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        {Array.from({ length: 7 }).map((_, i) => {
          const on = i < lit;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <Flame
                className={`h-7 w-7 transition-all ${on ? "fill-amber-400 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" : "fill-transparent text-white/20"} ${on && i === lit - 1 ? "animate-pulse" : ""}`}
              />
              <span className={`text-[10px] font-semibold ${on ? "text-amber-300" : "text-white/30"}`}>{i + 1}</span>
            </div>
          );
        })}
      </div>
      {weeks > 0 && (
        <p className="mt-2 text-center text-[11px] text-amber-200/80">
          {isEn ? `${weeks} full week${weeks > 1 ? "s" : ""} completed` : `${weeks} minggu penuh selesai`} 🌟
        </p>
      )}
    </div>
  );
}
