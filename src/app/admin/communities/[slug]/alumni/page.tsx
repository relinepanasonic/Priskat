import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import AlumniClient, { type Alumnus } from "@/components/community/AlumniClient";

export const dynamic = "force-dynamic";

/** Community Center → Alumni (Catholic Family Ministry). The database only returns rows to this community's admins. */
export default async function AlumniAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const community = await resolveCommunity(supabase, slug);
  if (!community) notFound();

  // The API returns at most 1000 rows at a time, so read in pages
  const rows: Alumnus[] = [];
  for (let from = 0; from < 10000; from += 1000) {
    const { data, error } = await supabase
      .from("cfm_alumni" as any)
      .select("id, program, angkatan, full_name, nickname, city, province, phone, phone2, paroki_group, paroki, claimed_user_id")
      .eq("community_id", community.id)
      .order("program")
      .order("full_name")
      .range(from, from + 999);
    if (error) break;
    rows.push(...((data as unknown as Alumnus[]) ?? []));
    if (!data || data.length < 1000) break;
  }
  return <AlumniClient rows={rows} communityName={community.name ?? "Komunitas"} />;
}
