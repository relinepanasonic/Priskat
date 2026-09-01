import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, context: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'id';

  const resolvedParams = await context.params;
  const bookId = parseInt(resolvedParams.bookId);
  const chapter = parseInt(resolvedParams.chapter);

  if (isNaN(bookId) || isNaN(chapter)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  let query = supabase
    .from('bible_verses')
    .select('verse, content, translation, title, book_name')
    .eq('book_no', bookId)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  query = lang === 'en' ? query.neq('translation', 'TB') : query.eq('translation', 'TB');

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If several non-TB translations exist, keep the first row per verse number.
  let rows = data || [];
  if (lang === 'en' && rows.length > 0) {
    const seen = new Map<number, any>();
    for (const row of rows) {
      if (!seen.has(row.verse)) seen.set(row.verse, row);
    }
    rows = Array.from(seen.values());
  }

  // Fall back to TB when an English request finds nothing.
  if (lang === 'en' && rows.length === 0) {
    const { data: fallback } = await supabase
      .from('bible_verses')
      .select('verse, content, translation, title, book_name')
      .eq('book_no', bookId)
      .eq('chapter', chapter)
      .eq('translation', 'TB')
      .order('verse', { ascending: true });
    rows = fallback || [];
  }

  // Shape it the same way the reader / fetchBibleVerse expect:
  // { data: { book, verses: [{ verse, type: 'title' | 'content', content }] } }
  const verses: { verse: number; type: 'title' | 'content'; content: string }[] = [];
  for (const row of rows) {
    if (row.title) verses.push({ verse: row.verse, type: 'title', content: row.title });
    verses.push({ verse: row.verse, type: 'content', content: row.content });
  }

  return NextResponse.json({
    data: {
      book: { no: bookId, name: rows[0]?.book_name ?? '', chapter },
      verses,
    },
  });
}
