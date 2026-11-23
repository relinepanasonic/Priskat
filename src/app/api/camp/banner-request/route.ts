import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";
import { BANNER_OFFERS } from "@/lib/bannerPrices";

/**
 * An event admin asks for more promotion in the app (an extra banner or a Running Banner).
 *   POST /api/camp/banner-request  { event: <id>, kind: "extra" | "running" }
 * The request is saved with its price and the Ruang Iman team (Founder and Superadmin) gets a notification.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { event?: string; kind?: string } = {};
  try { body = await request.json(); } catch { /* none */ }
  const eventId = String(body.event ?? "");
  const offer = BANNER_OFFERS.find((o) => o.kind === body.kind);
  if (!/^[0-9a-f-]{36}$/i.test(eventId) || !offer) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { data: allowed } = await supabase.rpc("event_admin_of" as any, { p_event: eventId });
  if (allowed !== true) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const db = createAdminClient();
  // one open request of each kind at a time
  const { data: open } = await db.from("event_banner_requests" as any).select("id").eq("event_id", eventId).eq("kind", offer.kind).in("status", ["new", "processing"]).limit(1);
  if (((open as unknown[]) ?? []).length) return NextResponse.json({ ok: true, already: true });

  const { error } = await db.from("event_banner_requests" as any).insert({ event_id: eventId, kind: offer.kind, price: offer.price, requested_by: user.id });
  if (error) return NextResponse.json({ error: "Permintaan belum tersimpan. Jalankan 131_banner_meeting_panitia.sql dulu." }, { status: 500 });

  // tell the team
  const [{ data: ev }, { data: who }, { data: team }] = await Promise.all([
    db.from("events").select("title").eq("id", eventId).maybeSingle(),
    db.from("profiles").select("full_name, nama_panggilan").eq("id", user.id).maybeSingle(),
    db.from("profiles").select("id").in("role", ["founder", "superadmin"]),
  ]);
  const ids = ((team as { id: string }[]) ?? []).map((t) => t.id);
  let sent = 0;
  if (ids.length) {
    const { data: rows } = await db.from("push_tokens" as any).select("token").in("user_id", ids);
    const tokens = ((rows as { token: string }[]) ?? []).map((r) => r.token);
    const w = who as { full_name?: string | null; nama_panggilan?: string | null } | null;
    const res = await sendPush(tokens, {
      title: `Permintaan ${offer.label} 📢`,
      body: `${(ev as { title?: string } | null)?.title ?? "Event"} · ${w?.nama_panggilan || w?.full_name || "Admin"} · Rp ${offer.price.toLocaleString("id-ID")}`,
      url: "/admin/communities",
      channel: "chat",
    });
    sent = res.sent;
    if (res.invalid.length) await db.from("push_tokens" as any).delete().in("token", res.invalid);
  }
  return NextResponse.json({ ok: true, notified: sent });
}
