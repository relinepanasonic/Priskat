import * as cheerio from "cheerio";

/**
 * Saints remembered on a given day (Kalender Para Kudus from katakombe.org),
 * enriched with full multi-section biographies & portraits from Indonesian Wikipedia (id.wikipedia.org)
 * so every saint reads like a rich, full in-app biography book.
 */
export type Saint = { name: string; title: string; description: string; href: string; image: string | null };

export type SaintChapter = {
  title: string;
  paragraphs: string[];
};

export type SaintStory = {
  title: string;
  subtitle?: string;
  feastDay?: string;
  era?: string;
  patronOf?: string;
  quote?: string;
  image: string | null;
  chapters: SaintChapter[];
  reflection?: string;
  prayer?: string;
  sourceLabel: string;
  sourceUrl?: string;
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

const SKIP_TEXT_RE = /^(bagikan|share|print|email|komentar|lihat juga|baca juga|sebelumnya|berikutnya|prev|next|hits:|dilihat:|ditulis oleh|kategori:|copyright|referensi|pranala luar|catatan kaki|bibliografi|daftar pustaka)/i;

/** Fetch a rich sectioned biography + high-res classical portrait from Indonesian Wikipedia (id.wikipedia.org). */
async function fetchWikipediaSaint(queryName: string): Promise<SaintStory | null> {
  const q = queryName.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  if (q.length < 3) return null;
  try {
    const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json`;
    const srRes = await fetch(searchUrl, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)" },
    });
    if (!srRes.ok) return null;
    const srJson = (await srRes.json()) as { query?: { search?: { pageid: number; title: string; snippet?: string }[] } };
    const candidates = srJson.query?.search ?? [];
    if (!candidates.length) return null;

    // Prefer a result that clearly relates to a Catholic saint / bishop / martyr / pope
    const match =
      candidates.find((c) => /santo|santa|beato|beata|paus|uskup|martir|katolik|gereja|kudus/i.test(`${c.title} ${c.snippet ?? ""}`)) ??
      candidates[0];

    const pageUrl = `https://id.wikipedia.org/w/api.php?action=query&pageids=${match.pageid}&prop=extracts|pageimages|info&explaintext=1&pithumbsize=800&inprop=url&format=json`;
    const pRes = await fetch(pageUrl, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)" },
    });
    if (!pRes.ok) return null;
    const pJson = (await pRes.json()) as {
      query?: {
        pages?: Record<
          string,
          { title?: string; extract?: string; fullurl?: string; thumbnail?: { source?: string } }
        >;
      };
    };
    const page = pJson.query?.pages?.[String(match.pageid)];
    const extract = (page?.extract ?? "").trim();
    if (extract.length < 180) return null;

    // Split Wikipedia plain-text extract into novel-like chapters using "== Heading ==" markers
    const chapters: SaintChapter[] = [];
    let current: SaintChapter = { title: "Kisah Hidup", paragraphs: [] };

    for (const rawLine of extract.split(/\n+/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const headingMatch = line.match(/^={2,4}\s*(.+?)\s*={2,4}$/);
      if (headingMatch) {
        const heading = headingMatch[1].trim();
        if (SKIP_TEXT_RE.test(heading)) break;
        if (current.paragraphs.length > 0) chapters.push(current);
        current = { title: heading, paragraphs: [] };
        continue;
      }
      if (line.length < 25 || SKIP_TEXT_RE.test(line)) continue;
      current.paragraphs.push(line);
    }
    if (current.paragraphs.length > 0) chapters.push(current);
    if (chapters.length === 0) return null;

    return {
      title: page?.title || queryName,
      image: page?.thumbnail?.source ?? null,
      chapters,
      sourceLabel: "Wikipedia Indonesia",
      sourceUrl: page?.fullurl,
    };
  } catch {
    return null;
  }
}

/** Fetch biography from katakombe.org as fallback / companion source. */
async function fetchKatakombeStory(href: string): Promise<SaintStory | null> {
  if (!isValidKatakombeSaintUrl(href)) return null;
  try {
    const res = await fetch(href, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "RuangIman/1.0 (+https://apps.ruangiman.com)", Accept: "text/html" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

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

    let image: string | null = null;
    container.find("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (!src || /icon|logo|banner|ads|spinner|pixel/i.test(src)) return;
      image = absUrl(src);
    });

    const chapters: SaintChapter[] = [];
    let current: SaintChapter = { title: "Riwayat Hidup", paragraphs: [] };
    const seen = new Set<string>();

    container.find("h2, h3, h4, p, blockquote").each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const t = clean($(el).text());
      if (!t || t.length < 3 || t === title || SKIP_TEXT_RE.test(t) || seen.has(t)) return;
      seen.add(t);
      if (tag === "h2" || tag === "h3" || tag === "h4") {
        if (current.paragraphs.length > 0) chapters.push(current);
        current = { title: t, paragraphs: [] };
      } else {
        if (t.length < 18 && current.paragraphs.length === 0) return;
        current.paragraphs.push(t);
      }
    });
    if (current.paragraphs.length > 0) chapters.push(current);
    if (chapters.length === 0) return null;

    return {
      title,
      image,
      chapters,
      sourceLabel: "Kalender Para Kudus (katakombe.org)",
      sourceUrl: href,
    };
  } catch {
    return null;
  }
}

const wordCount = (s: SaintStory | null) =>
  s ? s.chapters.reduce((n, c) => n + c.paragraphs.join(" ").split(/\s+/).length, 0) : 0;

/**
 * Fetches the richest available in-app biography by comparing Indonesian Wikipedia and Katakombe in parallel.
 * Always keeps the fuller story + best portrait image.
 */
export async function getSaintStory(href: string, nameHint?: string): Promise<SaintStory | null> {
  const [kata, wiki] = await Promise.all([
    href ? fetchKatakombeStory(href) : Promise.resolve(null),
    nameHint ? fetchWikipediaSaint(nameHint) : Promise.resolve(null),
  ]);

  if (!kata && !wiki) return null;
  if (wiki && wordCount(wiki) >= wordCount(kata)) {
    return {
      ...wiki,
      image: wiki.image ?? kata?.image ?? null,
    };
  }
  return {
    ...kata!,
    image: kata?.image ?? wiki?.image ?? null,
  };
}
