"use client";

import { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { Share2, Check, Loader2 } from "lucide-react";

export const DAILY_VERSES = [
  { 
    text_en: "For I know the plans I have for you... plans to prosper you and not to harm you, plans to give you hope and a future.", 
    ref_en: "Jeremiah 29:11",
    text_id: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu... rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.",
    ref_id: "Yeremia 29:11"
  },
  { 
    text_en: "I can do all this through him who gives me strength.", 
    ref_en: "Philippians 4:13",
    text_id: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.",
    ref_id: "Filipi 4:13"
  },
  { 
    text_en: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures.", 
    ref_en: "Psalm 23:1-2",
    text_id: "Tuhan adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau.",
    ref_id: "Mazmur 23:1-2"
  },
  { 
    text_en: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", 
    ref_en: "Joshua 1:9",
    text_id: "Kuatkan dan teguhkanlah hatimu! Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.",
    ref_id: "Yosua 1:9"
  },
  { 
    text_en: "When the time is right, I, the Lord, will make it happen.", 
    ref_en: "Isaiah 60:22",
    text_id: "Aku, TUHAN, akan melaksanakannya dengan segera pada waktunya.",
    ref_id: "Yesaya 60:22"
  },
  { 
    text_en: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", 
    ref_en: "Isaiah 40:31",
    text_id: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya.",
    ref_id: "Yesaya 40:31"
  },
  { 
    text_en: "Trust in the Lord with all your heart and lean not on your own understanding.", 
    ref_en: "Proverbs 3:5",
    text_id: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.",
    ref_id: "Amsal 3:5"
  },
  { 
    text_en: "Cast all your anxiety on him because he cares for you.", 
    ref_en: "1 Peter 5:7",
    text_id: "Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu.",
    ref_id: "1 Petrus 5:7"
  },
  { 
    text_en: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.", 
    ref_en: "Lamentations 3:22-23",
    text_id: "Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi.",
    ref_id: "Ratapan 3:22-23"
  },
  { 
    text_en: "And we know that in all things God works for the good of those who love him.", 
    ref_en: "Romans 8:28",
    text_id: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia.",
    ref_id: "Roma 8:28"
  },
  { 
    text_en: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", 
    ref_en: "Philippians 4:6",
    text_id: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.",
    ref_id: "Filipi 4:6"
  },
  { 
    text_en: "Come to me, all you who are weary and burdened, and I will give you rest.", 
    ref_en: "Matthew 11:28",
    text_id: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.",
    ref_id: "Matius 11:28"
  },
  { 
    text_en: "The Lord is my light and my salvation — whom shall I fear?", 
    ref_en: "Psalm 27:1",
    text_id: "TUHAN adalah terangku dan keselamatanku, kepada siapakah aku harus takut?",
    ref_id: "Mazmur 27:1"
  },
  { 
    text_en: "Let all that you do be done in love.", 
    ref_en: "1 Corinthians 16:14",
    text_id: "Lakukanlah segala pekerjaanmu dalam kasih!",
    ref_id: "1 Korintus 16:14"
  },
  { 
    text_en: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled.", 
    ref_en: "John 14:27",
    text_id: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu. Janganlah gelisah dan gentar hatimu.",
    ref_id: "Yohanes 14:27"
  }
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

export default function DailyVerseCard({ isId = false }: { isId?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use a typed state
  type VerseType = { text_en: string; text_id: string; ref_en: string; ref_id: string };
  const [verse, setVerse] = useState<VerseType>(DAILY_VERSES[0]);
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
        await navigator.share({ files: [file], title: "Daily Verse", text: isId ? verse.ref_id : verse.ref_en });
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
        className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl bg-black"
      >
        {/* Background photo — crushed blacks, desaturated like the reference posters */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg})`,
            filter: "brightness(0.3) saturate(0.5) contrast(1.2)",
          }}
        />
        {/* Cinematic vignette — heavy dark edges */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 10%, rgba(0,0,0,0.78) 75%)" }} />
        {/* Warm amber glow at bottom center — subtle */}
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(160,100,20,0.20) 0%, transparent 65%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 sm:px-14 py-6 text-center gap-4">
          {/* Label */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-amber-500/40" />
            <span className="text-[8px] uppercase tracking-[0.35em] font-sans" style={{ color: "#b8903a" }}>Sacred Scripture</span>
            <div className="h-[1px] w-8 bg-amber-500/40" />
          </div>

          {/* Verse text — cinematic hero */}
          <p
            className="text-lg sm:text-2xl font-black text-white uppercase leading-snug tracking-wide"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,1), 0 0 50px rgba(0,0,0,0.8)" }}
          >
            {isId ? verse.text_id : verse.text_en}
          </p>

          {/* Ornament divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-10 bg-amber-500/40" />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#c9952e" }} />
            <div className="h-[1px] w-10 bg-amber-500/40" />
          </div>

          {/* Reference — muted gold */}
          <p
            className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase"
            style={{ color: "#c9952e", textShadow: "0 1px 8px rgba(0,0,0,1)" }}
          >
            {isId ? verse.ref_id : verse.ref_en}
          </p>

          {/* Watermark */}
          <p className="absolute bottom-3 text-[8px] uppercase tracking-[0.35em] text-white/20 font-sans">
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
