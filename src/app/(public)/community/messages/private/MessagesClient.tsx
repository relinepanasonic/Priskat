"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Loader2,
  MessagesSquare,
  PenSquare,
  Search,
  Send,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { pingDmChanged, setViewingThread } from "@/lib/dmEvents";

/* ------------------------------------------------------------------ types --- */

type Me = { id: string; full_name: string | null; avatar_url: string | null };
export type Person = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type ThreadRow = {
  thread_id: string;
  other_id: string;
  other_name: string | null;
  other_avatar: string | null;
  last_content: string | null;
  last_author_id: string | null;
  last_at: string | null;
  unread: boolean;
};

type Msg = {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  pending?: boolean;
  failed?: boolean;
};

/* --------------------------------------------------------------- i18n dict --- */

const DICT = {
  en: {
    messages: "Messages",
    newMessage: "New message",
    searchPeople: "Search people…",
    friendsHeading: "Friends",
    othersHeading: "Other members",
    noFriendsHint: "Type a name to search members.",
    noneFound: "No one found",
    friendTag: "Friend",
    noThreads: "No conversations yet",
    noThreadsSub: "Start one with the pencil button.",
    pickThread: "Select a conversation",
    emptyChat: "No messages yet. Say hi 👋",
    message: "Message",
    today: "Today",
    yesterday: "Yesterday",
    failed: "Not sent — tap to retry",
    you: "You",
  },
  id: {
    messages: "Pesan",
    newMessage: "Pesan baru",
    searchPeople: "Cari orang…",
    friendsHeading: "Teman",
    othersHeading: "Anggota lain",
    noFriendsHint: "Ketik nama untuk mencari anggota.",
    noneFound: "Tidak ada yang cocok",
    friendTag: "Teman",
    noThreads: "Belum ada percakapan",
    noThreadsSub: "Mulai dengan tombol pensil.",
    pickThread: "Pilih percakapan",
    emptyChat: "Belum ada pesan. Sapa dulu 👋",
    message: "Pesan",
    today: "Hari ini",
    yesterday: "Kemarin",
    failed: "Gagal terkirim — ketuk untuk coba lagi",
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
const initials = (name?: string | null) =>
  (name || "?").trim().charAt(0).toUpperCase();
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
  size = 40,
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
        className="flex-shrink-0 rounded-full object-cover"
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

/* --------------------------------------------------------------- component --- */

export default function MessagesClient({
  lang = "id",
  me,
  threads: initialThreads,
  openThreadId,
  friends = [],
}: {
  lang?: "id" | "en";
  me: Me;
  threads: ThreadRow[];
  openThreadId: string | null;
  friends?: Person[];
}) {
  const t = DICT[lang];
  const supabase = useMemo(() => createClient(), []);

  const [threads, setThreads] = useState<ThreadRow[]>(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(openThreadId);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    openThreadId ? "chat" : "list"
  );
  const [compose, setCompose] = useState(false);

  const [byThread, setByThread] = useState<Record<string, Msg[]>>({});
  const [loading, setLoading] = useState(false);
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((x) => x.thread_id === activeId) || null;
  const messages = activeId ? byThread[activeId] || [] : [];

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el)
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  /* ---- load a thread's messages ----------------------------- */
  const loadThread = useCallback(
    async (id: string) => {
      if (byThread[id]) {
        scrollToBottom();
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("dm_messages")
        .select("id, thread_id, author_id, content, created_at")
        .eq("thread_id", id)
        .order("created_at", { ascending: true })
        .limit(100);
      const rows = (data || []) as Msg[];
      rows.forEach((m) => seen.current.add(m.id));
      setByThread((prev) => ({ ...prev, [id]: rows }));
      setLoading(false);
      scrollToBottom();
    },
    [byThread, supabase, scrollToBottom]
  );

  const markRead = useCallback(
    async (id: string) => {
      setThreads((prev) =>
        prev.map((x) => (x.thread_id === id ? { ...x, unread: false } : x))
      );
      await supabase.rpc("mark_dm_read", { tid: id });
      pingDmChanged();
    },
    [supabase]
  );

  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
  }, [activeId, loadThread]);

  /* ---- realtime across every thread I'm in ------------------ */
  const activeIdRef = useRef<string | null>(activeId);
  activeIdRef.current = activeId;
  const byThreadRef = useRef(byThread);
  byThreadRef.current = byThread;

  // Is the conversation actually on screen? (desktop: always when a
  // thread is picked; mobile: only when the chat column is showing.)
  // Being on the inbox list is NOT "viewing" — messages stay unread,
  // WhatsApp-style, until the chat box is opened.
  const chatVisibleRef = useRef(false);
  useEffect(() => {
    const desktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    const visible = !!activeId && (desktop || mobileView === "chat");
    chatVisibleRef.current = visible;
    setViewingThread(visible ? activeId : null);
    if (visible && activeId) markRead(activeId);
  }, [activeId, mobileView, markRead]);
  useEffect(() => () => setViewingThread(null), []);

  const threadIds = useMemo(
    () => threads.map((x) => x.thread_id),
    [threads]
  );
  const threadKey = threadIds.slice().sort().join(",");

  useEffect(() => {
    if (!threadIds.length) return;
    const channel = supabase.channel("dm_all");
    for (const tid of threadIds) {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `thread_id=eq.${tid}`,
        },
        (payload) => {
          const row = payload.new as Msg;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);
          const onThread = row.thread_id === activeIdRef.current;
          const viewing = onThread && chatVisibleRef.current;
          const mine = row.author_id === me.id;

          if (onThread) {
            setByThread((prev) => {
              const list = prev[row.thread_id] || [];
              if (list.some((m) => m.id === row.id)) return prev;
              return { ...prev, [row.thread_id]: [...list, row] };
            });
            if (viewing) {
              scrollToBottom(true);
              if (!mine) markRead(row.thread_id);
            }
          }
          if (!mine && !viewing) pingDmChanged();

          setThreads((prev) => {
            const idx = prev.findIndex((x) => x.thread_id === row.thread_id);
            if (idx === -1) return prev;
            const updated: ThreadRow = {
              ...prev[idx],
              last_content: row.content,
              last_author_id: row.author_id,
              last_at: row.created_at,
              unread: !mine && !viewing,
            };
            const next = prev.slice();
            next.splice(idx, 1);
            return [updated, ...next];
          });
        }
      );
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadKey, supabase, me.id, scrollToBottom, markRead]);

  /* ---- polling fallback: new messages in the open thread ---- */
  useEffect(() => {
    if (!activeId) return;
    let stop = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const id = activeIdRef.current;
      if (!id) return;
      const list = byThreadRef.current[id] || [];
      const since = list.length
        ? list[list.length - 1].created_at
        : new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("dm_messages")
        .select("id, thread_id, author_id, content, created_at")
        .eq("thread_id", id)
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(50);
      if (stop || !data) return;
      const fresh = (data as Msg[]).filter((m) => !seen.current.has(m.id));
      if (!fresh.length) return;
      fresh.forEach((m) => seen.current.add(m.id));
      setByThread((prev) => {
        const cur = prev[id] || [];
        const merged = cur.slice();
        for (const m of fresh)
          if (!merged.some((x) => x.id === m.id)) merged.push(m);
        return { ...prev, [id]: merged };
      });
      const viewing = chatVisibleRef.current && activeIdRef.current === id;
      const anyIncoming = fresh.some((m) => m.author_id !== me.id);
      if (viewing) {
        scrollToBottom(true);
        if (anyIncoming) markRead(id);
      } else if (anyIncoming) {
        pingDmChanged();
      }
      const latest = fresh[fresh.length - 1];
      setThreads((prev) => {
        const idx = prev.findIndex((x) => x.thread_id === id);
        if (idx === -1) return prev;
        const updated: ThreadRow = {
          ...prev[idx],
          last_content: latest.content,
          last_author_id: latest.author_id,
          last_at: latest.created_at,
          unread: viewing ? false : anyIncoming || prev[idx].unread,
        };
        const next = prev.slice();
        next.splice(idx, 1);
        return [updated, ...next];
      });
    };
    const iv = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [activeId, supabase, me.id, scrollToBottom, markRead]);

  /* ---- polling fallback: inbox list + unread ---------------- */
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase.rpc("my_dm_overview");
      if (stop || !Array.isArray(data)) return;
      const rows = data as ThreadRow[];
      const openId = activeIdRef.current;
      setThreads((prev) => {
        const merged: ThreadRow[] = rows.map((r) =>
          r.thread_id === openId ? { ...r, unread: false } : r
        );
        for (const p of prev)
          if (!merged.some((r) => r.thread_id === p.thread_id)) merged.push(p);
        return merged;
      });
    };
    const iv = setInterval(tick, 12000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [supabase]);

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
      const id = activeIdRef.current;
      if (!id) return;
      const tid = replaceId ?? tempId();
      const optimistic: Msg = {
        id: tid,
        thread_id: id,
        author_id: me.id,
        content: body,
        created_at: new Date().toISOString(),
        pending: true,
      };
      setByThread((prev) => {
        const list = prev[id] || [];
        const next = replaceId
          ? list.map((m) => (m.id === replaceId ? optimistic : m))
          : [...list, optimistic];
        return { ...prev, [id]: next };
      });
      scrollToBottom(true);

      const { data, error } = await supabase
        .from("dm_messages")
        .insert({ thread_id: id, author_id: me.id, content: body })
        .select("id, thread_id, author_id, content, created_at")
        .single();

      setByThread((prev) => {
        const list = prev[id] || [];
        if (error || !data) {
          console.error("[dm] send failed", error);
          return {
            ...prev,
            [id]: list.map((m) =>
              m.id === tid ? { ...m, pending: false, failed: true } : m
            ),
          };
        }
        seen.current.add(data.id);
        return {
          ...prev,
          [id]: list.map((m) =>
            m.id === tid ? { ...(data as Msg), pending: false } : m
          ),
        };
      });

      if (!error && data) {
        setThreads((prev) => {
          const idx = prev.findIndex((x) => x.thread_id === id);
          if (idx === -1) return prev;
          const updated: ThreadRow = {
            ...prev[idx],
            last_content: body,
            last_author_id: me.id,
            last_at: (data as Msg).created_at,
            unread: false,
          };
          const next = prev.slice();
          next.splice(idx, 1);
          return [updated, ...next];
        });
      }
    },
    [me.id, supabase, scrollToBottom]
  );

  const onSubmit = () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    requestAnimationFrame(autosize);
    doSend(body);
  };

  /* ---- open / create a conversation ------------------------ */
  const openConversation = useCallback(
    async (person: Person) => {
      setCompose(false);
      const { data, error } = await supabase.rpc("get_or_create_dm_thread", {
        other: person.id,
      });
      if (error || !data) {
        console.error("[dm] open conversation failed", error);
        return;
      }
      const id = data as string;
      setThreads((prev) => {
        if (prev.some((x) => x.thread_id === id)) return prev;
        const row: ThreadRow = {
          thread_id: id,
          other_id: person.id,
          other_name: person.full_name,
          other_avatar: person.avatar_url,
          last_content: null,
          last_author_id: null,
          last_at: null,
          unread: false,
        };
        return [row, ...prev];
      });
      setActiveId(id);
      setMobileView("chat");
    },
    [supabase]
  );

  /* ---- render --------------------------------------------- */
  const shell =
    "flex overflow-hidden bg-brand-dark text-white md:h-[calc(100vh-56px)] " +
    "max-md:fixed max-md:inset-x-0 max-md:top-[112px] max-md:bottom-16 max-md:z-40";

  return (
    <div className={shell}>
      {/* ================================================ COLUMN 1 · LIST === */}
      <aside
        className={`${
          mobileView === "list" ? "flex" : "hidden"
        } md:flex w-full md:w-72 lg:w-80 flex-col border-r border-[#2a2d35] bg-[#16181d]`}
      >
        <div className="flex items-center justify-between border-b border-[#2a2d35] px-4 py-3">
          <h1 className="text-[15px] font-bold tracking-wide">{t.messages}</h1>
          <button
            onClick={() => setCompose(true)}
            className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-gold"
            aria-label={t.newMessage}
          >
            <PenSquare className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <EmptyState
              icon={<MessagesSquare className="h-9 w-9 text-brand-gold" />}
              title={t.noThreads}
              sub={t.noThreadsSub}
            />
          ) : (
            threads.map((th) => {
              const active = th.thread_id === activeId;
              const preview = th.last_content
                ? `${th.last_author_id === me.id ? t.you + ": " : ""}${
                    th.last_content
                  }`
                : "";
              return (
                <button
                  key={th.thread_id}
                  onClick={() => {
                    setActiveId(th.thread_id);
                    setMobileView("chat");
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    active ? "bg-brand-gold/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <Avatar
                    url={th.other_avatar}
                    name={th.other_name}
                    size={44}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`truncate text-[14px] text-white ${
                          th.unread ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {th.other_name || "—"}
                      </span>
                      {th.last_at && (
                        <span className="ml-auto flex-shrink-0 text-[10px] text-brand-muted">
                          {timeLabel(th.last_at)}
                        </span>
                      )}
                    </span>
                    <span
                      className={`block truncate text-[12px] ${
                        th.unread ? "text-white" : "text-brand-muted"
                      }`}
                    >
                      {preview || " "}
                    </span>
                  </span>
                  {th.unread && <Dot />}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ================================================ COLUMN 2 · CHAT === */}
      <section
        className={`${
          mobileView === "chat" ? "flex" : "hidden"
        } md:flex min-w-0 flex-1 flex-col bg-brand-dark`}
      >
        {!activeThread ? (
          <EmptyState
            icon={<MessagesSquare className="h-9 w-9 text-brand-muted" />}
            title={t.pickThread}
          />
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-[#2a2d35] bg-[#16181d] px-3 py-2.5">
              <button
                onClick={() => setMobileView("list")}
                className="-ml-1 rounded-full p-1.5 text-brand-muted hover:text-white md:hidden"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                url={activeThread.other_avatar}
                name={activeThread.other_name}
                size={36}
              />
              <p className="min-w-0 flex-1 truncate text-[14px] font-bold text-white">
                {activeThread.other_name || "—"}
              </p>
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
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          } ${grouped ? "mt-0.5" : "mt-2"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-3 py-1.5 ${
                              mine
                                ? "rounded-br-md bg-brand-gold text-brand-dark"
                                : "rounded-bl-md bg-[#232730] text-brand-light"
                            } ${
                              m.failed ? "opacity-60 ring-1 ring-red-500/60" : ""
                            }`}
                          >
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

            <div className="border-t border-[#2a2d35] bg-[#16181d] px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
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

      {compose && (
        <ComposeModal
          t={t}
          supabase={supabase}
          meId={me.id}
          friends={friends}
          onClose={() => setCompose(false)}
          onPick={openConversation}
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
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-brand-surface">
        {icon}
      </div>
      <h2 className="text-[15px] font-bold text-white">{title}</h2>
      {sub && <p className="mt-1 max-w-xs text-[13px] text-brand-muted">{sub}</p>}
    </div>
  );
}

function ComposeModal({
  t,
  supabase,
  meId,
  friends,
  onClose,
  onPick,
}: {
  t: T;
  supabase: ReturnType<typeof createClient>;
  meId: string;
  friends: Person[];
  onClose: () => void;
  onPick: (p: Person) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const term = q.trim();
  const isSearch = term.length >= 2;

  useEffect(() => {
    if (!isSearch) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const h = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${term}%`)
        .neq("id", meId)
        .limit(30);
      if (!cancelled) {
        setResults((data as Person[]) || []);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [term, isSearch, supabase, meId]);

  // Friends first, then everyone else — both alphabetical.
  const ordered = useMemo(() => {
    if (!isSearch) return friends;
    const rank = (p: Person) => (friendIds.has(p.id) ? 0 : 1);
    return [...results].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.full_name || "").localeCompare(b.full_name || "")
    );
  }, [isSearch, friends, results, friendIds]);

  const firstOtherIdx = isSearch
    ? ordered.findIndex((p) => !friendIds.has(p.id))
    : -1;

  const row = (p: Person) => (
    <li key={p.id}>
      <button
        disabled={busyId === p.id}
        onClick={async () => {
          setBusyId(p.id);
          await onPick(p);
        }}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:opacity-60"
      >
        <Avatar url={p.avatar_url} name={p.full_name} size={34} />
        <span className="flex-1 truncate text-[14px] text-white">
          {p.full_name || "—"}
        </span>
        {friendIds.has(p.id) && (
          <span className="flex-shrink-0 rounded-full border border-brand-gold/40 px-2 py-0.5 text-[10px] font-semibold text-brand-gold">
            {t.friendTag}
          </span>
        )}
        {busyId === p.id && (
          <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />
        )}
      </button>
    </li>
  );

  const heading = (key: string, label: string) => (
    <li
      key={key}
      className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted"
    >
      {label}
    </li>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-2xl border border-[#2a2d35] bg-[#16181d] p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-white">{t.newMessage}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#333] bg-[#232730] px-3">
          <Search className="h-4 w-4 flex-shrink-0 text-brand-muted" />
          <input
            value={q}
            autoFocus
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPeople}
            className="flex-1 bg-transparent py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none"
          />
          {searching && (
            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-brand-muted" />
          )}
        </div>

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {!isSearch ? (
            friends.length ? (
              <>
                {heading("f", t.friendsHeading)}
                {friends.map(row)}
              </>
            ) : (
              <li className="px-2 py-6 text-center text-[13px] text-brand-muted">
                {t.noFriendsHint}
              </li>
            )
          ) : ordered.length ? (
            ordered.map((p, i) => (
              <Fragment key={p.id}>
                {i === 0 && friendIds.has(p.id) && heading("f", t.friendsHeading)}
                {i === firstOtherIdx && heading("o", t.othersHeading)}
                {row(p)}
              </Fragment>
            ))
          ) : !searching ? (
            <li className="px-2 py-6 text-center text-[13px] text-brand-muted">
              {t.noneFound}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
