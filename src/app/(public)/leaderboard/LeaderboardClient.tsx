"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localDay, weekStart } from "@/lib/activity";
import { CARDS } from "@/lib/gameCatalog";
import { FramedAvatar, NameText } from "@/components/game/Cosmetics";

type Row = { rank: number; user_id: string; name: string; avatar_url: string | null; frame: string | null; name_color: string | null; title: string | null; points: number; is_me: boolean; total_players: number };
const serif = { fontFamily: "'Lora', Georgia, serif" };
const ROW_H = 68;
const MEDAL = ["🥇", "🥈", "🥉"];

// Role models of the faith, shown for inspiration (they are not players and are never ranked)
const TELADAN = CARDS.filter((c) => c.kind === "santo" || c.kind === "maria");
function teladanToday() {
  const d = Math.floor(new Date().setHours(0, 0, 0, 0) / 86_400_000);
  return [0, 1, 2].map((i) => TELADAN[(d * 3 + i) % TELADAN.length]);
}

/** Count a number up (or down) smoothly. */
function useCountTo(target: number, from: number, run: boolean, ms = 1300) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!run) { setV(from); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, from, run, ms]);
  return v;
}

export default function LeaderboardClient({ myId }: { myId: string }) {
  const router = useRouter();
  const [scope, setScope] = useState<"week" | "all">("week");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false); // false = rows still at their old places
  const [prev, setPrev] = useState<{ points: number; rank: number } | null>(null);
  const [round, setRound] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setRows(null);
    setMoved(false);
    setPrev(null);
    (async () => {
      const from = weekStart(localDay());
      const { data, error } = await createClient().rpc("leaderboard_view", { p_scope: scope, p_from: from });
      if (!alive) return;
      if (error) { setFailed(true); setRows([]); return; }
      const list = ((data as Row[]) ?? []).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
      const me = list.find((r) => r.is_me);
      const key = scope === "week" ? `lb-last-week-${from}` : "lb-last-all";
      let before: { points: number; rank: number } | null = null;
      try { before = JSON.parse(localStorage.getItem(key) ?? "null"); } catch { /* ignore */ }
      if (me) { try { localStorage.setItem(key, JSON.stringify({ points: me.points, rank: me.rank })); } catch { /* ignore */ } }
      setRows(list);
      // Climbed since the last visit? Then play the rise
      if (me && before && me.points > before.points) {
        setPrev(before);
        timer.current = window.setTimeout(() => setMoved(true), 900);
      } else {
        setMoved(true);
      }
      setRound((n) => n + 1);
    })();
    return () => { alive = false; window.clearTimeout(timer.current); };
  }, [scope]);

  const me = rows?.find((r) => r.is_me) ?? null;

  // Where each row stands: before the climb my row is placed by my old points
  const order = (() => {
    if (!rows) return new Map<string, number>();
    const list = rows.map((r) => ({ id: r.user_id, pts: !moved && prev && r.is_me ? prev.points : r.points, name: r.name }));
    list.sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
    return new Map(list.map((r, i) => [r.id, i]));
  })();

  const shownPoints = useCountTo(me?.points ?? 0, prev?.points ?? me?.points ?? 0, moved && !!prev);
  const rankUp = prev && me ? Math.max(0, prev.rank - me.rank) : 0;
  const beat = me && me.total_players > 1 ? Math.round(((me.total_players - me.rank) / me.total_players) * 100) : null;
  const teladan = teladanToday();

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col gap-4 bg-gradient-to-b from-[#1b1530] via-[#14171c] to-[#0f1115] p-4 pb-40 md:rounded-3xl md:p-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Beranda</Link>

      <header className="text-center">
        <Trophy className="mx-auto h-10 w-10 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.6)]" />
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-amber-200" style={serif}>Peringkat</h1>
        <p className="text-xs text-brand-muted">Poin doa dari membaca, berdoa, dan tantangan</p>
      </header>

      <div className="mx-auto flex w-full max-w-xs gap-1 rounded-full bg-black/30 p-1">
        {(["week", "all"] as const).map((s) => (
          <button key={s} onClick={() => setScope(s)} className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${scope === s ? "bg-amber-300 text-[#1a1d24]" : "text-brand-muted"}`}>
            {s === "week" ? "Minggu ini" : "Sepanjang masa"}
          </button>
        ))}
      </div>

      {/* Role models of the faith: inspiration, not players */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Teladan iman hari ini · bukan pemain</p>
        <div className="grid grid-cols-3 gap-2">
          {teladan.map((c) => (
            <div key={c.key} className="rounded-xl bg-black/25 p-2 text-center">
              <div className="text-2xl">{c.emoji}</div>
              <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-tight text-amber-200">{c.name.replace(/^Santo |^Santa /, "St. ")}</p>
            </div>
          ))}
        </div>
      </section>

      {failed && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Papan peringkat belum aktif. Coba lagi nanti.</p>}
      {rows === null && <div className="h-48 animate-pulse rounded-2xl bg-white/5" />}
      {rows && rows.length === 0 && !failed && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-brand-muted">Belum ada poin {scope === "week" ? "minggu ini" : ""}. Jadilah yang pertama berdoa! 🙏</p>
      )}

      {rankUp > 0 && moved && (
        <div className="lb-rise rounded-2xl border border-emerald-400/40 bg-emerald-500/15 py-2.5 text-center text-sm font-extrabold text-emerald-200">
          🎉 Naik {rankUp} peringkat! Sekarang #{me?.rank}
        </div>
      )}

      {rows && rows.length > 0 && (
        <div key={`${scope}-${round}`} className="relative" style={{ height: rows.length * ROW_H }}>
          {rows.map((r, i) => {
            const idx = order.get(r.user_id) ?? i;
            const rankShown = r.is_me && !moved && prev ? prev.rank : r.rank;
            const pts = r.is_me ? shownPoints : r.points;
            return (
              <div
                key={r.user_id}
                className="absolute inset-x-0"
                style={{ height: ROW_H - 8, transform: `translateY(${idx * ROW_H}px)`, transition: "transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)", zIndex: r.is_me ? 2 : 1 }}
              >
                <div
                  className={`lb-rise flex h-full items-center gap-3 rounded-2xl px-3 shadow-lg ${r.is_me ? `bg-gradient-to-r from-emerald-400 to-green-300 text-[#10261a] ring-2 ring-amber-200/80 ${prev && !moved ? "" : ""} ${prev ? "lb-glow" : ""}` : "bg-[#f6f3ea] text-[#2b2418]"}`}
                  style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                >
                  <span className="w-8 shrink-0 text-center text-lg font-extrabold">{rankShown <= 3 && !r.is_me ? MEDAL[rankShown - 1] : rankShown}</span>
                  <FramedAvatar frame={r.frame} size={38}>
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-200 font-bold text-[#3a2d10]">{r.name?.[0]}</div>
                    )}
                  </FramedAvatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{r.is_me ? "Kamu" : <NameText name={r.name} color={r.name_color} />}</p>
                    {r.title && <p className="truncate text-[10px] font-semibold opacity-70">{r.title}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${r.is_me ? "bg-white/60" : "bg-amber-100"}`}>🙏 {pts}</span>
                  {r.is_me && prev && !moved && (
                    <>
                      <span className="lb-spark pointer-events-none absolute right-12 top-0 text-sm" aria-hidden>✨</span>
                      <span className="lb-spark pointer-events-none absolute right-24 top-1 text-xs" style={{ animationDelay: "0.4s" }} aria-hidden>⭐</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {me && beat !== null && (
        <div className="rounded-2xl bg-black/30 p-4 text-center">
          <p className="text-sm text-brand-light">Kamu mengalahkan <b className="text-amber-300">{beat}%</b> pemain</p>
          <p className="mt-0.5 text-xs text-brand-muted">Terus berdoa dan membaca untuk naik peringkat.</p>
        </div>
      )}
      {rows && rows.length > 0 && !me && (
        <p className="rounded-2xl bg-black/30 p-3 text-center text-xs text-brand-muted">Kamu belum punya poin {scope === "week" ? "minggu ini" : ""}, atau menyembunyikan diri dari peringkat (Koleksi).</p>
      )}

      <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mx-auto w-full max-w-xl px-4 md:static md:px-0">
        <button onClick={() => router.push("/")} className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-200 py-3.5 text-sm font-extrabold text-[#2b2418] shadow-xl active:scale-[0.98]">Lanjut</button>
      </div>
    </div>
  );
}
