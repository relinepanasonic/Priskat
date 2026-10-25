import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignsClient, { type CampaignView } from "./CampaignsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kampanye" };

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: camps } = await supabase.from("campaigns" as any).select("*").eq("is_active", true).order("starts_on", { ascending: true });
  const list = (camps as any[]) ?? [];

  const { data: done } = await supabase.from("campaign_completions" as any).select("campaign_id").eq("user_id", user.id);
  const doneIds = new Set(((done as any[]) ?? []).map((d) => d.campaign_id));

  const views: CampaignView[] = await Promise.all(
    list.map(async (c) => {
      const [{ data: progress }, { data: community }] = await Promise.all([
        supabase.rpc("campaign_progress", { p_campaign: c.id }),
        supabase.rpc("campaign_community_total", { p_campaign: c.id }),
      ]);
      return {
        id: c.id, slug: c.slug, title: c.title, description: c.description, emoji: c.emoji ?? "🎯",
        starts_on: c.starts_on, ends_on: c.ends_on,
        reward: { frame: c.reward_frame, name_color: c.reward_name_color, title: c.reward_title, badge: c.reward_badge, points: c.reward_points },
        tasks: ((progress as any[]) ?? []).map((t) => ({ id: t.task_id, label: t.label, kind: t.kind, target: t.target, done: t.done })),
        communityTotal: typeof community === "number" ? community : 0,
        claimed: doneIds.has(c.id),
      };
    })
  );

  return <CampaignsClient campaigns={views} />;
}
