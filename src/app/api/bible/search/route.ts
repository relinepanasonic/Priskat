import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Word search across the whole Bible.
//   GET /api/bible/search?q=kasih%20karunia&v=TB&whole=1           → totals per book
//   GET /api/bible/search?q=…&v=TB&whole=1&book=43&offset=0        → matching verses in one book
// Bible text never changes, so answers are cached at the edge for a day.

const TRANSLATIONS = new Set(["TB", "NRSV-CE", "NKJV", "NIV"]);
const PAGE = 50;
const FALLBACK_LIMIT = 6000;
const CACHE = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };

type Row = { book_no: number; book_name: string; chapter: number; verse: number; content: string };

const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Same rule as supabase/085: case-insensitive, optional whole-word, any whitespace between words. */
function matcher(q: string, whole: boolean) {
  const body = q.trim().split(/\s+/).map(escapeRe).join("\\s+");
  return new RegExp(whole ? `(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])` : body, "giu");
}

const missingRpc = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "PGRST202" || /could not find the function/i.test(e.message ?? ""));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 60);
  const tr = url.searchParams.get("v") ?? "TB";
  const whole = url.searchParams.get("whole") !== "0";
  const bookParam = url.searchParams.get("book");
  const book = bookParam ? parseInt(bookParam) : null;
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0") || 0);

  if (q.length < 2) return NextResponse.json({ error: "Ketik minimal 2 huruf." }, { status: 400 });
  if (!TRANSLATIONS.has(tr)) return NextResponse.json({ error: "Versi tidak dikenal." }, { status: 400 });

  const supabase = db();

  // ── Verses in one book ──────────────────────────────────────────────────────
  if (book != null && Number.isFinite(book)) {
    const { data, error } = await supabase.rpc("bible_search_verses", { q, tr, book, whole, lim: PAGE + 1, off: offset });
    let rows = (data as Row[] | null) ?? [];
    if (missingRpc(error)) {
      const re = matcher(q, whole);
      const { data: raw } = await supabase
        .from("bible_verses")
        .select("book_no, book_name, chapter, verse, content")
        .eq("translation", tr)
        .eq("book_no", book)
        .ilike("content", `%${q.split(/\s+/)[0]}%`)
        .order("chapter")
        .order("verse")
        .limit(FALLBACK_LIMIT);
      rows = ((raw as Row[]) ?? []).filter((r) => { re.lastIndex = 0; return re.test(r.content); }).slice(offset, offset + PAGE + 1);
    } else if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { verses: rows.slice(0, PAGE).map(({ chapter, verse, content }) => ({ chapter, verse, content })), hasMore: rows.length > PAGE },
      { headers: CACHE }
    );
  }

  // ── Totals per book ─────────────────────────────────────────────────────────
  const { data, error } = await supabase.rpc("bible_search_summary", { q, tr, whole });
  let books = ((data as { book_no: number; book_name: string; verses: number; occurrences: number }[] | null) ?? []).map((b) => ({
    book_no: b.book_no,
    book_name: b.book_name,
    verses: Number(b.verses),
    occurrences: Number(b.occurrences),
  }));
  let approximate = false;

  if (missingRpc(error)) {
    // SQL not installed yet: fetch candidate verses and count here
    const re = matcher(q, whole);
    const { data: raw } = await supabase
      .from("bible_verses")
      .select("book_no, book_name, content")
      .eq("translation", tr)
      .ilike("content", `%${q.split(/\s+/)[0]}%`)
      .limit(FALLBACK_LIMIT);
    const rows = (raw as Pick<Row, "book_no" | "book_name" | "content">[]) ?? [];
    approximate = rows.length >= FALLBACK_LIMIT;
    const byBook = new Map<number, { book_no: number; book_name: string; verses: number; occurrences: number }>();
    for (const r of rows) {
      const n = (r.content.match(re) ?? []).length;
      if (!n) continue;
      const b = byBook.get(r.book_no) ?? { book_no: r.book_no, book_name: r.book_name, verses: 0, occurrences: 0 };
      b.verses++;
      b.occurrences += n;
      byBook.set(r.book_no, b);
    }
    books = [...byBook.values()].sort((a, b) => a.book_no - b.book_no);
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = books.reduce(
    (t, b) => ({ occurrences: t.occurrences + b.occurrences, verses: t.verses + b.verses, books: t.books + 1 }),
    { occurrences: 0, verses: 0, books: 0 }
  );
  return NextResponse.json({ q, tr, whole, total, books, approximate }, { headers: CACHE });
}
