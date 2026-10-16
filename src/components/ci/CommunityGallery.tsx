"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { ChevronLeft, ChevronRight, ImagePlus, Images, Loader2, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#D6B072";

export type GalleryItem = { id: string; image_url: string; caption: string | null; created_at: string };

export default function CommunityGallery({
  items, communityId, canEdit,
}: { items: GalleryItem[]; communityId: string; canEdit: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  // Keyboard navigation in the viewer
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const list = Array.from(files);
    setUploading(list.length);
    for (const file of list) {
      try {
        const small = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1920, useWebWorker: true });
        const path = `gallery/${communityId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("communities").upload(path, small, { contentType: small.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("communities").getPublicUrl(path);
        const { error: dbErr } = await supabase
          .from("community_gallery" as any)
          .insert({ community_id: communityId, image_url: data.publicUrl, created_by: user?.id ?? null });
        if (dbErr) throw dbErr;
      } catch (e: any) {
        setError(e?.message ?? "Gagal mengunggah foto.");
      }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  };

  const remove = async (item: GalleryItem) => {
    if (!confirm("Hapus foto ini dari galeri?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("community_gallery" as any).delete().eq("id", item.id);
    if (error) return alert(error.message);
    const marker = "/communities/";
    const idx = item.image_url.indexOf(marker);
    if (idx !== -1) await supabase.storage.from("communities").remove([item.image_url.slice(idx + marker.length)]);
    setOpen(null);
    router.refresh();
  };

  const current = open !== null ? items[open] : null;

  return (
    <div className="space-y-5">
      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading > 0}
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#121417] disabled:opacity-60"
            style={{ background: GOLD }}
          >
            {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading > 0 ? `Mengunggah ${uploading}…` : "Tambah Foto"}
          </button>
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-[#1a1d24] py-14 text-center">
          <Images className="mx-auto h-10 w-10 opacity-30" style={{ color: GOLD }} />
          <p className="mt-3 text-white">Galeri masih kosong</p>
          <p className="text-sm text-brand-muted">{canEdit ? "Unggah foto kegiatan komunitas." : "Foto kegiatan akan tampil di sini."}</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image_url} alt={it.caption ?? ""} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-105" />
              {it.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left text-xs text-white">{it.caption}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" role="dialog" aria-modal="true">
          <button onClick={() => setOpen(null)} aria-label="Tutup" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X className="h-5 w-5" /></button>
          {items.length > 1 && (
            <>
              <button onClick={() => setOpen((open! - 1 + items.length) % items.length)} aria-label="Sebelumnya" className="absolute left-3 rounded-full bg-white/10 p-2 text-white"><ChevronLeft className="h-6 w-6" /></button>
              <button onClick={() => setOpen((open! + 1) % items.length)} aria-label="Berikutnya" className="absolute right-3 rounded-full bg-white/10 p-2 text-white"><ChevronRight className="h-6 w-6" /></button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image_url} alt={current.caption ?? ""} className="max-h-[85dvh] max-w-[92vw] rounded-xl object-contain" />
          <div className="absolute bottom-5 flex items-center gap-4">
            {current.caption && <span className="text-sm text-white/80">{current.caption}</span>}
            {canEdit && (
              <button onClick={() => remove(current)} className="flex items-center gap-1.5 rounded-full bg-red-600/80 px-3 py-1.5 text-xs text-white">
                <Trash2 className="h-3.5 w-3.5" />Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
