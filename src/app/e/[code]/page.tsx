import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, MapPin, Ticket } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import GuestRegisterForm from "@/components/events/GuestRegisterForm";
import EventLandingCta from "@/components/events/EventLandingCta";
import EventShare from "@/components/events/EventShare";
import { formatWeekdayDate, formatTime } from "@/lib/utils";
import { isRegisterKey, registerKeyFilter, registerLink, rupiah, type RegField } from "@/lib/eventReg";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

/** The link preview (WhatsApp, email, social): the event's name, when and where, and its banner. */
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  // no event picture: our logo
  const logo = { url: "https://apps.ruangiman.com/logo.png", width: 1000, height: 1000, alt: "Ruang Iman" };
  const fallback: Metadata = { title: "Daftar Event", description: "Daftar event Ruang Iman", openGraph: { title: "Daftar Event", siteName: "Ruang Iman", images: [logo] }, twitter: { card: "summary", title: "Daftar Event", images: [logo.url] } };
  if (!isRegisterKey(code)) return fallback;
  const db = createAdminClient();
  const { data: st } = await db.from("event_reg_settings" as any).select("event_id").or(registerKeyFilter(code)).maybeSingle();
  const eid = (st as { event_id?: string } | null)?.event_id;
  if (!eid) return fallback;
  const { data: ev } = await db.from("events").select("title, event_date, location, banner_image_url").eq("id", eid).maybeSingle();
  const e = ev as { title: string; event_date: string | null; location: string | null; banner_image_url: string | null } | null;
  if (!e) return fallback;
  const when = e.event_date ? `${formatWeekdayDate(e.event_date)}, ${formatTime(e.event_date)} WIB` : "";
  const description = [when, e.location].filter(Boolean).join(" · ") || "Daftar dan dapatkan QR Code di Ruang Iman";
  // the event's picture first; our logo when the event has none
  const images = [e.banner_image_url ? { url: e.banner_image_url, width: 1080, height: 1350, alt: e.title } : logo];
  return {
    title: e.title,
    description,
    openGraph: { title: e.title, description, siteName: "Ruang Iman", type: "website", images },
    twitter: { card: e.banner_image_url ? "summary_large_image" : "summary", title: e.title, description, images: images.map((i) => i.url) },
  };
}

const serif = { fontFamily: "'Lora', Georgia, serif" };

/**
 * The event page behind the short link: /e/<name>. People read about the event first (picture, tagline, when and where,
 * the promotional text and photos) and press "Daftar sekarang" to open the form. /e/<name>?daftar=1 opens the form at once.
 * No menu, no login.
 */
export default async function GuestEventPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ daftar?: string }> }) {
  const { code } = await params;
  const { daftar } = await searchParams;
  if (!isRegisterKey(code)) notFound();
  const db = createAdminClient();
  const { data: st } = await db.from("event_reg_settings" as any).select("event_id, open, link_open, deadline, fields, welcome_text, price").or(registerKeyFilter(code)).maybeSingle();
  const s = st as { event_id: string; open: boolean; link_open?: boolean; deadline: string | null; fields: RegField[]; welcome_text: string | null; price: number } | null;
  if (!s) notFound();

  type Ev = { title: string; tagline?: string | null; event_date: string | null; end_date?: string | null; location: string | null; maps_url?: string | null; banner_image_url: string | null; status: string; description?: string | null; capacity?: number | null; promo_text?: string | null; promo_images?: string[] | null };
  // the promotional columns come with 136_event_promo_content.sql; before that the page still works
  let e: Ev | null = null;
  const full = await db.from("events").select("title, tagline, description, capacity, event_date, end_date, location, maps_url, banner_image_url, status, promo_text, promo_images").eq("id", s.event_id).maybeSingle();
  if (!full.error) e = full.data as Ev | null;
  else {
    const plain = await db.from("events").select("title, event_date, location, banner_image_url, status").eq("id", s.event_id).maybeSingle();
    e = plain.data as Ev | null;
  }
  if (!e || e.status !== "published") notFound();

  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const closed = !s.open || s.link_open === false || (!!s.deadline && s.deadline < today);
  const welcome = (s.welcome_text?.trim() || `Selamat datang pada Event ${e.title}`).replace(/\{event\}/gi, e.title);
  const paragraphs = (e.promo_text ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const photos = (e.promo_images ?? []).filter(Boolean).slice(0, 3);
  const sameDay = e.end_date && e.event_date && formatWeekdayDate(e.end_date) === formatWeekdayDate(e.event_date);

  // what is shared: the name, the tagline, when and where, and this page's link
  const shareText = [`*${e.title}*`, e.tagline, "", e.event_date ? `📅 ${formatWeekdayDate(e.event_date)}, ${formatTime(e.event_date)} WIB` : "", e.location ? `📍 ${e.location}` : "", "", `Info dan pendaftaran: ${registerLink(code.toLowerCase())}`]
    .filter((x): x is string => typeof x === "string").join("\n").replace(/\n{3,}/g, "\n\n");

  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-5 bg-[#121417] px-4 pb-56 pt-6 text-white">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">Ruang Iman</p>

      {e.banner_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.banner_image_url} alt={e.title} className="max-h-[30rem] w-full rounded-2xl object-cover" />
      )}

      <header className="space-y-2">
        <h1 className="text-[26px] font-bold leading-tight" style={serif}>{e.title}</h1>
        {e.tagline && <p className="text-base font-medium leading-snug text-brand-gold">{e.tagline}</p>}
      </header>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#1a1d24] p-4 text-sm text-brand-light">
        {e.event_date && (
          <p className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
            <span>{formatWeekdayDate(e.event_date)}, {formatTime(e.event_date)} WIB{e.end_date ? (sameDay ? ` sampai ${formatTime(e.end_date)} WIB` : ` sampai ${formatWeekdayDate(e.end_date)}, ${formatTime(e.end_date)} WIB`) : ""}</span></p>
        )}
        {e.location && (
          <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
            <span>{e.location}{e.maps_url && <> <a href={e.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-gold underline underline-offset-2">Buka peta <ExternalLink className="h-3 w-3" /></a></>}</span></p>
        )}
        <p className="flex items-start gap-3"><Ticket className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" /><span>{rupiah(s.price ?? 0)} per orang{e.capacity != null ? ` · Kuota ${e.capacity} orang` : ""}</span></p>
      </section>

      {paragraphs.length === 0 && e.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-200">{e.description}</p>}

      {paragraphs.length > 0 && (
        <section className="space-y-3.5">
          {paragraphs.map((p, i) => <p key={i} className="text-[15px] leading-relaxed text-gray-200">{p}</p>)}
        </section>
      )}

      {photos.length > 0 && (
        <section className={photos.length === 1 ? "" : "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${e.title} ${i + 1}`} className={photos.length === 1 ? "w-full rounded-2xl object-cover" : "aspect-[4/5] w-60 shrink-0 snap-center rounded-2xl object-cover"} />
          ))}
        </section>
      )}

      <EventLandingCta closed={closed} startOpen={daftar === "1"} share={<EventShare text={shareText} />}>
        <GuestRegisterForm code={code.toLowerCase()} eventTitle={e.title} welcome={welcome} fields={s.fields ?? []} />
      </EventLandingCta>
    </main>
  );
}
