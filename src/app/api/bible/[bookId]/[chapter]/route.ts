import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, context: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang');
  const debug = searchParams.get('debug');

  if (debug) {
    const { data } = await supabase.from('bible_verses').select('translation').limit(100);
    const unique = [...new Set(data?.map(d => d.translation))];
    return NextResponse.json({ unique });
  }

  const resolvedParams = await context.params;
  const bookId = parseInt(resolvedParams.bookId);
  const chapter = parseInt(resolvedParams.chapter);

  if (isNaN(bookId) || isNaN(chapter)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  let query = supabase
    .from('bible_verses')
    .select('verse, text, translation')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (lang === 'en') {
    // Attempt to fetch an English translation like WEB or KJV. 
    // Since we don't know the exact code, we can filter for anything not TB and sort by translation to group them,
    // but the best way is to pick a known one, or just the first non-TB one per verse if there are multiple.
    // For now, let's filter specifically for WEB if it exists, or just not TB.
    query = query.neq('translation', 'TB');
  } else {
    // id default
    query = query.eq('translation', 'TB');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduplicate verses if multiple non-TB translations are returned
  let finalData = data;
  if (lang === 'en' && data && data.length > 0) {
    const verseMap = new Map();
    data.forEach((row: any) => {
      // Keep the first translation encountered for each verse
      if (!verseMap.has(row.verse)) {
        verseMap.set(row.verse, row);
      }
    });
    finalData = Array.from(verseMap.values());
  }

  // Fallback: If we tried to fetch English but got nothing, let's fetch TB
  if (lang === 'en' && (!finalData || finalData.length === 0)) {
    const { data: fallbackData } = await supabase
      .from('bible_verses')
      .select('verse, text, translation')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('translation', 'TB')
      .order('verse', { ascending: true });
    
    finalData = fallbackData || [];
  }

  return NextResponse.json(finalData || []);
}
