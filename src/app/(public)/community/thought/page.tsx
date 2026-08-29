import { createClient } from "@/lib/supabase/server";
import ThoughtClient from "./ThoughtClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thought" };

export default async function ThoughtPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myProfile } = user
    ? await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", user.id).single()
    : { data: null };

  // Fetch all posts (public), newest first, with author details + like/comment counts
  const { data: posts } = await supabase
    .from("community_posts")
    .select(`
      id, content, image_url, likes_count, comments_count, created_at,
      author:profiles!community_posts_author_id_fkey(id, full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  // Which posts has the current user liked?
  let likedPostIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from("community_post_likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedPostIds = (likes || []).map((l: any) => l.post_id);
  }

  return (
    <ThoughtClient
      posts={posts || []}
      myProfile={myProfile}
      userId={user?.id}
      likedPostIds={likedPostIds}
    />
  );
}
