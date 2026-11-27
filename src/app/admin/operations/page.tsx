import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import OperationsClient, { type PlatformMilestone, type StoreSummary } from "./OperationsClient";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const supabase = (await createClient()) as any;
  const lang = await getLanguage();

  const [milestonesRes, storesRes, productsRes, eventsRes, campaignsRes, botsRes] = await Promise.all([
    supabase.from("erp_platform_milestones").select("*").order("created_at", { ascending: true }),
    supabase
      .from("marketplace_stores")
      .select("id, slug, name, category, city, last_activity_at")
      .order("last_activity_at", { ascending: false })
      .limit(50),
    supabase.from("marketplace_products").select("store_id"),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_bot", true),
  ]);

  const needsSql = Boolean(milestonesRes.error && /erp_platform_milestones/i.test(milestonesRes.error.message ?? ""));
  const countMap = new Map<string, number>();
  for (const p of (productsRes.data as { store_id: string }[] | null) ?? []) {
    countMap.set(p.store_id, (countMap.get(p.store_id) ?? 0) + 1);
  }
  const stores: StoreSummary[] = ((storesRes.data as Omit<StoreSummary, "product_count">[] | null) ?? []).map((s) => ({
    ...s,
    product_count: countMap.get(s.id) ?? 0,
  }));

  return (
    <OperationsClient
      initialMilestones={(milestonesRes.data as PlatformMilestone[] | null) ?? []}
      stores={stores}
      stats={{
        events: eventsRes.count ?? 0,
        campaigns: campaignsRes.count ?? 0,
        bots: botsRes.count ?? 0,
        products: (productsRes.data as unknown[] | null)?.length ?? 0,
      }}
      needsSql={needsSql}
      lang={lang}
    />
  );
}
