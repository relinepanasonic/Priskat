import { getLanguage } from "@/lib/lang";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookReader from "@/components/faith/BookReader";

export default async function BibleChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const resolvedParams = await params;
  const bookId = parseInt(resolvedParams.book);
  const chapter = parseInt(resolvedParams.chapter);
  
  if (isNaN(bookId) || isNaN(chapter)) return notFound();

  const lang = await getLanguage();

  let apiData = null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    if (lang === 'id' || bookId >= 67) {
      // Check our custom Indonesian DB first (Deuterocanonicals ONLY have ID right now)
      const { data: verses, error } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_no', bookId)
        .eq('chapter', chapter)
        .eq('language', 'id') // Ensure we fetch ID
        .order('verse', { ascending: true });
        
      if (!error && verses && verses.length > 0) {
        const mappedVerses = [];
        for (const v of verses) {
          if (v.title) {
            mappedVerses.push({ verse: v.verse, type: 'title', content: v.title });
          }
          mappedVerses.push({ verse: v.verse, type: 'content', content: v.content });
        }
        apiData = { 
          book: { no: bookId, name: verses[0].book_name, chapter: chapter }, 
          verses: mappedVerses 
        };
      }
    } 
    
    // Fallback to external API (for English, or if Indonesian is missing in our DB)
    if (!apiData) {
      // For english we can use bible-api or just beeble depending on what they want.
      // Beeble doesn't support English properly, so wait, how did it work for EN before?
      // Previously, the English logic in page.tsx was just hitting Beeble (which returns Indonesian).
      // Oh wait, Beeble (alkitab.sabda.org) is ONLY Indonesian TB. So English wasn't actually working for the Bible reader anyway!
      // Let's just keep hitting Beeble as fallback for now, as that's what the old code did.
      const res = await fetch(`https://beeble.vercel.app/api/v1/passage/${bookId}/${chapter}`, {
        next: { revalidate: 86400 }
      });
      if (res.ok) {
        const json = await res.json();
        apiData = json.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch Bible chapter", error);
  }

  if (!apiData || !apiData.verses || apiData.verses.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#2a2520] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Chapter Not Found</h2>
        <p className="text-gray-400 mb-6">We couldn't load this chapter right now.</p>
        <Link href="/faith/bible" className="border border-white/20 px-6 py-2 rounded-full text-white hover:bg-white/10">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <BookReader
      verses={apiData.verses}
      bookName={apiData.book.name}
      bookId={bookId}
      chapter={chapter}
    />
  );
}
