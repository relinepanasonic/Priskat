export const MARKETPLACE_CATEGORIES = [
  "Semua",
  "Benda Rohani",
  "Buku & Alkitab",
  "Kuliner & UMKM",
  "Pakaian & Aksesoris",
  "Jasa",
  "Lainnya",
] as const;

export const MAX_STORE_PRODUCTS = 30;
export const MAX_PRODUCT_IMAGES = 5;

export type ProductVariant = {
  code: string;   // e.g. "M", "COK", "01"
  name: string;   // e.g. "Cokelat / M"
  price?: number; // optional override; falls back to product.price
  stock?: number; // optional override; falls back to product.stock
};

export type MarketplaceStore = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  logo_url: string | null;
  city: string | null;
  whatsapp: string | null;
  last_activity_at: string;
  created_at: string;
  owner?: { full_name: string | null; nama_panggilan: string | null; avatar_url: string | null } | null;
  product_count?: number;
};

export type MarketplaceProduct = {
  id: string;
  store_id: string;
  title: string;
  category: string;
  sku_id: string;
  variants: ProductVariant[];
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: { id: string; slug: string; name: string; city: string | null; whatsapp: string | null; owner_id: string; logo_url: string | null } | null;
};

export type MarketplaceReview = {
  id: string;
  store_id: string;
  product_id: string | null;
  author_id: string;
  rating: number;
  comment: string;
  created_at: string;
  author?: { full_name: string | null; nama_panggilan: string | null; avatar_url: string | null } | null;
};

export const rupiah = (n: number) =>
  n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "Hubungi penjual";

/** Formats Variant ID strictly as "SKU_ID.VARIANT_CODE" when both exist. */
export function formatVariantId(skuId: string, variantCode?: string | null): string {
  const s = (skuId || "").trim().toUpperCase();
  const v = (variantCode || "").trim().toUpperCase();
  if (s && v) return `${s}.${v}`;
  return s || v || "-";
}

export function slugifyStore(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || "toko"}-${rand}`;
}

export function waBuyLink(phone: string, storeName: string, productTitle: string, variantId?: string, variantName?: string, price?: number) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const lines = [
    `Shalom ${storeName}, saya ingin membeli produk di Marketplace Ruang Iman:`,
    `• Produk: ${productTitle}`,
    variantName ? `• Varian: ${variantName}` : "",
    variantId && variantId !== "-" ? `• Kode: ${variantId}` : "",
    price && price > 0 ? `• Harga: ${rupiah(price)}` : "",
  ].filter(Boolean);
  return `https://wa.me/${intl}?text=${encodeURIComponent(lines.join("\n"))}`;
}
