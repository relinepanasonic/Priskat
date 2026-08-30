"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Prayer, PrayerCategory } from "@/lib/types/database.types";
import { PRAYER_CATEGORIES } from "@/lib/types/database.types";
import { ChevronDown, ChevronUp, BookOpen, Search, X, Share2, MessageSquarePlus, Sparkles, Heart } from "lucide-react";

interface Props {
  prayers: Prayer[];
  lang: "id" | "en";
}

export default function PrayerList({ prayers, lang }: Props) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = prayers.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const title = lang === "id" && p.title_id ? p.title_id : p.title_en;
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function toggle(id: string) {
    setOpenId(openId === id ? null : id);
  }

  const handleShare = async (title: string, text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `🙏 ${title}\n\n${text}`,
        });
      } else {
        await navigator.clipboard.writeText(`🙏 ${title}\n\n${text}`);
        alert(lang === "id" ? "Disalin ke papan klip!" : "Copied to clipboard!");
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const handleShareToThought = (title: string, text: string) => {
    localStorage.setItem("draft_thought", `🙏 ${title}\n\n${text}`);
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Redesigned */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-brand-muted group-focus-within:text-brand-gold transition-colors" />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "id" ? "Cari doa favorit Anda..." : "Search your favorite prayers..."}
          className="w-full bg-[#111] border border-[#333] focus:border-brand-gold/50 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-brand-muted focus:outline-none focus:ring-4 focus:ring-brand-gold/10 transition-all shadow-inner"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white bg-[#222] p-1 rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            selectedCategory === "all"
              ? "bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              : "bg-[#111] border border-[#333] text-brand-muted hover:text-white hover:border-brand-gold/50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {lang === "id" ? "Semua Doa" : "All Prayers"}
        </button>
        {PRAYER_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedCategory === cat.value
                ? "bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold"
                : "bg-[#111] border border-[#333] text-brand-muted hover:text-white hover:border-[#555]"
            }`}
          >
            {lang === "id" ? cat.label_id : cat.label_en}
          </button>
        ))}
      </div>

      {/* Count Info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-brand-muted">
          <span className="text-white">{filtered.length}</span> {lang === "id" ? "Doa Ditemukan" : "Prayers Found"}
        </p>
      </div>

      {/* Prayer List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#111] border border-[#222] rounded-2xl">
            <Heart className="h-12 w-12 mx-auto mb-4 text-brand-muted/30" />
            <p className="text-lg font-medium text-white mb-1">{lang === "id" ? "Tidak ada doa" : "No prayers found"}</p>
            <p className="text-sm text-brand-muted">{lang === "id" ? "Coba kata kunci lain" : "Try another keyword"}</p>
          </div>
        )}

        {filtered.map((prayer) => {
          const title = lang === "id" && prayer.title_id ? prayer.title_id : prayer.title_en;
          const body = lang === "id" && prayer.body_id ? prayer.body_id : prayer.body_en;
          const catLabel = PRAYER_CATEGORIES.find((c) => c.value === prayer.category);
          const isOpen = openId === prayer.id;

          return (
            <div
              key={prayer.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 border ${
                isOpen 
                  ? "bg-[#15171c] border-brand-gold/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)]" 
                  : "bg-[#111] border-[#222] hover:border-[#333] shadow-md"
              }`}
            >
              {/* Decorative accent for open state */}
              {isOpen && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-gold rounded-l-2xl shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
              )}

              {/* Header */}
              <button
                onClick={() => toggle(prayer.id)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className={`font-semibold text-base sm:text-lg transition-colors duration-200 leading-snug ${isOpen ? "text-brand-gold" : "text-white"}`}>
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-[#222] text-brand-muted">
                      {lang === "id" ? catLabel?.label_id : catLabel?.label_en}
                    </span>
                  </div>
                </div>
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen ? "bg-brand-gold text-brand-dark rotate-180 shadow-md shadow-brand-gold/20" : "bg-[#222] text-brand-muted hover:bg-[#333] hover:text-white"
                }`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>

              {/* Collapsible Body */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-6 pt-2">
                  <div className="relative bg-[#111] rounded-xl p-4 sm:p-5 border border-[#222]">
                    <div className="absolute top-3 left-3 text-4xl text-brand-gold/10 font-serif leading-none">"</div>
                    <pre className="whitespace-pre-wrap text-[#d1d5db] text-sm sm:text-[15px] leading-relaxed font-serif relative z-10 pl-2">
                      {body}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleShareToThought(title, body)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2d35] text-brand-light hover:text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all border border-[#333] hover:border-brand-gold/50"
                    >
                      <MessageSquarePlus className="h-4.5 w-4.5" />
                      {lang === "id" ? "Bagikan ke My Thought" : "Share to My Thought"}
                    </button>
                    
                    <button
                      onClick={() => handleShare(title, body)}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-gold text-brand-dark hover:bg-brand-gold/80 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                      {lang === "id" ? "Bagikan (WA, IG, dll)" : "Share (WA, IG, etc)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
