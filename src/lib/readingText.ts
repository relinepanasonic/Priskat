import type { SupabaseClient } from "@supabase/supabase-js";
import type { Segment } from "@/lib/bacaanHarian";
import { cleanVerse } from "@/lib/bibleText";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => [b.no, b]));

export type ReadingVerse = { chapter: number; verse: number; text: string };

/** Verse text of every range of a reading, from our own Bible (TB; deuterocanonical books only exist in NRSV-CE). */
export async function loadReadingVerses(supabase: SupabaseClient, segments: Segment[]): Promise<ReadingVerse[]> {
  const out: ReadingVerse[] = [];
  for (const sg of segments) {
    if (!sg.book || !sg.chapter) continue;
    const { data } = await supabase
      .from("bible_verses")
      .select("verse, content")
      .eq("translation", sg.book >= 67 ? "NRSV-CE" : "TB")
      .eq("book_no", sg.book)
      .eq("chapter", sg.chapter)
      .gte("verse", sg.from)
      .lte("verse", sg.to >= 99 ? 999 : sg.to)
      .order("verse");
    for (const r of ((data as { verse: number; content: string }[]) ?? [])) {
      out.push({ chapter: sg.chapter, verse: r.verse, text: cleanVerse(r.content) });
    }
  }
  return out;
}

/** "Yesaya 45:1, 4-6": the book name from our Bible list in front of the reference. */
export function readingTitle(display: string, bookNo: number | null): string {
  const meta = bookNo ? BOOKS.get(bookNo) : null;
  return meta ? `${meta.name} ${display.replace(/^[^\d]*\s*(?=\d)/, "")}` : display;
}
