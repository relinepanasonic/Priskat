"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  HandHeart,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type FinanceEntry = {
  id: string;
  entry_date: string;
  entry_type: "donation" | "income" | "expense";
  category: string;
  donor_name: string | null;
  payment_method: string;
  amount: number;
  reference_no: string | null;
  notes: string | null;
};

const CATEGORIES = [
  "Persembahan Umum",
  "Dukungan Server & Aplikasi",
  "Pelayanan Komunitas",
  "Donasi Acara",
  "Operasional & Infrastruktur",
  "Lainnya",
];

const PAYMENT_METHODS = ["BCA", "QRIS", "Transfer Bank", "Tunai", "Lainnya"];
const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

export default function AccountingClient({
  initialEntries,
  userId,
  needsSql,
  lang = "id",
}: {
  initialEntries: FinanceEntry[];
  userId: string | null;
  needsSql: boolean;
  lang?: "id" | "en";
}) {
  const isEn = lang === "en";
  const db = () => createClient() as any;

  const [entries, setEntries] = useState<FinanceEntry[]>(initialEntries);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "donation" | "income" | "expense">("all");
  const [monthFilter, setMonthFilter] = useState("");

  // Add Entry modal
  const [open, setOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryType, setEntryType] = useState<FinanceEntry["entry_type"]>("donation");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [donorName, setDonorName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BCA");
  const [amount, setAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter !== "all" && e.entry_type !== typeFilter) return false;
      if (monthFilter && !e.entry_date.startsWith(monthFilter)) return false;
      if (!query) return true;
      return (
        (e.donor_name ?? "").toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.payment_method.toLowerCase().includes(query) ||
        (e.reference_no ?? "").toLowerCase().includes(query) ||
        (e.notes ?? "").toLowerCase().includes(query)
      );
    });
  }, [entries, q, typeFilter, monthFilter]);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const totalIn = entries
    .filter((e) => e.entry_type === "donation" || e.entry_type === "income")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthIn = entries
    .filter((e) => (e.entry_type === "donation" || e.entry_type === "income") && e.entry_date >= monthStart)
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalOut = entries
    .filter((e) => e.entry_type === "expense")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const netBalance = totalIn - totalOut;

  async function saveEntry(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Math.max(0, Number(amount.replace(/\D/g, "")) || 0);
    if (numericAmount <= 0) {
      setErr(isEn ? "Please enter a valid amount." : "Masukkan nominal yang valid.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await db()
        .from("erp_finance_entries")
        .insert({
          entry_date: entryDate,
          entry_type: entryType,
          category,
          donor_name: donorName.trim() || null,
          payment_method: paymentMethod,
          amount: numericAmount,
          reference_no: referenceNo.trim() || null,
          notes: notes.trim() || null,
          created_by: userId,
        })
        .select("*")
        .single();
      if (error || !data) throw new Error(error?.message || "Failed to save transaction.");
      setEntries((prev) => [data as FinanceEntry, ...prev]);
      setOpen(false);
      setDonorName("");
      setAmount("");
      setReferenceNo("");
      setNotes("");
    } catch (error) {
      setErr((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEntry(row: FinanceEntry) {
    if (!confirm(isEn ? "Delete this finance entry?" : "Hapus catatan transaksi ini?")) return;
    const { error } = await db().from("erp_finance_entries").delete().eq("id", row.id);
    if (!error) setEntries((prev) => prev.filter((x) => x.id !== row.id));
  }

  function exportCsv() {
    const header = ["Date", "Type", "Category", "Donor/Party", "Method", "Amount (IDR)", "Reference", "Notes"];
    const rows = filtered.map((e) => [
      e.entry_date,
      e.entry_type,
      e.category,
      e.donor_name ?? "",
      e.payment_method,
      String(e.amount),
      e.reference_no ?? "",
      (e.notes ?? "").replace(/\r?\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ruangiman-accounting-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            {isEn ? "Accounting Module" : "Modul Akuntansi"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {isEn ? "Donations & Ministry Finance" : "Donasi & Keuangan Pelayanan"}
          </h1>
          <p className="mt-1 text-xs text-brand-muted">
            {isEn
              ? "Clean ERP cashbook for recording donations, ministry offerings, and balances (BCA 3882171717)."
              : "Buku kas ERP untuk mencatat pemasukan donasi, persembahan pelayanan, dan saldo (BCA 3882171717)."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:border-brand-gold/45 disabled:opacity-40"
          >
            <Download className="h-4 w-4 text-brand-gold" /> Export CSV
          </button>
          {!needsSql && (
            <button
              type="button"
              onClick={() => { setErr(null); setOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark shadow-md hover:bg-brand-gold-hover"
            >
              <Plus className="h-4 w-4" />
              {isEn ? "Record Entry" : "Catat Donasi / Kas"}
            </button>
          )}
        </div>
      </div>

      {needsSql && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {isEn
            ? "Run supabase/147_admin_erp.sql in Supabase SQL Editor to activate the Donations & Accounting Ledger."
            : "Jalankan supabase/147_admin_erp.sql di Supabase SQL Editor untuk mengaktifkan Buku Kas Donasi & Akuntansi."}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/25 bg-[#151921] p-4">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">{isEn ? "Total Donations" : "Total Pemasukan"}</span>
            <HandHeart className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{rupiah(totalIn)}</p>
        </div>
        <div className="rounded-2xl border border-brand-gold/25 bg-[#151921] p-4">
          <div className="flex items-center justify-between text-brand-gold">
            <span className="text-[11px] font-bold uppercase tracking-wider">{isEn ? "This Month" : "Bulan Ini"}</span>
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{rupiah(monthIn)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#151921] p-4">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">{isEn ? "Expenses" : "Pengeluaran"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{rupiah(totalOut)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#151921] p-4">
          <div className="flex items-center justify-between text-sky-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">{isEn ? "Net Balance" : "Saldo Bersih"}</span>
            <Wallet className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{rupiah(netBalance)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isEn ? "Search donor, category, bank, or notes..." : "Cari donatur, kategori, bank, atau catatan..."}
            className="w-full rounded-xl border border-white/10 bg-[#151921] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-xl border border-white/10 bg-[#151921] px-3 py-2.5 text-xs font-semibold text-white focus:border-brand-gold focus:outline-none"
        >
          <option value="all">{isEn ? "All Types" : "Semua Jenis"}</option>
          <option value="donation">{isEn ? "Donations" : "Donasi"}</option>
          <option value="income">{isEn ? "Other Income" : "Pemasukan Lain"}</option>
          <option value="expense">{isEn ? "Expenses" : "Pengeluaran"}</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#151921] px-3 py-2.5 text-xs font-semibold text-white focus:border-brand-gold focus:outline-none"
        />
      </div>

      {/* Ledger Table */}
      <section className="rounded-2xl border border-white/10 bg-[#151921] p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <HandHeart className="mx-auto h-9 w-9 text-brand-gold/40" />
            <p className="mt-2.5 text-sm font-semibold text-white">
              {isEn ? "No accounting entries yet" : "Belum ada catatan transaksi"}
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              {isEn ? "Click Record Entry to log your first donation or offering." : "Klik Catat Donasi / Kas untuk mulai mencatat persembahan."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2.5 pr-3">{isEn ? "Date" : "Tanggal"}</th>
                  <th className="py-2.5 pr-3">{isEn ? "Type" : "Jenis"}</th>
                  <th className="py-2.5 pr-3">{isEn ? "Donor / Description" : "Donatur / Keterangan"}</th>
                  <th className="py-2.5 pr-3">{isEn ? "Method" : "Metode"}</th>
                  <th className="py-2.5 pr-3 text-right">{isEn ? "Amount" : "Nominal"}</th>
                  <th className="py-2.5 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap py-3 pr-3 font-mono text-brand-muted">{row.entry_date}</td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        row.entry_type === "expense"
                          ? "bg-red-500/15 text-red-300"
                          : row.entry_type === "donation"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-brand-gold/15 text-brand-gold"
                      }`}>
                        {row.entry_type === "donation"
                          ? (isEn ? "Donation" : "Donasi")
                          : row.entry_type === "income"
                          ? (isEn ? "Income" : "Pemasukan")
                          : (isEn ? "Expense" : "Pengeluaran")}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-white">{row.donor_name || row.category}</p>
                      <p className="text-[11px] text-brand-muted">
                        {row.category}{row.reference_no ? ` · Ref: ${row.reference_no}` : ""}{row.notes ? ` · ${row.notes}` : ""}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-3 text-brand-light">{row.payment_method}</td>
                    <td className={`whitespace-nowrap py-3 pr-3 text-right font-mono font-bold ${row.entry_type === "expense" ? "text-red-400" : "text-emerald-400"}`}>
                      {row.entry_type === "expense" ? "-" : "+"}{rupiah(Number(row.amount))}
                    </td>
                    <td className="py-3 text-right">
                      <button type="button" onClick={() => void deleteEntry(row)} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Record Transaction Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form
            onSubmit={saveEntry}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/15 bg-[#151921] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {isEn ? "Record Donation / Finance Entry" : "Catat Donasi / Transaksi Kas"}
              </h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Date" : "Tanggal"}</label>
                  <input type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Type" : "Jenis"}</label>
                  <select value={entryType} onChange={(e) => setEntryType(e.target.value as FinanceEntry["entry_type"])} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none">
                    <option value="donation">{isEn ? "Donation" : "Donasi"}</option>
                    <option value="income">{isEn ? "Other Income" : "Pemasukan Lain"}</option>
                    <option value="expense">{isEn ? "Expense" : "Pengeluaran"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Amount (Rp) *" : "Nominal (Rp) *"}</label>
                <input required inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000" className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 font-mono text-sm text-brand-gold focus:border-brand-gold focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Category" : "Kategori"}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Payment Method" : "Metode"}</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Donor / Name" : "Nama Donatur"}</label>
                  <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder={isEn ? "Anonymous / Name" : "Hamba Tuhan / Nama"} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Reference No." : "No. Referensi"}</label>
                  <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="TRF-001" className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 font-mono text-white focus:border-brand-gold focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Notes" : "Catatan"}</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2 text-white focus:border-brand-gold focus:outline-none" />
              </div>
            </div>

            {err && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">{err}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-brand-light">
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button type="submit" disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-brand-dark disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEn ? "Save Entry" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
