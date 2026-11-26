"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export type MarketplaceItem = {
  id: string;
  seller_id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
  city: string | null;
  whatsapp: string | null;
  status: "active" | "sold";
  created_at: string;
  seller?: { full_name: string | null; nama_panggilan: string | null; avatar_url: string | null } | null;
};

const CATEGORIES = [
  "Semua",
  "Benda Rohani",
  "Buku & Alkitab",
  "Kuliner & UMKM",
  "Pakaian & Aksesoris",
  "Jasa",
  "Lainnya",
] as const;

const rupiah = (n: number) =>
  n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "Hubungi penjual";

function waLink(phone: string, title: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const text = encodeURIComponent(`Shalom, saya tertarik dengan "${title}" di Marketplace Ruang Iman.`);
  return `https://wa.me/${intl}?text=${text}`;
}

export default function MarketplaceClient({
  initialItems,
  userId,
  isAdmin,
  defaultCity,
  needsSql = false,
}: {
  initialItems: MarketplaceItem[];
  userId: string | null;
  isAdmin: boolean;
  defaultCity?: string | null;
  needsSql?: boolean;
}) {
  const db = () => createClient() as any;
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const [category, setCategory] = useState<string>("Semua");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MarketplaceItem | null>(null);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [formCat, setFormCat] = useState<string>("Benda Rohani");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState(defaultCity ?? "");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== "Semua" && it.category !== category) return false;
      if (!query) return true;
      return (
        it.title.toLowerCase().includes(query) ||
        (it.description ?? "").toLowerCase().includes(query) ||
        (it.city ?? "").toLowerCase().includes(query) ||
        it.category.toLowerCase().includes(query)
      );
    });
  }, [items, category, q]);

  function onPickFile(file: File | null) {
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setTitle("");
    setFormCat("Benda Rohani");
    setPrice("");
    setCity(defaultCity ?? "");
    setWhatsapp("");
    setDescription("");
    onPickFile(null);
    setError(null);
  }

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!title.trim()) { setError("Judul barang/jasa wajib diisi."); return; }
    setBusy(true);
    setError(null);

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const compressed = await imageCompression(imageFile, {
          maxSizeMB: 0.45,
          maxWidthOrHeight: 1200,
          initialQuality: 0.78,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const path = `${userId}/${crypto.randomUUID()}.webp`;
        const up = await db().storage.from("marketplace").upload(path, compressed, { contentType: "image/webp" });
        if (up.error) throw new Error("Foto belum bisa diunggah. Coba lagi.");
        imageUrl = db().storage.from("marketplace").getPublicUrl(path).data.publicUrl;
      }

      const numericPrice = Math.max(0, Number(price.replace(/\D/g, "")) || 0);
      const { data, error: insErr } = await db()
        .from("marketplace_items")
        .insert({
          seller_id: userId,
          title: title.trim(),
          category: formCat,
          price: numericPrice,
          description: description.trim() || null,
          image_url: imageUrl,
          city: city.trim() || null,
          whatsapp: whatsapp.trim() || null,
          status: "active",
        })
        .select("*, seller:profiles!seller_id(full_name, nama_panggilan, avatar_url)")
        .single();

      if (insErr || !data) throw new Error(insErr?.message || "Iklan belum tersimpan.");
      setItems((prev) => [data as MarketplaceItem, ...prev]);
      resetForm();
      setCreating(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function markSold(item: MarketplaceItem) {
    setBusy(true);
    const nextStatus = item.status === "sold" ? "active" : "sold";
    const { error: uErr } = await db()
      .from("marketplace_items")
      .update({ status: nextStatus })
      .eq("id", item.id);
    setBusy(false);
    if (uErr) return;
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x)));
    setSelected((cur) => (cur?.id === item.id ? { ...cur, status: nextStatus } : cur));
  }

  async function removeItem(item: MarketplaceItem) {
    if (!confirm("Hapus produk ini dari Marketplace?")) return;
    setBusy(true);
    const { error: dErr } = await db().from("marketplace_items").delete().eq("id", item.id);
    setBusy(false);
    if (dErr) return;
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setSelected(null);
  }

  const sellerName = (it: MarketplaceItem) =>
    it.seller?.nama_panggilan || it.seller?.full_name || "Anggota Ruang Iman";

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            Pasar Umat
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            Marketplace Ruang Iman
          </h2>
          <p className="mt-0.5 text-xs text-brand-muted">
            Benda rohani, buku, kuliner, dan karya UMKM umat Katolik dalam satu tempat.
          </p>
        </div>

        {userId ? (
          <button
            type="button"
            onClick={() => { resetForm(); setCreating(true); }}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold text-brand-dark shadow-md shadow-brand-gold/15 transition hover:bg-brand-gold-hover"
          >
            <Plus className="h-4 w-4" /> Pasang Iklan
          </button>
        ) : (
          <Link
            href="/login?next=/news/marketplace"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-2.5 text-xs font-bold text-brand-gold hover:bg-brand-gold/20"
          >
            Masuk untuk berjualan
          </Link>
        )}
      </div>

      {needsSql && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          Tabel <code>marketplace_items</code> belum dibuat di Supabase. Jalankan <code>supabase/145_marketplace.sql</code> untuk mengaktifkan Marketplace.
        </div>
      )}

      {/* Search & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari rosario, buku, kuliner, kota..."
            className="w-full rounded-xl border border-white/10 bg-[#12151b] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-gold text-brand-dark shadow-sm"
                    : "border border-white/10 bg-[#12151b] text-brand-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#12151b] px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-brand-muted/40" />
          <p className="mt-3 text-sm font-semibold text-white">Belum ada produk di kategori ini</p>
          <p className="mt-1 text-xs text-brand-muted">Jadilah yang pertama menawarkan karya atau benda rohani di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {filtered.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setSelected(it)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151b] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/45 hover:shadow-xl hover:shadow-black/40"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#0c0e13]">
                {it.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.image_url}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(214,176,114,0.12),transparent_70%)]">
                    <ShoppingBag className="h-10 w-10 text-brand-gold/40" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-brand-light backdrop-blur-sm">
                  {it.category}
                </span>
                {it.status === "sold" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/65 text-xs font-bold uppercase tracking-widest text-amber-300">
                    Terjual
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-brand-gold transition-colors">
                  {it.title}
                </h3>
                <p className="mt-1.5 text-sm font-bold text-brand-gold">{rupiah(it.price)}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[11px] text-brand-muted">
                  <span className="truncate">{sellerName(it)}</span>
                  {it.city && (
                    <span className="inline-flex shrink-0 items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {it.city}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/15 bg-[#1a1d24] shadow-2xl md:rounded-3xl"
          >
            <div className="relative aspect-[4/3] w-full bg-[#0c0e13]">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={selected.title} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-14 w-14 text-brand-gold/40" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white hover:bg-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-gold">
                  <Tag className="h-3 w-3" /> {selected.category}
                </span>
                <h3 className="mt-2 text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                  {selected.title}
                </h3>
                <p className="mt-1 text-lg font-bold text-brand-gold">{rupiah(selected.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                <span>Penjual: <b className="text-white">{sellerName(selected)}</b></span>
                {selected.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-gold" /> {selected.city}
                  </span>
                )}
              </div>

              {selected.description && (
                <p className="whitespace-pre-line rounded-xl border border-white/5 bg-[#12151b] p-3.5 text-sm leading-relaxed text-brand-light">
                  {selected.description}
                </p>
              )}

              {/* Contact Seller Actions */}
              {selected.seller_id !== userId && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selected.whatsapp && (
                    <a
                      href={waLink(selected.whatsapp, selected.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
                    >
                      <MessageCircle className="h-4 w-4" /> Chat WhatsApp
                    </a>
                  )}
                  <Link
                    href={`/community/messages?u=${selected.seller_id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-xs font-bold text-brand-dark transition hover:bg-brand-gold-hover"
                  >
                    <MessageSquare className="h-4 w-4" /> Chat di Ruang Iman
                  </Link>
                </div>
              )}

              {/* Seller / Admin Controls */}
              {(selected.seller_id === userId || isAdmin) && (
                <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void markSold(selected)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 py-2.5 text-xs font-bold text-brand-gold hover:bg-brand-gold/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {selected.status === "sold" ? "Aktifkan Kembali" : "Tandai Terjual"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeItem(selected)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {creating && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setCreating(false)}
        >
          <form
            onSubmit={submitListing}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl border border-white/15 bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl md:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Pasang Iklan Baru</h3>
              <button type="button" onClick={() => setCreating(false)} className="rounded-full p-1.5 text-brand-muted hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo Upload */}
            <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#12151b] p-4 text-center transition hover:border-brand-gold/60">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
              ) : (
                <>
                  <ImagePlus className="h-7 w-7 text-brand-gold" />
                  <span className="text-xs font-semibold text-brand-light">Pilih foto produk / jasa</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Nama Produk / Jasa *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Rosario Kayu Zaitun Asli"
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Kategori</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                      <option key={c} value={c} className="bg-[#1a1d24]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Harga (Rp)</label>
                  <input
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="75000 (0 = Hubungi)"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">Kota</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jakarta / Surabaya"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-light">WhatsApp (Opsional)</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-light">Deskripsi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail barang, kondisi, atau cara pemesanan..."
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] px-3.5 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-gold-hover disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Menyimpan…" : "Terbitkan Iklan"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
