/** Merge class names (simple implementation without external deps) */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ").trim();
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** The date parts in Jakarta time (WIB), so a server in another time zone and a phone show the same day. */
function jakartaParts(date: string | Date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const j = new Date(d.getTime() + 7 * 3600_000);
  return { day: j.getUTCDate(), month: j.getUTCMonth(), year: j.getUTCFullYear(), weekday: j.getUTCDay(), hour: j.getUTCHours(), minute: j.getUTCMinutes() };
}
const two = (n: number) => String(n).padStart(2, "0");

/** The one date format of the app: dd MMM yyyy, months Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des (e.g. 09 Sep 2026) */
export function formatDate(date: string | Date): string {
  if (!date) return "";
  const p = jakartaParts(date);
  return p ? `${two(p.day)} ${MONTHS_ID[p.month]} ${p.year}` : "";
}

/** With the day of the week: "Senin, 23 Nov 2026" */
export function formatWeekdayDate(date: string | Date): string {
  const p = date ? jakartaParts(date) : null;
  return p ? `${DAYS_ID[p.weekday]}, ${two(p.day)} ${MONTHS_ID[p.month]} ${p.year}` : "";
}

/** Clock time in Jakarta: "17:30" */
export function formatTime(date: string | Date): string {
  const p = date ? jakartaParts(date) : null;
  return p ? `${two(p.hour)}:${two(p.minute)}` : "";
}

/** Date + time: "09 Sep 2026, 17:30" */
export function formatDateTime(date: string | Date): string {
  if (!date) return "";
  const p = jakartaParts(date);
  return p ? `${formatDate(date)}, ${two(p.hour)}:${two(p.minute)}` : "";
}

/** Generate a URL-safe slug from a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text with ellipsis */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "…";
}
