import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import CoverageTable, { type BranchRow } from "@/components/admin/CoverageTable";
import CoverageMap from "@/components/camp/CoverageMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coverage" };

export default async function CampCoveragePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/camp");

  const [{ data: branches }, { data: camps }] = await Promise.all([
    supabase.from("branches").select("*").order("provinsi").order("kota"),
    supabase.from("camp_cohorts").select("branch").eq("community_id", community.id),
  ]);

  const perBranch = new Map<string, number>();
  for (const c of (camps as { branch: string | null }[]) ?? []) {
    const key = (c.branch ?? "").trim().toLowerCase();
    if (key) perBranch.set(key, (perBranch.get(key) ?? 0) + 1);
  }

  const rows: BranchRow[] = ((branches as any[]) ?? []).map((b) => ({
    id: b.id,
    negara: b.negara,
    provinsi: b.provinsi,
    kota: b.kota,
    branch: b.branch ?? null,
    camps: perBranch.get(String(b.branch || b.kota).trim().toLowerCase()) ?? 0,
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#D6B072]">Coverage</p>
        <h2 className="mt-1 text-2xl font-semibold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>Jangkauan {community.name}</h2>
        <p className="mt-1 text-sm text-brand-muted">Titik emas menandai kota yang sudah menyelenggarakan camp.</p>
      </header>
      <CoverageMap rows={rows} />
      <details className="rounded-2xl border border-[#333]">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white">Lihat sebagai tabel</summary>
        <CoverageTable rows={rows} canEdit={false} />
      </details>
    </div>
  );
}
