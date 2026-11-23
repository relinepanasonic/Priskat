// Ticket sizes, templates and gradients. Safe for the browser (no image library here).

/** Printable sizes, portrait, at 300 dpi. A5 is 148 x 210 mm; the lanyard badge is a business card (55 x 85 mm). */
export const TICKET_SIZES = {
  a5: { w: 1748, h: 2480, label: "A5", mm: [148, 210] as const },
  card: { w: 650, h: 1004, label: "Lanyard / kartu", mm: [55, 85] as const },
};
export type TicketSize = keyof typeof TICKET_SIZES;
export const sizeOf = (v: string | null | undefined): TicketSize => (v === "card" ? "card" : "a5");

/** Five layouts, like real ID cards: Klasik (name and QR in a panel), Foto Atas, Blok Warna, Gelap, Poster. A framed photo needs no transparent background. */
export const TICKET_TEMPLATES = [
  { id: "klasik", label: "Klasik" },
  { id: "foto", label: "Foto Atas" },
  { id: "blok", label: "Blok Warna" },
  { id: "gelap", label: "Gelap" },
  { id: "poster", label: "Poster" },
] as const;
export type TicketTemplate = (typeof TICKET_TEMPLATES)[number]["id"];
export const templateOf = (v: string | null | undefined): TicketTemplate => (TICKET_TEMPLATES.find((t) => t.id === v)?.id ?? "klasik");

/** Ten gradients for tickets without a background picture. stops: top colour, bottom colour; accent: frame and title colour. */
export const TICKET_GRADIENTS = [
  { id: "navy", label: "Navy", stops: ["#1f2a44", "#0b1020"], accent: "#D6B072" },
  { id: "anggur", label: "Anggur", stops: ["#7a1f3d", "#2b0a16"], accent: "#f2c9a0" },
  { id: "zamrud", label: "Zamrud", stops: ["#0f6b41", "#052e1c"], accent: "#e6d28a" },
  { id: "ungu", label: "Ungu", stops: ["#5b32a0", "#1a0f3a"], accent: "#f0c987" },
  { id: "laut", label: "Laut", stops: ["#0b78a8", "#06283d"], accent: "#f6e3a8" },
  { id: "senja", label: "Senja", stops: ["#e8793a", "#8e2a3c"], accent: "#fff1cf" },
  { id: "hitam", label: "Hitam", stops: ["#2e2e2e", "#000000"], accent: "#D6B072" },
  { id: "teal", label: "Teal", stops: ["#13857a", "#042f2e"], accent: "#fde68a" },
  { id: "mawar", label: "Mawar", stops: ["#c21d68", "#4a0d2a"], accent: "#fde7c8" },
  { id: "abu", label: "Abu", stops: ["#55657a", "#0f172a"], accent: "#e2e8f0" },
] as const;
export type TicketGradient = (typeof TICKET_GRADIENTS)[number]["id"];
export const gradientOf = (v: string | null | undefined) => TICKET_GRADIENTS.find((g) => g.id === v) ?? TICKET_GRADIENTS[0];

