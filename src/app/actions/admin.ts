"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function adminUpdateMember(
  memberId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!callerProfile || !["founder", "superadmin", "admin", "moderator"].includes(callerProfile.role)) {
    return { error: "Forbidden" };
  }

  const role = formData.get("role") as string;
  const gender = formData.get("gender") as string;
  const modules = formData.getAll("modules") as string[];

  // Only founder can assign superadmin role
  if (role === "superadmin" && callerProfile.role !== "founder") {
    return { error: "Only the Founder can assign the Superadmin role." };
  }

  // Nobody can change a founder's role
  const { data: targetProfile } = await supabase.from("profiles").select("role").eq("id", memberId).single();
  if (targetProfile?.role === "founder") {
    return { error: "The Founder's role cannot be changed." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: role || "member",
      gender: gender || null,
      completed_modules: modules,
    } as any)
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  return { success: true };
}

export async function adminDeleteMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!callerProfile || !["founder", "superadmin", "admin"].includes(callerProfile.role)) {
    return { error: "Forbidden" };
  }

  // Check the target's role — only founder can delete superadmin or founder accounts
  const { data: targetProfile } = await supabase.from("profiles").select("role").eq("id", memberId).single();
  if (targetProfile?.role === "founder") {
    return { error: "The Founder account cannot be deleted." };
  }
  if (targetProfile?.role === "superadmin" && callerProfile.role !== "founder") {
    return { error: "Only the Founder can delete a Superadmin account." };
  }

  // To truly delete the user, we need the Service Role Key.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
    const { error } = await adminSupabase.auth.admin.deleteUser(memberId);
    if (error) return { error: error.message };
  } else {
    // Fallback: Just delete the profile, which effectively removes them from the community.
    const { error } = await supabase.from("profiles").delete().eq("id", memberId);
    if (error) return { error: error.message };
  }
  
  revalidatePath("/admin/members");
  return { success: true };
}

