import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DatabaseShell from "./DatabaseShell";

/** The Master Database holds every member's records: only the founder may open it. */
export default async function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (String(me?.role ?? "").toLowerCase() !== "founder") redirect("/admin");
  return <DatabaseShell>{children}</DatabaseShell>;
}
