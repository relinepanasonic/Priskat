"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, BookOpen, Sparkles, Trophy, Calendar, Share2, Flame } from "lucide-react";
import { BIBLE_PLANS, BiblePlan, PlanDay } from "@/lib/data/biblePlans";
import { recordStreakCheckIn } from "@/lib/streak";

const PLAN_STORAGE_KEY = "ruang_iman_plan_progress";

export default function PlanDetailClient({ planId, lang = "id" }: { planId: string; lang?: "id" | "en" }) {
  const plan = BIBLE_PLANS.find((p) => p.id === planId) || BIBLE_PLANS[0];
  
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      if (raw) {
        const map = JSON.parse(raw);
        const done: number[] = map[plan.id] || [];
        setCompletedDays(done);

        // Auto select first uncompleted day, or day 1
        const firstUndone = plan.days.find((d) => !done.includes(d.dayNumber));
        if (firstUndone) {
          setSelectedDayNum(firstUndone.dayNumber);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [plan]);

  const activeDay: PlanDay = plan.days.find((d) => d.dayNumber === selectedDayNum) || plan.days[0];
  const isDayCompleted = completedDays.includes(selectedDayNum);
  const percent = Math.round((completedDays.length / plan.durationDays) * 100);

  const toggleMarkCompleted = () => {
    let updated: number[];
    if (isDayCompleted) {
      updated = completedDays.filter((d) => d !== selectedDayNum);
    } else {
      updated = [...completedDays, selectedDayNum];
      recordStreakCheckIn(); // Boost daily streak!
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    setCompletedDays(updated);

    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[plan.id] = updated;
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-black" />
          <span>Hari Ini Selesai & Strik Bertambah! 🔥</span>
        </div>
      )}

      {/* Top Navigation */}
      <Link
        href="/faith/plans"
        className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "id" ? "Kembali ke Rencana Baca" : "Back to Plans"}</span>
      </Link>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1f28] via-[#141720] to-[#1c1f28] border border-amber-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{plan.iconEmoji}</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                {plan.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{plan.title}</h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">{plan.description}</p>
          </div>

          {/* Overall Progress Ring Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto">
            <p className="text-xs text-gray-400 font-medium">Progres Rencana</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{percent}%</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{completedDays.length} / {plan.durationDays} Hari</p>
          </div>
        </div>

        {/* Days Timeline Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none border-t border-white/10 pt-4">
          {plan.days.map((day) => {
            const isDone = completedDays.includes(day.dayNumber);
            const isSelected = selectedDayNum === day.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNum(day.dayNumber)}
                className={`flex flex-col items-center justify-center min-w-[56px] h-16 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30 scale-105 font-bold"
                    : isDone
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase">Hari</span>
                <span className="text-sm font-extrabold flex items-center gap-0.5">
                  {day.dayNumber} {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Content Card */}
      <div className="bg-[#14171f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Hari Ke-{activeDay.dayNumber}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{activeDay.title}</h2>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {activeDay.passageRef}
          </span>
        </div>

        {/* Bible Passage Quote Box */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-l-4 border-amber-400 p-5 rounded-r-2xl space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Ayat Bacaan
          </p>
          <blockquote className="text-base sm:text-lg text-white font-serif italic leading-relaxed" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            "{activeDay.passage}"
          </blockquote>
          <p className="text-xs font-bold text-amber-300 text-right">— {activeDay.passageRef}</p>
        </div>

        {/* Devotional Thought */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Renungan Harian
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed bg-white/5 border border-white/10 p-5 rounded-2xl">
            {activeDay.devotionalText}
          </p>
        </div>

        {/* Action Button: Mark Completed */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            onClick={toggleMarkCompleted}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              isDayCompleted
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 active:scale-95"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isDayCompleted ? "Selesai (Klik untuk Batal)" : "Tandai Selesai Hari Ini ✨"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
