"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface Verse {
  verse: number;
  type: "content" | "title";
  content: string;
}

interface Props {
  verses: Verse[];
  bookName: string;
  bookId: number;
  chapter: number;
  lang?: "id" | "en";
}

const WORDS_PER_PAGE = 220;

function splitIntoPages(verses: Verse[]): Verse[][] {
  const pages: Verse[][] = [];
  let currentPage: Verse[] = [];
  let wordCount = 0;

  for (const verse of verses) {
    const words = verse.content.split(" ").length;
    
    // Titles always stay with the next verse, reset page at half-way
    if (verse.type === "title") {
      if (wordCount > WORDS_PER_PAGE / 2) {
        pages.push(currentPage);
        currentPage = [];
        wordCount = 0;
      }
      currentPage.push(verse);
      continue;
    }

    // If adding this verse would overflow, start a new page
    if (wordCount + words > WORDS_PER_PAGE && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      wordCount = 0;
    }

    currentPage.push(verse);
    wordCount += words;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function PageContent({ verses, bookName, chapter, isFirstPage }: { verses: Verse[], bookName: string, chapter: number, isFirstPage: boolean }) {
  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-8 lg:p-12 pb-16 lg:pb-20 flex flex-col relative">
      {isFirstPage && (
        <div className="hidden">
          <h2 className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] font-sans">
            {bookName}
          </h2>
          <h1 className="text-6xl lg:text-7xl font-bold mt-1 text-black font-serif">
            {chapter}
          </h1>
        </div>
      )}
            <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] font-sans">
          {bookName} {chapter}
        </span>
      </div>
      <div className="text-[14px] lg:text-[15px] leading-[1.8] text-[#222] font-serif flex-1 mt-4 text-left">
        {verses.map((v, i) => {
          if (v.type === "title") {
            return (
              <h3 key={i} className="text-sm lg:text-base font-bold italic mt-5 mb-2 text-black block font-serif">
                {v.content}
              </h3>
            );
          }
          return (
            <span key={i} className="inline">
              <sup className="text-gray-400 font-sans font-bold text-[10px] mr-0.5 ml-1 align-super">
                {v.verse}
              </sup>
              {v.content}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function BookReader({ verses, bookName, bookId, chapter, lang = "en" }: Props) {
  const pages = splitIntoPages(verses);
  
  // Each "spread" shows 2 pages: left and right
  const totalSpreads = Math.ceil(pages.length / 2);
  const [spread, setSpread] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const goNext = () => {
    if (spread >= totalSpreads - 1 || isAnimating) return;
    setAnimDir("right");
    setIsAnimating(true);
    setTimeout(() => {
      setSpread(s => s + 1);
      setIsAnimating(false);
      setAnimDir(null);
    }, 300);
  };

  const goPrev = () => {
    if (spread <= 0 || isAnimating) return;
    setAnimDir("left");
    setIsAnimating(true);
    setTimeout(() => {
      setSpread(s => s - 1);
      setIsAnimating(false);
      setAnimDir(null);
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spread, isAnimating]);

  const leftPageIndex = spread * 2;
  const rightPageIndex = spread * 2 + 1;

  return (
    <div className="min-h-[100dvh] pb-32 bg-[#2a2520] flex flex-col items-center justify-start py-4 md:py-8 px-4 relative select-none">
      
      {/* Back Button */}
      <div className="w-full max-w-5xl flex items-center mb-4">
        <Link href="/faith/bible" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
          <ChevronLeft className="h-4 w-4" />
          <span>{lang === "id" ? "Pustaka" : "Library"}</span>
        </Link>
      </div>

      {/* Mobile view: single page */}
      <div className="md:hidden flex-1 w-full max-w-sm bg-[#fbfbf6] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {pages[leftPageIndex] && (
          <PageContent
            verses={pages[leftPageIndex]}
            bookName={bookName}
            chapter={chapter}
            isFirstPage={leftPageIndex === 0}
          />
        )}
      </div>

      {/* Desktop: two-page spread (book) */}
      <div 
        className="hidden md:flex w-full max-w-5xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] rounded-lg overflow-hidden relative"
        style={{ height: "72vh" }}
      >
        {/* Page Turn Animation Overlay */}
        {isAnimating && (
          <div 
            className={`absolute inset-0 bg-[#f0ead6] z-50 transition-transform duration-300 origin-${animDir === "right" ? "left" : "right"}`}
            style={{
              transform: animDir === "right" ? "rotateY(-5deg) scaleX(0.98)" : "rotateY(5deg) scaleX(0.98)",
              opacity: 0.4,
            }}
          />
        )}

        {/* Left Page */}
        <div 
          className="w-1/2 h-full bg-[#fbfbf6] relative cursor-pointer group"
          onClick={goPrev}
          style={{
            boxShadow: "inset -8px 0 20px rgba(0,0,0,0.08)",
            transform: isAnimating && animDir === "left" ? "translateX(-4px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {pages[leftPageIndex] ? (
            <PageContent
              verses={pages[leftPageIndex]}
              bookName={bookName}
              chapter={chapter}
              isFirstPage={leftPageIndex === 0}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm font-serif italic">
              â€” end â€”
            </div>
          )}
          {/* Page number */}
          <div className="absolute bottom-4 left-10 text-gray-400 text-xs font-sans">
            {leftPageIndex + 1}
          </div>
        </div>

        {/* Book Spine */}
        <div className="w-8 h-full bg-gradient-to-r from-[#ddd8cc] via-[#efe9d8] to-[#ddd8cc] flex-shrink-0 z-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/10"></div>
        </div>

        {/* Right Page */}
        <div 
          className="w-1/2 h-full bg-[#f9f8f3] relative cursor-pointer group"
          onClick={goNext}
          style={{
            boxShadow: "inset 8px 0 20px rgba(0,0,0,0.06)",
            transform: isAnimating && animDir === "right" ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {pages[rightPageIndex] ? (
            <PageContent
              verses={pages[rightPageIndex]}
              bookName={bookName}
              chapter={chapter}
              isFirstPage={rightPageIndex === 0}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm font-serif italic">
              â€” end â€”
            </div>
          )}
          {/* Page number */}
          <div className="absolute bottom-4 right-10 text-gray-400 text-xs font-sans">
            {rightPageIndex < pages.length ? rightPageIndex + 1 : ""}
          </div>
        </div>

        {/* Click Zone indicators */}
        {spread > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none flex items-center pl-6 z-20">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center opacity-0 opacity-100 transition-opacity">
              <ChevronLeft className="h-8 w-8 text-black/40" />
            </div>
          </div>
        )}
        {spread < totalSpreads - 1 && (
          <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none flex items-center justify-end pr-6 z-20">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center opacity-0 opacity-100 transition-opacity">
              <ChevronRight className="h-8 w-8 text-black/40" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-6 flex items-center gap-4">
        <button className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-white">
          <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
        </button>

        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-2">
          {chapter > 1 ? (
            <Link href={`/faith/bible/${bookId}/${chapter - 1}`} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : <div className="h-8 w-8" />}
          
          <span className="text-white font-sans text-sm font-semibold px-3">
            {bookName} {chapter}
          </span>
          
          <Link href={`/faith/bible/${bookId}/${chapter + 1}`} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="text-white/40 text-xs font-sans">
          {spread + 1} / {totalSpreads}
        </div>
      </div>

      {/* Mobile scroll nav */}
      <div className="md:hidden fixed bottom-24 left-0 right-0 px-4 flex justify-center gap-3">
        {/* same nav pill but for mobile, sticky */}
      </div>
    </div>
  );
}




