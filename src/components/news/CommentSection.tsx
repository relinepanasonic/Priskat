"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { addComment, deleteComment } from "@/app/actions/news";
import Button from "@/components/ui/Button";
import { Trash2, Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { NewsComment, Profile } from "@/lib/types/database.types";

type CommentWithProfile = NewsComment & {
  profiles: Pick<Profile, "full_name" | "avatar_url" | "username"> | null;
};

interface Props {
  postId: string;
  initialComments: CommentWithProfile[];
  currentUserId: string | null;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await addComment(postId, body);
      if (result?.error) {
        setError(result.error);
        return;
      }
      // Optimistically add comment
      setComments((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          post_id: postId,
          author_id: currentUserId!,
          body: body.trim(),
          is_hidden: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: null,
        } as CommentWithProfile,
      ]);
      setBody("");
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });
  }

  return (
    <section className="mt-10">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
        <MessageCircle className="h-5 w-5 text-brand-gold" />
        Comments ({comments.length})
      </h2>

      {comments.length === 0 && (
        <p className="mb-6 text-sm text-brand-muted">
          No comments yet. Be the first!
        </p>
      )}

      <div className="space-y-4 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {comment.profiles?.avatar_url ? (
                <Image
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.full_name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold text-xs font-semibold">
                  {(comment.profiles?.full_name ?? "U")[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {comment.profiles?.full_name ?? "Member"}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {formatDate(comment.created_at, { month: "short", day: "numeric" })}
                  </span>
                </div>
                {currentUserId === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded p-1 text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-brand-light break-words">
                {comment.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center text-white text-xs font-semibold">
            M
          </div>
          <div className="flex-1">
            {error && (
              <p className="mb-2 text-xs text-red-600">{error}</p>
            )}
            <div className="flex gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <Button
                type="submit"
                size="sm"
                loading={isPending}
                disabled={!body.trim()}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-3d-hover p-4 text-center text-sm text-brand-muted">
          <Link href="/login" className="text-brand-gold hover:underline font-medium">
            Sign in
          </Link>{" "}
          to join the conversation
        </div>
      )}
    </section>
  );
}
