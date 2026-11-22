import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EventRegAdmin from "@/components/events/EventRegAdmin";
import type { RegSettings, Registration } from "@/lib/eventReg";

/** Server part of the event admin console: checks the person may manage this event, loads everything, hands it to the client. */
export default async function EventRegAdminPage({ eventId, backHref }: { eventId: string; backHref: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: allowed } = await supabase.rpc("event_admin_of" as any, { p_event: eventId });
  if (allowed !== true) redirect(`/acara/${eventId}`);

  const [{ data: ev }, { data: settings }, { data: regs }] = await Promise.all([
    supabase.from("events").select("id, title, event_date, capacity").eq("id", eventId).maybeSingle(),
    supabase.from("event_reg_settings" as any).select("*").eq("event_id", eventId).maybeSingle(),
    supabase.from("event_registrations" as any).select("*").eq("event_id", eventId).order("created_at", { ascending: false }).limit(2000),
  ]);
  const event = ev as { id: string; title: string; event_date: string; capacity: number | null } | null;
  if (!event) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-28 md:p-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Pendaftaran dan absensi</p>
        <h1 className="mt-1 text-xl font-bold text-white">{event.title}</h1>
        <Link href={`/acara/${event.id}`} className="text-xs font-semibold text-brand-gold underline underline-offset-2">Lihat halaman acara</Link>
      </div>
      <EventRegAdmin
        eventId={event.id}
        eventTitle={event.title}
        capacity={event.capacity}
        settings={(settings as unknown as RegSettings) ?? null}
        regs={((regs as unknown as Registration[]) ?? [])}
      />
    </div>
  );
}
