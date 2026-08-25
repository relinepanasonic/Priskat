import NewsPostForm from "@/components/admin/NewsPostForm";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">New Post</h1>
      <div className="rounded-2xl bg-white border border-stone-100 p-6">
        <NewsPostForm mode="create" />
      </div>
    </div>
  );
}
