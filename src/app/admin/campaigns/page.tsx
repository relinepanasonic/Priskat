import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignAdminClient from "./CampaignAdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kampanye" };

/** Founder / admins create campaigns: dates, tasks, rewards and an optional quiz. */
export default async function AdminCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["founder", "superadmin", "admin"].includes(String(me?.role ?? ""))) redirect("/admin");

  const { data } = await supabase.from("campaigns" as any).select("id, slug, title, emoji, starts_on, ends_on, is_active, reward_frame, reward_title").order("starts_on", { ascending: false });
  return <CampaignAdminClient existing={((data as any[]) ?? []) as any} />;
}
