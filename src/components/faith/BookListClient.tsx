"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Lock, BookOpen } from "lucide-react";

export default function BookListClient({ 
  books, 
  isId, 
  isComingSoon = false 
}: { 
  books: any[], 
  isId: boolean, 
  isComingSoon?: boolean 
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) => {
    if (isComingSoon) return;
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <>
      {/* Mobile View (Accordion List) */}
      <div className="md:hidden grid grid-cols-1 gap-3 mt-2 mb-4">
        {books.map((book) => {
          const isExpanded = expandedId === book.no;
          return (
            <div key={book.no} className={`bg-brand-surface rounded-2xl border border-[#333] border-t-[#444] border-l-[#444] shadow-3d transition-all ${!isComingSoon && 'hover:bg-[#252830]'}`}>
              <div onClick={() => toggle(book.no)} className={`p-4 flex items-center justify-between cursor-pointer ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'active:translate-y-[1px]'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-inner-dark text-brand-gold font-bold shrink-0 text-sm">
                    {book.abbr}
                  </div>
                  <div>
                    <h3 className={`font-medium text-lg ${isComingSoon ? 'text-gray-500' : 'text-brand-light'}`}>
                      {book.name}
                    </h3>
                    <p className="text-brand-muted text-xs">
                      {book.chapter} {isId ? 'Pasal' : 'Chapters'}
                    </p>
                  </div>
                </div>
                {isComingSoon ? <Lock className="h-5 w-5 text-gray-600 shrink-0" /> : isExpanded ? <ChevronDown className="h-5 w-5 text-brand-gold shrink-0" /> : <ChevronRight className="h-5 w-5 text-brand-muted shrink-0" />}
              </div>
              {isExpanded && !isComingSoon && (
                <div className="p-4 pt-0 border-t border-[#333] mt-2">
                  <p className="text-xs text-brand-muted mb-3 mt-2">{isId ? "Pilih Pasal:" : "Select Chapter:"}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: book.chapter }).map((_, i) => (
                      <Link key={i} href={`/faith/bible/${book.no}/${i + 1}`} className="aspect-square flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors active:scale-95 text-sm">
                        {i + 1}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View (3D Books on Shelves) */}
      <div className="hidden md:flex flex-wrap justify-center gap-x-8 gap-y-16 mt-8 mb-12 perspective-[1500px]">
        {books.map((book) => {
          const isExpanded = expandedId === book.no;
          return (
            <div key={book.no} className="relative w-32 xl:w-36 flex flex-col items-center">
              
              {/* The Book Cover */}
              <div 
                onClick={() => toggle(book.no)}
                className={`
                  w-full aspect-[2/3] rounded-r-xl rounded-l-sm border-l-8 z-10
                  shadow-[8px_8px_15px_rgba(0,0,0,0.5),inset_-2px_0_5px_rgba(255,255,255,0.1)] 
                  transition-all duration-500 transform-style-3d cursor-pointer group flex flex-col justify-between p-3
                  ${isComingSoon ? 'opacity-50 border-gray-600 bg-[#222]' : 'border-[#8b6b22] bg-gradient-to-br from-[#333742] to-[#1a1d24] hover:-translate-y-4 hover:shadow-[15px_20px_25px_rgba(0,0,0,0.6)]'}
                  ${isExpanded ? 'rotate-y-[-25deg] -translate-y-4 scale-110 z-20 shadow-[20px_25px_30px_rgba(0,0,0,0.7)]' : ''}
                `}
                style={{ transformOrigin: "left center" }}
              >
                {/* Book Spine Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-white/20 to-transparent"></div>
                {/* Book Edge Highlight */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10"></div>
                
                <div className="text-brand-gold/80 font-serif text-[10px] tracking-wider uppercase">#{book.no}</div>
                
                <div className="text-center font-serif mt-2 mb-auto flex-1 flex items-center justify-center">
                  <h3 className={`font-bold leading-tight text-sm ${isComingSoon ? 'text-gray-500' : 'text-brand-light group-hover:text-brand-gold'} transition-colors`}>
                    {book.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-[9px] text-gray-400">{book.chapter} {isId ? 'Psl' : 'Ch'}</span>
                  {isComingSoon ? <Lock className="h-3 w-3 text-gray-500" /> : <BookOpen className="h-3 w-3 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>

              {/* The Shelf Segment */}
              <div className="absolute bottom-[-10px] left-[-16px] right-[-16px] h-4 bg-gradient-to-b from-[#2a2c33] to-[#15161a] border-t border-white/5 border-b-2 border-black shadow-[0_15px_20px_rgba(0,0,0,0.6)] z-0 rounded-sm"></div>

              {/* Floating Chapters Menu (Pop-out when clicked) */}
              {isExpanded && !isComingSoon && (
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 mt-4 w-64 bg-[#1a1d24] border border-brand-gold/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1d24] border-t border-l border-brand-gold/30 rotate-45"></div>
                  <h4 className="text-brand-gold font-serif font-bold text-center mb-3 border-b border-[#333] pb-2">
                    {book.name}
                  </h4>
                  <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {Array.from({ length: book.chapter }).map((_, i) => (
                      <Link 
                        key={i} 
                        href={`/faith/bible/${book.no}/${i + 1}`} 
                        className="aspect-square flex items-center justify-center rounded bg-[#111] border border-[#333] text-brand-light hover:bg-brand-gold hover:text-black font-semibold transition-colors text-xs"
                      >
                        {i + 1}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
