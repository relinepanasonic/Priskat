import * as cheerio from "cheerio";

/**
 * Saints remembered on a given day, from the public "Kalender Para Kudus" of katakombe.org
 * (one page per day, e.g. /para-kudus/november-22.html), plus in-app biography reader.
 */
export type Saint = { name: string; title: string; description: string; href: string; image: string | null };

export type SaintStory = {
  title: string;
  image: string | null;
  paragraphs: { text: string; heading?: boolean }[];
  sourceUrl: string;
};

const MONTHS = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
export const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const clean = (s: string) =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

const absUrl = (src: string | null | undefined): string | null => {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://katakombe.org${s.startsWith("/") ? "" : "/"}${s}`;
};

export function isValidKatakombeSaintUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.hostname === "katakombe.org" || u.hostname === "www.katakombe.org") && u.pathname.startsWith("/para-kudus/");
  } catch {
    return false;
  }
}

export function daysInMonth(month: number) {
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

export function parseSaints(html: string): Saint[] {
  const out: Saint[] = [];
  for (const m of html.matchAll(/<div class="katakombe-item-title">\s*<h4>([\s\S]*?)<\/h4>\s*<\/div>\s*<div class="katakombe-teaser-description">([\s\S]*?)<\/div>/g)) {
    const a = m[1].match(/^([\s\S]*?)<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]*)$/);
    if (!a) continue;
    const href = a[2].startsWith("http") ? a[2] : `https://katakombe.org${a[2]}`;
    const name = clean(a[3]);
    if (!name || !/katakombe\.org\/para-kudus\//.test(href)) continue;
    // the picture of this saint is the nearest one before the title
    const before = html.slice(Math.max(0, (m.index ?? 0) - 2500), m.index ?? 0);
    const imgs = [...before.matchAll(/<img [^>]*src="([^"]+)"/g)];
    out.push({
      name,
      title: clean(`${a[1]} ${name} ${a[4]}`),
      description: clean(m[2]),
      href,
      image: imgs.length ? absUrl(imgs[imgs.length - 1][1]) : null,
    });
  }
  return out;
}

export async function getSaints(month: number, day: number): Promise<Saint[]> {
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(month)) return [];
  try {
    const res = await fetch(`https://katakombe.org/para-kudus/${MONTHS[month - 1]}-${day}.html`, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)", Accept: "text/html" },
    });
    if (!res.ok) return [];
    return parseSaints(await res.text());
  } catch {
    return [];
  }
}

const SKIP_TEXT_RE = /^(bagikan|share|print|email|komentar|lihat juga|baca juga|sebelumnya|berikutnya|prev|next|hits:|dilihat:|ditulis oleh|kategori:|copyright)/i;

/** Fetches and parses a saint's full biography from katakombe.org so users can read it inside Ruang Iman. */
export async function getSaintStory(href: string): Promise<SaintStory | null> {
  if (!isValidKatakombeSaintUrl(href)) return null;
  try {
    const res = await fetch(href, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)", Accept: "text/html" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise elements before reading text
    $("script, style, nav, footer, aside, form, iframe, .moduletable, .pager, .pagination, .social-share, .share, .comments, #comments").remove();

    const container =
      $('[itemprop="articleBody"]').first().length ? $('[itemprop="articleBody"]').first()
      : $(".item-page").first().length ? $(".item-page").first()
      : $("article").first().length ? $("article").first()
      : $("#content, main").first().length ? $("#content, main").first()
      : $("body");

    const title =
      clean($(".page-header h1, .item-page h1, .item-page h2, article h1, h1").first().text()) ||
      clean($("title").text().replace(/\s*[-|–]\s*katakombe\.org.*/i, "")) ||
      "Riwayat Santo / Santa";

    // Pick the first meaningful image inside the article
    let image: string | null = null;
    container.find("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (!src || /icon|logo|banner|ads|spinner|pixel/i.test(src)) return;
      image = absUrl(src);
    });

    const paragraphs: { text: string; heading?: boolean }[] = [];
    const seen = new Set<string>();

    container.find("h2, h3, h4, p, blockquote, li").each((_, el) => {
      const tag = el.tagName.toLowerCase();
      // Skip nested elements already captured inside a parent <p> or <blockquote>
      if (tag === "li" && $(el).parents("nav, .pager, .pagination, .breadcrumb").length) return;
      const t = clean($(el).text());
      if (!t || t.length < 3 || t === title || SKIP_TEXT_RE.test(t)) return;
      if (seen.has(t)) return;
      seen.add(t);
      const isHeading = tag === "h2" || tag === "h3" || tag === "h4";
      if (!isHeading && t.length < 18 && paragraphs.length === 0) return;
      paragraphs.push({ text: t, heading: isHeading });
    });

    if (paragraphs.length === 0) return null;
    return { title, image, paragraphs, sourceUrl: href };
  } catch {
    return null;
  }
}
