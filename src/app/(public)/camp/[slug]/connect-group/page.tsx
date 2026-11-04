import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import ConnectGroupsClient from "@/components/community/ConnectGroupsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connect Group" };

/**
 * Connect Group for the PIC and pengurus of a group (they are not admins, so they cannot open the admin area).
 * The database only returns the groups they lead; community admins see all of them here too.
 */
export default async function ConnectGroupMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await resolveCommunity(supabase, slug);
  if (!community) notFound();

  const [{ data: prof }, { data: ca }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("community_admins").select("id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle(),
  ]);
  const isAdmin = ["founder", "superadmin", "admin"].includes(String(prof?.role ?? "").toLowerCase()) || !!ca;

  return <ConnectGroupsClient communityId={community.id} communityName={community.name ?? "Komunitas"} isAdmin={isAdmin} />;
}
