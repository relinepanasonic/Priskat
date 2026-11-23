"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Copy, Download, ExternalLink, FileSpreadsheet, FileText, Image as ImageIcon, MessageCircle, Plus, QrCode, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_WA_TEMPLATE, rupiah, renderWaTemplate, ticketLink, waLink, type EventGroup, type Registration } from "@/lib/eventReg";
import { formatDate } from "@/lib/utils";
import { useEventData } from "./useEventData";
import { LinkPesertaButton, getRegisterLink } from "./LinkPeserta";

const db = () => createClient() as any;
const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";

type Crew = { id: string; name: string | null; position: string | null };
type SortKey = "name" | "paroki" | "phone" | "group" | "status";

/** Belum bayar until the Ketua, Wakil Ketua, Sekretaris or Bendahara marks it paid; Lunas shows the QR. */
const isPaid = (r: Registration) => r.status === "approved";
const statusText = (r: Registration) => (r.status === "approved" ? "Lunas" : r.status === "rejected" ? "Ditolak" : r.status === "cancelled" ? "Dibatalkan" : "Belum bayar");
const STATUS_STYLE = (r: Registration) =>
  r.status === "approved" ? "bg-emerald-500/15 text-emerald-300" : r.status === "rejected" || r.status === "cancelled" ? "bg-white/10 text-gray-400" : "bg-amber-500/15 text-amber-300";

const COLS: [SortKey, string][] = [["name", "Nama"], ["paroki", "Paroki"], ["phone", "WhatsApp"], ["group", "Grup"], ["status", "Status"]];

