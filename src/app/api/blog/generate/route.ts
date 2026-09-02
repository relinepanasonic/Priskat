import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyBlogPost } from "@/lib/blog/generate";

// Triggered once a day by Vercel Cron (see vercel.json) — Vercel automatically
// sends `Authorization: Bearer $CRON_SECRET` when that env var is set, which is
// what we check below. Not linked from the UI — cron-only endpoint.
// Also callable manually (e.g. from the Vercel dashboard, or curl) with the same header.
export const maxDuration = 120;

async function runDailyGeneration() {
  const { post, flaggedReason } = await generateDailyBlogPost();
  const supabase = createAdminClient();

  // Avoid a duplicate slug (e.g. if the job is triggered twice in one day).
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", post.slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ skipped: true, reason: "Post for today already exists", slug: post.slug });
  }

  const status = flaggedReason ? "flagged" : "published";

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      meta_description: post.meta_description,
      category: post.category,
      tags: post.tags,
      status,
      source: "ai_daily",
      author_name: "CFM Editorial",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (flaggedReason) {
    // Held back for manual review instead of going live — visible only to admins.
    return NextResponse.json({ flagged: true, reason: flaggedReason, post: data });
  }

  return NextResponse.json({ published: true, post: data });
}

function isAuthorized(request: Request): boolean {
  if (!process.env.CRON_SECRET) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await runDailyGeneration();
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
