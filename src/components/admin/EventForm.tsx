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
  description: z.string().min(10),
  location: z.string().min(1),
  event_date: z.string().min(1),
  end_date: z.string().optional(),
  capacity: z.string().optional(),
  status: z.enum(["draft", "published", "cancelled"]),
});

type FormValues = z.infer<typeof schema>;

interface InitialValues extends Partial<FormValues> {
  id?: string;
  banner_image_url?: string | null;
}

interface Props {
  initialValues?: InitialValues;
  mode?: "create" | "edit";
}

function toLocalDatetime(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function EventForm({ initialValues, mode = "create" }: Props) {
  const router = useRouter();
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialValues?.banner_image_url ?? null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialValues?.banner_image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      location: initialValues?.location ?? "",
      event_date: toLocalDatetime(initialValues?.event_date),
      end_date: toLocalDatetime(initialValues?.end_date),
      capacity: initialValues?.capacity ? String(initialValues.capacity) : "",
      status: initialValues?.status ?? "draft",
    },
  });

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const url = await uploadImage(file, "event-banners", storagePath(user.id, file.name));
      setUploadedUrl(url);
      setBannerPreview(url);
    } catch {
      setServerError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const formData = new FormData();
    Object.entries({ ...data, banner_image_url: uploadedUrl }).forEach(
      ([k, v]) => v !== undefined && formData.append(k, v as string)
    );
    try {
      const { createEvent, updateEvent } = await import("@/app/actions/events");
      if (mode === "edit" && initialValues?.id) {
        await updateEvent(initialValues.id, formData);
      } else {
        await createEvent(formData);
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
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      {/* Banner Image */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Banner Image</label>
        {bannerPreview ? (
          <div className="relative h-48 rounded-xl overflow-hidden border border-stone-200">
            <Image src={bannerPreview} alt="Banner" fill className="object-cover" />
            <button type="button" onClick={() => { setBannerPreview(null); setUploadedUrl(""); }}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-blue transition-colors">
            {uploading ? <p className="text-sm text-stone-400">Uploading…</p> : (
              <>
                <ImagePlus className="h-8 w-8 text-stone-300 mb-2" />
                <p className="text-sm text-stone-400">Click to upload banner</p>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Title *</label>
        <input {...register("title")} placeholder="Event title" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Description *</label>
        <textarea {...register("description")} rows={5} placeholder="Event description…" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none resize-y" />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Start Date & Time *</label>
          <input {...register("event_date")} type="datetime-local" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
          {errors.event_date && <p className="mt-1 text-xs text-red-600">{errors.event_date.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">End Date & Time</label>
          <input {...register("end_date")} type="datetime-local" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Location *</label>
          <input {...register("location")} placeholder="Venue / address" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Capacity (leave blank = unlimited)</label>
          <input {...register("capacity")} type="number" min="1" placeholder="e.g. 100" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Status *</label>
        <select {...register("status")} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/events")}>Cancel</Button>
        <Button type="submit" loading={isSubmitting || uploading}>{mode === "edit" ? "Save Changes" : "Create Event"}</Button>
      </div>
    </form>
  );
}
