"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause, X, ChevronDown, Bookmark, BookmarkCheck, Heart, Type } from "lucide-react";
import { useReadAloud } from "@/lib/readAloud";
import VoicePicker from "./VoicePicker";
import ActivityTimer from "@/components/home/ActivityTimer";
import { ChallengeClaimer } from "@/components/game/BibleChallenge";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA, type BibleBook } from "@/lib/bibleBooks";
import { createClient } from "@/lib/supabase/client";

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
  userId?: string | null;
  initialVerse?: number | null;
}

const WORDS_PER_PAGE = 220;

function splitIntoPages(verses: Verse[]): Verse[][] {
  const pages: Verse[][] = [];
  let currentPage: Verse[] = [];
  let wordCount = 0;

  for (const verse of verses) {
    const words = verse.content.split(" ").length;
    if (verse.type === "title") {
      if (wordCount > WORDS_PER_PAGE / 2) {
        pages.push(currentPage);
        currentPage = [];
        wordCount = 0;
      }
      currentPage.push(verse);
      continue;
    }
    if (wordCount + words > WORDS_PER_PAGE && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      wordCount = 0;
    }
    currentPage.push(verse);
    wordCount += words;
  }
  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}

// ─── PAGE CONTENT ─────────────────────────────────────────────────────────────
function PageContent({
  verses,
  bookName,
  chapter,
  isFirstPage,
  favorites,
  selectedVerse,
  onVerseClick,
  flashVerse,
}: {
  verses: Verse[];
  bookName: string;
  chapter: number;
  isFirstPage: boolean;
  favorites: Set<number>;
  selectedVerse: number | null;
  onVerseClick: (v: Verse) => void;
  flashVerse?: number | null;
}) {
  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-8 lg:p-12 pb-16 lg:pb-20 flex flex-col relative">
      {isFirstPage && (
        <div className="hidden">
          <h2 className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] font-sans">{bookName}</h2>
          <h1 className="text-6xl lg:text-7xl font-bold mt-1 text-black font-serif">{chapter}</h1>
        </div>
      )}
      <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] font-sans">
          {bookName} {chapter}
        </span>
      </div>
      <div
        className="text-[15px] lg:text-[16px] leading-[2] text-[#222] flex-1 mt-4 text-left"
        style={{ fontFamily: "'Lora', Georgia, serif" }}
      >
        {verses.map((v, i) => {
          if (v.type === "title") {
            return (
              <h3 key={i} className="font-extrabold mt-6 mb-3 text-black block font-sans">
                {v.content}
              </h3>
            );
          }

          const isSelected = selectedVerse === v.verse;
          const isFav = favorites.has(v.verse);
          const isFlash = flashVerse === v.verse;

          return (
            // ② Tap a verse to select/highlight it
            <span
              key={i}
              data-verse={v.verse}
              onClick={() => onVerseClick(v)}
              className={`inline cursor-pointer rounded transition-colors duration-700 ${
                isFlash
                  ? "bg-amber-300/80 text-amber-950 ring-2 ring-amber-400"
                  : isSelected
                  ? "bg-yellow-200 text-yellow-900"
                  : isFav
                  ? "bg-amber-100 text-amber-900"
                  : "hover:bg-yellow-50"
              }`}
            >
              <sup className={`font-sans font-bold text-[10px] mr-0.5 ml-1 align-super ${isSelected || isFav ? "text-amber-600" : "text-gray-400"}`}>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookReader({ verses, bookName, bookId, chapter, lang = "en", userId, initialVerse = null }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const pages = splitIntoPages(verses);

  const totalSpreads = Math.ceil(pages.length / 2);
  const totalPages = pages.length;

  // Opened from a search result: start on the page holding that verse and briefly highlight it
  const [pageIndex, setPageIndex] = useState(() => {
    if (initialVerse == null) return 0;
    const i = pages.findIndex((p) => p.some((v) => v.type === "content" && v.verse === initialVerse));
    return i < 0 ? 0 : i;
  });
  const [flashVerse, setFlashVerse] = useState<number | null>(initialVerse);
  useEffect(() => {
    if (initialVerse == null) return;
    const t1 = setTimeout(() => {
      const el = Array.from(document.querySelectorAll<HTMLElement>(`[data-verse="${initialVerse}"]`)).find((e) => e.offsetParent !== null);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150);
    const t2 = setTimeout(() => setFlashVerse(null), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [initialVerse]);
  const spread = Math.floor(pageIndex / 2);

  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);

  // Touch state for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // ── Verse highlight / favourite state ─────────────────────────────────────
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [savingVerse, setSavingVerse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isId = lang === "id";
  const bookLabel = (b: BibleBook) => (isId ? b.name : b.name_en);

  // ── Listen (read aloud) ───────────────────────────────────────────────────
  const readItems = useMemo(
    // The Indonesian text carries Hebrew verse markers like "(41-8)": a voice would say "41 sampai 8",
    // so they are spoken as "Pasal 41 ayat 8" instead
    () => verses.filter((v) => v.type === "content" && v.verse > 0).map((v) => ({
      verse: v.verse,
      text: v.content.replace(/\((\d{1,3})-(\d{1,3})\)\s*/g, (_m: string, c: string, n: string) => (isId ? ` Pasal ${c} ayat ${n}. ` : ` Chapter ${c} verse ${n}. `)),
    })),
    [verses, isId]
  );
  const tts = useReadAloud(readItems, lang, `${bookName} ${isId ? "pasal" : "chapter"} ${chapter}`, { book: bookId, chapter });
  const togglePlay = () => {
    if (tts.playing) { tts.stop(); return; }
    if (!tts.supported) { showToast(isId ? "Fitur dengar butuh versi aplikasi terbaru" : "Listening needs the latest app version"); return; }
    void tts.play(selectedVerse?.verse);
  };

  // Follow the verse being read: scroll it into view (phone) / turn to its page (desktop)
  useEffect(() => {
    if (tts.current == null) return;
    const el = Array.from(document.querySelectorAll<HTMLElement>(`[data-verse="${tts.current}"]`)).find((e) => e.offsetParent !== null);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const page = pages.findIndex((p) => p.some((v) => v.type === "content" && v.verse === tts.current));
    if (page >= 0 && Math.floor(page / 2) !== Math.floor(pageIndex / 2) && window.innerWidth >= 768) setPageIndex(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.current]);

  // ── Text size (phone), remembered per device ─────────────────────────────
  const FONT_SIZES = [16, 18, 20, 23];
  const [fontStep, setFontStep] = useState(1);
  useEffect(() => {
    try { const v = parseInt(localStorage.getItem("bible-font-step") ?? ""); if (v >= 0 && v < FONT_SIZES.length) setFontStep(v); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cycleFont = () => {
    const next = (fontStep + 1) % FONT_SIZES.length;
    setFontStep(next);
    try { localStorage.setItem("bible-font-step", String(next)); } catch { /* ignore */ }
  };
  const highlightVerse = tts.current ?? flashVerse;
  const pickBook = (b: BibleBook) => {
    setShowBookPicker(false);
    if (b.no !== bookId) router.push(`/faith/bible/${b.no}/1`);
  };

  // Load existing favorites for this chapter
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("favorite_verses")
      .select("verse_number")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("chapter", chapter)
      .eq("lang", lang)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((r) => r.verse_number)));
      });
  }, [userId, bookId, chapter, lang]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleVerseClick = useCallback((v: Verse) => {
    setSelectedVerse((prev) => (prev?.verse === v.verse ? null : v));
  }, []);

  const saveToFavorites = async () => {
    if (!selectedVerse || !userId) return;
    setSavingVerse(true);
    const isAlreadySaved = favorites.has(selectedVerse.verse);

    if (isAlreadySaved) {
      await supabase
        .from("favorite_verses")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .eq("chapter", chapter)
        .eq("verse_number", selectedVerse.verse)
        .eq("lang", lang);
      setFavorites((prev) => { const next = new Set(prev); next.delete(selectedVerse.verse); return next; });
      showToast("Dihapus dari Ayat Fav ku");
    } else {
      await supabase.from("favorite_verses").insert({
        user_id: userId,
        book_id: bookId,
        book_name: bookName,
        chapter,
        verse_number: selectedVerse.verse,
        verse_content: selectedVerse.content,
        lang,
      });
      setFavorites((prev) => new Set(prev).add(selectedVerse.verse));
      showToast("✨ Disimpan ke Ayat Fav ku!");
    }

    setSavingVerse(false);
    setSelectedVerse(null);
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNextDesktop = () => {
    if (spread >= totalSpreads - 1 || isAnimating) return;
    setAnimDir("right");
    setIsAnimating(true);
    setTimeout(() => {
      setPageIndex(p => Math.min(totalPages - 1, (Math.floor(p / 2) + 1) * 2));
      setIsAnimating(false);
      setAnimDir(null);
    }, 300);
  };

  const goPrevDesktop = () => {
    if (spread <= 0 || isAnimating) return;
    setAnimDir("left");
    setIsAnimating(true);
    setTimeout(() => {
      setPageIndex(p => Math.max(0, (Math.floor(p / 2) - 1) * 2));
      setIsAnimating(false);
      setAnimDir(null);
    }, 300);
  };

  const goNextMobile = () => {
    if (pageIndex >= totalPages - 1 || isAnimating) return;
    setAnimDir("right");
    setIsAnimating(true);
    setTimeout(() => { setPageIndex(p => p + 1); setIsAnimating(false); setAnimDir(null); }, 250);
  };

  const goPrevMobile = () => {
    if (pageIndex <= 0 || isAnimating) return;
    setAnimDir("left");
    setIsAnimating(true);
    setTimeout(() => { setPageIndex(p => p - 1); setIsAnimating(false); setAnimDir(null); }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDesktop = window.innerWidth >= 768;
      if (e.key === "ArrowRight") isDesktop ? goNextDesktop() : goNextMobile();
      if (e.key === "ArrowLeft") isDesktop ? goPrevDesktop() : goPrevMobile();
      if (e.key === "Escape") setSelectedVerse(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spread, pageIndex, isAnimating]);

  const leftPageIndex = spread * 2;
  const rightPageIndex = spread * 2 + 1;

  const isFavSelected = selectedVerse ? favorites.has(selectedVerse.verse) : false;

  return (
    <div className="min-h-[100dvh] paper-phone flex flex-col items-center justify-start md:py-8 md:px-4 md:pb-32 relative select-none">

      {/* Back Button (desktop) */}
      <div className="hidden md:flex w-full max-w-5xl items-center mb-4">
        <Link href="/faith/bible" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
          <ChevronLeft className="h-4 w-4" />
          <span>{lang === "id" ? "Pustaka" : "Library"}</span>
        </Link>
      </div>

      <ActivityTimer kind="bible" refId={`${bookId}:${chapter}`} seconds={30} />
      <ChallengeClaimer book={bookId} chapter={chapter} />
      {/* ── MOBILE: full-width scrolling reader ── */}
      <div className="md:hidden w-full">
        {/* Sticky bar under the app header */}
        <div style={{ top: 70 }} className="sticky z-30 flex items-center gap-1 border-b border-black/5 paper-bar px-2 py-1.5 backdrop-blur">
          <Link href="/faith/bible" aria-label={isId ? "Pustaka" : "Library"} className="rounded-full p-2 text-gray-500 active:bg-black/5">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <button onClick={() => setShowBookPicker(true)} className="flex min-w-0 flex-1 items-center gap-1 rounded-full px-2 py-1.5 text-left active:bg-black/5">
            <span className="truncate font-sans text-[15px] font-bold text-gray-900">{bookName} {chapter}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
          <button onClick={cycleFont} aria-label={isId ? "Ukuran teks" : "Text size"} className="flex items-center rounded-full px-2.5 py-2 text-gray-600 active:bg-black/5">
            <Type className="h-4 w-4" />
            <span className="ml-0.5 font-sans text-[10px] font-bold">{FONT_SIZES[fontStep]}</span>
          </button>
          <VoicePicker lang={lang} isId={isId} />
          <button
            onClick={togglePlay}
            aria-label={tts.playing ? (isId ? "Berhenti" : "Stop") : (isId ? "Dengarkan" : "Listen")}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${tts.playing ? "bg-amber-500 text-white" : "bg-gray-900 text-white"}`}
          >
            {tts.playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
          </button>
        </div>

        {/* Listening bar */}
        {tts.playing && (
          <div style={{ top: 119 }} className="sticky z-20 flex items-center justify-between gap-2 bg-amber-50 px-4 py-1.5 font-sans text-xs text-amber-900">
            <span>{isId ? "Sedang membacakan" : "Reading"}{tts.current ? ` · ${isId ? "ayat" : "verse"} ${tts.current}` : "…"}</span>
            <div className="flex items-center gap-1.5">
              <VoicePicker lang={lang} isId={isId} className="flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-amber-900" />
              {[0.8, 1, 1.2].map((r) => (
                <button key={r} onClick={() => tts.setRate(r)} className={`rounded-full px-2 py-0.5 ${tts.rate === r ? "bg-amber-500 text-white" : ""}`}>{r}×</button>
              ))}
            </div>
          </div>
        )}

        <article
          className="px-5 pb-40 pt-5 text-[#222]"
          style={{ fontFamily: "'Lora', Georgia, serif", fontSize: FONT_SIZES[fontStep], lineHeight: 1.9 }}
        >
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">{bookName}</p>
          <h1 className="mb-4 text-5xl font-bold text-gray-900">{chapter}</h1>
          {verses.map((v, i) => {
            if (v.type === "title") {
              return <h3 key={i} className="mb-2 mt-6 font-sans text-[0.95em] font-extrabold text-black">{v.content}</h3>;
            }
            const isSelected = selectedVerse?.verse === v.verse;
            const isFav = favorites.has(v.verse);
            const isHi = highlightVerse === v.verse;
            return (
              <span
                key={i}
                data-verse={v.verse}
                onClick={() => handleVerseClick(v)}
                className={`cursor-pointer rounded transition-colors duration-500 ${
                  isHi ? "bg-amber-200 text-amber-950" : isSelected ? "bg-yellow-200 text-yellow-900" : isFav ? "bg-amber-100 text-amber-900" : ""
                }`}
              >
                <sup className={`ml-1 mr-0.5 font-sans text-[0.6em] font-bold ${isSelected || isFav || isHi ? "text-amber-600" : "text-gray-400"}`}>{v.verse}</sup>
                {v.content}{" "}
              </span>
            );
          })}
        </article>

        {/* Floating chapter navigation, above the app's bottom bar */}
        {!selectedVerse && (
          <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/80 px-1.5 py-1 font-sans text-white shadow-xl backdrop-blur">
            {chapter > 1 ? (
              <Link href={`/faith/bible/${bookId}/${chapter - 1}`} aria-label={isId ? "Pasal sebelumnya" : "Previous chapter"} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/15">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : <span className="h-9 w-9" />}
            <button onClick={() => setShowBookPicker(true)} className="px-2 text-sm font-semibold">{isId ? "Pasal" : "Chapter"} {chapter}</button>
            <Link href={`/faith/bible/${bookId}/${chapter + 1}`} aria-label={isId ? "Pasal berikutnya" : "Next chapter"} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/15">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── DESKTOP: Two-page spread ── */}
      <div
        className="hidden md:flex w-full max-w-5xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] rounded-lg overflow-hidden relative"
        style={{ height: "72vh" }}
      >
        {isAnimating && (
          <div
            className={`absolute inset-0 bg-[#f0ead6] z-50 transition-transform duration-300 origin-${animDir === "right" ? "left" : "right"}`}
            style={{ transform: animDir === "right" ? "rotateY(-5deg) scaleX(0.98)" : "rotateY(5deg) scaleX(0.98)", opacity: 0.4 }}
          />
        )}

        {/* Left Page */}
        <div
          className="w-1/2 h-full paper relative cursor-pointer group"
          onClick={goPrevDesktop}
          style={{ boxShadow: "inset -8px 0 20px rgba(0,0,0,0.08)", transform: isAnimating && animDir === "left" ? "translateX(-4px)" : "translateX(0)", transition: "transform 0.3s ease" }}
        >
          {pages[leftPageIndex] ? (
            <PageContent
              flashVerse={highlightVerse}
              verses={pages[leftPageIndex]}
              bookName={bookName}
              chapter={chapter}
              isFirstPage={leftPageIndex === 0}
              favorites={favorites}
              selectedVerse={selectedVerse?.verse ?? null}
              onVerseClick={handleVerseClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm font-serif italic">— end —</div>
          )}
          <div className="absolute bottom-4 left-10 text-gray-400 text-xs font-sans">{leftPageIndex + 1}</div>
        </div>

        {/* Book Spine */}
        <div className="w-8 h-full bg-gradient-to-r from-[#ddd8cc] via-[#efe9d8] to-[#ddd8cc] flex-shrink-0 z-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/10" />
        </div>

        {/* Right Page */}
        <div
          className="w-1/2 h-full paper relative cursor-pointer group"
          onClick={goNextDesktop}
          style={{ boxShadow: "inset 8px 0 20px rgba(0,0,0,0.06)", transform: isAnimating && animDir === "right" ? "translateX(4px)" : "translateX(0)", transition: "transform 0.3s ease" }}
        >
          {pages[rightPageIndex] ? (
            <PageContent
              flashVerse={highlightVerse}
              verses={pages[rightPageIndex]}
              bookName={bookName}
              chapter={chapter}
              isFirstPage={rightPageIndex === 0}
              favorites={favorites}
              selectedVerse={selectedVerse?.verse ?? null}
              onVerseClick={handleVerseClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm font-serif italic">— end —</div>
          )}
          <div className="absolute bottom-4 right-10 text-gray-400 text-xs font-sans">{rightPageIndex < pages.length ? rightPageIndex + 1 : ""}</div>
        </div>

        {spread > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none flex items-center pl-6 z-20">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
              <ChevronLeft className="h-8 w-8 text-black/40" />
            </div>
          </div>
        )}
        {spread < totalSpreads - 1 && (
          <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none flex items-center justify-end pr-6 z-20">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
              <ChevronRight className="h-8 w-8 text-black/40" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls (desktop) */}
      <div className="mt-6 hidden md:flex items-center gap-4">
        <button
          onClick={togglePlay}
          title={tts.playing ? (isId ? "Berhenti" : "Stop") : (isId ? "Dengarkan pasal ini" : "Listen to this chapter")}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all text-white ${tts.playing ? "bg-amber-500" : "bg-white/10 hover:bg-white/20"}`}
        >
          {tts.playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
        </button>
        <VoicePicker lang={lang} isId={isId} dark className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2.5 text-white hover:bg-white/20" />

        <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-2">
          {chapter > 1 ? (
            <Link href={`/faith/bible/${bookId}/${chapter - 1}`} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : <div className="h-8 w-8" />}

          <button
            onClick={() => setShowBookPicker(true)}
            className="flex items-center gap-1 text-white font-sans text-sm font-semibold px-3 py-1 rounded-full hover:bg-white/15 transition-colors"
          >
            {bookName} {chapter}
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          </button>

          <Link href={`/faith/bible/${bookId}/${chapter + 1}`} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Fav button shortcut */}
        <Link href="/profile/favorites" className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-white" title="Ayat Fav ku">
          <Heart className="h-4 w-4" />
        </Link>

        <div className="hidden md:block text-white/40 text-xs font-sans">
          {spread + 1} / {totalSpreads}
        </div>
      </div>

      {/* ── VERSE ACTION POPUP ─────────────────────────────────────────────── */}
      {selectedVerse && (
        <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
          <div className="bg-[#1c1a17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Verse preview */}
            <div className="px-5 pt-4 pb-3">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-sans mb-1">
                {bookName} {chapter}:{selectedVerse.verse}
              </p>
              <p className="text-white/90 text-sm leading-relaxed font-serif line-clamp-3">
                {selectedVerse.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-white/10">
              <button
                onClick={saveToFavorites}
                disabled={savingVerse || !userId}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                  isFavSelected
                    ? "text-amber-400 hover:bg-amber-900/20"
                    : "text-white hover:bg-white/5"
                }`}
              >
                {isFavSelected ? (
                  <><BookmarkCheck className="h-4 w-4" /> Hapus dari Fav</>
                ) : (
                  <><Bookmark className="h-4 w-4" /> Simpan ke Ayat Fav ku</>
                )}
              </button>
              <div className="w-px bg-white/10" />
              <button
                onClick={() => { const v = selectedVerse.verse; setSelectedVerse(null); void tts.play(v); }}
                className="flex items-center justify-center gap-1.5 px-4 text-sm font-semibold text-white hover:bg-white/5"
                title={isId ? "Dengarkan dari ayat ini" : "Listen from here"}
              >
                <Play className="h-4 w-4" fill="currentColor" />
              </button>
              <div className="w-px bg-white/10" />
              <button
                onClick={() => setSelectedVerse(null)}
                className="px-4 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white text-sm px-5 py-3 rounded-full shadow-xl backdrop-blur-sm border border-white/10 transition-all">
          {toast}
        </div>
      )}

      {/* ── BOOK PICKER ───────────────────────────────────────────────────── */}
      {showBookPicker && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => setShowBookPicker(false)}
        >
          <div
            className="mt-auto md:mt-0 md:mx-auto md:my-auto w-full md:max-w-md bg-white md:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{isId ? "Kitab" : "Books"}</h2>
              <button onClick={() => setShowBookPicker(false)} className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {([
                { label: isId ? "Perjanjian Lama" : "Old Testament", books: OLD_TESTAMENT },
                { label: isId ? "Perjanjian Baru" : "New Testament", books: NEW_TESTAMENT },
                { label: isId ? "Deuterokanonika" : "Deuterocanonicals", books: DEUTEROCANONICA },
              ]).map((section) => (
                <div key={section.label}>
                  <p className="px-5 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">{section.label}</p>
                  {section.books.map((b) => {
                    const active = b.no === bookId;
                    return (
                      <button
                        key={b.no}
                        onClick={() => pickBook(b)}
                        className={`w-full text-left px-5 py-3 text-[17px] transition-colors ${active ? "bg-brand-gold/15 text-brand-dark font-semibold" : "text-gray-800 hover:bg-gray-50"}`}
                      >
                        {bookLabel(b)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
