import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeTabsClient from "@/components/home/HomeTabsClient";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch current user profile with complete details for the Profile tab
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
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
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (data) {
      posts = data;
    }
  } catch (err) {
    console.error("Posts table might not exist yet.");
  }

  // Fetch Active Devotion Plan
  let activeDevotion: any = null;
  try {
    const { data } = await supabase
      .from("user_devotion_progress")
      .select("*, plans:devotion_plans(*)")
      .eq("user_id", user.id)
      .eq("is_finished", false)
      .order("last_completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    activeDevotion = data;
  } catch (err) {}

  return (
    <HomeTabsClient 
      profile={profile} 
      posts={posts} 
      userId={user.id} 
      activeDevotion={activeDevotion}
    />
  );
}


