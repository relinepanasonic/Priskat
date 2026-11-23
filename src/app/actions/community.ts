"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function checkSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["founder", "superadmin"].includes(profile.role)) {
    return null;
  }
  return supabase;
}

export async function createCommunity(formData: FormData) {
  const supabase = await checkSuperAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const logo_url = formData.get("logo_url") as string;
  const vision = formData.get("vision") as string;
  const mission = formData.get("mission") as string;
  const motto = formData.get("motto") as string;
  const tagline = formData.get("tagline") as string;
  const is_public = formData.get("is_public") === "true";

  if (!name || !slug) return { error: "Name and Slug are required." };

  const { error } = await supabase.from("communities").insert({
    name,
    slug,
    description,
    logo_url,
    vision,
    mission,
    motto,
    tagline,
    is_public
  });

  if (error) return { error: error.message };
  
  revalidatePath("/admin/communities");
  return { success: true };
}

export async function updateCommunity(id: string, formData: FormData) {
  const supabase = await checkSuperAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const logo_url = formData.get("logo_url") as string;
  const vision = formData.get("vision") as string;
  const mission = formData.get("mission") as string;
  const motto = formData.get("motto") as string;
  const tagline = formData.get("tagline") as string;
  const is_public = formData.get("is_public") === "true";

  const { error } = await supabase.from("communities").update({
    name,
    slug,
    description,
    logo_url,
    vision,
    mission,
    motto,
    tagline,
    is_public
  }).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/communities");
  return { success: true };
}

export async function deleteCommunity(id: string) {
  const supabase = await checkSuperAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("communities").delete().eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/communities");
  return { success: true };
}

export async function addCommunityAdmin(communityId: string, userId: string, role: string) {
  const supabase = await checkSuperAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("community_admins").insert({
    community_id: communityId,
    user_id: userId,
    role
  });

  if (error) return { error: error.message };
  
  revalidatePath("/admin/communities");
  return { success: true };
}

export async function removeCommunityAdmin(id: string) {
  const supabase = await checkSuperAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("community_admins").delete().eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/communities");
  return { success: true };
}


/**
 * A community's own profile (not its address): only that community's Super admin, or the site's admins, may save it.
 * The database checks it too (community_superadmin_of).
 */
export async function updateCommunityProfile(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: ok } = await supabase.rpc("community_superadmin_of" as any, { p_community: id });
  if (ok !== true) return { error: "Hanya Super admin komunitas ini yang bisa mengubah profil." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Isi nama komunitas." };
  const { data, error } = await supabase
    .from("communities")
    .update({
      name,
      description: String(formData.get("description") ?? ""),
      logo_url: String(formData.get("logo_url") ?? "") || null,
      vision: String(formData.get("vision") ?? ""),
      mission: String(formData.get("mission") ?? ""),
      motto: String(formData.get("motto") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      is_public: formData.get("is_public") === "true",
    } as any)
    .eq("id", id)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Perubahan ditolak. Jalankan 133_community_event_levels.sql dulu." };
  revalidatePath("/admin/communities", "layout");
  revalidatePath("/camp", "layout");
  return { success: true };
}
