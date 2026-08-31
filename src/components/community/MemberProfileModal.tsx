"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Calendar,
  Check,
  Clock,
  Instagram,
  Loader2,
  MapPin,
  MessageCircle,
  Tent,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ types --- */

export type MemberSeed = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  angkatan?: string | null;
  kota?: string | null;
  interests?: string[] | null;
  skills?: string[] | null;
  badges?: string[] | null;
};

type FullProfile = MemberSeed & {
  nama_panggilan?: string | null;
  bio?: string | null;
  birthdate?: string | null;
  instagram?: string | null;
  favorite_verse?: string | null;
  created_at?: string | null;
  community?: { name: string | null } | null;
};

type Friendship = "loading" | "self" | "none" | "pending_out" | "pending_in" | "accepted";

/* ---------------------------------------------------------------- helpers --- */

function Avatar({
  url,
  name,
  size,
}: {
  url?: string | null;
  name?: string | null;
  size: number;
}) {
  if (url)
    return (
      <Image
        src={url}
        alt={name || ""}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  return (
    <div
      className="flex items-center justify-center rounded-full bg-brand-bg font-bold text-brand-gold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {(name || "?")[0]?.toUpperCase()}
    </div>
  );
}

function Chips({ label, items }: { label: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-full border border-[#333] bg-[#111] px-2.5 py-1 text-xs text-brand-light"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component --- */

export default function MemberProfileModal({
  member,
  viewerId,
  lang = "id",
  onClose,
}: {
  member: MemberSeed;
  viewerId: string;
  lang?: "id" | "en";
  onClose: () => void;
}) {
  const isEn = lang === "en";
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<FullProfile>(member);
  const [loading, setLoading] = useState(true);
  const [friendship, setFriendship] = useState<Friendship>(
    member.id === viewerId ? "self" : "loading"
  );
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* lock body scroll + Esc to close */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* load full profile + friendship status */
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: p }, { data: f }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, nama_panggilan, avatar_url, bio, angkatan, kota, birthdate, instagram, favorite_verse, created_at, interests, skills, community:communities(name)"
          )
          .eq("id", member.id)
          .maybeSingle(),
        member.id === viewerId
          ? Promise.resolve({ data: null })
          : supabase
              .from("friendships")
              .select("id, requester_id, receiver_id, status")
              .or(
                `and(requester_id.eq.${viewerId},receiver_id.eq.${member.id}),and(requester_id.eq.${member.id},receiver_id.eq.${viewerId})`
              )
              .maybeSingle(),
      ]);
      if (!alive) return;
      if (p) setData((d) => ({ ...d, ...(p as FullProfile) }));
      setLoading(false);
      if (member.id === viewerId) {
        setFriendship("self");
      } else if (!f) {
        setFriendship("none");
      } else {
        setFriendshipId(f.id);
        if (f.status === "accepted") setFriendship("accepted");
        else if (f.requester_id === viewerId) setFriendship("pending_out");
        else setFriendship("pending_in");
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase, member.id, viewerId]);

  const connect = async () => {
    setBusy(true);
    const { data: row } = await supabase
      .from("friendships")
      .insert({ requester_id: viewerId, receiver_id: member.id })
      .select("id")
      .single();
    setBusy(false);
    if (row) {
      setFriendshipId(row.id);
      setFriendship("pending_out");
    }
  };

  const accept = async () => {
    if (!friendshipId) return;
    setBusy(true);
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    setBusy(false);
    setFriendship("accepted");
  };

  const name = data.nama_panggilan || data.full_name || (isEn ? "Member" : "Anggota");
  const sub = [data.angkatan ? `Angkatan ${data.angkatan}` : null, data.kota]
    .filter(Boolean)
    .join(" • ");
  const joined = data.created_at
    ? new Date(data.created_at).getFullYear()
    : null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#2a2d35] bg-[#1a1d24] pb-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative h-28 bg-gradient-to-b from-[#111] to-[#222]">
          <div className="absolute -bottom-16 left-1/2 h-32 w-[150%] -translate-x-1/2 rounded-[100%] border-t-2 border-brand-gold/30 bg-[#1a1d24]" />
          <button
            onClick={onClose}
            aria-label={isEn ? "Close" : "Tutup"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* avatar + identity */}
        <div className="relative -mt-14 flex flex-col items-center px-6">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#1a1d24] bg-brand-bg shadow-xl">
            <Avatar url={data.avatar_url} name={data.full_name} size={112} />
          </div>
          <h1 className="mt-3 text-center text-xl font-bold text-white">{name}</h1>
          {sub && <p className="mt-0.5 text-center text-xs text-brand-muted">{sub}</p>}
          <p className="mt-1 flex items-center gap-1.5 text-center text-sm font-semibold text-brand-gold">
            <Tent className="h-4 w-4" />
            {data.community?.name || "Ruang Iman"}
          </p>

          {data.favorite_verse && (
            <div className="mt-3 max-w-sm rounded-lg border border-brand-gold/20 bg-brand-surface px-4 py-2 text-center">
              <p className="text-xs italic text-brand-light">
                &ldquo;{data.favorite_verse}&rdquo;
              </p>
            </div>
          )}

          {/* actions */}
          {friendship !== "self" && (
            <div className="mt-5 flex w-full items-center gap-2">
              <Link
                href={`/community/messages?u=${member.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark transition-colors hover:bg-yellow-400"
              >
                <MessageCircle className="h-4 w-4" />
                {isEn ? "Message" : "Pesan"}
              </Link>

              {friendship === "accepted" && (
                <span className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 py-2.5 text-sm font-bold text-brand-gold">
                  <UserCheck className="h-4 w-4" />
                  {isEn ? "Friends" : "Berteman"}
                </span>
              )}
              {friendship === "pending_out" && (
                <span className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#333] bg-[#222] py-2.5 text-sm font-bold text-brand-muted">
                  <Clock className="h-4 w-4" />
                  {isEn ? "Requested" : "Terkirim"}
                </span>
              )}
              {friendship === "pending_in" && (
                <button
                  onClick={accept}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 py-2.5 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isEn ? "Accept" : "Terima"}
                </button>
              )}
              {friendship === "none" && (
                <button
                  onClick={connect}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 py-2.5 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {isEn ? "Connect" : "Berteman"}
                </button>
              )}
              {friendship === "loading" && (
                <span className="flex flex-1 items-center justify-center rounded-xl border border-[#333] bg-[#222] py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* stat pills */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-around rounded-2xl border border-[#333] bg-brand-surface/50 p-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-brand-gold">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-brand-muted">
                {isEn ? "Region" : "Regional"}
              </span>
              <span className="text-sm font-semibold text-white">
                {data.kota || "—"}
              </span>
            </div>
            <div className="h-10 w-px bg-[#333]" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-brand-gold">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-brand-muted">Angkatan</span>
              <span className="text-sm font-semibold text-white">
                {data.angkatan || "—"}
              </span>
            </div>
            <div className="h-10 w-px bg-[#333]" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-brand-gold">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-brand-muted">
                {isEn ? "Joined" : "Bergabung"}
              </span>
              <span className="text-sm font-semibold text-white">
                {joined || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="space-y-5 px-6 pt-6">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-brand-muted" />
            </div>
          )}

          {(data.badges?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.badges!.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-[11px] text-brand-gold"
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {isEn ? "Biography" : "Biografi"}
            </h3>
            <div className="rounded-xl border border-[#333] bg-[#111] p-4">
              <p className="text-sm leading-relaxed text-brand-light">
                {data.bio ||
                  (isEn
                    ? "This member hasn't added a bio yet."
                    : "Anggota ini belum menambahkan biografi.")}
              </p>
            </div>
          </div>

          <Chips label={isEn ? "Interests" : "Minat"} items={data.interests} />
          <Chips label={isEn ? "Skills" : "Keahlian"} items={data.skills} />

          {data.birthdate && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                {isEn ? "Birthday" : "Ulang Tahun"}
              </h3>
              <div className="rounded-xl border border-[#333] bg-[#111] p-4">
                <span className="text-sm font-medium text-white">
                  {new Date(data.birthdate).toLocaleDateString(
                    isEn ? "en-US" : "id-ID",
                    { day: "numeric", month: "long" }
                  )}
                </span>
              </div>
            </div>
          )}

          {data.instagram && (
            <a
              href={`https://instagram.com/${data.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#111] p-4 text-sm font-medium text-brand-light transition-colors hover:border-brand-gold/50 hover:text-brand-gold"
            >
              <Instagram className="h-4 w-4" />@{data.instagram.replace(/^@/, "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
