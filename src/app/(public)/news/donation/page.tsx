import type { Metadata } from "next";
import Image from "next/image";
import { Landmark } from "lucide-react";
import CopyNumber from "./CopyNumber";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Pesan dari pendiri Ruang Iman dan cara mendukung pelayanan ini.",
};

/** Bank details for donations. Set to null to hide them. */
const ACCOUNT: { bank: string; number: string; holder: string } | null = { bank: "BCA", number: "3882171717", holder: "Nico Winarta Japar" };

/** The BCA wordmark, drawn here so no outside image is needed */
function BcaMark() {
  return (
    <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 shadow">
      <svg viewBox="0 0 92 30" className="h-6 w-auto" role="img" aria-label="BCA">
        <text x="2" y="25" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="28" fill="#0060AF" letterSpacing="1">BCA</text>
      </svg>
    </span>
  );
}

export default function DonationPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-12">
      <div className="text-center">
        <Image src="/logo.png" alt="" width={56} height={56} className="mx-auto rounded-xl" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Dari Sang Pendiri</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">Sebuah Pesan untuk Keluarga Allah</h2>
      </div>

      <div className="mt-8 space-y-5 font-serif text-[17px] leading-[1.85] text-brand-light">
        <p className="text-center italic text-brand-gold">&ldquo;Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada di tengah-tengah mereka.&rdquo; <span className="not-italic text-brand-muted">(Matius 18:20)</span></p>

        <p>Saudara-saudariku yang terkasih dalam Kristus,</p>

        <p>
          Aplikasi ini lahir dalam doa yang sunyi. Aku tidak merasa cukup pintar atau cukup mampu untuk membangunnya.
          Ia ada karena hikmat yang Tuhan titipkan, dan aku hanya berusaha setia menjalankannya.
        </p>

        <p>
          Di tanah air ini, begitu banyak umat Katolik yang hidup berdekatan, namun tidak saling mengenal.
          Begitu banyak komunitas yang berkarya dengan tulus, namun berjalan sendiri-sendiri.
          Padahal kita satu Tubuh, satu iman, satu Bapa.
        </p>

        <p>
          Ruang Iman hadir untuk membuka jalan perjumpaan itu. Terutama bagi generasi muda kita,
          yang hari ini hidup di dunia digital. Biarlah layar yang sama yang sering menjauhkan, kini menjadi jembatan
          yang mempertemukan mereka dengan doa, dengan Firman, dan dengan saudara seiman.
        </p>

        <p>
          Sampai hari ini, seluruh pelayanan ini kujalankan dengan dana pribadi. Aku tidak mengeluh, sebab ini persembahanku.
          Namun setiap jiwa baru yang bergabung berarti biaya yang bertumbuh. Dan aku berdoa agar pelayanan ini tidak berhenti
          hanya karena keterbatasanku.
        </p>

        <p>
          Jika Roh Kudus menggerakkan hatimu untuk ikut ambil bagian, sekecil apa pun itu, dengan sukacita aku menerimanya
          sebagai persembahan bersama. Tidak ada paksaan. Doamu pun sudah merupakan hadiah yang sangat berharga bagiku.
        </p>

        <p className="text-center italic text-brand-gold">&ldquo;Tuhan mengasihi orang yang memberi dengan sukacita.&rdquo; <span className="not-italic text-brand-muted">(2 Korintus 9:7)</span></p>

        <p>
          Terima kasih telah menjadi bagian dari Ruang Iman. Kiranya Tuhan membalas segala kebaikanmu berlipat ganda,
          dan memberkati keluargamu dalam damai-Nya.
        </p>

        <p className="pt-2">
          Dalam doa dan kasih,<br />
          <span className="font-bold text-white">Nico Japar</span><br />
          <span className="text-sm text-brand-muted">Pendiri Ruang Iman</span>
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold"><Landmark className="h-5 w-5" /></span>
        <p className="mt-3 text-sm font-bold text-white">Ingin ikut mendukung?</p>
        {ACCOUNT ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-brand-muted">Silakan transfer ke rekening</p>
            <div className="py-1">{ACCOUNT.bank === "BCA" ? <BcaMark /> : <p className="text-sm font-semibold text-white">{ACCOUNT.bank}</p>}</div>
            <CopyNumber value={ACCOUNT.number} />
            <p className="text-sm text-brand-light">a.n. {ACCOUNT.holder}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-brand-light">Nomor rekening akan segera diumumkan di sini.</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-brand-muted">Donasi bersifat sukarela dan tidak memengaruhi fitur apa pun di aplikasi.</p>
      </div>
    </div>
  );
}
