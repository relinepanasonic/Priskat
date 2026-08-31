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
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  DoorClosed,
  DoorOpen,
  ImagePlus,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Send,
  Share2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";

/* ------------------------------------------------------------------ types --- */

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type Room = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
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
    editRoom: "Room details",
    editGroup: "Group details",
    roomName: "Room name",
    groupName: "Group name",
    description: "Description (optional)",
    picture: "Picture",
    changePicture: "Change picture",
    whoAddsGroups: "Who can add groups",
    anyone: "Anyone",
    membersOnly: "Members only",
    visibility: "Visibility",
    visible: "Visible",
    hidden: "Hidden",
    access: "Access",
    public: "Public",
    private: "Private",
    save: "Save",
    saved: "Saved",
    addMember: "Add member",
    share: "Share",
    linkCopied: "Link copied",
    searchPeople: "Search people…",
    added: "Added",
    pickRoom: "Pick a room",
    noGroups: "No groups in this room yet",
    newGroup: "New group",
    join: "Join",
    joining: "Joining…",
    pickGroup: "Select a group to open the chat",
    create: "Create",
    cancel: "Cancel",
    close: "Close",
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
    editRoom: "Detail ruang",
    editGroup: "Detail grup",
    roomName: "Nama ruang",
    groupName: "Nama grup",
    description: "Deskripsi (opsional)",
    picture: "Gambar",
    changePicture: "Ganti gambar",
    whoAddsGroups: "Siapa yang bisa menambah grup",
    anyone: "Semua orang",
    membersOnly: "Hanya anggota",
    visibility: "Visibilitas",
    visible: "Terlihat",
    hidden: "Tersembunyi",
    access: "Akses",
    public: "Publik",
    private: "Privat",
    save: "Simpan",
    saved: "Tersimpan",
    addMember: "Tambah anggota",
    share: "Bagikan",
    linkCopied: "Tautan disalin",
    searchPeople: "Cari orang…",
    added: "Ditambahkan",
    pickRoom: "Pilih ruang",
    noGroups: "Belum ada grup di ruang ini",
    newGroup: "Grup baru",
    join: "Gabung",
    joining: "Bergabung…",
    pickGroup: "Pilih grup untuk membuka obrolan",
    create: "Buat",
    cancel: "Batal",
    close: "Tutup",
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

/* ---------------------------------------------------------------- avatar --- */

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

