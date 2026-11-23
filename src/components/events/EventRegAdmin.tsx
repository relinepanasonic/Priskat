"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ExternalLink, FileSpreadsheet, FileText, Image as ImageIcon, Plus, Printer, ScanLine, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import QrScanner from "@/components/events/QrScanner";
import { codeFromScan, registerLink, rupiah, STATUS_LABEL, type RegField, type RegSettings, type Registration } from "@/lib/eventReg";

const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const db = () => createClient() as any;
type Tab = "peserta" | "scan" | "pengaturan";
type ScanResult = { result: "ok" | "already" | "not_approved" | "invalid" | "forbidden"; name?: string; at?: string };

const STATUS_STYLE: Record<string, string> = {
  awaiting_payment: "bg-amber-500/15 text-amber-300",
  pending_review: "bg-sky-500/15 text-sky-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
  cancelled: "bg-white/10 text-gray-400",
};

/** The event admin's console: participants (approve or reject the transfer), the QR scanner, and the registration settings. */
export default function EventRegAdmin({
  eventId, eventTitle, settings, regs, capacity,
}: { eventId: string; eventTitle: string; settings: RegSettings | null; regs: Registration[]; capacity: number | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("peserta");
  const [filter, setFilter] = useState<"all" | Registration["status"]>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<{ url: string; name: string } | null>(null);

  const counts = useMemo(() => {
    const c = { all: regs.length, pending_review: 0, awaiting_payment: 0, approved: 0, rejected: 0, cancelled: 0, present: 0 };
    regs.forEach((r) => { c[r.status] += 1; if (r.checked_in_at) c.present += 1; });
    return c;
  }, [regs]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return regs.filter((r) => (filter === "all" || r.status === filter) && (!t || r.full_name.toLowerCase().includes(t) || (r.phone ?? "").includes(t)));
  }, [regs, filter, q]);

  async function notify(id: string) {
    void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "registration_decided", id }) }).catch(() => {});
  }

  async function decide(r: Registration, approve: boolean) {
    let reason = "";
    if (!approve) { const x = window.prompt("Alasan penolakan (boleh dikosongkan):", ""); if (x === null) return; reason = x; }
    setBusy(r.id); setError(null);
    const { error: err } = await db().rpc("decide_registration", { p_reg: r.id, p_approve: approve, p_reason: reason });
    setBusy(null);
    if (err) { setError(err.message); return; }
    void notify(r.id);
    router.refresh();
  }

  async function attendance(r: Registration, present: boolean) {
    setBusy(r.id); setError(null);
    const { error: err } = await db().rpc("set_attendance", { p_reg: r.id, p_present: present });
    setBusy(null);
    if (err) { setError(err.message); return; }
    router.refresh();
  }

  async function viewPhoto(path: string, name: string) {
    const { data, error: err } = await createClient().storage.from("event-guest-photos").createSignedUrl(path.replace(/^photo:/, ""), 300);
    if (err || !data) { setError("Foto belum bisa dibuka."); return; }
    setProof({ url: data.signedUrl, name });
  }

  async function viewProof(r: Registration) {
    if (!r.proof_path) return;
    const { data, error: err } = await createClient().storage.from("event-proofs").createSignedUrl(r.proof_path, 300);
    if (err || !data) { setError("Foto bukti belum bisa dibuka."); return; }
    setProof({ url: data.signedUrl, name: r.full_name });
  }

  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [["Nama", "HP", "Status", "Jumlah", "Hadir", "Daftar"], ...regs.map((r) => [r.full_name, r.phone ?? "", STATUS_LABEL[r.status], String(r.amount), r.checked_in_at ? "Ya" : "Tidak", r.created_at.slice(0, 10)])];
    const blob = new Blob(["﻿" + rows.map((x) => x.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `peserta-${eventTitle.slice(0, 30)}.csv`; a.click();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Menunggu cek", v: counts.pending_review, c: "text-sky-300" },
          { l: capacity ? `Disetujui / ${capacity}` : "Disetujui", v: counts.approved, c: "text-emerald-300" },
          { l: "Sudah hadir", v: counts.present, c: "text-brand-gold" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-[#2a2d35] bg-[#14171c] p-3">
            <p className={`text-2xl font-bold ${m.c}`}>{m.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">{m.l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {([["peserta", "Peserta"], ["scan", "Scan QR"], ["pengaturan", "Pengaturan"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${tab === k ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted"}`}>
            {k === "scan" && <ScanLine className="mr-1 inline h-4 w-4" />}{l}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {tab === "peserta" && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([["all", "Semua", counts.all], ["pending_review", "Cek bukti", counts.pending_review], ["awaiting_payment", "Belum bayar", counts.awaiting_payment], ["approved", "Disetujui", counts.approved], ["rejected", "Ditolak", counts.rejected]] as ["all" | Registration["status"], string, number][]).map(([k, l, n]) => (
              <button key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${filter === k ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted"}`}>{l} {n}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, paroki, atau nomor HP" className={input} />
            <button onClick={exportCsv} className="shrink-0 rounded-lg border border-[#333] px-3 text-xs font-semibold text-brand-light">CSV</button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a href={`/api/events/${eventId}/tickets?size=${settings?.ticket_size ?? "a5"}`} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 py-2.5 text-xs font-bold text-brand-gold"><Printer className="h-4 w-4" /> Cetak semua tiket (PDF)</a>
            <a href={`/api/events/${eventId}/attendance?format=xlsx`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light"><FileSpreadsheet className="h-4 w-4" /> Absensi Excel</a>
            <a href={`/api/events/${eventId}/attendance?format=pdf`} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-xs font-bold text-brand-light"><FileText className="h-4 w-4" /> Absensi PDF</a>
          </div>

          {shown.length === 0 && <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">Belum ada peserta di sini.</p>}
          {shown.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{r.full_name}</p>
                  <p className="text-xs text-brand-muted">{r.phone ?? "Tanpa nomor HP"} · {rupiah(r.amount)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
              {(r.paroki || r.email) && <p className="mt-1 text-xs text-brand-muted">{[r.paroki, r.email].filter(Boolean).join(" · ")}</p>}
              {Object.entries(r.answers ?? {}).filter(([, v]) => v && !String(v).startsWith("photo:")).length > 0 && (
                <p className="mt-1.5 text-xs text-brand-light">{Object.entries(r.answers).filter(([, v]) => v && !String(v).startsWith("photo:")).map(([k, v]) => `${settings?.fields.find((f) => f.key === k)?.label ?? k}: ${v}`).join(" · ")}</p>
              )}
              {Object.entries(r.answers ?? {}).filter(([, v]) => String(v).startsWith("photo:")).map(([k, v]) => (
                <button key={k} onClick={() => viewPhoto(String(v), r.full_name)} className="mt-1.5 mr-2 inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-2.5 py-1.5 text-xs font-semibold text-brand-light"><ImageIcon className="h-3.5 w-3.5" /> {settings?.fields.find((f) => f.key === k)?.label ?? "Foto"}</button>
              ))}
              {r.reject_reason && <p className="mt-1 text-xs text-red-300">Ditolak: {r.reject_reason}</p>}

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {r.proof_path && (
                  <button onClick={() => viewProof(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-2.5 py-1.5 text-xs font-semibold text-brand-light"><ImageIcon className="h-3.5 w-3.5" /> Lihat bukti</button>
                )}
                {(r.status === "pending_review" || r.status === "awaiting_payment" || r.status === "rejected") && (
                  <button disabled={busy === r.id} onClick={() => decide(r, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950 disabled:opacity-60"><Check className="h-3.5 w-3.5" /> Setujui</button>
                )}
                {(r.status === "pending_review" || r.status === "awaiting_payment" || r.status === "approved") && (
                  <button disabled={busy === r.id} onClick={() => decide(r, false)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/50 px-3 py-1.5 text-xs font-bold text-red-300 disabled:opacity-60"><X className="h-3.5 w-3.5" /> Tolak</button>
                )}
                {r.status === "approved" && (
                  <a href={`/api/ticket/${r.ticket_code}/card?dl=1`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-2.5 py-1.5 text-xs font-semibold text-brand-light"><Download className="h-3.5 w-3.5" /> Tiket</a>
                )}
                {r.status === "approved" && (
                  <button disabled={busy === r.id} onClick={() => attendance(r, !r.checked_in_at)} className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-bold ${r.checked_in_at ? "bg-brand-gold/20 text-brand-gold" : "border border-[#333] text-brand-light"}`}>
                    {r.checked_in_at ? "Hadir ✓ (batalkan)" : "Tandai hadir"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "scan" && <ScanTab eventId={eventId} present={counts.present} total={counts.approved} onDone={() => router.refresh()} />}
      {tab === "pengaturan" && <SettingsTab eventId={eventId} settings={settings} onSaved={() => router.refresh()} />}

      {proof && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4" onClick={() => setProof(null)}>
          <div className="max-h-[90vh] max-w-md overflow-auto rounded-2xl bg-[#1a1d24] p-3" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 flex items-center justify-between text-sm font-semibold text-white">Bukti transfer: {proof.name}
              <a href={proof.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold"><ExternalLink className="h-4 w-4" /></a>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proof.url} alt="Bukti transfer" className="w-full rounded-lg" />
            <button onClick={() => setProof(null)} className="mt-3 w-full rounded-lg border border-[#333] py-2 text-sm text-brand-light">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Scan tickets at the door. Green = welcome and attendance saved; amber = already scanned; red = not valid. */
function ScanTab({ eventId, present, total, onDone }: { eventId: string; present: number; total: number; onDone: () => void }) {
  const [res, setRes] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);

  const check = useCallback(async (raw: string) => {
    const code = codeFromScan(raw);
    if (!code || busy) return;
    setBusy(true);
    const { data, error } = await db().rpc("event_check_in", { p_code: code });
    setBusy(false);
    const r: ScanResult = error ? { result: "forbidden" } : (data as ScanResult);
    setRes(r);
    try { navigator.vibrate?.(r.result === "ok" ? 120 : [80, 60, 80]); } catch { /* ignore */ }
    if (r.result === "ok") onDone();
  }, [busy, onDone]);

  const tone = res?.result === "ok" ? "border-emerald-500 bg-emerald-500/15" : res?.result === "already" ? "border-amber-500 bg-amber-500/15" : "border-red-500 bg-red-500/15";
  const text: Record<ScanResult["result"], string> = {
    ok: "Hadir. Selamat datang!",
    already: "Tiket ini sudah dipindai",
    not_approved: "Pendaftaran belum disetujui",
    invalid: "QR tidak dikenal",
    forbidden: "Kamu bukan admin acara ini, atau tiket ini milik acara lain",
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-brand-light">Hadir <b className="text-brand-gold">{present}</b> dari <b className="text-white">{total}</b> peserta yang disetujui</p>
      <QrScanner onScan={(t) => void check(t)} paused={busy} />
      {res && (
        <div className={`rounded-2xl border-2 p-4 text-center ${tone}`}>
          {res.name && <p className="text-xl font-bold text-white">{res.name}</p>}
          <p className="mt-1 text-sm font-semibold text-white">{text[res.result]}</p>
          {res.result === "already" && res.at && <p className="mt-1 text-xs text-brand-light">Pukul {new Date(res.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}</p>}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); void check(manual); setManual(""); }} className="flex gap-2">
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Atau ketik kode tiket" className={input} />
        <button type="submit" className="shrink-0 rounded-lg bg-brand-gold px-4 text-sm font-bold text-brand-dark">Cek</button>
      </form>
      <p className="text-center text-[11px] text-brand-muted">Event ID {eventId.slice(0, 8)}. Satu kali pindai = satu kehadiran tercatat.</p>
    </div>
  );
}

/** Price, where to transfer, the deadline and the extra questions of the form. */
function SettingsTab({ eventId, settings, onSaved }: { eventId: string; settings: RegSettings | null; onSaved: () => void }) {
  const [open, setOpen] = useState(settings?.open ?? false);
  const [price, setPrice] = useState(String(settings?.price ?? 0));
  const [bank, setBank] = useState(settings?.bank_name ?? "");
  const [acct, setAcct] = useState(settings?.bank_account ?? "");
  const [holder, setHolder] = useState(settings?.bank_holder ?? "");
  const [note, setNote] = useState(settings?.payment_note ?? "");
  const [deadline, setDeadline] = useState(settings?.deadline ?? "");
  const [fields, setFields] = useState<RegField[]>(settings?.fields ?? []);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkOpen, setLinkOpen] = useState(settings?.link_open ?? true);
  const [autoApprove, setAutoApprove] = useState(settings?.link_auto_approve ?? true);
  const [welcome, setWelcome] = useState(settings?.welcome_text ?? "");
  const [ticketSize, setTicketSize] = useState<"a5" | "card">(settings?.ticket_size ?? "a5");
  const [bgUrl, setBgUrl] = useState(settings?.ticket_bg_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const link = settings?.public_code ? registerLink(settings.public_code) : null;

  async function copyLink() {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); } catch { /* ignore */ }
  }

  // the background design goes to a public bucket, in a folder named after the event
  async function uploadBg(file: File) {
    setUploading(true); setMsg(null);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${eventId}/design-${Date.now()}.${ext}`;
      const supabase = createClient();
      const up = await supabase.storage.from("event-designs").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) throw new Error("Gambar belum bisa diunggah. Pastikan JPG, PNG, atau WEBP di bawah 8 MB.");
      setBgUrl(supabase.storage.from("event-designs").getPublicUrl(path).data.publicUrl);
      setPreviewKey((k) => k + 1);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const paid = Number(price) > 0;
  async function save() {
    setMsg(null);
    if (paid && (!bank.trim() || !acct.trim() || !holder.trim())) { setMsg("Isi nama bank, nomor rekening, dan nama pemilik untuk acara berbayar."); return; }
    setBusy(true);
    const clean = fields.filter((f) => f.label.trim()).map((f, i) => ({ ...f, key: f.key || `q${i + 1}`, options: f.type === "select" ? (f.options ?? []).filter(Boolean) : undefined }));
    const { error } = await db().from("event_reg_settings").upsert({
      event_id: eventId, open, price: Math.max(0, Math.round(Number(price) || 0)),
      bank_name: bank.trim() || null, bank_account: acct.trim() || null, bank_holder: holder.trim() || null, payment_note: note.trim() || null,
      deadline: deadline || null, fields: clean, updated_at: new Date().toISOString(),
      link_open: linkOpen, link_auto_approve: autoApprove, welcome_text: welcome.trim() || null, ticket_size: ticketSize, ticket_bg_url: bgUrl || null,
    });
    setBusy(false);
    setMsg(error ? `Belum bisa menyimpan: ${error.message}` : "Tersimpan.");
    if (!error) onSaved();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
      <label className="flex items-center justify-between gap-3">
        <span><span className="block text-sm font-semibold text-white">Pendaftaran dibuka</span><span className="block text-xs text-brand-muted">Orang bisa mendaftar lewat halaman acara</span></span>
        <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="h-5 w-5 accent-[#D6B072]" />
      </label>
      <div>
        <label className="mb-1 block text-xs text-brand-muted">Biaya per orang (Rp, isi 0 jika gratis)</label>
        <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
      </div>
      {paid && (
        <div className="space-y-3 rounded-xl border border-brand-gold/30 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Transfer manual</p>
          <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Nama bank (contoh: BCA)" className={input} />
          <input value={acct} onChange={(e) => setAcct(e.target.value)} inputMode="numeric" placeholder="Nomor rekening" className={input} />
          <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nama pemilik rekening" className={input} />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Catatan untuk peserta (opsional), misalnya kode berita transfer" className={input} />
        </div>
      )}
      <div className="space-y-3 rounded-xl border border-brand-gold/30 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Link pendaftaran (tanpa login)</p>
        {link ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#1a1d24] p-2.5">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{link.replace("https://", "")}</span>
            <button type="button" onClick={copyLink} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark">{copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copiedLink ? "Tersalin" : "Salin"}</button>
            <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Buka link" className="shrink-0 rounded-lg border border-[#333] p-1.5 text-brand-light"><ExternalLink className="h-4 w-4" /></a>
          </div>
        ) : <p className="text-xs text-brand-muted">Simpan pengaturan sekali, lalu link pendek muncul di sini.</p>}
        <p className="text-xs leading-relaxed text-brand-muted">Bagikan link ini lewat WhatsApp atau email. Peserta mengisi nama, paroki, email, dan nomor WhatsApp, lalu otomatis punya akun Ruang Iman dan mendapat QR Code.</p>
        <label className="flex items-center justify-between gap-3 text-sm text-white"><span>Link pendaftaran aktif</span><input type="checkbox" checked={linkOpen} onChange={(e) => setLinkOpen(e.target.checked)} className="h-5 w-5 accent-[#D6B072]" /></label>
        <label className="flex items-center justify-between gap-3 text-sm text-white"><span>Setujui otomatis</span><input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} className="h-5 w-5 accent-[#D6B072]" /></label>
        <input value={welcome} onChange={(e) => setWelcome(e.target.value)} maxLength={300} placeholder="Sapaan di formulir (kosong = Selamat datang pada Event ...)" className={input} />
      </div>

      <div className="space-y-3 rounded-xl border border-[#333] p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Desain tiket untuk dicetak</p>
        <div className="grid grid-cols-2 gap-2">
          {([["a5", "A5 (148 x 210 mm)"], ["card", "Kartu nama (55 x 85 mm)"]] as ["a5" | "card", string][]).map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setTicketSize(k); setPreviewKey((x) => x + 1); }} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${ticketSize === k ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-[#333] text-brand-light"}`}>{l}</button>
          ))}
        </div>
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#444] py-3 text-sm font-semibold text-brand-light ${uploading ? "opacity-60" : ""}`}>
          <ImageIcon className="h-4 w-4" /> {uploading ? "Mengunggah…" : bgUrl ? "Ganti gambar latar" : "Unggah gambar latar desain"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { const x = e.target.files?.[0]; if (x) void uploadBg(x); e.target.value = ""; }} />
        </label>
        <p className="text-[11px] leading-relaxed text-brand-muted">Gambar potret, makin besar makin tajam (A5: sekitar 1748 x 2480 piksel). Nama dan QR Code ditaruh di panel putih di bagian bawah, jadi sisakan ruang di sana. {bgUrl && <button type="button" onClick={() => { setBgUrl(""); setPreviewKey((k) => k + 1); }} className="font-semibold text-red-300 underline">Hapus gambar</button>}</p>
        {settings ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={previewKey} src={`/api/events/${eventId}/ticket-preview?size=${ticketSize}${bgUrl ? `&bg=${encodeURIComponent(bgUrl)}` : ""}`} alt="Contoh tiket" className="mx-auto w-48 rounded-lg border border-[#333]" />
        ) : <p className="text-xs text-brand-muted">Simpan dulu, lalu contoh tiket muncul di sini.</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs text-brand-muted">Pendaftaran ditutup setelah tanggal (opsional)</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={input} />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-muted">Kolom tambahan di form (nama, paroki, email, dan WhatsApp sudah ada)</p>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[#333] p-2.5">
              <div className="flex gap-2">
                <input value={f.label} onChange={(e) => setFields(fields.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} placeholder="Nama kolom (contoh: Foto, Pasangan, Alamat)" className={input} />
                <button type="button" aria-label="Hapus" onClick={() => setFields(fields.filter((_, k) => k !== i))} className="shrink-0 rounded-lg border border-[#333] px-2.5 text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-light">
                <select value={f.type} onChange={(e) => setFields(fields.map((x, k) => (k === i ? { ...x, type: e.target.value as RegField["type"] } : x)))} className="rounded-lg border border-[#333] bg-[#14171c] px-2 py-1.5">
                  <option value="text">Isian singkat</option><option value="textarea">Isian panjang</option><option value="select">Pilihan</option><option value="photo">Foto</option>
                </select>
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!f.required} onChange={(e) => setFields(fields.map((x, k) => (k === i ? { ...x, required: e.target.checked } : x)))} className="accent-[#D6B072]" /> Wajib</label>
              </div>
              {f.type === "select" && (
                <input value={(f.options ?? []).join(", ")} onChange={(e) => setFields(fields.map((x, k) => (k === i ? { ...x, options: e.target.value.split(",").map((s) => s.trim()) } : x)))} placeholder="Pilihan, pisahkan dengan koma (S, M, L)" className={input} />
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setFields([...fields, { key: `q${fields.length + 1}`, label: "", type: "text", required: false }])} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light"><Plus className="h-3.5 w-3.5" /> Tambah kolom</button>
      </div>

      {msg && <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-brand-light">{msg}</p>}
      <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan pengaturan"}</button>
    </div>
  );
}
