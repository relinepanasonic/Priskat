import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";
import { Newspaper } from "lucide-react";
import type { NewsPost } from "@/lib/types/database.types";

interface Props {
  post: Pick<
    NewsPost,
    "id" | "slug" | "title" | "cover_image_url" | "category" | "published_at" | "body"
  >;
}

export default function NewsCard({ post }: Props) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-brand-border bg-brand-surface shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="relative h-44 bg-brand-bg flex-shrink-0">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Newspaper className="h-12 w-12 text-brand-gold-200" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="blue">{post.category}</Badge>
          {post.published_at && (
            <span className="text-xs text-brand-muted">
              {formatDate(post.published_at)}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-white group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        {post.body && (
          <p className="mt-2 text-sm text-brand-muted line-clamp-2">
            {truncate(post.body.replace(/<[^>]*>/g, ""), 120)}
          </p>
        )}
        <div className="mt-3 text-xs font-medium text-brand-gold group-hover:text-brand-gold-500">
          Read more →
        </div>
      </div>
    </Link>
  );
}
