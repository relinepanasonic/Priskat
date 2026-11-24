"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RegField, RegSettings } from "@/lib/eventReg";
import { Field, Switch, inputCls } from "./ui";

/** Price, where to transfer, the closing date, the form's extra questions. (Open / close is its own button above.) */
export default function RegistrationSettings({ eventId, settings, onSaved }: { eventId: string; settings: RegSettings | null; onSaved: () => void }) {
  const [price, setPrice] = useState(String(settings?.price ?? 0));
  const [bank, setBank] = useState(settings?.bank_name ?? "");
  const [acct, setAcct] = useState(settings?.bank_account ?? "");
  const [holder, setHolder] = useState(settings?.bank_holder ?? "");
  const [note, setNote] = useState(settings?.payment_note ?? "");
  const [wa, setWa] = useState(settings?.treasurer_wa ?? "");
  const [deadline, setDeadline] = useState(settings?.deadline ?? "");
  const [welcome, setWelcome] = useState(settings?.welcome_text ?? "");
  const [linkOpen, setLinkOpen] = useState(settings?.link_open ?? true);
  const [autoApprove, setAutoApprove] = useState(settings?.link_auto_approve ?? true);
  const [fields, setFields] = useState<RegField[]>(settings?.fields ?? []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const paid = Number(price) > 0;
  const patchField = (i: number, p: Partial<RegField>) => setFields(fields.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function save() {
    setMsg(null);
    if (paid && (!bank.trim() || !acct.trim() || !holder.trim() || !wa.trim())) { setMsg("Isi nama bank, nomor rekening, nama pemilik, dan WhatsApp Bendahara untuk acara berbayar."); return; }
    setBusy(true);
    const clean = fields.filter((f) => f.label.trim()).map((f, i) => ({ ...f, key: f.key || `q${i + 1}`, options: f.type === "select" ? (f.options ?? []).filter(Boolean) : undefined }));
    const { error } = await (createClient() as any).from("event_reg_settings").upsert({
      event_id: eventId, price: Math.max(0, Math.round(Number(price) || 0)),
      bank_name: bank.trim() || null, bank_account: acct.trim() || null, bank_holder: holder.trim() || null, treasurer_wa: wa.trim() || null, payment_note: note.trim() || null,
      deadline: deadline || null, welcome_text: welcome.trim() || null, link_open: linkOpen, link_auto_approve: autoApprove, fields: clean,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    setMsg(error ? `Belum bisa menyimpan: ${error.message}` : "Tersimpan.");
    if (!error) onSaved();
  }

  return (
    <div className="space-y-5">
      <Field label="Biaya per orang (Rp)" hint="Isi 0 kalau gratis. Peserta berbayar masuk sebagai Belum bayar sampai bendahara menandai lunas.">
        <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
      </Field>

      {(
        <div className="space-y-3 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Transfer manual</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama bank"><input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="BCA" className={inputCls} /></Field>
            <Field label="Nomor rekening"><input value={acct} onChange={(e) => setAcct(e.target.value)} inputMode="numeric" className={inputCls} /></Field>
          </div>
          <Field label="Nama pemilik rekening"><input value={holder} onChange={(e) => setHolder(e.target.value)} className={inputCls} /></Field>
          <Field label="WhatsApp Bendahara" hint="Tempat peserta mengirim bukti transfer. Contoh 08123456789. Wajib diisi kalau acara berbayar."><input value={wa} onChange={(e) => setWa(e.target.value)} inputMode="tel" placeholder="08123456789" className={inputCls} /></Field>
          <Field label="Catatan untuk peserta (opsional)"><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Mis. kode berita transfer" className={`${inputCls} rounded-2xl`} /></Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pendaftaran ditutup setelah tanggal" hint="Kosongkan kalau tidak dibatasi.">
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
        </Field>
        <Field label="Sapaan di formulir" hint="Kosong = Selamat datang pada Event ...">
          <input value={welcome} onChange={(e) => setWelcome(e.target.value)} maxLength={300} className={inputCls} />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-[#2a2d35] p-3.5">
        <Switch checked={linkOpen} onChange={setLinkOpen} label="Link pendaftaran aktif" hint="Matikan untuk menutup link tanpa menutup pendaftaran." />
        <Switch checked={autoApprove} onChange={setAutoApprove} label="Setujui otomatis (acara gratis)" hint="Acara berbayar selalu menunggu konfirmasi lunas." />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-brand-light">Pertanyaan tambahan di formulir</p>
          <p className="text-[11px] text-brand-muted">Nama, paroki, email, dan WhatsApp sudah ada.</p>
        </div>
        {fields.map((f, i) => (
          <div key={i} className="space-y-2.5 rounded-xl border border-[#2a2d35] p-3">
            <div className="flex gap-2">
              <input value={f.label} onChange={(e) => patchField(i, { label: e.target.value })} placeholder="Pertanyaan (mis. Foto, Pasangan, Alamat)" className={inputCls} />
              <button type="button" aria-label="Hapus pertanyaan" onClick={() => setFields(fields.filter((_, k) => k !== i))} className="shrink-0 rounded-lg border border-[#333] px-3 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={f.type} onChange={(e) => patchField(i, { type: e.target.value as RegField["type"] })} className="rounded-lg border border-[#333] bg-[#0f1216] px-2.5 py-2 text-xs text-white">
                <option value="text">Isian singkat</option><option value="textarea">Isian panjang</option><option value="select">Pilihan</option><option value="photo">Foto</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-brand-light"><input type="checkbox" checked={!!f.required} onChange={(e) => patchField(i, { required: e.target.checked })} className="accent-[#D6B072]" /> Wajib diisi</label>
            </div>
            {f.type === "select" && (
              <input value={(f.options ?? []).join(", ")} onChange={(e) => patchField(i, { options: e.target.value.split(",").map((s) => s.trim()) })} placeholder="Pilihan, pisahkan dengan koma (S, M, L)" className={inputCls} />
            )}
          </div>
        ))}
        <button type="button" onClick={() => setFields([...fields, { key: `q${fields.length + 1}`, label: "", type: "text", required: false }])} className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5"><Plus className="h-3.5 w-3.5" /> Tambah pertanyaan</button>
      </div>

      {msg && <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-brand-light">{msg}</p>}
      <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan pengaturan pendaftaran"}</button>
    </div>
  );
}
