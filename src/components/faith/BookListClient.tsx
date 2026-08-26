"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Lock } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-3 mt-4 mb-10">
      {books.map((book) => {
        const isExpanded = expandedId === book.no;
        
        return (
          <div key={book.no} className={`bg-brand-surface rounded-2xl border border-[#333] border-t-[#444] border-l-[#444] shadow-3d transition-all ${!isComingSoon && 'hover:bg-[#252830]'}`}>
            
            {/* Header (Clickable) */}
            <div 
              onClick={() => toggle(book.no)}
              className={`p-4 flex items-center justify-between cursor-pointer ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'active:translate-y-[1px]'}`}
            >
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
              
              {isComingSoon ? (
                <Lock className="h-5 w-5 text-gray-600 shrink-0" />
              ) : isExpanded ? (
                <ChevronDown className="h-5 w-5 text-brand-gold shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-brand-muted shrink-0" />
              )}
            </div>

            {/* Chapters Grid (Accordion) */}
            {isExpanded && !isComingSoon && (
              <div className="p-4 pt-0 border-t border-[#333] mt-2">
                <p className="text-xs text-brand-muted mb-3 mt-2">
                  {isId ? "Pilih Pasal:" : "Select Chapter:"}
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {Array.from({ length: book.chapter }).map((_, i) => (
                    <Link
                      key={i}
                      href={`/faith/bible/${book.no}/${i + 1}`}
                      className="aspect-square flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors active:scale-95 text-sm"
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
  );
}
