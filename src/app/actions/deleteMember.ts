"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function deleteMember(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: "Missing Supabase service role credentials" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Delete from auth.users (which cascades to public.profiles if configured, 
  // but let's delete from profiles explicitly just in case)
  await supabase.from("profiles").delete().eq("id", userId);
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/members");
  return { success: true };
}

