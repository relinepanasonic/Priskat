"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { createDevotion, updateDevotion } from "@/app/actions/devotions";
import type { DailyDevotion } from "@/lib/types/database.types";

interface Props {
  initialData?: DailyDevotion;
}

export default function DevotionForm({ initialData }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      setError(null);
      const result = initialData
        ? await updateDevotion(initialData.id, formData)
        : await createDevotion(formData);

      if (result?.error) {
        setError(JSON.stringify(result.error));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm bg-red-100/10 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-brand-light mb-1">Publish Date</label>
        <input 
          type="date" 
          name="publish_date" 
          defaultValue={initialData?.publish_date || new Date().toISOString().split("T")[0]} 
          required 
          className="w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-light mb-1">Verse Reference (e.g. John 3:16)</label>
        <input 
          name="verse_reference" 
          defaultValue={initialData?.verse_reference} 
          required 
          className="w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-light mb-1">Verse Text</label>
        <textarea 
          name="verse_text" 
          defaultValue={initialData?.verse_text} 
          rows={3} 
          required 
          className="w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-light mb-1">Prayer Title</label>
        <input 
          name="prayer_title" 
          defaultValue={initialData?.prayer_title} 
          required 
          className="w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-light mb-1">Prayer Text</label>
        <textarea 
          name="prayer_text" 
          defaultValue={initialData?.prayer_text} 
          rows={5} 
          required 
          className="w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none" 
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          {initialData ? "Update Devotion" : "Schedule Devotion"}
        </Button>
      </div>
    </form>
  );
}
