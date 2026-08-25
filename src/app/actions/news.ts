"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "scheduled", "published"]),
  published_at: z.string().optional(),
});

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { title, body, category, cover_image_url, status, published_at } =
    parsed.data;
  const slug = slugify(title) + "-" + Date.now().toString(36);

  const { error } = await supabase.from("news_posts" as any).insert({
    author_id: user.id,
    title,
    slug,
    body,
    category,
    cover_image_url: cover_image_url || null,
    status,
    published_at:
      status === "published"
        ? published_at || new Date().toISOString()
        : published_at || null,
  });

  if (error) return { error: { _form: error.message } };

  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { title, body, category, cover_image_url, status, published_at } =
    parsed.data;

  const { data: existing } = await supabase
    .from("news_posts")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("news_posts" as any)
    .update({
      title,
      body,
      category,
      cover_image_url: cover_image_url || null,
      status,
      published_at:
        status === "published" && !published_at
          ? new Date().toISOString()
          : published_at || null,
    })
    .eq("id", id);

  if (error) return { error: { _form: error.message } };

  revalidatePath("/news");
  revalidatePath(`/news/${existing?.slug}`);
  revalidatePath("/");
  redirect("/admin/news");
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/news");
  revalidatePath("/");
}

export async function toggleReaction(postId: string, userId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("news_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("news_reactions").delete().eq("id", existing.id);
    return { liked: false };
  } else {
    await supabase.from("news_reactions" as any).insert({
      post_id: postId,
      user_id: userId,
    });
    return { liked: true };
  }
}

export async function addComment(postId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to comment" };

  const { error } = await supabase.from("news_comments" as any).insert({
    post_id: postId,
    author_id: user.id,
    body: body.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/news/[slug]`, "page");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("news_comments")
    .delete()
    .eq("id", commentId);
  if (error) return { error: error.message };
}

export async function toggleHideComment(
  commentId: string,
  isHidden: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("news_comments" as any)
    .update({ is_hidden: isHidden })
    .eq("id", commentId);
  if (error) return { error: error.message };
}
