"use client";

import { createClient } from "@/lib/supabase/client";

/** Prayer game: what counts, local dates, levels. Points are decided on the server (094 SQL). */
export type ActivityKind = "bible" | "devotion" | "prayer" | "rosary" | "jalan_salib" | "ekaristi" | "aramaic" | "reading";

// Everyone starts fresh on this day; earlier days are never "missed"
export const LAUNCH_DAY = "2026-10-26";

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD in the phone's own time zone */
export const localDay = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (day: string, n: number) => {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + n));
};
const dayIndexMonFirst = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
};
export const weekStart = (day: string) => addDays(day, -dayIndexMonFirst(day));
export const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const LEVELS = [
  { min: 0, name: "Pemula Doa" },
  { min: 100, name: "Peziarah" },
  { min: 300, name: "Setia" },
  { min: 700, name: "Sahabat Doa" },
  { min: 1500, name: "Pendoa Tekun" },
  { min: 3000, name: "Saksi Iman" },
];
export function levelFor(points: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => { if (points >= l.min) i = idx; });
  return { level: LEVELS[i], next: LEVELS[i + 1] ?? null };
}

/** Tell the server the person prayed or read something. Silent: it never breaks the page. */
export async function recordActivity(kind: ActivityKind, ref = "") {
  try {
    const { data, error } = await createClient().rpc("record_activity", { p_kind: kind, p_ref: ref, p_day: localDay() });
    if (!error && typeof data === "number" && data > 0) window.dispatchEvent(new Event("activity-recorded"));
  } catch {
    /* ignore */
  }
}
