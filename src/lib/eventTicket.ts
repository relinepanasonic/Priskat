import sharp from "sharp";
import QRCode from "qrcode";
import { ticketPayload } from "@/lib/eventReg";

/** Printable sizes, portrait, at 300 dpi. A5 is 148 x 210 mm; the badge is a business card (55 x 85 mm). */
export const TICKET_SIZES = {
  a5: { w: 1748, h: 2480, label: "A5", mm: [148, 210] as const },
  card: { w: 650, h: 1004, label: "Kartu nama", mm: [55, 85] as const },
};
export type TicketSize = keyof typeof TICKET_SIZES;
export const sizeOf = (v: string | null | undefined): TicketSize => (v === "card" ? "card" : "a5");

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

/**
 * The ticket: the admin's background design (or a plain navy and gold one), a light panel with the event title,
 * the person's name large, and the QR code. The panel sits in the lower part so the design stays visible above it.
 */
export async function ticketPng(opts: { name: string; event: string; code: string; size: TicketSize; bgUrl?: string | null }): Promise<Buffer> {
  const { w, h } = TICKET_SIZES[opts.size];
  const bgBuf = await loadBackground(opts.bgUrl);

  let base: ReturnType<typeof sharp>;
  if (bgBuf) {
    base = sharp(bgBuf).resize(w, h, { fit: "cover", position: "centre" }).flatten({ background: "#0f1a33" });
  } else {
    const plain = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a44"/><stop offset="1" stop-color="#0b1020"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect x="${w * 0.04}" y="${w * 0.04}" width="${w * 0.92}" height="${h - w * 0.08}" rx="${w * 0.04}" fill="none" stroke="#D6B072" stroke-width="${Math.max(3, w * 0.004)}"/><text x="${w / 2}" y="${h * 0.16}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${w * 0.07}" fill="#D6B072" letter-spacing="${w * 0.008}">RUANG IMAN</text></svg>`;
    base = sharp(Buffer.from(plain));
  }

  const panelW = Math.round(w * 0.84);
  const panelX = Math.round((w - panelW) / 2);
  const panelH = Math.round(h * 0.58);
  const panelY = Math.round(h - panelH - h * 0.04);
  const qrSize = Math.round(Math.min(panelW * 0.62, panelH * 0.56));
  const qrX = Math.round((w - qrSize) / 2);
  const qrY = panelY + Math.round(panelH * 0.33);

  const perLine = opts.size === "a5" ? 20 : 17;
  const lines = nameLines(opts.name, perLine);
  const nameSize = Math.round(w * (lines.length > 1 ? 0.058 : 0.07) * (lines[0].length > 16 ? 0.9 : 1));
  const nameY = panelY + Math.round(panelH * 0.14);
  const eventSize = Math.round(w * 0.032);
  const eventLines = nameLines(opts.event, opts.size === "a5" ? 34 : 24).slice(0, 2);

  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${w * 0.035}" fill="#ffffff" fill-opacity="0.94"/>
    <text x="${w / 2}" y="${panelY + eventSize * 1.9}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${eventSize}" fill="#6b7280" letter-spacing="${w * 0.002}">${esc(eventLines[0].toUpperCase())}</text>
    ${eventLines[1] ? `<text x="${w / 2}" y="${panelY + eventSize * 3.1}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${eventSize}" fill="#6b7280" letter-spacing="${w * 0.002}">${esc(eventLines[1].toUpperCase())}</text>` : ""}
    ${lines.map((l, i) => `<text x="${w / 2}" y="${nameY + (eventLines[1] ? eventSize * 1.4 : 0) + i * nameSize * 1.12 + nameSize * 0.55}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${nameSize}" fill="#111827">${esc(l)}</text>`).join("")}
    <text x="${w / 2}" y="${panelY + panelH - eventSize * 0.9}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${Math.round(eventSize * 0.8)}" fill="#6b7280">Tunjukkan QR ini kepada panitia</text>
  </svg>`;

  const qr = await sharp(await qrPng(opts.code, qrSize)).resize(qrSize, qrSize).png().toBuffer();
  return base
    .composite([{ input: Buffer.from(text), top: 0, left: 0 }, { input: qr, top: qrY, left: qrX }])
    .png({ compressionLevel: 8 })
    .toBuffer();
}
