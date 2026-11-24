import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, ExternalLink, Settings2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EventRegisterClient from "@/components/events/EventRegisterClient";
import { rupiah, type RegSettings, type Registration } from "@/lib/eventReg";
import { formatWeekdayDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Managing an event happens in the Community Center */
const CC = "https://communitycenter.ruangiman.com";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

const fmt = (d: string) => formatWeekdayDate(d);
const fmtTime = (d: string) => formatTime(d);

/** One event: what it is, and registration (form, manual transfer, QR ticket). */
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ev } = await supabase
    .from("events")
    .select("id, title, description, event_date, end_date, location, maps_url, banner_image_url, capacity, status, community_id, community:communities!community_id(name, slug)")
    .eq("id", id)
    .maybeSingle();
  const event = ev as unknown as {
    id: string; title: string; description: string | null; event_date: string; end_date: string | null; location: string | null; maps_url: string | null;
    banner_image_url: string | null; capacity: number | null; status: string; community_id: string | null; community: { name: string; slug: string | null } | null;
  } | null;
  if (!event) notFound();
  // the same content as the event link (/e/...): tagline, promotional text and photos (136 SQL; the page still works before it)
  let promo: { tagline: string | null; promo_text: string | null; promo_images: string[] | null } = { tagline: null, promo_text: null, promo_images: null };
  const pr = await supabase.from("events").select("tagline, promo_text, promo_images").eq("id", id).maybeSingle();
  if (!pr.error && pr.data) promo = pr.data as typeof promo;
  const paragraphs = (promo.promo_text ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const photos = (promo.promo_images ?? []).filter(Boolean).slice(0, 3);

  let settings: RegSettings | null = null;
  let reg: Registration | null = null;
  let canManage = false;
  let taken = 0;
  let profile: { full_name: string | null } | null = null;
  let phone = "";
  if (user) {
    const [s, r, adm, count, p, priv] = await Promise.all([
      supabase.from("event_reg_settings" as any).select("*").eq("event_id", id).maybeSingle(),
      supabase.from("event_registrations" as any).select("*").eq("event_id", id).eq("user_id", user.id).maybeSingle(),
      supabase.rpc("event_admin_of" as any, { p_event: id }),
      supabase.from("event_registrations" as any).select("id", { count: "exact", head: true }).eq("event_id", id).in("status", ["awaiting_payment", "pending_review", "approved"]),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("profile_private" as any).select("phone").eq("user_id", user.id).maybeSingle(),
    ]);
    settings = (s.data as unknown as RegSettings) ?? null;
    reg = (r.data as unknown as Registration) ?? null;
    canManage = adm.data === true;
    taken = count.count ?? 0;
    profile = p.data as { full_name: string | null } | null;
    phone = (priv.data as { phone?: string } | null)?.phone ?? "";
  }
  const manageHref = event.community?.slug ? `${CC}/admin/communities/${event.community.slug}/promotion` : `/admin/events/${event.id}/registrasi`;
  const full = event.capacity != null && taken >= event.capacity && !reg;

  return (
    <div className="w-full max-w-2xl space-y-5 p-4 pb-28 md:p-6">
      <Link href={event.community?.slug ? `/camp/${event.community.slug}/event` : "/news/events"} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      {event.banner_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.banner_image_url} alt="" className="max-h-[30rem] w-full rounded-2xl object-cover" />
      )}

      <div>
        {event.community && <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>{event.community.name}</p>}
        <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>{event.title}</h1>
        {promo.tagline && <p className="mt-1 text-base font-medium leading-snug" style={{ color: GOLD }}>{promo.tagline}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: GOLD }}>
          <CalendarDays className="h-4 w-4" /> {fmt(event.event_date)}, {fmtTime(event.event_date)}
        </p>
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-muted">
            <MapPin className="h-4 w-4 shrink-0" />
            {event.maps_url ? <a href={event.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">{event.location} <ExternalLink className="h-3 w-3" /></a> : event.location}
          </p>
        )}
        {event.capacity != null && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted"><Users className="h-3.5 w-3.5" /> Kuota {event.capacity} orang</p>
        )}
        {paragraphs.length === 0 && event.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">{event.description}</p>}
      </div>

      {paragraphs.length > 0 && (
        <section className="space-y-3.5">
          {paragraphs.map((p, i) => <p key={i} className="text-[15px] leading-relaxed text-gray-200">{p}</p>)}
        </section>
      )}

      {photos.length > 0 && (
        <section className={photos.length === 1 ? "" : "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${event.title} ${i + 1}`} className={photos.length === 1 ? "w-full rounded-2xl object-cover" : "aspect-[4/5] w-60 shrink-0 snap-center rounded-2xl object-cover"} />
          ))}
        </section>
      )}

      {canManage && (
        <Link href={manageHref} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 py-3 text-sm font-semibold text-brand-gold">
          <Settings2 className="h-4 w-4" /> Kelola di Community Center
        </Link>
      )}

      {reg?.status === "approved" && (
        <Link href={`/album/${event.id}`} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 py-3 text-sm font-semibold text-brand-gold">Buka album foto event</Link>
      )}

      {event.status === "published" && (
        <EventRegisterClient
          eventId={event.id}
          eventTitle={event.title}
          settings={settings}
          reg={reg}
          signedIn={!!user}
          defaultName={profile?.full_name ?? ""}
          defaultPhone={phone}
          full={full}
        />
      )}
      {user && <Link href="/tiket" className="block text-center text-xs font-semibold text-brand-gold underline underline-offset-4">Lihat semua tiket saya</Link>}
      {settings?.open && <p className="text-center text-[11px] text-brand-muted">Biaya: {rupiah(settings.price)}{settings.deadline ? ` · pendaftaran sampai ${fmt(settings.deadline)}` : ""}</p>}
    </div>
  );
}
