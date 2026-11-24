import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

/**
 * "Take the picture": while an event is on, everyone with an approved registration who has the Ruang Iman app (a push token)
 * gets an invitation to take photos for the event album: once when the event starts, then every 3 hours while it runs.
 * Guests who never installed the app have no token, so they are skipped on their own.
 * Called by the 15-minute reminder job (/api/push/reminders). Chat tone + vibration, following each person's sound / vibrate choice.
 */
const EVERY = 3 * 3600_000;
const SLOT = 15 * 60_000;
const LONG_AGO = 4 * 3600_000; // an event without an end time counts as running for 4 hours

// five different sentences, so two reminders in a row never read the same
const TEMPLATES: ((event: string) => { title: string; body: string })[] = [
  (e) => ({ title: "📸 Abadikan momennya!", body: `Take the picture ${e} dari sisimu, supaya jadi kenang-kenangan untuk kita semua.` }),
  (e) => ({ title: "Jangan cuma dilihat, difoto juga! 🤳", body: `Ada momen seru di ${e}? Tangkap dari sudut pandangmu dan taruh di album bersama.` }),
  (e) => ({ title: "Kamera sudah siap? ✨", body: `Foto dari sisimu adalah kenangan yang tidak dimiliki orang lain. Bagikan ke album ${e}!` }),
  (e) => ({ title: "Senyum dulu, klik! 😄", body: `Ajak teman-teman foto bareng di ${e}, lalu simpan di album supaya semua bisa mengenangnya.` }),
  (e) => ({ title: "Satu foto, seribu kenangan 💛", body: `Yuk jadi juru foto ${e}. Satu klik darimu bisa jadi kenangan indah untuk banyak orang.` }),
];

const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

type Ev = { id: string; title: string; event_date: string; end_date: string | null };

export async function sendEventPhotoNudges(db: SupabaseClient): Promise<number> {
  const t1 = Math.floor(Date.now() / SLOT) * SLOT + SLOT; // this run covers [t0, t1)
  const t0 = t1 - SLOT;

  const { data } = await db.from("events").select("id, title, event_date, end_date")
    .eq("status", "published")
    .lte("event_date", new Date(t1).toISOString())
    .or(`end_date.gte.${new Date(t0).toISOString()},and(end_date.is.null,event_date.gte.${new Date(t0 - LONG_AGO).toISOString()})`);

  // events with a nudge due in this slot: the start, then every 3 hours, always before the event ends
  const due: { ev: Ev; k: number }[] = [];
  for (const ev of (data as Ev[]) ?? []) {
    const start = new Date(ev.event_date).getTime();
    const end = ev.end_date ? new Date(ev.end_date).getTime() : start + LONG_AGO;
    const k = Math.max(0, Math.ceil((t0 - start) / EVERY));
    const at = start + k * EVERY;
    if (at >= t0 && at < t1 && at < end) due.push({ ev, k });
  }
  if (due.length === 0) return 0;

  let sent = 0;
  const invalid: string[] = [];
  for (const { ev, k } of due) {
    const { data: regs } = await db.from("event_registrations").select("user_id").eq("event_id", ev.id).eq("status", "approved");
    const people = [...new Set(((regs as { user_id: string | null }[]) ?? []).map((r) => r.user_id).filter((x): x is string => !!x))];
    if (people.length === 0) continue;
    const [{ data: prefs }, { data: tokens }] = await Promise.all([
      db.from("prayer_reminders").select("user_id, slots").in("user_id", people),
      db.from("push_tokens").select("token, user_id").in("user_id", people),
    ]);
    // someone who switched all reminders off is left alone
    const off = new Set(((prefs as { user_id: string; slots: string[] | null }[]) ?? []).filter((p) => p.slots && p.slots.length === 0).map((p) => p.user_id));
    const tokenList = ((tokens as { token: string; user_id: string }[]) ?? []).filter((t) => !off.has(t.user_id)).map((t) => t.token);
    if (tokenList.length === 0) continue;
    const msg = TEMPLATES[(hash(ev.id) + k) % TEMPLATES.length](ev.title);
    const r = await sendPush(tokenList, { ...msg, url: `/album/${ev.id}`, channel: "chat" });
    sent += r.sent;
    invalid.push(...r.invalid);
  }
  if (invalid.length) await db.from("push_tokens").delete().in("token", invalid);
  return sent;
}
