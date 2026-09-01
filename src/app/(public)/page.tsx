import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeTabsClient from "@/components/home/HomeTabsClient";
import { getLanguage } from "@/lib/lang";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = await getLanguage();

  if (!user) {
    redirect("/login");
  }

  // Fetch current user profile with complete details for the Profile tab
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, community:communities(name)")
    .eq("id", user.id)
    .single();

  if (!profile) { redirect("/login"); } if (!profile.gender) { redirect("/profile/edit"); }

  // Try fetching posts for the Though tab
  let posts: any[] = [];
  try {
    const { data } = await supabase
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
      .limit(50);
    
    if (data) {
      posts = data.map((p: any) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        author_id: p.author_id,
        author: p.profiles
      }));
    }
  } catch (err) {
    console.error(err);
  }

  // Check for active devotional
  let activeDevotion = null;
  const { data: devotionData } = await supabase
    .from("user_devotion_progress")
    .select("*, plan:devotion_plans(id, title_id, title_en, total_days)")
    .eq("user_id", user.id)
    .eq("is_finished", false)
    .single();
  
  if (devotionData) {
    activeDevotion = devotionData;
  }

  // Fetch the user's crew/service assignments across ALL communities for
  // the "My Service" tab — home shows everything merged, the community
  // page (/camp/[slug]/ongoing) keeps it scoped to just that community.
  let myCamps: any[] = [];
  try {
    const { data: crewData } = await supabase
      .from("camp_crew")
      .select("cohort_id, position, camp_cohorts(*, community:communities(id, name, slug))")
      .eq("user_id", user.id);

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
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="md:p-6 md:h-full md:overflow-y-auto">
      <HomeTabsClient
        profile={profile}
        posts={posts}
        userId={user.id}
        activeDevotion={activeDevotion}
        myCamps={myCamps}
        lang={lang}
      />
    </div>
  );
}
