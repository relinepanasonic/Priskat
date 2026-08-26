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
  dayData
}: { 
  plan: any;
  dayNum: number;
  progress: any;
  dayData: any;
}) {
  const router = useRouter();

  // If user completed up to yesterday, they are on track
  const isOnTrack = true; // Mock for now

  const isDayCompleted = progress?.completed_days?.includes(dayNum);
  
  // Create an array of days to render the horizontal day selector
  const daysArray = Array.from({ length: plan.duration_days }, (_, i) => i + 1);

  // Determine starting date (e.g. today if it's day 1)
  const startDate = progress ? new Date(progress.started_at) : new Date();

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg">{plan.title}</h1>
        <button className="p-2">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Cover Image Banner */}
      <div className="px-4 mb-6">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-200">
          {plan.cover_image_url ? (
            <Image src={plan.cover_image_url} alt={plan.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">No Cover</div>
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
                    ? "border-black bg-white" 
                    : isCompleted 
                      ? "border-transparent bg-gray-100 opacity-50" 
                      : "border-transparent bg-gray-100"
                }`}
              >
                <span className={`text-xl font-bold ${isCurrent ? "text-black" : "text-gray-500"}`}>{d}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full ${isCurrent ? "bg-black text-white" : "text-gray-500"}`}>
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
          <span className="text-[10px] font-bold border border-gray-300 rounded-full px-3 py-1 text-gray-600">
            ON TRACK!
          </span>
        )}
      </div>

      {/* Checklist */}
      <div className="px-6 space-y-6">
        {/* Devotional Item */}
        <div className="flex items-center justify-between cursor-not-allowed">
          <div className="flex items-center gap-4">
            {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-gray-300" /> : <Circle className="h-6 w-6 text-gray-300" />}
            <span className="text-[17px] font-medium">Devotional</span>
          </div>
          <span className="text-xl text-gray-400">›</span>
        </div>

        {/* Verses Items */}
        {dayData?.verses?.map((verse: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between cursor-not-allowed">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-gray-300" /> : <Circle className="h-6 w-6 text-gray-300" />}
              <span className="text-[17px] font-medium">{verse.verse_reference} {verse.translation}</span>
            </div>
            <span className="text-xl text-gray-400">›</span>
          </div>
        ))}
      </div>

      {/* Floating Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <Link 
          href={`/faith/devotions/plans/${plan.id}/read/${dayNum}`}
          className="w-full max-w-md mx-auto flex justify-center py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
        >
          {isDayCompleted ? "Read Again" : "Start Reading"}
        </Link>
      </div>

    </div>
  );
}
