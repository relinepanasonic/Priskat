import sharp from "sharp";
import QRCode from "qrcode";
import { ticketPayload } from "@/lib/eventReg";

/** Printable sizes, portrait, at 300 dpi. A5 is 148 x 210 mm; the lanyard badge is a business card (55 x 85 mm). */
export const TICKET_SIZES = {
  a5: { w: 1748, h: 2480, label: "A5", mm: [148, 210] as const },
  card: { w: 650, h: 1004, label: "Lanyard / kartu", mm: [55, 85] as const },
};
export type TicketSize = keyof typeof TICKET_SIZES;
export const sizeOf = (v: string | null | undefined): TicketSize => (v === "card" ? "card" : "a5");

/** Five layouts. They are used with a background picture or with one of the gradients below. */
export const TICKET_TEMPLATES = [
  { id: "klasik", label: "Klasik" },
  { id: "modern", label: "Modern" },
  { id: "gelap", label: "Gelap" },
  { id: "tengah", label: "Tengah" },
  { id: "polos", label: "Polos" },
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

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The QR code itself (white background, quiet border so any scanner reads it). */
export async function qrPng(code: string, px = 700): Promise<Buffer> {
  return QRCode.toBuffer(ticketPayload(code), { width: px, margin: 2, errorCorrectionLevel: "M", type: "png" });
}

/** Break a long name into at most two lines */
function nameLines(name: string, perLine: number): string[] {
  const n = name.trim().replace(/\s+/g, " ");
  if (n.length <= perLine) return [n];
  const words = n.split(" ");
  let a = "";
  let i = 0;
  while (i < words.length && (a + " " + words[i]).trim().length <= perLine) { a = (a + " " + words[i]).trim(); i++; }
  const b = words.slice(i).join(" ");
  return b ? [a || words[0], b.length > perLine + 6 ? b.slice(0, perLine + 3) + "..." : b] : [a];
}

async function loadBackground(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

/** Where the light/dark panel sits and how it looks, per template */
function panelFor(template: TicketTemplate, w: number, h: number) {
  switch (template) {
    case "modern": return { x: 0, y: Math.round(h * 0.4), w, h: Math.round(h * 0.6), rx: 0, fill: "#ffffff", op: 1, ink: "#111827", sub: "#6b7280", frame: false, band: true };
    case "gelap": { const pw = Math.round(w * 0.84), ph = Math.round(h * 0.58); return { x: Math.round((w - pw) / 2), y: Math.round(h - ph - h * 0.04), w: pw, h: ph, rx: Math.round(w * 0.035), fill: "#0b1020", op: 0.9, ink: "#ffffff", sub: "#9ca3af", frame: true, band: false }; }
    case "tengah": { const pw = Math.round(w * 0.8), ph = Math.round(h * 0.66); return { x: Math.round((w - pw) / 2), y: Math.round((h - ph) / 2 + h * 0.03), w: pw, h: ph, rx: Math.round(w * 0.05), fill: "#ffffff", op: 0.95, ink: "#111827", sub: "#6b7280", frame: true, band: false }; }
    case "polos": { const pw = Math.round(w * 0.9), ph = Math.round(h * 0.52); return { x: Math.round((w - pw) / 2), y: Math.round(h - ph - h * 0.06), w: pw, h: ph, rx: Math.round(w * 0.02), fill: "#ffffff", op: 1, ink: "#111827", sub: "#6b7280", frame: false, band: false }; }
    default: { const pw = Math.round(w * 0.84), ph = Math.round(h * 0.58); return { x: Math.round((w - pw) / 2), y: Math.round(h - ph - h * 0.04), w: pw, h: ph, rx: Math.round(w * 0.035), fill: "#ffffff", op: 0.94, ink: "#111827", sub: "#6b7280", frame: true, band: false }; }
  }
}

/**
 * The ticket: the admin's background picture (or one of ten gradients), a panel with the event title, the person's
 * name large and the QR code. The panel position and colours come from the chosen template (five of them).
 */
export async function ticketPng(opts: {
  name: string; event: string; code: string; size: TicketSize; bgUrl?: string | null; template?: string | null; gradient?: string | null;
}): Promise<Buffer> {
  const { w, h } = TICKET_SIZES[opts.size];
  const template = templateOf(opts.template);
  const grad = gradientOf(opts.gradient);
  const p = panelFor(template, w, h);
  const bgBuf = await loadBackground(opts.bgUrl);

  let base: ReturnType<typeof sharp>;
  if (bgBuf) {
    base = sharp(bgBuf).resize(w, h, { fit: "cover", position: "centre" }).flatten({ background: "#0f1a33" });
  } else {
    const sw = Math.max(3, w * 0.004);
    const frame = p.frame ? `<rect x="${w * 0.04}" y="${w * 0.04}" width="${w * 0.92}" height="${h - w * 0.08}" rx="${w * 0.04}" fill="none" stroke="${grad.accent}" stroke-width="${sw}"/>` : "";
    const slash = template === "modern" ? `<polygon points="0,${h * 0.22} ${w},${h * 0.1} ${w},${h * 0.16} 0,${h * 0.28}" fill="${grad.accent}" fill-opacity="0.9"/>` : "";
    const plain = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${grad.stops[0]}"/><stop offset="1" stop-color="${grad.stops[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>${slash}${frame}<text x="${w / 2}" y="${h * 0.16}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${w * 0.07}" fill="${grad.accent}" letter-spacing="${w * 0.008}">RUANG IMAN</text></svg>`;
    base = sharp(Buffer.from(plain));
  }

  const qrSize = Math.round(Math.min(p.w * (template === "tengah" ? 0.68 : 0.62), p.h * (template === "tengah" ? 0.6 : 0.56)));
  const qrX = Math.round((w - qrSize) / 2);
  const qrY = p.y + Math.round(p.h * 0.33);

  const perLine = opts.size === "a5" ? 20 : 17;
  const lines = nameLines(opts.name, perLine);
  const nameSize = Math.round(w * (lines.length > 1 ? 0.058 : 0.07) * (lines[0].length > 16 ? 0.9 : 1));
  const nameY = p.y + Math.round(p.h * 0.14);
  const eventSize = Math.round(w * 0.032);
  const eventLines = nameLines(opts.event, opts.size === "a5" ? 34 : 24).slice(0, 2);

  const band = p.band ? `<rect x="0" y="${p.y}" width="${w}" height="${Math.max(6, Math.round(h * 0.012))}" fill="${grad.accent}"/>` : "";
  const stroke = template === "polos" ? ` stroke="#d1d5db" stroke-width="${Math.max(2, w * 0.002)}"` : "";
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${p.rx}" fill="${p.fill}" fill-opacity="${p.op}"${stroke}/>
    ${band}
    <text x="${w / 2}" y="${p.y + eventSize * 1.9}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${eventSize}" fill="${p.sub}" letter-spacing="${w * 0.002}">${esc(eventLines[0].toUpperCase())}</text>
    ${eventLines[1] ? `<text x="${w / 2}" y="${p.y + eventSize * 3.1}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${eventSize}" fill="${p.sub}" letter-spacing="${w * 0.002}">${esc(eventLines[1].toUpperCase())}</text>` : ""}
    ${lines.map((l, i) => `<text x="${w / 2}" y="${nameY + (eventLines[1] ? eventSize * 1.4 : 0) + i * nameSize * 1.12 + nameSize * 0.55}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${nameSize}" fill="${p.ink}">${esc(l)}</text>`).join("")}
    <text x="${w / 2}" y="${p.y + p.h - eventSize * 0.9}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${Math.round(eventSize * 0.8)}" fill="${p.sub}">Tunjukkan QR ini kepada panitia</text>
  </svg>`;

  const qr = await sharp(await qrPng(opts.code, qrSize)).resize(qrSize, qrSize).png().toBuffer();
  return base
    .composite([{ input: Buffer.from(text), top: 0, left: 0 }, { input: qr, top: qrY, left: qrX }])
    .png({ compressionLevel: 8 })
    .toBuffer();
}
