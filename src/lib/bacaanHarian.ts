import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

/**
 * Daily Mass readings of the Catholic Church in Indonesia (Misale Romawi / KWI),
 * read from the public liturgical calendar of imankatolik.or.id. Only Bible references
 * are taken from there; the verse text always comes from our own Bible.
 */
export type Reading = { label: string; display: string; book: number | null; chapter: number; from: number; to: number };
export type DayReadings = { date: string; celebration: string; readings: Reading[] } | null;

const SOURCE = "https://www.imankatolik.or.id/kalender.php";

// Site abbreviation → book, in the same order as our book list (OT 39, NT 27, deuterocanonical)
const SITE_ABBR = [
  "kej kel im bil ul yos hak rut 1sam 2sam 1raj 2raj 1taw 2taw ezr neh est ayb mzm ams pkh kid yes yer rat yeh dan hos yl am ob yun mi nah hab zef hag za mal",
  "mat mrk luk yoh kis rom 1kor 2kor gal ef flp kol 1tes 2tes 1tim 2tim tit flm ibr yak 1ptr 2ptr 1yoh 2yoh 3yoh yud why",
  "tob ydt - keb sir bar - 1mak 2mak",
].join(" ").split(" ");
const BOOK_NOS = [...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => b.no).sort((a, b) => a - b);
const ALIASES: Record<string, string> = { mar: "mrk", mark: "mrk", "1pet": "1ptr", "2pet": "2ptr", wah: "why", ima: "im", yoe: "yl", amo: "am", oba: "ob", mik: "mi", zak: "za", efe: "ef", maz: "mzm" };

function bookNo(abbr: string): number | null {
  let k = abbr.toLowerCase().replace(/[.\s]/g, "");
  k = ALIASES[k] ?? k;
  const i = SITE_ABBR.indexOf(k);
  return i >= 0 && k !== "-" ? BOOK_NOS[i] ?? null : null;
}

const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const jakartaParts = () => {
  const d = new Date(Date.now() + 7 * 3600_000);
  return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
};

export async function getTodayReadings(): Promise<DayReadings> {
  const { day } = jakartaParts();
  let html = "";
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const cell = html.split("k_tbl_td").slice(1).find((c) => new RegExp(`class="k_tgl"[^>]*>\s*${day}\s*<`).test(c));
  if (!cell) return null;

  const celebration = strip((cell.match(/class="k_perayaan">([\s\S]*?)<\/div>/)?.[1] ?? "").replace(/<br\s*\/?>/g, " · ")).replace(/(\s*·\s*)+$/, "");
  const alk = cell.match(/class="k_alkitab"[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? "";
  // Everything before "BcO" (optional reading) is the day's Mass
  const main = alk.split(/BcO/)[0];

  const links = [...main.matchAll(/<a href="[^"]*alkitabq\.php\?q=([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ q: m[1], text: strip(m[2]) }));
  if (!links.length) return null;

  const labels = links.length >= 4 ? ["Bacaan I", "Mazmur", "Bacaan II", "Injil"] : ["Bacaan I", "Mazmur", "Injil"];
  const readings: Reading[] = links.map((l, i) => {
    const first = decodeURIComponent(l.q).split(";")[0]; // e.g. "Mat21:33-43", "1Kor12:31-99"
    const m = first.match(/^(\d?[A-Za-z]+)(\d+):(\d+)(?:-(\d+))?/);
    const isPsalm = /^mzm/i.test(l.text);
    const label = links.length === 3 || links.length >= 4 ? (isPsalm ? "Mazmur" : i === links.length - 1 ? "Injil" : labels[i] ?? "Bacaan") : labels[i] ?? "Bacaan";
    return {
      label,
      display: l.text,
      book: m ? bookNo(m[1]) : null,
      chapter: m ? Number(m[2]) : 0,
      from: m ? Number(m[3]) : 1,
      to: m ? Number(m[4] ?? m[3]) : 1,
    };
  });
  return { date: `${day}`, celebration, readings };
}
