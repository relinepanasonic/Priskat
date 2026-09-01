"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Loader2,
  MessageCircle,
  Search,
  Tent,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MemberProfileModal, {
  type MemberSeed,
} from "@/components/community/MemberProfileModal";

type CardUser = MemberSeed & {
  nama_panggilan?: string | null;
  favorite_verse?: string | null;
  community?: { name: string | null } | null;
  friendshipId?: string;
};

const nickOf = (u: CardUser) => u.nama_panggilan || u.full_name || "—";

/* ------------------------------------------------------------------- card --- */

function FriendCard({
  user,
  userId,
  variant,
  isPending,
  onAction,
  onOpen,
  onAccept,
  onDecline,
  lang = "id",
}: {
  user: CardUser;
  userId: string;
  variant: "connect" | "message" | "request";
  isPending?: boolean;
  onAction?: () => void;
  onOpen: () => void;
  onAccept?: (friendshipId: string, requester: CardUser) => void;
  onDecline?: (friendshipId: string) => void;
  lang?: "id" | "en";
}) {
  const [loading, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();
  const isEn = lang === "en";

  const nick = nickOf(user);
  const community = user.community?.name || "Ruang Iman";
  const tagline = user.favorite_verse;

  const sendRequest = () =>
    startTransition(async () => {
      await supabase
        .from("friendships")
        .insert({ requester_id: userId, receiver_id: user.id });
      onAction?.();
      router.refresh();
    });

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-brand-border bg-brand-bg shadow-[0_0_15px_rgba(0,0,0,0.4)]">
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 block text-left"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={nick}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#1a1d24] to-[#0d0f14] text-5xl font-bold text-brand-gold/40">
            {nick[0]?.toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div
          className={`absolute inset-x-0 bottom-0 px-3 pt-3 ${
            variant === "request" ? "pb-11" : "pb-3"
          }`}
        >
          <p className="truncate text-[15px] font-bold leading-tight text-white drop-shadow">
            {nick}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-light/90 drop-shadow">
            <Tent className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{community}</span>
          </p>
          {tagline && (
            <p className="mt-1 line-clamp-2 text-[10px] italic leading-snug text-brand-gold/90 drop-shadow">
              &ldquo;{tagline}&rdquo;
            </p>
          )}
        </div>
      </button>

      {variant === "connect" && (
        <button
          onClick={sendRequest}
          disabled={loading || isPending}
          aria-label={
            isPending
              ? isEn
                ? "Requested"
                : "Terkirim"
              : isEn
              ? "Connect"
              : "Berteman"
          }
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-brand-dark shadow-lg transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPending ? (
            <Clock className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </button>
      )}

      {variant === "message" && (
        <Link
          href={`/community/messages?u=${user.id}`}
          aria-label={isEn ? "Message" : "Pesan"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          <MessageCircle className="h-4 w-4" />
        </Link>
      )}

      {variant === "request" && user.friendshipId && (
        <div className="absolute inset-x-0 bottom-0 flex text-xs font-bold">
          <button
            onClick={() => onAccept?.(user.friendshipId!, user)}
            className="flex-1 bg-brand-gold py-2 text-brand-dark transition-colors hover:bg-yellow-500"
          >
            {isEn ? "Accept" : "Terima"}
          </button>
          <button
            onClick={() => onDecline?.(user.friendshipId!)}
            className="flex-1 bg-black/70 py-2 text-white transition-colors hover:bg-black/85"
          >
            {isEn ? "Decline" : "Tolak"}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- component --- */

export default function FriendsClient({
  userId,
  friends,
  pendingIncoming,
  recommendations,
  mutuals = [],
  lang = "id",
}: {
  userId: string;
  friends: CardUser[];
  pendingIncoming: CardUser[];
  recommendations: CardUser[];
  mutuals?: CardUser[];
  lang?: "id" | "en";
}) {
  const [activeTab, setActiveTab] = useState<"browsing" | "mutual" | "friends">(
    "browsing"
  );
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());
  const [localFriends, setLocalFriends] = useState(friends);
  const [localIncoming, setLocalIncoming] = useState(pendingIncoming);
  const [viewMember, setViewMember] = useState<MemberSeed | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const isEn = lang === "en";

  const handleAccept = async (friendshipId: string, requester: CardUser) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    setLocalIncoming((prev) =>
      prev.filter((p) => p.friendshipId !== friendshipId)
    );
    setLocalFriends((prev) => [...prev, requester]);
    router.refresh();
  };

  const handleDecline = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setLocalIncoming((prev) =>
      prev.filter((p) => p.friendshipId !== friendshipId)
    );
    router.refresh();
  };

  const tabs = [
    { id: "browsing", label: isEn ? "Browsing" : "Jelajah" },
    { id: "mutual", label: isEn ? "Mutual" : "Mutual" },
    { id: "friends", label: isEn ? "Friends" : "Teman" },
  ] as const;

  const grid =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3";

  return (
    <div className="min-h-screen bg-brand-dark pb-32">
      {/* Tabs */}
      <div className="sticky top-0 z-10 mb-6 border-b border-brand-border bg-brand-dark/90 px-4 pb-0 pt-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 border-b-2 pb-3 text-sm font-semibold capitalize transition-all ${
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

      <div className="mx-auto max-w-5xl space-y-8 px-3 sm:px-4">
        {/* BROWSING */}
        {activeTab === "browsing" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Search className="h-5 w-5 text-brand-gold" />
              {isEn ? "Recommended for You" : "Rekomendasi untuk Anda"}
            </h2>
            {recommendations.length > 0 ? (
              <div className={grid}>
                {recommendations.map((u) => (
                  <FriendCard
                    key={u.id}
                    user={u}
                    userId={userId}
                    variant="connect"
                    isPending={localPending.has(u.id)}
                    onAction={() =>
                      setLocalPending((prev) => new Set(prev).add(u.id))
                    }
                    onOpen={() => setViewMember(u)}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-brand-border bg-brand-bg py-10 text-center text-brand-muted">
                {isEn
                  ? "No recommendations right now."
                  : "Belum ada rekomendasi saat ini."}
              </p>
            )}
          </div>
        )}

        {/* MUTUAL */}
        {activeTab === "mutual" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Users className="h-5 w-5 text-brand-gold" />
              {isEn ? "Mutual Connections" : "Koneksi Mutual"}
            </h2>
            {mutuals.length > 0 ? (
              <div className={grid}>
                {mutuals.map((u) => (
                  <FriendCard
                    key={u.id}
                    user={u}
                    userId={userId}
                    variant="connect"
                    isPending={localPending.has(u.id)}
                    onAction={() =>
                      setLocalPending((prev) => new Set(prev).add(u.id))
                    }
                    onOpen={() => setViewMember(u)}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-brand-border bg-brand-bg py-10 text-center text-brand-muted">
                {isEn
                  ? "You don't have any mutual friends yet. Connect with more people first!"
                  : "Anda belum memiliki teman mutual. Berteman dengan lebih banyak orang dulu!"}
              </p>
            )}
          </div>
        )}

        {/* FRIENDS */}
        {activeTab === "friends" && (
          <div className="animate-in space-y-8 fade-in duration-300">
            {localIncoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-gold">
                  {isEn ? "Friend Requests" : "Permintaan Pertemanan"} (
                  {localIncoming.length})
                </h2>
                <div className={grid}>
                  {localIncoming.map((req) => (
                    <FriendCard
                      key={req.friendshipId}
                      user={req}
                      userId={userId}
                      variant="request"
                      onOpen={() => setViewMember(req)}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      lang={lang}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                <UserCheck className="h-5 w-5 text-brand-gold" />
                {isEn ? "My Connections" : "Koneksi Saya"}
              </h2>
              {localFriends.length === 0 ? (
                <p className="rounded-2xl border border-brand-border bg-brand-bg py-10 text-center text-brand-muted">
                  {isEn
                    ? "You haven't added any friends yet."
                    : "Anda belum menambahkan teman satupun."}
                </p>
              ) : (
                <div className={grid}>
                  {localFriends.map((f) => (
                    <FriendCard
                      key={f.id}
                      user={f}
                      userId={userId}
                      variant="message"
                      onOpen={() => setViewMember(f)}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {viewMember && (
        <MemberProfileModal
          member={viewMember}
          viewerId={userId}
          lang={lang}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
}
