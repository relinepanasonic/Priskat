"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, Heart, Moon, Sparkles, Sun, Volume2, VolumeX } from "lucide-react";
import type { SaintStory } from "@/lib/katakombe";
import ActivityTimer from "@/components/home/ActivityTimer";

const serif = { fontFamily: "'Lora', Georgia, serif" };
const THEME_KEY = "saint-reader-theme";

/**
 * Novel-style biography reader for Santo & Santa:
 *   - Warm paper book mode (matching the Ruang Iman Bible reader) + Dark mode toggle
 *   - Adjustable reading font size (A- / A+)
 *   - Drop-cap opening, chapter ornaments, pull quote, Teladan Hidup & Doa Penutup
 *   - Built-in Read-Aloud (Dengarkan) button
 */
export default function SaintNovelReader({
  story,
  backHref,
  dateLabel,
  refId,
}: {
  story: SaintStory;
  backHref: string;
  dateLabel?: string | null;
  refId: string;
}) {
  const [paper, setPaper] = useState(true);
  const [fontSize, setFontSize] = useState(17);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark") setPaper(false);
    } catch { /* ignore */ }
    return () => {
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    };
  }, []);

  function toggleTheme() {
    setPaper((p) => {
      const next = !p;
      try { localStorage.setItem(THEME_KEY, next ? "paper" : "dark"); } catch { /* ignore */ }
      return next;
    });
  }

  const totalWords = useMemo(
    () => story.chapters.reduce((acc, c) => acc + c.paragraphs.join(" ").split(/\s+/).length, 0),
    [story.chapters],
  );
  const readMins = Math.max(1, Math.round(totalWords / 180));

  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const fullText = [
      story.title,
      story.subtitle ?? "",
      ...story.chapters.flatMap((c) => [c.title, ...c.paragraphs]),
      story.reflection ? `Teladan hidup. ${story.reflection}` : "",
      story.prayer ? `Doa penutup. ${story.prayer}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = "id-ID";
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        paper ? "paper text-[#2b2117]" : "bg-[#121417] text-[#EAE5D9]"
      }`}
    >
      <ActivityTimer kind="reading" refId={refId} seconds={15} />

      {/* Top Reader Toolbar */}
      <div
        className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-md ${
          paper
            ? "paper-bar border-[#d8cbb2] text-[#3a2d1f]"
            : "border-white/10 bg-[#14171c]/90 text-white"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link
            href={backHref}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
              paper ? "text-[#5c4732] hover:text-[#1f160e]" : "text-brand-muted hover:text-white"
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Para Kudus
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleReadAloud}
              title={speaking ? "Hentikan bacaan" : "Dengarkan kisah"}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                speaking
                  ? "border-brand-gold bg-brand-gold text-brand-dark"
                  : paper
                    ? "border-[#cbbba0] bg-white/60 text-[#3a2d1f] hover:bg-white"
                    : "border-white/15 bg-white/5 text-brand-light hover:bg-white/10"
              }`}
            >
              {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{speaking ? "Berhenti" : "Dengarkan"}</span>
            </button>

            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              aria-label="Perkecil huruf"
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                paper ? "border-[#cbbba0] bg-white/60 text-[#3a2d1f]" : "border-white/15 bg-white/5 text-brand-light"
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(23, s + 1))}
              aria-label="Perbesar huruf"
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                paper ? "border-[#cbbba0] bg-white/60 text-[#3a2d1f]" : "border-white/15 bg-white/5 text-brand-light"
              }`}
            >
              A+
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={paper ? "Mode gelap" : "Mode kertas"}
              className={`rounded-full border p-1.5 ${
                paper ? "border-[#cbbba0] bg-white/60 text-[#3a2d1f]" : "border-white/15 bg-white/5 text-brand-gold"
              }`}
            >
              {paper ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Book Page Content */}
      <article className="mx-auto max-w-2xl px-5 pb-28 pt-7 md:px-8 md:pt-10">
        {/* Book Cover / Title Block */}
        <header className="text-center">
          <p
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.26em] ${
              paper ? "text-[#8c6730]" : "text-brand-gold"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Kisah Para Kudus{(story.feastDay || dateLabel) ? ` · ${story.feastDay || dateLabel}` : ""}
          </p>

          <h1
            className={`mt-2.5 text-3xl font-bold leading-tight md:text-4xl ${
              paper ? "text-[#1d150e]" : "text-white"
            }`}
            style={serif}
          >
            {story.title}
          </h1>

          {story.subtitle && (
            <p
              className={`mt-2 text-base italic ${paper ? "text-[#5c4833]" : "text-brand-gold/90"}`}
              style={serif}
            >
              {story.subtitle}
            </p>
          )}

          {/* Metadata pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
            {story.era && (
              <span className={`rounded-full px-3 py-1 ${paper ? "bg-[#e7dcc4] text-[#4d3b27]" : "bg-white/10 text-brand-light"}`}>
                {story.era}
              </span>
            )}
            {story.patronOf && (
              <span className={`rounded-full px-3 py-1 ${paper ? "bg-[#e7dcc4] text-[#4d3b27]" : "bg-brand-gold/15 text-brand-gold"}`}>
                {story.patronOf}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 ${paper ? "bg-[#efe5d0] text-[#6b553b]" : "bg-white/5 text-brand-muted"}`}>
              ~{readMins} menit baca
            </span>
          </div>

          {story.image && (
            <div className="mt-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.image}
                alt={story.title}
                className={`max-h-72 rounded-2xl object-cover shadow-xl ${
                  paper ? "border-4 border-[#e5d8bd]" : "border border-brand-gold/35"
                }`}
              />
            </div>
          )}

          {story.quote && (
            <blockquote
              className={`mx-auto mt-6 max-w-xl rounded-2xl border-l-4 px-5 py-4 text-left italic leading-relaxed ${
                paper
                  ? "border-[#b08642] bg-[#ede2cb]/75 text-[#3b2c1d]"
                  : "border-brand-gold bg-brand-gold/10 text-[#f3ead8]"
              }`}
              style={{ ...serif, fontSize: `${fontSize}px` }}
            >
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}

          <div className={`my-7 text-center text-xs tracking-[0.5em] ${paper ? "text-[#b08642]" : "text-brand-gold/60"}`}>
            ✦ ✦ ✦
          </div>
        </header>

        {/* Chapters */}
        <div className="space-y-8">
          {story.chapters.map((ch, cIdx) => (
            <section key={cIdx} className="space-y-4">
              {ch.title && (
                <h2
                  className={`text-lg font-bold leading-snug md:text-xl ${
                    paper ? "text-[#7a5620]" : "text-brand-gold"
                  }`}
                  style={serif}
                >
                  {ch.title}
                </h2>
              )}
              {ch.paragraphs.map((p, pIdx) => {
                const isFirst = cIdx === 0 && pIdx === 0;
                return (
                  <p
                    key={pIdx}
                    className={`leading-[1.9] ${
                      paper ? "text-[#2c2117]" : "text-[#EAE5D9]"
                    } ${
                      isFirst
                        ? "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] " +
                          (paper ? "first-letter:text-[#8c6730]" : "first-letter:text-brand-gold")
                        : ""
                    }`}
                    style={{ ...serif, fontSize: `${fontSize}px` }}
                  >
                    {p}
                  </p>
                );
              })}
            </section>
          ))}
        </div>

        {/* Teladan Hidup & Doa Penutup */}
        {(story.reflection || story.prayer) && (
          <div className="mt-10 space-y-4">
            {story.reflection && (
              <div
                className={`rounded-2xl border p-5 ${
                  paper
                    ? "border-[#d4c2a1] bg-[#ede2cb]/80 text-[#2f2317]"
                    : "border-brand-gold/30 bg-brand-gold/[0.08] text-[#EAE5D9]"
                }`}
              >
                <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ${paper ? "text-[#8c6730]" : "text-brand-gold"}`}>
                  <Sparkles className="h-3.5 w-3.5" /> Teladan untuk Hari Ini
                </p>
                <p className="mt-2 leading-[1.8]" style={{ ...serif, fontSize: `${Math.max(15, fontSize - 1)}px` }}>
                  {story.reflection}
                </p>
              </div>
            )}

            {story.prayer && (
              <div
                className={`rounded-2xl border p-5 ${
                  paper
                    ? "border-[#c7b089] bg-[#f9f4e8] text-[#2f2317]"
                    : "card-lux text-[#EAE5D9]"
                }`}
              >
                <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ${paper ? "text-[#8c6730]" : "text-brand-gold"}`}>
                  <Heart className="h-3.5 w-3.5" /> Doa Penutup
                </p>
                <p className="mt-2 italic leading-[1.85]" style={{ ...serif, fontSize: `${Math.max(15, fontSize - 1)}px` }}>
                  {story.prayer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Source attribution */}
        <footer className={`mt-10 border-t pt-5 text-center text-[11px] ${paper ? "border-[#d8cbb2] text-[#6b553b]" : "border-white/10 text-brand-muted"}`}>
          Sumber: {story.sourceLabel}
          {story.sourceUrl && (
            <>
              {" · "}
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-semibold ${paper ? "text-[#8c6730]" : "text-brand-gold"}`}
              >
                Buka referensi asli <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </footer>
      </article>
    </div>
  );
}
