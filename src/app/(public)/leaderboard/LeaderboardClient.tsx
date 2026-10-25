"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localDay, weekStart } from "@/lib/activity";
import { FramedAvatar, NameText } from "@/components/game/Cosmetics";

type Row = { rank: number; user_id: string; name: string; avatar_url: string | null; frame: string | null; name_color: string | null; title: string | null; points: number };
const serif = { fontFamily: "'Lora', Georgia, serif" };
const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardClient({ myId }: { myId: string }) {
  const [scope, setScope] = useState<"week" | "all">("week");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<{ rank: number; points: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setRows(null);
    (async () => {
      const supabase = createClient();
      const from = weekStart(localDay());
      const [{ data, error }, { data: me }] = await Promise.all([
        supabase.rpc("leaderboard", { p_scope: scope, p_from: from }),
        supabase.rpc("my_rank", { p_scope: scope, p_from: from }),
      ]);
      if (!alive) return;
      if (error) { setFailed(true); setRows([]); return; }
      setRows((data as Row[]) ?? []);
      const m = (me as { rank: number; points: number }[] | null)?.[0];
      setMine(m ?? null);
    })();
    return () => { alive = false; };
  }, [scope]);

  const inList = rows?.some((r) => r.user_id === myId);

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 p-4 pb-32 md:p-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Beranda</Link>
      <header>
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold"><Crown className="h-4 w-4" /> Papan Peringkat</p>
        <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>Siapa yang paling setia berdoa</h1>
        <p className="mt-1 text-xs text-brand-muted">Peringkat memakai poin doa. Kamu bisa menyembunyikan diri di halaman Koleksi.</p>
      </header>

      <div className="flex gap-2">
        {(["week", "all"] as const).map((s) => (
          <button key={s} onClick={() => setScope(s)} className={`flex-1 rounded-full py-2 text-sm font-semibold ${scope === s ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted"}`}>
            {s === "week" ? "Minggu ini" : "Sepanjang masa"}
          </button>
        ))}
      </div>

      {failed && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Papan peringkat belum aktif. Coba lagi nanti.</p>}
      {rows === null && <div className="h-40 animate-pulse rounded-2xl bg-white/5" />}
      {rows && rows.length === 0 && !failed && <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-8 text-center text-sm text-brand-muted">Belum ada poin {scope === "week" ? "minggu ini" : ""}. Jadilah yang pertama berdoa.</p>}

      <div className="space-y-2">
        {rows?.map((r) => (
          <div key={r.user_id} className={`flex items-center gap-3 rounded-2xl border p-3 ${r.user_id === myId ? "border-brand-gold/60 bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"}`}>
            <span className="w-8 text-center text-lg font-bold text-brand-gold">{r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}</span>
            <FramedAvatar frame={r.frame} size={40}>
              {r.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-gold/20 font-bold text-brand-gold">{r.name?.[0]}</div>
              )}
            </FramedAvatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold"><NameText name={r.name} color={r.name_color} className="text-white" /></p>
              {r.title && <p className="truncate text-[11px] font-semibold text-brand-gold">{r.title}</p>}
            </div>
            <span className="shrink-0 text-sm font-bold text-amber-300">{r.points} poin</span>
          </div>
        ))}
      </div>

      {mine && !inList && (
        <div className="rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-3 text-center text-sm text-brand-light">
          Posisimu: <b className="text-brand-gold">#{mine.rank}</b> dengan {mine.points} poin
        </div>
      )}
    </div>
  );
}
