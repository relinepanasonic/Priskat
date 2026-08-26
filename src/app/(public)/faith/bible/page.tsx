import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import Link from "next/link";
import { Book, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Bible - Priskat",
  description: "Read the Holy Bible",
};

export default async function BiblePage() {
  const supabase = await createClient();
  const lang = await getLanguage();
  const isId = lang === "id";

  // Fetch unique books we have in the database
  const { data: verses, error } = await supabase
    .from("bible_verses" as any)
    .select("book_id, book_name_id, book_name_en")
    .order("book_id", { ascending: true });

  // Deduplicate books
  const booksMap = new Map();
  if (verses) {
    verses.forEach((v: any) => {
      if (!booksMap.has(v.book_id)) {
        booksMap.set(v.book_id, v);
      }
    });
  }
  const books = Array.from(booksMap.values());

  return (
    <div className="w-full h-full pb-8">
      {/* Header */}
      <div className="bg-brand-surface pt-safe pb-6 px-4  shadow-3d-heavy relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex items-center space-x-3 mt-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-inner-dark border border-[#333]">
            <Book className="h-5 w-5 text-brand-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {isId ? "Alkitab" : "Holy Bible"}
          </h1>
        </div>
        <p className="text-brand-muted text-sm px-1">
          {isId 
            ? "Pilih kitab untuk mulai membaca Firman Tuhan." 
            : "Select a book to start reading the Word of God."}
        </p>
      </div>

      {/* Book List */}
      <div className="px-4 mt-6">
        {books.length === 0 ? (
          <div className="text-center py-10 bg-brand-surface/50 rounded-2xl border border-[#333] border-t-[#444] border-l-[#444] shadow-3d mt-4">
            <Book className="h-10 w-10 text-brand-muted mx-auto mb-3 opacity-50" />
            <h3 className="text-brand-light font-medium">
              {isId ? "Belum Ada Kitab" : "No Books Available"}
            </h3>
            <p className="text-brand-muted text-sm mt-2 max-w-[250px] mx-auto">
              {isId 
                ? "Silahkan jalankan script seeder di Supabase SQL Editor terlebih dahulu." 
                : "Please run the seeder script in Supabase SQL Editor first."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {books.map((book) => (
              <Link 
                href={`/bible/${book.book_id}/1`} 
                key={book.book_id}
                className="bg-brand-surface p-4 rounded-2xl flex items-center justify-between border border-[#333] border-t-[#444] border-l-[#444] shadow-3d active:translate-y-1 active:shadow-inner-dark transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-inner-dark text-brand-gold font-bold">
                    {book.book_id}
                  </div>
                  <div>
                    <h3 className="text-brand-light font-medium text-lg">
                      {isId ? book.book_name_id : book.book_name_en}
                    </h3>
                    <p className="text-brand-muted text-xs">
                      {isId ? book.book_name_en : book.book_name_id}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-brand-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
