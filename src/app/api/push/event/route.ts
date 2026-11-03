import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";

/**
 * Notifications caused by one person's action, sent to another person.
 *   POST /api/push/event   { type: "intention_prayed" | "join_decided", id }
 * The caller must be signed in, and the server checks in the database that the action really happened
 * (the caller really prayed, the caller really decided the request) before anything is sent.
 */
const PRAYED_MILESTONES = [1, 5, 10, 25, 50, 100];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { type?: string; id?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const id = String(body.id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const db = createAdminClient();
  let target: string | null = null;
  let key = "";
  let msg: { title: string; body: string; url: string } | null = null;

  if (body.type === "intention_prayed") {
    key = "intensi";
    const since = new Date(Date.now() - 2 * 60_000).toISOString();
    const { data: prayed } = await db.from("prayer_intention_prayers" as any).select("created_at").eq("intention_id", id).eq("user_id", user.id).gte("created_at", since).maybeSingle();
    if (!prayed) return NextResponse.json({ ok: true, skipped: "not a fresh prayer" });
    const { data: it } = await db.from("prayer_intentions" as any).select("user_id, prayed_count").eq("id", id).maybeSingle();
    const intention = it as { user_id: string; prayed_count: number } | null;
    if (!intention || intention.user_id === user.id || !PRAYED_MILESTONES.includes(intention.prayed_count)) return NextResponse.json({ ok: true, skipped: "no notification" });
    target = intention.user_id;
    msg = {
      title: "Intensi doamu didoakan 🙏",
      body: intention.prayed_count === 1 ? "Seorang saudara seiman mendoakan intensimu." : `${intention.prayed_count} orang sudah mendoakan intensimu.`,
      url: "/faith/intensi",
    };
  } else if (body.type === "join_decided") {
    key = "komunitas";
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: rq } = await db.from("community_join_requests" as any).select("user_id, status, decided_by, decided_at, community:communities!community_id(name)").eq("id", id).maybeSingle();
    const r = rq as { user_id: string; status: string; decided_by: string | null; decided_at: string | null; community: { name: string } | null } | null;
    if (!r || r.decided_by !== user.id || !r.decided_at || r.decided_at < since || !["approved", "rejected"].includes(r.status)) return NextResponse.json({ ok: true, skipped: "not decided by you just now" });
    target = r.user_id;
    const name = r.community?.name ?? "komunitas";
    msg = r.status === "approved"
      ? { title: `Selamat datang di ${name}`, body: "Permintaan bergabungmu disetujui.", url: "/camp" }
      : { title: "Permintaan bergabung", body: `Permintaanmu ke ${name} belum disetujui.`, url: "/camp" };
  } else {
    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  }

  // Respect the person's switch (no saved choice yet = allowed)
  const { data: pref } = await db.from("prayer_reminders" as any).select("slots").eq("user_id", target).maybeSingle();
  const slots = (pref as { slots: string[] | null } | null)?.slots;
  if (slots && !slots.includes(key)) return NextResponse.json({ ok: true, skipped: "switched off" });

  const { data: tokenRows } = await db.from("push_tokens" as any).select("token").eq("user_id", target);
  const tokens = ((tokenRows as { token: string }[]) ?? []).map((t) => t.token);
  const res = await sendPush(tokens, msg);
  if (res.invalid.length) await db.from("push_tokens" as any).delete().in("token", res.invalid);
  return NextResponse.json({ ok: true, sent: res.sent });
}
