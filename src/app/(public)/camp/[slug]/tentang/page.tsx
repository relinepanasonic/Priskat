import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, HandHeart, Church, Users, MapPin, BadgeCheck, CalendarDays } from "lucide-react";
import { countCommunityMembers } from "@/lib/memberCounts";
import { formatDate } from "@/lib/utils";
import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import { ABOUT_FALLBACK, isCatholicIndonesia } from "@/lib/catholicIndonesia";
import JoinCommunityButton, { type JoinStatus } from "@/components/community/JoinCommunityButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tentang" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const PILLAR_ICONS = [BookOpen, HandHeart, Church, Users];

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, user, canEdit } = await getCommunityPageContext(slug);
  if (!community) redirect("/camp");

  // Catholic Indonesia is everyone's community: count every Ruang Iman member
  const everyone = isCatholicIndonesia(community.name, community.slug);
  const [{ data: info }, { count: members }, { count: romo }, { dioceses }] = await Promise.all([
    supabase.from("communities").select("*").eq("id", community.id).maybeSingle(),
    countCommunityMembers(supabase, community).then((n) => ({ count: n })),
    supabase.from("clergy" as any).select("user_id", { count: "exact", head: true }),
    loadDioceses(supabase),
  ]);

  const c = (info ?? {}) as Record<string, any>;

  // Promotion banners: upcoming events with a poster, the nearest to today first
  const todayJ = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const { data: promoRows } = everyone
    ? { data: [] as any[] }
    : await supabase.from("events").select("id, title, event_date, banner_image_url")
        .eq("community_id", community.id).eq("status", "published").not("banner_image_url", "is", null)
        .gte("event_date", todayJ).order("event_date", { ascending: true }).limit(10);
  const promos = ((promoRows as { id: string; title: string; event_date: string | null; banner_image_url: string | null }[]) ?? []);

  // Everyone can read this page, private or not. People who are not members get the join button here.
  let joinStatus: JoinStatus = everyone || canEdit ? "member" : "none";
  if (user && !everyone && !canEdit) {
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

  const stats = everyone
    ? [
        { label: "Anggota", value: members ?? 0, icon: Users },
        { label: "Keuskupan", value: dioceseCount, icon: MapPin },
        { label: "Romo", value: romo ?? 0, icon: BadgeCheck },
      ]
    : [{ label: "Anggota", value: members ?? 0, icon: Users }];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 md:p-10"
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
        <p className="relative mt-6 max-w-3xl leading-relaxed text-[#EAE5D9]/90">{c.description || (everyone ? ABOUT_FALLBACK.description : "Belum ada deskripsi komunitas.")}</p>

        {showJoin && (
          <div className="relative mt-6">
            {user ? (
              <div className="flex flex-wrap items-center gap-3">
                <JoinCommunityButton
                  community={{ id: community.id, name: community.name ?? "", join_mode: (c.join_mode ?? "request") as "open" | "request" | "closed", join_fields: c.join_fields ?? null }}
                  status={joinStatus}
                  className="!px-6 !py-3 !text-sm"
                />
                <span className="text-xs text-brand-muted">{c.join_mode === "open" ? "Terbuka untuk semua." : "Permintaanmu akan ditinjau oleh admin komunitas."}</span>
              </div>
            ) : (
              <Link href="/login" className="inline-block rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-dark">Masuk untuk bergabung</Link>
            )}
          </div>
        )}

        <div className="relative mt-6 grid grid-cols-3 gap-3 max-w-md">
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
            <div className="rounded-3xl bg-[#1a1d24] p-6" style={{ border: `1px solid ${GOLD}22` }}>
              <h3 className="text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>Visi</h3>
              <p className="mt-3 leading-relaxed text-[#EAE5D9]" style={serif}>{c.vision}</p>
            </div>
          )}
          {missions.length > 0 && (
            <div className="rounded-3xl bg-[#1a1d24] p-6" style={{ border: `1px solid ${GOLD}22` }}>
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
