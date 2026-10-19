"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type CommunityOption = { id: string; name: string; logo_url: string | null };

/** People in several communities choose one as their main community (shown on their profile). */
export default function MainCommunityPicker({ options, mainId }: { options: CommunityOption[]; mainId: string | null }) {
  const router = useRouter();
  const [current, setCurrent] = useState<string | null>(mainId);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(id: string) {
    if (id === current) return;
    setBusy(id);
    setError(null);
    const { error } = await createClient().rpc("set_main_community", { p_community_id: id });
    setBusy(null);
    if (error) { setError(error.message); return; }
    setCurrent(id);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {options.map((c) => {
        const on = c.id === current;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => void choose(c.id)}
            disabled={busy !== null}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${on ? "border-brand-gold/60 bg-brand-gold/10" : "border-[#2a2d35] bg-[#1a1d24]"}`}
          >
            {c.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-sm font-bold text-brand-gold">{c.name[0]}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{c.name}</span>
              {on && <span className="block text-[11px] font-semibold text-brand-gold">Komunitas utama</span>}
            </span>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-[#444]"}`}>
              {on && <Check className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
