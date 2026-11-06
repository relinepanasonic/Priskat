import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CommunityCenterSidebar from "@/components/admin/CommunityCenterSidebar";
import { getLanguage } from "@/lib/lang";
import { sortCommunities } from "@/lib/community";
import { isCommunityCenterHost } from "@/lib/ccMode";
import CommunityAdminGuard from "@/components/admin/CommunityAdminGuard";
import type { Profile } from "@/lib/types/database.types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const isGlobalAdmin = profile && ["founder", "superadmin", "admin", "moderator"].includes(String(profile.role).toLowerCase());

  let isCommunityAdmin = false;
  if (!isGlobalAdmin && user) {
    const { data: commAdmin } = await supabase
      .from("community_admins")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (commAdmin) isCommunityAdmin = true;
  }

  if (!isGlobalAdmin && !isCommunityAdmin) {
    redirect("/");
  }

  // The Community Center has its own sidebar: on communitycenter.ruangiman.com, and for community admins everywhere
  const centerMode = (await isCommunityCenterHost()) || !isGlobalAdmin;
  if (centerMode) {
    type C = { id: string; name: string; slug: string | null };
    let communities: C[] = [];
    if (isGlobalAdmin) {
      const { data: all } = await supabase.from("communities").select("id, name, slug");
      communities = sortCommunities((all as C[]) ?? []);
    } else {
      const { data: mine } = await supabase.from("community_admins").select("community:communities!community_id(id, name, slug)").eq("user_id", user.id);
      communities = sortCommunities(((mine as unknown as { community: C | null }[]) ?? []).map((r) => r.community).filter((c): c is C => !!c));
    }
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-brand-dark">
        <CommunityCenterSidebar
          communities={communities}
          canManageAll={!!isGlobalAdmin}
          userName={profile?.nama_panggilan || profile?.full_name || "Admin"}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <CommunityAdminGuard />
        <main className="flex-1 overflow-x-hidden pb-[calc(6rem+env(safe-area-inset-bottom))] md:h-screen md:overflow-y-auto md:pb-0">
          <div className="p-4 md:p-6 lg:p-8 bg-[#1e2128] min-h-full">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-brand-dark">
      <Navbar profile={profile} lang={lang} isCommunityAdmin={isCommunityAdmin} />
      <main className="flex-1 overflow-x-hidden pb-[calc(6rem+env(safe-area-inset-bottom))] md:h-screen md:overflow-y-auto md:pb-0">
        <div className="p-6 lg:p-8 bg-[#1e2128] min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
