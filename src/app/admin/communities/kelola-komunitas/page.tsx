import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CommunityCenterClient from "@/components/admin/CommunityCenterClient";
import { sortCommunities } from "@/lib/community";

export const dynamic = "force-dynamic";

/** Founder and super admins only: add, edit and delete communities, and set their admins. */
export default async function ManageCommunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  // only the Founder and Superadmin may add or manage communities and their admins
  const canAdd = ["founder", "superadmin"].includes(String(me?.role ?? "").toLowerCase());
  if (!canAdd) redirect("/admin/communities");

  const { data: communityRows } = await supabase.from("communities").select("*").order("name");
  const communities = sortCommunities(communityRows);
  const { data: admins } = await supabase.from("community_admins").select("*, profiles(id, full_name, username)");
  const { data: allUsers } = await supabase.from("profiles").select("id, full_name, username").order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/communities" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Community Center
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Add New Community</h1>
        <p className="mt-1 text-brand-muted">Tambah atau ubah komunitas, dan tentukan adminnya.</p>
      </div>
      <CommunityCenterClient initialCommunities={communities || []} initialAdmins={admins || []} allUsers={allUsers || []} />
    </div>
  );
}
