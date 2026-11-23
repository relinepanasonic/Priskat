import sharp, { type OverlayOptions } from "sharp";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { parse, type Font } from "opentype.js";
import { ticketPayload } from "@/lib/eventReg";
import { TICKET_SIZES, templateOf, gradientOf, type TicketSize, type TicketTemplate } from "@/lib/ticketDesign";

export { TICKET_SIZES, sizeOf, TICKET_TEMPLATES, templateOf, TICKET_GRADIENTS, gradientOf } from "@/lib/ticketDesign";
export type { TicketSize, TicketTemplate, TicketGradient } from "@/lib/ticketDesign";

/** The QR code itself (white background, quiet border so any scanner reads it). */
export async function qrPng(code: string, px = 700): Promise<Buffer> {
  return QRCode.toBuffer(ticketPayload(code), { width: px, margin: 2, errorCorrectionLevel: "M", type: "png" });
}

// ── Text ─────────────────────────────────────────────────────────────────────
// The server has no fonts installed, so letters drawn with an SVG <text> come out as empty boxes.
// Instead every word is turned into a shape (a path) from a font file that ships with the app.
let fontCache: { bold: Font; regular: Font } | null = null;
function fonts() {
  if (!fontCache) {
    const load = (file: string) => {
      const b = fs.readFileSync(path.join(process.cwd(), "src/assets/fonts", file));
      return parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
    };
    fontCache = { bold: load("LiberationSans-Bold.ttf"), regular: load("LiberationSans-Regular.ttf") };
  }
  return fontCache;
}

type Anchor = "start" | "middle" | "end";
const widthOf = (font: Font, text: string, size: number) => font.getAdvanceWidth(text, size);

/** The biggest size, not above `size`, at which the text fits `maxW` (never below 45%). */
function fitSize(font: Font, text: string, size: number, maxW: number) {
  let s = size;
  while (s > size * 0.45 && widthOf(font, text, s) > maxW) s *= 0.94;
  return s;
}

/** Word-wrap to at most `maxLines` lines; the last one gets an ellipsis if there is more. */
function wrap(font: Font, text: string, size: number, maxW: number, maxLines: number): string[] {
  const words = text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    const next = cur ? `${cur} ${wd}` : wd;
    if (widthOf(font, next, size) <= maxW || !cur) cur = next;
    else { lines.push(cur); cur = wd; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1] + "…";
    while (last.length > 2 && widthOf(font, last, size) > maxW) last = last.slice(0, -2) + "…";
    kept[maxLines - 1] = last;
    return kept;
  }
  return lines;
}

function textPath(font: Font, text: string, x: number, y: number, size: number, fill: string, anchor: Anchor = "start", opacity = 1) {
  if (!text) return "";
  const w = widthOf(font, text, size);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return `<path d="${font.getPath(text, x0, y, size).toPathData(2)}" fill="${fill}" fill-opacity="${opacity}"/>`;
}

/** A name block: one line at the full size, or up to two lines. Returns the shapes and where the next thing can start. */
function nameBlock(font: Font, name: string, x: number, y: number, size: number, maxW: number, fill: string, anchor: Anchor, maxLines = 2) {
  const one = widthOf(font, name, size) <= maxW;
  const s = one ? size : size * 0.86;
  const lines = one ? [name] : wrap(font, name, s, maxW, maxLines);
  let svg = "";
  lines.forEach((l, i) => { svg += textPath(font, l, x, y + i * s * 1.12, fitSize(font, l, s, maxW), fill, anchor); });
  return { svg, bottom: y + (lines.length - 1) * s * 1.12 + s * 0.25 };
}

