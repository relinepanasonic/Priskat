import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, Images, MapPin, Network, Tent, TrendingUp, UserPlus, Users, Church } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadCommunityMembers } from "@/lib/memberCounts";
import { resolveCommunity } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";
import DashboardCharts, { type Slice } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const tally = (values: (string | null | undefined)[], fallback = "Lainnya"): Slice[] => {
  const m = new Map<string, number>();
  for (const v of values) {
    const k = (v ?? "").toString().trim() || fallback;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export default async function CommunityDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/admin/communities");

  const everyone = isCatholicIndonesia(community.name, community.slug);
  const count = (q: any) => q.then((r: { count: number | null }) => r.count ?? 0);
  const head = { count: "exact" as const, head: true };

  // Members (Catholic Indonesia = every Ruang Iman member)
  const members = await loadCommunityMembers<{ created_at: string; gender: string | null }>(supabase, community, "created_at, gender", { order: { column: "created_at", ascending: true } });

  const [{ data: campRows }, { data: eventRows }, structure, branches, romo, dioceses, photos] = await Promise.all([
    supabase.from("camp_cohorts").select("id, branch, camp_name, start_date").eq("community_id", community.id),
    supabase.from("events").select("event_date, status").eq("community_id", community.id),
    count(supabase.from("community_org_structure").select("id", head).eq("community_id", community.id)),
    count(supabase.from("branches").select("id", head)),
    everyone ? count(supabase.from("clergy" as any).select("user_id", head)) : Promise.resolve(0),
    everyone ? count(supabase.from("dioceses" as any).select("id", head)) : Promise.resolve(0),
    count(supabase.from("community_gallery" as any).select("id", head).eq("community_id", community.id)),
  ]);

  const camps = (campRows as { id: string; branch: string | null; camp_name: string | null; start_date: string | null }[]) ?? [];
  const events = (eventRows as { event_date: string | null; status: string | null }[]) ?? [];
  const campIds = camps.map((c) => c.id);

  const [crewCount, { data: taskRows }] = await Promise.all([
    campIds.length ? count(supabase.from("camp_crew").select("id", head).in("cohort_id", campIds)) : Promise.resolve(0),
    campIds.length ? supabase.from("camp_tasks").select("status").in("cohort_id", campIds) : Promise.resolve({ data: [] as { status: string | null }[] }),
  ]);

  // Member growth, last 6 months
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: d.getFullYear() * 12 + d.getMonth(), label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, joined: 0 };
  });
  let before = 0;
  const windowStart = buckets[0].key;
  for (const m of members) {
    const d = new Date(m.created_at);
    const k = d.getFullYear() * 12 + d.getMonth();
    if (k < windowStart) before++;
    else {
      const b = buckets.find((x) => x.key === k);
      if (b) b.joined++;
    }
  }
  let running = before;
  const growth = buckets.map((b) => ({ label: b.label, joined: b.joined, total: (running += b.joined) }));

  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const newMembers = members.filter((m) => new Date(m.created_at).getTime() >= thirtyDaysAgo).length;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCamps = camps.filter((c) => c.start_date && c.start_date >= today).length;
  const upcomingEvents = events.filter((e) => e.event_date && e.event_date.slice(0, 10) >= today).length;
  const coveredBranches = new Set(camps.map((c) => (c.branch ?? "").trim().toLowerCase()).filter(Boolean)).size;

  const genderLabel = (g: string | null) => (g === "male" ? "Pria" : g === "female" ? "Wanita" : "Belum diisi");
  const statusLabel: Record<string, string> = { draft: "Draf", published: "Terbit", cancelled: "Dibatalkan" };
  const taskLabel: Record<string, string> = { todo: "Belum", in_progress: "Berjalan", done: "Selesai" };

  const stats = [
    { label: "Total anggota", value: members.length, icon: Users, hint: everyone ? "seluruh Ruang Iman" : "di komunitas ini" },
    { label: "Anggota baru", value: newMembers, icon: UserPlus, hint: "30 hari terakhir" },
    { label: "Camp", value: camps.length, icon: Tent, hint: `${upcomingCamps} akan datang` },
    { label: "Panitia camp", value: crewCount, icon: TrendingUp, hint: "total penugasan" },
    { label: "Event", value: events.length, icon: CalendarDays, hint: `${upcomingEvents} akan datang` },
    { label: "Struktur organisasi", value: structure, icon: Network, hint: "posisi terisi" },
    { label: "Coverage", value: coveredBranches, icon: MapPin, hint: `dari ${branches} cabang` },
    ...(everyone
      ? [
          { label: "Romo", value: romo, icon: BadgeCheck, hint: "terdaftar" },
          { label: "Keuskupan", value: dioceses, icon: Church, hint: "di Indonesia" },
          { label: "Foto galeri", value: photos, icon: Images, hint: "diunggah" },
        ]
      : [{ label: "Foto galeri", value: photos, icon: Images, hint: "diunggah" }]),
  ];

  const chartData = {
    growth,
    gender: tally(members.map((m) => genderLabel(m.gender))),
    campsByBranch: tally(camps.map((c) => c.branch)).slice(0, 8),
    campsByType: tally(camps.map((c) => c.camp_name)),
    eventsByStatus: tally(events.map((e) => statusLabel[e.status ?? ""] ?? e.status)),
    tasks: tally(((taskRows as { status: string | null }[]) ?? []).map((t) => taskLabel[t.status ?? ""] ?? t.status)),
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">Dashboard</h2>
        <p className="text-sm text-brand-muted">Ringkasan {community.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#2a2d35] bg-[#14171d] p-4">
            <s.icon className="h-4 w-4 text-brand-gold" />
            <div className="mt-2 text-2xl font-bold text-white">{s.value.toLocaleString("id-ID")}</div>
            <div className="text-xs font-semibold text-[#EAE5D9]">{s.label}</div>
            <div className="text-[10px] uppercase tracking-wider text-brand-muted">{s.hint}</div>
          </div>
        ))}
      </div>

      <DashboardCharts data={chartData} />
    </div>
  );
}
