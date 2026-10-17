import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import CoverageTable, { type BranchRow } from "@/components/admin/CoverageTable";

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

  return <CoverageTable rows={rows} canEdit={false} />;
}
