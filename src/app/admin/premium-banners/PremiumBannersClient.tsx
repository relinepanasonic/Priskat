"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import {
  createPremiumBanner,
  deletePremiumBanner,
  togglePremiumBanner,
} from "@/app/actions/premiumBanners";

export type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
  title: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export default function PremiumBannersClient({
  initialBanners,
}: {
  initialBanners: Banner[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const url = await uploadImage(
        file,
        "news-covers",
        storagePath(user?.id ?? "anon", "premium_" + file.name)
      );
      setImage(url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const add = () => {
    if (!image) {
      setError("Upload a banner image first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createPremiumBanner({
        image_url: image,
        link_url: link,
        title,
        sort_order: order ? parseInt(order, 10) || 0 : 0,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setImage("");
      setLink("");
      setTitle("");
      setOrder("");
      router.refresh();
    });
  };

  const toggle = (b: Banner) =>
    startTransition(async () => {
      const res = await togglePremiumBanner(b.id, !b.is_active);
      if (res?.error) alert(res.error);
      else router.refresh();
    });

  const remove = (id: string) => {
    if (!confirm("Delete this banner?")) return;
    startTransition(async () => {
      const res = await deletePremiumBanner(id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* add form */}
      <div className="card-3d space-y-4 p-5">
        <h2 className="text-sm font-bold text-white">Add banner</h2>

        <div className="mx-auto w-full max-w-md">
          {image ? (
            <div className="relative aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="preview"
                className="h-full w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border text-brand-muted hover:border-brand-gold"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-sm">Upload banner (16:9)</span>
                  <span className="text-[11px]">~1600×900</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onUpload}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-brand-light">
              Caption (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-3d w-full text-sm"
              placeholder="Sponsor name / alt text"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-brand-light">
              Sort order
            </label>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              type="number"
              className="input-3d w-full text-sm"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-light">
            Link URL (optional)
          </label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="input-3d w-full text-sm"
            placeholder="https://…"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button
          onClick={add}
          className="w-full"
          loading={pending || uploading}
        >
          Add banner
        </Button>
      </div>

      {/* list */}
      {initialBanners.length === 0 ? (
        <div className="rounded-xl border border-[#333] bg-[#15181e] p-10 text-center text-sm text-gray-500">
          No premium banners yet. The Events marquee shows placeholders until
          you add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {initialBanners.map((b) => (
            <div key={b.id} className="card-3d overflow-hidden">
              <div className="relative aspect-[16/9] bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title || ""}
                  className={`h-full w-full object-cover ${
                    b.is_active ? "" : "opacity-40 grayscale"
                  }`}
                />
                {!b.is_active && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-muted">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {b.title || "Untitled"}
                  </p>
                  <p className="truncate text-[11px] text-brand-muted">
                    order {b.sort_order}
                    {b.link_url ? ` · ${b.link_url}` : ""}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggle(b)}
                    className="rounded-lg border border-[#333] px-2 py-1 text-[11px] font-semibold text-brand-light hover:bg-white/5"
                  >
                    {b.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
