"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

function BookCard({ book, isId, isExpanded, onToggle, categoryFolder }: any) {
  const [imgFailed, setImgFailed] = useState(false);
  const imagePath = `/images/bible/${categoryFolder}/${book.name_en}.jpeg`;

  return (
    <div className="relative flex flex-col items-center shrink-0 snap-center w-[110px] md:w-[130px]">
      <div 
        onClick={() => onToggle(book.no)}
        className={`
          w-full aspect-[2/3] rounded-r-md rounded-l-[2px] border-l-[4px] border-[#8b6b22] z-10
          shadow-[-3px_0_8px_rgba(0,0,0,0.5),5px_5px_10px_rgba(0,0,0,0.5)] bg-[#1a1d24]
          transition-all duration-300 transform-style-3d cursor-pointer group flex flex-col relative overflow-hidden
          hover:-translate-y-3 hover:shadow-[-3px_0_8px_rgba(0,0,0,0.5),8px_10px_20px_rgba(0,0,0,0.7)]
          ${isExpanded ? 'rotate-y-[-15deg] -translate-y-3 scale-110 z-20 shadow-[-3px_0_8px_rgba(0,0,0,0.5),12px_15px_25px_rgba(0,0,0,0.8)]' : ''}
        `}
        style={{ transformOrigin: "left center" }}
      >
        {!imgFailed && (
          <img 
            src={imagePath} 
            alt={book.name_en} 
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {imgFailed && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#333742] to-[#1a1d24] flex flex-col justify-between p-2 z-0">
            <div className="text-brand-gold/80 font-serif text-[8px] md:text-[10px] tracking-wider uppercase">#{book.no}</div>
            <div className="text-center font-serif mt-1 mb-auto flex-1 flex items-center justify-center">
              <h3 className="font-bold leading-tight text-[11px] md:text-sm text-brand-light group-hover:text-brand-gold transition-colors">
                {book.name}
              </h3>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1.5">
              <span className="text-[8px] md:text-[9px] text-gray-400">{book.chapter} {isId ? 'Psl' : 'Ch'}</span>
              <BookOpen className="h-2.5 w-2.5 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-white/20 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
      </div>

      {isExpanded && (
        <div className="absolute top-[105%] left-1/2 -translate-x-1/2 mt-3 md:mt-4 w-56 md:w-64 bg-[#1a1d24] border border-brand-gold/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 p-3 md:p-4 animate-in fade-in zoom-in-95 duration-200 origin-top">
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
}

export default function BookListClient({ 
  books, 
  isId,
  categoryFolder
}: { 
  books: any[], 
  isId: boolean,
  categoryFolder: string
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="relative z-10 pb-6">
      <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-6 pt-2 px-2 snap-x z-10 relative">
        {books.map((book) => (
          <BookCard 
            key={book.no}
            book={book} 
            isId={isId} 
            isExpanded={expandedId === book.no} 
            onToggle={(id: number) => setExpandedId(prev => prev === id ? null : id)}
            categoryFolder={categoryFolder}
          />
        ))}
      </div>
      <div className="absolute bottom-[30px] left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] border-t border-[#444] border-b border-black shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-0 rounded-sm"></div>
    </div>
  );
}
