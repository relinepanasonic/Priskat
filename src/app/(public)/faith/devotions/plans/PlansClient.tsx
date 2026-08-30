"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, BookOpen, CheckCircle } from "lucide-react";
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
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
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

  // Render a bookshelf row of books
  const renderBookShelf = (title: string, shelfPlans: DevotionPlan[], isCompletedShelf = false, showProgressDay?: boolean) => {
    if (shelfPlans.length === 0) return null;
    
    return (
      <div className="relative mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
            {isCompletedShelf ? <CheckCircle className="h-5 w-5 text-brand-gold" /> : <BookOpen className="h-5 w-5 text-brand-gold" />}
            {title}
          </h2>
        </div>
        
        {/* BookShelf Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 pt-4 px-2 snap-x z-10 relative">
            {shelfPlans.map(plan => {
              const displayTitle = language === "id" && plan.title_id ? plan.title_id : plan.title;
              const prog = userProgress.find(p => p.plan_id === plan.id);
              
              return (
                <div 
                  key={plan.id} 
                  onClick={() => isCompletedShelf ? null : handleStartPlan(plan.id)}
                  className={`group relative cursor-pointer snap-center shrink-0 w-[110px] sm:w-[140px] aspect-[3/4] transition-transform duration-300 ${isCompletedShelf ? "opacity-70 hover:opacity-100" : "hover:-translate-y-4"}`}
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
                        <span className="text-white text-xs font-bold line-clamp-4 mt-2">{displayTitle}</span>
                      </div>
                    )}
                    
                    {isCompletedShelf && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">Completed</span>
                      </div>
                    )}

                    {/* Spine hinge overlay */}
                    <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10"></div>
                    {/* Page edges right side */}
                    <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10"></div>
                    
                    {/* Obi Band for Indonesian Translation */}
                    {language === "id" && plan.title_id && (
                      <div className="absolute bottom-4 left-0 right-0 bg-black/80 backdrop-blur-md border-y border-[#8b6b22]/50 py-1.5 px-2 z-10 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.6)] pointer-events-none">
                        <span className="text-[10px] sm:text-xs font-serif font-bold text-[#e8decd] tracking-wide truncate w-full text-center drop-shadow-md">
                          {displayTitle}
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
          <div className="absolute bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] shadow-[0_5px_15px_rgba(0,0,0,0.6)] rounded-sm border-t border-[#555] z-20 pointer-events-none"></div>
        </div>
      </div>
    );
  };

  const readingPlans = userProgress.filter(p => !p.is_finished).map(p => plans.find(plan => plan.id === p.plan_id)).filter(Boolean) as DevotionPlan[];
  const finishedPlans = userProgress.filter(p => p.is_finished).map(p => plans.find(plan => plan.id === p.plan_id)).filter(Boolean) as DevotionPlan[];

  return (
    <div className="w-full min-h-[100dvh] bg-brand-dark text-white font-sans pb-32">
      
      {/* Header & Search */}
      <div className="px-6 pt-8 pb-4">
        {selectedCatId ? (
          <button 
            onClick={() => setSelectedCatId(null)}
            className="flex items-center gap-2 text-brand-muted hover:text-brand-gold transition-colors mb-6 font-medium text-sm"
          >
            <ChevronLeft className="h-5 w-5" />
            {language === "id" ? "Kembali ke Perpustakaan" : "Back to Library"}
          </button>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            {language === "id" ? "Perpustakaan Renungan" : "Devotion Library"}
          </h1>
        )}
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder={language === "id" ? "Cari renungan..." : "Search devotions..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1d24] border border-[#333] rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      <div className="px-6 space-y-8">
        
        {!selectedCatId ? (
          // --- MAIN LIBRARY VIEW ---
          <>
            {/* Currently Reading */}
            {readingPlans.length > 0 && renderBookShelf(language === "id" ? "Sedang Dibaca" : "Currently Reading", readingPlans, false, true)}
            
            {/* Categories Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-white/90 mb-6">{language === "id" ? "Jelajahi Kategori" : "Browse Categories"}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {topCategories.map(cat => {
                  const catName = language === "id" && cat.name_id ? cat.name_id : cat.name;
                  return (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#333] hover:border-brand-gold/50 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {cat.image_url ? (
                        <Image src={cat.image_url} alt={catName} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2d35] to-[#1a1d24]" />
                      )}
                      
                      {/* Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end items-start text-left">
                        <h3 className="text-lg font-bold text-white shadow-sm">{catName}</h3>
                        <p className="text-xs text-brand-gold font-medium mt-1 flex items-center gap-1 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          {language === "id" ? "Lihat koleksi" : "View collection"} <ChevronRight className="h-3 w-3" />
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finished Shelves */}
            {finishedPlans.length > 0 && renderBookShelf(language === "id" ? "Selesai" : "Finished", finishedPlans, true, false)}
          </>
        ) : (
          // --- SPECIFIC CATEGORY VIEW ---
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {(() => {
              const currentCat = categories.find(c => c.id === selectedCatId);
              const catName = language === "id" && currentCat?.name_id ? currentCat.name_id : currentCat?.name;
              
              return (
                <div className="mb-8 relative rounded-3xl overflow-hidden shadow-xl aspect-[21/9] flex items-center justify-center border border-[#333]">
                  {currentCat?.image_url ? (
                    <>
                      <Image src={currentCat.image_url} alt={catName || ""} fill className="object-cover opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-dark"></div>
                  )}
                  <h1 className="relative z-10 text-3xl sm:text-5xl font-extrabold text-white tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {catName}
                  </h1>
                </div>
              );
            })()}

            <div className="space-y-4">
              {categories.filter(c => c.parent_id === selectedCatId).map(subCat => {
                const subCatName = language === "id" && subCat.name_id ? subCat.name_id : subCat.name;
                const catPlans = filteredPlans.filter(p => p.category_id === subCat.id);
                return catPlans.length > 0 ? renderBookShelf(subCatName, catPlans) : null;
              })}
              
              {/* If a top category doesn't have subcategories, maybe it has direct plans */}
              {renderBookShelf(language === "id" ? "Lainnya" : "Others", filteredPlans.filter(p => p.category_id === selectedCatId))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
