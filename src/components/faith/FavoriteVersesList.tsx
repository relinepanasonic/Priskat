"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Trash2, ExternalLink } from "lucide-react";

interface FavoriteVerse {
  id: string;
  book_id: number;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_content: string;
  lang: string;
  created_at: string;
}

export default function FavoriteVersesList({
  initialFavorites,
  userId,
}: {
  initialFavorites: FavoriteVerse[];
  userId: string;
}) {
  const supabase = createClient();
  const [favorites, setFavorites] = useState<FavoriteVerse[]>(initialFavorites);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDelete = async (fav: FavoriteVerse) => {
    setDeleting(fav.id);
    await supabase.from("favorite_verses").delete().eq("id", fav.id).eq("user_id", userId);
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    setDeleting(null);
    showToast("Ayat dihapus");
  };

  // Group by book + chapter
  const grouped = favorites.reduce<Record<string, FavoriteVerse[]>>((acc, fav) => {
    const key = `${fav.book_name} ${fav.chapter}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fav);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-8">
      {Object.entries(grouped).map(([groupKey, verses]) => {
        const first = verses[0];
        return (
          <div key={groupKey}>
            {/* Group header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">{groupKey}</h2>
              <Link
                href={`/faith/bible/${first.book_id}/${first.chapter}`}
                className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-xs font-semibold transition-colors"
              >
                Buka <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Verse cards */}
            <div className="space-y-2">
              {verses.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white/5 border border-white/8 rounded-2xl px-5 py-4 flex items-start gap-4"
                >
                  {/* Bookmark icon */}
                  <Bookmark className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-[11px] font-sans font-bold uppercase tracking-wider mb-1">
                      {fav.book_name} {fav.chapter}:{fav.verse_number}
                    </p>
                    <p className="text-white/85 text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                      {fav.verse_content}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(fav)}
                    disabled={deleting === fav.id}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white text-sm px-5 py-3 rounded-full shadow-xl backdrop-blur-sm border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
}
