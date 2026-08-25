import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { Profile } from "@/lib/types/database.types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const profile = data as Pick<Profile, "role" | "full_name"> | null;

  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar role={profile.role} fullName={profile.full_name} />
      <div className="flex-1 min-w-0">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
