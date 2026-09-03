"use client";

import { useRef, useState, useEffect } from "react";
import { DAILY_VERSES, BACKGROUNDS } from "./DailyVerseCard";
import { X, Share2, MessageSquare, Loader2, Check } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useRouter } from "next/navigation";

type VerseItem = { verse: { text: string; ref: string }; bg: string; dateOffset: number };

export default function VerseMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<VerseItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  // Get the last 7 days of verses
  const recentVerses: VerseItem[] = [];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  
  for (let i = 0; i < 7; i++) {
    const targetDay = dayOfYear - i;
    const index = ((targetDay % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
    const bgIndex = ((targetDay % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
    recentVerses.push({
      verse: DAILY_VERSES[index],
      bg: BACKGROUNDS[bgIndex],
      dateOffset: i,
    });
  }

  // To make continuous marquee, duplicate the items so it can loop
  const slides = [...recentVerses, ...recentVerses, ...recentVerses, ...recentVerses];

  // Auto-scroll logic
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && !selectedVerse && scrollRef.current) {
        // scroll by 0.05px per ms (~50px per second)
        scrollRef.current.scrollLeft += delta * 0.05;

        // If we've scrolled past the first set, seamlessly reset
        // We know each item is approx 75vw wide + gap. To be safe, we just check scrollWidth
        const scrollWidth = scrollRef.current.scrollWidth;
        const clientWidth = scrollRef.current.clientWidth;
        if (scrollRef.current.scrollLeft >= (scrollWidth / 2)) {
          scrollRef.current.scrollLeft -= (scrollWidth / 4);
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, selectedVerse]);

  // Disable body scroll when modal open
  useEffect(() => {
    if (selectedVerse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedVerse]);

  const handleShareToMessenger = async () => {
    if (!cardRef.current || isSharing || !selectedVerse) return;
    setIsSharing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "daily-verse.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Daily Verse",
          text: selectedVerse.verse.ref,
        });
      } else {
        const link = document.createElement("a");
        link.download = "daily-verse.png";
        link.href = dataUrl;
        link.click();
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share image:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToThought = () => {
    if (!selectedVerse) return;
    // Format text: "Verse text" - Ref
    const text = `"${selectedVerse.verse.text}"\n\n- ${selectedVerse.verse.ref}`;
    router.push(`/?postText=${encodeURIComponent(text)}`);
  };

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-2xl relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />
        
        <div 
          className="-mx-4 sm:mx-0 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef}
            className="flex gap-4 px-4 sm:px-0 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mb-4"
            style={{ scrollBehavior: 'auto' }}
          >
            {slides.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedVerse(item)}
                className="relative aspect-[16/9] w-[75vw] flex-shrink-0 snap-center overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#111] sm:w-[45vw] md:w-[32vw] xl:w-[24vw] text-left transition-transform hover:scale-[1.02]"
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Magnified Verse */}
      {selectedVerse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg flex flex-col items-center animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedVerse(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/40 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Magnified Card (Used for html-to-image) */}
            <div 
              ref={cardRef}
              className="relative w-full aspect-[4/5] sm:aspect-[1/1] overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center p-8 sm:p-12 text-center"
              style={{
                backgroundImage: `url(${selectedVerse.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              
              <div className="relative z-10 flex flex-col items-center justify-center gap-6 h-full w-full">
                <span className="text-4xl text-brand-gold opacity-80">"</span>
                <p className="text-2xl sm:text-3xl font-serif text-white font-medium leading-relaxed drop-shadow-md">
                  "{selectedVerse.verse.text}"
                </p>
                <div className="h-[1px] w-12 bg-brand-gold/50" />
                <p className="text-sm sm:text-base font-sans font-bold text-brand-gold uppercase tracking-[0.2em] drop-shadow-sm">
                  {selectedVerse.verse.ref}
                </p>
                
                <p className="absolute bottom-4 opacity-50 text-[10px] uppercase tracking-widest text-white/70 font-sans">
                  Priskat CFM
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 w-full justify-center">
              <button
                onClick={handleShareToThought}
                className="flex items-center gap-2 bg-brand-surface border border-[#4A6487] text-white px-5 py-3 rounded-full shadow-lg font-medium hover:bg-brand-surface-hover transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Share in Thought
              </button>
              
              <button
                onClick={handleShareToMessenger}
                disabled={isSharing}
                className="flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-3 rounded-full shadow-[0_0_15px_rgba(214,176,114,0.3)] font-bold hover:scale-105 transition-transform disabled:opacity-50 text-sm"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />)}
                {isSharing ? "Preparing..." : (isCopied ? "Saved!" : "Share Image")}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
