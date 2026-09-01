"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    supabase,
    user,
    ok: String(prof?.role ?? "").toLowerCase() === "founder",
  };
}

export async function createPremiumBanner(input: {
  image_url: string;
  link_url?: string;
  title?: string;
  sort_order?: number;
}) {
  const { supabase, user, ok } = await requireFounder();
  if (!ok) return { error: "Founder only" };
  if (!input.image_url) return { error: "Image required" };

  const { error } = await supabase.from("premium_banners").insert({
    image_url: input.image_url,
    link_url: input.link_url?.trim() || null,
    title: input.title?.trim() || null,
    sort_order: input.sort_order ?? 0,
    created_by: user!.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/news/events");
  revalidatePath("/admin/upload/premium-banner");
  return { ok: true };
}

export async function togglePremiumBanner(id: string, isActive: boolean) {
  const { supabase, ok } = await requireFounder();
  if (!ok) return { error: "Founder only" };
  const { error } = await supabase
    .from("premium_banners")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/news/events");
  revalidatePath("/admin/upload/premium-banner");
  return { ok: true };
}

export async function deletePremiumBanner(id: string) {
  const { supabase, ok } = await requireFounder();
  if (!ok) return { error: "Founder only" };
  const { error } = await supabase
    .from("premium_banners")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/news/events");
  revalidatePath("/admin/upload/premium-banner");
  return { ok: true };
}
