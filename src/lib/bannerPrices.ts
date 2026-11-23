/** What more promotion in the app costs (rupiah). Change the numbers here. The team follows up by WhatsApp. */
export const BANNER_OFFERS = [
  { kind: "extra", label: "Banner tambahan", price: 150000, note: "Satu banner potret (4:5) lagi di Sedang dipromosikan, tayang 14 hari." },
  { kind: "running", label: "Running Banner", price: 350000, note: "Banner lebar (16:9, mis. 1280 x 720) yang berjalan pelan di bagian atas Event, tayang 14 hari. Tim Ruang Iman yang memasangnya." },
] as const;
export type BannerKind = (typeof BANNER_OFFERS)[number]["kind"];
