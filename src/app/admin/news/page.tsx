import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import type { NewsPost } from "@/lib/types/database.types";

export default async function AdminNewsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("news_posts")
    .select("id, title, category, status, published_at, created_at")
    .order("created_at", { ascending: false });

  const posts = data as Pick<NewsPost, "id" | "title" | "category" | "status" | "published_at" | "created_at">[] | null;

  const statusVariant = (status: string) => {
    if (status === "published") return "green";
    if (status === "scheduled") return "gold";
    return "gray";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">News Posts</h1>
          <p className="text-sm text-stone-500">{posts?.length ?? 0} total posts</p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-stone-100 bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-900 line-clamp-1">{post.title}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-stone-500">{post.category}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(post.status) as "green" | "gold" | "gray"}>
                    {post.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-stone-500">
                    {post.published_at
                      ? formatDate(post.published_at)
                      : formatDate(post.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/news/${post.id}/edit`}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-brand-blue-50 hover:text-brand-blue transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <AdminDeleteButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && (
          <div className="py-12 text-center text-stone-400 text-sm">
            No posts yet.{" "}
            <Link href="/admin/news/new" className="text-brand-blue hover:underline">
              Create your first post.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
