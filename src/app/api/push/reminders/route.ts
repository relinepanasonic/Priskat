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
