import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ReactionButton from "@/components/news/ReactionButton";
import CommentSection from "@/components/news/CommentSection";
import type { Metadata } from "next";
import type { NewsPost, Profile, NewsComment, NewsReaction } from "@/lib/types/database.types";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

type CommentWithProfile = NewsComment & {
  profiles: Pick<Profile, "full_name" | "avatar_url" | "username"> | null;
};

type ReactionWithProfile = NewsReaction & {
  profiles: Pick<Profile, "full_name"> | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("news_posts").select("title, body").eq("slug", slug).single();
  const post = data as Pick<NewsPost, "title" | "body"> | null;
  return { title: post?.title ?? "News", description: post?.body?.slice(0, 160) ?? "" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: postData } = await supabase
    .from("news_posts")
    .select(`*, profiles:author_id(full_name, avatar_url, username)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const post = postData as (NewsPost & { profiles: Pick<Profile, "full_name" | "avatar_url" | "username"> | null }) | null;
  if (!post) notFound();

  const [
    { data: commentsData },
    { data: reactionsData },
    { data: { user } }
  ] = await Promise.all([
    supabase
      .from("news_comments")
      .select("id, post_id, author_id, body, is_hidden, created_at, updated_at, profiles(full_name, avatar_url, username)")
      .eq("post_id", post.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("news_reactions")
      .select("id, post_id, user_id, reaction_type, created_at, profiles(full_name)")
      .eq("post_id", post.id),
    supabase.auth.getUser(),
  ]);

  const comments = (commentsData ?? []) as unknown as CommentWithProfile[];
  const reactions = (reactionsData ?? []) as unknown as ReactionWithProfile[];
  const userReaction = user ? reactions.find((r) => r.user_id === user.id) : null;
  const likers = reactions.map((r) => r.profiles?.full_name).filter(Boolean) as string[];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <header className="mb-8 text-center">
        {post.cover_image_url && (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-96">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="mb-4">
          <Badge variant="blue">{post.category}</Badge>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-stone-900 sm:text-5xl">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-3 text-sm text-stone-500">
          {post.profiles?.avatar_url ? (
            <Image
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600">
              {(post.profiles?.full_name ?? "U")[0]}
            </div>
          )}
          <span className="font-medium text-stone-700">
            {post.profiles?.full_name ?? "Admin"}
          </span>
          <span>•</span>
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDate(post.published_at ?? post.created_at)}
          </time>
        </div>
      </header>

      {/* Body */}
      <div
        className="news-body text-lg text-stone-700"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {/* Interactions */}
      <div className="mt-12 flex items-center gap-4 border-b border-t border-stone-100 py-4">
        <ReactionButton
          postId={post.id}
          initialCount={reactions.length}
          initialLiked={!!userReaction}
          userId={user?.id ?? null}
        />
      </div>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        initialComments={comments}
        currentUserId={user?.id ?? null}
      />
    </article>
  );
}
