import { createClient } from "@/lib/supabase/server";
import MarketplaceClient, { type MarketplaceItem } from "@/components/news/MarketplaceClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  const [itemsRes, profRes] = await Promise.all([
    supabase
      .from("marketplace_items")
      .select("*, seller:profiles!seller_id(full_name, nama_panggilan, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(100),
    user
      ? supabase.from("profiles").select("role, kota").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const needsSql = Boolean(itemsRes.error && /marketplace_items/i.test(itemsRes.error.message ?? ""));
  const items = (itemsRes.data as MarketplaceItem[] | null) ?? [];
  const role = String(profRes.data?.role ?? "").toLowerCase();
  const isAdmin = ["founder", "superadmin", "admin", "moderator"].includes(role);

  return (
    <MarketplaceClient
      initialItems={items}
      userId={user?.id ?? null}
      isAdmin={isAdmin}
      defaultCity={profRes.data?.kota ?? null}
      needsSql={needsSql}
    />
  );
}
