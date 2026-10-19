import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Plus, ExternalLink } from "lucide-react";
import { getCommunityPageContext } from "@/lib/ciServer";

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

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) : "";

/** Events of a community (every community except Catholic Family Ministry, which runs camps). */
export default async function CommunityEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, canEdit } = await getCommunityPageContext(slug);
  if (!community) redirect("/camp");

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
    <article key={e.id} className={`overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c] ${dim ? "opacity-70" : ""}`}>
      {e.banner_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.banner_image_url} alt="" className="h-40 w-full object-cover" loading="lazy" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white" style={serif}>{e.title}</h3>
        {e.event_date && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: GOLD }}>
            <CalendarDays className="h-3.5 w-3.5" />
            {fmt(e.event_date)}{e.end_date && e.end_date.slice(0, 10) !== e.event_date.slice(0, 10) ? ` – ${fmt(e.end_date)}` : ""}
          </p>
        )}
        {e.location && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {e.maps_url ? (
              <a href={e.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-white">
                {e.location} <ExternalLink className="h-3 w-3" />
              </a>
            ) : e.location}
          </p>
        )}
        {e.description && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-300">{e.description}</p>}
      </div>
    </article>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Event</p>
          <h2 className="mt-1 text-2xl font-semibold text-white" style={serif}>Kegiatan {community.name}</h2>
        </div>
        {canEdit && (
          <Link
            href={`/admin/communities/${community.slug || community.id}/event`}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark"
          >
            <Plus className="h-4 w-4" /> Tambah event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2d35] bg-[#14171c] px-6 py-14 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-brand-muted/50" />
          <p className="mt-3 font-semibold text-white">Belum ada event</p>
          <p className="mt-1 text-sm text-brand-muted">Event dan kegiatan komunitas akan tampil di sini.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-muted">Akan datang</h3>
              <div className="grid gap-4 sm:grid-cols-2">{upcoming.map((e) => card(e))}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-muted">Sudah berlalu</h3>
              <div className="grid gap-4 sm:grid-cols-2">{past.map((e) => card(e, true))}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
