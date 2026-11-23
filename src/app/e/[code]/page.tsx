import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import GuestRegisterForm from "@/components/events/GuestRegisterForm";
import { formatWeekdayDate, formatTime } from "@/lib/utils";
import { isRegisterKey, registerKeyFilter, type RegField } from "@/lib/eventReg";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

/** The link preview (WhatsApp, email, social): the event's name, when and where, and its banner. */
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const fallback: Metadata = { title: "Daftar Event", description: "Daftar event Ruang Iman" };
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
  const images = e.banner_image_url ? [{ url: e.banner_image_url, width: 1080, height: 1350, alt: e.title }] : undefined;
  return {
    title: e.title,
    description,
    openGraph: { title: e.title, description, siteName: "Ruang Iman", type: "website", images },
    twitter: { card: images ? "summary_large_image" : "summary", title: e.title, description, images: images?.map((i) => i.url) },
  };
}

/** The short registration link: /e/<code>. A clean page for guests: no menu, no login. */
export default async function GuestEventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isRegisterKey(code)) notFound();
  const db = createAdminClient();
  const { data: st } = await db.from("event_reg_settings" as any).select("event_id, open, link_open, deadline, fields, welcome_text").or(registerKeyFilter(code)).maybeSingle();
  const s = st as { event_id: string; open: boolean; link_open?: boolean; deadline: string | null; fields: RegField[]; welcome_text: string | null } | null;
  if (!s) notFound();
  const { data: ev } = await db.from("events").select("title, event_date, location, banner_image_url, status").eq("id", s.event_id).maybeSingle();
  const e = ev as { title: string; event_date: string | null; location: string | null; banner_image_url: string | null; status: string } | null;
  if (!e || e.status !== "published") notFound();

  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const closed = !s.open || s.link_open === false || (!!s.deadline && s.deadline < today);
  const welcome = (s.welcome_text?.trim() || `Selamat datang pada Event ${e.title}`).replace(/\{event\}/gi, e.title);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 bg-[#121417] px-4 pb-16 pt-6 text-white">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">Ruang Iman</p>
      {e.banner_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.banner_image_url} alt="" className="max-h-72 w-full rounded-2xl object-cover" />
      )}
      <div className="space-y-1 text-sm text-brand-light">
        {e.event_date && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-brand-gold" /> {formatWeekdayDate(e.event_date)}, {formatTime(e.event_date)}</p>}
        {e.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-gold" /> {e.location}</p>}
      </div>
      {closed
        ? <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-5 text-center text-sm text-brand-muted">Pendaftaran acara ini belum dibuka atau sudah ditutup.</p>
        : <GuestRegisterForm code={code.toLowerCase()} eventTitle={e.title} welcome={welcome} fields={s.fields ?? []} />}
    </main>
  );
}
