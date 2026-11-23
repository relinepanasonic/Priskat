import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import GuestRegisterForm from "@/components/events/GuestRegisterForm";
import { formatWeekdayDate, formatTime } from "@/lib/utils";
import type { RegField } from "@/lib/eventReg";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daftar Event" };

/** The short registration link: /e/<code>. A clean page for guests: no menu, no login. */
export default async function GuestEventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{6}$/i.test(code)) notFound();
  const db = createAdminClient();
  const { data: st } = await db.from("event_reg_settings" as any).select("event_id, open, link_open, deadline, fields, welcome_text").eq("public_code", code.toLowerCase()).maybeSingle();
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
