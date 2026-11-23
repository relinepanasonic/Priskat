import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";
import { audienceLabel, audienceMatches } from "@/lib/crewRoles";
import { formatDateTime } from "@/lib/utils";

/**
 * Notify the committee about a meeting: everybody, the leaders (Petinggi), or one team (a crew position).
 *   POST /api/camp/meeting-notify  { meeting: <id> }
 * The caller must be in this workspace (the database decides). Only crew with a Ruang Iman account get the notification.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { meeting?: string } = {};
  try { body = await request.json(); } catch { /* none */ }
  const id = String(body.meeting ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const db = createAdminClient();
  const { data: mt } = await db.from("camp_meetings").select("id, cohort_id, title, date_time, audience").eq("id", id).maybeSingle();
  const m = mt as { id: string; cohort_id: string; title: string; date_time: string | null; audience: string | null } | null;
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { data: ok } = await supabase.rpc("can_access_cohort" as any, { p_cohort: m.cohort_id });
  if (ok !== true) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: crew } = await db.from("camp_crew").select("user_id, position").eq("cohort_id", m.cohort_id);
  const ids = [...new Set(((crew as { user_id: string | null; position: string | null }[]) ?? [])
    .filter((c) => c.user_id && c.user_id !== user.id && audienceMatches(m.audience, c.position))
    .map((c) => c.user_id as string))];
  if (ids.length === 0) return NextResponse.json({ ok: true, sent: 0, people: 0, reason: "no one with an account" });

  const { data: coh } = await db.from("camp_cohorts").select("community:communities!community_id(slug)").eq("id", m.cohort_id).maybeSingle();
  const slug = (coh as { community?: { slug?: string | null } | null } | null)?.community?.slug;
  const { data: rows } = await db.from("push_tokens" as any).select("token").in("user_id", ids);
  const tokens = ((rows as { token: string }[]) ?? []).map((r) => r.token);
  const when = m.date_time ? formatDateTime(m.date_time) + " WIB" : "jadwal menyusul";
  const res = await sendPush(tokens, {
    title: `Rapat: ${m.title}`,
    body: `${when} · ${audienceLabel(m.audience)}`,
    url: slug ? `/camp/${slug}/ongoing/${m.cohort_id}` : "/",
    channel: "chat",
  });
  if (res.invalid.length) await db.from("push_tokens" as any).delete().in("token", res.invalid);
  await db.from("camp_meetings").update({ notified_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true, sent: res.sent, people: ids.length });
}
