import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import ClergyDirectory, { type ClergyRow } from "@/components/ci/ClergyDirectory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Romo" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function ClergyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, canEdit } = await getCommunityPageContext(slug);

  const [{ data, error }, { dioceses, fromDb }] = await Promise.all([
    supabase
      .from("clergy" as any)
      .select("user_id, title, congregation, parish, profile:profiles(id, full_name, nama_panggilan, avatar_url, kota), diocese:dioceses(name)")
      .order("created_at"),
    loadDioceses(supabase),
  ]);

  const clergy = ((data as unknown as ClergyRow[]) ?? []).sort((a, b) =>
    (a.profile?.full_name ?? "").localeCompare(b.profile?.full_name ?? "")
  );

  return (
    <div className="pb-24">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#D6B072]">Para Imam</p>
        <h2 className="mt-1 text-3xl font-semibold text-white" style={serif}>Romo</h2>
        <p className="mt-2 text-[#EAE5D9]/80">Para romo dan biarawan-biarawati yang menjadi bagian dari Ruang Iman.</p>
        {canEdit && error && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Mode admin: jalankan <code>supabase/080_catholic_indonesia_pages.sql</code> untuk mengaktifkan daftar romo.
          </p>
        )}
      </header>
      <ClergyDirectory
        clergy={clergy}
        canEdit={canEdit && !error}
        dioceses={fromDb ? dioceses.filter((d) => d.id).map((d) => ({ id: d.id!, name: d.name })) : []}
      />
    </div>
  );
}
