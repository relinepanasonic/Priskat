import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";
import { REMINDER_SLOTS } from "@/lib/reminders";

/**
 * Called every 15 minutes by the Supabase cron job in supabase/087.
 * For each person with reminders on, works out their local time and sends the ones that are due.
 */
export async function POST(request: Request) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-push-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: rows } = await db.from("prayer_reminders" as any).select("user_id, slots, tz_offset");
  const people = ((rows as { user_id: string; slots: string[] | null; tz_offset: number | null }[]) ?? []).filter((r) => r.slots?.length);
  if (people.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // due[userId] = slots due right now (local time rounded down to the quarter hour)
  const due = new Map<string, typeof REMINDER_SLOTS>();
  for (const p of people) {
    const local = new Date(Date.now() + (p.tz_offset ?? 420) * 60_000);
    const hhmm = `${String(local.getUTCHours()).padStart(2, "0")}:${String(Math.floor(local.getUTCMinutes() / 15) * 15).padStart(2, "0")}`;
    const slots = REMINDER_SLOTS.filter((s) => p.slots!.includes(s.key) && s.times.includes(hhmm));
    if (slots.length) due.set(p.user_id, slots);
  }
  if (due.size === 0) return NextResponse.json({ ok: true, sent: 0 });

  // "Tebus Hari" nudge: only for people who did nothing on the day that just ended (local time)
  const GAME_START = "2026-10-26";
  for (const [userId, slots] of [...due.entries()]) {
    if (!slots.some((x) => x.onlyIfMissedYesterday)) continue;
    const p = people.find((q) => q.user_id === userId);
    const localNow = new Date(Date.now() + (p?.tz_offset ?? 420) * 60_000);
    const yesterday = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate() - 1)).toISOString().slice(0, 10);
    const { count } = await db.from("daily_activity" as any).select("id", { count: "exact", head: true }).eq("user_id", userId).eq("day", yesterday);
    if (yesterday < GAME_START || (count ?? 0) > 0) {
      const rest = slots.filter((x) => !x.onlyIfMissedYesterday);
      if (rest.length) due.set(userId, rest); else due.delete(userId);
    }
  }
  if (due.size === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: tokenRows } = await db.from("push_tokens" as any).select("token, user_id").in("user_id", [...due.keys()]);
  let sent = 0;
  const invalid: string[] = [];
  for (const t of (tokenRows as { token: string; user_id: string }[]) ?? []) {
    for (const slot of due.get(t.user_id) ?? []) {
      const r = await sendPush([t.token], { title: slot.title, body: slot.body, url: slot.url });
      sent += r.sent;
      invalid.push(...r.invalid);
    }
  }
  if (invalid.length) await db.from("push_tokens" as any).delete().in("token", invalid);
  return NextResponse.json({ ok: true, sent });
}
