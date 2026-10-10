"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ArrowRight, Sparkles, Filter } from "lucide-react";
import { BIBLE_PLANS, BiblePlan } from "@/lib/data/biblePlans";

const PLAN_STORAGE_KEY = "ruang_iman_plan_progress";

export default function PlansListClient({ lang = "id" }: { lang?: "id" | "en" }) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [completedDaysMap, setCompletedDaysMap] = useState<Record<string, number[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      if (raw) {
        setCompletedDaysMap(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const categories = ["Semua", ...Array.from(new Set(BIBLE_PLANS.map((p) => p.category)))];

  const filteredPlans = activeCategory === "Semua"
    ? BIBLE_PLANS
    : BIBLE_PLANS.filter((p) => p.category === activeCategory);

  const getPlanProgress = (plan: BiblePlan) => {
    const doneDays = completedDaysMap[plan.id] || [];
    const percent = Math.round((doneDays.length / plan.durationDays) * 100);
    return { doneCount: doneDays.length, percent };
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1d24] via-[#242118] to-[#1c1d24] border border-amber-500/20 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>{lang === "id" ? "Perjalanan Pertumbuhan Rohani" : "Spiritual Journey"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {lang === "id" ? "Rencana Baca Alkitab" : "Bible Reading Plans"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
          {lang === "id"
            ? "Ikuti rencana baca harian berstruktur untuk memperdalam iman dan membangun kebiasaan membaca Firman setiap hari."
            : "Follow structured daily reading plans to deepen your faith and build a daily Scripture habit."}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => {
          const { doneCount, percent } = getPlanProgress(plan);
          const isStarted = doneCount > 0;
          const isComplete = doneCount === plan.durationDays;

          return (
            <div
              key={plan.id}
              className="group relative overflow-hidden rounded-3xl bg-[#14171f] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              {/* Cover Image & Category Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-black">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${plan.coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14171f] via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-sm">{plan.iconEmoji}</span>
                  <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {plan.category}
                  </span>
                </div>

                {isComplete && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>{plan.durationDays} Hari Perjalanan</span>
                    {isStarted && <span>{percent}% Selesai</span>}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {plan.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                {/* Progress Bar (if started) */}
                {isStarted && (
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}

                {/* Action Link Button */}
                <Link
                  href={`/faith/plans/${plan.id}`}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    isStarted
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <span>{isComplete ? "Baca Ulang" : isStarted ? "Lanjutkan Hari Ini" : "Mulai Rencana"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
