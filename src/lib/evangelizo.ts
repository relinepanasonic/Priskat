/**
 * Daily Mass readings from the public Evangelizo API (publication.evangelizo.ws), used when the
 * Indonesian calendar site cannot be read. The API gives the references of the Roman lectionary
 * (the same readings as the KWI Misale); the verse text always comes from our own Bible.
 * Pure functions only (no imports), so they can be tested on their own.
 */
export type EvSegment = { abbr: string; chapter: number; from: number; to: number };
export type EvReading = { type: string; segments: EvSegment[] };

// Evangelizo book code (French style: Lc, Mc, Ap ...; underscores and spaces are ignored) -> the abbreviation
// the Indonesian calendar site uses (see SITE_ABBR in bacaanHarian.ts)
const CODE_TO_SITE: Record<string, string> = {
  gn: "kej", ex: "kel", lv: "im", nb: "bil", dt: "ul", jos: "yos", jg: "hak", rt: "rut", "1s": "1sam", "2s": "2sam", "1r": "1raj", "2r": "2raj", "1k": "1raj", "2k": "2raj",
  "1ch": "1taw", "2ch": "2taw", esd: "ezr", ezr: "ezr", ne: "neh", tb: "tob", jdt: "ydt", est: "est", "1m": "1mak", "2m": "2mak", jb: "ayb", ps: "mzm",
  pr: "ams", qo: "pkh", ct: "kid", sg: "keb", ws: "keb", si: "sir", is: "yes", jr: "yer", lm: "rat", ba: "bar", ez: "yeh", dn: "dan", os: "hos", ho: "hos", jl: "yl",
  am: "am", ab: "ob", jon: "yun", mi: "mi", na: "nah", ha: "hab", hab: "hab", so: "zef", ag: "hag", za: "za", ml: "mal",
  mt: "mat", mc: "mrk", mk: "mrk", lc: "luk", lk: "luk", jn: "yoh", ac: "kis", rm: "rom", "1co": "1kor", "2co": "2kor", ga: "gal", ep: "ef", ph: "flp", col: "kol",
  "1th": "1tes", "2th": "2tes", "1tm": "1tim", "2tm": "2tim", tt: "tit", phm: "flm", he: "ibr", jc: "yak", jm: "yak", "1p": "1ptr", "2p": "2ptr",
  "1jn": "1yoh", "2jn": "2yoh", "3jn": "3yoh", jude: "yud", jd: "yud", ap: "why", rv: "why",
};
// The API also names each book in English ("Luke", "Rev", "1 Cor"); used when the code is not recognised
const SHORT_TO_SITE: Record<string, string> = {
  gen: "kej", exod: "kel", ex: "kel", lev: "im", num: "bil", deut: "ul", josh: "yos", judg: "hak", ruth: "rut", "1sam": "1sam", "2sam": "2sam", "1kgs": "1raj", "2kgs": "2raj",
  "1chr": "1taw", "2chr": "2taw", ezra: "ezr", neh: "neh", tob: "tob", jdt: "ydt", esth: "est", "1macc": "1mak", "2macc": "2mak", job: "ayb", ps: "mzm", prov: "ams",
  eccl: "pkh", song: "kid", wis: "keb", sir: "sir", isa: "yes", jer: "yer", lam: "rat", bar: "bar", ezek: "yeh", dan: "dan", hos: "hos", joel: "yl", amos: "am",
  obad: "ob", jonah: "yun", mic: "mi", nah: "nah", hab: "hab", zeph: "zef", hag: "hag", zech: "za", mal: "mal",
  matt: "mat", mark: "mrk", luke: "luk", john: "yoh", acts: "kis", rom: "rom", "1cor": "1kor", "2cor": "2kor", gal: "gal", eph: "ef", phil: "flp", col: "kol",
  "1thess": "1tes", "2thess": "2tes", "1tim": "1tim", "2tim": "2tim", titus: "tit", phlm: "flm", heb: "ibr", jas: "yak", "1pet": "1ptr", "2pet": "2ptr",
  "1john": "1yoh", "2john": "2yoh", "3john": "3yoh", jude: "yud", rev: "why",
};
const norm = (x: string) => x.toLowerCase().replace(/[\s_.]/g, "");

/** "Pr 31,10-13#Pr 31,19-20" or "Is 61,10-62,5" or "Ex 3,1-8.13-15" -> verse ranges */
export function parseReadingCode(code: string, shortTitle?: string): EvSegment[] {
  const out: EvSegment[] = [];
  for (const part of code.split("#")) {
    const m = part.trim().match(/^(\S+)\s+(\d+),(.+)$/);
    if (!m) continue;
    const abbr = CODE_TO_SITE[norm(m[1])] ?? (shortTitle ? SHORT_TO_SITE[norm(shortTitle)] : undefined);
    if (!abbr) continue;
    const chapter = Number(m[2]);
    const spec = m[3].trim();
    // across a chapter border: "10-62,5"
    const cross = spec.match(/^(\d+)[a-z]*-(\d+),(\d+)[a-z]*$/);
    if (cross) {
      out.push({ abbr, chapter, from: Number(cross[1]), to: 999 });
      out.push({ abbr, chapter: Number(cross[2]), from: 1, to: Number(cross[3]) });
      continue;
    }
    for (const piece of spec.split(".")) {
      const r = piece.trim().match(/^(\d+)[a-z]*(?:-(\d+)[a-z]*)?$/);
      if (r) out.push({ abbr, chapter, from: Number(r[1]), to: Number(r[2] ?? r[1]) });
    }
  }
  return out;
}

