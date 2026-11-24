import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, ExternalLink, MapPin, Plus } from "lucide-react";
import { getCommunityPageContext } from "@/lib/ciServer";
import { formatWeekdayDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  end_date: string | null;
  location: string | null;
  maps_url: string | null;
  banner_image_url: string | null;
};

const fmt = (d: string | null) => (d ? formatWeekdayDate(d) : "");

/** Events of a community: 2-column compact cards on phones, refined 3-4 column portrait poster gallery on PC. */
export default async function CommunityEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, canEdit } = await getCommunityPageContext(slug);
  if (!community) redirect("/camp");

  const { data: logoRow } = await supabase.from("communities").select("logo_url").eq("id", community.id).maybeSingle();
  const logo = (logoRow as { logo_url?: string | null } | null)?.logo_url ?? null;

  const { data } = await supabase
    .from("events")
    .select("id, title, description, event_date, end_date, location, maps_url, banner_image_url")
    .eq("community_id", community.id)
    .order("event_date", { ascending: true })
    .limit(100);
  const events = (data as EventRow[]) ?? [];

  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const upcoming = events.filter((e) => !e.event_date || e.event_date.slice(0, 10) >= today);
  const past = events.filter((e) => e.event_date && e.event_date.slice(0, 10) < today).reverse();

  const card = (e: EventRow, dim = false) => (
    <article
      key={e.id}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] transition-all duration-300 md:hover:-translate-y-1 md:hover:border-brand-gold/45 md:hover:shadow-xl md:hover:shadow-black/50 ${
        dim ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      {/* Keep full 4:5 portrait poster on BOTH phone and PC so posters are never squashed or cropped */}
      <Link href={`/acara/${e.id}`} className="relative block aspect-[4/5] w-full overflow-hidden bg-[#0c0e13]">
        {e.banner_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.banner_image_url}
            alt={e.title}
            className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(214,176,114,0.12),rgba(12,14,19,1)_70%)]">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="h-1/2 w-1/2 rounded-2xl object-contain transition-transform duration-500 md:group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <CalendarDays className="h-10 w-10 text-brand-muted/40" />
            )}
          </div>
        )}
        {/* Subtle vignette + status badge on PC */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#12151b] via-[#12151b]/40 to-transparent" />
        {dim && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-300 backdrop-blur-sm">
            Selesai
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 md:p-4">
        <Link href={`/acara/${e.id}`} className="block">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors md:text-base md:group-hover:text-brand-gold"
            style={serif}
          >
            {e.title}
          </h3>
        </Link>

        {e.event_date && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold md:text-xs" style={{ color: GOLD }}>
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-snug">
              {fmt(e.event_date)}
              {e.end_date && e.end_date.slice(0, 10) !== e.event_date.slice(0, 10) ? ` – ${fmt(e.end_date)}` : ""}
            </span>
          </p>
        )}

        {e.location && (
          <p className="mt-1 flex items-start gap-1.5 text-[11px] text-brand-muted md:text-xs">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {e.maps_url ? (
              <a
                href={e.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-1 inline-flex items-center gap-1 underline underline-offset-2 hover:text-white"
              >
                <span className="truncate">{e.location}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="line-clamp-1">{e.location}</span>
            )}
          </p>
        )}

        {e.description && (
          <p className="mt-2 hidden line-clamp-2 text-xs leading-relaxed text-gray-400 md:block">
            {e.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <Link
            href={`/acara/${e.id}`}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition md:text-xs ${
              dim
                ? "border border-white/15 bg-white/5 text-brand-light hover:border-brand-gold/40 hover:text-white"
                : "bg-brand-gold text-brand-dark shadow-sm shadow-brand-gold/15 hover:bg-brand-gold-hover"
            }`}
          >
            <span>{dim ? "Lihat detail" : "Detail & Daftar"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform md:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            Event Komunitas
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white md:text-3xl" style={serif}>
            Kegiatan {community.name}
          </h2>
          {events.length > 0 && (
            <p className="mt-1 hidden text-sm text-brand-muted md:block">
              {upcoming.length > 0
                ? `${upcoming.length} kegiatan mendatang · ${past.length} telah berlalu`
                : `${past.length} kegiatan telah berlalu`}
            </p>
          )}
        </div>
        {canEdit && (
          <a
            href={`https://communitycenter.ruangiman.com/admin/communities/${community.slug || community.id}/promotion`}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-brand-gold px-4 py-2.5 text-xs font-bold text-brand-dark shadow-md shadow-brand-gold/15 transition hover:bg-brand-gold-hover"
          >
            <Plus className="h-4 w-4" /> Tambah Event
          </a>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#12151b] px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-brand-muted/50" />
          <p className="mt-3 font-semibold text-white">Belum ada event</p>
          <p className="mt-1 text-sm text-brand-muted">Event dan kegiatan komunitas akan tampil di sini.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-light">
                  Akan Datang ({upcoming.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
                {upcoming.map((e) => card(e))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-white/25" />
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">
                  Sudah Berlalu ({past.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
                {past.map((e) => card(e, true))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
