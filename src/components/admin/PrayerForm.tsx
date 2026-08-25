"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { createPrayer, updatePrayer } from "@/app/actions/prayers";
import type { Prayer, PrayerCategory } from "@/lib/types/database.types";
import { PRAYER_CATEGORIES } from "@/lib/types/database.types";

interface Props {
  initialData?: Prayer;
}

export default function PrayerForm({ initialData }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      setError(null);
      const result = initialData
        ? await updatePrayer(initialData.id, formData)
        : await createPrayer(formData);
      if (result?.error) setError(JSON.stringify(result.error));
    });
  }

  const inputClass = "w-full input-3d text-sm";
  const labelClass = "block text-sm font-medium text-brand-light mb-1";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-xl border border-red-500/30">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Judul (Indonesia) *</label>
          <input name="title_id" defaultValue={initialData?.title_id} required className={inputClass} placeholder="Doa Bapa Kami" />
        </div>
        <div>
          <label className={labelClass}>Title (English) *</label>
          <input name="title_en" defaultValue={initialData?.title_en} required className={inputClass} placeholder="Our Father" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Kategori / Category *</label>
        <select name="category" defaultValue={initialData?.category ?? "doa_harian"} required
          className="w-full input-3d text-sm appearance-none">
          {PRAYER_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label_id} / {cat.label_en}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Urutan Tampil (Sort Order)</label>
        <input type="number" name="sort_order" defaultValue={initialData?.sort_order ?? 0} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Isi Doa — Indonesia *</label>
        <textarea name="body_id" defaultValue={initialData?.body_id} rows={10} required
          className="w-full bg-brand-bg rounded-xl shadow-3d-inset border border-brand-border text-brand-light px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-glow font-mono" />
      </div>

      <div>
        <label className={labelClass}>Prayer Body — English *</label>
        <textarea name="body_en" defaultValue={initialData?.body_en} rows={10} required
          className="w-full bg-brand-bg rounded-xl shadow-3d-inset border border-brand-border text-brand-light px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-glow font-mono" />
      </div>

      <div className="flex items-center gap-3">
        <input type="hidden" name="is_published" value="false" />
        <input type="checkbox" id="is_published" name="is_published" value="true"
          defaultChecked={initialData?.is_published ?? true}
          className="rounded border-brand-border bg-brand-bg text-brand-gold" />
        <label htmlFor="is_published" className="text-sm text-brand-light">
          Published / Aktif
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          {initialData ? "Update Prayer" : "Create Prayer"}
        </Button>
      </div>
    </form>
  );
}
