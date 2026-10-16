import { createClient } from "@/lib/supabase/server";
import CommunityCenterClient from "@/components/admin/CommunityCenterClient";
import { sortCommunities } from "@/lib/community";

export default async function CommunityCenterPage() {
  const supabase = await createClient();

  const { data: communityRows } = await supabase
    .from("communities")
    .select("*")
    .order("name");
  const communities = sortCommunities(communityRows);

  const { data: admins } = await supabase
    .from("community_admins")
    .select("*, profiles(id, full_name, username)");

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Community Center</h1>
        <p className="text-brand-muted mt-1">Manage communities and their admins.</p>
      </div>
      <CommunityCenterClient initialCommunities={communities || []} initialAdmins={admins || []} allUsers={allUsers || []} />
    </div>
  );
}
