import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import DmNotifier from "@/components/community/DmNotifier";
import GroupNotifier from "@/components/community/GroupNotifier";
import PushRegistrar from "@/components/native/PushRegistrar";
import PlayerProvider from "@/components/audio/PlayerProvider";
import GlobalMiniPlayer from "@/components/audio/GlobalMiniPlayer";
import { getLanguage } from "@/lib/lang";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let isCommunityAdmin = false;
  
  if (user) {
    const [{ data }, { data: commAdmin }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*, community:communities!community_id(*)")
        .eq("id", user.id)
        .single(),
      supabase
        .from("community_admins")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
    ]);
    profile = data;
    if (commAdmin) isCommunityAdmin = true;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-brand-dark">
      <Navbar profile={profile} lang={lang} isCommunityAdmin={isCommunityAdmin} />
      {user && <DmNotifier />}
      {user && <GroupNotifier />}
      {user && <PushRegistrar userId={user.id} />}
      <PlayerProvider initialQueue={(profile?.favorite_songs as any[]) || []}>
        {/* Phones: leave room for the fixed bottom navigation bar (+ the raised Beranda button and the safe area) */}
        <main className="flex-1 overflow-x-clip pb-[calc(6rem+env(safe-area-inset-bottom))] md:h-screen md:overflow-y-auto md:pb-0">{children}</main>
        <GlobalMiniPlayer />
      </PlayerProvider>
    </div>
  );
}
