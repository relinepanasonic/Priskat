import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Blog Katolik",
  description:
    "Artikel harian seputar iman Katolik: orang kudus, sejarah Gereja, katekese, dan kehidupan komunitas Katolik di Indonesia — dari Ruang Iman.",
};

export const revalidate = 3600; // list page can lag an hour behind a fresh post

type BlogListRow = {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  published_at: string;
};

async function getPublishedPosts(): Promise<BlogListRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);
  return (data as BlogListRow[]) ?? [];
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  if (posts.length === 0) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface border border-[#333] shadow-3d-inset">
          <Newspaper className="h-10 w-10 text-brand-gold animate-pulse" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white tracking-wide">CFM Blog</h2>
        <p className="mb-8 max-w-md text-brand-muted">
          Artikel pertama sedang disiapkan — kembali lagi besok!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/news/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#333] bg-brand-surface transition hover:border-brand-gold"
          >
            {post.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-[#1a1d24]">
                <Newspaper className="h-10 w-10 text-brand-gold/60" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-gold">
                {post.category.replace(/-/g, " ")}
              </span>
              <h3 className="font-bold text-white group-hover:text-brand-gold line-clamp-2">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-sm text-brand-muted">{post.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-2 text-xs text-brand-muted">
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
