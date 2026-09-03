import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyBlogPost } from "@/lib/blog/generate";

// Triggered once a day by Vercel Cron (see vercel.json) — Vercel automatically
// sends `Authorization: Bearer $CRON_SECRET` when that env var is set, which is
// what we check below. Not linked from the UI — cron-only endpoint.
// Also callable manually (e.g. from the Vercel dashboard, or curl) with the same header.
export const maxDuration = 120;

async function runDailyGeneration() {
  // Step 1: Check env vars first — this is the most common failure
  const missingEnvs = [];
  if (!process.env.GROQ_API_KEY) missingEnvs.push("GROQ_API_KEY");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnvs.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnvs.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missingEnvs.length > 0) {
    return NextResponse.json({ error: `Missing environment variables: ${missingEnvs.join(", ")}` }, { status: 500 });
  }

  // Step 2: Generate the post
  let post: any, flaggedReason: any;
  try {
    const result = await generateDailyBlogPost();
    post = result.post;
    flaggedReason = result.flaggedReason;
  } catch (genErr: any) {
    console.error("Gemini generation failed:", genErr);
    return NextResponse.json({ error: `Gemini error: ${genErr.message}`, step: "generate" }, { status: 500 });
  }

  // Step 3: Save to Supabase
  const supabase = createAdminClient();

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
    return NextResponse.json({ error: `Supabase error: ${error.message}`, step: "insert" }, { status: 500 });
  }

  if (flaggedReason) {
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
