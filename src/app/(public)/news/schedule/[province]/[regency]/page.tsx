import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
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
    <div className="p-4 md:p-8">
      <Link
        href="/news/schedule"
        className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-white transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        {isId ? "Ganti wilayah" : "Change region"}
      </Link>

      <div className="mb-6">
        <p className="text-xs text-brand-gold/80 font-medium">{province_name}</p>
        <h2 className="text-xl md:text-2xl font-bold text-white">{regency_name}</h2>
        <p className="text-sm text-brand-muted mt-0.5">
          {churches.length} {isId ? "gereja" : "churches"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {churches.map((c) => (
          <ChurchCard key={c.id} church={c} />
        ))}
      </div>
    </div>
  );
}
