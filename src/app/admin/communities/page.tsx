import { createClient } from "@/lib/supabase/server";
import CommunityCenterClient from "@/components/admin/CommunityCenterClient";

export default async function CommunityCenterPage() {
  const supabase = await createClient();

  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .order("name");

  const { data: admins } = await supabase
    .from("community_admins")
    .select("*, profiles(id, full_name, username)");

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .order("full_name");

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, end_date, location, maps_url, banner_image_url, status, created_at"
    )
    .order("event_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Community Center</h1>
        <p className="text-brand-muted mt-1">Manage communities and their admins.</p>
      </div>
      <CommunityCenterClient initialCommunities={communities || []} initialAdmins={admins || []} allUsers={allUsers || []} initialEvents={events || []} />
    </div>
  );
}
