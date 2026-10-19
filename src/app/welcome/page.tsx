import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sortCommunities } from "@/lib/community";
import WelcomeClient from "./WelcomeClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Selamat datang" };

/** Steps after the first profile save: find friends, then join a community. Both can be skipped. */
export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("id, full_name, nama_panggilan, avatar_url, community_id, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!me) redirect("/login");
  if ((me as any).onboarded_at) redirect("/");

  const [{ data: communityRows }, { data: requests }, { data: friendRows }] = await Promise.all([
    supabase.from("communities").select("id, name, slug, logo_url, tagline, description, is_public, join_mode, join_fields").order("name"),
    supabase.from("community_join_requests").select("community_id, status").eq("user_id", user.id).eq("status", "pending"),
    supabase.from("friendships").select("requester_id, receiver_id").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const { data: mems } = await supabase.from("community_memberships" as any).select("community_id").eq("user_id", user.id);
  const memberIds = ((mems as { community_id: string }[]) ?? []).map((m) => m.community_id);
  if (me.community_id && !memberIds.includes(me.community_id)) memberIds.push(me.community_id);

  const exclude = new Set<string>([user.id]);
  for (const f of (friendRows as { requester_id: string; receiver_id: string }[]) ?? []) {
    exclude.add(f.requester_id);
    exclude.add(f.receiver_id);
  }

  // People most likely to be known: recent members, those with a photo first
  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name, nama_panggilan, avatar_url, kota, angkatan, community:communities(name)")
    .not("full_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(60);
  const suggestions = ((people as any[]) ?? [])
    .filter((p) => !exclude.has(p.id) && p.full_name)
    .sort((a, b) => Number(!!b.avatar_url) - Number(!!a.avatar_url))
    .slice(0, 12);

  return (
    <WelcomeClient
      me={{ id: me.id, name: (me as any).nama_panggilan || me.full_name || "" }}
      suggestions={suggestions}
      communities={sortCommunities(communityRows as any[])}
      memberIds={memberIds}
      pendingIds={((requests as { community_id: string }[]) ?? []).map((r) => r.community_id)}
    />
  );
}
