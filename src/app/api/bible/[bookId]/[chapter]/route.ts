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

  // 1. If bookId >= 67, it's a Deuterocanonical book, always query our database
  if (bookId >= 67) {
    const { data: verses, error } = await supabase
      .from("bible_verses")
      .select("*")
      .eq("book_no", bookId)
      .eq("chapter", chapter)
      .order("verse", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!verses || verses.length === 0) {
      return NextResponse.json({ error: "Chapter not found in custom DB" }, { status: 404 });
    }

    // Format response to match beeble API
    return NextResponse.json({
      data: {
        book: {
          no: bookId,
          name: verses[0].book_name,
          chapter: verses.length // approximation of total chapters, but UI doesn't strictly need it
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
  
  // 2. If bookId < 67, proxy to beeble API (which returns 1-66 Protestant books)
  // This acts as a single unified endpoint for the frontend.
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch from upstream" }, { status: 500 });
  }
}
