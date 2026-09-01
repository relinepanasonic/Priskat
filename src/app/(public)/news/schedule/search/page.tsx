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
    <div className="p-4 md:p-8">
      <Link
        href="/news/schedule"
        className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-white transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        {isId ? "Kembali" : "Back"}
      </Link>

      <h2 className="text-lg md:text-xl font-bold text-white">
        {isId ? "Hasil pencarian" : "Search results"}
        {query && <span className="text-brand-muted font-normal"> — “{query}”</span>}
      </h2>
      <p className="text-sm text-brand-muted mt-0.5 mb-6">
        {churches.length} {isId ? "gereja ditemukan" : "churches found"}
      </p>

      {churches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((c) => (
            <ChurchCard key={c.id} church={c} showRegion />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-16">
          <div className="h-14 w-14 rounded-full bg-brand-bg border border-[#333] flex items-center justify-center mb-4">
            <SearchX className="h-6 w-6 text-brand-muted" />
          </div>
          <p className="text-sm text-white font-semibold mb-1">
            {isId ? "Tidak ada gereja yang cocok" : "No matching churches"}
          </p>
          <p className="text-xs text-brand-muted max-w-[260px]">
            {isId
              ? "Coba kata kunci lain, atau telusuri berdasarkan wilayah."
              : "Try a different keyword, or browse by region."}
          </p>
        </div>
      )}
    </div>
  );
}
