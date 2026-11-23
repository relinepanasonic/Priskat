"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Users } from "lucide-react";
import { promoLink, rupiah, ticketLink, waLink, type Registration } from "@/lib/eventReg";
import { formatWeekdayDate, formatTime } from "@/lib/utils";
import { useEventData } from "./useEventData";
import { inputCls } from "./ui";

const TEMPLATES = [
  {
    id: "ajakan", label: "Ajakan mendaftar",
    text: "Shalom {nama}, kami mengundang kamu ke *{event}*.\n{tagline}\n\n📅 {tanggal}\n📍 {lokasi}\n\nDaftar lewat link ini ya: {link}\n\nTuhan memberkati 🙏",
  },
  {
    id: "bayar", label: "Info pembayaran",
    text: "Shalom {nama}, terima kasih sudah mendaftar di *{event}*.\n\nBiaya: {biaya}\nTransfer ke: {rekening}\n\nSetelah transfer, bendahara akan mengonfirmasi dan QR Code kamu dikirim lewat WhatsApp. Terima kasih 🙏",
  },
  {
    id: "qr", label: "QR Code peserta",
    text: "Shalom {nama}, pembayaranmu untuk *{event}* sudah kami terima.\n\nIni tiket QR kamu: {tiket}\n\nMohon bawa QR Code ini saat hadir dan tunjukkan kepada panitia di pintu masuk. Tuhan memberkati 🙏",
  },
  {
    id: "pengingat", label: "Pengingat (H-1)",
    text: "Shalom {nama}, besok kita bertemu di *{event}*.\n\n📅 {tanggal}\n📍 {lokasi}\n\nJangan lupa bawa QR Code kamu: {tiket}\n\nSampai jumpa! 🙏",
  },
  {
    id: "harih", label: "Info hari-H",
    text: "Shalom {nama}, hari ini kita *{event}*.\n\n📍 {lokasi}\n⏰ Mulai {jam}\n\nTunjukkan QR Code kamu kepada panitia di pintu masuk: {tiket}\n\nTuhan memberkati perjalananmu 🙏",
  },
  {
    id: "terima", label: "Terima kasih",
    text: "Shalom {nama}, terima kasih sudah hadir di *{event}*. Semoga kita semua diberkati dan sampai jumpa di kesempatan berikutnya 🙏",
  },
] as const;

const AUDIENCES = [
  { id: "all", label: "Semua yang mendaftar" },
  { id: "paid", label: "Sudah lunas" },
  { id: "unpaid", label: "Belum bayar" },
  { id: "present", label: "Sudah hadir" },
  { id: "absent", label: "Lunas, belum hadir" },
] as const;

