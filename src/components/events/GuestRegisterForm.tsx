"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import PaymentInfo from "@/components/events/PaymentInfo";
import GuestTicketView from "@/components/events/GuestTicketView";
import type { RegField } from "@/lib/eventReg";
import type { TicketEvent } from "@/components/events/GuestTicketView";

const input = "w-full rounded-xl border border-[#333] bg-[#14171c] px-4 py-3 text-[15px] text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none";
const serif = { fontFamily: "'Lora', Georgia, serif" };

type Done = { code: string; name: string; email: string; emailed: boolean; already: boolean; approved: boolean };

/**
 * "Selamat datang pada Event ...": name, paroki, email, WhatsApp and the admin's own questions.
 * Sends the form to the server, which makes the Ruang Iman account, and then shows the QR ticket.
 */
export default function GuestRegisterForm({ code, eventId, eventTitle, welcome, fields, event, payment }: { code: string; eventId: string; eventTitle: string; welcome: string; fields: RegField[]; event?: TicketEvent; payment?: { amount: number; bank: string | null; account: string | null; holder: string | null; note: string | null; treasurerWa: string | null } }) {
  // two doors: sign in with a Ruang Iman account, or register as a guest (an account is made from the email)
  const [mode, setMode] = useState<"choose" | "guest">("choose");
  const [v, setV] = useState({ name: "", paroki: "", email: "", phone: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  async function pickPhoto(key: string, file: File | undefined) {
    if (!file) return;
    try {
      const small = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true });
      setPhotos((p) => ({ ...p, [key]: small }));
      setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(small) }));
    } catch { setError("Foto belum bisa dibaca. Coba foto lain."); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.set("name", v.name); fd.set("paroki", v.paroki); fd.set("email", v.email); fd.set("phone", v.phone);
      for (const f of fields) {
        if (f.type === "photo") { const file = photos[f.key]; if (file) fd.set(`photo_${f.key}`, file, `${f.key}.jpg`); }
        else if (answers[f.key]) fd.set(`a_${f.key}`, answers[f.key]);
      }
      const res = await fetch(`/api/events/${code}/register`, { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Pendaftaran belum berhasil. Coba lagi.");
      setDone({ code: j.ticket_code, name: j.name ?? v.name, email: v.email, emailed: !!j.emailed, already: !!j.already, approved: j.approved !== false });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        {done.already && <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">Emailmu sudah terdaftar di acara ini. Ini tiketmu.</p>}
        <GuestTicketView code={done.code} name={done.name} eventTitle={eventTitle} justRegistered={!done.already} emailed={done.emailed} email={done.email} pending={!done.approved} event={event} promoteApp extra={payment && payment.amount > 0 ? <PaymentInfo amount={payment.amount} bank={payment.bank} account={payment.account} holder={payment.holder} note={payment.note} treasurerWa={payment.treasurerWa} name={done.name} eventTitle={eventTitle} /> : undefined} />
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="space-y-4 rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
        <h2 className="text-xl font-bold leading-snug text-white" style={serif}>{welcome}</h2>
        <p className="text-sm text-brand-light">Pilih cara mendaftar:</p>
        <a href={`/acara/${eventId}`} className="block w-full rounded-xl bg-brand-gold py-3.5 text-center text-[15px] font-bold text-brand-dark active:scale-[0.99]">Punya Akun Ruang Iman</a>
        <button type="button" onClick={() => setMode("guest")} className="block w-full rounded-xl border border-brand-gold/50 py-3.5 text-[15px] font-bold text-brand-gold hover:bg-brand-gold/10 active:scale-[0.99]">Daftar sebagai Guest</button>
        <p className="text-center text-[11px] leading-relaxed text-brand-muted">Guest cukup isi nama, paroki, email, dan WhatsApp. Kami membuatkan akun Ruang Iman-mu otomatis.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-[#2a2d35] bg-[#1a1d24] p-5">
      <h2 className="text-xl font-bold leading-snug text-white" style={serif}>{welcome}</h2>

      <div><label className="mb-1.5 block text-sm font-medium text-brand-light">Nama *</label>
        <input required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" placeholder="Nama lengkap" className={input} /></div>
      <div><label className="mb-1.5 block text-sm font-medium text-brand-light">Paroki *</label>
        <input required value={v.paroki} onChange={(e) => setV({ ...v, paroki: e.target.value })} placeholder="Contoh: Paroki Tomang" className={input} /></div>
      <div><label className="mb-1.5 block text-sm font-medium text-brand-light">Email *</label>
        <input required type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} autoComplete="email" inputMode="email" placeholder="nama@email.com" className={input} /></div>
      <div><label className="mb-1.5 block text-sm font-medium text-brand-light">No WhatsApp *</label>
        <input required type="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} autoComplete="tel" inputMode="tel" placeholder="08123456789" className={input} /></div>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1.5 block text-sm font-medium text-brand-light">{f.label}{f.required && " *"}</label>
          {f.type === "select" ? (
            <select required={f.required} value={answers[f.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })} className={input}>
              <option value="">Pilih…</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "textarea" ? (
            <textarea required={f.required} rows={3} value={answers[f.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })} className={input} />
          ) : f.type === "photo" ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#444] bg-[#14171c] p-3">
              {previews[f.key]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={previews[f.key]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                : <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-brand-muted"><Camera className="h-6 w-6" /></span>}
              <span className="text-sm text-brand-light">{photos[f.key] ? "Ganti foto" : "Pilih atau ambil foto"}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => void pickPhoto(f.key, e.target.files?.[0])} />
            </label>
          ) : (
            <input required={f.required} value={answers[f.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })} className={input} />
          )}
        </div>
      ))}

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3.5 text-[15px] font-bold text-brand-dark disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? "Mengirim…" : "Daftar"}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-brand-muted">Dengan mendaftar, kami membuatkan akun Ruang Iman dengan emailmu, supaya kamu mudah terhubung dengan komunitas.</p>
    </form>
  );
}