function Dot() {
  return (
    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500 ring-2 ring-[#16181d]" />
  );
}

function Toggle({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: [{ v: boolean; label: string }, { v: boolean; label: string }];
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
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
            disabled={disabled}
            onClick={() => onChange(o.v)}
            className={`flex-1 rounded-md py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50 ${
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
  unreadGroupIds: initialUnread,
}: {
  lang?: "id" | "en";
  me: Profile;
  canCreateRoom: boolean;
  rooms: Room[];
  groups: Group[];
  myRoomIds: string[];
  unreadGroupIds: string[];
}) {
  const t = DICT[lang];
  const supabase = useMemo(() => createClient(), []);
  const params = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [myRoomIds, setMyRoomIds] = useState<Set<string>>(
    () => new Set(initialRoomIds)
  );
  const [unread, setUnread] = useState<Set<string>>(() => new Set(initialUnread));

  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms[0]?.id ?? null
  );
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [mobileCol, setMobileCol] = useState<"rooms" | "groups" | "chat">("rooms");

  const [byChat, setByChat] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const profileCache = useRef<Record<string, Profile>>({ [me.id]: me });
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<
    | null
    | { type: "room" }
    | { type: "group" }
    | { type: "editRoom"; id: string }
    | { type: "editGroup"; id: string }
    | { type: "addMember"; scope: "room" | "group"; id: string }
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

  const unreadRoomIds = useMemo(() => {
    const s = new Set<string>();
    for (const g of groups) if (unread.has(g.id)) s.add(g.room_id);
    return s;
  }, [groups, unread]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;
  const roomGroups = activeRoomId ? groupsByRoom[activeRoomId] || [] : [];
  const chatId = activeGroup?.chat_id ?? null;
  const messages = chatId ? byChat[chatId] || [] : [];

  const canEditRoom =
    !!activeRoom && (activeRoom.owner_id === me.id || canCreateRoom);
  const canAddGroup =
    !!activeRoom &&
    (activeRoom.is_public ||
      activeRoom.owner_id === me.id ||
      myRoomIds.has(activeRoom.id) ||
      canCreateRoom);
  const canEditGroup =
    !!activeGroup &&
    (activeGroup.myRole === "owner" ||
      activeGroup.myRole === "admin" ||
      canCreateRoom);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el)
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  /* ---- deep link (?room= / ?group=) ---------------------------- */
  useEffect(() => {
    const gid = params.get("group");
    const rid = params.get("room");
    if (gid) {
      const g = groups.find((x) => x.id === gid);
      if (g) {
        setActiveRoomId(g.room_id);
        setActiveGroupId(g.id);
        setMobileCol("chat");
        return;
      }
    }
    if (rid && rooms.some((r) => r.id === rid)) {
      setActiveRoomId(rid);
      setMobileCol("groups");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- load a chat's messages -------------------------------- */
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
    if (!activeGroup?.joined || !chatId) return;
    loadChat(chatId);
    supabase.rpc("mark_group_read", { gid: activeGroup.id });
    setUnread((prev) => {
      if (!prev.has(activeGroup.id)) return prev;
      const n = new Set(prev);
      n.delete(activeGroup.id);
      return n;
    });
  }, [activeGroup?.id, activeGroup?.joined, chatId, loadChat, supabase]);

  /* ---- realtime across every chat I've joined ---------------- */
  const activeChatRef = useRef<string | null>(null);
  activeChatRef.current = chatId;
  const groupIdByChat = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of groups) if (g.chat_id) m[g.chat_id] = g.id;
    return m;
  }, [groups]);
  const groupIdByChatRef = useRef(groupIdByChat);
  groupIdByChatRef.current = groupIdByChat;

  const myChatIds = useMemo(
    () => groups.filter((g) => g.joined && g.chat_id).map((g) => g.chat_id as string),
    [groups]
  );
  const myChatKey = myChatIds.slice().sort().join(",");

  useEffect(() => {
    if (!myChatIds.length) return;
    const channel = supabase.channel("group_chat_all");
    for (const cid of myChatIds) {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `subgroup_id=eq.${cid}`,
        },
        async (payload) => {
          const row = payload.new as Message;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);
          const isActive = row.subgroup_id === activeChatRef.current;
          const gid = groupIdByChatRef.current[row.subgroup_id];

          if (row.author_id !== me.id) {
            if (isActive) {
              supabase.rpc("mark_group_read", { gid });
            } else if (gid) {
              setUnread((prev) => new Set(prev).add(gid));
            }
          }
          if (!isActive) return;

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
            const list = prev[row.subgroup_id] || [];
            if (list.some((m) => m.id === row.id)) return prev;
            return { ...prev, [row.subgroup_id]: [...list, { ...row, author }] };
          });
          scrollToBottom(true);
        }
      );
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myChatKey, supabase, me.id, scrollToBottom]);

  /* ---- send ------------------------------------------------- */
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

  /* ---- create room / group + join ------------------------- */
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
        .select(
          "id, name, description, avatar_url, is_public, is_hidden, owner_id, created_at"
        )
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
      const { data: sub } = await supabase
        .from("group_subgroups")
        .insert({ group_id: g.id, name: "main" })
        .select("id")
        .single();

      await supabase
        .from("room_members")
        .insert({ room_id: roomId, user_id: me.id, role: "member" })
        .then(() => {}, () => {});

      setMyRoomIds((prev) => new Set(prev).add(roomId));
      setGroups((prev) => [
        ...prev,
        { ...(g as any), joined: true, myRole: "owner", chat_id: sub?.id ?? null },
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

  const saveRoom = (
    id: string,
    patch: Partial<Pick<Room, "name" | "description" | "avatar_url" | "is_public" | "is_hidden">>
  ) =>
    startTransition(async () => {
      setActionError(null);
      const { error } = await supabase.from("rooms").update(patch).eq("id", id);
      if (error) {
        console.error("[group] save room failed", error);
        setActionError(error.message);
        return;
      }
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      closeModal();
    });

  const saveGroup = (
    id: string,
    patch: Partial<Pick<Group, "name" | "avatar_url" | "is_private">>
  ) =>
    startTransition(async () => {
      setActionError(null);
      const { error } = await supabase.from("groups").update(patch).eq("id", id);
      if (error) {
        console.error("[group] save group failed", error);
        setActionError(error.message);
        return;
      }
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
      closeModal();
    });

  const addMember = async (scope: "room" | "group", id: string, userId: string) => {
    if (scope === "room") {
      const { error } = await supabase
        .from("room_members")
        .insert({ room_id: id, user_id: userId, role: "member" });
      return error;
    }
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: id, user_id: userId, role: "member", status: "accepted" });
    if (!error) {
      const g = groups.find((x) => x.id === id);
      if (g)
        await supabase
          .from("room_members")
          .insert({ room_id: g.room_id, user_id: userId, role: "member" })
          .then(() => {}, () => {});
      setGroups((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, member_count: x.member_count + 1 } : x
        )
      );
    }
    return error;
  };

  const shareUrl = (kind: "room" | "group", id: string) => {
    const url = `${window.location.origin}/community/group?${kind}=${id}`;
    if (navigator.share) navigator.share({ url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
    return url;
  };

  /* ---- render ------------------------------------------- */
  const shell =
    "flex overflow-hidden bg-brand-dark text-white md:h-[calc(100vh-56px)] " +
    "max-md:fixed max-md:inset-x-0 max-md:top-[112px] max-md:bottom-16 max-md:z-40";

  return (
    <div className={shell}>
      {/* ============ MOBILE · room avatar rail (steps 2 & 3) ========== */}
      <nav
        className={`${
          mobileCol === "rooms" ? "hidden" : "flex"
        } w-16 flex-shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-brand-border bg-[#111317] py-3 md:hidden`}
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
              <span className={`transition ${active ? "" : "opacity-50 grayscale"}`}>
                <Avatar url={r.avatar_url} name={r.name} size={44} />
              </span>
              {unreadRoomIds.has(r.id) && !active && (
                <span className="absolute right-0 top-0">
                  <Dot />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ============================================ COLUMN 1 · ROOMS === */}
      <aside
        className={`${
          mobileCol === "rooms" ? "flex" : "hidden"
        } md:flex w-full md:w-60 lg:w-64 flex-col border-r border-brand-border bg-[#16181d]`}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
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
                  <Avatar url={r.avatar_url} name={r.name} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-white">
                        {r.name}
                      </span>
                      {!r.is_public && (
                        <Lock className="h-3 w-3 flex-shrink-0 text-brand-muted" />
                      )}
                      {r.is_hidden && (
                        <DoorClosed className="h-3 w-3 flex-shrink-0 text-brand-muted" />
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-brand-muted">
                      {r.description || `${n} ${t.groups.toLowerCase()}`}
                    </span>
                  </span>
                  {unreadRoomIds.has(r.id) && <Dot />}
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
        } md:flex min-w-0 flex-1 md:w-64 md:flex-none lg:w-72 flex-col border-r border-brand-border bg-[#191c22]`}
      >
        <div className="flex items-center gap-2 border-b border-brand-border px-3 py-3">
          <h2 className="flex-1 truncate text-[14px] font-bold">
            {activeRoom?.name || t.groups}
          </h2>
          {canEditRoom && (
            <button
              onClick={() => setModal({ type: "editRoom", id: activeRoom!.id })}
              className="rounded-full p-1.5 text-brand-muted hover:bg-white/5 hover:text-brand-gold"
              aria-label={t.editRoom}
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
          )}
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
              const isUnread = unread.has(g.id);
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
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`truncate text-[14px] ${
                          isUnread ? "font-bold text-white" : "font-semibold text-white"
                        }`}
                      >
                        {g.name}
                      </span>
                      {g.is_private && (
                        <Lock className="h-3 w-3 flex-shrink-0 text-brand-muted" />
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-brand-muted">
                      {g.joined && preview
                        ? `${
                            preview.author_id === me.id
                              ? t.you
                              : preview.author?.full_name?.split(" ")[0] || ""
                          }: ${preview.content}`
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
                  ) : isUnread ? (
                    <Dot />
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
            <header className="flex items-center gap-3 border-b border-brand-border bg-[#16181d] px-3 py-2.5">
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
              <ShareButton onClick={() => shareUrl("group", activeGroup.id)} t={t} />
              {canEditGroup && (
                <button
                  onClick={() => setModal({ type: "editGroup", id: activeGroup.id })}
                  className="rounded-full p-1.5 text-brand-muted hover:bg-white/5 hover:text-brand-gold"
                  aria-label={t.editGroup}
                >
                  <Pencil className="h-[18px] w-[18px]" />
                </button>
              )}
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

                <div className="border-t border-brand-border bg-[#16181d] px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
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
      {modal?.type === "editRoom" &&
        (() => {
          const r = rooms.find((x) => x.id === modal.id);
          if (!r) return null;
          return (
            <EditRoomModal
              t={t}
              me={me}
              room={r}
              pending={pending}
              error={actionError}
              onClose={closeModal}
              onSave={(patch) => saveRoom(r.id, patch)}
              onAddMember={() =>
                setModal({ type: "addMember", scope: "room", id: r.id })
              }
              onShare={() => shareUrl("room", r.id)}
            />
          );
        })()}
      {modal?.type === "editGroup" &&
        (() => {
          const g = groups.find((x) => x.id === modal.id);
          if (!g) return null;
          return (
            <EditGroupModal
              t={t}
              me={me}
              group={g}
              pending={pending}
              error={actionError}
              onClose={closeModal}
              onSave={(patch) => saveGroup(g.id, patch)}
              onAddMember={() =>
                setModal({ type: "addMember", scope: "group", id: g.id })
              }
              onShare={() => shareUrl("group", g.id)}
            />
          );
        })()}
      {modal?.type === "addMember" && (
        <AddMemberModal
          t={t}
          supabase={supabase}
          scope={modal.scope}
          id={modal.id}
          onClose={closeModal}
          onAdd={(userId) => addMember(modal.scope, modal.id, userId)}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- helpers --- */

function ShareButton({ onClick, t }: { onClick: () => void; t: T }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        onClick();
        if (!(navigator as any).share) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
      className="relative rounded-full p-1.5 text-brand-muted hover:bg-white/5 hover:text-brand-gold"
      aria-label={t.share}
    >
      <Share2 className="h-[18px] w-[18px]" />
      {copied && (
        <span className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white">
          {t.linkCopied}
        </span>
      )}
    </button>
  );
}

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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-brand-border bg-brand-surface">
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
      <div className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-2xl border border-brand-border bg-[#16181d] p-5 sm:rounded-2xl">
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
        className="w-full rounded-lg border border-brand-border bg-[#232730] px-3 py-2.5 text-[14px] text-white placeholder-gray-500 focus:border-brand-gold/60 focus:outline-none"
      />
    </label>
  );
}

function PictureField({
  t,
  me,
  url,
  name,
  onChange,
}: {
  t: T;
  me: Profile;
  url: string | null;
  name: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-4">
      <span className="mb-1 block text-[12px] font-medium text-brand-muted">
        {t.picture}
      </span>
      <label className="flex cursor-pointer items-center gap-3">
        {url ? (
          <Image
            src={url}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <Avatar name={name} size={56} />
        )}
        <span className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-[13px] font-semibold text-brand-light hover:bg-white/5">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {t.changePicture}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              const publicUrl = await uploadImage(
                file,
                "avatars",
                storagePath(me.id, file.name)
              );
              onChange(publicUrl);
            } catch (err) {
              console.error("[group] picture upload failed", err);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
    </div>
  );
}

function ModalActions({
  label,
  pending,
  error,
  disabled,
  onClose,
  onConfirm,
  cancelLabel,
}: {
  label: string;
  pending: boolean;
  error?: string | null;
  disabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelLabel: string;
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
          className="flex-1 rounded-lg border border-brand-border py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={disabled || pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-gold py-2.5 text-[13px] font-bold text-brand-dark hover:bg-yellow-400 disabled:opacity-40"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {label}
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
  onCreate: (n: string, d: string, isPublic: boolean, isHidden: boolean) => void;
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
        label={t.visibility}
        value={isHidden}
        onChange={setIsHidden}
        options={[
          { v: false, label: t.visible },
          { v: true, label: t.hidden },
        ]}
      />
      <ModalActions
        label={t.create}
        cancelLabel={t.cancel}
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
        label={t.create}
        cancelLabel={t.cancel}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() => onCreate(name.trim())}
      />
    </ModalShell>
  );
}

function ShareRow({ t, onShare }: { t: T; onShare: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        onShare();
        if (!(navigator as any).share) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
      className="flex w-full items-center gap-2 rounded-lg border border-brand-border px-3 py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
    >
      <Share2 className="h-4 w-4" /> {copied ? t.linkCopied : t.share}
    </button>
  );
}

function EditRoomModal({
  t,
  me,
  room,
  pending,
  error,
  onClose,
  onSave,
  onAddMember,
  onShare,
}: {
  t: T;
  me: Profile;
  room: Room;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (
    p: Partial<Pick<Room, "name" | "description" | "avatar_url" | "is_public" | "is_hidden">>
  ) => void;
  onAddMember: () => void;
  onShare: () => void;
}) {
  const editable = true; // gated by caller (canEditRoom)
  const [name, setName] = useState(room.name);
  const [desc, setDesc] = useState(room.description ?? "");
  const [avatar, setAvatar] = useState(room.avatar_url);
  const [isPublic, setIsPublic] = useState(room.is_public);
  const [isHidden, setIsHidden] = useState(room.is_hidden);
  return (
    <ModalShell title={t.editRoom} onClose={onClose}>
      <PictureField t={t} me={me} url={avatar} name={name} onChange={setAvatar} />
      <Field label={t.roomName} value={name} onChange={(e) => setName(e.target.value)} />
      <Field
        label={t.description}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <Toggle
        label={t.whoAddsGroups}
        value={isPublic}
        onChange={setIsPublic}
        disabled={!editable}
        options={[
          { v: true, label: t.anyone },
          { v: false, label: t.membersOnly },
        ]}
      />
      <Toggle
        label={t.visibility}
        value={isHidden}
        onChange={setIsHidden}
        disabled={!editable}
        options={[
          { v: false, label: t.visible },
          { v: true, label: t.hidden },
        ]}
      />
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={onAddMember}
          className="flex items-center justify-center gap-2 rounded-lg border border-brand-border px-3 py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
        >
          <UserPlus className="h-4 w-4" /> {t.addMember}
        </button>
        <ShareRow t={t} onShare={onShare} />
      </div>
      <ModalActions
        label={t.save}
        cancelLabel={t.close}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() =>
          onSave({
            name: name.trim(),
            description: desc.trim() || null,
            avatar_url: avatar,
            is_public: isPublic,
            is_hidden: isHidden,
          })
        }
      />
    </ModalShell>
  );
}

function EditGroupModal({
  t,
  me,
  group,
  pending,
  error,
  onClose,
  onSave,
  onAddMember,
  onShare,
}: {
  t: T;
  me: Profile;
  group: Group;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (p: Partial<Pick<Group, "name" | "avatar_url" | "is_private">>) => void;
  onAddMember: () => void;
  onShare: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [avatar, setAvatar] = useState(group.avatar_url);
  const [isPrivate, setIsPrivate] = useState(group.is_private);
  return (
    <ModalShell title={t.editGroup} onClose={onClose}>
      <PictureField t={t} me={me} url={avatar} name={name} onChange={setAvatar} />
      <Field label={t.groupName} value={name} onChange={(e) => setName(e.target.value)} />
      <Toggle
        label={t.access}
        value={isPrivate}
        onChange={setIsPrivate}
        options={[
          { v: false, label: t.public },
          { v: true, label: t.private },
        ]}
      />
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={onAddMember}
          className="flex items-center justify-center gap-2 rounded-lg border border-brand-border px-3 py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
        >
          <UserPlus className="h-4 w-4" /> {t.addMember}
        </button>
        <ShareRow t={t} onShare={onShare} />
      </div>
      <ModalActions
        label={t.save}
        cancelLabel={t.close}
        pending={pending}
        error={error}
        disabled={!name.trim()}
        onClose={onClose}
        onConfirm={() =>
          onSave({ name: name.trim(), avatar_url: avatar, is_private: isPrivate })
        }
      />
    </ModalShell>
  );
}

function AddMemberModal({
  t,
  supabase,
  scope,
  id,
  onClose,
  onAdd,
}: {
  t: T;
  supabase: ReturnType<typeof createClient>;
  scope: "room" | "group";
  id: string;
  onClose: () => void;
  onAdd: (userId: string) => Promise<any>;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const table = scope === "room" ? "room_members" : "group_members";
      const col = scope === "room" ? "room_id" : "group_id";
      const { data } = await supabase.from(table).select("user_id").eq(col, id);
      setExisting(new Set((data || []).map((r: any) => r.user_id)));
    })();
  }, [scope, id, supabase]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const h = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${term}%`)
        .limit(20);
      if (!cancelled) setResults((data as Profile[]) || []);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [q, supabase]);

  return (
    <ModalShell title={t.addMember} onClose={onClose}>
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-brand-border bg-[#232730] px-3">
        <Search className="h-4 w-4 flex-shrink-0 text-brand-muted" />
        <input
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPeople}
          className="flex-1 bg-transparent py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none"
        />
      </div>
      <ul className="max-h-72 space-y-1 overflow-y-auto">
        {results.map((p) => {
          const already = existing.has(p.id) || addedIds.has(p.id);
          return (
            <li key={p.id}>
              <button
                disabled={already || busyId === p.id}
                onClick={async () => {
                  setBusyId(p.id);
                  const err = await onAdd(p.id);
                  setBusyId(null);
                  if (!err) setAddedIds((s) => new Set(s).add(p.id));
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:opacity-60"
              >
                <Avatar url={p.avatar_url} name={p.full_name} size={34} />
                <span className="flex-1 truncate text-[14px] text-white">
                  {p.full_name || "—"}
                </span>
                {busyId === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />
                ) : already ? (
                  <span className="text-[11px] font-semibold text-brand-muted">
                    {t.added}
                  </span>
                ) : (
                  <UserPlus className="h-4 w-4 text-brand-gold" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        onClick={onClose}
        className="mt-3 w-full rounded-lg border border-brand-border py-2.5 text-[13px] font-semibold text-brand-light hover:bg-white/5"
      >
        {t.close}
      </button>
    </ModalShell>
  );
}
