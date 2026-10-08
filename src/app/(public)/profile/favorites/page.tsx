import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FavoriteVersesList from "@/components/faith/FavoriteVersesList";

export const metadata = { title: "Ayat Fav ku" };

export default async function FavoriteVersesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorite_verses")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#1a1d24] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1d24]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4 flex items-center gap-3">
        <Link
          href="/faith/bible"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-white font-bold text-lg">Ayat Fav ku</h1>
          <p className="text-white/40 text-xs">{favorites?.length ?? 0} ayat tersimpan</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {!favorites || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-white font-semibold text-lg mb-2">Belum ada ayat favorit</h2>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-6">
              Ketuk ayat mana saja di Alkitab, lalu simpan ke "Ayat Fav ku"
            </p>
            <Link
              href="/faith/bible"
              className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              Buka Alkitab
            </Link>
          </div>
        ) : (
          <FavoriteVersesList initialFavorites={favorites} userId={session.user.id} />
        )}
      </div>
    </div>
  );
}
