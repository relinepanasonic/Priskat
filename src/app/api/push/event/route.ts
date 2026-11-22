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
  let msg: { title: string; body: string; url: string; channel?: "chat" } | null = null;

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
  } else if (body.type === "registration_decided") {
    key = "acara";
    // only the admin of the event, and only for a decision made just now
    const { data: rr } = await db.from("event_registrations" as any).select("event_id, user_id, status, decided_at, event:events!event_id(title)").eq("id", id).maybeSingle();
    const r = rr as { event_id: string; user_id: string; status: string; decided_at: string | null; event: { title: string } | null } | null;
    const { data: adm } = r ? await supabase.rpc("event_admin_of" as any, { p_event: r.event_id }) : { data: false };
    if (adm !== true || !r || !r.decided_at || Date.now() - new Date(r.decided_at).getTime() > 10 * 60_000 || !["approved", "rejected"].includes(r.status)) {
      return NextResponse.json({ ok: true, skipped: "not decided by you just now" });
    }
    const seen = (globalThis as any).__regPushSeen ?? ((globalThis as any).__regPushSeen = new Map<string, number>());
    const dedupe = `${id}:${r.status}`;
    if ((seen.get(dedupe) ?? 0) > Date.now() - 3600_000) return NextResponse.json({ ok: true, skipped: "already sent" });
    seen.set(dedupe, Date.now());
    target = r.user_id;
    const title = r.event?.title ?? "acara";
    msg = r.status === "approved"
      ? { title: "Pendaftaranmu disetujui 🎟️", body: `Tiket QR untuk ${title} sudah siap. Ketuk untuk membukanya.`, url: `/acara/${r.event_id}`, channel: "chat" }
      : { title: "Pendaftaran belum disetujui", body: `Pendaftaranmu untuk ${title} belum bisa disetujui. Ketuk untuk melihat alasannya.`, url: `/acara/${r.event_id}`, channel: "chat" };
  } else if (body.type === "timeline_tag" || body.type === "timeline_accepted") {
    key = "timeline";
    const { data: tv } = await db.from("timeline_events" as any).select("id, title, owner_id, starts_at").eq("id", id).maybeSingle();
    const t = tv as { id: string; title: string; owner_id: string; starts_at: string } | null;
    if (!t) return NextResponse.json({ ok: true, skipped: "no event" });
    const { data: who } = await db.from("profiles").select("full_name, nama_panggilan").eq("id", user.id).maybeSingle();
    const name = (who as any)?.nama_panggilan || (who as any)?.full_name || "Seseorang";
    const seen = (globalThis as any).__tlPushSeen ?? ((globalThis as any).__tlPushSeen = new Map<string, number>());
    const once = (k: string) => { if ((seen.get(k) ?? 0) > Date.now() - 3600_000) return false; seen.set(k, Date.now()); return true; };

    if (body.type === "timeline_accepted") {
      const { data: me } = await db.from("timeline_participants" as any).select("status").eq("event_id", id).eq("user_id", user.id).maybeSingle();
      if ((me as any)?.status !== "accepted" || !once(`acc:${id}:${user.id}`)) return NextResponse.json({ ok: true, skipped: "nothing to send" });
      target = t.owner_id;
      msg = { title: "Ajakan kolaborasi diterima", body: `${name} ikut di "${t.title}".`, url: "/?tab=service", channel: "chat" };
    } else {
      // the person who tagged must be allowed to edit this event; send to everyone invited in the last 10 minutes
      const { data: can } = await supabase.rpc("timeline_can_edit" as any, { p_event: id });
      if (can !== true) return NextResponse.json({ ok: true, skipped: "not your event" });
      const since = new Date(Date.now() - 10 * 60_000).toISOString();
      const { data: inv } = await db.from("timeline_participants" as any).select("user_id").eq("event_id", id).eq("status", "invited").gte("invited_at", since);
      const ids = ((inv as { user_id: string }[]) ?? []).map((x) => x.user_id).filter((u) => u !== user.id && once(`tag:${id}:${u}`));
      if (ids.length === 0) return NextResponse.json({ ok: true, skipped: "nobody new" });
      const { data: rows } = await db.from("push_tokens" as any).select("token").in("user_id", ids);
      const tokens = ((rows as { token: string }[]) ?? []).map((r) => r.token);
      const res = await sendPush(tokens, { title: "Kamu diajak berkolaborasi 🤝", body: `${name} menandai kamu di "${t.title}". Buka Beranda, Pelayanan Saya untuk menerima.`, url: "/?tab=service", channel: "chat" });
      if (res.invalid.length) await db.from("push_tokens" as any).delete().in("token", res.invalid);
      return NextResponse.json({ ok: true, sent: res.sent });
    }
  } else if (body.type === "friend_request" || body.type === "friend_accepted") {
    key = "teman";
    const { data: fr } = await db.from("friendships" as any).select("requester_id, receiver_id, status, created_at").eq("id", id).maybeSingle();
    const f = fr as { requester_id: string; receiver_id: string; status: string; created_at: string } | null;
    const accepted = body.type === "friend_accepted";
    // the caller must really be the one who sent the request / accepted it, and only once
    const okCaller = !!f && (accepted ? f.receiver_id === user.id && f.status === "accepted" : f.requester_id === user.id && f.status === "pending" && Date.now() - new Date(f.created_at).getTime() < 10 * 60_000);
    if (!f || !okCaller) return NextResponse.json({ ok: true, skipped: "not a fresh friend action" });
    const seen = (globalThis as any).__friendPushSeen ?? ((globalThis as any).__friendPushSeen = new Map<string, number>());
    const dedupe = `${body.type}:${id}`;
    if ((seen.get(dedupe) ?? 0) > Date.now() - 3600_000) return NextResponse.json({ ok: true, skipped: "already sent" });
    seen.set(dedupe, Date.now());
    target = accepted ? f.requester_id : f.receiver_id;
    const { data: who } = await db.from("profiles").select("full_name, nama_panggilan").eq("id", user.id).maybeSingle();
    const name = (who as any)?.nama_panggilan || (who as any)?.full_name || "Seseorang";
    msg = accepted
      ? { title: "Ajakan pertemananmu diterima 🤝", body: `${name} sekarang berteman denganmu.`, url: "/community/friends", channel: "chat" }
      : { title: "Ajakan pertemanan 🙋", body: `${name} mengajakmu berteman di Ruang Iman.`, url: "/community/friends", channel: "chat" };
  } else {
    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  }

  // Respect the person's switch (no saved choice yet = allowed)
  const { data: pref } = await db.from("prayer_reminders" as any).select("slots").eq("user_id", target).maybeSingle();
  const slots = (pref as { slots: string[] | null } | null)?.slots;
  if (slots && slots.length === 0) return NextResponse.json({ ok: true, skipped: "switched off" });

  const { data: tokenRows } = await db.from("push_tokens" as any).select("token").eq("user_id", target);
  const tokens = ((tokenRows as { token: string }[]) ?? []).map((t) => t.token);
  const res = await sendPush(tokens, msg);
  if (res.invalid.length) await db.from("push_tokens" as any).delete().in("token", res.invalid);
  return NextResponse.json({ ok: true, sent: res.sent });
}
