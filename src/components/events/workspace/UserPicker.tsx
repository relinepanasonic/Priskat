"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputCls } from "./ui";

export type PickedUser = { id: string; full_name: string | null; username: string | null };

/** Find a Ruang Iman account by typing a name or username, then pick it. */
export default function UserPicker({ value, onChange, placeholder = "Ketik nama atau username" }: { value: PickedUser | null; onChange: (u: PickedUser | null) => void; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PickedUser[]>([]);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const term = q.trim().replace(/[%,()]/g, " ");
    if (value || term.length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      const { data } = await (createClient() as any).from("profiles").select("id, full_name, username")
        .or(`full_name.ilike.%${term}%,username.ilike.%${term}%`).eq("is_bot", false).order("full_name").limit(8);
      setHits((data as PickedUser[]) ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, value]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
        <span className="min-w-0 truncate"><b>{value.full_name}</b> <span className="text-emerald-200/80">@{value.username}</span></span>
        <button type="button" onClick={() => { onChange(null); setQ(""); }} className="shrink-0 text-xs font-semibold hover:text-white">Ganti</button>
      </div>
    );
  }
  return (
    <div className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder={placeholder} autoComplete="off" className={inputCls} />
      {focus && hits.length > 0 && (
        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#333] bg-[#14171c] p-1 shadow-xl">
          {hits.map((u) => (
            <li key={u.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(u); setFocus(false); }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5">
                <span className="truncate">{u.full_name}</span><span className="shrink-0 text-xs text-brand-muted">@{u.username}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
