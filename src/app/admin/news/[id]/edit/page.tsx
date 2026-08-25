import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import NewsPostForm from "@/components/admin/NewsPostForm";
import type { NewsPost } from "@/lib/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .single();

  const post = data as NewsPost | null;

  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Post</h1>
      <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
        <NewsPostForm
          mode="edit"
          initialValues={{
            id: post.id,
            title: post.title,
            body: post.body,
            category: post.category,
            status: post.status,
            published_at: post.published_at ?? undefined,
            cover_image_url: post.cover_image_url,
          }}
        />
      </div>
    </div>
  );
}
