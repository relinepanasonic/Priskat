import { Crown, Medal, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { badgeByKey } from "@/lib/gameCatalog";
import { FramedAvatar, NameText } from "@/components/game/Cosmetics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wall of Fame" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

type Person = {
  id: string; full_name: string | null; nama_panggilan: string | null; avatar_url: string | null;
  equipped_frame: string | null; equipped_name_color: string | null; equipped_title: string | null; show_on_leaderboard: boolean | null;
};
type Top = { rank: number; user_id: string; name: string; avatar_url: string | null; frame: string | null; name_color: string | null; title: string | null; points: number };

const PCOLS = "id, full_name, nama_panggilan, avatar_url, equipped_frame, equipped_name_color, equipped_title, show_on_leaderboard";
const ago = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? "hari ini" : d === 1 ? "kemarin" : `${d} hari lalu`;
};

/** Wall of Fame: this week's top prayers, the newest badges, and the highest ranks reached. */
export default async function WallOfFamePage() {
  const supabase = await createClient();

  // Monday of this week in Jakarta time
  const j = new Date(Date.now() + 7 * 3600_000);
  const monday = new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - ((j.getUTCDay() + 6) % 7))).toISOString().slice(0, 10);

  const [{ data: top }, { data: recent }, { data: hall }] = await Promise.all([
    supabase.rpc("leaderboard_view", { p_scope: "week", p_from: monday }),
    supabase.from("user_badges" as any).select(`badge_key, earned_at, profile:profiles!user_id(${PCOLS})`).order("earned_at", { ascending: false }).limit(40),
    supabase.from("user_badges" as any).select(`badge_key, earned_at, profile:profiles!user_id(${PCOLS})`).in("badge_key", ["ladder_murid", "ladder_saksi", "ladder_pendoa"]).order("earned_at", { ascending: false }).limit(30),
  ]);

  const podium = (((top as Top[]) ?? []).filter((r) => r.rank <= 3)).slice(0, 5);
  const visible = (rows: any[] | null) => ((rows ?? []) as { badge_key: string; earned_at: string; profile: Person | null }[]).filter((r) => r.profile && r.profile.show_on_leaderboard !== false);
  const recentBadges = visible(recent as any[]).slice(0, 12);
  const hallRows = visible(hall as any[]).slice(0, 12);
  const nm = (p: Person) => p.nama_panggilan || p.full_name || "Anggota";

  const Avatar = ({ p, size = 40 }: { p: Person; size?: number }) => (
    <FramedAvatar frame={p.equipped_frame} size={size}>
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand-gold/20 font-bold text-brand-gold">{nm(p)[0]}</div>
      )}
    </FramedAvatar>
  );

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header>
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold"><Crown className="h-4 w-4" /> Wall of Fame</p>
        <h2 className="mt-1 text-2xl font-bold text-white" style={serif}>Teladan doa komunitas</h2>
        <p className="mt-1 text-sm text-brand-muted">Mereka yang setia berdoa, membaca Firman, dan menyelesaikan tantangan.</p>
      </header>

      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-muted">Pendoa minggu ini</h3>
        {podium.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-6 text-center text-sm text-brand-muted">Belum ada poin minggu ini. Jadilah yang pertama! 🙏</p>
        ) : (
          <div className="space-y-2">
            {podium.map((r) => (
              <div key={r.user_id} className="flex items-center gap-3 rounded-2xl border border-brand-gold/30 bg-gradient-to-r from-brand-gold/10 to-transparent p-3">
                <span className="w-8 text-center text-2xl">{["🥇", "🥈", "🥉"][r.rank - 1] ?? r.rank}</span>
                <FramedAvatar frame={r.frame} size={44}>
                  {r.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-gold/20 font-bold text-brand-gold">{r.name?.[0]}</div>
                  )}
                </FramedAvatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold"><NameText name={r.name} color={r.name_color} className="text-white" /></p>
                  {r.title && <p className="truncate text-[11px] font-semibold text-brand-gold">{r.title}</p>}
                </div>
                <span className="text-sm font-bold text-amber-300">🙏 {r.points}</span>
              </div>
            ))}
          </div>
        )}
        <a href="/leaderboard" className="mt-3 block text-center text-xs font-semibold text-brand-gold underline underline-offset-4">Lihat seluruh peringkat</a>
      </section>

      {hallRows.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-muted"><Medal className="h-3.5 w-3.5" /> Puncak tangga doa</h3>
          <div className="grid grid-cols-2 gap-2">
            {hallRows.map((r, i) => {
              const b = badgeByKey(r.badge_key);
              return (
                <div key={`${r.profile!.id}-${r.badge_key}-${i}`} className="flex flex-col items-center rounded-2xl border border-[#2a2d35] bg-[#14171c] p-3 text-center">
                  <Avatar p={r.profile!} size={52} />
                  <p className="mt-2 w-full truncate text-sm font-bold"><NameText name={nm(r.profile!)} color={r.profile!.equipped_name_color} className="text-white" /></p>
                  <p className="text-[11px] font-bold text-brand-gold">{b?.emoji} {b?.name}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-muted"><Sparkles className="h-3.5 w-3.5" /> Lencana terbaru</h3>
        {recentBadges.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-6 text-center text-sm text-brand-muted">Lencana pertama akan muncul di sini.</p>
        ) : (
          <div className="space-y-2">
            {recentBadges.map((r, i) => {
              const b = badgeByKey(r.badge_key);
              return (
                <div key={`${r.profile!.id}-${r.badge_key}-${i}`} className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-3">
                  <Avatar p={r.profile!} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold"><NameText name={nm(r.profile!)} color={r.profile!.equipped_name_color} className="text-white" /></p>
                    <p className="truncate text-xs text-brand-muted">{b?.emoji} {b?.name ?? r.badge_key}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-brand-muted">{ago(r.earned_at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
