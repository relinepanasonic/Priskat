import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRegistrationEmail } from "@/lib/eventMail";
import { inviteToCalendar } from "@/lib/googleCalendar";

/**
 * After a registration is marked Paid: email the person their QR ticket.
 * Only people who may mark it paid (Ketua, Wakil Ketua, Sekretaris, Bendahara, site admins) can trigger it.
 */
export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: eventId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return NextResponse.json({ error: "bad event" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: allowed } = await supabase.rpc("can_mark_paid" as any, { p_event: eventId });
  if (allowed !== true) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { reg?: string } = {};
  try { body = await request.json(); } catch { /* none */ }
  if (!body.reg || !/^[0-9a-f-]{36}$/i.test(body.reg)) return NextResponse.json({ error: "bad registration" }, { status: 400 });

  const db = createAdminClient();
  const { data: reg } = await db.from("event_registrations" as any).select("full_name, email, status, ticket_code, emailed_at").eq("id", body.reg).eq("event_id", eventId).maybeSingle();
  const r = reg as { full_name: string; email: string | null; status: string; ticket_code: string; emailed_at: string | null } | null;
  if (!r || r.status !== "approved") return NextResponse.json({ ok: false, reason: "not paid" });
  if (!r.email) return NextResponse.json({ ok: false, reason: "no email" });
  if (r.emailed_at) return NextResponse.json({ ok: true, already: true });

  const { data: ev } = await db.from("events").select("title, event_date, location").eq("id", eventId).maybeSingle();
  const e = ev as { title: string; event_date: string | null; location: string | null } | null;
  const sent = await sendRegistrationEmail({ to: r.email, name: r.full_name, event: e?.title ?? "Event", start: e?.event_date ?? null, location: e?.location ?? null, code: r.ticket_code });
  if (sent) await db.from("event_registrations" as any).update({ emailed_at: new Date().toISOString() }).eq("id", body.reg);
  await inviteToCalendar(eventId, r.email, r.full_name);
  return NextResponse.json({ ok: sent });
}
