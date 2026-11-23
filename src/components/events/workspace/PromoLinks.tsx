"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerLink, type RegSettings } from "@/lib/eventReg";
import { inputCls } from "./ui";
import { getRegisterLink } from "./LinkPeserta";

/**
 * The links used in promotion: our own event registration, and a second one (Google Form or another app).
 * One of them is the default for the banner and the WhatsApp broadcast.
 */
export default function PromoLinks({ eventId, settings, onSaved }: { eventId: string; settings: RegSettings | null; onSaved: () => void }) {
  const own = settings?.slug || settings?.public_code ? registerLink((settings.slug || settings.public_code) as string) : "";
  const [ext, setExt] = useState(settings?.external_link ?? "");
  const [def, setDef] = useState<"ruangiman" | "external">(settings?.default_link === "external" ? "external" : "ruangiman");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    const url = ext.trim();
    if (url && !/^https?:\/\//i.test(url)) { setMsg({ ok: false, text: "Link kedua harus diawali https://" }); return; }
    if (def === "external" && !url) { setMsg({ ok: false, text: "Isi link kedua dulu, atau pilih link Ruang Iman sebagai default." }); return; }
    setBusy(true); setMsg(null);
    try {
      if (!own) await getRegisterLink(eventId); // makes our own link (its name comes from the event)
      const { error } = await (createClient() as any).from("event_reg_settings").upsert({ event_id: eventId, external_link: url || null, default_link: def });
      if (error) throw new Error(error.message);
      setMsg({ ok: true, text: "Tersimpan. Banner baru dan WhatsApp Broadcast memakai link default ini." });
      onSaved();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const Option = ({ id, title, hint, children }: { id: "ruangiman" | "external"; title: string; hint: string; children?: React.ReactNode }) => (
    <div className={`space-y-2.5 rounded-xl border p-3.5 transition ${def === id ? "border-brand-gold/60 bg-brand-gold/5" : "border-[#2a2d35]"}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="radio" name="default-link" checked={def === id} onChange={() => setDef(id)} className="mt-1 h-4 w-4 accent-[#D6B072]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">{title}{def === id && <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-brand-dark"><Check className="h-3 w-3" /> Default</span>}</span>
          <span className="block text-[11px] text-brand-muted">{hint}</span>
        </span>
      </label>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-brand-muted">Banner dan pesan WhatsApp memakai link yang kamu pilih sebagai default.</p>
      <Option id="ruangiman" title="Pendaftaran Ruang Iman" hint="Peserta mendaftar di Ruang Iman, dapat QR Code, dan masuk ke daftar Peserta.">
        <p className="truncate rounded-lg bg-black/30 px-3 py-2 text-xs text-brand-light">{own ? own.replace("https://", "") : "Dibuat otomatis saat kamu menyimpan."}</p>
      </Option>
      <Option id="external" title="Link lain" hint="Google Form atau aplikasi pihak ketiga. Peserta lewat link ini tidak masuk daftar Peserta otomatis.">
        <input value={ext} onChange={(e) => setExt(e.target.value)} placeholder="https://forms.gle/..." inputMode="url" className={inputCls} />
      </Option>
      {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</p>}
      <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan..." : "Simpan link"}</button>
    </div>
  );
}
