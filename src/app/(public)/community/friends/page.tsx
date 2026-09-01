import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FriendsClient from "./FriendsClient";
import { getLanguage } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Friends" };

// Full field set for scoring + card; card only needs the last four.
const PCOLS =
  "id, full_name, nama_panggilan, avatar_url, angkatan, kota, favorite_verse, interests, skills, services_history, camp_history, community:communities(name)";
const PCARD =
  "id, full_name, nama_panggilan, avatar_url, angkatan, kota, favorite_verse, community:communities(name)";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    .select(`id, requester_id, receiver_id, status, receiver:profiles!friendships_receiver_id_fkey(${PCOLS}), requester:profiles!friendships_requester_id_fkey(${PCOLS})`)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  // Get pending requests TO me (I need to accept/decline)
  const { data: pendingIncoming } = await supabase
    .from("friendships")
    .select(`id, requester_id, profiles!friendships_requester_id_fkey(${PCARD})`)
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
    .select(PCOLS)
    .not("id", "in", `(${Array.from(friendIds).join(",")})`)
    .limit(100);

  // Score each user for the 'Browsing' / 'Recommendations' tab
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
    const sharedInterests = myInterests.filter((s: string) => theirInterests.includes(s));
    score += sharedInterests.length;
    if (sharedInterests.length > 0) badges.push(`${sharedInterests.length} common interest(s)`);

    return { ...u, score, badges };
  });

  scored.sort((a: any, b: any) => b.score - a.score);

  // Filter out any recommendations that are already pending incoming or outgoing
  const incomingIds = new Set((pendingIncoming || []).map((p: any) => p.requester_id));
  const cleanRecommendations = scored.filter((u: any) => !incomingIds.has(u.id) && !pendingOutIds.has(u.id));

  // Get Mutual Friends
  const { data: mutualsData } = await supabase.rpc("get_mutual_friends", { p_user_id: user.id });
  let formattedMutuals: any[] = [];
  
  if (mutualsData && mutualsData.length > 0) {
    const mutualIds = mutualsData.map((m: any) => m.mutual_user_id);
    
    // Fetch profiles for these mutual friends
    const { data: mutualProfiles } = await supabase
      .from("profiles")
      .select(PCARD)
      .in("id", mutualIds);
      
    if (mutualProfiles) {
      // Filter out people who already sent us a request or we sent a request to
      const cleanMutualProfiles = mutualProfiles.filter((m: any) => !incomingIds.has(m.id) && !pendingOutIds.has(m.id));
      
      formattedMutuals = cleanMutualProfiles.map((m: any) => {
        const count = mutualsData.find((md: any) => md.mutual_user_id === m.id)?.mutual_count || 0;
        return {
          ...m,
          mutual_count: count,
          badges: [`${count} Mutual Friend${count > 1 ? 's' : ''}`]
        };
      }).sort((a: any, b: any) => b.mutual_count - a.mutual_count);
    }
  }

  // Format accepted friends
  const formattedFriends = (friendships || []).map((f: any) => {
    const friend = f.requester_id === user.id ? f.receiver : f.requester;
    return { ...friend, friendshipId: f.id };
  });

  // Format pending incoming
  const formattedPending = (pendingIncoming || []).map((p: any) => ({ 
    ...p.profiles, 
    friendshipId: p.id, 
    requesterId: p.requester_id 
  }));

  const lang = await getLanguage();

  return (
    <FriendsClient
      userId={user.id}
      friends={formattedFriends}
      pendingIncoming={formattedPending}
      recommendations={cleanRecommendations}
      mutuals={formattedMutuals}
      lang={lang}
    />
  );
}
