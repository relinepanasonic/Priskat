import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, Smartphone } from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.ruangiman.app";
const LOGO_URL = "https://apps.ruangiman.com/logo.png";

export const metadata: Metadata = {
  title: "Download Ruang Iman — Google Play",
  description: "Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik Indonesia. Unduh gratis di Google Play Store.",
  openGraph: {
    title: "Download Ruang Iman di Google Play",
    description: "Alkitab, Bacaan Harian KWI, Rosario 3D, Jadwal Misa, Kisah Santo & Santa, dan Komunitas Katolik Indonesia.",
    siteName: "Ruang Iman",
    type: "website",
    images: [{ url: LOGO_URL, width: 1000, height: 1000, alt: "Ruang Iman" }],
  },
  twitter: {
    card: "summary",
    title: "Download Ruang Iman di Google Play",
    description: "Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik Indonesia.",
    images: [LOGO_URL],
  },
};

/**
 * Branded share link for the Ruang Iman Android app on Google Play.
 * Sharing https://apps.ruangiman.com/download shows the Ruang Iman logo & description in WhatsApp previews,
 * and opens Google Play Store directly.
 */
export default function DownloadAppPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#051022] px-5 py-12 text-center text-white">
      <div className="card-lux w-full max-w-sm space-y-6 p-7">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-brand-gold/40 bg-[#07152b] shadow-xl shadow-black/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ruang Iman" className="h-full w-full object-contain" />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold">Aplikasi Resmi</p>
          <h1 className="mt-1.5 text-2xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            Ruang Iman
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-brand-muted">
            Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik Indonesia.
          </p>
        </div>

        <div className="space-y-2.5">
          <a
            href={PLAY_STORE_URL}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3.5 text-sm font-bold text-brand-dark shadow-lg shadow-brand-gold/20 transition hover:bg-brand-gold-hover"
          >
            <Download className="h-4 w-4" />
            Unduh di Google Play
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-brand-light transition hover:bg-white/10"
          >
            <Smartphone className="h-4 w-4 text-brand-gold" />
            Buka versi Web
          </Link>
        </div>
      </div>
    </main>
  );
}
