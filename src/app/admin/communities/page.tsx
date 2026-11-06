import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Tent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CommunityCenterClient from "@/components/admin/CommunityCenterClient";
import { sortCommunities } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function CommunityCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const globalAdmin = ["founder", "superadmin", "admin", "moderator"].includes(String(me?.role ?? "").toLowerCase());

  // A community admin sees only the community they run: straight into it, or a short list of theirs
  if (!globalAdmin) {
    const { data: mine } = await supabase
      .from("community_admins")
      .select("community:communities!community_id(id, name, slug)")
      .eq("user_id", user.id);
    const list = ((mine as unknown as { community: { id: string; name: string; slug: string | null } | null }[]) ?? [])
      .map((r) => r.community)
      .filter((c): c is { id: string; name: string; slug: string | null } => !!c);
    if (list.length === 1) redirect(`/admin/communities/${list[0].slug || list[0].id}/dashboard`);
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Community Center</h1>
          <p className="mt-1 text-brand-muted">Pilih komunitas yang kamu kelola.</p>
        </div>
        {list.length === 0 && <p className="text-sm text-brand-muted">Kamu belum menjadi admin komunitas mana pun.</p>}
        <div className="space-y-2">
          {list.map((c) => (
            <Link key={c.id} href={`/admin/communities/${c.slug || c.id}/dashboard`} className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 transition-colors hover:border-brand-gold/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><Tent className="h-5 w-5" /></span>
              <span className="flex-1 font-semibold text-white">{c.name}</span>
              <ChevronRight className="h-5 w-5 text-brand-muted" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

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
