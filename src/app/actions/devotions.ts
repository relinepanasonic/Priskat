"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const devotionSchema = z.object({
  publish_date: z.string().min(1, "Date is required"),
  verse_reference: z.string().min(1, "Verse reference is required"),
  verse_text: z.string().min(1, "Verse text is required"),
  prayer_title: z.string().min(1, "Prayer title is required"),
  prayer_text: z.string().min(1, "Prayer text is required"),
});

export async function createDevotion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = devotionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase.from("daily_devotions" as any).insert(parsed.data);
  if (error) return { error: { _form: error.message } };

  revalidatePath("/admin/devotions");
  revalidatePath("/profile");
  redirect("/admin/devotions");
}

export async function updateDevotion(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = devotionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("daily_devotions" as any)
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: { _form: error.message } };

  revalidatePath("/admin/devotions");
  revalidatePath("/profile");
  redirect("/admin/devotions");
}

export async function deleteDevotion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_devotions" as any).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/devotions");
  revalidatePath("/profile");
}

