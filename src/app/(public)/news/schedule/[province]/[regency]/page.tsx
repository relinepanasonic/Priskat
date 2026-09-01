import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import ChurchCard, { MassChurch } from "../../ChurchCard";

export const revalidate = 3600;

export default async function RegencyChurchesPage({
  params,
}: {
  params: Promise<{ province: string; regency: string }>;
}) {
  const { province, regency } = await params;
  const supabase = await createClient();
  const lang = await getLanguage();
  const isId = lang !== "en";

  const { data } = await supabase
    .from("mass_churches")
    .select("*")
    .eq("province_slug", province)
    .eq("regency_slug", regency)
    .order("name", { ascending: true });

  const churches = (data as MassChurch[]) || [];
  if (churches.length === 0) notFound();

  const { province_name, regency_name } = churches[0];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(ellipse_at_top,rgba(214,176,114,0.12),transparent_65%)]" />

      <div className="relative px-5 py-8 md:px-8 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-muted">
          <Link href="/news/schedule" className="transition-colors hover:text-brand-gold">
            {isId ? "Jadwal Misa" : "Mass Schedule"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{province_name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-brand-light">{regency_name}</span>
        </nav>

        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-gold/75">
              <MapPin className="h-3 w-3" />
              {province_name}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-white md:text-3xl">
              {regency_name}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold">
            {churches.length} {isId ? "gereja" : "churches"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {churches.map((c) => (
            <ChurchCard key={c.id} church={c} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}
