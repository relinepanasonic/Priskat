import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Newspaper } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import CategoryFilter from "@/components/news/CategoryFilter";
import Pagination from "@/components/ui/Pagination";
import { Suspense } from "react";
import type { NewsPost } from "@/lib/types/database.types";

export const revalidate = 60;

const PAGE_SIZE = 10;

const CATEGORIES = [
  "General",
  "Announcements",
  "Ministry",
  "Youth",
  "Events",
  "Testimony",
];

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageStr, category } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("news_posts")
    .select(
      "id, title, slug, cover_image_url, category, published_at, body",
      { count: "exact" }
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, count } = await query;
  const posts = data as Pick<NewsPost, "id" | "title" | "slug" | "cover_image_url" | "category" | "published_at" | "body">[] | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-gold">Community News</h1>
        <p className="mt-1 text-brand-muted">
          Stay updated with the latest from PriskatCFM
        </p>
      </div>

      <Suspense>
        <CategoryFilter categories={CATEGORIES} current={category} />
      </Suspense>

      {posts && posts.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
          <Suspense>
            <Pagination
              currentPage={page}
              totalCount={count ?? 0}
              pageSize={PAGE_SIZE}
            />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Newspaper className="h-12 w-12 text-brand-muted mb-3" />
          <p className="text-brand-muted">No news posts found.</p>
          {category && (
            <Link href="/news" className="mt-2 text-sm text-brand-gold hover:underline">
              Clear filter
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
