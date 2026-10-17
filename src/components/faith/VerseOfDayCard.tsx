"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Pause, Play, Share2, Shuffle, CalendarDays } from "lucide-react";
import { BACKGROUNDS } from "./DailyVerseCard";
import { useReadAloud } from "@/lib/readAloud";

type Votd = { book: number; chapter: number; from: number; to: number; reference: string; text: string; day: number };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function VerseOfDayCard({ isId }: { isId: boolean }) {
  const [verse, setVerse] = useState<Votd | null>(null);
  const [random, setRandom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  const load = useCallback(async (rnd: boolean) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/bible/votd?lang=${isId ? "id" : "en"}${rnd ? "&random=1" : ""}`, { cache: rnd ? "no-store" : "default" });
      if (r.ok) { setVerse(await r.json()); setRandom(rnd); }
    } finally {
      setLoading(false);
    }
  }, [isId]);

  useEffect(() => { void load(false); }, [load]);

  const items = useMemo(() => (verse ? [{ verse: verse.from, text: verse.text }] : []), [verse]);
  const tts = useReadAloud(items, isId ? "id" : "en", verse?.reference);
  useEffect(() => { tts.stop(); }, [verse, tts.stop]);

  const bg = BACKGROUNDS[(verse?.day ?? 0) % BACKGROUNDS.length];
  const today = new Date().toLocaleDateString(isId ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long" });

  const share = async () => {
    if (!verse) return;
    const text = `"${verse.text}"\n— ${verse.reference}\n\nRuang Iman`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setShared(true); setTimeout(() => setShared(false), 2000); }
    } catch { /* cancelled */ }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-gold/30 shadow-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/85" />

      <div className="relative p-5 md:p-7">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#121417]">
            {random ? <Shuffle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
            {random ? (isId ? "Ayat acak" : "Random verse") : (isId ? "Ayat hari ini" : "Verse of the day")}
          </span>
          {!random && <span className="truncate text-[11px] text-white/60">{today}</span>}
        </div>

        <div className="min-h-[120px]">
          {loading || !verse ? (
            <div className="mt-5 space-y-2" aria-busy="true">
              <div className="h-4 w-full animate-pulse rounded bg-white/15" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/15" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/15" />
            </div>
          ) : (
            <>
              <p className="mt-5 text-[19px] leading-relaxed text-white drop-shadow md:text-2xl" style={serif}>
                &ldquo;{verse.text}&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-brand-gold">{verse.reference}</p>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => (tts.playing ? tts.stop() : tts.play())}
            disabled={!verse}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/25 disabled:opacity-50"
          >
            {tts.playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
            {tts.playing ? (isId ? "Berhenti" : "Stop") : (isId ? "Dengarkan" : "Listen")}
          </button>
          {verse && (
            <Link
              href={`/faith/bible/${verse.book}/${verse.chapter}?ayat=${verse.from}`}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/25"
            >
              <BookOpen className="h-3.5 w-3.5" /> {isId ? "Baca pasal" : "Read chapter"}
            </Link>
          )}
          <button onClick={share} disabled={!verse} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/25 disabled:opacity-50">
            <Share2 className="h-3.5 w-3.5" /> {shared ? (isId ? "Disalin" : "Copied") : (isId ? "Bagikan" : "Share")}
          </button>
          <button
            onClick={() => void load(true)}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-brand-gold/50 px-3.5 py-2 text-xs font-semibold text-brand-gold hover:bg-brand-gold/10"
          >
            <Shuffle className="h-3.5 w-3.5" /> {isId ? "Acak" : "Shuffle"}
          </button>
          {random && (
            <button onClick={() => void load(false)} className="text-xs text-white/70 underline underline-offset-4 hover:text-white">
              {isId ? "Ayat hari ini" : "Today's verse"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
