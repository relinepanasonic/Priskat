import { getLanguage } from "@/lib/lang";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookReader from "@/components/faith/BookReader";

export default async function BibleChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const bookId = parseInt(resolvedParams.book);
  const chapter = parseInt(resolvedParams.chapter);
  
  if (isNaN(bookId) || isNaN(chapter)) return notFound();

  const lang = await getLanguage();
  const isId = lang === 'id';
  
  // Get logged-in user for favorite verse saving
  const serverSupabase = await createServerClient();
  const { data: { session } } = await serverSupabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  // Default to TB for ID, NRSV-CE for EN
  const version = isId ? 'TB' : (typeof resolvedSearchParams.version === 'string' ? resolvedSearchParams.version : 'NRSV-CE');

  let apiData = null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: verses, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book_no', bookId)
      .eq('chapter', chapter)
      .eq('translation', version)
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
    
    if (!apiData) {
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
      lang={lang}
      userId={userId}
    />
  );
}
