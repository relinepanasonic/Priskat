import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotsClient from "./BotsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bot" };

export default async function BotsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (String((me as { role?: string } | null)?.role ?? "").toLowerCase() !== "founder") redirect("/admin");
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_bot", true).eq("bot_ready", true);
  return <BotsClient ready={count ?? 0} />;
}
