import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getLanguage } from "@/lib/lang";
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-brand-dark">
      <Navbar profile={profile} lang={lang} />
      <main className="flex-1 overflow-x-hidden md:h-screen md:overflow-y-auto">
        <div className="p-6 lg:p-8 bg-[#1e2128] min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
