import { getLanguage } from "@/lib/lang";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BibleChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const resolvedParams = await params;
  const bookIdStr = resolvedParams.book;
  const chapterStr = resolvedParams.chapter;
  const bookId = parseInt(bookIdStr);
  const chapter = parseInt(chapterStr);
  
  if (isNaN(bookId) || isNaN(chapter)) return notFound();

  const lang = await getLanguage();
  const isId = lang === "id";

  // Fetch from the free open-source Indonesian Bible API (TB Translation)
  let apiData = null;
  try {
    const res = await fetch(`https://beeble.vercel.app/api/v1/passage/${bookId}/${chapter}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (res.ok) {
      const json = await res.json();
      apiData = json.data;
    }
  } catch (error) {
    console.error("Failed to fetch Bible chapter", error);
  }

  if (!apiData || !apiData.verses || apiData.verses.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Chapter Not Found</h2>
        <p className="text-brand-muted mb-6">We couldn't load this chapter right now.</p>
        <Link href="/faith/bible" className="bg-brand-surface border border-[#333] px-6 py-2 rounded-full text-brand-gold">
          Go Back
        </Link>
      </div>
    );
  }

  const currentBookName = apiData.book.name;
  const maxChapters = 150; // A fallback max, ideally we check against a map.

  return (
    <div className="min-h-[80vh] bg-white relative pb-32 font-serif text-[#111]">
      
      {/* Top Navigation / Breadcrumb - Minimalist */}
      <div className="flex items-center px-4 py-4 md:px-8">
        <Link href="/faith/bible" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>
      </div>

      {/* Chapter Header */}
      <div className="px-6 md:px-12 mt-2 mb-10 text-center">
        <h2 className="text-gray-500 font-bold text-sm md:text-base uppercase tracking-widest font-sans">
          {currentBookName}
        </h2>
        <h1 className="text-6xl md:text-8xl font-bold mt-2 text-black">
          {chapter}
        </h1>
      </div>

      {/* Verses Content - Inline Paragraph */}
      <div className="px-6 md:px-12 lg:px-16 mx-auto max-w-5xl text-justify md:columns-2 md:gap-16 md:bg-[#fbfbf9] md:shadow-[0_0_40px_rgba(0,0,0,0.1)] md:p-12 md:rounded-lg relative" style={{columnFill: "auto"}}>
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-gray-300 to-transparent -translate-x-1/2 shadow-[-2px_0_10px_rgba(0,0,0,0.1)] pointer-events-none"></div>`n        <div className="text-[17px] md:text-xl leading-relaxed md:leading-[2] text-[#222] break-inside-avoid-column">
          {apiData.verses.map((v: any, index: number) => {
            if (v.type === "title") {
              return (
                <h3 key={index} className="text-xl md:text-2xl font-bold italic mt-8 mb-4 text-black block">
                  {v.content}
                </h3>
              );
            }
            return (
              <span key={index} className="inline">
                <sup className="text-gray-400 font-sans font-semibold text-xs md:text-sm mr-1 ml-1.5 align-super">
                  {v.verse}
                </sup>
                <span>
                  {v.content}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-24 md:bottom-8 left-0 right-0 z-50 px-4 md:px-0 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto flex items-center gap-3">
          
          {/* Play Button */}
          <button className="h-14 w-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black shrink-0">
            <Play className="h-5 w-5 ml-1" fill="currentColor" />
          </button>

          {/* Chapter Navigation Pill */}
          <div className="flex-1 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] h-14 flex items-center justify-between px-2">
            {chapter > 1 ? (
              <Link 
                href={`/faith/bible/${bookId}/${chapter - 1}`}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-black transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <div className="h-10 w-10" /> // Spacer
            )}
            
            <span className="font-bold font-sans text-sm md:text-base text-black px-2 truncate">
              {currentBookName} {chapter}
            </span>
            
            <Link 
              href={`/faith/bible/${bookId}/${chapter + 1}`}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-black transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}


