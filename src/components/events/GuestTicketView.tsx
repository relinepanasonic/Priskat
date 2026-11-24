"use client";

import { CalendarPlus, CheckCircle2, Download, Mail, Smartphone } from "lucide-react";

export type TicketEvent = { title: string; start: string | null; end?: string | null; location?: string | null; url?: string };
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.ruangiman.app";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Google Calendar link and an .ics file (Apple / Outlook) for the event, so the ticket lands in their schedule */
function calendarLinks(ev: TicketEvent) {
  if (!ev.start) return null;
  const s = new Date(ev.start);
  if (isNaN(s.getTime())) return null;
  const e = ev.end && !isNaN(new Date(ev.end).getTime()) ? new Date(ev.end) : new Date(s.getTime() + 3 * 3600_000);
  const details = `Tiket QR ada di Ruang Iman${ev.url ? `: ${ev.url}` : ""}. Mohon bawa QR Code saat hadir.`;
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${stamp(s)}/${stamp(e)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(ev.location ?? "")}`;
  const esc = (t: string) => t.replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ruang Iman//Event//ID", "BEGIN:VEVENT", `UID:${stamp(s)}-${encodeURIComponent(ev.title)}@ruangiman.com`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`, `SUMMARY:${esc(ev.title)}`, `LOCATION:${esc(ev.location ?? "")}`, `DESCRIPTION:${esc(details)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return { google, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}


const serif = { fontFamily: "'Lora', Georgia, serif" };

/** The ticket on screen: the person's name with the QR code, a download button, and the reminder to bring it. */
export default function GuestTicketView({
  code, name, eventTitle, justRegistered, emailed, email, pending, event, promoteApp, extra,
}: { code: string; name: string; eventTitle: string; justRegistered?: boolean; emailed?: boolean; email?: string; pending?: boolean; event?: TicketEvent; promoteApp?: boolean; extra?: React.ReactNode }) {
  const cal = event ? calendarLinks(event) : null;
  return (
    <div className="space-y-4">
      {justRegistered && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-white">{pending ? "Pendaftaranmu sudah masuk (belum bayar)" : "Pendaftaran berhasil"}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-brand-light">
              {pending ? "QR Code muncul setelah pembayaranmu dikonfirmasi panitia. Kami kabari lewat WhatsApp dan email." : "Terima kasih. Simpan QR Code di bawah ini."}
            </p>
          </div>
        </div>
      )}

      {pending && extra}

      {!pending && (
        <div className="rounded-3xl border border-brand-gold/30 bg-[#1a1d24] p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Tiket masuk</p>
          <p className="mt-1 text-xs text-brand-muted">{eventTitle}</p>
          <p className="mt-3 text-2xl font-bold leading-tight text-white" style={serif}>{name}</p>
          <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/ticket/${code}/qr`} alt={`QR Code ${name}`} width={240} height={240} className="h-60 w-60" />
          </div>
          <a
            href={`/api/ticket/${code}/card?dl=1`}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark active:scale-[0.99]"
          >
            <Download className="h-4 w-4" /> Unduh tiket
          </a>
          {cal && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <a href={cal.google} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-gold/50 py-3 text-xs font-bold text-brand-gold hover:bg-brand-gold/10"><CalendarPlus className="h-4 w-4" /> Google Calendar</a>
              <a href={cal.ics} download="event.ics" className="flex items-center justify-center gap-1.5 rounded-xl border border-[#333] py-3 text-xs font-bold text-brand-light hover:bg-white/5"><CalendarPlus className="h-4 w-4" /> Kalender lain (.ics)</a>
            </div>
          )}
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <p className="text-sm font-bold text-white">Mohon bawa QR Code ini saat hadir</p>
            <p className="text-xs leading-relaxed text-brand-light">Boleh dicetak, atau tunjukkan dari ponselmu. Panitia akan memindainya di pintu masuk.</p>
          </div>
        </div>
      )}

      {promoteApp && (
        <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/15 to-transparent p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold"><Smartphone className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-white">Lebih dekat dengan komunitasmu</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-light">Akun Ruang Iman-mu sudah dibuat. Unduh aplikasinya untuk berdoa, bertumbuh dalam iman, membaca Alkitab, dan terhubung dengan komunitasmu setiap hari.</p>
            </div>
          </div>
          <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark active:scale-[0.99]">Unduh aplikasi Ruang Iman</a>
          <p className="mt-2 text-center text-[11px] text-brand-muted">Masuk dengan email yang kamu pakai mendaftar.</p>
        </div>
      )}

      {emailed && email && (
        <div className="flex gap-3 rounded-2xl border border-brand-gold/25 bg-white/[0.03] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><Mail className="h-4 w-4" /></span>
          <div className="min-w-0 space-y-1">
            <p className="text-xs leading-relaxed text-brand-light">Konfirmasi dan QR Code juga kami kirim ke</p>
            <p className="break-all text-sm font-semibold text-white">{email}</p>
            <p className="text-[11px] text-brand-muted">Belum terlihat? Cek folder Spam.</p>
          </div>
        </div>
      )}
    </div>
  );
}
