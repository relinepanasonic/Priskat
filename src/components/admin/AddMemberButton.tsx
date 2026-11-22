"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type P = { id: string; full_name: string | null; nama_panggilan: string | null; username: string | null; avatar_url: string | null; kota: string | null };

/** Add people who already have a Ruang Iman account to this community: search by name or username, tap Tambah. */
export default function AddMemberButton({ communityId, communityName, memberIds }: { communityId: string; communityName: string; memberIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<P[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const t = window.setTimeout(async () => {
      setLoading(true);
      const supabase = createClient() as any;
      const term = q.trim().replace(/[%,()]/g, " ");
      let query = supabase.from("profiles").select("id, full_name, nama_panggilan, username, avatar_url, kota").not("full_name", "is", null).order("created_at", { ascending: false }).limit(30);
      if (term) query = query.or(`full_name.ilike.%${term}%,nama_panggilan.ilike.%${term}%,username.ilike.%${term}%`);
      const [{ data }, bots] = await Promise.all([query, supabase.from("profiles").select("id").eq("is_bot", true)]);
      if (!alive) return;
      const botIds = new Set(((bots.data as { id: string }[]) ?? []).map((b) => b.id));
      setRows(((data as P[]) ?? []).filter((p) => !botIds.has(p.id)));
      setLoading(false);
    }, 250);
    return () => { alive = false; window.clearTimeout(t); };
  }, [q, open]);

  const members = new Set(memberIds);

  async function add(p: P) {
    setBusyId(p.id); setError(null);
    const { error: err } = await (createClient() as any).rpc("admin_add_member", { p_community: communityId, p_user: p.id });
    setBusyId(null);
    if (err) { setError(err.message); return; }
    setAdded((s) => new Set(s).add(p.id));
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-dark transition-opacity hover:opacity-90">
        <UserPlus className="h-4 w-4" /> Tambah anggota
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 md:items-center" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white md:rounded-3xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Tambah anggota</h3>
                <p className="text-xs text-brand-muted">Pilih dari semua pengguna Ruang Iman. Mereka masuk ke {communityName}.</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Tutup" className="rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau username" className="w-full rounded-lg border border-[#333] bg-[#14171c] py-2.5 pl-9 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none" />
            </div>

            {error && <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto">
              {loading && rows.length === 0 && <p className="py-6 text-center text-sm text-brand-muted">Mencari…</p>}
              {!loading && rows.length === 0 && <p className="py-6 text-center text-sm text-brand-muted">Tidak ada pengguna dengan nama itu.</p>}
              {rows.map((p) => {
                const isMember = members.has(p.id) || added.has(p.id);
                const name = p.nama_panggilan || p.full_name || p.username || "Pengguna";
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl bg-[#14171c] p-2.5">
                    {p.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-bold text-brand-gold">{name[0]?.toUpperCase()}</span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.full_name || name}</p>
                      <p className="truncate text-xs text-brand-muted">{[p.username && `@${p.username}`, p.kota].filter(Boolean).join(" · ")}</p>
                    </div>
                    {isMember ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300"><Check className="h-3.5 w-3.5" /> Anggota</span>
                    ) : (
                      <button onClick={() => add(p)} disabled={busyId === p.id} className="rounded-full bg-brand-gold px-3.5 py-1.5 text-xs font-bold text-brand-dark disabled:opacity-60">{busyId === p.id ? "…" : "Tambah"}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
