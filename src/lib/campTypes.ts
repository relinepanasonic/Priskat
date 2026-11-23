/** Types that run as a numbered series (Angkatan). Every other type is a one-off event with its own title. */
export const CAMP_SERIES = ["Pria Sejati", "Bapa Sejati Katolik", "Wanita Berhikmat", "Youngman", "Youngwoman", "Patriot"] as const;

/** One list for camps and events: a camp is a series, an event is a one-off. */
export const CAMP_EVENT_TYPES = [
  ...CAMP_SERIES,
  "KKR",
  "Persekutuan Doa / Fellowship",
  "Konser",
  "Doa Bersama",
  "Rosario",
  "Jalan Salib",
  "Other",
] as const;

export function isCampSeries(type: string | null | undefined): boolean {
  return (CAMP_SERIES as readonly string[]).includes(type ?? "");
}
