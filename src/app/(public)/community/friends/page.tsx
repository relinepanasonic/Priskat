import { createClient } from "@/lib/supabase/server";
import FriendsClient from "./FriendsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Friends" };

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-brand-muted text-sm">
        <p>Please <a href="/login" className="text-brand-gold underline">sign in</a> to see friends.</p>
      </div>
    );
  }

  // Get my profile for matching
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, angkatan, kota, interests, skills, services_history, camp_history")
    .eq("id", user.id)
    .single();

  // Get my friendships
  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, requester_id, receiver_id, status, profiles!friendships_receiver_id_fkey(id, full_name, avatar_url, angkatan, kota, interests, skills, services_history, camp_history)")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  // Get pending requests TO me (I need to accept/decline)
  const { data: pendingIncoming } = await supabase
    .from("friendships")
    .select("id, requester_id, profiles!friendships_requester_id_fkey(id, full_name, avatar_url, angkatan, kota)")
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  // Get pending requests I sent (waiting for response)
  const { data: pendingOutgoing } = await supabase
    .from("friendships")
    .select("id, receiver_id")
    .eq("requester_id", user.id)
    .eq("status", "pending");

  // Get recommendations: all users not yet friends, scored by common attributes
  const friendIds = new Set<string>([user.id]);
  (friendships || []).forEach((f: any) => {
    friendIds.add(f.requester_id);
    friendIds.add(f.receiver_id);
  });
  const pendingOutIds = new Set((pendingOutgoing || []).map((p: any) => p.receiver_id));

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, angkatan, kota, interests, skills, services_history, camp_history")
    .not("id", "in", `(${Array.from(friendIds).join(",")})`)
    .limit(100);

  // Score each user
  const scored = (allUsers || []).map((u: any) => {
    let score = 0;
    const badges: string[] = [];
    if (myProfile?.angkatan && u.angkatan === myProfile.angkatan) {
      score += 3;
      badges.push(`Angkatan ${u.angkatan}`);
    }
    if (myProfile?.kota && u.kota === myProfile.kota) {
      score += 2;
      badges.push(u.kota);
    }
    // shared services
    const myServices = (myProfile?.services_history as any[] || []).map((s: any) => `${s.camp}-${s.role}`);
    const theirServices = (u.services_history as any[] || []).map((s: any) => `${s.camp}-${s.role}`);
    const sharedServices = myServices.filter((s: string) => theirServices.includes(s));
    score += sharedServices.length * 2;
    if (sharedServices.length > 0) badges.push(`${sharedServices.length} shared service(s)`);

    // shared interests
    const myInterests = (myProfile?.interests as string[] || []);
    const theirInterests = (u.interests as string[] || []);
    const sharedInterests = myInterests.filter((i: string) => theirInterests.includes(i));
    score += sharedInterests.length;
    if (sharedInterests.length > 0) badges.push(`${sharedInterests.length} common interest(s)`);

    return { ...u, score, badges, isPending: pendingOutIds.has(u.id) };
  }).sort((a: any, b: any) => b.score - a.score).slice(0, 30);

  // Format accepted friends
  const acceptedFriends = (friendships || []).map((f: any) => {
    const friend = f.requester_id === user.id
      ? f.profiles  // receiver is the friend
      : f.profiles;
    return { ...friend, friendshipId: f.id };
  });

  return (
    <FriendsClient
      userId={user.id}
      friends={acceptedFriends}
      pendingIncoming={(pendingIncoming || []).map((p: any) => ({ ...p.profiles, friendshipId: p.id, requesterId: p.requester_id }))}
      recommendations={scored}
    />
  );
}
