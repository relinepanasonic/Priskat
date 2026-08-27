"use client";

import { useState } from "react";
import type { Prayer, PrayerCategory } from "@/lib/types/database.types";
import { PRAYER_CATEGORIES } from "@/lib/types/database.types";
import { ChevronDown, ChevronUp, BookOpen, Search, X } from "lucide-react";

interface Props {
  prayers: Prayer[];
  lang: "id" | "en";
}

export default function PrayerList({ prayers, lang }: Props) {
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "id" ? "Cari doa..." : "Search prayers..."}
          className="w-full input-3d pl-10 pr-10 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter â€” horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            selectedCategory === "all"
              ? "bg-brand-gold text-brand-dark border-brand-gold shadow-glow-gold"
              : "bg-brand-bg border-brand-border text-brand-muted hover:text-white"
          }`}
        >
          {lang === "id" ? "Semua" : "All"}
        </button>
        {PRAYER_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              selectedCategory === cat.value
                ? "bg-brand-gold text-brand-dark border-brand-gold shadow-glow-gold"
                : "bg-brand-bg border-brand-border text-brand-muted hover:text-white"
            }`}
          >
            {lang === "id" ? cat.label_id : cat.label_en}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-brand-muted px-1">
        {filtered.length} {lang === "id" ? "doa ditemukan" : "prayers found"}
      </p>

      {/* Prayer List â€” Accordion */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-brand-muted">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{lang === "id" ? "Tidak ada doa ditemukan." : "No prayers found."}</p>
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
              className={`card-3d transition-all duration-300 ${isOpen ? "shadow-glow-blue" : ""}`}
            >
              {/* Header â€” Click to expand */}
              <button
                onClick={() => toggle(prayer.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-snug">{title}</p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {lang === "id" ? catLabel?.label_id : catLabel?.label_en}
                  </p>
                </div>
                <div className={`ml-3 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isOpen ? "bg-brand-gold text-brand-dark" : "bg-brand-bg text-brand-muted"
                }`}>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Body */}
              {isOpen && (
                <div className="px-4 pb-6 pt-2 border-t border-brand-border/50">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-brand-light text-sm leading-relaxed font-sans">
                      {body}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


