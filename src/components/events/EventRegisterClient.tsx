"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { CheckCircle2, Clock, Copy, Upload, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import TicketQr from "@/components/events/TicketQr";
import { rupiah, STATUS_LABEL, type RegSettings, type Registration } from "@/lib/eventReg";

const serif = { fontFamily: "'Lora', Georgia, serif" };
const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";

/**
 * The person's side of an event: the registration form, how to pay (manual bank transfer + proof photo),
 * the wait for the admin, and finally the QR ticket that the admin scans at the door.
 */
export default function EventRegisterClient({
  eventId, eventTitle, settings, reg, signedIn, defaultName, defaultPhone, full,
}: {
  eventId: string; eventTitle: string; settings: RegSettings | null; reg: Registration | null;
  signedIn: boolean; defaultName: string; defaultPhone: string; full: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const db = () => createClient() as any;

  const closed = !settings || !settings.open || (settings.deadline && settings.deadline < new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10));
  const canRegister = !reg || reg.status === "rejected" || reg.status === "cancelled";

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await db().rpc("register_for_event", { p_event: eventId, p_name: name, p_phone: phone, p_answers: answers });
    setBusy(false);
    if (err) { setError(err.message); return; }
    router.refresh();
  }

  async function sendProof(file: File) {
    if (!reg) return;
    setBusy(true); setError(null);
    try {
      const small = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true });
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Masuk dulu ke akunmu.");
      const ext = small.type === "image/png" ? "png" : small.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${reg.id}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("event-proofs").upload(path, small, { contentType: small.type, upsert: false });
      if (up.error) throw new Error("Foto belum bisa diunggah. Coba lagi.");
      const { error: err } = await db().rpc("submit_payment_proof", { p_reg: reg.id, p_path: path });
      if (err) throw new Error(err.message);
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "Belum bisa mengirim bukti.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!reg || !window.confirm("Batalkan pendaftaranmu?")) return;
    setBusy(true);
    const { error: err } = await db().rpc("cancel_registration", { p_reg: reg.id });
    setBusy(false);
    if (err) { setError(err.message); return; }
    router.refresh();
  }

  const copy = async (v: string) => { try { await navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5 text-center">
        <p className="text-sm text-brand-light">Masuk ke akunmu untuk mendaftar di acara ini.</p>
        <Link href="/login" className="mt-3 inline-block rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-dark">Masuk</Link>
      </div>
    );
  }

  if (reg && !canRegister) {
    return (
      <div className="space-y-4">
        <div className={`flex items-start gap-3 rounded-2xl border p-4 ${reg.status === "approved" ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
          {reg.status === "approved" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />}
          <div>
            <p className="text-sm font-bold text-white">{STATUS_LABEL[reg.status]}</p>
            <p className="mt-0.5 text-xs text-brand-light">
              {reg.status === "awaiting_payment" && "Transfer sesuai petunjuk di bawah, lalu unggah foto bukti transfernya."}
              {reg.status === "pending_review" && "Bukti transfermu sudah masuk. Admin akan memeriksanya, dan kamu akan mendapat notifikasi."}
              {reg.status === "approved" && "Pendaftaranmu disetujui. Tunjukkan QR di bawah kepada panitia saat acara."}
            </p>
          </div>
        </div>

        {reg.status === "approved" && (
          <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Tiket</p>
            <p className="mt-1 text-lg font-bold text-white" style={serif}>{reg.full_name}</p>
            <p className="mb-4 text-xs text-brand-muted">{eventTitle}</p>
            <TicketQr code={reg.ticket_code} />
            {reg.checked_in_at
              ? <p className="mt-4 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">Sudah hadir ({new Date(reg.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })})</p>
              : <p className="mt-4 text-[11px] text-brand-muted">Naikkan kecerahan layar agar mudah dipindai.</p>}
          </div>
        )}

        {(reg.status === "awaiting_payment" || reg.status === "pending_review") && settings && settings.price > 0 && (
          <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Pembayaran</p>
            <p className="mt-1 text-2xl font-bold text-white" style={serif}>{rupiah(reg.amount)}</p>
            <div className="mt-3 space-y-1 rounded-xl bg-[#14171c] p-3 text-sm">
              <p className="text-brand-muted">Transfer ke</p>
              <p className="font-semibold text-white">{settings.bank_name}</p>
              <p className="flex items-center gap-2 text-xl font-bold tracking-wider text-brand-gold">
                {settings.bank_account}
                {settings.bank_account && <button type="button" onClick={() => copy(settings.bank_account!)} aria-label="Salin nomor rekening" className="rounded-full border border-brand-gold/40 p-1.5"><Copy className="h-3.5 w-3.5" /></button>}
                {copied && <span className="text-xs font-semibold text-emerald-300">Tersalin</span>}
              </p>
              <p className="text-brand-light">a.n. {settings.bank_holder}</p>
            </div>
            {settings.payment_note && <p className="mt-3 text-xs leading-relaxed text-brand-light">{settings.payment_note}</p>}

            <label className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${busy ? "opacity-60" : ""} ${reg.status === "pending_review" ? "border border-brand-gold/50 text-brand-gold" : "bg-brand-gold text-brand-dark"}`}>
              <Upload className="h-4 w-4" />
              {busy ? "Mengunggah…" : reg.status === "pending_review" ? "Ganti foto bukti transfer" : "Unggah bukti transfer"}
              <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void sendProof(f); e.target.value = ""; }} />
            </label>
          </div>
        )}

        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        {!reg.checked_in_at && <button onClick={cancel} disabled={busy} className="w-full py-2 text-xs text-brand-muted underline underline-offset-4">Batalkan pendaftaran</button>}
      </div>
    );
  }

  // Not registered (or rejected / cancelled): the form
  if (closed) {
    return <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-5 text-center text-sm text-brand-muted">Pendaftaran acara ini belum dibuka atau sudah ditutup.</p>;
  }
  if (full) {
    return <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-5 text-center text-sm text-brand-muted">Maaf, kuota acara ini sudah penuh.</p>;
  }

  return (
    <form onSubmit={register} className="space-y-4 rounded-2xl border border-[#333] bg-[#1a1d24] p-4">
      {reg?.status === "rejected" && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Pendaftaran sebelumnya ditolak{reg.reject_reason ? `: ${reg.reject_reason}` : "."} Kamu bisa mendaftar lagi.</span>
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Form pendaftaran</p>
        <p className="text-sm font-bold text-white">{rupiah(settings!.price)}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Nama lengkap *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Nomor HP (WhatsApp)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="08123456789" className={input} />
      </div>
      {(settings!.fields ?? []).map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-brand-light">{f.label}{f.required && " *"}</label>
          {f.type === "select" ? (
            <select required={f.required} value={answers[f.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })} className={input}>
              <option value="">Pilih…</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input required={f.required} value={answers[f.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })} className={input} />
          )}
        </div>
      ))}
      {settings!.price > 0 && <p className="text-xs leading-relaxed text-brand-muted">Setelah mendaftar, kamu akan melihat nomor rekening untuk transfer manual. Tiket QR muncul setelah admin menyetujui pembayaranmu.</p>}
      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">
        {busy ? "Mengirim…" : settings!.price > 0 ? "Daftar dan lihat cara bayar" : "Daftar sekarang"}
      </button>
    </form>
  );
}
