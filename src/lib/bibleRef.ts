export type RefBook = { no: number; abbr: string; name: string; name_en: string; chapter: number };
export type BibleRef = { book: RefBook; chapter: number; verse?: number; to?: number };

const norm = (s: string) => s.toLowerCase().replace(/[.\s]/g, "");

/**
 * Understands "Yeremia 31:3", "Yer 31:3-5", "1 Kor 13", "Yeremia pasal 31 ayat 3", "John 3:16".
 * Returns null when the text isn't a book + chapter reference.
 */
export function parseBibleRef(input: string, books: RefBook[]): BibleRef | null {
  const text = input
    .toLowerCase()
    .replace(/\b(pasal|chapter|chap|ch)\b/g, " ")
    .replace(/\b(ayat|verses?|vs|ay)\b/g, ":")
    .replace(/\b(sampai|s\/d|to|until)\b/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const m = text.match(/^(\d?\s?[a-z][a-z\s.]*?)\s*(\d{1,3})\s*(?:[:.,]\s*(\d{1,3})\s*(?:[-–]\s*(\d{1,3}))?)?$/);
  if (!m) return null;

  const key = norm(m[1]);
  if (key.length < 2) return null;
  const names = (b: RefBook) => [norm(b.name), norm(b.name_en), norm(b.abbr)];
  const book =
    books.find((b) => names(b).includes(key)) ??
    (key.length >= 3 ? books.find((b) => names(b).some((n) => n.startsWith(key))) : undefined);
  if (!book) return null;

  const chapter = Number(m[2]);
  if (chapter < 1 || chapter > book.chapter) return null;
  const verse = m[3] ? Number(m[3]) : undefined;
  const to = m[4] ? Number(m[4]) : undefined;
  return { book, chapter, verse, to: to && verse && to > verse ? to : undefined };
}

/** How a reference should be spoken in Indonesian / English, e.g. "Yeremia pasal 31 ayat 3". */
export function spokenReference(ref: string, lang: "id" | "en") {
  const m = ref.match(/^(.*?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return ref;
  const [, name, ch, v1, v2] = m;
  if (lang === "id") return `${name} pasal ${ch} ayat ${v1}${v2 ? ` sampai ${v2}` : ""}`;
  return `${name} chapter ${ch} verse ${v1}${v2 ? ` to ${v2}` : ""}`;
}
