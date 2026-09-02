"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import BookListClient from "./BookListClient";

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

export default function BibleIndexClient({
  isId,
  oldTestament,
  newTestament,
  deuterocanonica
}: BibleIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [version, setVersion] = useState(isId ? "TB" : "NRSV-CE");

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
      {/* Search Bar & Version Dropdown */}
      <div className="flex items-center gap-3 mb-8 max-w-2xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[#333] rounded-xl leading-5 bg-[#1a1d24] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold sm:text-sm transition-colors shadow-inner-dark"
            placeholder={isId ? "Cari nama kitab..." : "Search book names..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Version Dropdown */}
        <div className="relative w-28 sm:w-36">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isId}
            className="block w-full py-3 pl-3 pr-8 border border-[#333] rounded-xl bg-[#1a1d24] text-brand-gold font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-gold">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="space-y-12 pb-12">
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
        {searchQuery && filteredOT.length === 0 && filteredNT.length === 0 && filteredDC.length === 0 && (
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
