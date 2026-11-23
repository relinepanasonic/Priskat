"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

type Row = { id: string; kind: "masuk" | "keluar"; label: string; amount: number; entry_date: string; note: string | null };

const rupiah = (n: number) => `Rp ${Math.abs(n).toLocaleString("id-ID")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

/** Simple Keuangan for one event: money in, money out, balance. Writing is limited by the database to admins, Ketua and Bendahara. */
export default function CampFinance({ cohortId }: { cohortId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<"masuk" | "keluar">("masuk");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await createClient()
      .from("camp_finance")
      .select("id, kind, label, amount, entry_date, note")
      .eq("cohort_id", cohortId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    setRows(((data as Row[]) ?? []).map((r) => ({ ...r, amount: Number(r.amount) })));
    setLoading(false);
  }, [cohortId]);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const masuk = rows.filter((r) => r.kind === "masuk").reduce((s, r) => s + r.amount, 0);
    const keluar = rows.filter((r) => r.kind === "keluar").reduce((s, r) => s + r.amount, 0);
    return { masuk, keluar, saldo: masuk - keluar };
  }, [rows]);

  async function add() {
    const value = Math.round(Number(amount.replace(/[^\d]/g, "")));
    if (!label.trim() || !value) { setMsg("Isi keterangan dan jumlah."); return; }
    setSaving(true);
    setMsg("");
    const { error } = await createClient().from("camp_finance").insert({
      cohort_id: cohortId, kind, label: label.trim(), amount: value, entry_date: date || todayStr(), note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      setMsg(error.code === "42501" || /row-level security/i.test(error.message) ? "Hanya admin, Ketua dan Bendahara yang bisa mengisi keuangan." : error.message);
      return;
    }
    setLabel(""); setAmount(""); setNote("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    const { error } = await createClient().from("camp_finance").delete().eq("id", id);
    if (error) { setMsg("Tidak bisa menghapus: hanya admin, Ketua dan Bendahara."); return; }
    load();
  }

  const field = "w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-white">Keuangan</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#333] bg-[#1a1d24] p-4">
          <p className="text-xs text-brand-muted">Pemasukan</p>
          <p className="mt-1 text-lg font-bold text-emerald-400">{rupiah(totals.masuk)}</p>
        </div>
        <div className="rounded-xl border border-[#333] bg-[#1a1d24] p-4">
          <p className="text-xs text-brand-muted">Pengeluaran</p>
          <p className="mt-1 text-lg font-bold text-red-400">{rupiah(totals.keluar)}</p>
        </div>
        <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4">
          <p className="text-xs text-brand-muted">Saldo</p>
          <p className={`mt-1 text-lg font-bold ${totals.saldo < 0 ? "text-red-400" : "text-brand-gold"}`}>{totals.saldo < 0 ? "- " : ""}{rupiah(totals.saldo)}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#333] bg-[#1a1d24] p-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1 text-sm font-semibold">
          {(["masuk", "keluar"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 ${kind === k ? (k === "masuk" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300") : "text-brand-muted"}`}>
              {k === "masuk" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
              {k === "masuk" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Keterangan (mis. Pendaftaran peserta, Konsumsi)" className={field} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="Jumlah (Rp)" className={field} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${field} [color-scheme:dark]`} />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional)" className={field} />
        {msg && <p className="text-xs text-red-400">{msg}</p>}
        <button onClick={add} disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-dark hover:opacity-90 disabled:opacity-50">
          <Plus className="h-4 w-4" /> {saving ? "Menyimpan..." : "Tambah catatan"}
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-gray-500">Memuat...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-[#333] bg-[#1a1d24] p-8 text-center text-sm text-gray-500">Belum ada catatan keuangan.</p>
      ) : (
        <ul className="divide-y divide-[#2a2d35] overflow-hidden rounded-xl border border-[#333] bg-[#1a1d24]">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className={r.kind === "masuk" ? "text-emerald-400" : "text-red-400"}>
                {r.kind === "masuk" ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{r.label}</p>
                <p className="truncate text-xs text-brand-muted">{formatDate(r.entry_date)}{r.note ? ` · ${r.note}` : ""}</p>
              </div>
              <p className={`shrink-0 text-sm font-bold ${r.kind === "masuk" ? "text-emerald-400" : "text-red-400"}`}>{r.kind === "masuk" ? "+" : "-"}{rupiah(r.amount)}</p>
              <button onClick={() => remove(r.id)} aria-label="Hapus" className="shrink-0 rounded p-1.5 text-[#555] hover:bg-[#222] hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
