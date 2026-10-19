import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, HandHeart, Church, Users, MapPin, BadgeCheck, CalendarDays } from "lucide-react";
import { countCommunityMembers } from "@/lib/memberCounts";
import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import { ABOUT_FALLBACK, isCatholicIndonesia } from "@/lib/catholicIndonesia";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tentang" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const PILLAR_ICONS = [BookOpen, HandHeart, Church, Users];

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community } = await getCommunityPageContext(slug);
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
      </section> : (
        <section className="grid gap-3 sm:grid-cols-2">
          {[
            { href: `/camp/${slug}/crew`, title: "Event", text: "Camp dan kegiatan komunitas", icon: CalendarDays },
            { href: `/camp/${slug}/org-structure`, title: "Struktur Organisasi", text: "Pengurus dan penanggung jawab", icon: Users },
          ].map((l) => (
            <Link key={l.title} href={l.href} className="group rounded-2xl bg-[#1a1d24] p-4 transition-colors hover:bg-[#20242c]" style={{ border: `1px solid ${GOLD}22` }}>
              <l.icon className="h-5 w-5" style={{ color: GOLD }} />
              <div className="mt-2 font-semibold text-white group-hover:text-[#E8C98B]">{l.title}</div>
              <p className="text-xs text-brand-muted">{l.text}</p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
