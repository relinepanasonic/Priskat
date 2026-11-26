import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StorePageClient from "@/components/news/StorePageClient";
import type { MarketplaceProduct, MarketplaceReview, MarketplaceStore } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { p: prodId } = await searchParams;
  const db = createAdminClient() as any;
  const fallbackLogo = "https://apps.ruangiman.com/logo.png";

  const { data: store } = await db
    .from("marketplace_stores")
    .select("id, name, tagline, description, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) return { title: "Toko | Marketplace" };

  if (prodId) {
    const { data: prod } = await db
      .from("marketplace_products")
      .select("title, description, images")
      .eq("id", prodId)
      .eq("store_id", store.id)
      .maybeSingle();
    if (prod) {
      const img = prod.images?.[0] || store.logo_url || fallbackLogo;
      const desc = (prod.description || `${prod.title} di ${store.name} — Marketplace Ruang Iman`).slice(0, 160);
      return {
        title: `${prod.title} — ${store.name}`,
        description: desc,
        openGraph: {
          title: `${prod.title} — ${store.name}`,
          description: desc,
          siteName: "Ruang Iman",
          images: [{ url: img, width: 1000, height: 1000, alt: prod.title }],
        },
      };
    }
  }

  const img = store.logo_url || fallbackLogo;
  const desc = (store.tagline || store.description || `Kunjungi ${store.name} di Marketplace Ruang Iman`).slice(0, 160);
  return {
    title: `${store.name} — Marketplace`,
    description: desc,
    openGraph: {
      title: `${store.name} — Marketplace Ruang Iman`,
      description: desc,
      siteName: "Ruang Iman",
      images: [{ url: img, width: 1000, height: 1000, alt: store.name }],
    },
  };
}

export default async function MarketplaceStorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const { p: initialProductId } = await searchParams;
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("marketplace_stores")
    .select("*, owner:profiles!owner_id(full_name, nama_panggilan, avatar_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) notFound();

  const [productsRes, reviewsRes, profRes] = await Promise.all([
    supabase
      .from("marketplace_products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("marketplace_reviews")
      .select("*, author:profiles!author_id(full_name, nama_panggilan, avatar_url)")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(100),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const role = String(profRes.data?.role ?? "").toLowerCase();
  const isAdmin = ["founder", "superadmin", "admin", "moderator"].includes(role);

  return (
    <StorePageClient
      store={store as MarketplaceStore}
      initialProducts={(productsRes.data as MarketplaceProduct[] | null) ?? []}
      initialReviews={(reviewsRes.data as MarketplaceReview[] | null) ?? []}
      userId={user?.id ?? null}
      isAdmin={isAdmin}
      initialProductId={initialProductId ?? null}
    />
  );
}
