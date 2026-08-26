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

  if (!profile) {
    redirect("/login");
  }

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

  return (
    <HomeTabsClient 
      profile={profile} 
      posts={posts} 
      userId={user.id} 
    />
  );
}
