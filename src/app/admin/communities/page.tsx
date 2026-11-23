import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityLanding, { type LandingCommunity } from "@/components/admin/CommunityLanding";
import { sortCommunities } from "@/lib/community";

export const dynamic = "force-dynamic";

/** Community Center front page: the communities you can enter. Everything else happens inside a community. */
export default async function CommunityCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const globalAdmin = ["founder", "superadmin", "admin", "moderator"].includes(String(me?.role ?? "").toLowerCase());

  let list: LandingCommunity[] = [];
  if (globalAdmin) {
    const { data } = await supabase.from("communities").select("id, name, slug, logo_url").order("name");
    list = sortCommunities((data as LandingCommunity[]) ?? []);
  } else {
    const { data: mine } = await supabase
      .from("community_admins")
      .select("community:communities!community_id(id, name, slug, logo_url)")
      .eq("user_id", user.id);
    list = ((mine as unknown as { community: LandingCommunity | null }[]) ?? [])
      .map((r) => r.community)
      .filter((c): c is LandingCommunity => !!c);
    // a community admin with just one community goes straight into it
    if (list.length === 1) redirect(`/admin/communities/${list[0].slug || list[0].id}/dashboard`);
  }

  return <CommunityLanding communities={list} canManage={globalAdmin} />;
}
