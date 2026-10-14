"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Permanently deletes the signed-in user's account and data. */
export async function deleteMyAccount(confirmation: string) {
  if (confirmation.trim().toUpperCase() !== "HAPUS") {
    return { success: false, error: "Ketik HAPUS untuk mengonfirmasi." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Silakan masuk terlebih dahulu." };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Layanan belum siap. Hubungi dukungan." };
  }

  const admin = createAdminClient();

  // Profile first (cascades to the user's posts, comments, likes), then the auth user.
  await admin.from("profiles").delete().eq("id", user.id);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("deleteMyAccount:", error);
    return { success: false, error: "Gagal menghapus akun. Hubungi dukungan." };
  }

  await supabase.auth.signOut();
  return { success: true };
}
