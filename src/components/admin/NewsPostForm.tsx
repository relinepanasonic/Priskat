"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { uploadImage, storagePath } from "@/lib/upload";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  category: z.string().min(1),
  status: z.enum(["draft", "scheduled", "published"]),
  published_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  "General",
  "Announcements",
  "Ministry",
  "Youth",
  "Events",
  "Testimony",
];

interface Props {
  initialValues?: Partial<FormValues & { cover_image_url?: string | null; id?: string }>;
  mode?: "create" | "edit";
}

export default function NewsPostForm({ initialValues, mode = "create" }: Props) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialValues?.cover_image_url ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(
    initialValues?.cover_image_url ?? ""
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      body: initialValues?.body ?? "",
      category: initialValues?.category ?? "General",
      status: initialValues?.status ?? "draft",
      published_at: initialValues?.published_at ?? "",
    },
  });

  const status = watch("status");

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const path = storagePath(user.id, file.name);
      const url = await uploadImage(file, "news-covers", path);
      setUploadedUrl(url);
      setCoverPreview(url);
    } catch (err) {
      setServerError("Image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const formData = new FormData();
    Object.entries({ ...data, cover_image_url: uploadedUrl }).forEach(
      ([k, v]) => v !== undefined && formData.append(k, v as string)
    );

    try {
      const { createPost, updatePost } = await import("@/app/actions/news");
      if (mode === "edit" && initialValues?.id) {
        await updatePost(initialValues.id, formData);
      } else {
        await createPost(formData);
      }
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setServerError(err.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Cover Image */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Cover Image
        </label>
        <div className="relative">
          {coverPreview ? (
            <div className="relative h-48 rounded-xl overflow-hidden border border-stone-200">
              <Image src={coverPreview} alt="Cover" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setCoverPreview(null); setUploadedUrl(""); }}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-blue transition-colors">
              {uploading ? (
                <p className="text-sm text-stone-400">Uploading…</p>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-stone-300 mb-2" />
                  <p className="text-sm text-stone-400">Click to upload cover image</p>
                  <p className="text-xs text-stone-300 mt-1">Max 2MB · Auto-compressed</p>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Title *</label>
        <input
          {...register("title")}
          placeholder="Post title"
          className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Category *</label>
        <select
          {...register("category")}
          className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Body */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Body (HTML supported) *
        </label>
        <textarea
          {...register("body")}
          rows={14}
          placeholder="Write your post content here…"
          className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-mono focus:border-brand-blue focus:outline-none resize-y"
        />
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Status *</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>
        {(status === "scheduled" || status === "published") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Publish Date/Time
            </label>
            <input
              {...register("published_at")}
              type="datetime-local"
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/news")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting || uploading}>
          {mode === "edit" ? "Save Changes" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
