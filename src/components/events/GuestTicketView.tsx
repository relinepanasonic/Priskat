"use client";

import { CheckCircle2, Download, Mail } from "lucide-react";

const serif = { fontFamily: "'Lora', Georgia, serif" };

/** The ticket on screen: the person's name with the QR code, a download button, and the reminder to bring it. */
export default function GuestTicketView({
  code, name, eventTitle, justRegistered, emailed, email, pending,
}: { code: string; name: string; eventTitle: string; justRegistered?: boolean; emailed?: boolean; email?: string; pending?: boolean }) {
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
          <p className="mt-3 text-xs leading-relaxed text-brand-light">
            <b className="text-white">Mohon bawa QR Code ini saat hadir di acara</b>, dicetak atau ditunjukkan dari ponselmu, dan tunjukkan kepada panitia di pintu masuk.
          </p>
        </div>
      )}

      {emailed && email && (
        <p className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-brand-light">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" /> Konfirmasi dan QR Code juga kami kirim ke <b className="text-white">{email}</b>. Cek folder Spam kalau belum terlihat.
        </p>
      )}
    </div>
  );
}
