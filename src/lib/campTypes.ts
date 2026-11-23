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

/** Tipe Event: the kind of gathering. A Camp then has a name from CAMP_SERIES (or Other); the rest are named by hand. */
export const EVENT_KINDS = ["Camp", "KKR", "Persekutuan Doa / Fellowship", "Konser", "Doa Bersama", "Rosario", "Jalan Salib", "Other"] as const;
