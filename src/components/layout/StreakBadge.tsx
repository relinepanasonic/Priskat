"use client";

import { useState, useEffect } from "react";
import { Flame, X, Trophy, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import { getStoredStreak, recordStreakCheckIn, StreakData } from "@/lib/streak";

const DAYS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function StreakBadge() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Record check-in for today & fetch current streak
    const data = recordStreakCheckIn();
    setStreakData(data);
  }, []);

  if (!streakData) return null;

  return (
    <>
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 shadow-sm group"
        title="Strik Doa & Firman"
      >
        <Flame className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
        <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
          {streakData.currentStreak} Hari
        </span>
      </button>

      {/* Streak Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#1e222b] border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden text-center space-y-6">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Flame Icon */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/30 to-red-500/20 flex items-center justify-center border border-amber-400/40 shadow-inner">
              <Flame className="w-10 h-10 text-amber-400 fill-amber-400 animate-bounce" />
              <Sparkles className="absolute top-1 right-1 w-4 h-4 text-amber-200 animate-pulse" />
            </div>

            {/* Streak Counter */}
            <div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {streakData.currentStreak} Hari Strik! 🔥
              </h3>
              <p className="text-xs text-amber-300/80 mt-1 font-medium">
                "Setiap hari bersatu dengan Firman & Doa"
              </p>
            </div>

            {/* Weekly History Dots */}
            <div className="bg-[#14171f] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Minggu Ini
                </span>
                <span className="text-amber-400 font-bold">{streakData.currentStreak} Hari Aktif</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_SHORT.map((day, idx) => {
                  const isActive = streakData.weeklyHistory[idx];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-md shadow-amber-500/30"
                            : "bg-white/5 text-gray-500 border border-white/10"
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-4 h-4 text-black" /> : idx + 1}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestone Stats */}
            <div className="flex items-center justify-around bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">Strik Terpanjang</p>
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> {streakData.longestStreak} Hari
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">Pencapaian</p>
                <p className="text-sm font-bold text-amber-300 mt-0.5">
                  {streakData.currentStreak >= 30 ? "👑 Setia 30 Hari" : streakData.currentStreak >= 7 ? "🌟 Pejuang 7 Hari" : "🌱 Pemula Doa"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Pertahankan Strik Hari Ini ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
}
