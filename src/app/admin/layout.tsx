import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunityCenterSidebar from "@/components/admin/CommunityCenterSidebar";
import AdminErpSidebar from "@/components/admin/AdminErpSidebar";
import { getLanguage } from "@/lib/lang";
import { sortCommunities } from "@/lib/community";
import { isAdminErpHost, isCommunityCenterHost } from "@/lib/ccMode";
import CommunityAdminGuard from "@/components/admin/CommunityAdminGuard";
import type { Profile } from "@/lib/types/database.types";
import type { Metadata } from "next";
import InstallApp from "@/components/admin/InstallApp";

/** On communitycenter.ruangiman.com and admin.ruangiman.com, each portal gets its own app title & metadata. */
export async function generateMetadata(): Promise<Metadata> {
  if (await isAdminErpHost()) {
    return {
      title: { default: "Ruang Iman Admin ERP", template: "%s | Ruang Iman Admin" },
      applicationName: "Ruang Iman Admin ERP",
      icons: { icon: [{ url: "/logo.png", type: "image/png" }], apple: "/logo.png" },
    };
  }
  if (!(await isCommunityCenterHost())) return {};
  return {
    manifest: "/cc-manifest.json",
    applicationName: "Community Center",
    icons: { icon: [{ url: "/cc/favicon.png", sizes: "64x64", type: "image/png" }], apple: "/cc/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: "Community Center", statusBarStyle: "black-translucent" },
  };
}

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
  const onCcHost = await isCommunityCenterHost();
  const centerMode = onCcHost || !isGlobalAdmin;
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
      <div className="flex min-h-dvh flex-col bg-brand-dark md:h-dvh md:flex-row md:overflow-hidden">
        <CommunityCenterSidebar
          communities={communities}
          canManageAll={["founder", "superadmin"].includes(String(profile?.role ?? "").toLowerCase())}
          userName={profile?.nama_panggilan || profile?.full_name || "Admin"}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <CommunityAdminGuard />
        {onCcHost && <InstallApp />}
        <main className="flex-1 overflow-x-hidden pb-[calc(6rem+env(safe-area-inset-bottom))] md:h-dvh md:overflow-y-auto md:overscroll-contain md:pb-0">
          <div className="min-h-full bg-[#1e2128] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Global admins outside communitycenter.ruangiman.com get the dedicated Ruang Iman Admin ERP shell
  return (
    <div className="flex min-h-dvh flex-col bg-[#0c0e13] md:h-dvh md:flex-row md:overflow-hidden">
      <AdminErpSidebar
        userName={profile?.nama_panggilan || profile?.full_name || "Admin"}
        userEmail={user.email}
        avatarUrl={profile?.avatar_url ?? null}
        role={String(profile?.role || "admin")}
        lang={lang}
      />
      <main className="flex-1 overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:h-dvh md:overflow-y-auto md:overscroll-contain md:pb-0">
        <div className="min-h-full bg-[#0f1217] p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
