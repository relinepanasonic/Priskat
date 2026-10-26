"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localDay } from "@/lib/activity";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bibleBooks";

type Status = { book: number; chapter: number; done: boolean };
const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT].map((b) => [b.no, b]));

async function loadStatus(): Promise<Status | null> {
  const { data, error } = await createClient().rpc("bible_challenge_status", { p_day: localDay() });
  if (error || !data) return null;
  return data as Status;
}

/** Card: today's random Bible chapter, the same for everybody. */
export function BibleChallengeCard({ compact = false }: { compact?: boolean }) {
  const [st, setSt] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    const run = () => loadStatus().then((s) => alive && setSt(s));
    run();
    window.addEventListener("activity-recorded", run);
    return () => { alive = false; window.removeEventListener("activity-recorded", run); };
  }, []);

  if (!st) return null;
  const book = BOOKS.get(st.book);
  if (!book) return null;

  return (
    <Link
      href={`/faith/bible/${st.book}/${st.chapter}`}
      className={`flex items-center gap-3 rounded-[20px] border p-3.5 transition active:scale-[0.99] ${st.done ? "border-emerald-500/30 bg-emerald-500/10" : "border-brand-gold/40 bg-gradient-to-r from-brand-gold/15 to-transparent"} ${compact ? "" : "shadow-lg"}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${st.done ? "bg-emerald-500/20 text-emerald-300" : "bg-brand-gold/20 text-brand-gold"}`}>
        {st.done ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Tantangan Alkitab Hari Ini</span>
        <span className="block truncate text-base font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{book.name} {st.chapter}</span>
        <span className="block text-[11px] text-brand-muted">{st.done ? "Selesai hari ini. Sampai besok!" : "Baca pasal ini sampai selesai · +20 poin"}</span>
      </span>
      {!st.done && <span className="shrink-0 rounded-full bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark">Baca</span>}
    </Link>
  );
}

/** Rendered inside the Bible reader: after reading today's chapter for a while, the challenge is completed. */
export function ChallengeClaimer({ book, chapter }: { book: number; chapter: number }) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    (async () => {
      const st = await loadStatus();
      if (cancelled || !st || st.done || st.book !== book || st.chapter !== chapter) return;
      // a little after the reader has recorded the chapter (30 s of reading)
      let visibleMs = 0;
      let last = Date.now();
      timer = window.setInterval(async () => {
        const now = Date.now();
        if (document.visibilityState === "visible") visibleMs += now - last;
        last = now;
        if (visibleMs < 34_000) return;
        window.clearInterval(timer);
        const { data, error } = await createClient().rpc("claim_bible_challenge", { p_day: localDay() });
        if (!error && typeof data === "number" && data > 0) {
          setToast(`Tantangan Alkitab selesai! +${data} poin 🎉`);
          window.dispatchEvent(new Event("activity-recorded"));
          window.setTimeout(() => setToast(null), 5000);
        }
      }, 1000);
    })();
    return () => { cancelled = true; if (timer) window.clearInterval(timer); };
  }, [book, chapter]);

  if (!toast) return null;
  return (
    <div className="fixed left-1/2 top-20 z-[95] flex -translate-x-1/2 items-center gap-3 rounded-full border border-brand-gold/50 bg-[#1a1d24] px-4 py-2 text-sm font-semibold text-brand-gold shadow-2xl">
      <span>{toast}</span>
      <Link href="/leaderboard" className="rounded-full bg-brand-gold px-2.5 py-1 text-xs font-bold text-brand-dark">Lihat peringkat</Link>
    </div>
  );
}
