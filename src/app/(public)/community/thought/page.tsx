import { createClient } from "@/lib/supabase/server";
import ThoughtClient from "./ThoughtClient";
import { getLanguage } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thought" };

export default async function ThoughtPage() {
  const supabase = await createClient();
  const [{ data: { user } }, lang] = await Promise.all([supabase.auth.getUser(), getLanguage()]);

  // Independent queries — run them together instead of one after another
  const empty = Promise.resolve({ data: null as any });
  const [{ data: myProfile }, { data: posts }, { data: likes }, { data: blocks }] = await Promise.all([
    user ? supabase.from("profiles").select("id, full_name, avatar_url").eq("id", user.id).single() : empty,
    // All posts (public), newest first, with author details + like/comment counts
    supabase
      .from("community_posts")
      .select(`
        id, content, image_url, likes_count, comments_count, created_at,
        author:profiles!community_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    // Which posts has the current user liked?
    user ? supabase.from("community_post_likes").select("post_id").eq("user_id", user.id) : empty,
    // Users this person has blocked — hidden from their feed
    user ? supabase.from("user_blocks" as any).select("blocked_id").eq("blocker_id", user.id) : empty,
  ]);

  const likedPostIds: string[] = ((likes as any[]) || []).map((l: any) => l.post_id);
  const blockedIds: string[] = ((blocks as any[]) || []).map((b: any) => b.blocked_id);
  const visiblePosts = (posts || []).filter((p: any) => !blockedIds.includes(p.author?.id));

  return (
    <ThoughtClient
      blockedIds={blockedIds}
      posts={visiblePosts}
      myProfile={myProfile}
      userId={user?.id}
      likedPostIds={likedPostIds}
      lang={lang}
    />
  );
}
