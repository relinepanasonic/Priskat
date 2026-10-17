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
  // ?ayat=14 opens the chapter at that verse and highlights it (used by Bible search)
  const ayatParam = typeof resolvedSearchParams.ayat === 'string' ? parseInt(resolvedSearchParams.ayat) : NaN;
  const initialVerse = Number.isFinite(ayatParam) ? ayatParam : null;
  const isDeutero = bookId >= 67;

  let apiData = null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    let { data: verses, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book_no', bookId)
      .eq('chapter', chapter)
      .eq('translation', version)
      .order('verse', { ascending: true });

    // The Indonesian (TB) text has no deuterocanonical books yet: show the English
    // NRSV-CE text with a note instead of the wrong book.
    let deuteroNote: string | null = null;
    if (isDeutero && (!verses || verses.length === 0) && version !== 'NRSV-CE') {
      const fallback = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_no', bookId)
        .eq('chapter', chapter)
        .eq('translation', 'NRSV-CE')
        .order('verse', { ascending: true });
      verses = fallback.data;
      error = fallback.error;
      if (verses && verses.length > 0) {
        deuteroNote = isId
          ? 'Teks Deuterokanonika bahasa Indonesia belum tersedia. Ditampilkan dalam bahasa Inggris (NRSV-CE).'
          : 'Showing the NRSV-CE text.';
      }
    }

    if (!error && verses && verses.length > 0) {
      const mappedVerses: { verse: number; type: string; content: string }[] = [];
      if (deuteroNote) mappedVerses.push({ verse: 0, type: 'title', content: deuteroNote });
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
    
    // The external API has no deuterocanonical books (it returns Genesis instead), so never use it for them
    if (!apiData && !isDeutero) {
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
      initialVerse={initialVerse}
    />
  );
}
