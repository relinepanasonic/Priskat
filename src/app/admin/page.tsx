import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  Globe,
  HandHeart,
  MessageSquare,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Tent,
  TrendingUp,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";

export const dynamic = "force-dynamic";

type Milestone = {
  id: string;
  platform: string;
  title: string;
  version_tag: string | null;
  progress_pct: number;
  status: "planned" | "in_progress" | "live";
  notes: string | null;
};

type FinanceRow = {
  id: string;
  entry_date: string;
  entry_type: "donation" | "income" | "expense";
  donor_name: string | null;
  category: string;
  amount: number;
  payment_method: string;
};

const FALLBACK_MILESTONES: Milestone[] = [
  { id: "m1", platform: "website", title: "Ruang Iman Web App (apps.ruangiman.com)", version_tag: "v2.4 Live", progress_pct: 92, status: "live", notes: "Beranda, Spiritual, Komunitas, Warta, Marketplace & Dual Language ID/EN" },
  { id: "m2", platform: "android", title: "Android Play Store App (com.ruangiman.app)", version_tag: "v2.4 · Build 12", progress_pct: 88, status: "live", notes: "Rich Push Notifications, Full-Screen Splash, Native Bridge" },
  { id: "m3", platform: "community_center", title: "Community Center (communitycenter.ruangiman.com)", version_tag: "v2.0 Live", progress_pct: 90, status: "live", notes: "Multi-community management, Events, Albums, QR Attendance" },
  { id: "m4", platform: "seller_center", title: "Seller Center (sellercenter.ruangiman.com)", version_tag: "v1.0", progress_pct: 45, status: "in_progress", notes: "Shopee-style backoffice for UMKM & Store Owners" },
  { id: "m5", platform: "admin_erp", title: "Ruang Iman Admin ERP (admin.ruangiman.com)", version_tag: "v1.0 Live", progress_pct: 85, status: "live", notes: "Executive Dashboard, Operations Hub, Donations Accounting" },
  { id: "m6", platform: "ios", title: "iOS App Store Build", version_tag: "Planned", progress_pct: 15, status: "planned", notes: "Capacitor iOS packaging & Apple Developer release" },
];

const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

