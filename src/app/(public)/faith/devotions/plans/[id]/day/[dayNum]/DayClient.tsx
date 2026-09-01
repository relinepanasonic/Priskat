"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MoreVertical, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";


export default function DayClient({ 
  plan, 
  dayNum, 
  progress,
  dayData,
  language
}: { 
  plan: any;
  dayNum: number;
  progress: any;
  dayData: any;
  language: "id" | "en";
}) {
  const router = useRouter();
  

  // If user completed up to yesterday, they are on track
  const isOnTrack = true; // Mock for now

  const isDayCompleted = progress?.completed_days?.includes(dayNum);

  const hasDevotional = !!(dayData?.devotional_title || dayData?.devotional_content || dayData?.devotional_content_id);
  const filteredVerses = dayData?.verses || [];

  // Create an array of days to render the horizontal day selector
  const daysArray = Array.from({ length: plan.duration_days }, (_, i) => i + 1);

  // Determine starting date (e.g. today if it's day 1)
  const startDate = progress ? new Date(progress.started_at) : new Date();

  return (
    <div className="w-full min-h-screen bg-brand-dark text-white font-sans pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-brand-dark sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg">{(language === "id" && plan.title_id ? plan.title_id : plan.title)}</h1>
        <button className="p-2">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Cover Image Banner */}
      <div className="px-4 mb-6">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#1a1d24]">
          {plan.cover_image_url ? (
            <Image src={plan.cover_image_url} alt={(language === "id" && plan.title_id ? plan.title_id : plan.title)} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-brand-muted">No Cover</div>
          )}
        </div>
      </div>

      {/* Horizontal Day Selector */}
      <div className="px-4 mb-8">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {daysArray.map((d) => {
            const isCompleted = progress?.completed_days?.includes(d);
            const isCurrent = d === dayNum;
            const date = addDays(startDate, d - 1);
            
            return (
              <Link 
                key={d}
                href={`/faith/devotions/plans/${plan.id}/day/${d}`}
                className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl border-2 transition-colors ${
                  isCurrent 
                    ? "border-brand-gold bg-[#1a1d24]" 
                    : isCompleted 
                      ? "border-transparent bg-[#14151a] opacity-50" 
                      : "border-transparent bg-[#14151a]"
                }`}
              >
                <span className={`text-xl font-bold ${isCurrent ? "text-white" : "text-brand-muted"}`}>{d}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full ${isCurrent ? "bg-brand-gold text-brand-dark" : "text-brand-muted"}`}>
                  {format(date, "MMM d")}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Day Status */}
      <div className="px-6 flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">Day {dayNum} of {plan.duration_days}</h2>
        {isOnTrack && (
          <span className="text-[10px] font-bold border border-[#333] rounded-full px-3 py-1 text-brand-light">
            ON TRACK!
          </span>
        )}
      </div>

                  {/* Checklist */}
      <div className="px-6 space-y-6">
        {/* Devotional Item — always show if title or content exists */}
        {(dayData?.devotional_title || dayData?.devotional_content || dayData?.devotional_content_id) && (
          <Link href={`/faith/devotions/plans/${plan.id}/read/${dayNum}?page=0`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
              <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">
                {dayData?.devotional_title || (language === "id" ? "Renungan" : "Devotional")}
              </span>
            </div>
            <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
          </Link>
        )}

        {/* Verses Items - filtered by language */}
        {filteredVerses.map((verse: any, idx: number) => {
          const pageIndex = hasDevotional ? idx + 1 : idx;
          return (
            <Link key={idx} href={`/faith/devotions/plans/${plan.id}/read/${dayNum}?page=${pageIndex}&lang=${language}`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
                <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{verse.verse_reference}</span>
              </div>
              <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
            </Link>
          );
        })}

        {/* Reflection Item */}
        {!!(dayData?.reflection || dayData?.reflection_id) && (
          <Link href={`/faith/devotions/plans/${plan.id}/read/${dayNum}?page=${filteredVerses.length + (hasDevotional ? 1 : 0)}&lang=${language}`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
              <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{language === "id" ? "Refleksi" : "Reflection"}</span>
            </div>
            <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
          </Link>
        )}

        {/* Prayer Item */}
        {!!(dayData?.prayer || dayData?.prayer_id) && (
          <Link href={`/faith/devotions/plans/${plan.id}/read/${dayNum}?page=${filteredVerses.length + (hasDevotional ? 1 : 0) + (!!(dayData?.reflection || dayData?.reflection_id) ? 1 : 0)}&lang=${language}`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
              <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{language === "id" ? "Doa" : "Prayer"}</span>
            </div>
            <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
          </Link>
        )}
      </div>

      {/* Begin Action */}
      <div className="fixed bottom-24 left-0 right-0 px-8 max-w-md mx-auto z-10">
        <Link
          href={`/faith/devotions/plans/${plan.id}/read/${dayNum}?page=0&lang=${language}`}
          className="w-full mx-auto flex justify-center py-4 bg-brand-gold text-brand-dark rounded-full font-bold text-lg hover:bg-brand-gold/80 transition-colors shadow-lg"
        >
          {isDayCompleted ? (language === "id" ? "Baca Lagi" : "Read Again") : (language === "id" ? "Mulai" : "Begin")}
        </Link>
      </div>

    </div>
  );
}





