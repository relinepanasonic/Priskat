"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteMember(userId: string) {
  // Only signed-in admins may delete members (this action is callable from any browser)
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const callerRole = String(caller?.role ?? "").toLowerCase();
  if (!["founder", "superadmin", "admin"].includes(callerRole)) {
    return { success: false, error: "Forbidden" };
  }
  if (userId === user.id) {
    return { success: false, error: "Use Hapus Akun to delete your own account." };
  }

  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).single();
  const targetRole = String(target?.role ?? "").toLowerCase();
  if (targetRole === "founder") return { success: false, error: "The Founder account cannot be deleted." };
  if (targetRole === "superadmin" && callerRole !== "founder") {
    return { success: false, error: "Only the Founder can delete a Superadmin account." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Missing Supabase service role credentials" };
  }
  const admin = createAdminClient();

  // Delete from auth.users (cascades to public.profiles); delete the profile explicitly just in case
  await admin.from("profiles").delete().eq("id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/members");
  return { success: true };
}
