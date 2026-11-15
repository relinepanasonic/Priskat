import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import BenedictPrayer from "./BenedictPrayer";

export const metadata = { title: "Doa Medali Santo Benediktus" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function BenedictPage() {
  return (
    <div className="space-y-5 p-4 pb-28 md:p-6">
      <Link href="/faith/prayers" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Doa
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Doa perlindungan</p>
        <h1 className="mt-1 text-2xl font-semibold text-white" style={serif}>Medali Santo Benediktus</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Medali Santo Benediktus dipakai umat Katolik sejak berabad-abad sebagai tanda perlindungan dan perlawanan terhadap pencobaan.
          Huruf-huruf di salib dan di lingkaran luarnya adalah singkatan dari kalimat Latin berikut. Doakanlah dengan tenang, sambil menyerahkan diri kepada Kristus.
        </p>
      </header>

      <BenedictPrayer />

      <p className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-brand-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Ponsel tidak punya suara berbahasa Latin, jadi tombol Dengarkan memakai suara Italia, yang paling mendekati lafal Latin gereja. Medali adalah sakramentali: kekuatannya datang dari doa Gereja dan iman orang yang memakainya, bukan dari benda atau kata-katanya sendiri.
      </p>
    </div>
  );
}
