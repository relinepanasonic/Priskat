"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleReaction } from "@/app/actions/news";
import Link from "next/link";

interface Props {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  userId: string | null;
}

export default function ReactionButton({
  postId,
  initialCount,
  initialLiked,
  userId,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, updateOptimistic] = useOptimistic(
    { count: initialCount, liked: initialLiked },
    (state, newLiked: boolean) => ({
      count: newLiked ? state.count + 1 : state.count - 1,
      liked: newLiked,
    })
  );

  function handleClick() {
    if (!userId) return;
    const newLiked = !optimisticState.liked;
    startTransition(async () => {
      updateOptimistic(newLiked);
      await toggleReaction(postId, userId);
    });
  }

  if (!userId) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-muted hover:border-red-300 hover:text-red-500 transition-colors"
      >
        <Heart className="h-4 w-4" />
        <span>{optimisticState.count} likes — sign in to react</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticState.liked ? "Unlike" : "Like"}
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
        optimisticState.liked
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-brand-border text-brand-muted hover:border-red-200 hover:text-red-500",
      ].join(" ")}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${
          optimisticState.liked ? "fill-current scale-110" : ""
        }`}
      />
      <span>
        {optimisticState.count} {optimisticState.count === 1 ? "like" : "likes"}
      </span>
    </button>
  );
}
