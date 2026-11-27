"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import {
  categoryLabel,
  getFavoriteProductIds,
  MARKETPLACE_CATEGORIES,
  rupiah,
  slugifyStore,
  toggleFavoriteProductId,
  type MarketplaceProduct,
  type MarketplaceStore,
} from "@/lib/marketplace";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Marketplace Hub (/news/marketplace):
 *   1. Store Cards sorted by last_activity_at desc (editing store/product or receiving a review bumps store to top)
 *   2. Category filter + Unified Search (searches both Stores and Products)
 *   3. Random Product Discovery when search is empty and category is "Semua"
 *   4. "Buka Toko" / "Toko Saya" modal for any Ruang Iman user to open their own store
 */
export default function MarketplaceClient({
  initialStores,
  initialProducts,
  myStore: initialMyStore,
  userId,
  defaultCity,
  needsSql = false,
  lang = "id",
}: {
  initialStores: MarketplaceStore[];
  initialProducts: MarketplaceProduct[];
  myStore: MarketplaceStore | null;
  userId: string | null;
  defaultCity?: string | null;
  needsSql?: boolean;
  lang?: "id" | "en";
}) {
  const isEn = lang === "en";
  const router = useRouter();
  const db = () => createClient() as any;

  const [stores, setStores] = useState<MarketplaceStore[]>(initialStores);
  const [myStore, setMyStore] = useState<MarketplaceStore | null>(initialMyStore);
  const [category, setCategory] = useState<string>("Semua");
  const [q, setQ] = useState("");
  const [randomProducts, setRandomProducts] = useState<MarketplaceProduct[]>(initialProducts.slice(0, 12));
  const [favIds, setFavIds] = useState<string[]>([]);
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Shuffle random products on the client mount so each visit shows a fresh fair discovery mix
  useEffect(() => {
    setRandomProducts(shuffle(initialProducts).slice(0, 12));
  }, [initialProducts]);

  useEffect(() => {
    const sync = () => setFavIds(getFavoriteProductIds());
    sync();
    window.addEventListener("ri-marketplace-favs", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ri-marketplace-favs", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function onToggleFav(productId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavIds(toggleFavoriteProductId(productId));
  }

  const favoriteProducts = useMemo(() => {
    if (favIds.length === 0) return [];
    const byId = new Map(initialProducts.map((p) => [p.id, p]));
    return favIds.map((id) => byId.get(id)).filter((p): p is MarketplaceProduct => Boolean(p));
  }, [favIds, initialProducts]);

  // Create/Edit Store Modal
  const [storeModal, setStoreModal] = useState(false);
  const [name, setName] = useState(myStore?.name ?? "");
  const [tagline, setTagline] = useState(myStore?.tagline ?? "");
  const [storeCat, setStoreCat] = useState(myStore?.category ?? "Benda Rohani");
  const [city, setCity] = useState(myStore?.city ?? defaultCity ?? "");
  const [whatsapp, setWhatsapp] = useState(myStore?.whatsapp ?? "");
  const [description, setDescription] = useState(myStore?.description ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(myStore?.logo_url ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = q.trim().toLowerCase();
  const isDefaultBrowse = !query && category === "Semua";

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (category !== "Semua" && s.category !== category) {
        // Also keep store if it has products in that category
        const hasCatProd = initialProducts.some((p) => p.store_id === s.id && p.category === category);
        if (!hasCatProd) return false;
      }
      if (!query) return true;
      const storeHit =
        s.name.toLowerCase().includes(query) ||
        (s.tagline ?? "").toLowerCase().includes(query) ||
        (s.city ?? "").toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query);
      const prodHit = initialProducts.some(
        (p) =>
          p.store_id === s.id &&
          (p.title.toLowerCase().includes(query) ||
            (p.sku_id ?? "").toLowerCase().includes(query) ||
            (p.description ?? "").toLowerCase().includes(query)),
      );
      return storeHit || prodHit;
    });
  }, [stores, initialProducts, category, query]);

  const filteredProducts = useMemo(() => {
    if (isDefaultBrowse) return randomProducts;
    return initialProducts.filter((p) => {
      if (category !== "Semua" && p.category !== category) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        (p.sku_id ?? "").toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query) ||
        (p.store?.name ?? "").toLowerCase().includes(query) ||
        (p.variants ?? []).some((v) => v.name.toLowerCase().includes(query) || v.code.toLowerCase().includes(query))
      );
    });
  }, [isDefaultBrowse, randomProducts, initialProducts, category, query]);

  function openStoreModal() {
    setName(myStore?.name ?? "");
    setTagline(myStore?.tagline ?? "");
    setStoreCat(myStore?.category ?? "Benda Rohani");
    setCity(myStore?.city ?? defaultCity ?? "");
    setWhatsapp(myStore?.whatsapp ?? "");
    setDescription(myStore?.description ?? "");
    setLogoFile(null);
    setLogoPreview(myStore?.logo_url ?? null);
    setError(null);
    setStoreModal(true);
  }

  function onPickLogo(file: File | null) {
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  async function saveStore(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!name.trim()) { setError("Nama toko wajib diisi."); return; }
    setBusy(true);
    setError(null);
    try {
      let logoUrl = myStore?.logo_url ?? null;
      if (logoFile) {
        const compressed = await imageCompression(logoFile, {
          maxSizeMB: 0.35,
          maxWidthOrHeight: 800,
          initialQuality: 0.8,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const path = `${userId}/store-${Date.now()}.webp`;
        const up = await db().storage.from("marketplace").upload(path, compressed, { contentType: "image/webp" });
        if (up.error) throw new Error("Logo belum bisa diunggah.");
        logoUrl = db().storage.from("marketplace").getPublicUrl(path).data.publicUrl;
      }

      if (myStore) {
        const { data, error: uErr } = await db()
          .from("marketplace_stores")
          .update({
            name: name.trim(),
            tagline: tagline.trim() || null,
            category: storeCat,
            city: city.trim() || null,
            whatsapp: whatsapp.trim() || null,
            description: description.trim() || null,
            logo_url: logoUrl,
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", myStore.id)
          .select("*")
          .single();
        if (uErr || !data) throw new Error(uErr?.message || "Toko belum tersimpan.");
        const updated = { ...myStore, ...(data as MarketplaceStore) };
        setMyStore(updated);
        setStores((prev) => [updated, ...prev.filter((s) => s.id !== updated.id)]);
        setStoreModal(false);
        router.push(`/news/marketplace/${updated.slug}`);
      } else {
        const slug = slugifyStore(name.trim());
        const { data, error: iErr } = await db()
          .from("marketplace_stores")
          .insert({
            owner_id: userId,
            slug,
            name: name.trim(),
            tagline: tagline.trim() || null,
            category: storeCat,
            city: city.trim() || null,
            whatsapp: whatsapp.trim() || null,
            description: description.trim() || null,
            logo_url: logoUrl,
            last_activity_at: new Date().toISOString(),
          })
          .select("*")
          .single();
        if (iErr || !data) throw new Error(iErr?.message || "Toko belum bisa dibuat.");
        const created = { ...(data as MarketplaceStore), product_count: 0 };
        setMyStore(created);
        setStores((prev) => [created, ...prev]);
        setStoreModal(false);
        router.push(`/news/marketplace/${created.slug}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 px-0 py-1 md:space-y-7 md:p-6">
      {/* Header — Buka Toko Gratis sits at the top */}
      <div className="space-y-3 border-b border-white/10 pb-4 md:pb-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            {isEn ? "Community Market" : "Pasar Umat"}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFavOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                showFavOnly
                  ? "border-rose-500/60 bg-rose-500/20 text-rose-300"
                  : "border-white/15 bg-white/5 text-brand-light hover:border-rose-400/50 hover:text-rose-300"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${showFavOnly || favIds.length > 0 ? "fill-rose-400 text-rose-400" : ""}`} />
              {isEn ? "Favorites" : "Favorit"}{favIds.length > 0 ? ` (${favIds.length})` : ""}
            </button>
            {userId ? (
              myStore ? (
                <>
                  <Link
                    href={`/news/marketplace/${myStore.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark shadow-md shadow-brand-gold/15 transition hover:bg-brand-gold-hover"
                  >
                    <Store className="h-3.5 w-3.5" /> {isEn ? "My Store" : "Toko Saya"}
                  </Link>
                  <button
                    type="button"
                    onClick={openStoreModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-brand-light hover:border-brand-gold/40 hover:text-white"
                  >
                    {isEn ? "Edit Store" : "Edit Toko"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openStoreModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark shadow-md shadow-brand-gold/15 transition hover:bg-brand-gold-hover"
                >
                  <Store className="h-3.5 w-3.5" /> {isEn ? "Open Free Store" : "Buka Toko Gratis"}
                </button>
              )
            ) : (
              <Link
                href="/login?next=/news/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-3.5 py-2 text-xs font-bold text-brand-gold hover:bg-brand-gold/20"
              >
                {isEn ? "Sign in to open a store" : "Masuk untuk buka toko"}
              </Link>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {isEn ? "Ruang Iman Marketplace" : "Marketplace Ruang Iman"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted md:text-sm">
            {isEn ? "Let's support one another and share blessings among brothers and sisters in faith." : "Mari saling membantu dan berbagi rezeki sesama saudara seiman."}
          </p>
        </div>
      </div>

      {needsSql && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          Jalankan <code>supabase/146_marketplace_stores.sql</code> di Supabase SQL Editor untuk mengaktifkan Toko, Produk, dan Ulasan Marketplace.
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isEn ? "Search stores, products, SKU, or city..." : "Cari nama toko, produk, SKU, atau kota..."}
            className="w-full rounded-xl border border-white/10 bg-[#12151b] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {MARKETPLACE_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setShowFavOnly(false);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-gold text-brand-dark shadow-sm"
                    : "border border-white/10 bg-[#12151b] text-brand-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {categoryLabel(c, lang)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorit Menu View */}
      {showFavOnly ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
              <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
              {isEn ? "My Favorite Products" : "Produk Favorit Saya"} ({favoriteProducts.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowFavOnly(false)}
              className="text-xs font-semibold text-brand-gold hover:underline"
            >
              {isEn ? "View all marketplace" : "Lihat semua marketplace"}
            </button>
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#12151b] px-6 py-12 text-center">
              <Heart className="mx-auto h-9 w-9 text-rose-400/40" />
              <p className="mt-2.5 text-sm font-semibold text-white">{isEn ? "No favorite products yet" : "Belum ada produk favorit"}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {isEn ? "Tap the heart icon on any product you like to save it here." : "Ketuk ikon hati pada produk yang kamu suka untuk menyimpannya di sini."}
              </p>
              <button
                type="button"
                onClick={() => setShowFavOnly(false)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark hover:bg-brand-gold-hover"
              >
                {isEn ? "Explore Products" : "Jelajahi Produk"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {favoriteProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/news/marketplace/${p.store?.slug ?? ""}?p=${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/45 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#0c0e13]">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-brand-gold/35" />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-brand-light backdrop-blur-sm">
                      {p.category}
                    </span>
                    <button
                      type="button"
                      aria-label="Hapus dari Favorit"
                      onClick={(e) => onToggleFav(p.id, e)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/90 text-white backdrop-blur-sm transition hover:bg-rose-600"
                    >
                      <Heart className="h-3.5 w-3.5 fill-white" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-brand-gold">
                      {p.title}
                    </h4>
                    <p className="mt-1.5 text-sm font-bold text-brand-gold">{rupiah(p.price)}</p>
                    <div className="mt-auto flex items-center justify-between gap-1 pt-2 text-[11px] text-brand-muted">
                      <span className="truncate">{p.store?.name ?? "Toko"}</span>
                      {p.stock <= 0 && <span className="shrink-0 text-red-400">Habis</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
      <>
      {/* Section 1: Store Cards (bumped to top on store/product edit or new review) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <Store className="h-4 w-4" />
            {isEn ? "Featured Stores" : "Toko Pilihan"} ({filteredStores.length})
          </h3>
          <span className="text-[11px] text-brand-muted">{isEn ? "Latest activity & reviews first" : "Aktivitas & ulasan terbaru di atas"}</span>
        </div>

        {filteredStores.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#12151b] px-6 py-12 text-center">
            <Store className="mx-auto h-9 w-9 text-brand-muted/40" />
            <p className="mt-2.5 text-sm font-semibold text-white">{isEn ? "No matching stores yet" : "Belum ada toko yang cocok"}</p>
            <p className="mt-1 text-xs text-brand-muted">
              {isEn ? "Try another keyword or be the first to open a store in this category." : "Coba kata kunci lain atau jadilah yang pertama membuka toko di kategori ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
            {filteredStores.map((s) => (
              <Link
                key={s.id}
                href={`/news/marketplace/${s.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/50 hover:bg-[#171b23] md:flex-row"
              >
                {/* Store photo: big square on phone, bigger square on left side on PC; category overlaid on picture */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#0c0e13] md:h-40 md:w-40 lg:h-44 lg:w-44">
                  {s.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo_url}
                      alt={s.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(214,176,114,0.14),transparent_70%)] text-brand-gold">
                      <Store className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold text-brand-light backdrop-blur-sm">
                    {categoryLabel(s.category, lang)}
                  </span>
                </div>

                {/* Store info: phone = title only + Kunjungi button (no description, no kota); PC = title + tagline + Kunjungi */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-3 md:p-4">
                  <div>
                    <h4
                      className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-brand-gold md:text-lg"
                      style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                      {s.name}
                    </h4>
                    {s.tagline && (
                      <p className="mt-1.5 hidden text-xs italic leading-relaxed text-brand-gold/80 md:line-clamp-2">
                        {s.tagline}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 md:mt-auto md:pt-3">
                    <span className="hidden text-xs text-brand-muted md:inline-flex md:items-center md:gap-1">
                      <Package className="h-3.5 w-3.5 text-brand-gold/80" />
                      {s.product_count ?? 0} {isEn ? "products" : "produk"}
                    </span>
                    <span className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-brand-gold/15 px-3 py-2 text-xs font-bold text-brand-gold transition group-hover:bg-brand-gold group-hover:text-brand-dark md:w-auto md:px-4">
                      {isEn ? "Visit" : "Kunjungi"} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Random Products (when filter is empty / All) OR Matching Products (when searching/filtering) */}
      <section className="space-y-3 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            {isDefaultBrowse ? <Sparkles className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {isDefaultBrowse
              ? (isEn ? "Explore Random Products" : "Jelajahi Produk Acak")
              : `${isEn ? "Products Found" : "Produk Ditemukan"} (${filteredProducts.length})`}
          </h3>
          {isDefaultBrowse && initialProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setRandomProducts(shuffle(initialProducts).slice(0, 12))}
              className="text-[11px] font-semibold text-brand-gold hover:underline"
            >
              {isEn ? "Shuffle" : "Acak lagi"}
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-[#12151b] px-5 py-10 text-center text-xs text-brand-muted">
            {isEn ? "No products to display yet." : "Belum ada produk untuk ditampilkan."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/news/marketplace/${p.store?.slug ?? ""}?p=${p.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/45 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#0c0e13]">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-brand-gold/35" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-brand-light backdrop-blur-sm">
                    {p.category}
                  </span>
                  <button
                    type="button"
                    aria-label={favIds.includes(p.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    onClick={(e) => onToggleFav(p.id, e)}
                    className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition ${
                      favIds.includes(p.id)
                        ? "bg-rose-500/90 text-white"
                        : "bg-black/65 text-white/85 hover:bg-black/85 hover:text-rose-300"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${favIds.includes(p.id) ? "fill-white" : ""}`} />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-brand-gold">
                    {p.title}
                  </h4>
                  <p className="mt-1.5 text-sm font-bold text-brand-gold">{rupiah(p.price)}</p>
                  <div className="mt-auto flex items-center justify-between gap-1 pt-2 text-[11px] text-brand-muted">
                    <span className="truncate">{p.store?.name ?? "Toko"}</span>
                    {p.stock <= 0 && <span className="shrink-0 text-red-400">Habis</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      </>
      )}

      {/* Create / Edit Store Modal */}
      {storeModal && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setStoreModal(false)}
        >
          <form
            onSubmit={saveStore}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl border border-white/15 bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl md:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{myStore ? "Edit Toko Saya" : "Buka Toko di Ruang Iman"}</h3>
              <button type="button" onClick={() => setStoreModal(false)} className="rounded-full p-1.5 text-brand-muted hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-[#12151b] p-4 text-center transition hover:border-brand-gold/60">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo toko" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-7 w-7 text-brand-gold" />
                  <span className="text-xs font-semibold text-brand-light">Unggah logo toko</span>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)} />
            </label>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Nama Toko *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Galeri Rosario Assisi" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Tagline Singkat</label>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Kerajinan tangan penuh doa" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Kategori Utama</label>
                  <select value={storeCat} onChange={(e) => setStoreCat(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none">
                    {MARKETPLACE_CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                      <option key={c} value={c} className="bg-[#1a1d24]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Kota</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta / Surabaya" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Nomor WhatsApp Toko (Opsional)</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0812xxxxxxxx" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Tentang Toko</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan produk, jam layanan, atau pengiriman tokomu..." className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Menyimpan…" : myStore ? "Simpan Perubahan" : "Buka Toko Sekarang"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
