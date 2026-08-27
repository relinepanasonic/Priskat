import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, context: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const resolvedParams = await context.params;
  const bookId = parseInt(resolvedParams.bookId);
  const chapter = parseInt(resolvedParams.chapter);

  if (isNaN(bookId) || isNaN(chapter)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bible_verses')
    .select('verse, text, translation')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
