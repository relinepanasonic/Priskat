"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock,
  Heart,
  Instagram,
  Loader2,
  MessageSquare,
  Tent,
  UserPlus,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import VinylPlayer from "@/components/home/VinylPlayer";

/* ------------------------------------------------------------------ types --- */

export type MemberSeed = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  angkatan?: string | null;
  kota?: string | null;
};

type Camp = { camp?: string; angkatan?: string; kota?: string };
type Service = { position?: string; camp?: string; angkatan?: string };
type Song = { id: string; title: string; url: string; coverImage: string };

type Prof = MemberSeed & {
  nama_panggilan?: string | null;
  bio?: string | null;
  favorite_verse?: string | null;
  instagram?: string | null;
  created_at?: string | null;
  gallery_urls?: string[] | null;
  favorite_songs?: Song[] | null;
  camp_history?: Camp[] | null;
  services_history?: Service[] | null;
  community?: { name: string | null } | null;
};

type Friendship =
  | "loading"
  | "self"
  | "none"
  | "pending_out"
  | "pending_in"
  | "accepted";

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

  const [p, setP] = useState<Prof>(member);
  const [loading, setLoading] = useState(true);

  const [friendship, setFriendship] = useState<Friendship>(
    member.id === viewerId ? "self" : "loading"
  );
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const gallery = useMemo(() => {
    const base = p.avatar_url ? [p.avatar_url] : [];
    return [...base, ...((p.gallery_urls || []).filter(Boolean) as string[])];
  }, [p.avatar_url, p.gallery_urls]);
  const [activeImage, setActiveImage] = useState<string | null>(
    member.avatar_url
  );

  /* body scroll lock + Esc */
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

  /* load full profile + recent thoughts + friendship */
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: prof }, { data: fr }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, nama_panggilan, avatar_url, bio, angkatan, kota, instagram, favorite_verse, favorite_songs, gallery_urls, camp_history, services_history, created_at, community:communities(name)"
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

      if (prof) {
        const full = prof as Prof;
        setP((d) => ({ ...d, ...full }));
        if (!activeImage && full.avatar_url) setActiveImage(full.avatar_url);
      }
      setLoading(false);

      if (member.id === viewerId) setFriendship("self");
      else if (!fr) setFriendship("none");
      else {
        setFriendshipId(fr.id);
        if (fr.status === "accepted") setFriendship("accepted");
        else if (fr.requester_id === viewerId) setFriendship("pending_out");
        else setFriendship("pending_in");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const name = p.nama_panggilan || p.full_name || (isEn ? "Member" : "Anggota");
  const journey = (p.camp_history || []) as Camp[];
  const services = (p.services_history || []) as Service[];
  const img = activeImage || p.avatar_url || null;

  const friendBtn = () => {
    if (friendship === "self" || friendship === "loading") return null;
    const base =
      "h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg shadow-black/50 transition-colors disabled:opacity-60";
    if (friendship === "accepted")
      return (
        <span
          className={`${base} bg-brand-gold/20 border-brand-gold/40 text-brand-gold`}
          aria-label={isEn ? "Friends" : "Berteman"}
        >
          <Check className="h-5 w-5" />
        </span>
      );
    if (friendship === "pending_out")
      return (
        <span
          className={`${base} bg-[#1a1d24]/80 border-[#333] text-brand-muted`}
          aria-label={isEn ? "Requested" : "Terkirim"}
        >
          <Clock className="h-5 w-5" />
        </span>
      );
    return (
      <button
        onClick={friendship === "pending_in" ? accept : connect}
        disabled={busy}
        aria-label={
          friendship === "pending_in"
            ? isEn
              ? "Accept request"
              : "Terima"
            : isEn
            ? "Connect"
            : "Berteman"
        }
        className={`${base} bg-[#1a1d24]/80 border-[#333] text-brand-gold hover:bg-[#2a2d35]`}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : friendship === "pending_in" ? (
          <Check className="h-5 w-5" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] overflow-y-auto bg-brand-dark text-white"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label={isEn ? "Close" : "Tutup"}
        className="fixed right-4 top-4 z-[95] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto w-full max-w-md pb-24">
        {/* ---------------------------------------------------- header --- */}
        <div className="relative h-[440px] w-full bg-[#222]">
          {img ? (
            <Image
              src={img}
              alt={p.full_name || ""}
              fill
              className="object-cover transition-all duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#111] to-[#222] text-7xl font-bold text-brand-gold/40">
              {(p.full_name || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />

          <div className="absolute bottom-[92px] right-4 z-20 flex flex-col gap-3">
            {p.instagram && (
              <a
                href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#333] bg-[#1a1d24]/80 text-brand-gold shadow-lg shadow-black/50 backdrop-blur-md transition-colors hover:bg-[#2a2d35]"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {friendship !== "self" && (
              <Link
                href={`/community/messages?u=${member.id}`}
                aria-label={isEn ? "Message" : "Pesan"}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#333] bg-[#1a1d24]/80 text-brand-gold shadow-lg shadow-black/50 backdrop-blur-md transition-colors hover:bg-[#2a2d35]"
              >
                <MessageSquare className="h-5 w-5 fill-current" />
              </Link>
            )}
            {friendBtn()}
          </div>

          <div className="absolute bottom-[104px] left-6 z-10 max-w-[65%]">
            <h1 className="text-3xl font-bold leading-tight drop-shadow-md">
              {name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-light drop-shadow-md">
              <Tent className="h-4 w-4" />
              {p.community?.name || "Ruang Iman"}
            </p>
            {p.favorite_verse && (
              <p className="mt-1 text-xs italic text-brand-gold drop-shadow-md">
                &ldquo;{p.favorite_verse}&rdquo;
              </p>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 z-20 px-4">
              <div className="flex items-center gap-2 rounded-[20px] border border-[#333] bg-[#1a1d24]/60 p-2 backdrop-blur-md">
                {gallery.slice(0, 5).map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(g)}
                    className={`relative h-14 w-[18%] shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      img === g
                        ? "scale-105 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={g} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- vinyl --- */}
        {(p.favorite_songs?.length ?? 0) > 0 && (
          <VinylPlayer
            initialSongs={p.favorite_songs || []}
            userId={member.id}
            readOnly
          />
        )}

        {/* ------------------------------------------------ stat cards --- */}
        <div className="mt-6 grid grid-cols-2 gap-3 px-6">
          <div className="flex flex-col gap-2 rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10">
                <Heart className="h-[18px] w-[18px] text-brand-gold" />
              </div>
              <span className="text-2xl font-bold text-white">
                {services.length}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {isEn ? "My Services" : "Pelayanan Saya"}
              </p>
              <p className="mt-0.5 text-[10px] text-brand-muted">
                {services.length
                  ? `${isEn ? "Last:" : "Terakhir:"} ${
                      services[services.length - 1]?.position || "—"
                    }`
                  : isEn
                  ? "None yet"
                  : "Belum ada"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10">
                <Tent className="h-[18px] w-[18px] text-brand-gold" />
              </div>
              <span className="text-2xl font-bold text-white">
                {journey.length}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {isEn ? "My Journey" : "Perjalanan Saya"}
              </p>
              <p className="mt-0.5 text-[10px] text-brand-muted">
                {journey.length
                  ? journey[journey.length - 1]?.camp || "—"
                  : isEn
                  ? "None yet"
                  : "Belum ada"}
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- body --- */}
        <div className="mt-6 px-6">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-muted" />
            </div>
          )}

          {!loading && (
            <div className="space-y-8 pb-4">
              {p.bio && (
                <p className="text-sm leading-relaxed text-brand-light">
                  {p.bio}
                </p>
              )}

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold">
                  <Tent className="h-4 w-4" />
                  {isEn ? "My Journey" : "Perjalanan Saya"}
                </h3>
                <div className="relative space-y-5 pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#333]">
                  {journey.length ? (
                    journey.map((c, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-4 ring-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <div className="relative overflow-hidden rounded-2xl border border-[#333] bg-[#1a1d24] p-4">
                          <div className="absolute left-0 top-0 h-full w-1 bg-brand-gold/20" />
                          <h4 className="text-sm font-bold text-white">
                            {c.camp}
                          </h4>
                          <p className="mt-1 text-xs text-gray-400">
                            Angkatan {c.angkatan}
                            {c.kota ? (
                              <>
                                <span className="mx-1 text-[#444]">•</span>
                                {c.kota}
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-brand-muted">
                      {isEn ? "No camps added yet." : "Belum ada camp."}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold">
                  <Heart className="h-4 w-4" />
                  {isEn ? "My Services" : "Pelayanan Saya"}
                </h3>
                <div className="relative space-y-5 pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-brand-gold/50 before:to-[#333]">
                  {services.length ? (
                    services.map((s, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-4 ring-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <div className="relative overflow-hidden rounded-2xl border border-[#333] bg-[#1a1d24] p-4">
                          <div className="absolute left-0 top-0 h-full w-1 bg-brand-gold/20" />
                          <div className="mb-1 flex items-center gap-2">
                            <Heart className="h-3.5 w-3.5 text-brand-gold" />
                            <h4 className="text-sm font-bold text-white">
                              {s.position}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-400">
                            {s.camp}
                            <span className="mx-1 text-[#444]">•</span>
                            Angkatan {s.angkatan}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-brand-muted">
                      {isEn ? "No services added yet." : "Belum ada pelayanan."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
