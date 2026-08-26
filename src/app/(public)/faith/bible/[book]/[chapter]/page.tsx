import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BibleChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const resolvedParams = await params;
  const bookId = parseInt(resolvedParams.book);
  const chapter = parseInt(resolvedParams.chapter);
  
  if (isNaN(bookId) || isNaN(chapter)) return notFound();

  const supabase = await createClient();
  const lang = await getLanguage();
  const isId = lang === "id";

  const { data: verses, error } = await supabase
    .from("bible_verses" as any)
    .select("*")
    .eq("book_id", bookId)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  if (error || !verses || verses.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Chapter Not Found</h2>
        <p className="text-brand-muted mb-6">We couldn't find this chapter in the database.</p>
        <Link href="/bible" className="bg-brand-surface border border-[#333] px-6 py-2 rounded-full text-brand-gold">
          Go Back
        </Link>
      </div>
    );
  }

  const bookNameId = verses[0].book_name_id;
  const bookNameEn = verses[0].book_name_en;

  return (
    <div className="min-h-screen bg-brand-dark pb-32">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-brand-dark/90 backdrop-blur-md border-b border-[#333] pb-4 pt-safe-or-4">
        <div className="flex items-center justify-between px-4">
          <Link href="/bible" className="p-2 -ml-2 rounded-full hover:bg-brand-surface/50 text-brand-light">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-brand-gold">
            {isId ? bookNameId : bookNameEn} {chapter}
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Verses */}
      <div className="px-4 py-6 space-y-6">
        {verses.map((v: any) => (
          <div key={v.id} className="flex gap-3">
            <div className="text-brand-gold font-bold text-sm mt-1 shrink-0 w-6">
              {v.verse}
            </div>
            <div className="flex-1 space-y-2">
              {/* Primary Language */}
              <p className="text-brand-light text-lg leading-relaxed font-serif">
                {isId ? v.text_id : v.text_en}
              </p>
              
              {/* Secondary Language (Smaller and muted) */}
              <p className="text-brand-muted text-sm leading-relaxed italic border-l-2 border-[#333] pl-3">
                {isId ? v.text_en : v.text_id}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-4 py-6 flex justify-between">
        {chapter > 1 ? (
          <Link 
            href={`/bible/${bookId}/${chapter - 1}`}
            className="flex items-center gap-2 bg-brand-surface border border-[#333] px-4 py-2 rounded-full text-brand-light shadow-3d"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Link>
        ) : <div></div>}
        
        <Link 
          href={`/bible/${bookId}/${chapter + 1}`}
          className="flex items-center gap-2 bg-brand-surface border border-[#333] px-4 py-2 rounded-full text-brand-light shadow-3d"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

