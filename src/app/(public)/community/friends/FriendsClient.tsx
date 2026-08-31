"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, Clock, Search, Users, UserCheck, MessageCircle } from "lucide-react";
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

function FriendCard({ user, userId, isPending, onAction, subtitle, lang = "id" }: { user: any; userId: string; isPending?: boolean; onAction: () => void, subtitle?: string, lang?: "id" | "en" }) {
  const [loading, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();
  const isEn = lang === "en";

  const sendRequest = () => {
    startTransition(async () => {
      await supabase.from("friendships").insert({ requester_id: userId, receiver_id: user.id });
      onAction();
      router.refresh();
    });
  };

  return (
    <div className="bg-[#111] border border-[#2a2d35] rounded-2xl p-4 flex flex-col gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3">
        <Avatar url={user.avatar_url} name={user.full_name} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate text-base">{user.full_name}</p>
          <p className="text-xs text-brand-muted truncate">
            {subtitle || [user.angkatan ? `Angkatan ${user.angkatan}` : null, user.kota].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>
      {user.badges && user.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {user.badges.slice(0, 2).map((b: string) => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30">{b}</span>
          ))}
        </div>
      )}
      <div className="mt-1 pt-3 border-t border-[#2a2d35]">
        {isPending ? (
          <button disabled className="w-full py-2 rounded-xl text-xs font-bold bg-[#2a2d35] text-brand-muted flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" /> {isEn ? "Request Sent" : "Terkirim"}
          </button>
        ) : (
          <button onClick={sendRequest} disabled={loading} className="w-full py-2 rounded-xl text-xs font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
            <UserPlus className="h-4 w-4" /> {loading ? (isEn ? "Sending..." : "Mengirim...") : (isEn ? "Connect" : "Berteman")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FriendsClient({ userId, friends, pendingIncoming, recommendations, mutuals = [], lang = "id" }: {
  userId: string;
  friends: any[];
  pendingIncoming: any[];
  recommendations: any[];
  mutuals?: any[];
  lang?: "id" | "en";
}) {
  const [activeTab, setActiveTab] = useState<"browsing" | "mutual" | "friends">("browsing");
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());
  const [localFriends, setLocalFriends] = useState(friends);
  const [localIncoming, setLocalIncoming] = useState(pendingIncoming);
  const supabase = createClient();
  const router = useRouter();
  const isEn = lang === "en";

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

  const tabs = [
    { id: "browsing", label: isEn ? "Browsing" : "Jelajah" },
    { id: "mutual", label: isEn ? "Mutual" : "Mutual" },
    { id: "friends", label: isEn ? "Friends" : "Teman" }
  ] as const;

  return (
    <div className="pb-32 min-h-screen bg-[#0a0d1a]">
      {/* Sleek Tab Navigation */}
      <div className="sticky top-0 z-10 bg-[#0a0d1a]/90 backdrop-blur-md border-b border-[#2a2d35] px-4 pt-4 pb-0 mb-6">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-brand-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-8">
        
        {/* BROWSING TAB */}
        {activeTab === "browsing" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-gold" /> {isEn ? "Recommended for You" : "Rekomendasi untuk Anda"}
            </h2>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((user) => (
                  <FriendCard 
                    key={user.id} 
                    user={user} 
                    userId={userId} 
                    isPending={localPending.has(user.id)}
                    onAction={() => setLocalPending(prev => new Set(prev).add(user.id))}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <p className="text-brand-muted text-center py-10 bg-[#111] rounded-2xl border border-[#222]">
                {isEn ? "No recommendations right now." : "Belum ada rekomendasi saat ini."}
              </p>
            )}
          </div>
        )}

        {/* MUTUAL TAB */}
        {activeTab === "mutual" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-gold" /> {isEn ? "Mutual Connections" : "Koneksi Mutual"}
            </h2>
            {mutuals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mutuals.map((user) => (
                  <FriendCard 
                    key={user.id} 
                    user={user} 
                    userId={userId} 
                    isPending={localPending.has(user.id)}
                    onAction={() => setLocalPending(prev => new Set(prev).add(user.id))}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <p className="text-brand-muted text-center py-10 bg-[#111] rounded-2xl border border-[#222]">
                {isEn ? "You don't have any mutual friends yet. Connect with more people first!" : "Anda belum memiliki teman mutual. Berteman dengan lebih banyak orang dulu!"}
              </p>
            )}
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === "friends" && (
          <div className="animate-in fade-in duration-300 space-y-8">
            
            {/* Friend Requests (Incoming) */}
            {localIncoming.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-3">{isEn ? "Friend Requests" : "Permintaan Pertemanan"} ({localIncoming.length})</h2>
                <div className="space-y-3">
                  {localIncoming.map((req: any) => (
                    <div key={req.friendshipId} className="bg-[#111] border border-brand-gold/30 rounded-2xl p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <Avatar url={req.avatar_url} name={req.full_name} size={48} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{req.full_name}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleAccept(req.friendshipId, req)} className="flex-1 py-1.5 bg-brand-gold text-brand-dark text-xs font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                            {isEn ? "Accept" : "Terima"}
                          </button>
                          <button onClick={() => handleDecline(req.friendshipId)} className="flex-1 py-1.5 bg-[#222] text-brand-muted text-xs font-bold rounded-lg hover:bg-[#333] hover:text-white transition-colors">
                            {isEn ? "Decline" : "Tolak"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Friends */}
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-brand-gold" /> {isEn ? "My Connections" : "Koneksi Saya"}
              </h2>
              {localFriends.length === 0 ? (
                <p className="text-brand-muted text-center py-10 bg-[#111] rounded-2xl border border-[#222]">
                  {isEn ? "You haven't added any friends yet." : "Anda belum menambahkan teman satupun."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {localFriends.map((f: any) => (
                    <div key={f.id} className="bg-[#111] border border-[#222] rounded-xl p-3 flex items-center gap-3">
                      <Avatar url={f.avatar_url} name={f.full_name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-sm">{f.full_name}</p>
                        <p className="text-[10px] text-brand-muted truncate">
                          {[f.angkatan ? `Angkatan ${f.angkatan}` : null, f.kota].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      <Link
                        href={`/community/messages?u=${f.id}`}
                        aria-label={isEn ? "Message" : "Pesan"}
                        className="flex-shrink-0 rounded-full p-2 text-brand-muted hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
