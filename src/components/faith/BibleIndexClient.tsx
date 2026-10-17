"use client";

import { useState, useMemo } from "react";
import { Search, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookListClient from "./BookListClient";
import { parseBibleRef } from "@/lib/bibleRef";

interface Book {
  no: number;
  abbr: string;
  name: string;
  name_en: string;
  chapter: number;
}

interface BibleIndexClientProps {
  isId: boolean;
  oldTestament: Book[];
  newTestament: Book[];
  deuterocanonica: Book[];
}

import VerseOfDayCard from "./VerseOfDayCard";

export default function BibleIndexClient({
  isId,
  oldTestament,
  newTestament,
  deuterocanonica
}: BibleIndexClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [version, setVersion] = useState(isId ? "TB" : "NRSV-CE");
  const q = searchQuery.trim();
  // Enter = search the words in the whole Bible (typing alone still filters book names)
  const allBooks = useMemo(() => [...oldTestament, ...newTestament, ...deuterocanonica], [oldTestament, newTestament, deuterocanonica]);
  // "Yeremia 31:3" / "Yer 31:3-5" / "Yeremia pasal 31 ayat 3" jumps straight to that verse
  const ref = useMemo(() => parseBibleRef(q, allBooks), [q, allBooks]);
  const refHref = ref ? `/faith/bible/${ref.book.no}/${ref.chapter}?${new URLSearchParams({ version, ...(ref.verse ? { ayat: String(ref.verse) } : {}) })}` : null;
  const refLabel = ref ? `${isId ? ref.book.name : ref.book.name_en} ${ref.chapter}${ref.verse ? `:${ref.verse}${ref.to ? `-${ref.to}` : ""}` : ""}` : "";
  const searchBible = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (refHref) { router.push(refHref); return; }
    if (q.length < 2) return;
    router.push(`/faith/bible/search?${new URLSearchParams({ q, v: version })}`);
  };

  const filteredNT = useMemo(() => 
    newTestament.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.name_en.toLowerCase().includes(searchQuery.toLowerCase())),
  [newTestament, searchQuery]);
  
  const filteredOT = useMemo(() => 
    oldTestament.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.name_en.toLowerCase().includes(searchQuery.toLowerCase())),
  [oldTestament, searchQuery]);

  const filteredDC = useMemo(() => 
    deuterocanonica.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.name_en.toLowerCase().includes(searchQuery.toLowerCase())),
  [deuterocanonica, searchQuery]);

  return (
    <div className="w-full">
      {/* Search Bar & Version Dropdown & Fav Verses */}
      <div className="flex items-center gap-2 sm:gap-3 mb-8 max-w-2xl">
        <form onSubmit={searchBible} className="relative flex-1 min-w-0" role="search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-[#333] rounded-xl leading-5 bg-[#1a1d24] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs sm:text-sm transition-colors shadow-inner-dark"
            placeholder={isId ? "Cari kitab atau kata di Alkitab…" : "Search books or words in the Bible…"}
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        {/* Version Dropdown (compact) */}
        <div className="relative w-16 sm:w-24 shrink-0">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isId}
            className="block w-full py-2.5 sm:py-3 pl-2.5 pr-6 border border-[#333] rounded-xl bg-[#1a1d24] text-brand-gold font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs appearance-none cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed text-center"
          >
            {isId ? (
              <option value="TB">TB</option>
            ) : (
              <>
                <option value="NRSV-CE">NRSV-CE</option>
                <option value="NKJV">NKJV</option>
                <option value="NIV">NIV</option>
              </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-brand-gold">
            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        {/* Ayat Fav ku Button */}
        <Link
          href="/profile/favorites"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 sm:py-3 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 rounded-xl text-xs font-semibold transition-all shadow-sm"
          title={isId ? "Ayat Fav ku" : "My Fav Verses"}
        >
          <Bookmark className="h-4 w-4" fill="currentColor" />
          <span className="hidden sm:inline">{isId ? "Ayat Fav ku" : "My Fav Verses"}</span>
          <span className="sm:hidden">{isId ? "Fav ku" : "Fav"}</span>
        </Link>
      </div>

      {/* Reference typed (book + chapter[:verse]) → open it directly */}
      {refHref && (
        <Link
          href={refHref}
          className="-mt-5 mb-3 flex w-full max-w-2xl items-center gap-3 rounded-xl bg-brand-gold px-4 py-3 text-left text-sm font-semibold text-[#121417] shadow-lg"
        >
          <Bookmark className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{isId ? "Buka" : "Open"} {refLabel}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}

      {/* Hint: search these words across the whole Bible */}
      {q.length >= 2 && !refHref && (
        <button
          onClick={() => searchBible()}
          className="-mt-5 mb-8 flex w-full max-w-2xl items-center gap-3 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-3 text-left text-sm text-brand-gold transition-colors hover:bg-brand-gold/20"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {isId ? <>Cari &ldquo;<b>{q}</b>&rdquo; di seluruh Alkitab</> : <>Search &ldquo;<b>{q}</b>&rdquo; in the whole Bible</>}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      )}

      <div className="space-y-12 pb-12">
        {!searchQuery && <VerseOfDayCard isId={isId} />}

        {/* New Testament */}
        {filteredNT.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Perjanjian Baru" : "New Testament"}
            </h2>
            <BookListClient books={filteredNT} isId={isId} categoryFolder="new" version={version} />
          </div>
        )}
        
        {/* Old Testament */}
        {filteredOT.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Perjanjian Lama" : "Old Testament"}
            </h2>
            <BookListClient books={filteredOT} isId={isId} categoryFolder="old" version={version} />
          </div>
        )}

        {/* Deuterocanonica */}
        {filteredDC.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Deuterokanonika" : "Deuterocanonicals"}
            </h2>
            <BookListClient books={filteredDC} isId={isId} categoryFolder="deu" version={version} />
          </div>
        )}

        {/* No Results */}
        {searchQuery && q.length < 2 && filteredOT.length === 0 && filteredNT.length === 0 && filteredDC.length === 0 && (
          <div className="text-center py-10 bg-brand-surface/50 rounded-2xl border border-[#333] mt-4">
            <p className="text-brand-muted">
              {isId ? "Tidak ada kitab yang cocok dengan pencarian Anda." : "No books match your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
