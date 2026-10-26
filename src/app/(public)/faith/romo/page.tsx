import { createClient } from "@/lib/supabase/server";
import RomoClient, { type RomoPost } from "./RomoClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Romo" };

/** Romo corner: prayers, homilies and videos from priests. */
export default async function RomoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("romo_posts" as any)
    .select("id, author_id, kind, title, body, video_url, created_at, author:profiles!author_id(full_name, nama_panggilan, avatar_url)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(60);

  const posts = ((data as any[]) ?? []) as RomoPost[];
  const ids = [...new Set(posts.map((p) => p.author_id))];
  const { data: clergy } = ids.length ? await supabase.from("clergy" as any).select("user_id, title").in("user_id", ids) : { data: [] };
  const titles = Object.fromEntries(((clergy as any[]) ?? []).map((c) => [c.user_id, c.title as string]));

  let canPost = false;
  if (user) {
    const [{ data: c }, { data: me }] = await Promise.all([
      supabase.from("clergy" as any).select("user_id").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);
    canPost = !!c || ["founder", "superadmin", "admin"].includes(String(me?.role ?? ""));
  }

  return <RomoClient posts={posts} titles={titles} canPost={canPost} userId={user?.id ?? null} missing={!!error} />;
}
