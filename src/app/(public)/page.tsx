import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeTabsClient from "@/components/home/HomeTabsClient";
import HomeNotices from "@/components/home/HomeNotices";
import { getLanguage } from "@/lib/lang";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = await getLanguage();

  if (!user) {
    redirect("/login");
  }

  // All four queries are independent — run them together instead of one after another
  const [
    { data: profile },
    { data, error: postsError },
    { data: devotionData },
    { data: crewData, error: crewError },
  ] = await Promise.all([
    // Current user profile with complete details for the Profile tab
    supabase
      .from("profiles")
      .select("*, community:communities!community_id(name)")
      .eq("id", user.id)
      .single(),
    // Posts for the Thought tab
    supabase
      .from("community_posts")
      .select(`
        id,
        content,
        created_at,
        author_id,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('author_id', user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    // Active devotional
    supabase
      .from("user_devotion_progress")
      .select("*, plan:devotion_plans(id, title, title_id, duration_days)")
      .eq("user_id", user.id)
      .eq("is_finished", false)
      .order('started_at', { ascending: false })
      .limit(1),
    // The user's crew/service assignments across ALL communities for the
    // "My Service" tab — home shows everything merged, the community
    // page (/camp/[slug]/ongoing) keeps it scoped to just that community.
    supabase
      .from("camp_crew")
      .select("cohort_id, position, camp_cohorts(*, community:communities(id, name, slug))")
      .eq("user_id", user.id),
  ]);

  if (!profile) { redirect("/login"); } if (!profile.gender) { redirect("/profile/edit"); }
  // New accounts: after the first profile save, offer the friends + community steps
  // (=== null: stays off until the 086 SQL has added the column)
  if ((profile as any).onboarded_at === null) { redirect("/welcome"); }

  let posts: any[] = [];
  if (postsError) console.error(postsError);
  {
    if (data) {
      posts = data.map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        author_id: p.author_id,
        author: p.profiles
      }));
    }
  }

  const activeDevotion = devotionData && devotionData.length > 0 ? devotionData[0] : null;

  let myCamps: any[] = [];
  if (crewError) console.error(crewError);
  {
    if (crewData) {
      const uniqueCohorts = new Map<string, any>();
      for (const item of crewData as any[]) {
        if (!item.camp_cohorts) continue;
        if (!uniqueCohorts.has(item.cohort_id)) {
          const community = item.camp_cohorts.community;
          uniqueCohorts.set(item.cohort_id, {
            ...item.camp_cohorts,
            myRole: item.position,
            communityName: community?.name || null,
            communitySlug: community?.slug || community?.id || null,
          });
        }
      }
      myCamps = Array.from(uniqueCohorts.values());
    }
  }

  // Join requests still waiting for a community admin
  const { data: pendingRows } = await supabase
    .from("community_join_requests")
    .select("community:communities(name)")
    .eq("user_id", user.id)
    .eq("status", "pending");
  const pendingCommunities = ((pendingRows as any[]) ?? []).map((r) => r.community?.name).filter(Boolean) as string[];

  // In several communities but no main one chosen yet (needs the 088 SQL; stays quiet until then)
  let needsMain = false;
  if ((profile as any).main_community_chosen === false) {
    const { count } = await supabase.from("community_memberships" as any).select("community_id", { count: "exact", head: true }).eq("user_id", user.id);
    needsMain = (count ?? 0) > 1;
  }

  return (
    <div className="md:p-6 md:h-full md:overflow-y-auto">
      <HomeNotices noPhoto={!profile.avatar_url} needsMain={needsMain} />
      <HomeTabsClient
        profile={profile}
        posts={posts}
        userId={user.id}
        activeDevotion={activeDevotion}
        myCamps={myCamps}
        lang={lang}
        pendingCommunities={pendingCommunities}
      />
    </div>
  );
}
