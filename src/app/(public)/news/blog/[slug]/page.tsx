import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  author_name: string;
  published_at: string;
  updated_at: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruangiman.app";

async function getPost(slug: string): Promise<BlogPostRow | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "slug, title, excerpt, content, meta_description, cover_image_url, category, tags, author_name, published_at, updated_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as BlogPostRow) ?? null;
}

// Minimal Markdown -> HTML for our own generated content (## headings, paragraphs).
// The generator only ever produces headings + plain paragraphs, so this stays deliberately small.
function renderMarkdown(md: string): string {
  return md
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("## ")) {
        return `<h2>${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith("# ")) {
        return `<h2>${trimmed.slice(2)}</h2>`;
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };

  const url = `${SITE_URL}/news/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.meta_description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.meta_description,
      url,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  const url = `${SITE_URL}/news/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author_name },
    publisher: { "@type": "Organization", name: "Ruang Iman" },
    mainEntityOfPage: url,
    ...(post.cover_image_url ? { image: [post.cover_image_url] } : {}),
  };

  return (
    <article className="mx-auto max-w-2xl p-4 sm:p-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/news/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Blog
      </Link>

      <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
        {post.category.replace(/-/g, " ")}
      </span>
      <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{post.title}</h1>
      <div className="mt-2 flex items-center gap-2 text-xs text-brand-muted">
        <span>{post.author_name}</span>
        <span>&middot;</span>
        <time dateTime={post.published_at}>
          {new Date(post.published_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}

      <div
        className="mt-6 space-y-4 leading-relaxed text-gray-200 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-brand-gold [&_p]:text-gray-200"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      {post.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[#333] pt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#1a1d24] px-3 py-1 text-xs text-brand-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
