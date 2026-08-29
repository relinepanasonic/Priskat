"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Send, X, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

function Avatar({ url, name, size = 36 }: { url?: string | null; name?: string | null; size?: number }) {
  return url ? (
    <Image src={url} alt={name || ""} width={size} height={size} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-brand-bg border border-[#333] flex items-center justify-center text-brand-gold font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  return (
    <div className="flex gap-2 mt-3">
      <Avatar url={comment.author?.avatar_url} name={comment.author?.full_name} size={28} />
      <div className="flex-1 bg-[#2a2d35] rounded-2xl px-3 py-2">
        <span className="font-bold text-white text-[13px] mr-2">{comment.author?.full_name}</span>
        <span className="text-[13px] text-brand-light">{comment.content}</span>
        <p className="text-[10px] text-brand-muted mt-1">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
      </div>
    </div>
  );
}

function CommentSection({ postId, userId, initialCount }: { postId: string; userId?: string; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const supabase = createClient();

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
        <span>{initialCount > 0 ? initialCount : "Comment"}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-[#2a2d35] pt-3">
          {loading && <p className="text-xs text-brand-muted">Loading...</p>}
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
          {userId && (
            <div className="flex gap-2 mt-3">
              <div className="flex-1 flex items-center bg-[#2a2d35] rounded-2xl px-3 gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && submit()}
                  placeholder="Write a comment..."
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

function ThoughtCard({ post, userId, isLiked: initialLiked }: { post: any; userId?: string; isLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const author = post.author;

  return (
    <article className="border-b border-[#2a2d35] px-4 py-5">
      <div className="flex gap-3">
        {/* Avatar col with thread line */}
        <div className="flex flex-col items-center">
          <Avatar url={author?.avatar_url} name={author?.full_name} size={40} />
          <div className="w-px bg-[#2a2d35] flex-1 mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-bold text-white text-[15px]">{author?.full_name}</span>
              <span className="text-brand-muted text-[12px] ml-2">{timeAgo}</span>
            </div>
          </div>

          <p className="text-[15px] text-brand-light leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2a2d35]">
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
              <span>{likesCount > 0 ? likesCount : "Like"}</span>
            </button>

            <CommentSection postId={post.id} userId={userId} initialCount={post.comments_count || 0} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Composer({ myProfile, onPost }: { myProfile: any; onPost: (post: any) => void }) {
  const [content, setContent] = useState("");
  const [submitting, startSubmit] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const submit = () => {
    if (!content.trim()) return;
    startSubmit(async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .insert({ author_id: myProfile.id, content: content.trim() })
        .select("id, content, image_url, likes_count, comments_count, created_at, author:profiles!community_posts_author_id_fkey(id, full_name, avatar_url)")
        .single();
      if (!error && data) {
        onPost(data);
        setContent("");
      }
    });
  };

  if (!myProfile) return null;

  return (
    <div className="border-b border-[#2a2d35] px-4 py-4">
      <div className="flex gap-3">
        <Avatar url={myProfile.avatar_url} name={myProfile.full_name} size={40} />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share a thought..."
            rows={1}
            className="w-full bg-transparent text-[15px] text-white placeholder-gray-500 focus:outline-none resize-none overflow-hidden"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="px-5 py-1.5 rounded-full bg-brand-gold text-brand-dark text-sm font-bold disabled:opacity-40 hover:bg-yellow-400 transition-colors"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThoughtClient({ posts: initialPosts, myProfile, userId, likedPostIds }: {
  posts: any[];
  myProfile: any;
  userId?: string;
  likedPostIds: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const likedSet = new Set(likedPostIds);

  const handleNewPost = (post: any) => {
    setPosts(prev => [post, ...prev]);
  };

  return (
    <div className="pb-32 max-w-lg mx-auto">
      {myProfile && <Composer myProfile={myProfile} onPost={handleNewPost} />}

      {posts.length === 0 ? (
        <div className="text-center text-brand-muted py-16">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No thoughts yet. Be the first!</p>
        </div>
      ) : (
        posts.map(post => (
          <ThoughtCard key={post.id} post={post} userId={userId} isLiked={likedSet.has(post.id)} />
        ))
      )}
    </div>
  );
}
