import type { Metadata } from "next";
import { LifeBuoy, HeartHandshake, MessagesSquare, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "SOS Doa" };

// WhatsApp number of the team (international format, no +). Change here if the two services get different numbers.
const WA_PRAYER = "62818868885";
const WA_COUNSEL = "62818868885";

const wa = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export default function SOSPage() {
  return (
    <main className="flex min-h-[560px] flex-col items-center justify-center bg-[#0f0f0f] p-6 text-center">
      {/* Pulsing SOS icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-500/10">
          <LifeBuoy className="h-10 w-10 text-red-400" />
        </div>
      </div>

      <h1 className="mb-2 text-3xl font-bold text-white">SOS</h1>
      <p className="mb-1 text-base text-gray-300">Kamu tidak sendirian.</p>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        Pilih yang kamu butuhkan sekarang. Pesanmu akan terkirim lewat WhatsApp.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <a
          href={wa(WA_PRAYER, "Halo, saya butuh didoakan 🙏")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center gap-4 rounded-2xl bg-red-500 p-4 text-left text-white shadow-[0_0_30px_rgba(239,68,68,0.35)] transition-all hover:bg-red-400 active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <HeartHandshake className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold">Saya Butuh Di-Doa-kan</span>
            <span className="block text-xs text-white/80">Kirim permintaan doamu, kami mendoakanmu</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5" />
        </a>

        <a
          href={wa(WA_COUNSEL, "Halo, saya butuh teman curhat dan konsultasi 🙏")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center gap-4 rounded-2xl border border-brand-gold/50 bg-brand-gold/10 p-4 text-left text-white transition-all hover:bg-brand-gold/20 active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
            <MessagesSquare className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold">Saya Butuh Curhat dan Konsultasi</span>
            <span className="block text-xs text-gray-300">Ceritakan pergumulanmu, ada yang mendengarkan</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand-gold transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <p className="mt-10 max-w-xs text-xs text-gray-600">&ldquo;Berdoalah tanpa henti.&rdquo; — 1 Tesalonika 5:17</p>
    </main>
  );
}
