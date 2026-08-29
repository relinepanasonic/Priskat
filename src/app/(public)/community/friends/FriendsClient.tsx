"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UserPlus, UserCheck, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function Avatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
  return url ? (
    <Image src={url} alt={name || "User"} width={size} height={size} className={`rounded-full object-cover`} style={{ width: size, height: size }} />
  ) : (
    <div className={`rounded-full bg-brand-bg border border-[#333] flex items-center justify-center text-brand-gold font-bold`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function FriendCard({ user, userId, isPending, onAction }: { user: any; userId: string; isPending?: boolean; onAction: () => void }) {
  const [loading, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();

  const sendRequest = () => {
    startTransition(async () => {
      await supabase.from("friendships").insert({ requester_id: userId, receiver_id: user.id });
      onAction();
      router.refresh();
    });
  };

  return (
    <div className="bg-[#1a1d24] border border-[#2a2d35] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar url={user.avatar_url} name={user.full_name} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{user.full_name}</p>
          {user.angkatan && <p className="text-xs text-brand-muted">Angkatan {user.angkatan}</p>}
          {user.kota && <p className="text-xs text-brand-muted">{user.kota}</p>}
        </div>
      </div>
      {user.badges && user.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.badges.slice(0, 3).map((b: string) => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30">{b}</span>
          ))}
        </div>
      )}
      {isPending ? (
        <button disabled className="w-full py-2 rounded-xl text-xs font-bold bg-[#2a2d35] text-brand-muted flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" /> Pending
        </button>
      ) : (
        <button onClick={sendRequest} disabled={loading} className="w-full py-2 rounded-xl text-xs font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          <UserPlus className="h-4 w-4" /> {loading ? "Sending..." : "Add Friend"}
        </button>
      )}
    </div>
  );
}

export default function FriendsClient({ userId, friends, pendingIncoming, recommendations }: {
  userId: string;
  friends: any[];
  pendingIncoming: any[];
  recommendations: any[];
}) {
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());
  const [localFriends, setLocalFriends] = useState(friends);
  const [localIncoming, setLocalIncoming] = useState(pendingIncoming);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAccept = async (friendshipId: string, requester: any) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    setLocalIncoming(prev => prev.filter(p => p.friendshipId !== friendshipId));
    setLocalFriends(prev => [...prev, requester]);
    router.refresh();
  };

  const handleDecline = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setLocalIncoming(prev => prev.filter(p => p.friendshipId !== friendshipId));
    router.refresh();
  };

  const visibleRecs = showAllRecs ? recommendations : recommendations.slice(0, 6);

  return (
    <div className="pb-32 px-4 pt-6 space-y-8 max-w-lg mx-auto">
      {/* Pending Incoming Requests */}
      {localIncoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-3">Friend Requests ({localIncoming.length})</h2>
          <div className="space-y-3">
            {localIncoming.map((req: any) => (
              <div key={req.friendshipId} className="bg-[#1a1d24] border border-[#2a2d35] rounded-2xl p-4 flex items-center gap-3">
                <Avatar url={req.avatar_url} name={req.full_name} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{req.full_name}</p>
                  {req.angkatan && <p className="text-xs text-brand-muted">Angkatan {req.angkatan}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req.friendshipId, req)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-gold text-brand-dark">Accept</button>
                  <button onClick={() => handleDecline(req.friendshipId)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2a2d35] text-brand-muted">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Friends */}
      {localFriends.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-gold" /> Friends ({localFriends.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {localFriends.map((f: any) => (
              <div key={f.id} className="bg-[#1a1d24] border border-[#2a2d35] rounded-2xl p-3 flex items-center gap-3">
                <Avatar url={f.avatar_url} name={f.full_name} size={40} />
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{f.full_name}</p>
                  <p className="text-[10px] text-brand-muted">Friend</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">People You May Know</h2>
          <div className="grid grid-cols-2 gap-3">
            {visibleRecs.map((u: any) => (
              <FriendCard
                key={u.id}
                user={u}
                userId={userId}
                isPending={u.isPending || localPending.has(u.id)}
                onAction={() => setLocalPending(prev => new Set([...prev, u.id]))}
              />
            ))}
          </div>
          {recommendations.length > 6 && (
            <button onClick={() => setShowAllRecs(!showAllRecs)} className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-brand-muted border border-[#2a2d35] hover:text-white transition-colors flex items-center justify-center gap-2">
              {showAllRecs ? <><ChevronUp className="h-4 w-4" /> Show Less</> : <><ChevronDown className="h-4 w-4" /> Show More ({recommendations.length - 6} more)</>}
            </button>
          )}
        </section>
      )}

      {friends.length === 0 && pendingIncoming.length === 0 && recommendations.length === 0 && (
        <div className="text-center text-brand-muted py-16">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No one found. Complete your profile to get recommendations!</p>
        </div>
      )}
    </div>
  );
}
