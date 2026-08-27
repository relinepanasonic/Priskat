"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { DevotionCategory, DevotionPlan } from "@/lib/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PlansClient({ 
  categories, 
  plans, 
  userProgress,
  userId,
  language
}: { 
  categories: DevotionCategory[], 
  plans: DevotionPlan[],
  userProgress: any[],
  userId?: string,
  language: "id" | "en"
}) {
  const [activeTab, setActiveTab] = useState<"My Plans" | "Find Plans" | "Completed">("Find Plans");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleStartPlan = async (planId: string) => {
    if (!userId) {
      alert("Please login first");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("user_devotion_progress").insert({
      user_id: userId,
      plan_id: planId,
      current_day: 1,
      completed_days: [],
      is_finished: false
    });
    
    if (error) {
      if (error.code === '23505') {
        router.push(`/faith/devotions/plans/${planId}/day/1`);
      } else {
        console.error(error);
        alert("Error starting plan");
      }
    } else {
      router.push(`/faith/devotions/plans/${planId}/day/1`);
    }
  };

  const filteredPlans = plans.filter(p => {
    const title = language === "id" && p.title_id ? p.title_id : p.title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full min-h-[100dvh] bg-brand-dark text-white font-sans pb-32">
      
      {/* Header & Search */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Library</h1>
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search devotions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1d24] border border-[#333] rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 overflow-x-auto hide-scrollbar mb-8">
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab("Find Plans")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === "Find Plans" ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted hover:text-white"}`}
          >
            Shelves
          </button>
          <button 
            onClick={() => setActiveTab("My Plans")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === "My Plans" ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted hover:text-white"}`}
          >
            Currently Reading
          </button>
          <button 
            onClick={() => setActiveTab("Completed")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === "Completed" ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted hover:text-white"}`}
          >
            Finished
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-12">
        
        {activeTab === "Find Plans" && (
          categories.map((cat) => {
            const catPlans = filteredPlans.filter(p => p.category_id === cat.id);
            if (catPlans.length === 0) return null;
            return (
              <div key={cat.id} className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white/90">{(language === "id" && cat.name_id ? cat.name_id : cat.name)}</h2>
                  <button className="text-xs font-bold text-brand-gold flex items-center gap-1 hover:text-white transition-colors">
                    Full shelf <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                
                {/* BookShelf Container */}
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 pt-2 px-2 snap-x z-10 relative">
                    {catPlans.map(plan => {
                      const title = language === "id" && plan.title_id ? plan.title_id : plan.title;
                      return (
                        <div 
                          key={plan.id} 
                          onClick={() => handleStartPlan(plan.id)}
                          className="group relative cursor-pointer snap-center shrink-0 w-[110px] sm:w-[140px] aspect-[3/4] transition-transform duration-300 hover:-translate-y-4"
                        >
                          {/* 3D Book Volume */}
                          <div className="absolute inset-0 rounded-r-md rounded-l-[3px] overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.5),5px_5px_15px_rgba(0,0,0,0.6)] group-hover:shadow-[-4px_0_10px_rgba(0,0,0,0.5),10px_15px_25px_rgba(0,0,0,0.8)] transition-shadow duration-300 bg-[#2a2d35]">
                            {plan.cover_image_url ? (
                              <Image src={plan.cover_image_url} alt={title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col p-3">
                                <span className="text-white text-xs font-bold line-clamp-4 mt-2">{title}</span>
                              </div>
                            )}
                            
                            {/* Spine hinge overlay */}
                            <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10"></div>
                            {/* Page edges right side (tiny sliver) */}
                            <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10"></div>
                            
                            {/* Elegant Obi Band for Indonesian Translation */}
                            {language === "id" && plan.title_id && (
                              <div className="absolute bottom-4 left-0 right-0 bg-black/80 backdrop-blur-md border-y border-[#8b6b22]/50 py-1.5 px-2 z-10 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.6)] pointer-events-none">
                                <span className="text-[10px] sm:text-xs font-serif font-bold text-[#e8decd] tracking-wide truncate w-full text-center drop-shadow-md">
                                  {title}
                                </span>
                              </div>
                            )}

                            {/* Glossy overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* The Physical Shelf Line */}
                  <div className="absolute bottom-5 left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] shadow-[0_5px_15px_rgba(0,0,0,0.6)] rounded-sm border-t border-[#444] z-0"></div>
                </div>
              </div>
            );
          })
        )}

        {activeTab === "My Plans" && (
          <div className="relative">
            {userProgress.filter(p => !p.is_finished).length === 0 ? (
              <p className="text-brand-muted text-sm py-8">No active devotions.</p>
            ) : (
              <div className="relative">
                  <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 pt-2 px-2 snap-x z-10 relative">
                  {userProgress.filter(p => !p.is_finished).map(prog => {
                    const title = language === "id" && prog.plans?.title_id ? prog.plans.title_id : prog.plans?.title;
                    return (
                      <Link 
                        key={prog.id}
                        href={`/faith/devotions/plans/${prog.plan_id}/day/${prog.current_day}`}
                        className="group relative cursor-pointer snap-center shrink-0 w-[110px] sm:w-[140px] aspect-[3/4] transition-transform duration-300 hover:-translate-y-4"
                      >
                        <div className="absolute -top-3 -right-2 bg-brand-gold text-brand-dark text-[9px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md">
                          Day {prog.current_day}
                        </div>
                        <div className="absolute inset-0 rounded-r-md rounded-l-[3px] overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.5),5px_5px_15px_rgba(0,0,0,0.6)] group-hover:shadow-[-4px_0_10px_rgba(0,0,0,0.5),10px_15px_25px_rgba(0,0,0,0.8)] transition-shadow duration-300 bg-[#2a2d35]">
                          {prog.plans?.cover_image_url ? (
                            <Image src={prog.plans.cover_image_url} alt={title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col p-3">
                              <span className="text-white text-xs font-bold line-clamp-4 mt-2">{title}</span>
                            </div>
                          )}
                          <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10"></div>
                          <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10"></div>
                          
                          {language === "id" && prog.plans?.title_id && (
                            <div className="absolute bottom-4 left-0 right-0 bg-black/80 backdrop-blur-md border-y border-[#8b6b22]/50 py-1.5 px-2 z-10 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.6)] pointer-events-none">
                              <span className="text-[10px] sm:text-xs font-serif font-bold text-[#e8decd] tracking-wide truncate w-full text-center drop-shadow-md">
                                {title}
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                        </div>
                      </Link>
                    )
                  })}
                  </div>
                  <div className="absolute bottom-5 left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] shadow-[0_5px_15px_rgba(0,0,0,0.6)] rounded-sm border-t border-[#444] z-0"></div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
