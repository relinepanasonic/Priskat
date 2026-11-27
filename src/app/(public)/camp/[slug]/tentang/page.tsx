import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, Church, Users, MapPin, BadgeCheck, CalendarDays, ExternalLink, Globe, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Tent } from "lucide-react";
import { countCommunityMembers } from "@/lib/memberCounts";
import { formatDate } from "@/lib/utils";
import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import { ABOUT_FALLBACK, isCatholicIndonesia } from "@/lib/catholicIndonesia";
import JoinCommunityButton, { type JoinStatus } from "@/components/community/JoinCommunityButton";
import ShareCommunityButton from "@/components/community/ShareCommunityButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRuangImanCommunity, resolveCommunity } from "@/lib/community";
import { getLanguage } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Use admin client so unauthenticated link-preview crawlers (WhatsApp, Telegram, social)
  // always receive the community's own name, tagline and logo even for private communities.
  const db = createAdminClient();
  const comm = await resolveCommunity(db as any, slug);
  const fallbackLogo = "https://apps.ruangiman.com/logo.png";
  if (!comm) {
    return {
      title: "Komunitas",
      openGraph: { title: "Ruang Iman", images: [{ url: fallbackLogo, width: 1000, height: 1000 }] },
    };
  }
  const { data: info } = await db
    .from("communities")
    .select("name, tagline, motto, description, logo_url")
    .eq("id", comm.id)
    .maybeSingle();
  const c = (info ?? {}) as { name?: string; tagline?: string; motto?: string; description?: string; logo_url?: string };
  const title = c.name || comm.name || "Komunitas";
  const description = (c.tagline || c.motto || c.description || `Komunitas ${title} di Ruang Iman`).slice(0, 160);
  const rawLogo = (c.logo_url || "").trim();
  const image = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `https://apps.ruangiman.com${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : fallbackLogo;
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Ruang Iman`,
      description,
      siteName: "Ruang Iman",
      type: "website",
      images: [{ url: image, width: 1000, height: 1000, alt: title }],
    },
    twitter: { card: "summary", title: `${title} — Ruang Iman`, description, images: [image] },
  };
}

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const PILLAR_ICONS = [BookOpen, HandHeart, Church, Users];

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, user, canEdit } = await getCommunityPageContext(slug);
  if (!community) redirect("/camp");

  // Catholic Indonesia is everyone's community: count every Ruang Iman member
  const everyone = isCatholicIndonesia(community.name, community.slug);
  const isRI = isRuangImanCommunity(community.name, community.slug);
  const lang = await getLanguage();
  const isEn = lang === "en";

  const [{ data: info }, { count: members }, { count: romo }, { dioceses }] = await Promise.all([
    supabase.from("communities").select("*").eq("id", community.id).maybeSingle(),
    countCommunityMembers(supabase, community).then((n) => ({ count: n })),
    supabase.from("clergy" as any).select("user_id", { count: "exact", head: true }),
    loadDioceses(supabase),
  ]);

  const c = (info ?? {}) as Record<string, any>;

  // Custom Ruang Iman Website "About" page (not the generic community template)
  if (isRI) {
    const [{ count: totalUsers }, { count: totalCommunities }, { count: totalStores }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("communities").select("id", { count: "exact", head: true }).neq("is_hidden", true),
      (supabase as any).from("marketplace_stores").select("id", { count: "exact", head: true }),
    ]);

    let riJoinStatus: JoinStatus = "none";
    if (user) {
      const [{ data: prof }, { data: ms }, { data: req }] = await Promise.all([
        supabase.from("profiles").select("community_id").eq("id", user.id).maybeSingle(),
        supabase.from("community_memberships" as any).select("community_id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle(),
        supabase.from("community_join_requests").select("id").eq("user_id", user.id).eq("community_id", community.id).eq("status", "pending").maybeSingle(),
      ]);
      if ((prof as { community_id?: string | null } | null)?.community_id === community.id || ms) riJoinStatus = "member";
      else if (req) riJoinStatus = "pending";
    }
    const riShowJoin = riJoinStatus !== "member" && c.join_mode !== "closed";

    const pillars = isEn
      ? [
          {
            icon: Tent,
            title: "Gather (Berkumpul)",
            text: "A digital home where Catholic communities, parishes, youth groups, and cell groups stay united beyond Sunday Mass.",
          },
          {
            icon: BookOpen,
            title: "Learn (Belajar)",
            text: "Daily Mass readings, audio Bible, saint biographies, Rosary, Stations of the Cross, and reflections crafted for peaceful reading.",
          },
          {
            icon: Users,
            title: "Connect (Terhubung)",
            text: "Real friendships in faith, prayer intentions, real-time chat, and a community Marketplace to bless one another's livelihoods.",
          },
        ]
      : [
          {
            icon: Tent,
            title: "Berkumpul",
            text: "Rumah digital tempat komunitas Katolik, paroki, OMK, dan komsel tetap menyatu dan bertumbuh melampaui hari Minggu.",
          },
          {
            icon: BookOpen,
            title: "Belajar",
            text: "Bacaan Misa & renungan harian, Alkitab lengkap, pustaka kisah Santo-Santa, Rosario, dan Jalan Salib dalam tampilan buku yang tenang.",
          },
          {
            icon: Users,
            title: "Terhubung",
            text: "Persaudaraan nyata dalam iman, intensi doa bersama, percakapan langsung, dan Marketplace Umat untuk saling berbagi rezeki.",
          },
        ];

    const ecosystem = [
      {
        name: "Ruang Iman App",
        url: "https://apps.ruangiman.com",
        icon: Smartphone,
        desc: isEn ? "Web & Android app for daily spiritual growth, fellowship, and Catholic news." : "Aplikasi Web & Android untuk pertumbuhan rohani harian, persaudaraan, dan Warta Iman.",
      },
      {
        name: "Community Center",
        url: "https://communitycenter.ruangiman.com",
        icon: Tent,
        desc: isEn ? "Dedicated backoffice for community admins to manage events, members, QR attendance, and albums." : "Backoffice khusus pengurus komunitas untuk mengelola acara, anggota, absensi QR, dan album.",
      },
      {
        name: "Marketplace & Seller Center",
        url: "/news/marketplace",
        icon: ShoppingBag,
        desc: isEn ? "Free storefronts for Catholic entrepreneurs and UMKM to serve and bless fellow believers." : "Toko gratis bagi pelaku UMKM Katolik untuk saling mendukung dan berbagi rezeki sesama umat.",
      },
      {
        name: "Ruang Iman Website",
        url: "https://ruangiman.com",
        icon: Globe,
        desc: isEn ? "Official portal introducing our Catholic digital ministry across Indonesia and the diaspora." : "Portal resmi yang memperkenalkan pelayanan digital Katolik Ruang Iman bagi seluruh umat.",
      },
    ];

    return (
      <div className="space-y-6 p-4 pb-12 md:space-y-8 md:p-6">
        {/* Official Ruang Iman Website Hero */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 md:p-10"
          style={{
            background: "radial-gradient(circle at top right, rgba(214,176,114,0.22), transparent 55%), linear-gradient(155deg, #16223b 0%, #0d1017 75%)",
            border: `1px solid ${GOLD}40`,
          }}
        >
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Ruang Iman"
                className="h-18 w-18 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-xl shadow-black/40 md:h-24 md:w-24"
                style={{ border: `1px solid ${GOLD}66` }}
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: GOLD }}>
                  ruangiman.com · {isEn ? "Catholic Digital Ecosystem" : "Ekosistem Digital Katolik"}
                </p>
                <h2 className="mt-1 text-3xl font-bold text-white md:text-4xl" style={serif}>
                  Ruang Iman
                </h2>
                <p className="mt-1 text-sm italic text-[#EAE5D9]/85" style={serif}>
                  &ldquo;{isEn ? "A Place to Gather, Learn, and Connect" : "Tempat Berkumpul, Belajar, dan Terhubung"}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <p className="relative mt-5 max-w-3xl text-[15px] leading-[1.8] text-[#EAE5D9]/90 md:text-base">
            {isEn
              ? "Ruang Iman was born in quiet prayer to bridge Catholic communities, parishes, and believers across Indonesia. May the screens we hold every day become a living sanctuary—bringing us closer to Scripture, prayer, our brothers and sisters in Christ, and meaningful service."
              : "Ruang Iman lahir dari doa yang sunyi untuk menjembatani umat Katolik, paroki, dan berbagai komunitas di seluruh Indonesia. Biarlah layar yang kita genggam setiap hari menjadi ruang perjumpaan yang membawa kita lebih dekat pada Firman, doa, persaudaraan, dan pelayanan yang nyata."}
          </p>

          <p className="relative mt-3 text-xs italic text-brand-gold/90" style={serif}>
            &ldquo;{isEn ? "For where two or three gather in my name, there am I with them." : "Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada di tengah-tengah mereka."}&rdquo; — {isEn ? "Matthew 18:20" : "Matius 18:20"}
          </p>

          {/* Actions */}
          <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/camp/${slug}/features`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-xs font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover sm:text-sm"
            >
              <Sparkles className="h-4 w-4" />
              {isEn ? "Explore All Features" : "Lihat Semua Fitur"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {riShowJoin && (user ? (
              <JoinCommunityButton
                community={{ id: community.id, name: community.name ?? "Ruang Iman", join_mode: (c.join_mode ?? "open") as "open" | "request" | "closed", join_fields: c.join_fields ?? null }}
                status={riJoinStatus}
                className="!rounded-xl !px-4 !py-2.5 !text-xs sm:!text-sm"
              />
            ) : (
              <Link href="/login" className="inline-flex items-center rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-2.5 text-xs font-bold text-brand-gold hover:bg-brand-gold/20 sm:text-sm">
                {isEn ? "Sign in to join" : "Masuk untuk bergabung"}
              </Link>
            ))}
            <a
              href="https://ruangiman.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-brand-gold/50 sm:text-sm"
            >
              <Globe className="h-4 w-4 text-brand-gold" />
              ruangiman.com
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
            <ShareCommunityButton
              name="Ruang Iman"
              slug={community.slug || community.id}
              label={isEn ? "Share" : "Bagikan"}
            />
          </div>

          {/* Live Ecosystem Numbers */}
          <div className="relative mt-6 grid grid-cols-3 gap-3 max-w-lg">
            {[
              { label: isEn ? "Believers" : "Umat", value: totalUsers ?? 0, icon: Users },
              { label: isEn ? "Communities" : "Komunitas", value: totalCommunities ?? 0, icon: Tent },
              { label: isEn ? "UMKM Stores" : "Toko Umat", value: totalStores ?? 0, icon: ShoppingBag },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 p-3 text-center" style={{ border: `1px solid ${GOLD}25` }}>
                <s.icon className="mx-auto h-4 w-4" style={{ color: GOLD }} />
                <div className="mt-1 text-xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-[#151921] p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-lg font-bold text-white" style={serif}>{p.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-muted sm:text-sm">{p.text}</p>
            </div>
          ))}
        </section>

        {/* Connected Ruang Iman Ecosystem */}
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              {isEn ? "One Connected Ministry" : "Satu Ekosistem Pelayanan"}
            </p>
            <h3 className="mt-1 text-xl font-bold text-white" style={serif}>
              {isEn ? "Built for Individuals, Communities & Entrepreneurs" : "Dirancang untuk Umat, Komunitas & UMKM"}
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ecosystem.map((item) => {
              const isExternal = item.url.startsWith("http");
              const inner = (
                <div className="group flex h-full items-start gap-3.5 rounded-2xl border border-white/10 bg-[#151921] p-4 transition hover:border-brand-gold/45 hover:bg-[#191e28]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white group-hover:text-brand-gold">{item.name}</p>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-gold" />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">{item.desc}</p>
                  </div>
                </div>
              );
              return isExternal ? (
                <a key={item.name} href={item.url} target="_blank" rel="noreferrer">{inner}</a>
              ) : (
                <Link key={item.name} href={item.url}>{inner}</Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA: Features & Support */}
        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href={`/camp/${slug}/features`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-brand-gold/35 bg-brand-gold/10 p-5 transition hover:bg-brand-gold/15"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                {isEn ? "Complete Guide" : "Panduan Lengkap"}
              </p>
              <h4 className="mt-1 text-lg font-bold text-white" style={serif}>
                {isEn ? "Discover Every Ruang Iman Feature" : "Kenali Semua Fitur Ruang Iman"}
              </h4>
              <p className="mt-1 text-xs text-brand-light/80">
                {isEn ? "See why each feature matters and who benefits most." : "Pelajari keunggulan tiap fitur dan untuk siapa dampaknya paling maksimal."}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-brand-gold transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/news/donation"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#151921] p-5 transition hover:border-brand-gold/45"
          >
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                <ShieldCheck className="h-3.5 w-3.5" /> {isEn ? "100% Free for All" : "100% Gratis untuk Umat"}
              </p>
              <h4 className="mt-1 text-lg font-bold text-white" style={serif}>
                {isEn ? "Support This Ministry" : "Dukung Pelayanan Ini"}
              </h4>
              <p className="mt-1 text-xs text-brand-muted">
                {isEn ? "Read the Founder's letter and learn how to pray for or support Ruang Iman." : "Baca pesan pendiri Ruang Iman dan cara ikut ambil bagian dalam pelayanan."}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-gray-500 transition group-hover:translate-x-1 group-hover:text-brand-gold" />
          </Link>
        </section>
      </div>
    );
  }

  // Promotion banners: upcoming events with a poster, the nearest to today first
  const todayJ = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const { data: promoRows } = everyone
    ? { data: [] as any[] }
    : await supabase.from("events").select("id, title, event_date, banner_image_url")
        .eq("community_id", community.id).eq("status", "published").not("banner_image_url", "is", null)
        .gte("event_date", todayJ).order("event_date", { ascending: true }).limit(10);
  const promos = ((promoRows as { id: string; title: string; event_date: string | null; banner_image_url: string | null }[]) ?? []);

  // Everyone can read this page, private or not. People who are not members get the join button here.
  // Being a site admin or community admin does not make you a member: only real membership hides the button
  let joinStatus: JoinStatus = everyone ? "member" : "none";
  if (user && !everyone) {
    const [{ data: prof }, { data: ms }, { data: req }] = await Promise.all([
      supabase.from("profiles").select("community_id").eq("id", user.id).maybeSingle(),
      supabase.from("community_memberships" as any).select("community_id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle(),
      supabase.from("community_join_requests").select("id").eq("user_id", user.id).eq("community_id", community.id).eq("status", "pending").maybeSingle(),
    ]);
    if ((prof as { community_id?: string | null } | null)?.community_id === community.id || ms) joinStatus = "member";
    else if (req) joinStatus = "pending";
  }
  const showJoin = !everyone && joinStatus !== "member" && c.join_mode !== "closed";
  const dioceseCount = dioceses.filter((d) => d.kind !== "ordinariat").length;
  const missions: string[] = String(c.mission ?? "")
    .split(/\n+/)
    .map((s) => s.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);

  // Active events: published, not finished yet
  const { count: activeEvents } = everyone
    ? { count: 0 }
    : await supabase.from("events").select("id", { count: "exact", head: true })
        .eq("community_id", community.id).eq("status", "published")
        .or(`end_date.gte.${todayJ},and(end_date.is.null,event_date.gte.${todayJ}),and(end_date.is.null,event_date.is.null)`);

  const stats = everyone
    ? [
        { label: "Anggota", value: members ?? 0, icon: Users },
        { label: "Keuskupan", value: dioceseCount, icon: MapPin },
        { label: "Romo", value: romo ?? 0, icon: BadgeCheck },
      ]
    : [
        { label: "Anggota", value: members ?? 0, icon: Users },
        { label: "Event Aktif", value: activeEvents ?? 0, icon: CalendarDays },
      ];

  return (
    <div className="space-y-5 p-4 md:space-y-8 md:p-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl p-5 md:p-10"
        style={{ background: "linear-gradient(160deg, #1f2a44 0%, #121417 70%)", border: `1px solid ${GOLD}33` }}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl" style={{ background: `${GOLD}22` }} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          {c.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={community.name ?? ""} className="h-20 w-20 rounded-2xl object-cover" style={{ border: `1px solid ${GOLD}55` }} />
          )}
          <div>
            {c.tagline && <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>{c.tagline}</p>}
            <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-white" style={serif}>{community.name}</h2>
            {c.motto && <p className="mt-2 italic text-[#EAE5D9]/80" style={serif}>&ldquo;{c.motto}&rdquo;</p>}
          </div>
        </div>
        <p className="relative mt-4 max-w-3xl whitespace-pre-line text-[15px] leading-[1.75] text-[#EAE5D9]/90 md:mt-6 md:text-base md:leading-relaxed">{c.description || (everyone ? ABOUT_FALLBACK.description : "Belum ada deskripsi komunitas.")}</p>

        {/* One row of actions: full-width on phone, sleek compact buttons on PC */}
        <div className="relative mt-5 flex items-stretch gap-2.5 md:mt-6 md:inline-flex md:items-center md:gap-3">
          {showJoin && (user ? (
            <JoinCommunityButton
              community={{ id: community.id, name: community.name ?? "", join_mode: (c.join_mode ?? "request") as "open" | "request" | "closed", join_fields: c.join_fields ?? null }}
              status={joinStatus}
              className="flex-1 justify-center !rounded-xl !px-4 !py-3 text-center !text-sm md:flex-none md:!px-6"
            />
          ) : (
            <Link href="/login" className="flex flex-1 items-center justify-center rounded-xl bg-brand-gold px-4 py-3 text-center text-sm font-bold text-brand-dark md:flex-none md:px-6">Masuk untuk bergabung</Link>
          ))}
          <ShareCommunityButton name={community.name ?? ""} slug={community.slug || community.id} className="flex-1 justify-center md:flex-none md:px-6" />
        </div>
        {showJoin && user && (
          <p className="relative mt-2 text-[11px] text-brand-muted">{c.join_mode === "open" ? "Terbuka untuk semua." : "Permintaanmu akan ditinjau oleh admin komunitas."}</p>
        )}

        <div className={`relative mt-5 gap-3 md:mt-6 grid max-w-md ${stats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/5 p-3 text-center" style={{ border: `1px solid ${GOLD}22` }}>
              <s.icon className="mx-auto h-4 w-4" style={{ color: GOLD }} />
              <div className="mt-1 text-xl font-semibold text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & mission */}
      {(c.vision || missions.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {c.vision && (
            <div className="rounded-3xl bg-[#1a1d24] p-5 md:p-6" style={{ border: `1px solid ${GOLD}22` }}>
              <h3 className="text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>Visi</h3>
              <p className="mt-3 leading-relaxed text-[#EAE5D9]" style={serif}>{c.vision}</p>
            </div>
          )}
          {missions.length > 0 && (
            <div className="rounded-3xl bg-[#1a1d24] p-5 md:p-6" style={{ border: `1px solid ${GOLD}22` }}>
              <h3 className="text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>Misi</h3>
              <ol className="mt-3 space-y-2">
                {missions.map((m, i) => (
                  <li key={i} className="flex gap-3 text-[#EAE5D9]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: `${GOLD}22`, color: GOLD }}>{i + 1}</span>
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {/* Pillars */}
      {everyone && <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ABOUT_FALLBACK.pillars.map((p, i) => {
          const Icon = PILLAR_ICONS[i];
          return (
            <div key={p.title} className="rounded-2xl bg-[#1a1d24] p-4" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <Icon className="h-5 w-5" style={{ color: GOLD }} />
              <div className="mt-2 font-semibold text-white" style={serif}>{p.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted">{p.text}</p>
            </div>
          );
        })}
      </section>}

      {/* Quick links */}
      {everyone ? <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: `/camp/${slug}/uskup`, title: "Para Uskup", text: "Gembala keuskupan di Indonesia", icon: Church },
          { href: `/camp/${slug}/peta`, title: "Peta Keuskupan", text: "Keuskupan dari Sabang sampai Merauke", icon: MapPin },
          { href: `/news/schedule?cm=${slug}`, title: "Jadwal Misa", text: "Cari gereja dan jadwal misa terdekat", icon: CalendarDays },
        ].map((l) => (
          <Link key={l.title} href={l.href} className="group rounded-2xl bg-[#1a1d24] p-4 transition-colors hover:bg-[#20242c]" style={{ border: `1px solid ${GOLD}22` }}>
            <l.icon className="h-5 w-5" style={{ color: GOLD }} />
            <div className="mt-2 font-semibold text-white group-hover:text-[#E8C98B]">{l.title}</div>
            <p className="text-xs text-brand-muted">{l.text}</p>
          </Link>
        ))}
      </section> : promos.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>Promosi</h3>
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
            {promos.map((e) => (
              <Link key={e.id} href={`/acara/${e.id}`} className="group relative aspect-[4/5] w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-[#1a1d24] sm:w-52" style={{ border: `1px solid ${GOLD}33` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.banner_image_url as string} alt={e.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{e.title}</p>
                  {e.event_date && <p className="mt-0.5 text-[11px] font-semibold" style={{ color: GOLD }}>{formatDate(e.event_date)}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
