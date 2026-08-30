"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  DoorOpen,
  Hash,
  Loader2,
  Plus,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ types --- */

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type Room = { id: string; name: string; description: string | null; created_at: string };
type Group = {
  id: string;
  room_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  member_count: number;
  is_private: boolean;
  owner_id: string;
  joined: boolean;
  myRole: "owner" | "admin" | "member" | null;
};
type Channel = {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  created_at: string;
};
type Message = {
  id: string;
  subgroup_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile | null;
  pending?: boolean;
  failed?: boolean;
};

/* --------------------------------------------------------------- i18n dict --- */

const DICT = {
  en: {
    rooms: "Rooms",
    noRooms: "No rooms yet",
    noRoomsAdmin: "Create the first room to organise your groups.",
    noRoomsUser: "A founder needs to create a room first.",
    newRoom: "New room",
    roomName: "Room name",
    description: "Description (optional)",
    groupsCount: (n: number) => `${n} group${n === 1 ? "" : "s"}`,
    noGroupsInRoom: "No groups in this room yet",
    newGroup: "New group",
    groupName: "Group name",
    firstChannel: "First channel",
    join: "Join",
    joining: "Joining…",
    newChannel: "New channel",
    channelName: "Channel name",
    noChannels: "No channels yet",
    addChannelCta: "Add the first channel",
    create: "Create",
    cancel: "Cancel",
    pickChat: "Select a channel to start chatting",
    message: "Message",
    members: (n: number) => `${n} member${n === 1 ? "" : "s"}`,
    today: "Today",
    yesterday: "Yesterday",
    failed: "Not sent — tap to retry",
    emptyChannel: "No messages yet. Say hi 👋",
    you: "You",
  },
  id: {
    rooms: "Ruang",
    noRooms: "Belum ada ruang",
    noRoomsAdmin: "Buat ruang pertama untuk menata grup-grupmu.",
    noRoomsUser: "Seorang founder perlu membuat ruang terlebih dahulu.",
    newRoom: "Ruang baru",
    roomName: "Nama ruang",
    description: "Deskripsi (opsional)",
    groupsCount: (n: number) => `${n} grup`,
    noGroupsInRoom: "Belum ada grup di ruang ini",
    newGroup: "Grup baru",
    groupName: "Nama grup",
    firstChannel: "Saluran pertama",
    join: "Gabung",
    joining: "Bergabung…",
    newChannel: "Saluran baru",
    channelName: "Nama saluran",
    noChannels: "Belum ada saluran",
    addChannelCta: "Tambahkan saluran pertama",
    create: "Buat",
    cancel: "Batal",
    pickChat: "Pilih saluran untuk mulai mengobrol",
    message: "Pesan",
    members: (n: number) => `${n} anggota`,
    today: "Hari ini",
    yesterday: "Kemarin",
    failed: "Gagal terkirim — ketuk untuk coba lagi",
    emptyChannel: "Belum ada pesan. Sapa dulu 👋",
    you: "Kamu",
  },
};
type T = (typeof DICT)["en"];

/* ------------------------------------------------------------------ utils --- */

