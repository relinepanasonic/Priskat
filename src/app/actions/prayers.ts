"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { PrayerCategory } from "@/lib/types/database.types";
import { slugify } from "@/lib/utils";

const prayerSchema = z.object({
  title_id: z.string().min(2),
  title_en: z.string().min(2),
  body_id: z.string().min(10),
  body_en: z.string().min(10),
  category: z.string() as z.ZodType<PrayerCategory>,
  sort_order: z.coerce.number().default(0),
  is_published: z.string().optional(),
});

export async function createPrayer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = prayerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const slug = slugify(parsed.data.title_id) + "-" + Date.now().toString(36);

  const { error } = await supabase.from("prayers" as any).insert({
    ...parsed.data,
    slug,
    is_published: parsed.data.is_published === "true",
  });

  if (error) return { error: { _form: error.message } };

  revalidatePath("/prayers");
  revalidatePath("/admin/prayers");
  redirect("/admin/prayers");
}

export async function updatePrayer(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = prayerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("prayers" as any)
    .update({ ...parsed.data, is_published: parsed.data.is_published === "true" })
    .eq("id", id);

  if (error) return { error: { _form: error.message } };

  revalidatePath("/prayers");
  revalidatePath("/admin/prayers");
  redirect("/admin/prayers");
}

export async function deletePrayer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("prayers" as any).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/prayers");
  revalidatePath("/admin/prayers");
}
