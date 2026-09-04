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
            className="flex gap-3 px-4 sm:px-0 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
            style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
          >
            {slides.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVerse(item)}
                className="relative flex-shrink-0 snap-center overflow-hidden rounded-xl border border-white/5 bg-black group"
                style={{ width: "68vw", aspectRatio: "9/14", maxWidth: "200px", minWidth: "160px" }}
              >
                {/* Background photo */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.bg})` }}
                />
                {/* Heavy cinematic overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/90" />
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.65) 100%)" }} />
                {/* Warm horizon glow */}
                <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(160,100,20,0.22) 0%, transparent 100%)" }} />

                {/* Today badge */}
                {item.dateOffset === 0 && (
                  <span className="absolute left-2.5 top-2.5 rounded-sm bg-amber-400/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-black">
                    Today
                  </span>
                )}

                {/* Text content */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 py-4 text-center gap-2.5">
                  {/* Thin gold line top */}
                  <div className="h-[1px] w-6 bg-amber-400/50 mb-1" />

                  <p className="text-[11px] font-bold text-white uppercase leading-tight tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,1)] line-clamp-4" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.95)" }}>
                    {item.verse.text}
                  </p>

                  <div className="h-[1px] w-5 bg-amber-400/40 mt-1" />

                  <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                    {item.verse.ref}
                  </p>

                  {/* Crown watermark */}
                  <p className="absolute bottom-2 text-[7px] uppercase tracking-[0.25em] text-white/25 font-sans">
                    Priskat
                  </p>
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
            className="relative w-full max-w-sm flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedVerse(null)}
              className="absolute -top-11 right-0 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Magnified cinematic card */}
            <div
              ref={cardRef}
              className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
              style={{
                aspectRatio: "9/16",
                backgroundImage: `url(${selectedVerse.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/90" />
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.72) 100%)" }} />
              <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(160,100,20,0.25) 0%, transparent 100%)" }} />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 py-12 text-center gap-5">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-amber-400/50" />
                  <span className="text-[9px] uppercase tracking-[0.35em] text-amber-300/70 font-sans">Sacred Scripture</span>
                  <div className="h-[1px] w-8 bg-amber-400/50" />
                </div>

                {/* Main verse — cinematic headline style */}
                <p
                  className="text-2xl font-black text-white uppercase leading-tight tracking-wide"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.7)" }}
                >
                  {selectedVerse.verse.text}
                </p>

                {/* Ornament divider */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-10 bg-amber-400/50" />
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-70">
                    <circle cx="5" cy="5" r="2" fill="#D6B072" />
                    <circle cx="5" cy="5" r="4.5" stroke="#D6B072" strokeWidth="0.5" />
                  </svg>
                  <div className="h-[1px] w-10 bg-amber-400/50" />
                </div>

                {/* Reference */}
                <p
                  className="text-sm font-bold tracking-[0.3em] uppercase text-amber-400"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.95)" }}
                >
                  {selectedVerse.verse.ref}
                </p>

                {/* Watermark */}
                <p className="absolute bottom-6 text-[9px] uppercase tracking-[0.35em] text-white/25 font-sans">
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
                className="flex items-center gap-2 bg-amber-400 text-black px-5 py-2.5 rounded-full font-black hover:scale-105 transition-transform disabled:opacity-50 text-sm shadow-[0_0_20px_rgba(214,176,114,0.35)]"
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
