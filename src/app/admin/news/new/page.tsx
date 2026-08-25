import NewsPostForm from "@/components/admin/NewsPostForm";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">New Post</h1>
      <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
        <NewsPostForm mode="create" />
      </div>
    </div>
  );
}
