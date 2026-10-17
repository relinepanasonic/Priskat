import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import DioceseDirectory from "@/components/ci/DioceseDirectory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Para Uskup" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function BishopsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { slug } = await params;
  const { d: open } = await searchParams;
  const { supabase, isSiteAdmin } = await getCommunityPageContext(slug);
  const { dioceses, fromDb } = await loadDioceses(supabase);
  const count = dioceses.filter((d) => d.kind !== "ordinariat").length;

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#D6B072]">Para Gembala</p>
        <h2 className="mt-1 text-3xl font-semibold text-white" style={serif}>Uskup di Indonesia</h2>
        <p className="mt-2 text-[#EAE5D9]/80">
          {count} keuskupan dalam 10 provinsi gerejawi, ditambah Ordinariat Militer.
        </p>
        {isSiteAdmin && !fromDb && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Mode admin: jalankan <code>supabase/080_catholic_indonesia_pages.sql</code> agar data uskup bisa diubah dari sini.
          </p>
        )}
      </header>
      <DioceseDirectory dioceses={dioceses} canEdit={isSiteAdmin && fromDb} initialOpen={open} />
    </div>
  );
}
