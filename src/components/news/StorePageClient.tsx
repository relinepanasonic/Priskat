"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import ProductShareModal from "@/components/news/ProductShareModal";
import {
  categoryLabel,
  formatVariantId,
  generateAutoSku,
  getFavoriteProductIds,
  MARKETPLACE_CATEGORIES,
  MAX_PRODUCT_IMAGES,
  MAX_STORE_PRODUCTS,
  rupiah,
  toggleFavoriteProductId,
  waBuyLink,
  type MarketplaceProduct,
  type MarketplaceReview,
  type MarketplaceStore,
  type ProductVariant,
} from "@/lib/marketplace";

const SITE = "https://apps.ruangiman.com";

export default function StorePageClient({
  store,
  initialProducts,
  initialReviews,
  userId,
  isAdmin,
  initialProductId,
  lang = "id",
}: {
  store: MarketplaceStore;
  initialProducts: MarketplaceProduct[];
  initialReviews: MarketplaceReview[];
  userId: string | null;
  isAdmin: boolean;
  initialProductId?: string | null;
  lang?: "id" | "en";
}) {
  const isEn = lang === "en";
  const router = useRouter();
  const db = () => createClient() as any;
  // Strictly only the actual store owner can add, edit, or delete products in this store
  const isStoreOwner = Boolean(userId && userId === store.owner_id);
  const isOwner = isStoreOwner;
  void isAdmin;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [products, setProducts] = useState<MarketplaceProduct[]>(initialProducts);
  const [reviews, setReviews] = useState<MarketplaceReview[]>(initialReviews);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");

  // Active product detail modal
  const [activeProd, setActiveProd] = useState<MarketplaceProduct | null>(
    initialProductId ? initialProducts.find((p) => p.id === initialProductId) ?? null : null,
  );
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [buyingChat, setBuyingChat] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);

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

  function onToggleFav(productId: string, e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavIds(toggleFavoriteProductId(productId));
  }
  const [sharePayload, setSharePayload] = useState<{
    title: string;
    subtitle: string;
    url: string;
    imageUrl?: string | null;
    shareText: string;
  } | null>(null);

  // Review inputs (product & store)
  const [prodRating, setProdRating] = useState(5);
  const [prodComment, setProdComment] = useState("");
  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  // Add / Edit Product modal
  const [editingProd, setEditingProd] = useState<MarketplaceProduct | null>(null);
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(store.category || "Benda Rohani");
  const [skuId, setSkuId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImgIdx(0);
    setSelectedVariantIdx(0);
    setProdComment("");
    setProdRating(5);
  }, [activeProd?.id]);

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter !== "Semua" && p.category !== catFilter) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        (p.sku_id ?? "").toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query) ||
        (p.variants ?? []).some((v) => v.name.toLowerCase().includes(query) || v.code.toLowerCase().includes(query))
      );
    });
  }, [products, catFilter, q]);

  const storeOnlyReviews = useMemo(() => reviews.filter((r) => !r.product_id), [reviews]);
  const activeProdReviews = useMemo(
    () => (activeProd ? reviews.filter((r) => r.product_id === activeProd.id) : []),
    [reviews, activeProd],
  );
  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  function openAddProduct() {
    if (!isOwner || products.length >= MAX_STORE_PRODUCTS) return;
    setEditingProd(null);
    setTitle("");
    setCategory(store.category || "Benda Rohani");
    setSkuId(generateAutoSku(store.name, products.map((p) => p.sku_id)));
    setPrice("");
    setStock("10");
    setDescription("");
    setVariants([]);
    setExistingImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    setError(null);
    setProdModalOpen(true);
  }

  function openEditProduct(p: MarketplaceProduct) {
    if (!isOwner) return;
    setEditingProd(p);
    setTitle(p.title);
    setCategory(p.category);
    setSkuId(p.sku_id || generateAutoSku(store.name, products.map((x) => x.sku_id)));
    setPrice(String(p.price || ""));
    setStock(String(p.stock ?? 0));
    setDescription(p.description || "");
    setVariants(Array.isArray(p.variants) ? p.variants : []);
    setExistingImages(Array.isArray(p.images) ? p.images : []);
    setNewFiles([]);
    setNewPreviews([]);
    setError(null);
    setActiveProd(null);
    setProdModalOpen(true);
  }

  function onAddImages(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PRODUCT_IMAGES - existingImages.length - newFiles.length;
    if (remaining <= 0) return;
    const picked = Array.from(files).slice(0, remaining);
    setNewFiles((prev) => [...prev, ...picked]);
    setNewPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !isOwner) return;
    if (!title.trim()) { setError("Judul produk wajib diisi."); return; }
    setBusy(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const f of newFiles) {
        const small = await imageCompression(f, {
          maxSizeMB: 0.45,
          maxWidthOrHeight: 1200,
          initialQuality: 0.78,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const path = `${userId}/prod-${crypto.randomUUID()}.webp`;
        const up = await db().storage.from("marketplace").upload(path, small, { contentType: "image/webp" });
        if (up.error) throw new Error("Salah satu foto gagal diunggah.");
        uploadedUrls.push(db().storage.from("marketplace").getPublicUrl(path).data.publicUrl);
      }

      const finalImages = [...existingImages, ...uploadedUrls].slice(0, MAX_PRODUCT_IMAGES);
      const cleanVariants = variants
        .map((v) => ({
          code: v.code.trim().toUpperCase(),
          name: v.name.trim(),
          price: v.price && v.price > 0 ? Number(v.price) : undefined,
          stock: typeof v.stock === "number" && !Number.isNaN(v.stock) ? Math.max(0, v.stock) : undefined,
        }))
        .filter((v) => v.name || v.code);

      const payload = {
        store_id: store.id,
        title: title.trim(),
        category,
        sku_id: (skuId.trim() || generateAutoSku(store.name, products.map((x) => x.sku_id))).toUpperCase(),
        variants: cleanVariants,
        description: description.trim() || null,
        price: Math.max(0, Number(price.replace(/\D/g, "")) || 0),
        stock: Math.max(0, Number(stock.replace(/\D/g, "")) || 0),
        images: finalImages,
        updated_at: new Date().toISOString(),
      };

      if (editingProd) {
        const { data, error: uErr } = await db()
          .from("marketplace_products")
          .update(payload)
          .eq("id", editingProd.id)
          .select("*")
          .single();
        if (uErr || !data) throw new Error(uErr?.message || "Produk belum tersimpan.");
        setProducts((prev) => prev.map((x) => (x.id === editingProd.id ? (data as MarketplaceProduct) : x)));
      } else {
        const { data, error: iErr } = await db()
          .from("marketplace_products")
          .insert(payload)
          .select("*")
          .single();
        if (iErr || !data) throw new Error(iErr?.message || "Produk belum bisa ditambahkan.");
        setProducts((prev) => [data as MarketplaceProduct, ...prev]);
      }
      setProdModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(p: MarketplaceProduct) {
    if (!isOwner) return;
    if (!confirm(`Hapus produk "${p.title}"?`)) return;
    setBusy(true);
    const { error: dErr } = await db().from("marketplace_products").delete().eq("id", p.id);
    setBusy(false);
    if (dErr) return;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setActiveProd(null);
  }

  async function submitReview(productId: string | null) {
    if (!userId) return;
    const text = (productId ? prodComment : storeComment).trim();
    const rating = productId ? prodRating : storeRating;
    if (!text) return;
    setReviewBusy(true);
    const { data, error: rErr } = await db()
      .from("marketplace_reviews")
      .insert({
        store_id: store.id,
        product_id: productId,
        author_id: userId,
        rating,
        comment: text,
      })
      .select("*, author:profiles!author_id(full_name, nama_panggilan, avatar_url)")
      .single();
    setReviewBusy(false);
    if (rErr || !data) return;
    setReviews((prev) => [data as MarketplaceReview, ...prev]);
    if (productId) { setProdComment(""); setProdRating(5); }
    else { setStoreComment(""); setStoreRating(5); }
  }

  /** Directly open (and pre-send the product inquiry into) the DM chat with the store owner. */
  async function buyViaAppChat() {
    if (!activeProd) return;
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(`/news/marketplace/${store.slug}?p=${activeProd.id}`)}`);
      return;
    }
    if (userId === store.owner_id) {
      router.push("/community/messages/private");
      return;
    }
    setBuyingChat(true);
    try {
      const { data: threadId, error: tErr } = await db().rpc("get_or_create_dm_thread", { other: store.owner_id });
      if (!tErr && threadId) {
        const productUrl = `${SITE}/news/marketplace/${store.slug}?p=${activeProd.id}`;
        const lines = [
          `Shalom ${store.name}, saya tertarik membeli:`,
          `• ${activeProd.title}`,
          activeVariant?.name ? `• Varian: ${activeVariant.name}` : "",
          activeVariantId !== "-" ? `• Kode: ${activeVariantId}` : "",
          activePrice > 0 ? `• Harga: ${rupiah(activePrice)}` : "",
          productUrl,
        ].filter(Boolean);
        await db().from("dm_messages").insert({
          thread_id: threadId,
          author_id: userId,
          content: lines.join("\n"),
        });
        router.push(`/community/messages/private?t=${threadId}`);
        return;
      }
      router.push(`/community/messages/private?u=${store.owner_id}`);
    } finally {
      setBuyingChat(false);
    }
  }

  const activeVariant: ProductVariant | null =
    activeProd && activeProd.variants?.length > 0
      ? activeProd.variants[selectedVariantIdx] ?? activeProd.variants[0]
      : null;
  const activePrice = activeProd ? (activeVariant?.price ?? activeProd.price) : 0;
  const activeStock = activeProd ? (activeVariant?.stock ?? activeProd.stock) : 0;
  const activeVariantId = activeProd ? formatVariantId(activeProd.sku_id, activeVariant?.code) : "-";

  return (
    <div className="space-y-4 px-0 py-1 md:p-6">
      {/* Back link */}
      <Link href="/news/marketplace" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {isEn ? "Back to Marketplace" : "Kembali ke Marketplace"}
      </Link>

      {/* Store Header Card — compact so products stay front and center */}
      <header className="card-lux p-3.5 sm:p-4">
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* Logo + Share button directly underneath */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt={store.name} className="h-16 w-16 rounded-2xl border border-brand-gold/40 object-cover sm:h-20 sm:w-20" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold sm:h-20 sm:w-20">
                <Store className="h-8 w-8" />
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                setSharePayload({
                  title: store.name,
                  subtitle: categoryLabel(store.category, lang),
                  url: `${SITE}/news/marketplace/${store.slug}`,
                  imageUrl: store.logo_url,
                  shareText: isEn
                    ? `Check out ${store.name} on Ruang Iman Marketplace!`
                    : `Yuk kunjungi toko ${store.name} di Marketplace Ruang Iman!`,
                })
              }
              className="inline-flex w-16 items-center justify-center gap-1 rounded-lg border border-brand-gold/40 bg-brand-gold/10 py-1 text-[10px] font-bold text-brand-gold transition hover:bg-brand-gold hover:text-brand-dark sm:w-20 sm:text-[11px]"
            >
              <Share2 className="h-3 w-3" /> {isEn ? "Share" : "Bagikan"}
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-block rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                {categoryLabel(store.category, lang)}
              </span>
              {isStoreOwner && products.length < MAX_STORE_PRODUCTS && (
                <button
                  type="button"
                  onClick={openAddProduct}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-gold px-3 py-1.5 text-[11px] font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover"
                >
                  <Plus className="h-3.5 w-3.5" /> {isEn ? "Add Product" : "Tambah Produk"}
                </button>
              )}
            </div>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: "'Lora', Georgia, serif" }}>
              {store.name}
            </h1>
            {store.tagline && <p className="mt-0.5 text-xs italic text-brand-gold/85">{store.tagline}</p>}
            {(store.city || avgRating) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                {store.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-gold" /> {store.city}</span>}
                {avgRating && (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-amber-300" /> {avgRating} ({reviews.length} {isEn ? "reviews" : "ulasan"})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {store.description && (
          <p className="mt-3 border-t border-white/10 pt-2.5 text-xs leading-relaxed text-brand-light whitespace-pre-line">
            {store.description}
          </p>
        )}
      </header>

      {/* Search & Category inside Store */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isEn ? "Search products, SKU, or variants in this store..." : "Cari produk, SKU, atau varian di toko ini..."}
            className="w-full rounded-xl border border-white/10 bg-[#12151b] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-xs font-semibold text-white focus:border-brand-gold focus:outline-none"
        >
          {MARKETPLACE_CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-[#1a1d24]">{categoryLabel(c, lang)}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#12151b] px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-brand-muted/40" />
          <p className="mt-3 text-sm font-semibold text-white">Belum ada produk di toko ini</p>
          {isOwner && (
            <button type="button" onClick={openAddProduct} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark">
              <Plus className="h-4 w-4" /> Tambah Produk Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveProd(p)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] text-left transition-all hover:-translate-y-0.5 hover:border-brand-gold/45 hover:shadow-xl"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#0c0e13]">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-10 w-10 text-brand-gold/35" /></div>
                )}
                {p.images?.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {p.images.length} foto
                  </span>
                )}
                <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-brand-light">
                  {p.category}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Favorit"
                  onClick={(e) => onToggleFav(p.id, e)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggleFav(p.id); }}
                  className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition ${
                    favIds.includes(p.id)
                      ? "bg-rose-500/90 text-white"
                      : "bg-black/65 text-white/85 hover:bg-black/85 hover:text-rose-300"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${favIds.includes(p.id) ? "fill-white" : ""}`} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-brand-gold transition-colors">
                  {p.title}
                </h3>
                {p.sku_id && <p className="mt-0.5 font-mono text-[10px] text-brand-muted">SKU: {p.sku_id}</p>}
                <p className="mt-1.5 text-sm font-bold text-brand-gold">{rupiah(p.price)}</p>
                <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-brand-muted">
                  <span>{p.stock > 0 ? `Stok ${p.stock}` : <span className="text-red-400">Habis</span>}</span>
                  {p.variants?.length > 0 && <span>{p.variants.length} varian</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Store Reviews / Comments (posting bumps store to top of Marketplace!) */}
      <section className="space-y-4 border-t border-white/10 pt-6">
        <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
          Ulasan & Komentar Toko ({storeOnlyReviews.length})
        </h2>

        {userId && (
          <div className="space-y-2.5 rounded-2xl border border-white/10 bg-[#12151b] p-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setStoreRating(n)} aria-label={`${n} bintang`}>
                  <Star className={`h-5 w-5 ${n <= storeRating ? "fill-brand-gold text-brand-gold" : "text-gray-600"}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={storeComment}
                onChange={(e) => setStoreComment(e.target.value)}
                placeholder="Tulis ulasan atau pertanyaan untuk toko ini..."
                className="flex-1 rounded-xl border border-white/10 bg-[#1a1d24] px-3.5 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
              />
              <button
                type="button"
                disabled={reviewBusy || !storeComment.trim()}
                onClick={() => void submitReview(null)}
                className="rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold text-brand-dark disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        )}

        {storeOnlyReviews.length === 0 ? (
          <p className="text-xs text-brand-muted">Belum ada ulasan untuk toko ini.</p>
        ) : (
          <div className="space-y-2.5">
            {storeOnlyReviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-[#12151b] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{r.author?.nama_panggilan || r.author?.full_name || "Pembeli"}</span>
                  <span className="flex items-center gap-0.5 text-brand-gold">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-brand-gold" />)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-light">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCT DETAIL MODAL */}
      {activeProd && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setActiveProd(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/15 bg-[#1a1d24] shadow-2xl md:rounded-3xl"
          >
            {/* 5-Photo Carousel (Swipeable + Arrow Navigation) */}
            <div
              className="relative aspect-[4/3] w-full touch-pan-y select-none bg-[#0c0e13]"
              onTouchStart={(e) => {
                const t = e.touches[0];
                if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(e) => {
                const start = touchStartRef.current;
                touchStartRef.current = null;
                if (!start || !activeProd.images || activeProd.images.length <= 1) return;
                const t = e.changedTouches[0];
                if (!t) return;
                const dx = t.clientX - start.x;
                const dy = t.clientY - start.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                  if (dx < 0) {
                    setImgIdx((i) => (i + 1) % activeProd.images.length);
                  } else {
                    setImgIdx((i) => (i - 1 + activeProd.images.length) % activeProd.images.length);
                  }
                }
              }}
            >
              {activeProd.images?.[imgIdx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeProd.images[imgIdx]} alt={activeProd.title} draggable={false} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-14 w-14 text-brand-gold/40" /></div>
              )}
              {activeProd.images?.length > 1 && (
                <>
                  <button type="button" onClick={() => setImgIdx((i) => (i - 1 + activeProd.images.length) % activeProd.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" onClick={() => setImgIdx((i) => (i + 1) % activeProd.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"><ChevronRight className="h-5 w-5" /></button>
                  <div className="pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-sm">
                    {activeProd.images.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-4 bg-brand-gold" : "w-1.5 bg-white/45"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <button
                type="button"
                aria-label="Bagikan produk"
                onClick={() =>
                  setSharePayload({
                    title: activeProd.title,
                    subtitle: `${store.name} · ${rupiah(activePrice)}`,
                    url: `${SITE}/news/marketplace/${store.slug}?p=${activeProd.id}`,
                    imageUrl: activeProd.images?.[0] ?? store.logo_url,
                    shareText: `Lihat ${activeProd.title} (${rupiah(activePrice)}) di toko ${store.name} — Marketplace Ruang Iman:`,
                  })
                }
                className="absolute left-3 top-3 rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-brand-gold hover:text-brand-dark"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setActiveProd(null)} aria-label="Tutup" className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeProd.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto bg-[#12151b] px-4 py-2.5">
                {activeProd.images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setImgIdx(i)} className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 ${i === imgIdx ? "border-brand-gold" : "border-transparent opacity-60"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-gold">{activeProd.category}</span>
                  <h3 className="mt-1.5 text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{activeProd.title}</h3>
                  <p className="mt-1 text-lg font-bold text-brand-gold">{rupiah(activePrice)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    aria-label={favIds.includes(activeProd.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    onClick={() => onToggleFav(activeProd.id)}
                    className={`rounded-xl border p-2 transition ${
                      favIds.includes(activeProd.id)
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                        : "border-white/15 bg-[#12151b] text-brand-light hover:border-rose-400/50 hover:text-rose-300"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favIds.includes(activeProd.id) ? "fill-rose-400" : ""}`} />
                  </button>
                  <button
                    type="button"
                    aria-label="Bagikan produk"
                    onClick={() =>
                      setSharePayload({
                        title: activeProd.title,
                        subtitle: `${store.name} · ${rupiah(activePrice)}`,
                        url: `${SITE}/news/marketplace/${store.slug}?p=${activeProd.id}`,
                        imageUrl: activeProd.images?.[0] ?? store.logo_url,
                        shareText: `Lihat ${activeProd.title} (${rupiah(activePrice)}) di toko ${store.name} — Marketplace Ruang Iman:`,
                      })
                    }
                    className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-2 text-brand-gold transition hover:bg-brand-gold hover:text-brand-dark"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {isOwner && (
                    <>
                      <button type="button" onClick={() => openEditProduct(activeProd)} className="rounded-xl border border-white/15 p-2 text-brand-light hover:border-brand-gold hover:text-brand-gold"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => void deleteProduct(activeProd)} className="rounded-xl border border-red-500/30 p-2 text-red-300 hover:bg-red-500/15"><Trash2 className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              </div>

              {/* SKU / Variant ID & Stock */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-white/10 bg-[#12151b] px-2.5 py-1 font-mono text-brand-light">
                  ID: <b className="text-brand-gold">{activeVariantId}</b>
                </span>
                <span className={`rounded-lg border px-2.5 py-1 font-semibold ${activeStock > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                  {activeStock > 0 ? `Stok: ${activeStock}` : "Stok Habis"}
                </span>
              </div>

              {/* Variant Picker */}
              {activeProd.variants?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-brand-muted">Pilih Varian</p>
                  <div className="flex flex-wrap gap-2">
                    {activeProd.variants.map((v, idx) => (
                      <button
                        key={`${v.code}-${idx}`}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          selectedVariantIdx === idx
                            ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                            : "border-white/10 bg-[#12151b] text-brand-light hover:border-white/25"
                        }`}
                      >
                        {v.name} {v.code ? <span className="font-mono text-[10px] opacity-70">({formatVariantId(activeProd.sku_id, v.code)})</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeProd.description && (
                <p className="whitespace-pre-line rounded-xl border border-white/5 bg-[#12151b] p-3.5 text-sm leading-relaxed text-brand-light">
                  {activeProd.description}
                </p>
              )}

              {/* Buy Buttons in 1 single row */}
              <div className={`grid gap-2 ${store.whatsapp ? "grid-cols-2" : "grid-cols-1"}`}>
                <button
                  type="button"
                  disabled={buyingChat}
                  onClick={() => void buyViaAppChat()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold px-3 py-3 text-xs font-bold text-brand-dark hover:bg-brand-gold-hover disabled:opacity-60"
                >
                  {buyingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  {buyingChat ? (isEn ? "Opening…" : "Membuka…") : (isEn ? "Buy (App Chat)" : "Beli (Chat App)")}
                </button>
                {store.whatsapp && (
                  <a
                    href={waBuyLink(store.whatsapp, store.name, activeProd.title, activeVariantId, activeVariant?.name, activePrice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-3 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <MessageCircle className="h-4 w-4" /> {isEn ? "Buy via WA" : "Beli via WA"}
                  </a>
                )}
              </div>

              {/* Store Link Banner before Reviews — click picture or store name to enter store */}
              <button
                type="button"
                onClick={() => {
                  setActiveProd(null);
                  router.push(`/news/marketplace/${store.slug}`);
                }}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#12151b] p-3 text-left transition hover:border-brand-gold/45 hover:bg-[#171b23]"
              >
                {store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logo_url} alt={store.name} className="h-11 w-11 shrink-0 rounded-xl border border-brand-gold/30 object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-brand-gold">{store.name}</p>
                  <p className="truncate text-[11px] text-brand-muted">
                    {store.city ? `${store.city} · ` : ""}{store.category}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-gold" />
              </button>

              {/* Product Reviews */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                  {isEn ? "Buyer Reviews" : "Ulasan Pembeli"} ({activeProdReviews.length})
                </p>
                {userId && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-[#12151b] p-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setProdRating(n)}>
                          <Star className={`h-4 w-4 ${n <= prodRating ? "fill-brand-gold text-brand-gold" : "text-gray-600"}`} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={prodComment}
                        onChange={(e) => setProdComment(e.target.value)}
                        placeholder={isEn ? "Write a review for this product..." : "Tulis ulasan produk ini..."}
                        className="flex-1 rounded-lg border border-white/10 bg-[#1a1d24] px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={reviewBusy || !prodComment.trim()}
                        onClick={() => void submitReview(activeProd.id)}
                        className="rounded-lg bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark disabled:opacity-50"
                      >
                        {isEn ? "Send" : "Kirim"}
                      </button>
                    </div>
                  </div>
                )}
                {activeProdReviews.length === 0 ? (
                  <p className="text-xs text-brand-muted">{isEn ? "No reviews for this product yet." : "Belum ada ulasan untuk produk ini."}</p>
                ) : (
                  <div className="space-y-2">
                    {activeProdReviews.map((r) => (
                      <div key={r.id} className="rounded-xl border border-white/10 bg-[#12151b] p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{r.author?.nama_panggilan || r.author?.full_name || "Pembeli"}</span>
                          <span className="flex items-center gap-0.5 text-brand-gold">
                            {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-brand-gold" />)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-brand-light">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {prodModalOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setProdModalOpen(false)}
        >
          <form
            onSubmit={saveProduct}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-xl space-y-4 overflow-y-auto rounded-t-3xl border border-white/15 bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl md:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editingProd ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button type="button" onClick={() => setProdModalOpen(false)} className="rounded-full p-1.5 text-brand-muted hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            {/* 1. Up to 5 Product Photos */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-brand-light">
                Foto Produk ({existingImages.length + newFiles.length} / {MAX_PRODUCT_IMAGES})
              </p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((src, i) => (
                  <div key={src} className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setExistingImages((a) => a.filter((_, idx) => idx !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/80 p-0.5 text-white"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={src} className="relative h-16 w-16 overflow-hidden rounded-xl border border-brand-gold/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => { setNewFiles((a) => a.filter((_, idx) => idx !== i)); setNewPreviews((a) => a.filter((_, idx) => idx !== i)); }} className="absolute right-0.5 top-0.5 rounded-full bg-black/80 p-0.5 text-white"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {existingImages.length + newFiles.length < MAX_PRODUCT_IMAGES && (
                  <label className="relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-[#12151b] text-brand-gold hover:border-brand-gold">
                    <ImagePlus className="h-5 w-5" />
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onAddImages(e.target.files); e.target.value = ""; }} />
                  </label>
                )}
              </div>
            </div>

            {/* 2-4. Title, Category, SKU ID */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Judul Produk *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Rosario Kayu Zaitun Yerusalem" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Kategori</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none">
                    {MARKETPLACE_CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c} value={c} className="bg-[#1a1d24]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">SKU ID (Otomatis)</label>
                  <input
                    value={skuId}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#0e1015] px-3.5 py-2.5 font-mono text-sm text-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* 8-9. Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Harga (Rp)</label>
                  <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="85000" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Stok</label>
                  <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
                </div>
              </div>

              {/* 5-6. Variants & Variant ID (SKU.VARIANT) */}
              <div className="space-y-2 rounded-xl border border-white/10 bg-[#12151b] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-light">Varian & Variant ID (Opsional)</span>
                  <button
                    type="button"
                    onClick={() => setVariants((v) => [...v, { code: `V${v.length + 1}`, name: "", price: undefined, stock: undefined }])}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-gold hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Varian
                  </button>
                </div>
                {variants.map((v, idx) => (
                  <div key={idx} className="space-y-1.5 rounded-lg border border-white/10 bg-[#1a1d24] p-2.5">
                    <div className="grid grid-cols-[90px_1fr_auto] gap-2">
                      <input
                        value={v.code}
                        onChange={(e) => setVariants((arr) => arr.map((x, i) => (i === idx ? { ...x, code: e.target.value.toUpperCase() } : x)))}
                        placeholder="Kode"
                        className="rounded-lg border border-white/10 bg-[#12151b] px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                      <input
                        value={v.name}
                        onChange={(e) => setVariants((arr) => arr.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                        placeholder="Nama varian (mis. Cokelat / M)"
                        className="rounded-lg border border-white/10 bg-[#12151b] px-2.5 py-1.5 text-xs text-white"
                      />
                      <button type="button" onClick={() => setVariants((arr) => arr.filter((_, i) => i !== idx))} className="px-1 text-red-400"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        inputMode="numeric"
                        value={v.price ?? ""}
                        onChange={(e) => setVariants((arr) => arr.map((x, i) => (i === idx ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) || undefined } : x)))}
                        placeholder="Harga varian (opsional)"
                        className="rounded-lg border border-white/10 bg-[#12151b] px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        inputMode="numeric"
                        value={v.stock ?? ""}
                        onChange={(e) => setVariants((arr) => arr.map((x, i) => (i === idx ? { ...x, stock: e.target.value === "" ? undefined : Number(e.target.value.replace(/\D/g, "")) } : x)))}
                        placeholder="Stok varian (opsional)"
                        className="rounded-lg border border-white/10 bg-[#12151b] px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <p className="font-mono text-[10px] text-brand-gold">
                      Variant ID: {formatVariantId(skuId || "SKU", v.code)}
                    </p>
                  </div>
                ))}
              </div>

              {/* 7. Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Deskripsi Produk</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan bahan, ukuran, cara pemesanan..." className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Menyimpan…" : editingProd ? "Simpan Produk" : "Tambahkan ke Toko"}
            </button>
          </form>
        </div>
      )}
      {sharePayload && (
        <ProductShareModal
          title={sharePayload.title}
          subtitle={sharePayload.subtitle}
          url={sharePayload.url}
          imageUrl={sharePayload.imageUrl}
          shareText={sharePayload.shareText}
          lang={lang}
          onClose={() => setSharePayload(null)}
        />
      )}
    </div>
  );
}
