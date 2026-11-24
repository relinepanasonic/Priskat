import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import GuestTicketView from "@/components/events/GuestTicketView";
import { formatWeekdayDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tiket Event" };

/** The ticket page, opened from the confirmation email: <site>/t/<ticket code>. */
export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{32}$/i.test(code)) notFound();
  const db = createAdminClient();
  const { data: reg } = await db.from("event_registrations" as any).select("full_name, status, event_id, checked_in_at").eq("ticket_code", code.toLowerCase()).maybeSingle();
  const r = reg as { full_name: string; status: string; event_id: string; checked_in_at: string | null } | null;
  if (!r) notFound();
  const { data: ev } = await db.from("events").select("title, event_date, end_date, location").eq("id", r.event_id).maybeSingle();
  const e = ev as { title: string; event_date: string | null; end_date: string | null; location: string | null } | null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 bg-[#121417] px-4 pb-16 pt-6 text-white">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">Ruang Iman</p>
      <div className="space-y-1 text-sm text-brand-light">
        {e?.event_date && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-brand-gold" /> {formatWeekdayDate(e.event_date)}, {formatTime(e.event_date)}</p>}
        {e?.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-gold" /> {e.location}</p>}
      </div>
      <GuestTicketView code={code.toLowerCase()} name={r.full_name} eventTitle={e?.title ?? "Event"} pending={r.status !== "approved"} event={e ? { title: e.title, start: e.event_date, end: e.end_date, location: e.location } : undefined} />
      {r.checked_in_at && <p className="rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-300">Kehadiranmu sudah tercatat.</p>}
    </main>
  );
}
