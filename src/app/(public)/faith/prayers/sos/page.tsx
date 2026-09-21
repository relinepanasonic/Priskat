import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, ChevronLeft, Heart, Phone } from "lucide-react";

export const metadata: Metadata = { title: "SOS Doa" };

const waUrl = `https://wa.me/62818868885?text=${encodeURIComponent("Halo, saya butuh dukungan doa 🙏")}`;

export default function SOSPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6 text-center">
      <Link
        href="/faith/prayers"
        className="absolute top-6 left-4 flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </Link>

      {/* Pulsing SOS Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
        <div className="relative w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
          <LifeBuoy className="h-12 w-12 text-red-400" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">SOS Doa</h1>
      <p className="text-gray-400 text-base max-w-xs mb-2">
        Kamu tidak sendirian.
      </p>
      <p className="text-gray-500 text-sm max-w-sm mb-10 leading-relaxed">
        Kami ada untuk mendoakanmu. Kirimkan permintaan doamu dan komunitas akan mendoakanmu bersama.
      </p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] active:scale-95"
      >
        <Phone className="h-5 w-5" />
        Minta Didoakan (WhatsApp)
      </a>

      <div className="mt-12 flex flex-col items-center gap-3 text-gray-600">
        <Heart className="h-5 w-5 text-red-900" />
        <p className="text-xs max-w-xs">
          "Berdoalah tanpa henti." — 1 Tesalonika 5:17
        </p>
      </div>
    </main>
  );
}