/** WhatsApp Broadcast: pick a template and who gets it, then send person by person (the name is filled in for each). */
export default function BroadcastPanel({ eventId }: { eventId: string }) {
  const { event, regs, groups, settings, loading } = useEventData(eventId);
  const [tplId, setTplId] = useState<string>(TEMPLATES[0].id);
  const [text, setText] = useState<string>(TEMPLATES[0].text);
  const [aud, setAud] = useState<string>("all");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const recipients = useMemo(() => regs.filter((r) => {
    if (aud.startsWith("g:")) return r.group_id === aud.slice(2);
    if (aud === "paid") return r.status === "approved";
    if (aud === "unpaid") return r.status === "awaiting_payment" || r.status === "pending_review";
    if (aud === "present") return !!r.checked_in_at;
    if (aud === "absent") return r.status === "approved" && !r.checked_in_at;
    return r.status !== "cancelled" && r.status !== "rejected";
  }), [regs, aud]);

  if (loading) return <p className="py-6 text-center text-sm text-gray-500">Memuat...</p>;
  if (!event) return <p className="py-6 text-center text-sm text-gray-500">Event tidak ditemukan.</p>;

  const link = promoLink(settings);
  const rek = [settings?.bank_name, settings?.bank_account, settings?.bank_holder ? `a.n. ${settings.bank_holder}` : ""].filter(Boolean).join(" ") || "(isi rekening di Pengaturan Pendaftaran)";
  const fill = (tpl: string, r?: Registration) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => {
    switch (k) {
      case "nama": return r?.full_name ?? "Saudara/i";
      case "event": return event.title;
      case "tagline": return event.tagline ?? "";
      case "tanggal": return event.event_date ? `${formatWeekdayDate(event.event_date)}, ${formatTime(event.event_date)} WIB` : "";
      case "jam": return event.event_date ? `${formatTime(event.event_date)} WIB` : "";
      case "lokasi": return event.location ?? "";
      case "link": return link;
      case "tiket": return r ? ticketLink(r.ticket_code) : "(link QR masing-masing)";
      case "biaya": return rupiah(settings?.price ?? 0);
      case "rekening": return rek;
      default: return `{${k}}`;
    }
  }).replace(/\n{3,}/g, "\n\n").trim();

  const pick = (id: string) => { const t = TEMPLATES.find((x) => x.id === id); if (t) { setTplId(id); setText(t.text); } };
  const send = (r: Registration) => { setSent((s) => new Set(s).add(r.id)); };
  const needsQr = text.includes("{tiket}");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">1. Pilih template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => pick(t.id)} aria-pressed={tplId === t.id}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold ${tplId === t.id ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-light hover:bg-white/5"}`}>{t.label}</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className={`${inputCls} resize-y rounded-2xl leading-relaxed`} />
        <p className="text-[11px] leading-relaxed text-brand-muted">Isi yang diganti otomatis: {"{nama} {event} {tagline} {tanggal} {jam} {lokasi} {link} {tiket} {biaya} {rekening}"}. Boleh diubah sebelum dikirim.</p>
        <div className="rounded-xl border border-[#2a2d35] bg-black/30 p-3.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Contoh pesan</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{fill(text, recipients[0])}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(fill(text)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } }} className="flex items-center justify-center gap-2 rounded-xl border border-[#333] py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Tersalin" : "Salin pesan"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(fill(text))}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950"><MessageCircle className="h-4 w-4" /> Kirim ke grup WA</a>
        </div>
      </div>

      <div className="space-y-3 border-t border-[#2a2d35] pt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">2. Kirim ke peserta satu per satu</p>
        <div className="flex flex-wrap items-center gap-2">
          <select value={aud} onChange={(e) => { setAud(e.target.value); setSent(new Set()); }} className="rounded-lg border border-[#333] bg-[#0f1216] px-3 py-2.5 text-sm text-white">
            {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            {groups.map((g) => <option key={g.id} value={`g:${g.id}`}>Grup: {g.name}</option>)}
          </select>
          <span className="flex items-center gap-1.5 text-xs text-brand-muted"><Users className="h-3.5 w-3.5" /> {recipients.length} orang · {recipients.filter((r) => sent.has(r.id)).length} terkirim</span>
        </div>
        {needsQr && aud !== "paid" && aud !== "present" && aud !== "absent" && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">Pesan ini memuat {"{tiket}"}. QR hanya aktif untuk yang sudah lunas, jadi pilih "Sudah lunas" kalau pesannya berisi QR.</p>
        )}
        {recipients.length === 0 ? (
          <p className="rounded-xl border border-[#2a2d35] p-5 text-center text-sm text-brand-muted">Belum ada penerima di kelompok ini.</p>
        ) : (
          <ul className="max-h-96 divide-y divide-[#2a2d35] overflow-y-auto rounded-xl border border-[#2a2d35]">
            {recipients.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{r.full_name}</p>
                  <p className="truncate text-xs text-brand-muted">{r.phone || "Tanpa nomor WhatsApp"}</p>
                </div>
                {r.phone ? (
                  <a href={waLink(r.phone, fill(text, r))} target="_blank" rel="noopener noreferrer" onClick={() => send(r)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${sent.has(r.id) ? "border border-emerald-500/40 text-emerald-300" : "bg-emerald-500 text-emerald-950"}`}>
                    {sent.has(r.id) ? <><Check className="h-3.5 w-3.5" /> Terkirim</> : <><MessageCircle className="h-3.5 w-3.5" /> Kirim</>}
                  </a>
                ) : <span className="shrink-0 text-[11px] text-brand-muted">-</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
