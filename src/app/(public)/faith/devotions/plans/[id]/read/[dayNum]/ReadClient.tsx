"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReadClient({ 
  plan, 
  dayNum, 
  dayData,
  userId
}: { 
  plan: any;
  dayNum: number;
  dayData: any;
  userId: string;
}) {
  const router = useRouter();
  
  // Array of pages: 1st is Devotional, rest are Verses
  const pages = [
    { type: "devotional", title: "Devotional", content: dayData.devotional_content },
    ...(dayData.verses || []).map((v: any) => ({
      type: "verse",
      title: `${v.verse_reference} ${v.translation}`,
      content: `[Bible text for ${v.verse_reference} will be rendered here]` // Mock
    }))
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFinish = async () => {
    const supabase = createClient();
    
    // Fetch current progress
    const { data: progress } = await supabase
      .from("user_devotion_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", plan.id)
      .single();
      
    if (progress) {
      let completed = progress.completed_days || [];
      if (!completed.includes(dayNum)) {
        completed.push(dayNum);
      }
      
      const isFinished = completed.length >= plan.duration_days;
      
      await supabase
        .from("user_devotion_progress")
        .update({
          completed_days: completed,
          last_completed_at: new Date().toISOString(),
          is_finished: isFinished
        } as any)
        .eq("id", progress.id);
    }
    
    router.push(`/faith/devotions/plans/${plan.id}/day/${dayNum}`);
    router.refresh();
  };

  const current = pages[currentPage];

  return (
    <div className="w-full min-h-screen bg-brand-dark text-white font-serif flex flex-col relative">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-brand-dark sticky top-0 z-10 border-b border-[#333]">
        <button onClick={() => router.back()} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="h-8 w-8 relative rounded-md overflow-hidden bg-[#1a1d24]">
            {plan.cover_image_url && <Image src={plan.cover_image_url} alt="Cover" fill className="object-cover" />}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2">
            <Play className="h-5 w-5" />
          </button>
          <button className="p-2 flex items-center justify-center bg-[#2a2d35] rounded-full h-8 w-8 text-xs font-bold font-sans">
            AA
          </button>
          <button className="p-2">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 text-[19px] leading-[1.8] text-brand-light">
        {current.type === "devotional" ? (
          <div>
            <h1 className="text-3xl font-bold font-sans mb-6">{dayData.devotional_title || "Devotional"}</h1>
            <div className="whitespace-pre-wrap">{current.content}</div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold font-sans text-brand-gold mb-4 uppercase tracking-wider">{current.title}</h2>
            <div className="whitespace-pre-wrap">{current.content}</div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-[#333] p-4 pb-8 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`h-12 w-12 flex items-center justify-center rounded-full bg-[#2a2d35] ${currentPage === 0 ? "opacity-50" : "hover:bg-[#1a1d24]"}`}
        >
          <Play className="h-5 w-5 rotate-180" />
        </button>
        
        <div className="flex-1 mx-4">
          {currentPage === pages.length - 1 ? (
            <button 
              onClick={handleFinish}
              className="w-full h-12 bg-brand-gold text-brand-dark font-bold font-sans rounded-full hover:bg-brand-gold/80 transition-colors"
            >
              Finish Day {dayNum}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="w-full h-12 bg-[#2a2d35] text-white font-bold font-sans rounded-full flex justify-center items-center gap-2 hover:bg-[#1a1d24]"
            >
              {pages[currentPage + 1].title} <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <button 
          onClick={handleNext}
          disabled={currentPage === pages.length - 1}
          className={`h-12 w-12 flex items-center justify-center rounded-full bg-[#2a2d35] ${currentPage === pages.length - 1 ? "opacity-50" : "hover:bg-[#1a1d24]"}`}
        >
          <Play className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
}

