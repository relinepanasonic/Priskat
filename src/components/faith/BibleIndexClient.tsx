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
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-[#333] rounded-xl leading-5 bg-[#1a1d24] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold sm:text-sm transition-colors shadow-inner-dark"
          placeholder={isId ? "Cari nama kitab (mis. Kejadian, Matius)..." : "Search book names (e.g. Genesis, Matthew)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-12 pb-12">
        {/* New Testament */}
        {filteredNT.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Perjanjian Baru" : "New Testament"}
            </h2>
            <BookListClient books={filteredNT} isId={isId} categoryFolder="new" />
          </div>
        )}
        
        {/* Old Testament */}
        {filteredOT.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Perjanjian Lama" : "Old Testament"}
            </h2>
            <BookListClient books={filteredOT} isId={isId} categoryFolder="old" />
          </div>
        )}

        {/* Deuterocanonica */}
        {filteredDC.length > 0 && (
          <div className="relative">
            <h2 className="text-xl font-bold text-white tracking-wide mb-4 pl-2">
              {isId ? "Deuterokanonika" : "Deuterocanonicals"}
            </h2>
            <BookListClient books={filteredDC} isId={isId} categoryFolder="deu" />
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
