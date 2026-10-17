import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import CoverageTable, { type BranchRow } from "@/components/admin/CoverageTable";

export const dynamic = "force-dynamic";

export default async function CommunityCoveragePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/admin/communities");

  const [{ data: branches }, { data: camps }, { data: caller }] = await Promise.all([
    supabase.from("branches").select("*").order("provinsi").order("kota"),
    supabase.from("camp_cohorts").select("branch").eq("community_id", community.id),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  // Camps this community runs, counted per branch
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

  const canEdit = ["founder", "superadmin", "admin"].includes(String(caller?.role ?? "").toLowerCase());
  return <CoverageTable rows={rows} canEdit={canEdit} />;
}