/** Peserta: everybody who registered, who has paid, their groups and QR ticket. Sortable from the column headers. */
export default function PesertaSection({ eventId, eventTitle, crew, canMarkPaid }: { eventId: string; eventTitle: string; crew: Crew[]; canMarkPaid: boolean }) {
  const { event, regs, groups, settings, loading, reload } = useEventData(eventId);
  const [filter, setFilter] = useState<"all" | "none" | string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<Registration | null>(null);
  const [proof, setProof] = useState<{ url: string; name: string } | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [copied, setCopied] = useState(false);

  const template = settings?.wa_template ?? DEFAULT_WA_TEMPLATE;

  const counts = useMemo(() => ({
    all: regs.length,
    paid: regs.filter(isPaid).length,
    unpaid: regs.filter((r) => !isPaid(r) && r.status !== "rejected" && r.status !== "cancelled").length,
    present: regs.filter((r) => r.checked_in_at).length,
    none: regs.filter((r) => !r.group_id).length,
  }), [regs]);

  const groupOf = (id: string | null | undefined) => groups.find((g) => g.id === id);
  const crewName = (id: string | null) => crew.find((c) => c.id === id)?.name ?? "";

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = regs.filter((r) =>
      (filter === "all" || (filter === "none" ? !r.group_id : r.group_id === filter)) &&
      (!t || r.full_name.toLowerCase().includes(t) || (r.phone ?? "").includes(t) || (r.paroki ?? "").toLowerCase().includes(t)),
    );
    if (!sort) return list;
    const val = (r: Registration) => {
      switch (sort.key) {
        case "name": return r.full_name;
        case "paroki": return r.paroki ?? "";
        case "phone": return r.phone ?? "";
        case "group": return groups.find((g) => g.id === r.group_id)?.name ?? "";
        default: return statusText(r);
      }
    };
    const dir = sort.dir === "asc" ? 1 : -1;
    // an empty value always goes last
    return [...list].sort((a, b) => {
      const x = val(a), y = val(b);
      if (!x && y) return 1;
      if (x && !y) return -1;
      return x.localeCompare(y, "id", { numeric: true, sensitivity: "base" }) * dir;
    });
  }, [regs, filter, q, sort, groups]);

  async function run(id: string, fn: () => Promise<{ error: { message: string } | null }>) {
    setBusy(id); setError(null);
    const { error: err } = await fn();
    setBusy(null);
    if (err) { setError(err.message); return false; }
    await reload();
    return true;
  }

  const setGroup = (r: Registration, g: string) => run(r.id, () => db().rpc("set_registration_group", { p_reg: r.id, p_group: g || null }));

  async function setPaid(r: Registration, paid: boolean) {
    const msg = paid
      ? `Tandai ${r.full_name} sudah bayar${r.amount > 0 ? ` ${rupiah(r.amount)}` : ""}? ${r.amount > 0 ? "Uangnya dicatat sebagai pemasukan di Keuangan, dan " : ""}QR Code akan muncul.`
      : `Kembalikan ${r.full_name} ke "Belum bayar"? Pemasukannya dihapus dari Keuangan dan QR Code disembunyikan.`;
    if (!confirm(msg)) return;
    const ok = await run(r.id, () => db().rpc("set_registration_paid", { p_reg: r.id, p_paid: paid }));
    if (ok && paid) {
      // QR ticket by email (needs the person's email), and the "your registration was decided" push
      void fetch(`/api/events/${eventId}/notify-paid`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reg: r.id }) }).catch(() => {});
      void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "registration_decided", id: r.id }) }).catch(() => {});
    }
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

  // the WhatsApp message with the QR link: our default text, or the crew's own (never empty)
  const message = (r: Registration) => renderWaTemplate(template, {
    nama: r.full_name, event: eventTitle, link: ticketLink(r.ticket_code),
    tanggal: event?.event_date ? formatDate(event.event_date) : "", lokasi: event?.location ?? "",
  });
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  const exportQuery = `all=1${filter === "all" ? "" : `&group=${filter}`}`;
  const toggleSort = (key: SortKey, dir: "asc" | "desc") => setSort((s) => (s && s.key === key && s.dir === dir ? null : { key, dir }));

  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat peserta...</p>;

  const Arrows = ({ k }: { k: SortKey }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
      <button type="button" onClick={() => toggleSort(k, "asc")} aria-label={`Urutkan ${k} naik`} className={sort?.key === k && sort.dir === "asc" ? "text-brand-gold" : "text-gray-600 hover:text-white"}><ArrowUp className="h-3 w-3" /></button>
      <button type="button" onClick={() => toggleSort(k, "desc")} aria-label={`Urutkan ${k} turun`} className={sort?.key === k && sort.dir === "desc" ? "text-brand-gold" : "text-gray-600 hover:text-white"}><ArrowDown className="h-3 w-3" /></button>
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: "Terdaftar", v: counts.all, c: "text-white" },
          { l: "Belum bayar", v: counts.unpaid, c: "text-amber-300" },
          { l: "Lunas", v: counts.paid, c: "text-emerald-300" },
          { l: "Hadir", v: counts.present, c: "text-brand-gold" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-[#2a2d35] bg-[#14171c] p-3">
            <p className={`text-2xl font-bold ${m.c}`}>{m.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">{m.l}</p>
          </div>
        ))}
      </div>

      {/* three small buttons in one row: the link, the Excel list and the PDF list */}
      <div className="grid grid-cols-3 gap-2">
        <LinkPesertaButton compact run={() => getRegisterLink(eventId)} title="Buat link pendaftaran untuk peserta" />
        <a href={`/api/events/${eventId}/attendance?format=xlsx&${exportQuery}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#333] px-2 py-2 text-[11px] font-bold text-brand-light hover:bg-white/5"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</a>
        <a href={`/api/events/${eventId}/attendance?format=pdf&${exportQuery}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#333] px-2 py-2 text-[11px] font-bold text-brand-light hover:bg-white/5"><FileText className="h-3.5 w-3.5" /> PDF</a>
      </div>

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

      {/* phone: no column headers, so the sorting sits above the list */}
      <div className="flex items-center gap-2 md:hidden">
        <select value={sort?.key ?? ""} onChange={(e) => setSort(e.target.value ? { key: e.target.value as SortKey, dir: sort?.dir ?? "asc" } : null)} className="flex-1 rounded-lg border border-[#333] bg-[#14171c] px-3 py-2 text-xs text-white">
          <option value="">Urutkan: terbaru</option>
          {COLS.map(([k, l]) => <option key={k} value={k}>Urutkan: {l}</option>)}
        </select>
        <button type="button" disabled={!sort} onClick={() => sort && setSort({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })} aria-label="Balik urutan" className="flex shrink-0 items-center gap-1 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light disabled:opacity-40">
          {sort?.dir === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />} {sort?.dir === "desc" ? "Z-A" : "A-Z"}
        </button>
      </div>

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-8 text-center text-sm text-brand-muted">
          <UserRound className="mx-auto mb-2 h-8 w-8 text-gray-600" />
          Belum ada peserta di sini. Pakai tombol <b className="text-brand-gold">Link Peserta</b> untuk membagikan pendaftaran.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr_1.3fr] gap-3 border-b border-[#2a2d35] bg-black/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted md:grid">
            {COLS.map(([k, l]) => <span key={k} className="flex items-center">{l}<Arrows k={k} /></span>)}
            <span className="text-right">Aksi</span>
          </div>
          <ul className="divide-y divide-[#2a2d35]">
            {shown.map((r) => {
              const g = groupOf(r.group_id);
              return (
                <li key={r.id} className="space-y-2.5 px-4 py-3 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr_1.3fr] md:items-center md:gap-3 md:space-y-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{r.full_name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 md:hidden">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE(r)}`}>{statusText(r)}</span>
                      {r.amount > 0 && <span className="text-[11px] text-brand-muted">{rupiah(r.amount)}</span>}
                    </div>
                    {r.checked_in_at && <p className="mt-0.5 text-[11px] font-semibold text-brand-gold">Hadir ✓</p>}
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
                  <div className="hidden md:block">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE(r)}`}>{statusText(r)}</span>
                    {r.amount > 0 && <p className="mt-1 text-[11px] text-brand-muted">{rupiah(r.amount)}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                    {isPaid(r) ? (
                      <>
                        <button onClick={() => setQr(r)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gold px-2.5 py-1.5 text-xs font-bold text-brand-dark"><QrCode className="h-3.5 w-3.5" /> QR</button>
                        <a href={waLink(r.phone, message(r))} target="_blank" rel="noopener noreferrer" aria-label="Kirim lewat WhatsApp" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 px-2.5 py-1.5 text-xs font-bold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> WA</a>
                        {canMarkPaid && <button disabled={busy === r.id} onClick={() => setPaid(r, false)} className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-gray-400 underline hover:text-red-300 disabled:opacity-50">Batalkan</button>}
                      </>
                    ) : (
                      <>
                        {r.proof_path && <button onClick={() => viewProof(r)} className="inline-flex items-center gap-1 rounded-lg border border-[#333] px-2 py-1.5 text-xs font-semibold text-brand-light"><ImageIcon className="h-3.5 w-3.5" /> Bukti</button>}
                        {canMarkPaid ? (
                          <button disabled={busy === r.id} onClick={() => setPaid(r, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-emerald-950 disabled:opacity-60"><Check className="h-3.5 w-3.5" /> Tandai lunas</button>
                        ) : (
                          <span className="text-[11px] text-brand-muted" title="Hanya Ketua, Wakil Ketua, Sekretaris, dan Bendahara">Menunggu konfirmasi bendahara</span>
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
