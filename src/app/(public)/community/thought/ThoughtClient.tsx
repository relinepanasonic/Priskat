"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Send, X, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

function Avatar({ url, name, size = 36 }: { url?: string | null; name?: string | null; size?: number }) {
  return url ? (
    <Image src={url} alt={name || ""} width={size} height={size} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-gold font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

// ─── Report / block menu (Google Play UGC requirement) ───────────────────────
const REPORT_REASONS = [
  { id: "spam", id_label: "Spam atau penipuan", en_label: "Spam or scam" },
  { id: "harassment", id_label: "Pelecehan atau ujaran kebencian", en_label: "Harassment or hate speech" },
  { id: "inappropriate", id_label: "Konten tidak pantas", en_label: "Inappropriate content" },
  { id: "other", id_label: "Lainnya", en_label: "Other" },
];

function ReportMenu({ targetType, targetId, authorId, userId, onBlocked, lang = "id" }: {
  targetType: "post" | "comment"; targetId: string; authorId?: string; userId?: string;
  onBlocked: (authorId: string) => void; lang?: "id" | "en";
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "reasons" | "block" | "done">("menu");
  const [msg, setMsg] = useState("");
  const supabase = createClient();
  const isEn = lang === "en";

  if (!userId || !authorId || authorId === userId) return null;

  const close = () => { setOpen(false); setView("menu"); setMsg(""); };

  const report = async (reason: string) => {
    const { error } = await supabase.from("content_reports" as any).insert({
      reporter_id: userId, target_type: targetType, target_id: targetId, reason,
    });
    setMsg(error
      ? (isEn ? "Could not send the report. Please try again." : "Gagal mengirim laporan. Coba lagi.")
      : (isEn ? "Thank you. We will review this report." : "Terima kasih. Laporan Anda akan kami tinjau."));
    setView("done");
  };

  const block = async () => {
    const { error } = await supabase.from("user_blocks" as any).insert({ blocker_id: userId, blocked_id: authorId });
    if (error) {
      setMsg(isEn ? "Could not block this user." : "Gagal memblokir pengguna.");
      setView("done");
      return;
    }
    close();
    onBlocked(authorId);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label={isEn ? "More options" : "Opsi lainnya"} className="p-1 text-brand-muted hover:text-white">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-7 z-50 w-60 rounded-2xl border border-[#333] bg-[#1a1d24] p-2 shadow-xl">
            {view === "menu" && (
              <>
                <button onClick={() => setView("reasons")} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white hover:bg-white/5">
                  {isEn ? "Report" : "Laporkan"}
                </button>
                <button onClick={() => setView("block")} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/5">
                  {isEn ? "Block user" : "Blokir pengguna"}
                </button>
              </>
            )}
            {view === "reasons" && (
              <>
                <p className="px-3 py-1.5 text-xs text-brand-muted">{isEn ? "Why are you reporting this?" : "Mengapa Anda melaporkan ini?"}</p>
                {REPORT_REASONS.map(r => (
                  <button key={r.id} onClick={() => report(r.id)} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white hover:bg-white/5">
                    {isEn ? r.en_label : r.id_label}
                  </button>
                ))}
              </>
            )}
            {view === "block" && (
              <div className="p-2">
                <p className="text-sm text-white">{isEn ? "Block this user? You will no longer see their posts and comments." : "Blokir pengguna ini? Anda tidak akan melihat kiriman dan komentarnya lagi."}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={close} className="flex-1 rounded-full border border-[#333] py-1.5 text-sm text-white">{isEn ? "Cancel" : "Batal"}</button>
                  <button onClick={block} className="flex-1 rounded-full bg-red-600 py-1.5 text-sm font-semibold text-white">{isEn ? "Block" : "Blokir"}</button>
                </div>
              </div>
            )}
            {view === "done" && (
              <div className="p-3">
                <p className="text-sm text-white">{msg}</p>
                <button onClick={close} className="mt-2 text-sm text-brand-gold">{isEn ? "Close" : "Tutup"}</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CommentItem({ comment, userId, onBlocked, lang = "id" }: { comment: any; userId?: string; onBlocked: (id: string) => void; lang?: "id" | "en" }) {
  return (
    <div className="flex gap-2 mt-3">
      <Avatar url={comment.author?.avatar_url} name={comment.author?.full_name} size={28} />
      <div className="flex-1 bg-brand-surface rounded-2xl px-3 py-2">
        <span className="font-bold text-white text-[13px] mr-2">{comment.author?.full_name}</span>
        <span className="text-[13px] text-brand-light">{comment.content}</span>
        <p className="text-[10px] text-brand-muted mt-1">{formatDate(new Date(comment.created_at))}</p>
      </div>
      <ReportMenu targetType="comment" targetId={comment.id} authorId={comment.author?.id} userId={userId} onBlocked={onBlocked} lang={lang} />
    </div>
  );
}

function CommentSection({ postId, userId, initialCount, blockedIds, onBlocked, lang = "id" }: { postId: string; userId?: string; initialCount: number; blockedIds: string[]; onBlocked: (id: string) => void; lang?: "id" | "en" }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const supabase = createClient();
  const isEn = lang === "en";

  const loadComments = async () => {
    const { data } = await supabase
      .from("community_post_comments")
      .select("id, content, created_at, author:profiles!community_post_comments_author_id_fkey(id, full_name, avatar_url)")
      .eq("post_id", postId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true })
      .limit(30);
    setComments(data || []);
  };

  const toggle = async () => {
    if (!open) { setLoading(true); await loadComments(); setLoading(false); }
    setOpen(o => !o);
  };

  const submit = () => {
    if (!input.trim() || !userId) return;
    startSubmit(async () => {
      await supabase.from("community_post_comments").insert({ post_id: postId, author_id: userId, content: input.trim() });
      // Increment cached count
      await supabase.rpc("increment_comments_count", { post_id: postId });
      setInput("");
      await loadComments();
    });
  };

  return (
    <div>
      <button onClick={toggle} className="flex items-center gap-1.5 text-[13px] text-brand-muted hover:text-white transition-colors">
        <MessageCircle className="h-4 w-4" />
        <span>{initialCount > 0 ? initialCount : (isEn ? "Comment" : "Komentar")}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-brand-border pt-3">
          {loading && <p className="text-xs text-brand-muted">{isEn ? "Loading..." : "Memuat..."}</p>}
          {comments.filter(c => !blockedIds.includes(c.author?.id)).map(c => <CommentItem key={c.id} comment={c} userId={userId} onBlocked={onBlocked} lang={lang} />)}
          {userId && (
            <div className="flex gap-2 mt-3">
              <div className="flex-1 flex items-center bg-brand-surface rounded-2xl px-3 gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && submit()}
                  placeholder={isEn ? "Write a comment..." : "Tulis komentar..."}
                  className="flex-1 bg-transparent py-2 text-[13px] text-white placeholder-gray-500 focus:outline-none"
                />
                <button onClick={submit} disabled={!input.trim() || submitting} className="text-brand-gold disabled:opacity-30">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThoughtCard({ post, userId, isLiked: initialLiked, blockedIds, onBlocked, lang = "id" }: { post: any; userId?: string; isLiked: boolean; blockedIds: string[]; onBlocked: (id: string) => void; lang?: "id" | "en" }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const isEn = lang === "en";

  const toggleLike = () => {
    if (!userId) return;
    startTransition(async () => {
      if (liked) {
        await supabase.from("community_post_likes").delete().eq("post_id", post.id).eq("user_id", userId);
        setLikesCount((c: number) => Math.max(0, c - 1));
        setLiked(false);
      } else {
        await supabase.from("community_post_likes").insert({ post_id: post.id, user_id: userId });
        setLikesCount((c: number) => c + 1);
        setLiked(true);
      }
    });
  };

  const timeAgo = formatDate(new Date(post.created_at));
  const author = post.author;

  return (
    <article className="border-b border-brand-border px-4 py-5">
      <div className="flex gap-3">
        {/* Avatar col with thread line */}
        <div className="flex flex-col items-center">
          <Avatar url={author?.avatar_url} name={author?.full_name} size={40} />
          <div className="w-px bg-brand-surface flex-1 mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-bold text-white text-[15px]">{author?.full_name}</span>
              <span className="text-brand-muted text-[12px] ml-2">{timeAgo}</span>
            </div>
            <ReportMenu targetType="post" targetId={post.id} authorId={author?.id} userId={userId} onBlocked={onBlocked} lang={lang} />
          </div>

          <p className="text-[15px] text-brand-light leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-brand-border">
              <img src={post.image_url} alt="post image" className="w-full object-cover max-h-80" />
            </div>
          )}

          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={toggleLike}
              disabled={isPending || !userId}
              className={`flex items-center gap-1.5 text-[13px] transition-colors ${liked ? "text-red-500" : "text-brand-muted hover:text-red-400"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount > 0 ? likesCount : (isEn ? "Like" : "Suka")}</span>
            </button>

            <CommentSection postId={post.id} userId={userId} initialCount={post.comments_count || 0} blockedIds={blockedIds} onBlocked={onBlocked} lang={lang} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ThoughtClient({ posts: initialPosts, myProfile, userId, likedPostIds, blockedIds: initialBlocked = [], lang = "id" }: {
  posts: any[];
  blockedIds?: string[];
  myProfile: any;
  userId?: string;
  likedPostIds: string[];
  lang?: "id" | "en";
}) {
  const [posts] = useState(initialPosts);
  const [blockedIds, setBlockedIds] = useState<string[]>(initialBlocked);
  const handleBlocked = (id: string) => setBlockedIds(b => (b.includes(id) ? b : [...b, id]));
  const likedSet = new Set(likedPostIds);
  const isEn = lang === "en";
  const visible = posts.filter(p => !blockedIds.includes(p.author?.id));

  return (
    <div className="pb-32 max-w-lg mx-auto">
      {visible.length === 0 ? (
        <div className="text-center text-brand-muted py-16">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{isEn ? "No thoughts yet. Be the first!" : "Belum ada pikiran. Jadilah yang pertama!"}</p>
        </div>
      ) : (
        visible.map(post => (
          <ThoughtCard key={post.id} post={post} userId={userId} isLiked={likedSet.has(post.id)} blockedIds={blockedIds} onBlocked={handleBlocked} lang={lang} />
        ))
      )}
    </div>
  );
}
