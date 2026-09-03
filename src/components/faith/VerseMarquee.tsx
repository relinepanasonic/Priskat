"use client";

import { useRef, useState, useEffect } from "react";
import { DAILY_VERSES, BACKGROUNDS } from "./DailyVerseCard";

export default function VerseMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const touchTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleTouchStart = () => {
    setIsPaused(true);
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => {
      setIsPaused(false);
    }, 1000);
  };

  // Get the last 7 days of verses
  const recentVerses = [];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  
  for (let i = 0; i < 7; i++) {
    // Current day is at i=0, previous days follow. We reverse to show oldest to newest or keep newest first
    const targetDay = dayOfYear - i;
    // Handle wrap around if targetDay is negative
    const index = ((targetDay % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
    const bgIndex = ((targetDay % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
    recentVerses.push({
      verse: DAILY_VERSES[index],
      bg: BACKGROUNDS[bgIndex],
      dateOffset: i, // 0 is today, 1 is yesterday, etc.
    });
  }

  // To make continuous marquee, duplicate the items so it can loop
  const slides = [...recentVerses, ...recentVerses, ...recentVerses];

  return (
    <div className="mb-8 overflow-hidden rounded-2xl">
      <style>{`
        .verse-track {
          width: max-content;
          animation: verseScroll 60s linear infinite;
        }
        @keyframes verseScroll { to { transform: translateX(-33.333333%); } }
      `}</style>
      
      <div 
        className="-mx-4 sm:mx-0 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <div 
          className="verse-track flex gap-4 px-4 sm:px-0"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {slides.map((item, idx) => (
            <div 
              key={idx} 
              className="relative aspect-[16/9] w-[75vw] flex-shrink-0 overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#111] sm:w-[45vw] md:w-[32vw] xl:w-[24vw]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.bg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              
              {item.dateOffset === 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-brand-gold/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  Today
                </span>
              )}

              <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
                <span className="text-xl text-brand-gold opacity-80 mb-2">"</span>
                <p className="text-sm sm:text-base font-serif text-white font-medium leading-snug drop-shadow-md line-clamp-3">
                  "{item.verse.text}"
                </p>
                <div className="h-[1px] w-8 bg-brand-gold/50 my-3" />
                <p className="text-[10px] sm:text-xs font-sans font-bold text-brand-gold uppercase tracking-[0.15em] drop-shadow-sm">
                  {item.verse.ref}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
