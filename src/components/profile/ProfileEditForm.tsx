"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import Button from "@/components/ui/Button";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/database.types";

const schema = z.object({
  full_name: z.string().min(2),
  bio: z.string().max(300).optional(),
  skills: z.string().optional(),
  interests: z.string().optional(),
  gender: z.enum(["male", "female"]).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profile: Profile;
}

export default function ProfileEditForm({ profile }: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      bio: profile.bio ?? "",
      skills: profile.skills?.join(", ") ?? "",
      interests: profile.interests?.join(", ") ?? "",
      gender: profile.gender ?? null,
    },
  });

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, "avatars", storagePath(profile.id, file.name));
      setAvatarUrl(url);
      const supabase = createClient();
      await supabase.from("profiles").update({ avatar_url: url } as any).eq("id", profile.id);
    } catch {
      setError("Avatar upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    const skillsArr = data.skills
      ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const interestsArr = data.interests
      ? data.interests.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        bio: data.bio ?? "",
        skills: skillsArr,
        interests: interestsArr,
        gender: data.gender,
      } as any)
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    reset(data);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Profile updated successfully!
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center text-white text-2xl font-bold">
              {profile.full_name[0]}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-brand-gold p-1.5 text-white hover:bg-brand-gold-500 transition-colors">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-medium text-white">{profile.full_name}</p>
          <p className="text-sm text-brand-muted">@{profile.username}</p>
          {uploading && <p className="text-xs text-brand-muted mt-1">Uploadingâ€¦</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Full Name *</label>
        <input {...register("full_name")} className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
        {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Bio <span className="text-brand-muted font-normal">(max 300 chars)</span></label>
        <textarea {...register("bio")} rows={3} placeholder="Tell the community about yourselfâ€¦" className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none resize-none" />
        {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Gender</label>
        <select {...register("gender")} className="w-full input-3d text-sm">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Skills <span className="text-brand-muted font-normal">(comma-separated)</span></label>
        <input {...register("skills")} placeholder="e.g. Music, Teaching, Design" className="w-full input-3d text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Interests <span className="text-brand-muted font-normal">(comma-separated)</span></label>
        <input {...register("interests")} placeholder="e.g. Prayer, Worship, Youth Ministry" className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>{success && !isDirty ? "Saved" : "Save Profile"}</Button>
      </div>
    </form>
  );
}

