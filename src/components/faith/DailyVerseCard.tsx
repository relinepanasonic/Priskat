"use client";

import { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { Share2, Download, Check, Loader2 } from "lucide-react";

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
  { text: "The Lord is my light and my salvation—whom shall I fear?", ref: "Psalm 27:1" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled.", ref: "John 14:27" }
];

export const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800", // Leaves & warm light
  "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=800", // Rain on glass
  "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80&w=800", // Field sunset
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800", // Mountains starry
  "https://images.unsplash.com/photo-1436397543931-53064e26bfc6?auto=format&fit=crop&q=80&w=800", // Minimalist desk/clock
];

export default function DailyVerseCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [verse, setVerse] = useState(DAILY_VERSES[0]);
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Pick based on day of year so it changes daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerse(DAILY_VERSES[dayOfYear % DAILY_VERSES.length]);
    setBg(BACKGROUNDS[dayOfYear % BACKGROUNDS.length]);
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    
    try {
      // Small delay to ensure styles are loaded and font is ready
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High res
        cacheBust: true,
      });

      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "daily-verse.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Daily Verse",
          text: verse.ref,
        });
      } else {
        // Fallback: Download if share API not supported (e.g. desktop PC)
        const link = document.createElement("a");
        link.download = "daily-verse.png";
        link.href = dataUrl;
        link.click();
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <div className="w-full flex justify-between items-center mb-3 px-1">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Verse of the Day</h3>
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />)}
          {isSharing ? "Preparing..." : (isCopied ? "Saved!" : "Share")}
        </button>
      </div>

      <div 
        className="w-full relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5] sm:aspect-[16/9] flex items-center justify-center group"
      >
        {/* The actual card that gets converted to image */}
        <div 
          ref={cardRef}
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 sm:p-12 text-center"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 h-full w-full">
            <span className="text-4xl text-brand-gold opacity-80">❝</span>
            <p className="text-2xl sm:text-3xl font-serif text-white font-medium leading-relaxed drop-shadow-md">
              {verse.text}
            </p>
            <div className="h-[1px] w-12 bg-brand-gold/50" />
            <p className="text-sm sm:text-base font-sans font-bold text-brand-gold uppercase tracking-[0.2em] drop-shadow-sm">
              {verse.ref}
            </p>
            
            {/* Watermark for shared image */}
            <p className="absolute bottom-4 opacity-50 text-[10px] uppercase tracking-widest text-white/70 font-sans">
              Priskat CFM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

