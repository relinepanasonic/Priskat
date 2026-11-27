import type { Metadata } from "next";
import Image from "next/image";
import { Landmark } from "lucide-react";
import { getLanguage } from "@/lib/lang";
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

export default async function DonationPage() {
  const lang = await getLanguage();
  const isEn = lang === "en";

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-12">
      <div className="text-center">
        <Image src="/logo.png" alt="" width={56} height={56} className="mx-auto rounded-xl" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
          {isEn ? "From the Founder" : "Dari Sang Pendiri"}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
          {isEn ? "A Message to the Family of God" : "Sebuah Pesan untuk Keluarga Allah"}
        </h2>
      </div>

      {isEn ? (
        <div className="mt-8 space-y-5 font-serif text-[17px] leading-[1.85] text-brand-light">
          <p className="text-center italic text-brand-gold">&ldquo;For where two or three gather in my name, there am I with them.&rdquo; <span className="not-italic text-brand-muted">(Matthew 18:20)</span></p>
          <p>Dear brothers and sisters in Christ,</p>
          <p>
            This app was born in quiet prayer. I never felt smart enough or capable enough to build it.
            It exists because of the wisdom God entrusted to me, and I simply strive to walk faithfully in it.
          </p>
          <p>
            Across our land, so many Catholics live close to one another yet never meet.
            So many communities serve sincerely yet walk separately.
            Yet we are one Body, one faith, one Father.
          </p>
          <p>
            Ruang Iman was created to open that path of encounter—especially for our younger generation living in today&apos;s digital world.
            May the very screens that often distance us become a bridge connecting them with prayer, Scripture, and brothers and sisters in faith.
          </p>
          <p>
            Until today, this ministry has been funded personally. I do not complain, for it is my offering.
            Yet every new soul who joins brings growing operational costs, and I pray this ministry never stops simply because of my own limitations.
          </p>
          <p>
            If the Holy Spirit moves your heart to take part, however small, I gladly receive it as a shared offering.
            There is no obligation—your prayers alone are already a priceless gift to me.
          </p>
          <p className="text-center italic text-brand-gold">&ldquo;God loves a cheerful giver.&rdquo; <span className="not-italic text-brand-muted">(2 Corinthians 9:7)</span></p>
          <p>
            Thank you for being part of Ruang Iman. May the Lord repay your kindness abundantly and bless your family with His peace.
          </p>
          <p className="pt-2">
            In prayer and love,<br />
            <span className="font-bold text-white">Nico Japar</span><br />
            <span className="text-sm text-brand-muted">Founder of Ruang Iman</span>
          </p>
        </div>
      ) : (
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
      )}

      <div className="mt-10 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold"><Landmark className="h-5 w-5" /></span>
        <p className="mt-3 text-sm font-bold text-white">{isEn ? "Would you like to support?" : "Ingin ikut mendukung?"}</p>
        {ACCOUNT ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-brand-muted">{isEn ? "Please transfer to account" : "Silakan transfer ke rekening"}</p>
            <div className="py-1">{ACCOUNT.bank === "BCA" ? <BcaMark /> : <p className="text-sm font-semibold text-white">{ACCOUNT.bank}</p>}</div>
            <CopyNumber value={ACCOUNT.number} />
            <p className="text-sm text-brand-light">{isEn ? "Account name:" : "a.n."} {ACCOUNT.holder}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-brand-light">
            {isEn ? "Account details will be announced here soon." : "Nomor rekening akan segera diumumkan di sini."}
          </p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-brand-muted">
          {isEn ? "Donations are voluntary and do not affect any features in the app." : "Donasi bersifat sukarela dan tidak memengaruhi fitur apa pun di aplikasi."}
        </p>
      </div>
    </div>
  );
}
