import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request, context: any) {
  const resolvedParams = await context.params;
  const bookIdStr = resolvedParams.bookId;
  const chapterStr = resolvedParams.chapter;
  
  const bookId = parseInt(bookIdStr);
  const chapter = parseInt(chapterStr);
  
  if (isNaN(bookId) || isNaN(chapter)) {
    return NextResponse.json({ error: "Invalid bookId or chapter" }, { status: 400 });
  }

  // 1. Try to fetch from our custom database first
  const { data: verses, error } = await supabase
    .from("bible_verses")
    .select("*")
    .eq("book_no", bookId)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  // If found in our DB, return it immediately
  if (!error && verses && verses.length > 0) {
    return NextResponse.json({
      data: {
        book: {
          no: bookId,
          name: verses[0].book_name,
          chapter: verses.length // approximation, UI doesn't strictly depend on this
        },
        verses: verses.map(v => ({
          verse: v.verse,
          type: "content",
          content: v.content
        }))
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  }
  
  // 2. If not found in our DB, fallback to proxying beeble API
  try {
    const res = await fetch(`https://beeble.vercel.app/api/v1/passage/${bookId}/${chapter}`, {
      next: { revalidate: 86400 } // cache for 1 day
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: res.status });
    }
    
    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch from upstream" }, { status: 500 });
  }
}
