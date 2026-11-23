"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileSpreadsheet, FileText, Image as ImageIcon, MessageCircle, Plus, QrCode, Trash2, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, STATUS_LABEL, ticketLink, waLink, type EventGroup, type Registration } from "@/lib/eventReg";
import { useEventData } from "./useEventData";
import { LinkPesertaButton, getRegisterLink } from "./LinkPeserta";

const db = () => createClient() as any;
const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const STATUS_STYLE: Record<string, string> = {
  awaiting_payment: "bg-amber-500/15 text-amber-300",
  pending_review: "bg-sky-500/15 text-sky-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
  cancelled: "bg-white/10 text-gray-400",
};

type Crew = { id: string; name: string | null; position: string | null };

/** Peserta: everybody who registered (also by the short link), the groups they are in, and a QR ticket to send by WhatsApp. */
export default function PesertaSection({ eventId, eventTitle, crew }: { eventId: string; eventTitle: string; crew: Crew[] }) {
  const { regs, groups, settings, loading, reload } = useEventData(eventId);
  const [filter, setFilter] = useState<"all" | "none" | string>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<Registration | null>(null);
  const [proof, setProof] = useState<{ url: string; name: string } | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => ({
    all: regs.length,
    approved: regs.filter((r) => r.status === "approved").length,
    present: regs.filter((r) => r.checked_in_at).length,
    none: regs.filter((r) => !r.group_id).length,
  }), [regs]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return regs.filter((r) =>
      (filter === "all" || (filter === "none" ? !r.group_id : r.group_id === filter)) &&
      (!t || r.full_name.toLowerCase().includes(t) || (r.phone ?? "").includes(t) || (r.paroki ?? "").toLowerCase().includes(t)),
    );
  }, [regs, filter, q]);

  const groupOf = (id: string | null | undefined) => groups.find((g) => g.id === id);
  const crewName = (id: string | null) => crew.find((c) => c.id === id)?.name ?? "";

  async function run(id: string, fn: () => Promise<{ error: { message: string } | null }>) {
    setBusy(id); setError(null);
    const { error: err } = await fn();
    setBusy(null);
    if (err) { setError(err.message); return false; }
    await reload();
    return true;
  }

  const setGroup = (r: Registration, g: string) => run(r.id, () => db().rpc("set_registration_group", { p_reg: r.id, p_group: g || null }));
  async function decide(r: Registration, approve: boolean) {
    let reason = "";
    if (!approve) { const x = window.prompt("Alasan penolakan (boleh dikosongkan):", ""); if (x === null) return; reason = x; }
    const ok = await run(r.id, () => db().rpc("decide_registration", { p_reg: r.id, p_approve: approve, p_reason: reason }));
    if (ok) void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "registration_decided", id: r.id }) }).catch(() => {});
  }
  async function viewProof(r: Registration) {
    if (!r.proof_path) return;
    const { data, error: err } = await createClient().storage.from("event-proofs").createSignedUrl(r.proof_path, 300);
    if (err || !data) { setError("Foto bukti belum bisa dibuka."); return; }
    setProof({ url: data.signedUrl, name: r.full_name });
  }

  async function addGroup() {
    const name = newGroup.trim();
    if (!name) return;
    const ok = await run("new-group", () => db().from("event_groups").insert({ event_id: eventId, name }));
    if (ok) setNewGroup("");
  }
  const renameGroup = (g: EventGroup) => {
    const name = window.prompt("Nama grup:", g.name)?.trim();
    if (name && name !== g.name) void run(g.id, () => db().from("event_groups").update({ name }).eq("id", g.id));
  };
  const setFacilitator = (g: EventGroup, crewId: string) => run(g.id, () => db().from("event_groups").update({ facilitator_crew_id: crewId || null }).eq("id", g.id));
  const deleteGroup = (g: EventGroup) => {
    if (!confirm(`Hapus grup "${g.name}"? Pesertanya tidak ikut terhapus, hanya keluar dari grup.`)) return;
    if (filter === g.id) setFilter("all");
    void run(g.id, () => db().from("event_groups").delete().eq("id", g.id));
  };

  const exportQuery = `all=1${filter === "all" ? "" : `&group=${filter}`}`;
  const message = (r: Registration) => `Halo ${r.full_name}, ini tiket QR kamu untuk ${eventTitle}. Tunjukkan QR ini kepada panitia saat acara: ${ticketLink(r.ticket_code)}`;

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat peserta...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Terdaftar", v: counts.all, c: "text-white" },
          { l: "Disetujui", v: counts.approved, c: "text-emerald-300" },
          { l: "Sudah hadir", v: counts.present, c: "text-brand-gold" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-[#2a2d35] bg-[#14171c] p-3">
            <p className={`text-2xl font-bold ${m.c}`}>{m.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">{m.l}</p>
          </div>
        ))}
      </div>

      <LinkPesertaButton run={() => getRegisterLink(eventId)} title="Buat link pendaftaran untuk peserta" />

      <div className="grid grid-cols-2 gap-2">
        <a href={`/api/events/${eventId}/attendance?format=xlsx&${exportQuery}`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light hover:bg-white/5"><FileSpreadsheet className="h-4 w-4" /> Unduh Excel</a>
        <a href={`/api/events/${eventId}/attendance?format=pdf&${exportQuery}`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light hover:bg-white/5"><FileText className="h-4 w-4" /> Unduh PDF</a>
      </div>

      {/* Groups */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[["all", "Semua", counts.all], ...groups.map((g) => [g.id, g.name, regs.filter((r) => r.group_id === g.id).length] as [string, string, number]), ["none", "Tanpa grup", counts.none]].map(([k, l, n]) => (
          <button key={String(k)} onClick={() => setFilter(String(k))} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${filter === k ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted"}`}>{l} {n}</button>
        ))}
        <button onClick={() => setShowGroups((v) => !v)} className="shrink-0 rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-semibold text-brand-gold">{showGroups ? "Tutup grup" : "Kelola grup"}</button>
      </div>

      {showGroups && (
        <div className="space-y-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
          <div className="flex gap-2">
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void addGroup()} placeholder="Nama grup baru (mis. Grup 1)" className={input} />
            <button onClick={addGroup} disabled={busy === "new-group"} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-gold px-3 text-sm font-bold text-brand-dark disabled:opacity-60"><Plus className="h-4 w-4" /> Tambah</button>
          </div>
          {groups.length === 0 && <p className="text-xs text-brand-muted">Belum ada grup. Tambahkan grup, lalu pilih grup untuk setiap peserta.</p>}
          {groups.map((g) => (
            <div key={g.id} className="space-y-2 rounded-xl border border-[#2a2d35] p-3">
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => renameGroup(g)} className="min-w-0 truncate text-left text-sm font-bold text-white hover:text-brand-gold" title="Ubah nama">{g.name}</button>
                <span className="shrink-0 text-xs text-brand-muted">{regs.filter((r) => r.group_id === g.id).length} peserta</span>
                <button onClick={() => deleteGroup(g)} aria-label="Hapus grup" className="shrink-0 rounded p-1.5 text-[#555] hover:bg-[#222] hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Fasilitator (PIC grup)</label>
              <select value={g.facilitator_crew_id ?? ""} onChange={(e) => void setFacilitator(g, e.target.value)} className={input}>
                <option value="">-- Belum ada fasilitator --</option>
                {crew.map((c) => <option key={c.id} value={c.id}>{c.name}{c.position ? ` (${c.position})` : ""}</option>)}
              </select>
            </div>
          ))}
          {crew.length === 0 && <p className="text-xs text-amber-300">Fasilitator dipilih dari tab Panitia. Tambahkan panitia dulu.</p>}
        </div>
      )}

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, paroki, atau nomor HP" className={input} />
      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-8 text-center text-sm text-brand-muted">
          <UserRound className="mx-auto mb-2 h-8 w-8 text-gray-600" />
          Belum ada peserta di sini.{!settings?.public_code && <> Buka tab Promosi untuk membuat link pendaftaran.</>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] gap-3 border-b border-[#2a2d35] bg-black/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted md:grid">
            <span>Nama</span><span>Paroki</span><span>WhatsApp</span><span>Grup</span><span className="text-right">Aksi</span>
          </div>
          <ul className="divide-y divide-[#2a2d35]">
            {shown.map((r) => {
              const g = groupOf(r.group_id);
              return (
                <li key={r.id} className="space-y-2.5 px-4 py-3 md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] md:items-center md:gap-3 md:space-y-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{r.full_name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                      {r.amount > 0 && <span className="text-[11px] text-brand-muted">{rupiah(r.amount)}</span>}
                      {r.checked_in_at && <span className="text-[11px] font-semibold text-brand-gold">Hadir ✓</span>}
                    </div>
                  </div>
                  <p className="truncate text-xs text-brand-light">{r.paroki || <span className="text-brand-muted">-</span>}</p>
                  <p className="truncate text-xs text-brand-light">{r.phone || <span className="text-brand-muted">-</span>}</p>
                  <div className="min-w-0">
                    <select value={r.group_id ?? ""} onChange={(e) => void setGroup(r, e.target.value)} disabled={busy === r.id || groups.length === 0} className="w-full rounded-lg border border-[#333] bg-[#0f1216] px-2 py-1.5 text-xs text-white disabled:opacity-50">
                      <option value="">{groups.length ? "Tanpa grup" : "Belum ada grup"}</option>
                      {groups.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                    </select>
                    {g?.facilitator_crew_id && <p className="mt-1 truncate text-[10px] text-brand-muted">Fasilitator: {crewName(g.facilitator_crew_id)}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                    {r.status === "approved" ? (
                      <>
                        <button onClick={() => setQr(r)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gold px-2.5 py-1.5 text-xs font-bold text-brand-dark"><QrCode className="h-3.5 w-3.5" /> QR</button>
                        <a href={waLink(r.phone, message(r))} target="_blank" rel="noopener noreferrer" aria-label="Kirim lewat WhatsApp" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 px-2.5 py-1.5 text-xs font-bold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> WA</a>
                      </>
                    ) : (
                      <>
                        {r.proof_path && <button onClick={() => viewProof(r)} className="inline-flex items-center gap-1 rounded-lg border border-[#333] px-2 py-1.5 text-xs font-semibold text-brand-light"><ImageIcon className="h-3.5 w-3.5" /> Bukti</button>}
                        {(r.status === "pending_review" || r.status === "awaiting_payment" || r.status === "rejected") && (
                          <button disabled={busy === r.id} onClick={() => decide(r, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-emerald-950 disabled:opacity-60"><Check className="h-3.5 w-3.5" /> Setujui</button>
                        )}
                        {(r.status === "pending_review" || r.status === "awaiting_payment") && (
                          <button disabled={busy === r.id} onClick={() => decide(r, false)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/50 px-2.5 py-1.5 text-xs font-bold text-red-300 disabled:opacity-60"><X className="h-3.5 w-3.5" /> Tolak</button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" onClick={() => setQr(null)}>
          <div className="w-full max-w-xs space-y-3 rounded-2xl bg-[#1a1d24] p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-sm font-bold text-white">{qr.full_name}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/ticket/${qr.ticket_code}/qr`} alt="QR Code" className="mx-auto w-56 rounded-xl bg-white p-2" />
            <a href={waLink(qr.phone, message(qr))} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950"><MessageCircle className="h-4 w-4" /> Kirim ke WhatsApp</a>
            <a href={`/api/ticket/${qr.ticket_code}/card?dl=1`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-sm font-semibold text-brand-light"><Download className="h-4 w-4" /> Unduh tiket</a>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => copy(ticketLink(qr.ticket_code))} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#333] py-2 text-xs font-semibold text-brand-light">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Tersalin" : "Salin link"}</button>
              <a href={ticketLink(qr.ticket_code)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-[#333] py-2 text-xs font-semibold text-brand-light"><ExternalLink className="h-3.5 w-3.5" /> Buka</a>
            </div>
            <button onClick={() => setQr(null)} className="w-full rounded-lg py-2 text-sm text-brand-muted hover:text-white">Tutup</button>
          </div>
        </div>
      )}

      {proof && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4" onClick={() => setProof(null)}>
          <div className="max-h-[90vh] max-w-md overflow-auto rounded-2xl bg-[#1a1d24] p-3" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-sm font-semibold text-white">Bukti transfer: {proof.name}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proof.url} alt="Bukti transfer" className="w-full rounded-lg" />
            <button onClick={() => setProof(null)} className="mt-3 w-full rounded-lg border border-[#333] py-2 text-sm text-brand-light">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