const NAME_COLORS = [
  "#e17076",
  "#7bc862",
  "#65aadd",
  "#a695e7",
  "#ee7aae",
  "#6ec9cb",
  "#faa774",
];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return NAME_COLORS[h % NAME_COLORS.length];
}
const initials = (name?: string | null) => (name || "?").trim().charAt(0).toUpperCase();
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dayKey = (iso: string) => new Date(iso).toDateString();
function dayLabel(iso: string, t: T) {
  const d = new Date(iso);
  const now = new Date();
  const diff =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (diff === 0) return t.today;
  if (diff === 86400000) return t.yesterday;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
const tempId = () =>
  "temp-" + Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ----------------------------------------------------------------- avatar --- */

function Avatar({
  url,
  name,
  size = 38,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size } as const;
  if (url)
    return (
      <Image
        src={url}
        alt={name || ""}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={style}
      />
    );
  return (
    <div
      className="flex flex-shrink-0 select-none items-center justify-center rounded-full font-bold text-white"
      style={{ ...style, fontSize: size * 0.42, background: colorFor(name || "?") }}
    >
      {initials(name)}
    </div>
  );
}

/* --------------------------------------------------------------- component --- */

export default function GroupClient({
  lang = "id",
  me,
  canCreateRoom,
  rooms: initialRooms,
  groups: initialGroups,
  channels: initialChannels,
}: {
  lang?: "id" | "en";
  me: Profile;
  canCreateRoom: boolean;
  rooms: Room[];
  groups: Group[];
  channels: Channel[];
}) {
  const t = DICT[lang];
  const supabase = useMemo(() => createClient(), []);

  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);

  const [view, setView] = useState<"rooms" | "room">(
    initialRooms.length === 1 ? "room" : "rooms"
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms.length === 1 ? initialRooms[0].id : null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileChat, setMobileChat] = useState(false);

  const [byChannel, setByChannel] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const profileCache = useRef<Record<string, Profile>>({ [me.id]: me });
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<
    | null
    | { type: "room" }
    | { type: "group" }
    | { type: "channel"; groupId: string }
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const closeModal = () => {
    setModal(null);
    setActionError(null);
  };

  const groupsByRoom = useMemo(() => {
    const map: Record<string, Group[]> = {};
    for (const g of groups) (map[g.room_id] ??= []).push(g);
    return map;
  }, [groups]);
  const channelsByGroup = useMemo(() => {
    const map: Record<string, Channel[]> = {};
    for (const c of channels) (map[c.group_id] ??= []).push(c);
    return map;
  }, [channels]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;
  const activeChannel = channels.find((c) => c.id === activeId) || null;
  const activeGroup = activeChannel
    ? groups.find((g) => g.id === activeChannel.group_id) || null
    : null;
  const messages = activeId ? byChannel[activeId] || [] : [];

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el)
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  /* ---- load a channel's messages ------------------------------------ */
  const loadChannel = useCallback(
    async (channelId: string) => {
      if (byChannel[channelId]) {
        scrollToBottom();
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("group_messages")
        .select(
          "id, subgroup_id, author_id, content, created_at, author:profiles!group_messages_author_id_fkey(id, full_name, avatar_url)"
        )
        .eq("subgroup_id", channelId)
        .order("created_at", { ascending: true })
        .limit(80);
      const rows = (data || []) as unknown as Message[];
      rows.forEach((m) => {
        seen.current.add(m.id);
        if (m.author) profileCache.current[m.author.id] = m.author;
      });
      setByChannel((prev) => ({ ...prev, [channelId]: rows }));
      setLoading(false);
      scrollToBottom();
    },
    [byChannel, supabase, scrollToBottom]
  );

  useEffect(() => {
    if (activeId) loadChannel(activeId);
  }, [activeId, loadChannel]);

  /* ---- realtime for the active channel ---------------------------- */
  useEffect(() => {
    if (!activeId) return;
    const ch = supabase
      .channel(`group_messages:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `subgroup_id=eq.${activeId}`,
        },
        async (payload) => {
          const row = payload.new as Message;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);
          let author = profileCache.current[row.author_id];
          if (!author) {
            const { data } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", row.author_id)
              .single();
            if (data) {
              author = data as Profile;
              profileCache.current[author.id] = author;
            }
          }
          setByChannel((prev) => {
            const list = prev[activeId] || [];
            if (list.some((m) => m.id === row.id)) return prev;
            return { ...prev, [activeId]: [...list, { ...row, author }] };
          });
          scrollToBottom(true);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeId, supabase, scrollToBottom]);

  /* ---- send ------------------------------------------------------- */
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const autosize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const doSend = useCallback(
    async (body: string, replaceId?: string) => {
      if (!activeId) return;
      const tid = replaceId ?? tempId();
      const optimistic: Message = {
        id: tid,
        subgroup_id: activeId,
        author_id: me.id,
        content: body,
        created_at: new Date().toISOString(),
        author: me,
        pending: true,
      };
      setByChannel((prev) => {
        const list = prev[activeId] || [];
        const next = replaceId
          ? list.map((m) => (m.id === replaceId ? optimistic : m))
          : [...list, optimistic];
        return { ...prev, [activeId]: next };
      });
      scrollToBottom(true);

      const { data, error } = await supabase
        .from("group_messages")
        .insert({ subgroup_id: activeId, author_id: me.id, content: body })
        .select("id, subgroup_id, author_id, content, created_at")
        .single();

      setByChannel((prev) => {
        const list = prev[activeId] || [];
        if (error || !data) {
          console.error("[group] send failed", error);
          return {
            ...prev,
            [activeId]: list.map((m) =>
              m.id === tid ? { ...m, pending: false, failed: true } : m
            ),
          };
        }
        seen.current.add(data.id);
        return {
          ...prev,
          [activeId]: list.map((m) =>
            m.id === tid ? { ...(data as Message), author: me, pending: false } : m
          ),
        };
      });
    },
    [activeId, me, supabase, scrollToBottom]
  );

  const onSubmit = () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    requestAnimationFrame(autosize);
    doSend(body);
  };

  /* ---- create room / group / channel + join ---------------------- */
  const createRoom = (name: string, description: string) =>
    startTransition(async () => {
      setActionError(null);
      const { data, error } = await supabase
        .from("rooms")
        .insert({ name, description: description || null, created_by: me.id })
        .select("id, name, description, created_at")
        .single();
      if (error || !data) {
        console.error("[group] create room failed", error);
        setActionError(error?.message || "Could not create the room.");
        return;
      }
      setRooms((prev) => [...prev, data as Room]);
      setActiveRoomId((data as Room).id);
      setView("room");
      closeModal();
    });

  const createGroup = (roomId: string, groupName: string, channelName: string) =>
    startTransition(async () => {
      setActionError(null);
      const { data: g, error: gErr } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          room_id: roomId,
          owner_id: me.id,
          is_private: false,
          member_count: 1,
        })
        .select(
          "id, room_id, name, description, avatar_url, member_count, is_private, owner_id"
        )
        .single();
      if (gErr || !g) {
        console.error("[group] create group failed", gErr);
        setActionError(gErr?.message || "Could not create the group.");
        return;
      }
      const { error: mErr } = await supabase
        .from("group_members")
        .insert({ group_id: g.id, user_id: me.id, role: "owner", status: "accepted" });
      if (mErr) {
        console.error("[group] join own group failed", mErr);
        setActionError(mErr.message);
        return;
      }
      const { data: sub, error: sErr } = await supabase
        .from("group_subgroups")
        .insert({ group_id: g.id, name: channelName || "General" })
        .select("id, group_id, name, description, created_at")
        .single();
      if (sErr) console.error("[group] create first channel failed", sErr);

      setGroups((prev) => [
        ...prev,
        { ...(g as any), joined: true, myRole: "owner" },
      ]);
      if (sub) {
        setChannels((prev) => [...prev, sub as Channel]);
        setActiveId((sub as Channel).id);
        setMobileChat(true);
      }
      closeModal();
    });

  const createChannel = (groupId: string, name: string) =>
    startTransition(async () => {
      setActionError(null);
      const { data: sub, error } = await supabase
        .from("group_subgroups")
        .insert({ group_id: groupId, name })
        .select("id, group_id, name, description, created_at")
        .single();
      if (error || !sub) {
        console.error("[group] create channel failed", error);
        setActionError(error?.message || "Could not create the channel.");
        return;
      }
      setChannels((prev) => [...prev, sub as Channel]);
      setActiveId((sub as Channel).id);
      setMobileChat(true);
      closeModal();
    });

  const joinGroup = (groupId: string) => {
    setJoiningId(groupId);
    startTransition(async () => {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: me.id,
        role: "member",
        status: "accepted",
      });
      if (error) {
        console.error("[group] join failed", error);
        setJoiningId(null);
        return;
      }
      const { data: subs } = await supabase
        .from("group_subgroups")
        .select("id, group_id, name, description, created_at")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });
      setChannels((prev) => [
        ...prev.filter((c) => c.group_id !== groupId),
        ...((subs as Channel[]) || []),
      ]);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, joined: true, myRole: "member", member_count: g.member_count + 1 }
            : g
        )
      );
      const first = (subs || [])[0] as Channel | undefined;
      if (first) {
        setActiveId(first.id);
        setMobileChat(true);
      }
      setJoiningId(null);
    });
  };

  /* ---- render --------------------------------------------------- */
  const shell =
    "flex h-[calc(100dvh-170px)] md:h-[calc(100vh-56px)] overflow-hidden bg-brand-dark text-white";
  const roomGroups = activeRoomId ? groupsByRoom[activeRoomId] || [] : [];

  return (
    <div className={shell}>
      {/* -------------------------------------------------- left pane --- */}
      <aside
        className={`${
          mobileChat ? "hidden" : "flex"
        } md:flex w-full md:w-80 lg:w-96 flex-col border-r border-[#2a2d35] bg-[#16181d]`}
      >
        {view === "rooms" ? (
          <>
            <div className="flex items-center justify-between border-b border-[#2a2d35] px-4 py-3">
              <h1 className="text-[15px] font-bold tracking-wide">{t.rooms}</h1>
              {canCreateRoom && (
                <button
                  onClick={() => setModal({ type: "room" })}
                  className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-gold"
                  aria-label={t.newRoom}
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {rooms.length === 0 ? (
                <EmptyState
                  icon={<DoorOpen className="h-9 w-9 text-brand-gold" />}
                  title={t.noRooms}
                  sub={canCreateRoom ? t.noRoomsAdmin : t.noRoomsUser}
                  action={
                    canCreateRoom ? (
                      <button
                        onClick={() => setModal({ type: "room" })}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:bg-yellow-400"
                      >
                        <Plus className="h-4 w-4" /> {t.newRoom}
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                rooms.map((r) => {
                  const n = (groupsByRoom[r.id] || []).length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setActiveRoomId(r.id);
                        setView("room");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                        <DoorOpen className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-white">
                          {r.name}
                        </span>
                        <span className="block truncate text-[12px] text-brand-muted">
                          {r.description || t.groupsCount(n)}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-[#2a2d35] px-3 py-3">
              <button
                onClick={() => setView("rooms")}
                className="-ml-1 rounded-full p-1.5 text-brand-muted hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="flex-1 truncate text-[15px] font-bold">
                {activeRoom?.name}
              </h1>
              <button
                onClick={() => setModal({ type: "group" })}
                className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-gold"
                aria-label={t.newGroup}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {roomGroups.length === 0 ? (
                <EmptyState
                  icon={<UsersRound className="h-9 w-9 text-brand-gold" />}
                  title={t.noGroupsInRoom}
                  action={
                    <button
                      onClick={() => setModal({ type: "group" })}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:bg-yellow-400"
                    >
                      <Plus className="h-4 w-4" /> {t.newGroup}
                    </button>
                  }
                />
              ) : (
                roomGroups.map((g) => {
                  const list = channelsByGroup[g.id] || [];
                  const canAdd = g.myRole === "owner" || g.myRole === "admin";
                  return (
                    <div key={g.id} className="pb-1">
                      <div className="flex items-center gap-2 px-4 pt-4 pb-1.5">
                        <Avatar url={g.avatar_url} name={g.name} size={22} />
                        <span className="flex-1 truncate text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                          {g.name}
                        </span>
                        <span className="text-[10px] text-brand-muted">
                          {t.members(g.member_count)}
                        </span>
                        {g.joined && canAdd && (
                          <button
                            onClick={() =>
                              setModal({ type: "channel", groupId: g.id })
                            }
                            className="text-brand-muted transition-colors hover:text-brand-gold"
                            aria-label={t.newChannel}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {!g.joined ? (
                        <div className="px-3 py-1.5">
                          <button
                            onClick={() => joinGroup(g.id)}
                            disabled={joiningId === g.id}
                            className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-4 py-1.5 text-[13px] font-semibold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50"
                          >
                            {joiningId === g.id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {joiningId === g.id ? t.joining : t.join}
                          </button>
                        </div>
                      ) : list.length === 0 ? (
                        <button
                          onClick={() =>
                            canAdd && setModal({ type: "channel", groupId: g.id })
                          }
                          className="mx-3 my-1 block w-[calc(100%-1.5rem)] rounded-lg border border-dashed border-[#333] px-3 py-2 text-left text-[12px] text-brand-muted hover:border-brand-gold/50"
                        >
                          {canAdd ? t.addChannelCta : t.noChannels}
                        </button>
                      ) : (
                        list.map((c) => {
                          const active = c.id === activeId;
                          const preview = (byChannel[c.id] || []).slice(-1)[0];
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveId(c.id);
                                setMobileChat(true);
                              }}
                              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                active ? "bg-brand-gold/10" : "hover:bg-white/[0.04]"
                              }`}
                            >
                              <span
                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                  active
                                    ? "bg-brand-gold text-brand-dark"
                                    : "bg-[#2a2d35] text-brand-muted"
                                }`}
                              >
                                <Hash className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14px] font-semibold text-white">
                                  {c.name}
                                </span>
                                <span className="block truncate text-[12px] text-brand-muted">
                                  {preview
                                    ? `${
                                        preview.author_id === me.id
                                          ? t.you
                                          : preview.author?.full_name?.split(" ")[0] ||
                                            ""
                                      }: ${preview.content}`
                                    : c.description || t.emptyChannel}
                                </span>
                              </span>
                              {preview && (
                                <span className="flex-shrink-0 self-start pt-0.5 text-[10px] text-brand-muted">
                                  {timeLabel(preview.created_at)}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </aside>

      {/* ------------------------------------------------------- chat --- */}
      <section
        className={`${
          mobileChat ? "flex" : "hidden"
        } md:flex min-w-0 flex-1 flex-col bg-brand-dark`}
      >
        {!activeChannel ? (
          <EmptyState icon={<Hash className="h-9 w-9 text-brand-muted" />} title={t.pickChat} />
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-[#2a2d35] bg-[#16181d] px-3 py-2.5">
              <button
                onClick={() => setMobileChat(false)}
                className="-ml-1 rounded-full p-1.5 text-brand-muted hover:text-white md:hidden"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <Hash className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-white">
                  {activeChannel.name}
                </p>
                <p className="truncate text-[11px] text-brand-muted">
                  {activeGroup?.name}
                  {activeGroup ? ` · ${t.members(activeGroup.member_count)}` : ""}
                </p>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 md:px-6"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,200,55,0.04), transparent 40%)",
              }}
            >
              {loading && !messages.length ? (
                <div className="flex h-full items-center justify-center text-brand-muted">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-brand-muted">
                  {t.emptyChannel}
                </div>
              ) : (
                <ul className="mx-auto flex max-w-2xl flex-col gap-0.5">
                  {messages.map((m, i) => {
                    const prev = messages[i - 1];
                    const mine = m.author_id === me.id;
                    const newDay =
                      !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
                    const grouped =
                      !!prev &&
                      !newDay &&
                      prev.author_id === m.author_id &&
                      new Date(m.created_at).getTime() -
                        new Date(prev.created_at).getTime() <
                        5 * 60 * 1000;
                    return (
                      <li key={m.id}>
                        {newDay && (
                          <div className="my-3 flex justify-center">
                            <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-brand-muted">
                              {dayLabel(m.created_at, t)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-end gap-2 ${
                            mine ? "flex-row-reverse" : ""
                          } ${grouped ? "mt-0.5" : "mt-2"}`}
                        >
                          <div className="w-8 flex-shrink-0">
                            {!mine && !grouped && (
                              <Avatar
                                url={m.author?.avatar_url}
                                name={m.author?.full_name}
                                size={32}
                              />
                            )}
                          </div>
                          <div
                            className={`max-w-[78%] rounded-2xl px-3 py-1.5 ${
                              mine
                                ? "rounded-br-md bg-brand-gold text-brand-dark"
                                : "rounded-bl-md bg-[#232730] text-brand-light"
                            } ${m.failed ? "opacity-60 ring-1 ring-red-500/60" : ""}`}
                          >
                            {!mine && !grouped && (
                              <p
                                className="mb-0.5 text-[12px] font-bold"
                                style={{ color: colorFor(m.author_id) }}
                              >
                                {m.author?.full_name || "…"}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words text-[14px] leading-snug">
                              {m.content}
                            </p>
                            <p
                              className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
                                mine ? "text-brand-dark/60" : "text-brand-muted"
                              }`}
                            >
                              {m.failed ? (
                                <button
                                  onClick={() => doSend(m.content, m.id)}
                                  className="font-medium text-red-400"
                                >
                                  {t.failed}
                                </button>
                              ) : (
                                <>
                                  {timeLabel(m.created_at)}
                                  {mine &&
                                    (m.pending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    ))}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-[#2a2d35] bg-[#16181d] px-3 py-2.5">
              <div className="mx-auto flex max-w-2xl items-end gap-2">
                <textarea
                  ref={taRef}
                  rows={1}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    autosize();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  placeholder={t.message}
                  className="flex-1 resize-none rounded-2xl bg-[#232730] px-4 py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-gold/40"
                />
                <button
                  onClick={onSubmit}
                  disabled={!text.trim()}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-dark transition-transform enabled:hover:scale-105 disabled:opacity-30"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ------------------------------------------------------ modals --- */}
      {modal?.type === "room" && (
        <NewRoomModal
          t={t}
          pending={pending}
          error={actionError}
          onClose={closeModal}
          onCreate={createRoom}
        />
      )}
      {modal?.type === "group" && activeRoomId && (
        <NewGroupModal
          t={t}
          pending={pending}
          error={actionError}
          onClose={closeModal}
          onCreate={(name, chan) => createGroup(activeRoomId, name, chan)}
        />
      )}
      {modal?.type === "channel" && (
        <NewChannelModal
          t={t}
          pending={pending}
          error={actionError}
          onClose={closeModal}
          onCreate={(name) => createChannel(modal.groupId, name)}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- helpers --- */

function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-brand-surface">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {sub && <p className="mt-1 max-w-xs text-sm text-brand-muted">{sub}</p>}
      {action}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl border border-[#2a2d35] bg-[#16181d] p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }
) {
  const { label, ...rest } = props;
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[12px] font-medium text-brand-muted">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-lg border border-[#333] bg-[#232730] px-3 py-2.5 text-[14px] text-white placeholder-gray-500 focus:border-brand-gold/60 focus:outline-none"
      />
    </label>
  );
}

function ModalActions({
  t,
  pending,
  error,
  disabled,
  onClose,
  onConfirm,
}: {
  t: T;
  pending: boolean;
  error?: string | null;
  disabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      {error && (
        <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
          {error}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-[#333] py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
        >
          {t.cancel}
        </button>
        <button
          onClick={onConfirm}
          disabled={disabled || pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-gold py-2.5 text-[13px] font-bold text-brand-dark hover:bg-yellow-400 disabled:opacity-40"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.create}
        </button>
      </div>
    </>
  );
}

function NewRoomModal({
  t,
  pending,
  error,
  onClose,
  onCreate,
}: {
  t: T;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <ModalShell title={t.newRoom} onClose={onClose}>
      <Field
        label={t.roomName}
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="Paroki · Wilayah · Lingkungan …"
      />
      <Field
        label={t.description}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <ModalActions
        t={t}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() => onCreate(name.trim(), desc.trim())}
      />
    </ModalShell>
  );
}

function NewGroupModal({
  t,
  pending,
  error,
  onClose,
  onCreate,
}: {
  t: T;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (groupName: string, channelName: string) => void;
}) {
  const [name, setName] = useState("");
  const [chan, setChan] = useState("General");
  return (
    <ModalShell title={t.newGroup} onClose={onClose}>
      <Field
        label={t.groupName}
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="Legio Maria · KTM · OMK …"
      />
      <Field
        label={t.firstChannel}
        value={chan}
        onChange={(e) => setChan(e.target.value)}
      />
      <ModalActions
        t={t}
        pending={pending}
        error={error}
        disabled={!name.trim() || !chan.trim()}
        onClose={onClose}
        onConfirm={() => onCreate(name.trim(), chan.trim())}
      />
    </ModalShell>
  );
}

function NewChannelModal({
  t,
  pending,
  error,
  onClose,
  onCreate,
}: {
  t: T;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <ModalShell title={t.newChannel} onClose={onClose}>
      <Field
        label={t.channelName}
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="prayer-requests · events …"
      />
      <ModalActions
        t={t}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() => onCreate(name.trim())}
      />
    </ModalShell>
  );
}
