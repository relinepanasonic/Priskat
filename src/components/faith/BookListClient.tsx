"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";

function BookCard({ 
  book, 
  isId, 
  isExpanded, 
  onToggle,
  categoryFolder,
  version
}: { 
  book: any, 
  isId: boolean, 
  isExpanded: boolean, 
  onToggle: (id: number) => void,
  categoryFolder: string,
  version: string
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const imagePath = `/images/bible/${categoryFolder}/${book.name_en}.jpeg`;
  const isGospel = ["Matthew", "Mark", "Luke", "John"].includes(book.name_en);

  return (
    <>
      <div className="relative flex flex-col items-center shrink-0 snap-center w-[110px] md:w-[130px] group">
        {/* Golden Aura for the 4 Gospels */}
        {isGospel && (
          <div className="absolute -inset-1 md:-inset-2 bg-[#ffc837] rounded-md blur-md md:blur-xl opacity-0 group-hover:opacity-50 group-hover:animate-pulse transition-opacity duration-500 pointer-events-none z-0"></div>
        )}

        <div 
          onClick={() => onToggle(book.no)}
          className={`
            w-full aspect-[2/3] rounded-r-md rounded-l-[2px] border-l-[4px] border-[#8b6b22] z-10
            shadow-[-3px_0_8px_rgba(0,0,0,0.5),5px_5px_10px_rgba(0,0,0,0.5)] bg-[#1a1d24]
            transition-all duration-300 transform-style-3d cursor-pointer flex flex-col relative overflow-hidden
            hover:-translate-y-3 hover:shadow-[-3px_0_8px_rgba(0,0,0,0.5),8px_10px_20px_rgba(0,0,0,0.7)]
          `}
          style={{ transformOrigin: "left center" }}
        >
          {/* We always render the img, just hide it if it fails. This is more reliable across browsers. */}
          <img 
            src={imagePath} 
            alt={book.name_en} 
            onError={(e) => {
              setImgFailed(true);
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ display: imgFailed ? 'none' : 'block' }}
          />

          {imgFailed && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#333742] to-[#1a1d24] flex flex-col justify-between p-2 z-0">
              <div className="text-brand-gold/80 font-serif text-[8px] md:text-[10px] tracking-wider uppercase">#{book.no}</div>
              <div className="text-center font-serif mt-1 mb-auto flex-1 flex items-center justify-center">
                <h3 className="font-bold leading-tight text-[11px] md:text-sm text-brand-light transition-colors">
                  {book.name}
                </h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-1.5">
                <span className="text-[8px] md:text-[9px] text-gray-400">{book.chapter} {isId ? 'Psl' : 'Ch'}</span>
                <BookOpen className="h-2.5 w-2.5 text-brand-gold opacity-100" />
              </div>
            </div>
          )}

          {/* Elegant Obi Band for Indonesian Translation */}
          {isId && !imgFailed && (
            <div className="absolute bottom-3 left-0 right-0 bg-black/80 backdrop-blur-md border-y border-[#8b6b22]/50 py-1.5 px-2 z-10 flex items-center justify-center shadow-[0_-2px_8px_rgba(0,0,0,0.6)] pointer-events-none">
              <h3 className="text-[10px] md:text-xs font-serif font-bold text-brand-gold truncate drop-shadow-md tracking-wider">
                {book.name}
              </h3>
            </div>
          )}

          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-white/20 z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
        </div>

        {/* English Title Below Book (Simpler presentation for English) */}
        {!isId && (
          <div className="mt-3 text-center z-10 w-full px-1">
            <h3 className="text-xs md:text-sm font-serif font-bold text-[#e8decd] tracking-wide truncate group-hover:text-brand-gold transition-colors">
              {book.name_en}
            </h3>
          </div>
        )}
      </div>

      {/* Magnified Open Book Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 md:p-12 perspective-[2000px] overscroll-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => onToggle(book.no)}
          ></div>
          
          <button 
            onClick={() => onToggle(book.no)}
            className="absolute top-6 right-6 z-[110] p-2 bg-black/50 hover:bg-brand-gold text-white hover:text-black rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Open Book Container */}
          <div className="relative w-full max-w-4xl aspect-[1.2/1] sm:aspect-[1.6/1] md:aspect-[2/1] flex shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 transform-style-3d">
            
            {/* Left Page (Cover Inside/Texture) */}
            <div className="flex-1 rounded-l-md overflow-hidden relative border border-[#222] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.8)] origin-right rotate-y-[-5deg] md:rotate-y-[0deg]">
              {!imgFailed ? (
                <>
                  <img src={imagePath} alt={book.name_en} className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-[0.4] blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/90"></div>
                  
                  {/* Inside Cover Decorative Info */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border-8 border-white/5 m-4 rounded-sm">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-gold mb-4 drop-shadow-lg">
                      {book.name}
                    </h2>
                    <h3 className="text-lg md:text-xl font-serif text-[#e8decd] tracking-widest uppercase opacity-70">
                      {book.name_en}
                    </h3>
                    <div className="w-16 h-px bg-brand-gold/50 my-6"></div>
                    <p className="text-[#e8decd] font-serif italic text-sm md:text-base max-w-[80%] opacity-80">
                      {isId ? `Kitab ${book.name} memiliki total ${book.chapter} pasal.` : `The book of ${book.name_en} contains ${book.chapter} chapters.`}
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d24] to-[#0d0e12] flex flex-col items-center justify-center p-8 text-center border-8 border-brand-gold/10 m-4 rounded-sm">
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-gold mb-4">
                    {book.name}
                  </h2>
                </div>
              )}
              
              {/* Center Crease (Left side) */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/90 to-transparent pointer-events-none"></div>
            </div>

            {/* Right Page (Content Page - Chapters) */}
            <div className="flex-1 bg-[#f4ebd0] rounded-r-md shadow-2xl relative origin-left rotate-y-[5deg] md:rotate-y-[0deg] overflow-hidden flex flex-col">
              
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply pointer-events-none"></div>
              
              {/* Center Crease (Right side) */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10"></div>
              
              {/* Content Container */}
              <div className="relative z-20 p-6 md:p-10 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                
                <div className="text-center mb-8 border-b border-[#2a2520]/20 pb-4">
                  <span className="text-[#2a2520] font-serif font-bold text-sm tracking-widest uppercase opacity-60 block mb-1">
                    {isId ? "Daftar Isi" : "Contents"}
                  </span>
                  <h3 className="text-[#2a2520] font-serif text-2xl md:text-3xl font-bold">
                    {isId ? "Pilih Pasal" : "Select Chapter"}
                  </h3>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3">
                  {Array.from({ length: book.chapter }).map((_, i) => (
                    <Link 
                      key={i} 
                      href={`/faith/bible/${book.no}/${i + 1}?version=${version}`} 
                      className="aspect-square flex items-center justify-center rounded-sm border border-[#2a2520]/20 text-[#2a2520] hover:bg-[#8b6b22] hover:text-white hover:border-[#8b6b22] hover:shadow-md font-serif text-sm md:text-lg font-bold transition-all duration-200 active:scale-95"
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
                
              </div>
              
              {/* Page Stack Edge (Right side) */}
              <div className="absolute right-0 top-1 bottom-1 w-1.5 bg-gradient-to-l from-[#d4cbb0] to-transparent rounded-r-sm pointer-events-none shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]"></div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default function BookListClient({ 
  books, 
  isId,
  categoryFolder,
  version
}: { 
  books: any[], 
  isId: boolean,
  categoryFolder: string,
  version: string
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (expandedId !== null) {
      document.body.style.overflow = 'hidden';
      // Prevent mobile body scroll issues
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [expandedId]);

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
            version={version}
          />
        ))}
      </div>
      <div className="absolute bottom-[30px] left-0 right-0 h-4 bg-gradient-to-b from-[#3a3d45] to-[#1a1d24] border-t border-[#444] border-b border-black shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-0 rounded-sm"></div>
    </div>
  );
}
