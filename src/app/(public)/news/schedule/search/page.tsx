import Link from "next/link";
import { ChevronLeft, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import ChurchCard, { MassChurch } from "../ChurchCard";

export const revalidate = 0;

export default async function MassSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const supabase = await createClient();
  const lang = await getLanguage();
  const isId = lang !== "en";

  let churches: MassChurch[] = [];
  if (query.length >= 2) {
    const { data } = await supabase
      .from("mass_churches")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(60);
    churches = (data as MassChurch[]) || [];
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(ellipse_at_top,rgba(214,176,114,0.1),transparent_65%)]" />

      <div className="relative px-5 py-8 md:px-8 md:py-10">
        <Link
          href="/news/schedule"
          className="mb-5 inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-gold"
        >
          <ChevronLeft className="h-4 w-4" />
          {isId ? "Kembali" : "Back"}
        </Link>

        <div className="mb-7">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            {isId ? "Hasil Pencarian" : "Search Results"}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {query && (
              <>
                <span className="text-brand-gold">“{query}”</span> —{" "}
              </>
            )}
            {churches.length} {isId ? "gereja ditemukan" : "churches found"}
          </p>
        </div>

        {churches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {churches.map((c) => (
              <ChurchCard key={c.id} church={c} lang={lang} showRegion />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429]">
              <SearchX className="h-7 w-7 text-brand-muted" />
            </div>
            <p className="mb-1 font-serif text-base font-bold text-white">
              {isId ? "Tidak ada gereja yang cocok" : "No matching churches"}
            </p>
            <p className="max-w-[280px] text-xs text-brand-muted">
              {isId
                ? "Coba kata kunci lain, atau telusuri berdasarkan wilayah."
                : "Try a different keyword, or browse by region instead."}
            </p>
            <Link
              href="/news/schedule"
              className="mt-5 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold/15"
            >
              {isId ? "Telusuri wilayah" : "Browse by region"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