export default async function AdminDashboard() {
  const supabase = (await createClient()) as any;
  const lang = await getLanguage();
  const isEn = lang === "en";

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [
    membersRes,
    newMembersRes,
    communitiesRes,
    eventsRes,
    postsRes,
    storesRes,
    productsRes,
    milestonesRes,
    financeRes,
    communityListRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("communities").select("id", { count: "exact", head: true }).neq("is_hidden", true),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("community_posts").select("id", { count: "exact", head: true }),
    supabase.from("marketplace_stores").select("id", { count: "exact", head: true }),
    supabase.from("marketplace_products").select("id", { count: "exact", head: true }),
    supabase.from("erp_platform_milestones").select("*").order("progress_pct", { ascending: false }),
    supabase.from("erp_finance_entries").select("id, entry_date, entry_type, donor_name, category, amount, payment_method").order("entry_date", { ascending: false }).limit(200),
    supabase.from("communities").select("id, name, slug, member_count, logo_url").neq("is_hidden", true).order("created_at", { ascending: true }).limit(8),
  ]);

  const needsErpSql = Boolean(
    (financeRes.error && /erp_finance_entries/i.test(financeRes.error.message ?? "")) ||
    (milestonesRes.error && /erp_platform_milestones/i.test(milestonesRes.error.message ?? ""))
  );

  const milestones: Milestone[] = !milestonesRes.error && milestonesRes.data?.length
    ? (milestonesRes.data as Milestone[])
    : FALLBACK_MILESTONES;

  const financeRows: FinanceRow[] = !financeRes.error && financeRes.data ? (financeRes.data as FinanceRow[]) : [];
  const totalDonations = financeRows
    .filter((f) => f.entry_type === "donation" || f.entry_type === "income")
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const monthDonations = financeRows
    .filter((f) => (f.entry_type === "donation" || f.entry_type === "income") && f.entry_date >= monthStart)
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const totalExpenses = financeRows
    .filter((f) => f.entry_type === "expense")
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const netBalance = totalDonations - totalExpenses;

  const overallProgress = milestones.length
    ? Math.round(milestones.reduce((s, m) => s + m.progress_pct, 0) / milestones.length)
    : 0;

  const kpis = [
    {
      label: isEn ? "Total Users" : "Total Pengguna",
      value: (membersRes.count ?? 0).toLocaleString("id-ID"),
      sub: `+${newMembersRes.count ?? 0} ${isEn ? "last 7 days" : "7 hari terakhir"}`,
      icon: Users,
      href: "/admin/members",
      accent: "text-brand-gold bg-brand-gold/10 border-brand-gold/25",
    },
    {
      label: isEn ? "Communities" : "Komunitas Aktif",
      value: (communitiesRes.count ?? 0).toLocaleString("id-ID"),
      sub: isEn ? "Connected to Community Center" : "Terhubung ke Pusat Komunitas",
      icon: Tent,
      href: "/admin/communities",
      accent: "text-sky-300 bg-sky-500/10 border-sky-500/25",
    },
    {
      label: isEn ? "Marketplace" : "Marketplace",
      value: `${storesRes.count ?? 0} ${isEn ? "stores" : "toko"}`,
      sub: `${productsRes.count ?? 0} ${isEn ? "active products" : "produk terdaftar"}`,
      icon: Store,
      href: "/admin/operations",
      accent: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    },
    {
      label: isEn ? "Donations & Income" : "Donasi & Pemasukan",
      value: rupiah(totalDonations),
      sub: `${isEn ? "This month:" : "Bulan ini:"} ${rupiah(monthDonations)}`,
      icon: HandHeart,
      href: "/admin/accounting",
      accent: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    },
  ];

  const communities = (communityListRes.data as { id: string; name: string; slug: string | null; member_count: number | null; logo_url: string | null }[] | null) ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            admin.ruangiman.com
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {isEn ? "Ruang Iman Control Panel" : "Panel Kontrol Ruang Iman"}
          </h1>
          <p className="mt-1 text-xs text-brand-muted md:text-sm">
            {isEn
              ? "Unified ERP overview for website progress, mobile apps, community operations, and ministry accounting."
              : "Ringkasan ERP terpadu untuk progres website, aplikasi mobile, operasional komunitas, dan akuntansi pelayanan."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/accounting"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover"
          >
            <HandHeart className="h-4 w-4" />
            {isEn ? "Record Donation" : "Catat Donasi"}
          </Link>
          <Link
            href="/admin/operations"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-brand-gold/45"
          >
            <Activity className="h-4 w-4 text-brand-gold" />
            {isEn ? "Operations" : "Operasional"}
          </Link>
        </div>
      </div>

      {needsErpSql && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {isEn
            ? "Run supabase/147_admin_erp.sql in Supabase SQL Editor to activate live Donations Accounting & editable Website/App Progress storage."
            : "Jalankan supabase/147_admin_erp.sql di Supabase SQL Editor untuk mengaktifkan penyimpanan Akuntansi Donasi & Progres Website/Aplikasi."}
        </div>
      )}

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-white/10 bg-[#151921] p-5 transition hover:-translate-y-0.5 hover:border-brand-gold/45 hover:bg-[#191e28]"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-brand-gold" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[11px] text-gray-400">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Main 2-Column ERP Grid: Website & Apps Progress + Accounting Snapshot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Website & Mobile Apps Progress (2 cols) */}
        <section className="rounded-2xl border border-white/10 bg-[#151921] p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Globe className="h-4 w-4 text-brand-gold" />
                {isEn ? "Website & Mobile Apps Progress" : "Progres Website & Aplikasi"}
              </h2>
              <p className="mt-0.5 text-xs text-brand-muted">
                {isEn ? `Overall ecosystem readiness: ${overallProgress}%` : `Kesiapan ekosistem keseluruhan: ${overallProgress}%`}
              </p>
            </div>
            <Link
              href="/admin/operations"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:underline"
            >
              {isEn ? "Update progress" : "Kelola progres"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {milestones.map((m) => {
              const isMobile = m.platform === "android" || m.platform === "ios";
              const badgeStyle =
                m.status === "live"
                  ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                  : m.status === "in_progress"
                  ? "border-amber-500/35 bg-amber-500/15 text-amber-300"
                  : "border-white/15 bg-white/5 text-gray-400";
              const statusLabel =
                m.status === "live"
                  ? "Live"
                  : m.status === "in_progress"
                  ? (isEn ? "In Progress" : "Berjalan")
                  : (isEn ? "Planned" : "Rencana");
              return (
                <div key={m.id} className="rounded-xl border border-white/5 bg-[#0f1217] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isMobile ? (
                        <Smartphone className="h-4 w-4 text-brand-gold" />
                      ) : (
                        <Globe className="h-4 w-4 text-brand-gold" />
                      )}
                      <span className="text-xs font-bold text-white sm:text-sm">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.version_tag && (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-brand-light">
                          {m.version_tag}
                        </span>
                      )}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-gold to-amber-300 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, m.progress_pct))}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-mono text-xs font-bold text-brand-gold">{m.progress_pct}%</span>
                  </div>
                  {m.notes && <p className="mt-1.5 text-[11px] text-brand-muted">{m.notes}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Accounting Snapshot + Operational Pulse */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                {isEn ? "Ministry Finance" : "Keuangan Pelayanan"}
              </h2>
              <Link href="/admin/accounting" className="text-xs font-bold text-brand-gold hover:underline">
                {isEn ? "Open Ledger" : "Buka Buku Kas"}
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[11px] text-emerald-300/80">{isEn ? "Total Donations Received" : "Total Donasi Diterima"}</p>
                <p className="mt-0.5 text-xl font-bold text-white">{rupiah(totalDonations)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
                  <p className="text-[10px] text-brand-muted">{isEn ? "This Month" : "Bulan Ini"}</p>
                  <p className="mt-0.5 text-sm font-bold text-brand-gold">{rupiah(monthDonations)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f1217] p-3">
                  <p className="text-[10px] text-brand-muted">{isEn ? "Net Balance" : "Saldo Bersih"}</p>
                  <p className="mt-0.5 text-sm font-bold text-white">{rupiah(netBalance)}</p>
                </div>
              </div>
              {financeRows.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {isEn ? "Latest Entries" : "Transaksi Terbaru"}
                  </p>
                  {financeRows.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-[#0f1217] px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{r.donor_name || r.category}</p>
                        <p className="text-[10px] text-brand-muted">{r.entry_date} · {r.payment_method}</p>
                      </div>
                      <span className={`shrink-0 font-mono font-bold ${r.entry_type === "expense" ? "text-red-400" : "text-emerald-400"}`}>
                        {r.entry_type === "expense" ? "-" : "+"}{rupiah(Number(r.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              {isEn ? "Activity Pulse" : "Aktivitas Ekosistem"}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
              <Link href="/admin/events" className="rounded-xl border border-white/10 bg-[#0f1217] p-3 hover:border-brand-gold/40">
                <Calendar className="h-4 w-4 text-brand-gold" />
                <p className="mt-2 text-lg font-bold text-white">{eventsRes.count ?? 0}</p>
                <p className="text-[11px] text-brand-muted">{isEn ? "Events" : "Agenda"}</p>
              </Link>
              <Link href="/admin/members" className="rounded-xl border border-white/10 bg-[#0f1217] p-3 hover:border-brand-gold/40">
                <MessageSquare className="h-4 w-4 text-sky-400" />
                <p className="mt-2 text-lg font-bold text-white">{postsRes.count ?? 0}</p>
                <p className="text-[11px] text-brand-muted">{isEn ? "Thoughts" : "Postingan"}</p>
              </Link>
              <Link href="/admin/operations" className="rounded-xl border border-white/10 bg-[#0f1217] p-3 hover:border-brand-gold/40">
                <ShoppingBag className="h-4 w-4 text-amber-300" />
                <p className="mt-2 text-lg font-bold text-white">{productsRes.count ?? 0}</p>
                <p className="text-[11px] text-brand-muted">{isEn ? "Products" : "Produk"}</p>
              </Link>
              <Link href="/admin/communities" className="rounded-xl border border-white/10 bg-[#0f1217] p-3 hover:border-brand-gold/40">
                <Tent className="h-4 w-4 text-emerald-300" />
                <p className="mt-2 text-lg font-bold text-white">{communitiesRes.count ?? 0}</p>
                <p className="text-[11px] text-brand-muted">{isEn ? "Communities" : "Komunitas"}</p>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Connected Communities Strip */}
      <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
        <div className="flex items-center justify-between gap-2 pb-3.5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Tent className="h-4 w-4 text-brand-gold" />
            {isEn ? "Connected Ruang Iman Communities" : "Komunitas Ruang Iman Terhubung"}
          </h2>
          <Link href="/admin/communities" className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:underline">
            {isEn ? "Manage all" : "Kelola semua"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/admin/communities/${c.slug || c.id}`}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f1217] p-3 transition hover:border-brand-gold/45"
            >
              {c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt={c.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                  <Tent className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white group-hover:text-brand-gold">{c.name}</p>
                <p className="text-[11px] text-brand-muted">
                  {c.member_count ?? 0} {isEn ? "members" : "anggota"}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-brand-gold" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
