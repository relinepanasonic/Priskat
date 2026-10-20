import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { ARAMAIC_PRAYERS } from "@/lib/aramaic";
import AramaicPrayerCard from "./AramaicPrayerCard";

export const metadata = { title: "Doa dalam Bahasa Aram" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function AramaicPage() {
  return (
    <div className="space-y-5 p-4 md:p-6">
      <Link href="/faith/prayers" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Doa
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Bahasa Aram</p>
        <h1 className="mt-1 text-2xl font-semibold text-white" style={serif}>Doa dasar dalam bahasa Aram</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Bahasa Aram adalah bahasa sehari-hari di Tanah Suci pada zaman Yesus. Doa-doa ini ditulis dengan huruf Latin dalam bentuk Siria (Peshitta) yang dipakai Gereja Siria dan Maronit.
        </p>
      </header>

      {ARAMAIC_PRAYERS.map((p) => <AramaicPrayerCard key={p.slug} prayer={p} />)}

      <p className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-brand-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Ejaan dan lafal bahasa Aram berbeda-beda menurut tradisi (Siria Barat, Siria Timur, Maronit, Kaldea). Teks di sini hanya satu bentuk umum, bukan rekonstruksi bahasa Yesus sendiri. Tidak ada suara komputer berbahasa Aram, jadi tombol Dengarkan memakai suara Indonesia dan hanya perkiraan; untuk lafal yang benar, dengarkan penutur atau paduan suara tradisi tersebut.
      </p>
    </div>
  );
}
