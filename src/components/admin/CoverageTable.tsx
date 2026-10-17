"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddBranchModal from "@/components/admin/AddBranchModal";

export type BranchRow = { id: string; negara: string; provinsi: string; kota: string; branch: string | null; camps: number };

export default function CoverageTable({ rows, canEdit }: { rows: BranchRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [onlyCovered, setOnlyCovered] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!onlyCovered || r.camps > 0) &&
        (!s || [r.negara, r.provinsi, r.kota, r.branch].some((v) => (v ?? "").toLowerCase().includes(s)))
    );
  }, [rows, q, onlyCovered]);

  const covered = rows.filter((r) => r.camps > 0).length;

  const remove = async (r: BranchRow) => {
    if (!confirm(`Hapus cabang ${r.branch || r.kota}?`)) return;
    const { error } = await createClient().from("branches").delete().eq("id", r.id);
    if (error) alert(error.message);
    else router.refresh();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Coverage</h2>
          <p className="text-sm text-brand-muted">{rows.length} cabang · {covered} sudah punya camp</p>
        </div>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-dark hover:opacity-90">
            <Plus className="h-4 w-4" /> Tambah Cabang
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kota, provinsi, negara…"
            className="w-full rounded-xl border border-[#333] bg-[#111] py-2.5 pl-10 pr-3 text-sm text-white placeholder-brand-muted focus:border-brand-gold/60 focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-muted">
          <input type="checkbox" checked={onlyCovered} onChange={(e) => setOnlyCovered(e.target.checked)} className="accent-[#D6B072]" />
          Hanya yang punya camp
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#333]">
        <table className="w-full min-w-[560px] text-left text-sm text-gray-300">
          <thead className="border-b border-[#333] bg-[#111] text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Negara</th>
              <th className="px-4 py-3">Provinsi</th>
              <th className="px-4 py-3">Kota (Cabang)</th>
              <th className="px-4 py-3 text-right">Camp</th>
              {canEdit && <th className="px-4 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d35]">
            {list.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-brand-muted">Tidak ada cabang.</td></tr>
            )}
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.negara}</td>
                <td className="px-4 py-3">{r.provinsi}</td>
                <td className="px-4 py-3 font-semibold text-brand-gold">{r.branch || r.kota}</td>
                <td className="px-4 py-3 text-right">
                  {r.camps > 0 ? <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-xs font-bold text-brand-gold">{r.camps}</span> : <span className="text-brand-muted">—</span>}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r)} aria-label={`Hapus ${r.kota}`} className="rounded-lg p-2 text-brand-muted hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddBranchModal isOpen={adding} onClose={() => setAdding(false)} onSuccess={() => { setAdding(false); router.refresh(); }} />
    </div>
  );
}
