import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrgStructureClient from "./OrgStructureClient";
import { resolveCommunity } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function OrgStructurePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const slug = params.slug;

  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;
  if (!user) {
    redirect("/login");
  }

  // Get community (slug segment may be a slug or a community id)
  const community = await resolveCommunity(supabase, slug);
  if (!community) {
    redirect("/camp");
  }

  // Check admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: adminCheck } = await supabase
    .from("community_admins")
    .select("id")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  const isAdmin = adminCheck !== null || profile?.role === "superadmin" || profile?.role === "founder";

  // Get structure
  const { data: structure } = await supabase
    .from("community_org_structure")
    .select(`
      id,
      level,
      role_title,
      order_index,
      user_id,
      profiles (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq("community_id", community.id)
    .order("level", { ascending: true })
    .order("order_index", { ascending: true });

  // Get all profiles to allow assigning
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .order("full_name", { ascending: true });

  return (
    <OrgStructureClient 
      communityId={community.id}
      communityName={community.name}
      initialStructure={structure || []}
      isAdmin={isAdmin}
      profiles={profiles || []}
    />
  );
}