/** A rounded tag with text in it (the group). */
function chip(font: Font, text: string, x: number, y: number, size: number, fill: string, ink: string, anchor: Anchor = "start") {
  if (!text) return { svg: "", bottom: y };
  const padX = size * 0.7;
  const h = size * 1.75;
  const w = widthOf(font, text, size) + padX * 2;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const svg = `<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>` + textPath(font, text, x0 + padX, y + h / 2 + size * 0.35, size, ink);
  return { svg, bottom: y + h };
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase() || "?";

// ── Pictures ────────────────────────────────────────────────────────────────
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

/** The logo: the community's, or the Ruang Iman logo that ships with the app. Rounded corners, transparent around. */
async function loadLogo(url: string | null | undefined, px: number): Promise<Buffer | null> {
  let buf = await loadBackground(url);
  if (!buf) {
    try { buf = fs.readFileSync(path.join(process.cwd(), "public", "logo.png")); } catch { return null; }
  }
  try {
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><rect width="${px}" height="${px}" rx="${px * 0.2}" fill="#fff"/></svg>`);
    return await sharp(buf).resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  } catch {
    return null;
  }
}

/** A participant's photo, cropped to the frame with rounded corners. A photo with its own background looks fine in a frame. */
async function framedPhoto(buf: Buffer, w: number, h: number, rx: number): Promise<Buffer | null> {
  try {
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}" fill="#fff"/></svg>`);
    return await sharp(buf).rotate().resize(w, h, { fit: "cover", position: "attention" }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  } catch {
    return null;
  }
}

type Box = { x: number; y: number; w: number; h: number };

/**
 * The ticket: the name, the group, the event and the QR on one of five designs (like real ID cards),
 * on the admin's background picture or one of ten gradients. A participant's own photo goes in the frame when there is one.
 */
export async function ticketPng(opts: {
  name: string; event: string; code: string; size: TicketSize; bgUrl?: string | null; template?: string | null; gradient?: string | null;
  group?: string | null; photo?: Buffer | null; logoUrl?: string | null;
}): Promise<Buffer> {
  const { w, h } = TICKET_SIZES[opts.size];
  const template: TicketTemplate = templateOf(opts.template);
  const grad = gradientOf(opts.gradient);
  const F = fonts();
  const bgBuf = await loadBackground(opts.bgUrl);
  const hasBg = !!bgBuf;
  const group = (opts.group ?? "").trim();
  const name = opts.name.trim() || "Peserta";
  const event = opts.event.trim();
  const accent = grad.accent;
  const R = Math.round;

  let base: ReturnType<typeof sharp>;
  if (bgBuf) base = sharp(bgBuf).resize(w, h, { fit: "cover", position: "centre" }).flatten({ background: "#0f1a33" });
  else {
    const fill = template === "gelap"
      ? `<rect width="${w}" height="${h}" fill="#0b0b0b"/>`
      : `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${grad.stops[0]}"/><stop offset="1" stop-color="${grad.stops[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>`;
    base = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${fill}</svg>`));
  }

  // what each template draws: shapes behind the photo, the photo frame, the logo, the QR box, and the text on top
  let back = "";
  let front = "";
  let photoBox: Box | null = null;
  let photoRx = 0;
  let logoBox: Box | null = null;
  let qr: Box = { x: 0, y: 0, w: 0, h: 0 };
  const qrPanel = (b: Box, pad: number, fill = "#ffffff") => `<rect x="${b.x - pad}" y="${b.y - pad}" width="${b.w + pad * 2}" height="${b.h + pad * 2}" rx="${pad * 1.4}" fill="${fill}"/>`;

  if (template === "klasik") {
    const p = { x: R(w * 0.08), y: R(h * 0.4), w: R(w * 0.84), h: R(h * 0.56) };
    back += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${R(w * 0.035)}" fill="#ffffff" fill-opacity="0.95"/>`;
    if (!hasBg) back += `<rect x="${R(w * 0.04)}" y="${R(w * 0.04)}" width="${R(w * 0.92)}" height="${R(h - w * 0.08)}" rx="${R(w * 0.04)}" fill="none" stroke="${accent}" stroke-width="${Math.max(3, w * 0.004)}"/>`;
    logoBox = { x: R(w * 0.4), y: R(h * 0.075), w: R(w * 0.2), h: R(w * 0.2) };
    const ev = wrap(F.bold, event.toUpperCase(), w * 0.028, w * 0.74, 2);
    ev.forEach((l, i) => { front += textPath(F.bold, l, w / 2, p.y + h * 0.05 + i * w * 0.034, w * 0.028, "#6b7280", "middle"); });
    const nb = nameBlock(F.bold, name, w / 2, p.y + h * 0.05 + ev.length * w * 0.034 + w * 0.075, w * 0.075, w * 0.74, "#111827", "middle");
    front += nb.svg;
    front += chip(F.bold, group, w / 2, nb.bottom + w * 0.012, w * 0.032, accent, "#111827", "middle").svg;
    const qs = R(w * 0.36);
    qr = { x: R((w - qs) / 2), y: R(p.y + p.h - qs - h * 0.05), w: qs, h: qs };
    front += textPath(F.regular, "Tunjukkan QR ini kepada panitia", w / 2, p.y + p.h - h * 0.018, w * 0.022, "#6b7280", "middle");
  } else if (template === "foto") {
    photoBox = { x: R(w * 0.07), y: R(h * 0.075), w: R(w * 0.86), h: R(h * 0.42) };
    photoRx = R(w * 0.04);
    back += `<rect x="${R(w * 0.43)}" y="${R(h * 0.02)}" width="${R(w * 0.14)}" height="${R(h * 0.016)}" rx="${R(h * 0.008)}" fill="#000" fill-opacity="0.45"/>`;
    const nb = nameBlock(F.bold, name, w * 0.07, h * 0.58, w * 0.08, w * 0.86, "#ffffff", "start");
    front += nb.svg;
    front += chip(F.bold, group, w * 0.07, nb.bottom + w * 0.012, w * 0.034, accent, "#111827").svg;
    wrap(F.bold, event, w * 0.03, w * 0.5, 3).forEach((l, i) => { front += textPath(F.bold, l, w * 0.07, h * 0.74 + i * w * 0.04, w * 0.03, accent); });
    const qs = R(w * 0.3);
    qr = { x: R(w * 0.93 - qs - w * 0.012), y: R(h * 0.68), w: qs, h: qs };
    front += qrPanel(qr, R(w * 0.014));
    logoBox = { x: R(w * 0.07), y: R(h * 0.88), w: R(w * 0.13), h: R(w * 0.13) };
  } else if (template === "blok") {
    photoBox = { x: 0, y: 0, w, h: R(h * 0.55) };
    back += `<rect x="0" y="0" width="${w}" height="${R(h * 0.55)}" fill="#e5e7eb"/>`;
    back += `<path d="M0,${R(h * 0.5)} L${R(w * 0.5)},${R(h * 0.5)} C${R(w * 0.62)},${R(h * 0.5)} ${R(w * 0.62)},${R(h * 0.58)} ${R(w * 0.74)},${R(h * 0.58)} L${w},${R(h * 0.58)} L${w},${h} L0,${h} Z" fill="${grad.stops[0]}"/>`;
    back += `<rect x="${R(w * 0.4)}" y="${R(h * 0.022)}" width="${R(w * 0.2)}" height="${R(h * 0.016)}" rx="${R(h * 0.008)}" fill="#000" fill-opacity="0.35"/>`;
    const nb = nameBlock(F.bold, name, w * 0.07, h * 0.68, w * 0.082, w * 0.86, "#ffffff", "start");
    front += nb.svg;
    front += textPath(F.regular, group, w * 0.07, nb.bottom + w * 0.04, w * 0.042, accent);
    front += `<rect x="${R(w * 0.07)}" y="${R(h * 0.8)}" width="${R(w * 0.58)}" height="${Math.max(2, R(w * 0.002))}" fill="#fff" fill-opacity="0.3"/>`;
    wrap(F.regular, event, w * 0.03, w * 0.52, 3).forEach((l, i) => { front += textPath(F.regular, l, w * 0.07, h * 0.84 + i * w * 0.04, w * 0.03, "#ffffff", "start", 0.9); });
    const qs = R(w * 0.27);
    qr = { x: R(w - w * 0.07 - qs), y: R(h * 0.79), w: qs, h: qs };
    front += qrPanel(qr, R(w * 0.012));
    logoBox = { x: R(w * 0.05), y: R(h * 0.045), w: R(w * 0.13), h: R(w * 0.13) };
  } else if (template === "gelap") {
    if (hasBg) back += `<rect width="${w}" height="${h}" fill="#000" fill-opacity="0.62"/>`;
    back += `<rect x="${R(w * 0.58)}" y="${R(h * 0.09)}" width="${R(w * 0.34)}" height="${R(h * 0.4)}" fill="${accent}"/>`;
    photoBox = { x: R(w * 0.08), y: R(h * 0.09), w: R(w * 0.6), h: R(h * 0.4) };
    photoRx = R(w * 0.01);
    const nb = nameBlock(F.bold, name, w * 0.08, h * 0.575, w * 0.075, w * 0.84, "#ffffff", "start");
    front += nb.svg;
    front += textPath(F.regular, group, w * 0.08, nb.bottom + w * 0.04, w * 0.036, "#c4c4c4");
    const qs = R(w * 0.33);
    qr = { x: R(w * 0.08), y: R(h * 0.68), w: qs, h: qs };
    front += qrPanel(qr, R(w * 0.012));
    wrap(F.bold, event, w * 0.032, w * 0.42, 4).forEach((l, i) => { front += textPath(F.bold, l, w * 0.5, h * 0.71 + i * w * 0.042, w * 0.032, accent); });
    front += textPath(F.regular, "Tunjukkan QR ini kepada panitia", w * 0.92, h * 0.95, w * 0.022, "#9ca3af", "end");
    logoBox = { x: R(w * 0.92 - w * 0.14), y: R(h * 0.82), w: R(w * 0.14), h: R(w * 0.14) };
  } else {
    // poster: a huge first name, the photo, a tag with the group, the QR
    const parts = name.trim().split(/\s+/);
    const first = (parts[0] ?? name).toUpperCase();
    const rest = parts.slice(1).join(" ").toUpperCase();
    const fs1 = fitSize(F.bold, first, w * 0.22, w * 0.72);
    front += textPath(F.bold, first, w * 0.07, h * 0.15, fs1, accent);
    if (rest) front += textPath(F.bold, rest, w * 0.07, h * 0.15 + fs1 * 0.5, fitSize(F.bold, rest, w * 0.07, w * 0.86), "#ffffff");
    photoBox = { x: R(w * 0.12), y: R(h * 0.255), w: R(w * 0.76), h: R(h * 0.38) };
    photoRx = R(w * 0.035);
    back += `<rect x="${photoBox.x - 6}" y="${photoBox.y - 6}" width="${photoBox.w + 12}" height="${photoBox.h + 12}" rx="${photoRx + 6}" fill="${accent}"/>`;
    front += chip(F.bold, group, w * 0.12, h * 0.6, w * 0.038, accent, "#111827").svg;
    const qs = R(w * 0.3);
    qr = { x: R((w - qs) / 2), y: R(h * 0.7), w: qs, h: qs };
    front += qrPanel(qr, R(w * 0.014));
    wrap(F.bold, event.toUpperCase(), w * 0.03, w * 0.84, 2).forEach((l, i) => { front += textPath(F.bold, l, w / 2, h * 0.935 + i * w * 0.038, w * 0.03, "#ffffff", "middle", 0.95); });
    logoBox = { x: R(w * 0.93 - w * 0.12), y: R(h * 0.035), w: R(w * 0.12), h: R(w * 0.12) };
  }

  const layers: OverlayOptions[] = [{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${back}</svg>`), top: 0, left: 0 }];

  if (photoBox) {
    const framed = opts.photo ? await framedPhoto(opts.photo, photoBox.w, photoBox.h, photoRx) : null;
    if (framed) layers.push({ input: framed, top: photoBox.y, left: photoBox.x });
    else {
      // no photo: the frame shows the person's initials
      const ini = initials(name);
      const sz = photoBox.h * 0.34;
      const ph = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect x="${photoBox.x}" y="${photoBox.y}" width="${photoBox.w}" height="${photoBox.h}" rx="${photoRx}" fill="#000" fill-opacity="0.28"/>${textPath(F.bold, ini, photoBox.x + photoBox.w / 2, photoBox.y + photoBox.h / 2 + sz * 0.36, sz, "#ffffff", "middle", 0.9)}</svg>`;
      layers.push({ input: Buffer.from(ph), top: 0, left: 0 });
    }
  }
  if (logoBox) {
    const logo = await loadLogo(opts.logoUrl, logoBox.w);
    if (logo) layers.push({ input: logo, top: logoBox.y, left: logoBox.x });
  }
  layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${front}</svg>`), top: 0, left: 0 });
  const qrImg = await sharp(await qrPng(opts.code, qr.w)).resize(qr.w, qr.h).png().toBuffer();
  layers.push({ input: qrImg, top: qr.y, left: qr.x });

  return base.composite(layers).png({ compressionLevel: 8 }).toBuffer();
}
