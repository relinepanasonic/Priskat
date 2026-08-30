"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, BookOpen, CheckCircle } from "lucide-react";
import { DevotionCategory, DevotionPlan } from "@/lib/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [selectedCatId, setSelectedCatId] = useState<string | "all">("all");
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

  const topCategories = categories.filter(c => !c.parent_id);

  // Render a scrollable bookshelf row with peek effect
  const renderBookShelf = (title: string, shelfPlans: DevotionPlan[], isCompletedShelf = false, showProgressDay?: boolean) => {
    if (shelfPlans.length === 0) return null;
    
    return (
      <div className="relative mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
            {isCompletedShelf ? <CheckCircle className="h-5 w-5 text-brand-gold" /> : <BookOpen className="h-5 w-5 text-brand-gold" />}
            {title}
          </h2>
        </div>
        
        {/* BookShelf with peek effect - show partial 3rd book */}
        <div className="relative">
          {/* Fade-out right edge to hint scrollability */}
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-brand-dark to-transparent z-30 pointer-events-none" />

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 pt-4 snap-x snap-mandatory relative z-10"
            style={{ paddingRight: "2rem" }}>
            {shelfPlans.map(plan => {
              const displayTitle = language === "id" && plan.title_id ? plan.title_id : plan.title;
              const prog = userProgress.find(p => p.plan_id === plan.id);
              
              return (
                <div 
                  key={plan.id} 
                  onClick={() => !isCompletedShelf && handleStartPlan(plan.id)}
                  className={`group relative cursor-pointer snap-start shrink-0 w-[120px] aspect-[3/4] transition-transform duration-300 ${isCompletedShelf ? "opacity-70 hover:opacity-100" : "hover:-translate-y-3"}`}
                >
                  {/* Progress Badge */}
                  {showProgressDay && prog && !prog.is_finished && (
                    <div className="absolute -top-3 -right-2 bg-brand-gold text-brand-dark text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-md">
                      Day {prog.current_day}
                    </div>
                  )}

                  {/* 3D Book Volume */}
                  <div className="absolute inset-0 rounded-r-md rounded-l-[3px] overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.5),5px_5px_15px_rgba(0,0,0,0.6)] group-hover:shadow-[-4px_0_10px_rgba(0,0,0,0.5),10px_15px_25px_rgba(0,0,0,0.8)] transition-shadow duration-300 bg-[#2a2d35]">
                    {plan.cover_image_url ? (
                      <Image src={plan.cover_image_url} alt={displayTitle} fill className={`object-cover ${isCompletedShelf ? 'grayscale' : ''}`} />
                    ) : (
                      <div className="w-full h-full flex flex-col p-3">
                        <span className="text-white text-xs font-bold mt-2 leading-snug">{displayTitle}</span>
                      </div>
                    )}

                    {isCompletedShelf && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <span className="text-white text-[10px] font-bold px-2 py-1 bg-black/60 rounded">{language === "id" ? "Selesai" : "Done"}</span>
                      </div>
                    )}

                    {/* Spine hinge */}
                    <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />
                    {/* Page edge */}
                    <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10" />

                    {/* Obi Band - full title, no truncation */}
                    {language === "id" && plan.title_id && (
                      <div className="absolute bottom-4 left-0 right-0 bg-black/80 backdrop-blur-md border-y border-[#8b6b22]/50 py-2 px-1.5 z-10 pointer-events-none">
                        <span className="text-[9px] font-serif font-bold text-[#e8decd] tracking-wide w-full text-center leading-tight block">
                          {displayTitle}
                        </span>
                      </div>
                    )}

                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Physical Shelf Line */}
          <div className="absolute bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] shadow-[0_5px_15px_rgba(0,0,0,0.6)] rounded-sm border-t border-[#555] z-20 pointer-events-none" />
        </div>
      </div>
    );
  };

  const readingPlans = userProgress.filter(p => !p.is_finished).map(p => plans.find(plan => plan.id === p.plan_id)).filter(Boolean) as DevotionPlan[];
  const finishedPlans = userProgress.filter(p => p.is_finished).map(p => plans.find(plan => plan.id === p.plan_id)).filter(Boolean) as DevotionPlan[];

  return (
    <div className="w-full min-h-[100dvh] bg-brand-dark text-white font-sans pb-32">
      
      {/* Header & Search */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight mb-5">
          {language === "id" ? "Perpustakaan Renungan" : "Devotion Library"}
        </h1>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder={language === "id" ? "Cari renungan..." : "Search devotions..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1d24] border border-[#333] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Currently Reading & Finished */}
        {readingPlans.length > 0 && renderBookShelf(language === "id" ? "Sedang Dibaca" : "Currently Reading", readingPlans, false, true)}
        {finishedPlans.length > 0 && renderBookShelf(language === "id" ? "Selesai" : "Finished", finishedPlans, true, false)}

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white/90 mb-3">
            {language === "id" ? "Jelajahi Kategori" : "Browse Categories"}
          </h2>

          {/* Mobile: 2 columns, shorter pills, title right-aligned */}
          {/* Desktop: 1 row horizontal, 1:4 aspect ratio */}
          <div className="
            grid grid-cols-2 gap-2.5
            sm:flex sm:flex-row sm:gap-3 sm:overflow-x-auto sm:pb-1 sm:scrollbar-hide
          ">
            {topCategories.map(cat => {
              const catName = language === "id" && cat.name_id ? cat.name_id : cat.name;
              const isSelected = selectedCatId === cat.id;
              const imageUrl = cat.image_url || `/images/categories/${cat.name.toLowerCase()}.jpg`;
              
              return (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCatId(isSelected ? "all" : cat.id)}
                  className={`
                    relative flex items-center overflow-hidden rounded-full transition-all duration-300 border-2
                    h-8 w-full justify-end pr-3
                    sm:h-10 sm:flex-shrink-0 sm:w-auto sm:aspect-[4/1] sm:justify-end sm:pr-4
                    ${isSelected 
                      ? "border-brand-gold shadow-[0_0_18px_rgba(212,175,55,0.5)]" 
                      : "border-transparent grayscale hover:grayscale-0"
                    }
                  `}
                >
                  <Image
                    src={imageUrl}
                    alt={catName}
                    fill
                    className="object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className={`absolute inset-0 transition-all duration-300 ${isSelected ? "bg-black/20" : "bg-black/55"}`} />
                  <span className={`relative z-10 text-xs sm:text-sm font-bold tracking-wide ${isSelected ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" : "text-gray-300"}`}>
                    {catName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Book Shelves */}
        <div className="space-y-2">
          {selectedCatId === "all" ? (
            categories.filter(c => c.parent_id).map(subCat => {
              const subCatName = language === "id" && subCat.name_id ? subCat.name_id : subCat.name;
              const catPlans = filteredPlans.filter(p => p.category_id === subCat.id);
              return catPlans.length > 0 ? renderBookShelf(subCatName, catPlans) : null;
            })
          ) : (
            <>
              {categories.filter(c => c.parent_id === selectedCatId).map(subCat => {
                const subCatName = language === "id" && subCat.name_id ? subCat.name_id : subCat.name;
                const catPlans = filteredPlans.filter(p => p.category_id === subCat.id);
                return catPlans.length > 0 ? renderBookShelf(subCatName, catPlans) : null;
              })}
              {renderBookShelf(
                language === "id" ? "Lainnya" : "Others", 
                filteredPlans.filter(p => p.category_id === selectedCatId)
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
