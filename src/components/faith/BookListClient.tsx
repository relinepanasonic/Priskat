"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, BookOpen } from "lucide-react";

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
    <div className="mt-8 mb-16 relative">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16 perspective-[1500px] px-2 relative z-10">
        {books.map((book) => {
          const isExpanded = expandedId === book.no;
          return (
            <div key={book.no} className="relative flex flex-col items-center">
              
              {/* The Book Cover */}
              <div 
                onClick={() => toggle(book.no)}
                className={`
                  w-full aspect-[2/3] rounded-r-md rounded-l-[2px] border-l-[6px] z-10
                  shadow-[-3px_0_8px_rgba(0,0,0,0.5),5px_5px_10px_rgba(0,0,0,0.5)] 
                  transition-all duration-300 transform-style-3d cursor-pointer group flex flex-col justify-between p-2
                  ${isComingSoon ? 'opacity-50 border-gray-700 bg-[#222]' : 'border-[#8b6b22] bg-gradient-to-br from-[#333742] to-[#1a1d24] hover:-translate-y-3 hover:shadow-[-3px_0_8px_rgba(0,0,0,0.5),8px_10px_20px_rgba(0,0,0,0.7)]'}
                  ${isExpanded ? 'rotate-y-[-15deg] -translate-y-3 scale-110 z-20 shadow-[-3px_0_8px_rgba(0,0,0,0.5),12px_15px_25px_rgba(0,0,0,0.8)]' : ''}
                `}
                style={{ transformOrigin: "left center" }}
              >
                {/* Book Spine Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                {/* Book Edge Highlight */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10"></div>
                
                <div className="text-brand-gold/80 font-serif text-[8px] md:text-[10px] tracking-wider uppercase">#{book.no}</div>
                
                <div className="text-center font-serif mt-1 mb-auto flex-1 flex items-center justify-center">
                  <h3 className={`font-bold leading-tight text-[11px] md:text-sm ${isComingSoon ? 'text-gray-500' : 'text-brand-light group-hover:text-brand-gold'} transition-colors`}>
                    {book.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1.5">
                  <span className="text-[8px] md:text-[9px] text-gray-400">{book.chapter} {isId ? 'Psl' : 'Ch'}</span>
                  {isComingSoon ? <Lock className="h-2.5 w-2.5 text-gray-500" /> : <BookOpen className="h-2.5 w-2.5 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>

              {/* The Shelf Segment - extends slightly past cell edges to merge visually */}
              <div className="absolute bottom-[-8px] md:bottom-[-12px] left-[-10px] right-[-10px] h-3 md:h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] border-t border-[#444] border-b border-black shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-0 rounded-sm"></div>

              {/* Floating Chapters Menu (Pop-out when clicked) */}
              {isExpanded && !isComingSoon && (
                <div className="absolute top-[105%] left-1/2 -translate-x-1/2 mt-3 md:mt-4 w-48 md:w-64 bg-[#1a1d24] border border-brand-gold/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 p-3 md:p-4 animate-in fade-in zoom-in-95 duration-200 origin-top">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1d24] border-t border-l border-brand-gold/30 rotate-45"></div>
                  <h4 className="text-brand-gold font-serif font-bold text-center mb-2 md:mb-3 border-b border-[#333] pb-1.5 text-xs md:text-sm">
                    {book.name}
                  </h4>
                  <div className="grid grid-cols-5 gap-1 md:gap-1.5 max-h-[150px] md:max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {Array.from({ length: book.chapter }).map((_, i) => (
                      <Link 
                        key={i} 
                        href={`/faith/bible/${book.no}/${i + 1}`} 
                        className="aspect-square flex items-center justify-center rounded bg-[#111] border border-[#333] text-brand-light hover:bg-brand-gold hover:text-black font-semibold transition-colors text-[10px] md:text-xs"
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
    </div>
  );
}
