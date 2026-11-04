import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

/**
 * "See you at CG!": one hour before a Connect Group meets, everyone in the group who has the app gets a
 * friendly invitation. Called by the 15-minute reminder job. Event times are Jakarta time (WIB).
 */
const WIB = 7 * 3600_000;

const TEMPLATES: ((cg: string, time: string) => { title: string; body: string })[] = [
  (cg, time) => ({ title: "Sebentar lagi kita kumpul! 🎉", body: `${cg} mulai jam ${time}, tinggal 1 jam lagi. Yuk datang, kami menunggu senyummu! 😄` }),
  (cg, time) => ({ title: "Siap seru-seruan bareng? 🤗", body: `${cg} jam ${time}. Ada saudara seiman yang kangen ngobrol denganmu, jangan sampai ketinggalan ya!` }),
  (cg, time) => ({ title: "1 jam lagi Connect Group! ✨", body: `${cg} dimulai jam ${time}. Bawa semangat dan hati yang gembira, kita bertumbuh bersama! 🙌` }),
  (cg, time) => ({ title: "Waktunya berkumpul! 🥳", body: `${cg} jam ${time}. Tuhan sudah menyiapkan sukacita buat kita, sampai ketemu sebentar lagi! 💛` }),
];

const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

type Row = {
  id: string; name: string; event_day: number; event_time: string;
  community: { id: string; slug: string | null } | null;
  members: { user_id: string | null; role: string }[];
};

export async function sendCgInvites(db: SupabaseClient): Promise<number> {
  const now = new Date(Date.now() + WIB);
  const isoDay = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const slotStart = Math.floor(nowMin / 15) * 15; // this run covers [slotStart, slotStart + 15)

  const { data } = await db
    .from("connect_groups")
    .select("id, name, event_day, event_time, community:communities!community_id(id, slug), members:connect_group_members(user_id, role)")
    .eq("event_day", isoDay)
    .not("event_time", "is", null);

  // Groups that meet exactly one hour after this slot (event time minus 60 minutes falls inside the slot)
  const due = ((data as unknown as Row[]) ?? []).filter((g) => {
    const [h, m] = g.event_time.split(":").map(Number);
    const target = h * 60 + m - 60;
    return target >= slotStart && target < slotStart + 15;
  });
  if (due.length === 0) return 0;

  const people = [...new Set(due.flatMap((g) => g.members.map((m) => m.user_id).filter((x): x is string => !!x)))];
  if (people.length === 0) return 0;

  // Respect a person's switch ("Ajakan Connect Group"); nobody who never chose is skipped
  const [{ data: prefs }, { data: tokens }] = await Promise.all([
    db.from("prayer_reminders").select("user_id, slots").in("user_id", people),
    db.from("push_tokens").select("token, user_id").in("user_id", people),
  ]);
  const off = new Set(((prefs as { user_id: string; slots: string[] | null }[]) ?? []).filter((p) => p.slots && !p.slots.includes("cg")).map((p) => p.user_id));
  const tokensOf = new Map<string, string[]>();
  for (const t of (tokens as { token: string; user_id: string }[]) ?? []) tokensOf.set(t.user_id, [...(tokensOf.get(t.user_id) ?? []), t.token]);

  let sent = 0;
  const invalid: string[] = [];
  const today = now.toISOString().slice(0, 10);
  for (const g of due) {
    const time = g.event_time.slice(0, 5).replace(":", ".");
    const msg = TEMPLATES[hash(g.id + today) % TEMPLATES.length](g.name, time);
    const where = g.community?.slug || g.community?.id;
    for (const m of g.members) {
      if (!m.user_id || off.has(m.user_id)) continue;
      // PIC and pengurus open their group; ordinary anggota just open the community
      const url = m.role !== "anggota" && where ? `/camp/${where}/connect-group` : "/camp";
      const r = await sendPush(tokensOf.get(m.user_id) ?? [], { ...msg, url });
      sent += r.sent;
      invalid.push(...r.invalid);
    }
  }
  if (invalid.length) await db.from("push_tokens").delete().in("token", invalid);
  return sent;
}
