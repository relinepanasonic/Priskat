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
  DoorClosed,
  DoorOpen,
  Loader2,
  Lock,
  Plus,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ types --- */

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type Room = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_hidden: boolean;
  owner_id: string | null;
  created_at: string;
};
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
  chat_id: string | null;
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
    groups: "Groups",
    noRooms: "No rooms yet",
    noRoomsAdmin: "Create the first room.",
    noRoomsUser: "A founder needs to create a room first.",
    newRoom: "New room",
    roomName: "Room name",
    description: "Description (optional)",
    whoAddsGroups: "Who can add groups",
    anyone: "Anyone",
    membersOnly: "Members only",
    roomVisibility: "Room visibility",
    visible: "Visible",
    hidden: "Hidden",
    pickRoom: "Pick a room",
    noGroups: "No groups in this room yet",
    newGroup: "New group",
    groupName: "Group name",
    join: "Join",
    joining: "Joining…",
    pickGroup: "Select a group to open the chat",
    create: "Create",
    cancel: "Cancel",
    message: "Message",
    members: (n: number) => `${n} member${n === 1 ? "" : "s"}`,
    today: "Today",
    yesterday: "Yesterday",
    failed: "Not sent — tap to retry",
    emptyChat: "No messages yet. Say hi 👋",
    joinToChat: "Join this group to see the chat",
    you: "You",
  },
  id: {
    rooms: "Ruang",
    groups: "Grup",
    noRooms: "Belum ada ruang",
    noRoomsAdmin: "Buat ruang pertama.",
    noRoomsUser: "Seorang founder perlu membuat ruang dahulu.",
    newRoom: "Ruang baru",
    roomName: "Nama ruang",
    description: "Deskripsi (opsional)",
    whoAddsGroups: "Siapa yang bisa menambah grup",
    anyone: "Semua orang",
    membersOnly: "Hanya anggota",
    roomVisibility: "Visibilitas ruang",
    visible: "Terlihat",
    hidden: "Tersembunyi",
    pickRoom: "Pilih ruang",
    noGroups: "Belum ada grup di ruang ini",
    newGroup: "Grup baru",
    groupName: "Nama grup",
    join: "Gabung",
    joining: "Bergabung…",
    pickGroup: "Pilih grup untuk membuka obrolan",
    create: "Buat",
    cancel: "Batal",
    message: "Pesan",
    members: (n: number) => `${n} anggota`,
    today: "Hari ini",
    yesterday: "Kemarin",
    failed: "Gagal terkirim — ketuk untuk coba lagi",
    emptyChat: "Belum ada pesan. Sapa dulu 👋",
    joinToChat: "Gabung grup ini untuk melihat obrolan",
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

function Toggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [{ v: boolean; label: string }, { v: boolean; label: string }];
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-[12px] font-medium text-brand-muted">
        {label}
      </span>
      <div className="flex gap-1 rounded-lg bg-[#232730] p-1">
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 rounded-md py-1.5 text-[12px] font-semibold transition-colors ${
              value === o.v
                ? "bg-brand-gold text-brand-dark"
                : "text-brand-muted hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
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
  myRoomIds: initialRoomIds,
}: {
  lang?: "id" | "en";
  me: Profile;
  canCreateRoom: boolean;
  rooms: Room[];
  groups: Group[];
  myRoomIds: string[];
}) {
  const t = DICT[lang];
  const supabase = useMemo(() => createClient(), []);

  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [myRoomIds, setMyRoomIds] = useState<Set<string>>(
    () => new Set(initialRoomIds)
  );

  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms[0]?.id ?? null
  );
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  // mobile stack: which of the 3 columns is on screen
  const [mobileCol, setMobileCol] = useState<"rooms" | "groups" | "chat">("rooms");

  const [byChat, setByChat] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const profileCache = useRef<Record<string, Profile>>({ [me.id]: me });
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<null | { type: "room" } | { type: "group" }>(
    null
  );
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

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;
  const roomGroups = activeRoomId ? groupsByRoom[activeRoomId] || [] : [];
  const chatId = activeGroup?.chat_id ?? null;
  const messages = chatId ? byChat[chatId] || [] : [];

  const canAddGroup =
    !!activeRoom &&
    (activeRoom.is_public ||
      activeRoom.owner_id === me.id ||
      myRoomIds.has(activeRoom.id) ||
      canCreateRoom);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el)
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  /* ---- load a chat's messages ------------------------------------- */
  const loadChat = useCallback(
    async (id: string) => {
      if (byChat[id]) {
        scrollToBottom();
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("group_messages")
        .select(
          "id, subgroup_id, author_id, content, created_at, author:profiles!group_messages_author_id_fkey(id, full_name, avatar_url)"
        )
        .eq("subgroup_id", id)
        .order("created_at", { ascending: true })
        .limit(80);
      const rows = (data || []) as unknown as Message[];
      rows.forEach((m) => {
        seen.current.add(m.id);
        if (m.author) profileCache.current[m.author.id] = m.author;
      });
      setByChat((prev) => ({ ...prev, [id]: rows }));
      setLoading(false);
      scrollToBottom();
    },
    [byChat, supabase, scrollToBottom]
  );

  useEffect(() => {
    if (chatId) loadChat(chatId);
  }, [chatId, loadChat]);

  /* ---- realtime for the active chat ----------------------------- */
  useEffect(() => {
    if (!chatId) return;
    const ch = supabase
      .channel(`group_messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `subgroup_id=eq.${chatId}`,
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
          setByChat((prev) => {
            const list = prev[chatId] || [];
            if (list.some((m) => m.id === row.id)) return prev;
            return { ...prev, [chatId]: [...list, { ...row, author }] };
          });
          scrollToBottom(true);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [chatId, supabase, scrollToBottom]);

  /* ---- send ---------------------------------------------------- */
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
      if (!chatId) return;
      const tid = replaceId ?? tempId();
      const optimistic: Message = {
        id: tid,
        subgroup_id: chatId,
        author_id: me.id,
        content: body,
        created_at: new Date().toISOString(),
        author: me,
        pending: true,
      };
      setByChat((prev) => {
        const list = prev[chatId] || [];
        const next = replaceId
          ? list.map((m) => (m.id === replaceId ? optimistic : m))
          : [...list, optimistic];
        return { ...prev, [chatId]: next };
      });
      scrollToBottom(true);

      const { data, error } = await supabase
        .from("group_messages")
        .insert({ subgroup_id: chatId, author_id: me.id, content: body })
        .select("id, subgroup_id, author_id, content, created_at")
        .single();

      setByChat((prev) => {
        const list = prev[chatId] || [];
        if (error || !data) {
          console.error("[group] send failed", error);
          return {
            ...prev,
            [chatId]: list.map((m) =>
              m.id === tid ? { ...m, pending: false, failed: true } : m
            ),
          };
        }
        seen.current.add(data.id);
        return {
          ...prev,
          [chatId]: list.map((m) =>
            m.id === tid ? { ...(data as Message), author: me, pending: false } : m
          ),
        };
      });
    },
    [chatId, me, supabase, scrollToBottom]
  );

  const onSubmit = () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    requestAnimationFrame(autosize);
    doSend(body);
  };

  /* ---- create room / group + join ------------------------------ */
  const createRoom = (
    name: string,
    description: string,
    isPublic: boolean,
    isHidden: boolean
  ) =>
    startTransition(async () => {
      setActionError(null);
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          name,
          description: description || null,
          owner_id: me.id,
          created_by: me.id,
          is_public: isPublic,
          is_hidden: isHidden,
        })
        .select("id, name, description, is_public, is_hidden, owner_id, created_at")
        .single();
      if (error || !data) {
        console.error("[group] create room failed", error);
        setActionError(error?.message || "Could not create the room.");
        return;
      }
      await supabase
        .from("room_members")
        .insert({ room_id: data.id, user_id: me.id, role: "owner" });
      setRooms((prev) => [...prev, data as Room]);
      setMyRoomIds((prev) => new Set(prev).add((data as Room).id));
      setActiveRoomId((data as Room).id);
      setActiveGroupId(null);
      setMobileCol("groups");
      closeModal();
    });

  const createGroup = (roomId: string, groupName: string) =>
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
        .insert({ group_id: g.id, name: "main" })
        .select("id")
        .single();
      if (sErr) console.error("[group] create chat thread failed", sErr);

      await supabase
        .from("room_members")
        .insert({ room_id: roomId, user_id: me.id, role: "member" })
        .then(() => {}, () => {}); // ignore "already a member"

      setMyRoomIds((prev) => new Set(prev).add(roomId));
      setGroups((prev) => [
        ...prev,
        {
          ...(g as any),
          joined: true,
          myRole: "owner",
          chat_id: sub?.id ?? null,
        },
      ]);
      setActiveGroupId(g.id);
      setMobileCol("chat");
      closeModal();
    });

  const joinGroup = (group: Group) => {
    setJoiningId(group.id);
    startTransition(async () => {
      const { error } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: me.id,
        role: "member",
        status: "accepted",
      });
      if (error) {
        console.error("[group] join failed", error);
        setJoiningId(null);
        return;
      }
      await supabase
        .from("room_members")
        .insert({ room_id: group.room_id, user_id: me.id, role: "member" })
        .then(() => {}, () => {});
      const { data: sub } = await supabase
        .from("group_subgroups")
        .select("id")
        .eq("group_id", group.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setMyRoomIds((prev) => new Set(prev).add(group.room_id));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                joined: true,
                myRole: "member",
                member_count: g.member_count + 1,
                chat_id: sub?.id ?? g.chat_id,
              }
            : g
        )
      );
      setActiveGroupId(group.id);
      setMobileCol("chat");
      setJoiningId(null);
    });
  };

  /* ---- render ------------------------------------------------- */
  const shell =
    "flex h-[calc(100dvh-170px)] md:h-[calc(100vh-56px)] overflow-hidden bg-brand-dark text-white";

  return (
    <div className={shell}>
      {/* ============ MOBILE · room avatar rail (steps 2 & 3) =========== */}
      <nav
        className={`${
          mobileCol === "rooms" ? "hidden" : "flex"
        } w-16 flex-shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-[#2a2d35] bg-[#111317] py-3 md:hidden`}
      >
        <button
          onClick={() => setMobileCol("rooms")}
          aria-label={t.rooms}
          className="mb-1 rounded-full p-2 text-brand-muted hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {rooms.map((r) => {
          const active = r.id === activeRoomId;
          return (
            <button
              key={r.id}
              onClick={() => {
                setActiveRoomId(r.id);
                setActiveGroupId(null);
                setMobileCol("groups");
              }}
              aria-label={r.name}
              className="relative flex items-center justify-center py-0.5"
            >
              {active && (
                <span className="absolute left-[-12px] top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-brand-gold" />
              )}
              <span
                className={`transition ${
                  active ? "" : "opacity-50 grayscale"
                }`}
              >
                <Avatar name={r.name} size={44} />
              </span>
            </button>
          );
        })}
      </nav>

      {/* ============================================ COLUMN 1 · ROOMS === */}
      <aside
        className={`${
          mobileCol === "rooms" ? "flex" : "hidden"
        } md:flex w-full md:w-60 lg:w-64 flex-col border-r border-[#2a2d35] bg-[#16181d]`}
      >
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
              const active = r.id === activeRoomId;
              const n = (groupsByRoom[r.id] || []).length;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRoomId(r.id);
                    setActiveGroupId(null);
                    setMobileCol("groups");
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    active ? "bg-brand-gold/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                      active
                        ? "bg-brand-gold text-brand-dark"
                        : "bg-brand-gold/15 text-brand-gold"
                    }`}
                  >
                    {r.is_hidden ? (
                      <DoorClosed className="h-5 w-5" />
                    ) : (
                      <DoorOpen className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-white">
                        {r.name}
                      </span>
                      {!r.is_public && (
                        <Lock className="h-3 w-3 flex-shrink-0 text-brand-muted" />
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-brand-muted">
                      {r.description || `${n} ${t.groups.toLowerCase()}`}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* =========================================== COLUMN 2 · GROUPS === */}
      <aside
        className={`${
          mobileCol === "groups" ? "flex" : "hidden"
        } md:flex min-w-0 flex-1 md:w-64 md:flex-none lg:w-72 flex-col border-r border-[#2a2d35] bg-[#191c22]`}
      >
        <div className="flex items-center gap-2 border-b border-[#2a2d35] px-3 py-3">
          <h2 className="flex-1 truncate text-[14px] font-bold">
            {activeRoom?.name || t.groups}
          </h2>
          {activeRoom && canAddGroup && (
            <button
              onClick={() => setModal({ type: "group" })}
              className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-gold"
              aria-label={t.newGroup}
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {!activeRoom ? (
            <EmptyState
              icon={<DoorOpen className="h-8 w-8 text-brand-muted" />}
              title={t.pickRoom}
            />
          ) : roomGroups.length === 0 ? (
            <EmptyState
              icon={<UsersRound className="h-8 w-8 text-brand-gold" />}
              title={t.noGroups}
              action={
                canAddGroup ? (
                  <button
                    onClick={() => setModal({ type: "group" })}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:bg-yellow-400"
                  >
                    <Plus className="h-4 w-4" /> {t.newGroup}
                  </button>
                ) : undefined
              }
            />
          ) : (
            roomGroups.map((g) => {
              const active = g.id === activeGroupId;
              const preview = g.chat_id
                ? (byChat[g.chat_id] || []).slice(-1)[0]
                : undefined;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    if (!g.joined) return joinGroup(g);
                    setActiveGroupId(g.id);
                    setMobileCol("chat");
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-brand-gold/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <Avatar url={g.avatar_url} name={g.name} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-white">
                      {g.name}
                    </span>
                    <span className="block truncate text-[12px] text-brand-muted">
                      {g.joined
                        ? preview
                          ? `${
                              preview.author_id === me.id
                                ? t.you
                                : preview.author?.full_name?.split(" ")[0] || ""
                            }: ${preview.content}`
                          : t.members(g.member_count)
                        : t.members(g.member_count)}
                    </span>
                  </span>
                  {!g.joined ? (
                    <span className="flex-shrink-0 rounded-full border border-brand-gold/40 px-2.5 py-1 text-[11px] font-semibold text-brand-gold">
                      {joiningId === g.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        t.join
                      )}
                    </span>
                  ) : (
                    preview && (
                      <span className="flex-shrink-0 self-start pt-0.5 text-[10px] text-brand-muted">
                        {timeLabel(preview.created_at)}
                      </span>
                    )
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ============================================= COLUMN 3 · CHAT === */}
      <section
        className={`${
          mobileCol === "chat" ? "flex" : "hidden"
        } md:flex min-w-0 flex-1 flex-col bg-brand-dark`}
      >
        {!activeGroup ? (
          <EmptyState
            icon={<UsersRound className="h-9 w-9 text-brand-muted" />}
            title={t.pickGroup}
          />
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-[#2a2d35] bg-[#16181d] px-3 py-2.5">
              <button
                onClick={() => setMobileCol("groups")}
                className="-ml-1 rounded-full p-1.5 text-brand-muted hover:text-white md:hidden"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar url={activeGroup.avatar_url} name={activeGroup.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-white">
                  {activeGroup.name}
                </p>
                <p className="truncate text-[11px] text-brand-muted">
                  {activeRoom?.name} · {t.members(activeGroup.member_count)}
                </p>
              </div>
            </header>

            {!activeGroup.joined || !chatId ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-sm text-brand-muted">{t.joinToChat}</p>
                <button
                  onClick={() => joinGroup(activeGroup)}
                  disabled={joiningId === activeGroup.id}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:bg-yellow-400 disabled:opacity-50"
                >
                  {joiningId === activeGroup.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {joiningId === activeGroup.id ? t.joining : t.join}
                </button>
              </div>
            ) : (
              <>
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
                      {t.emptyChat}
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
                                } ${
                                  m.failed ? "opacity-60 ring-1 ring-red-500/60" : ""
                                }`}
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
          </>
        )}
      </section>

      {/* ---------------------------------------------------- modals --- */}
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
          onCreate={(name) => createGroup(activeRoomId, name)}
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
      <h2 className="text-[15px] font-bold text-white">{title}</h2>
      {sub && <p className="mt-1 max-w-xs text-[13px] text-brand-muted">{sub}</p>}
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
  onCreate: (
    name: string,
    description: string,
    isPublic: boolean,
    isHidden: boolean
  ) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
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
      <Toggle
        label={t.whoAddsGroups}
        value={isPublic}
        onChange={setIsPublic}
        options={[
          { v: true, label: t.anyone },
          { v: false, label: t.membersOnly },
        ]}
      />
      <Toggle
        label={t.roomVisibility}
        value={isHidden}
        onChange={setIsHidden}
        options={[
          { v: false, label: t.visible },
          { v: true, label: t.hidden },
        ]}
      />
      <ModalActions
        t={t}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() => onCreate(name.trim(), desc.trim(), isPublic, isHidden)}
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
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <ModalShell title={t.newGroup} onClose={onClose}>
      <Field
        label={t.groupName}
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="Legio Maria · KTM · OMK …"
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