/** "1-2, 3, 4-5" per chapter, e.g. "31:10-13, 19-20; 32:1" */
export function formatRanges(segments: EvSegment[]): string {
  const byChapter = new Map<number, string[]>();
  for (const s of segments) {
    const list = byChapter.get(s.chapter) ?? [];
    list.push(s.to >= 999 ? `${s.from}-` : s.from === s.to ? `${s.from}` : `${s.from}-${s.to}`);
    byChapter.set(s.chapter, list);
  }
  return [...byChapter.entries()].map(([c, list]) => `${c}:${list.join(", ")}`).join("; ");
}

const ORD: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19,
  twentieth: 20, thirtieth: 30, fortieth: 40,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40 };
function ordinal(word: string): number | null {
  const w = word.toLowerCase();
  if (ORD[w]) return ORD[w];
  const m = w.match(/^(twenty|thirty|forty)-(\w+)$/);
  return m && ORD[m[2]] ? TENS[m[1]] + ORD[m[2]] : null;
}
const roman = (n: number) => {
  const t: [number, string][] = [[40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = "";
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
};
const DAYS: Record<string, string> = { sunday: "Minggu", monday: "Senin", tuesday: "Selasa", wednesday: "Rabu", thursday: "Kamis", friday: "Jumat", saturday: "Sabtu" };
const SEASONS: Record<string, string> = { "ordinary time": "Biasa", advent: "Adven", lent: "Prapaskah", easter: "Paskah", christmas: "Natal" };

/** "Thirty-third Sunday in Ordinary Time" -> "Hari Minggu Biasa XXXIII"; anything else stays as it is. */
export function celebrationId(title: string): string {
  const t = title.trim().replace(/\.$/, "");
  let m = t.match(/^(\S+) Sunday (?:in|of) (Ordinary Time|Advent|Lent|Easter|Christmas)$/i);
  if (m) { const n = ordinal(m[1]); if (n) return `Hari Minggu ${SEASONS[m[2].toLowerCase()]} ${roman(n)}`; }
  m = t.match(/^(\w+day) (?:of|in) the (\S+) week (?:of|in) (Ordinary Time|Advent|Lent|Easter|Christmas)$/i);
  if (m && DAYS[m[1].toLowerCase()]) { const n = ordinal(m[2]); if (n) return `${DAYS[m[1].toLowerCase()]} Pekan ${SEASONS[m[3].toLowerCase()]} ${roman(n)}`; }
  const BIG: Record<string, string> = {
    "immaculate conception of the virgin mary": "Santa Perawan Maria Dikandung Tanpa Noda",
    "christmas (mass of the day)": "Natal (Misa Siang)", "christmas (mass during the night)": "Natal (Misa Malam)", "christmas (mass at dawn)": "Natal (Misa Fajar)",
    "epiphany of the lord": "Penampakan Tuhan (Epifani)", "the epiphany of the lord": "Penampakan Tuhan (Epifani)",
    "ash wednesday": "Rabu Abu", "palm sunday of the passion of the lord": "Minggu Palma, Sengsara Tuhan", "holy thursday": "Kamis Putih", "good friday": "Jumat Agung",
    "easter sunday": "Minggu Paskah", "easter sunday of the resurrection of the lord": "Minggu Paskah", "the ascension of the lord": "Kenaikan Tuhan", "ascension of the lord": "Kenaikan Tuhan",
    "pentecost sunday": "Pentakosta", "pentecost": "Pentakosta", "the most holy trinity": "Tritunggal Mahakudus", "all saints": "Semua Orang Kudus", "all souls": "Arwah Semua Orang Beriman",
    "assumption of the virgin mary": "Santa Perawan Maria Diangkat ke Surga", "the assumption of the blessed virgin mary": "Santa Perawan Maria Diangkat ke Surga",
    "christ the king": "Yesus Kristus Raja Semesta Alam", "our lord jesus christ, king of the universe": "Yesus Kristus Raja Semesta Alam",
    "the most holy body and blood of christ": "Tubuh dan Darah Kristus", "mary, mother of god": "Santa Maria Bunda Allah",
  };
  const KIND: Record<string, string> = { solemnity: "Hari Raya", feast: "Pesta", memorial: "Peringatan" };
  const k = t.match(/^(.*?)\s+-\s+(Solemnity|Feast|Memorial)$/i);
  if (k) {
    const name = BIG[k[1].toLowerCase()] ?? k[1];
    return `${KIND[k[2].toLowerCase()]} ${name}`;
  }
  return BIG[t.toLowerCase()] ?? t;
}

export type EvDay = { title: string; readings: EvReading[] };

/** Fetch one day ("2026-11-15") from the API. null when it cannot be read. */
export async function fetchEvangelizoDay(iso: string): Promise<EvDay | null> {
  try {
    const res = await fetch(`https://publication.evangelizo.ws/AM/days/${iso}?include=readings`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { data?: { liturgic_title?: string; readings?: { reading_code?: string; type?: string; book?: { short_title?: string } }[] } };
    const readings = (j.data?.readings ?? [])
      .map((r) => ({ type: r.type ?? "reading", segments: parseReadingCode(r.reading_code ?? "", r.book?.short_title) }))
      .filter((r) => r.segments.length > 0);
    if (!readings.length) return null;
    return { title: j.data?.liturgic_title ?? "", readings };
  } catch {
    return null;
  }
}
