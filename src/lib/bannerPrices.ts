/** What more promotion in the app costs (rupiah). Change the numbers here. The team follows up by WhatsApp. */
export const BANNER_OFFERS = [
  { kind: "extra", label: "Banner tambahan", price: 150000, note: "Satu banner lagi di Beranda Event, tayang 14 hari." },
  { kind: "running", label: "Running Banner", price: 350000, note: "Banner berjalan yang lebih menonjol di Beranda, tayang 14 hari." },
] as const;
export type BannerKind = (typeof BANNER_OFFERS)[number]["kind"];
