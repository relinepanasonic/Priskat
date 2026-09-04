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
    recentVerses.push({ verse: DAILY_VERSES[index], bg: BACKGROUNDS[bgIndex], dateOffset: i });
  }

  const slides = [...recentVerses, ...recentVerses, ...recentVerses, ...recentVerses];

  // Auto-scroll via rAF
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      if (!isPaused && !selectedVerse && scrollRef.current) {
        scrollRef.current.scrollLeft += delta * 0.04;
        const scrollWidth = scrollRef.current.scrollWidth;
        if (scrollRef.current.scrollLeft >= scrollWidth * 0.5) {
          scrollRef.current.scrollLeft -= scrollWidth * 0.25;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, selectedVerse]);

  useEffect(() => {
    if (selectedVerse) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedVerse]);

  const handleShareToMessenger = async () => {
    if (!cardRef.current || isSharing || !selectedVerse) return;
    setIsSharing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1.0, pixelRatio: 2, cacheBust: true });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "verse.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Daily Verse", text: selectedVerse.verse.ref });
      } else {
        const link = document.createElement("a");
        link.download = "verse.png"; link.href = dataUrl; link.click();
        setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) { console.error(err); }
    finally { setIsSharing(false); }
  };

  const handleShareToThought = () => {
    if (!selectedVerse) return;
    const text = `"${selectedVerse.verse.text}"\n\n— ${selectedVerse.verse.ref}`;
    router.push(`/?postText=${encodeURIComponent(text)}`);
  };

  return (
    <>
      {/* Marquee strip */}
      <div className="mb-6 relative">
        {/* Edge fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />

        <div
          className="-mx-4 sm:mx-0 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 800)}
        >
          <div
            ref={scrollRef}
            className="flex gap-3 px-4 sm:px-0 overflow-x-auto snap-x snap-mandatory glass-scrollbar pb-3"
            style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
          >
            {slides.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVerse(item)}
                className="relative flex-shrink-0 snap-center overflow-hidden rounded-xl bg-black group"
                style={{ width: "78vw", aspectRatio: "16/9", maxWidth: "340px", minWidth: "260px" }}
              >
                {/* Background photo — darkened & desaturated via CSS filter */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${item.bg})`,
                    filter: "brightness(0.35) saturate(0.6) contrast(1.15)",
                  }}
                />
                {/* Heavy black vignette from all edges */}
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 65%, transparent 15%, rgba(0,0,0,0.80) 80%)" }} />
                {/* Warm amber glow at bottom center — very subtle */}
                <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(180,120,30,0.15) 0%, transparent 70%)" }} />

                {/* Today badge */}
                {item.dateOffset === 0 && (
                  <span className="absolute right-3 top-3 rounded-sm bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-black z-20">
                    Today
                  </span>
                )}

                {/* Text content */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 py-3 text-center gap-2">
                  <p
                    className="text-xs sm:text-sm font-bold text-white/95 uppercase leading-snug tracking-wide line-clamp-3"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.8)" }}
                  >
                    {item.verse.text}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-[1px] w-5 bg-amber-500/50" />
                    <p
                      className="text-[9px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: "#c9952e", textShadow: "0 1px 6px rgba(0,0,0,1)" }}
                    >
                      {item.verse.ref}
                    </p>
                    <div className="h-[1px] w-5 bg-amber-500/50" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedVerse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedVerse(null)}
        >
          <div
            className="relative w-full max-w-lg flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedVerse(null)}
              className="absolute -top-11 right-0 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Magnified cinematic card — 16:9 landscape */}
            <div
              ref={cardRef}
              className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-black"
              style={{ aspectRatio: "16/9" }}
            >
              {/* Background photo — darkened + desaturated */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${selectedVerse.bg})`,
                  filter: "brightness(0.3) saturate(0.5) contrast(1.2)",
                }}
              />
              {/* Cinematic vignette */}
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 10%, rgba(0,0,0,0.78) 75%)" }} />
              {/* Warm amber bottom glow */}
              <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(160,100,20,0.20) 0%, transparent 65%)" }} />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 sm:px-14 py-6 text-center gap-4">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-amber-500/40" />
                  <span className="text-[8px] uppercase tracking-[0.35em] font-sans" style={{ color: "#b8903a" }}>Sacred Scripture</span>
                  <div className="h-[1px] w-8 bg-amber-500/40" />
                </div>

                {/* Main verse — cinematic headline style */}
                <p
                  className="text-lg sm:text-2xl font-black text-white uppercase leading-snug tracking-wide"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,1), 0 0 50px rgba(0,0,0,0.8)" }}
                >
                  {selectedVerse.verse.text}
                </p>

                {/* Ornament divider */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-10 bg-amber-500/40" />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#c9952e" }} />
                  <div className="h-[1px] w-10 bg-amber-500/40" />
                </div>

                {/* Reference */}
                <p
                  className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase"
                  style={{ color: "#c9952e", textShadow: "0 1px 8px rgba(0,0,0,1)" }}
                >
                  {selectedVerse.verse.ref}
                </p>

                {/* Watermark */}
                <p className="absolute bottom-3 text-[8px] uppercase tracking-[0.35em] text-white/20 font-sans">
                  Priskat CFM
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 w-full justify-center">
              <button
                onClick={handleShareToThought}
                className="flex items-center gap-2 bg-white/10 border border-white/15 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/15 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Share in Thought
              </button>

              <button
                onClick={handleShareToMessenger}
                disabled={isSharing}
                className="flex items-center gap-2 text-black px-5 py-2.5 rounded-full font-black hover:scale-105 transition-transform disabled:opacity-50 text-sm shadow-[0_0_20px_rgba(180,120,30,0.35)]"
                style={{ backgroundColor: "#c9952e" }}
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />)}
                {isSharing ? "Exporting..." : (isCopied ? "Saved!" : "Share Image")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
