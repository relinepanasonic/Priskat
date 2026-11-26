import { createClient } from "@/lib/supabase/server";
import MarketplaceClient from "@/components/news/MarketplaceClient";
import type { MarketplaceProduct, MarketplaceStore } from "@/lib/marketplace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  const [storesRes, productsRes, profRes] = await Promise.all([
    supabase
      .from("marketplace_stores")
      .select("*, owner:profiles!owner_id(full_name, nama_panggilan, avatar_url)")
      .order("last_activity_at", { ascending: false })
      .limit(100),
    supabase
      .from("marketplace_products")
      .select("*, store:marketplace_stores!store_id(id, slug, name, city, whatsapp, owner_id, logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(120),
    user
      ? supabase.from("profiles").select("kota").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const needsSql = Boolean(storesRes.error && /marketplace_stores/i.test(storesRes.error.message ?? ""));
  const rawStores = (storesRes.data as MarketplaceStore[] | null) ?? [];
  const products = (productsRes.data as MarketplaceProduct[] | null) ?? [];

  // Count products per store
  const countMap = new Map<string, number>();
  for (const p of products) countMap.set(p.store_id, (countMap.get(p.store_id) ?? 0) + 1);
  const stores = rawStores.map((s) => ({ ...s, product_count: countMap.get(s.id) ?? 0 }));
  const myStore = user ? stores.find((s) => s.owner_id === user.id) ?? null : null;

  return (
    <MarketplaceClient
      initialStores={stores}
      initialProducts={products}
      myStore={myStore}
      userId={user?.id ?? null}
      defaultCity={profRes.data?.kota ?? null}
      needsSql={needsSql}
    />
  );
}
