import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import CommunityProfileForm from "@/components/admin/CommunityProfileForm";

export const dynamic = "force-dynamic";

/** Community Center → Profil: the Super admin edits it, an Admin reads it. */
export default async function CommunityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/admin/communities");

  const { data: canEdit } = await supabase.rpc("community_superadmin_of" as any, { p_community: community.id });
  const { data: full } = await supabase.from("communities").select("id, name, slug, description, logo_url, vision, mission, motto, tagline, is_public").eq("id", community.id).maybeSingle();
  const { data: admins } = await supabase
    .from("community_admins")
    .select("id, user_id, role, profiles(full_name, username)")
    .eq("community_id", community.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">Profil komunitas</h2>
        <p className="text-sm text-brand-muted">{canEdit === true ? "Kamu Super admin komunitas ini." : "Kamu admin komunitas ini."}</p>
      </div>
      <CommunityProfileForm community={full as any} admins={(admins as any[]) ?? []} canEdit={canEdit === true} />
    </div>
  );
}
