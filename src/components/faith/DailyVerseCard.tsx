"use client";

import { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { Share2, Check, Loader2 } from "lucide-react";

export const DAILY_VERSES = [
  { text: "For I know the plans I have for you... plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures.", ref: "Psalm 23:1-2" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "When the time is right, I, the Lord, will make it happen.", ref: "Isaiah 60:22" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
  { text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.", ref: "Lamentations 3:22-23" },
  { text: "And we know that in all things God works for the good of those who love him.", ref: "Romans 8:28" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "The Lord is my light and my salvation — whom shall I fear?", ref: "Psalm 27:1" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled.", ref: "John 14:27" },
];

// Cinematic landscape photos — dramatic sky, golden horizon, epic atmosphere
export const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=85&w=900", // mountain golden hour fog
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=85&w=900", // dark stormy mountain valley
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=85&w=900", // dramatic mountain peaks sky
  "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?auto=format&fit=crop&q=85&w=900", // desert road epic sunset
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=85&w=900", // dark dramatic snowy mountain
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=85&w=900", // dark golden forest road
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=85&w=900", // dark ocean cliff road
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=85&w=900", // dramatic mountain valley storm
  "https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?auto=format&fit=crop&q=85&w=900", // lone figure cliff sunset
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=85&w=900", // mountain peak sunrise
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=85&w=900", // dark forest path light beam
  "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=85&w=900", // foggy mountain valley
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&q=85&w=900", // dramatic stormy sea cliff
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=85&w=900", // epic night mountain
  "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?auto=format&fit=crop&q=85&w=900", // foggy dark forest road
];

export default function DailyVerseCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [verse, setVerse] = useState(DAILY_VERSES[0]);
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerse(DAILY_VERSES[dayOfYear % DAILY_VERSES.length]);
    setBg(BACKGROUNDS[dayOfYear % BACKGROUNDS.length]);
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0, pixelRatio: 2, cacheBust: true,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "verse.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Daily Verse", text: verse.ref });
      } else {
        const link = document.createElement("a");
        link.download = "verse.png";
        link.href = dataUrl;
        link.click();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <div
        ref={cardRef}
        className="relative w-full aspect-[9/16] sm:aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/85" />
        {/* Vignette: radial dark edges */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />
        {/* Warm golden glow at bottom horizon */}
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(180,120,30,0.18) 0%, transparent 100%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-10 text-center gap-5">
          {/* Book/Source tag */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[1px] w-8 bg-amber-400/60" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 font-sans">Sacred Scripture</span>
            <div className="h-[1px] w-8 bg-amber-400/60" />
          </div>

          {/* Verse text — large, bold hero */}
          <p className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)" }}>
            {verse.text}
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-10 bg-amber-400/50" />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
              <circle cx="6" cy="6" r="2" fill="#D6B072" />
              <circle cx="6" cy="6" r="5" stroke="#D6B072" strokeWidth="0.5" />
            </svg>
            <div className="h-[1px] w-10 bg-amber-400/50" />
          </div>

          {/* Reference — gold, spaced */}
          <p className="text-sm font-bold tracking-[0.25em] uppercase text-amber-400 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            {verse.ref}
          </p>

          {/* Watermark */}
          <p className="absolute bottom-5 text-[9px] uppercase tracking-[0.3em] text-white/30 font-sans">
            Priskat CFM
          </p>
        </div>
      </div>

      {/* Share button below card */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
      >
        {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />)}
        {isSharing ? "Preparing..." : (isCopied ? "Saved!" : "Share Image")}
      </button>
    </div>
  );
}
