"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Gift, Trophy, Crown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LAUNCH_DAY, DAY_LABELS, addDays, levelFor, localDay, weekStart } from "@/lib/activity";
import { recordStreakCheckIn } from "@/lib/streak";
import TebusHariDialog from "./TebusHariDialog";
import LootDialog from "@/components/game/LootDialog";

type Row = { day: string; kind: string; points: number; redeemed_on: string | null };
type State = "prayed" | "redeemed" | "missed" | "today" | "future";

const MAX_REDEEMS_PER_WEEK = 2;

/** Opens the Tebus Hari dialog once per day, the first time the app is opened. */
function OpenOncePerDay({ day, onOpen }: { day: string; onOpen: () => void }) {
  useEffect(() => {
    const key = "tebus-asked-" + day;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch { /* ignore */ }
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);
  return null;
}

/**
 * The weekly prayer game on Beranda: 7 flames (Monday to Sunday) lit by what the person actually
 * prayed or read. A missed day of the last 3 can be redeemed ("Tebus Hari") with one prayer.
 * If the database part (094 SQL) isn't there yet, it falls back to the old "opened the app" flames.
 */
export default function HomeStreak({ isEn, createdAt }: { isEn: boolean; createdAt?: string | null }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [legacy, setLegacy] = useState<number | null>(null);
  const [tebus, setTebus] = useState<string | null>(null);
  const [lootOpen, setLootOpen] = useState(false);
  const [lootClaimed, setLootClaimed] = useState<boolean | null>(null);
  const today = localDay();

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("daily_activity" as any)
      .select("day, kind, points, redeemed_on")
      .gte("day", addDays(today, -60))
      .order("day", { ascending: false });
    if (error) {
      setLegacy(recordStreakCheckIn().currentStreak);
      return;
    }
    setRows((data as unknown as Row[]) ?? []);
    const { data: lc } = await supabase.from("loot_claims" as any).select("day").eq("day", today).maybeSingle();
    setLootClaimed(!!lc);
    const { data: t } = await supabase.rpc("my_total_points");
    setTotal(typeof t === "number" ? t : 0);
  }, [today]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const h = () => void load();
    window.addEventListener("activity-recorded", h);
    return () => window.removeEventListener("activity-recorded", h);
  }, [load]);

  // Old behaviour until the database part exists
  if (legacy !== null) {
    const lit = ((legacy - 1) % 7) + 1;
    return (
      <div className="rounded-[20px] border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">{isEn ? "7-day prayer streak" : "7 hari berdoa berturut-turut"}</span>
          <span className="text-xs font-bold text-amber-200">{legacy} {isEn ? "days" : "hari"}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Flame key={i} className={`h-7 w-7 ${i < lit ? "fill-amber-400 text-amber-300" : "fill-transparent text-white/20"}`} />
          ))}
        </div>
      </div>
    );
  }
  if (rows === null) return <div className="h-[132px]" aria-hidden />;

  // ── Weekly states ────────────────────────────────────────────────────────
  const dayState = (day: string): State => {
    const mine = rows.filter((r) => r.day === day);
    if (mine.some((r) => r.kind !== "redeem" && r.kind !== "loot" && r.kind !== "campaign")) return "prayed";
    if (mine.some((r) => r.kind === "redeem")) return "redeemed";
    if (day === today) return "today";
    return day < today ? "missed" : "future";
  };
  const start = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    return { day, label: DAY_LABELS[i], state: dayState(day) };
  });
  const weekPoints = rows.filter((r) => r.day >= start && r.day <= addDays(start, 6)).reduce((n, r) => n + r.points, 0);
  const daysDone = week.filter((w) => w.state === "prayed" || w.state === "redeemed").length;

  // Streak: consecutive done days ending today (or yesterday if today isn't done yet)
  let streak = 0;
  let cursor = dayState(today) === "prayed" || dayState(today) === "redeemed" ? today : addDays(today, -1);
  while (cursor >= addDays(today, -60)) {
    const st = dayState(cursor);
    if (st === "prayed" || st === "redeemed") { streak += 1; cursor = addDays(cursor, -1); } else break;
  }

  // Missed days that can still be redeemed: last 3 days, after the game began and after the account existed
  const created = createdAt ? localDay(new Date(createdAt)) : LAUNCH_DAY;
  const usedThisWeek = rows.filter((r) => r.kind === "redeem" && r.redeemed_on && r.redeemed_on >= start).length;
  const redeemable = [1, 2, 3]
    .map((n) => addDays(today, -n))
    .filter((d) => d >= LAUNCH_DAY && d > created && dayState(d) === "missed");
  const canRedeem = redeemable.length > 0 && usedThisWeek < MAX_REDEEMS_PER_WEEK;
  const target = redeemable[0]; // the most recent missed day

  const { level, next } = levelFor(total);

  return (
    <>
      <div className="rounded-[20px] border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">{isEn ? "Prayer this week" : "Doa minggu ini"}</span>
          <span className="text-xs font-bold text-amber-200">{daysDone}/7 {isEn ? "days" : "hari"} · {weekPoints} poin</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          {week.map((w) => (
            <div key={w.day} className="flex flex-col items-center gap-1">
              <Flame
                className={`h-7 w-7 transition-all ${
                  w.state === "prayed" ? "fill-amber-400 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  : w.state === "redeemed" ? "fill-violet-400 text-violet-300 drop-shadow-[0_0_6px_rgba(167,139,250,0.55)]"
                  : w.state === "today" ? "animate-pulse fill-transparent text-amber-300/70"
                  : w.state === "missed" ? "fill-transparent text-white/15"
                  : "fill-transparent text-white/20"
                }`}
              />
              <span className={`text-[10px] font-semibold ${w.state === "prayed" ? "text-amber-300" : w.state === "redeemed" ? "text-violet-300" : w.day === today ? "text-amber-200" : "text-white/30"}`}>{w.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-amber-100/80">
          <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-amber-300" /> {level.name}{next ? ` · ${next.min - total} poin lagi` : ""}</span>
          <span>{streak > 0 ? `${streak} ${isEn ? "day streak" : "hari berturut-turut"}` : isEn ? "Pray today to start" : "Berdoa hari ini untuk mulai"}</span>
        </div>

        {daysDone === 7 && <p className="mt-2 text-center text-[11px] font-semibold text-amber-200">🌟 Seminggu penuh! Tuhan memberkatimu.</p>}

        {dayState(today) === "prayed" && lootClaimed === false && (
          <button
            onClick={() => setLootOpen(true)}
            className="mt-3 flex w-full animate-pulse items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/15 px-3 py-2.5 text-xs font-bold text-amber-100 transition active:scale-[0.98]"
          >
            <Gift className="h-4 w-4 text-amber-300" /> Berkat Harian siap dibuka
          </button>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-amber-100/90">
          <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 px-2 py-2"><Crown className="h-4 w-4 text-amber-300" />Peringkat</Link>
          <Link href="/campaigns" className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 px-2 py-2"><Sparkles className="h-4 w-4 text-amber-300" />Kampanye</Link>
          <Link href="/profile/koleksi" className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 px-2 py-2"><Trophy className="h-4 w-4 text-amber-300" />Koleksi</Link>
        </div>

        {canRedeem && (
          <button
            onClick={() => setTebus(target)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/15 px-3 py-2.5 text-xs font-bold text-violet-100 transition active:scale-[0.98]"
          >
            <Flame className="h-4 w-4 fill-violet-400 text-violet-300" />
            {isEn ? "Redeem a missed day" : "Tebus Hari"} · {new Date(target + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long" })} terlewat
          </button>
        )}
      </div>

      {canRedeem && <OpenOncePerDay day={today} onOpen={() => setTebus(target)} />}
      {lootOpen && <LootDialog onClose={() => setLootOpen(false)} onDone={() => { setLootOpen(false); setLootClaimed(true); void load(); }} />}
      {tebus && (
        <TebusHariDialog
          missedDay={tebus}
          onClose={() => setTebus(null)}
          onDone={() => { setTebus(null); void load(); }}
        />
      )}
    </>
  );
}
