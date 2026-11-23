"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_WA_TEMPLATE, WA_PLACEHOLDERS, type RegSettings } from "@/lib/eventReg";
import { inputCls } from "./ui";

/** The WhatsApp message that goes with a paid participant's QR. Lives in the About tab. */
export default function WaTemplate({ eventId, settings, onSaved }: { eventId: string; settings: RegSettings | null; onSaved: () => void }) {
  const saved = settings?.wa_template ?? DEFAULT_WA_TEMPLATE;
  const [text, setText] = useState(saved);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const t = text.trim();
    if (t.length < 10) { setMsg("Pesan tidak boleh kosong (minimal 10 huruf). Pakai Kembalikan default kalau mau mulai lagi."); return; }
    if (!t.includes("{link}")) { setMsg("Pesan harus memuat {link}, supaya peserta menerima QR-nya."); return; }
    setBusy(true); setMsg(null);
    const { error } = await (createClient() as any).from("event_reg_settings").upsert({ event_id: eventId, wa_template: t === DEFAULT_WA_TEMPLATE ? null : t });
    setBusy(false);
    setMsg(error ? `Belum bisa menyimpan: ${error.message}` : "Pesan tersimpan.");
    if (!error) onSaved();
  }

  async function resetToDefault() {
    setBusy(true); setMsg(null);
    const { error } = await (createClient() as any).from("event_reg_settings").upsert({ event_id: eventId, wa_template: null });
    setBusy(false);
    setText(DEFAULT_WA_TEMPLATE);
    setMsg(error ? `Belum bisa menyimpan: ${error.message}` : "Kembali ke pesan default.");
    if (!error) onSaved();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-brand-muted">Dikirim ke peserta yang sudah lunas, berisi QR mereka. Isi yang diganti otomatis: {WA_PLACEHOLDERS.join("  ")}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className={`${inputCls} resize-y rounded-2xl leading-relaxed`} />
      {msg && <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-brand-light">{msg}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={save} disabled={busy} className="rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark disabled:opacity-60">Simpan pesan</button>
        <button type="button" onClick={resetToDefault} disabled={busy} className="rounded-xl border border-[#333] py-2.5 text-sm font-semibold text-brand-light disabled:opacity-60">Kembalikan default</button>
      </div>
    </div>
  );
}
