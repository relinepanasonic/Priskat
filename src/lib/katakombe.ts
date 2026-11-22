/**
 * Saints remembered on a given day, from the public "Kalender Para Kudus" of katakombe.org
 * (one page per day, e.g. /para-kudus/november-22.html). Only the name, the one-line description and the
 * picture link are read; the biography stays on their site (each saint links there).
 */
export type Saint = { name: string; title: string; description: string; href: string; image: string | null };

const MONTHS = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
export const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const clean = (s: string) =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

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
      image: imgs.length ? imgs[imgs.length - 1][1] : null,
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
