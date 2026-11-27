export const MARKETPLACE_CATEGORIES = [
  "Semua",
  "Benda Rohani",
  "Buku & Alkitab",
  "Kuliner & UMKM",
  "Pakaian & Aksesoris",
  "Jasa",
  "Lainnya",
] as const;

const CATEGORY_EN: Record<string, string> = {
  "Semua": "All",
  "Benda Rohani": "Religious Items",
  "Buku & Alkitab": "Books & Bible",
  "Kuliner & UMKM": "Food & Local Goods",
  "Pakaian & Aksesoris": "Apparel & Accessories",
  "Jasa": "Services",
  "Lainnya": "Others",
};

export function categoryLabel(cat: string, lang: "id" | "en" = "id"): string {
  return lang === "en" ? (CATEGORY_EN[cat] ?? cat) : cat;
}

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

/** Auto-generates a unique, trackable SKU ID such as "RI-BD-4K9M". */
export function generateAutoSku(storeName: string, existingSkus: string[] = []): string {
  const words = storeName
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let prefix = "";
  if (words.length >= 2) {
    prefix = (words[0][0] + words[1][0] + (words[2]?.[0] ?? "")).toUpperCase();
  } else if (words.length === 1) {
    prefix = words[0].slice(0, 3).toUpperCase();
  } else {
    prefix = "ST";
  }
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const taken = new Set(existingSkus.map((s) => s.toUpperCase()));
  for (let attempt = 0; attempt < 20; attempt++) {
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const candidate = `RI-${prefix}-${rand}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `RI-${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
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

const FAV_STORAGE_KEY = "ri_marketplace_favs_v1";

export function getFavoriteProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteProductId(productId: string): string[] {
  const current = getFavoriteProductIds();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [productId, ...current];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("ri-marketplace-favs"));
    } catch {
      // ignore storage quota errors
    }
  }
  return next;
}
