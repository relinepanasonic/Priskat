/**
 * Daily Mass readings in the official Indonesian lectionary wording, as published by Komsos KWI on
 * mirifica.net (one post per day, written the day before): Bacaan I, Mazmur Tanggapan with its refrain,
 * Bacaan II, Bait Pengantar Injil, Bacaan Injil, and Renungan Harian, plus the day's celebration and saints.
 * The post is read through the WordPress API of the site, never by scraping pages.
 */
export type LectItem = {
  kind: "bacaan1" | "mazmur" | "bacaan2" | "bait" | "injil";
  label: string;
  ref: string;          // "Wahyu 10:8-11"
  refren?: string;      // psalm refrain verse numbers, "103a"
  summary: string;      // the one-line quote under the heading
  intro: string;        // "Bacaan dari Kitab Wahyu:"
  paragraphs: string[]; // the reading
  verses: string[];     // psalm verses
  closing: string;      // "Demikianlah Sabda Tuhan."
};

export type LectRenungan = {
  title: string;
  paragraphs: string[];
};

export type LectDay = {
  title: string;         // "JUMAT PEKAN BIASA XXXIII"
  celebrations: string[]; // "Santo Klemens I - Paus & Martir", "Hari Raya Kristus Raja Semesta Alam"
  color: string;         // "Hijau"
  link: string;          // the post, for the credit line
  items: LectItem[];
  renungan?: LectRenungan | null;
};

const DAYS = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
const MONTHS = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];

const decode = (s: string) =>
  s
    .replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#8217;|&rsquo;|&#8216;|&lsquo;/g, "’")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/g, '"').replace(/&#8230;|&hellip;/g, "…")
    .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;|&#038;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCharCode(Number(n)));
const text = (html: string) => decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const BOILERPLATE_RE = /^(share this|bagikan|baca juga|related|lihat juga|tags?:|komentar|tinggalkan balasan|follow us)/i;

/** Parse the rendered post body (WordPress blocks: h5 headings, p, ul, blockquote). */
export function parseLectionary(html: string, link: string): LectDay | null {
  // The day's title, saints and liturgical colour sit before the first reading, either as headings or as one
  // paragraph with line breaks: read them as lines
  const first = html.search(/<h[1-6][^>]*>\s*(?:<[^>]+>\s*)*Bacaan I\s*[–-]|<h[1-6][^>]*>\s*(?:<[^>]+>\s*)*Bacaan I\s*&#8211;/i);
  if (first < 0) return null;
  const lines = decode(html.slice(0, first).replace(/<(?:br\s*\/?|\/p|\/h[1-6])>/gi, "\n").replace(/<[^>]+>/g, ""))
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  let color = "";
  const head: string[] = [];
  for (const l of lines) {
    const c = l.match(/^Warna Liturgi\s*:\s*(.+)$/i);
    if (c) color = c[1].trim(); else head.push(l);
  }

  const parts = html.slice(first).split(/(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)/i);
  const items: LectItem[] = [];
  let renungan: LectRenungan | null = null;
  let inRenungan = false;

  for (let i = 1; i < parts.length; i += 2) {
    const h = text(parts[i]);
    const body = parts[i + 1] ?? "";

    // Capture Renungan Harian after Injil (including any subheadings within the reflection)
    if (/^renungan/i.test(h)) {
      inRenungan = true;
      const cleanTitle = h.replace(/^renungan(?:\s+harian)?(?:\s*[–—:-]\s*)?/i, "").trim();
      renungan = { title: cleanTitle || "Renungan Harian", paragraphs: [] };
      for (const m of body.matchAll(/<(p|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
        const t = text(m[2]);
        if (!t || BOILERPLATE_RE.test(t)) continue;
        renungan.paragraphs.push(t);
      }
      continue;
    }

    if (inRenungan && renungan) {
      if (BOILERPLATE_RE.test(h)) break;
      // Subheading inside Renungan (e.g. reflection title or prayer heading)
      if (h && renungan.paragraphs.length === 0 && renungan.title === "Renungan Harian") {
        renungan.title = h;
      } else if (h) {
        renungan.paragraphs.push(h);
      }
      for (const m of body.matchAll(/<(p|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
        const t = text(m[2]);
        if (!t || BOILERPLATE_RE.test(t)) continue;
        renungan.paragraphs.push(t);
      }
      continue;
    }

    const kind: LectItem["kind"] | null =
      /^Bacaan I\s+[–-]/i.test(h) ? "bacaan1"
        : /^Bacaan II\s+[–-]/i.test(h) ? "bacaan2"
        : /^Mazmur/i.test(h) ? "mazmur"
        : /^(Bait Pengantar Injil|Alleluya|Alleluia)/i.test(h) ? "bait"
        : /^Bacaan Injil/i.test(h) ? "injil"
        : null;
    if (!kind) continue;

    // "Mazmur Tanggapan – Mazmur 23:1-2a.2b-3 – Refren:1": the separators have spaces around them, the verse ranges do not
    const [label, ...rest] = h.split(/\s+[–—-]\s+/);
    const refPart = rest.filter((r) => !/^Refren/i.test(r)).join(" – ").trim();
    const refren = rest.map((r) => r.match(/^Refren\s*:\s*(.+)$/i)?.[1]).find(Boolean);
    const cur: LectItem = { kind, label: label.trim(), ref: refPart, refren: refren?.trim(), summary: "", intro: "", paragraphs: [], verses: [], closing: "" };

    for (const m of body.matchAll(/<(p|ul|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      if (m[1].toLowerCase() === "ul") {
        for (const li of m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) { const t = text(li[1]); if (t) cur.verses.push(t); }
        continue;
      }
      const t = text(m[2]);
      if (!t) continue;
      if (/^<em>/i.test(m[2].trim()) && !cur.summary && !cur.paragraphs.length) { cur.summary = t; continue; }
      if (/^Demikianlah Sabda Tuhan/i.test(t) || /^Sabda Tuhan/i.test(t)) { cur.closing = t; continue; }
      if (!cur.intro && !cur.paragraphs.length && /^(Bacaan dari|Inilah Injil|Pembacaan dari|Kutipan dari)/i.test(t)) { cur.intro = t; continue; }
      cur.paragraphs.push(t);
    }
    items.push(cur);
  }

  if (!items.length) return null;
  if (renungan && renungan.paragraphs.length === 0) renungan = null;
  const [title, ...celebrations] = head;
  return { title: title ?? "", celebrations, color, link, items, renungan };
}

/** Today's (or any day's) readings; null when the post is not there or cannot be read. */
export async function getLectionary(day: number, month: number, year: number): Promise<LectDay | null> {
  const d = new Date(Date.UTC(year, month - 1, day));
  const slug = `bacaan-mazmur-tanggapan-dan-renungan-harian-katolik-${DAYS[d.getUTCDay()]}-${day}-${MONTHS[month - 1]}-${year}`;
  try {
    const res = await fetch(
      `https://www.mirifica.net/wp-json/wp/v2/posts?slug=${slug}&_fields=link,content`,
      { next: { revalidate: 3600 }, headers: { Accept: "application/json", "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)" } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { link?: string; content?: { rendered?: string } }[];
    const post = rows[0];
    if (!post?.content?.rendered) return null;
    return parseLectionary(post.content.rendered, post.link ?? `https://www.mirifica.net/${slug}/`);
  } catch {
    return null;
  }
}
