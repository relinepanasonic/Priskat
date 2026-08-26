"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Lock } from "lucide-react";
import BookListClient from "./BookListClient";

interface Book {
  no: number;
  abbr: string;
  name: string;
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
  
  // Section expand states
  const [expandedSections, setExpandedSections] = useState({
    OT: true,
    DC: true,
    NT: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter books based on search
  const filteredOT = useMemo(() => 
    oldTestament.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [oldTestament, searchQuery]);

  const filteredNT = useMemo(() => 
    newTestament.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [newTestament, searchQuery]);

  const filteredDC = useMemo(() => 
    deuterocanonica.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [deuterocanonica, searchQuery]);

  // If searching, auto-expand sections that have results
  // Note: we only want to auto-expand if there's actually a search query.
  const showOT = searchQuery ? filteredOT.length > 0 : expandedSections.OT;
  const showNT = searchQuery ? filteredNT.length > 0 : expandedSections.NT;
  const showDC = searchQuery ? filteredDC.length > 0 : expandedSections.DC;

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-6">
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

      {/* Old Testament */}
      {(filteredOT.length > 0 || !searchQuery) && (
        <div className="mb-6">
          <button 
            onClick={() => toggleSection("OT")}
            className="w-full flex items-center justify-between border-b border-[#333] pb-2 text-left"
          >
            <h2 className="text-xl font-bold text-white tracking-wide">
              {isId ? "Perjanjian Lama" : "Old Testament"}
            </h2>
            {showOT ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
          </button>
          
          {showOT && (
            <div className="mt-2">
              <BookListClient books={filteredOT} isId={isId} />
            </div>
          )}
        </div>
      )}

      {/* Deuterocanonica */}
      {(filteredDC.length > 0 || !searchQuery) && (
        <div className="mb-6">
          <button 
            onClick={() => toggleSection("DC")}
            className="w-full flex items-center justify-between border-b border-[#333] pb-2 text-left"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {isId ? "Deuterokanonika" : "Deuterocanonicals"}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-gold/20 text-brand-gold px-2 py-1 rounded-full">
                {isId ? "Segera Hadir" : "Coming Soon"}
              </span>
            </div>
            {showDC ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
          </button>
          
          {showDC && (
            <div className="mt-2">
              <p className="text-sm text-brand-muted mb-2">
                {isId 
                  ? "API publik yang kami gunakan saat ini belum mendukung kitab Deuterokanonika Katolik. Kami sedang menyiapkan sumber data khusus untuk segera menghadirkannya!" 
                  : "The public API we currently use does not yet support Catholic Deuterocanonical books. We are preparing a custom data source to bring them to you soon!"}
              </p>
              <BookListClient books={filteredDC} isId={isId} isComingSoon={true} />
            </div>
          )}
        </div>
      )}

      {/* New Testament */}
      {(filteredNT.length > 0 || !searchQuery) && (
        <div className="mb-6">
          <button 
            onClick={() => toggleSection("NT")}
            className="w-full flex items-center justify-between border-b border-[#333] pb-2 text-left"
          >
            <h2 className="text-xl font-bold text-white tracking-wide">
              {isId ? "Perjanjian Baru" : "New Testament"}
            </h2>
            {showNT ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
          </button>
          
          {showNT && (
            <div className="mt-2">
              <BookListClient books={filteredNT} isId={isId} />
            </div>
          )}
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
  );
}
