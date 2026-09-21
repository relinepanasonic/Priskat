"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw, Smartphone } from "lucide-react";

// ─── STATION DATA ──────────────────────────────────────────────────────────────
const STATIONS = [
  {
    no: 1,
    title: "Yesus Dihukum Mati",
    image: "/images/prayers/jalan-salib/station-01.jpg",
    scripture: '"Pilatus menyerahkan Dia kepada mereka untuk disalibkan." — Yoh 19:16',
    reflection: "Yesus, Engkau menerima hukuman yang tidak adil tanpa melawan. Ajarku untuk menerima dengan sabar ketidakadilan yang menimpaku, dan percaya bahwa kebenaran-Mu akan menang.",
  },
  {
    no: 2,
    title: "Yesus Memanggul Salib",
    image: "/images/prayers/jalan-salib/station-02.jpg",
    scripture: '"Sambil memikul salib-Nya, Ia pergi ke luar menuju ke tempat yang bernama Tempat Tengkorak." — Yoh 19:17',
    reflection: "Yesus, Engkau memanggul beban dosa kami. Bantu aku untuk memanggul salib hidupku dengan cinta dan kepercayaan kepada-Mu.",
  },
  {
    no: 3,
    title: "Yesus Jatuh untuk Pertama Kali",
    image: "/images/prayers/jalan-salib/station-03.jpg",
    scripture: '"Marilah kepada-Ku, semua yang lelah dan berbeban berat, Aku akan memberi kelegaan kepadamu." — Mat 11:28',
    reflection: "Yesus, meski jatuh, Engkau bangkit lagi. Ketika aku jatuh dalam dosa atau kesulitan, bangkitkan aku dan beri aku kekuatan untuk melanjutkan perjalanan.",
  },
  {
    no: 4,
    title: "Yesus Bertemu dengan Bunda Maria",
    image: "/images/prayers/jalan-salib/station-04.jpg",
    scripture: '"Di dekat salib Yesus, berdiri ibu-Nya." — Yoh 19:25',
    reflection: "Yesus dan Maria, pertemuan kalian dalam penderitaan ini adalah sumber kekuatan. Ajarku untuk tidak takut mendampingi orang-orang yang menderita.",
  },
  {
    no: 5,
    title: "Simon dari Kirene Memikul Salib",
    image: "/images/prayers/jalan-salib/station-05.jpg",
    scripture: '"Seorang yang bernama Simon dari Kirene dipaksa memikul salib Yesus." — Mat 27:32',
    reflection: "Simon dipaksa, namun melaluinya ia menyentuh Yesus. Semoga aku rela membantu sesamaku yang menderita, dan dalam pelayanan itu menemukan wajah Kristus.",
  },
  {
    no: 6,
    title: "Veronika Mengusap Wajah Yesus",
    image: "/images/prayers/jalan-salib/station-06.jpg",
    scripture: '"Sesungguhnya segala sesuatu yang kamu lakukan untuk salah seorang dari saudara-Ku yang paling hina ini, kamu lakukan untuk Aku." — Mat 25:40',
    reflection: "Veronika berani melawan ketakutan demi menghibur-Mu, Yesus. Berani-kanlah aku untuk menunjukkan kasih kepada sesama, meski lingkungan tidak mendukung.",
  },
  {
    no: 7,
    title: "Yesus Jatuh untuk Kedua Kali",
    image: "/images/prayers/jalan-salib/station-07.jpg",
    scripture: '"Roh memang penurut, tetapi daging lemah." — Mat 26:41',
    reflection: "Yesus yang jatuh dua kali, Engkau mengerti kelemahanku. Ketika aku berulang kali jatuh dalam kelemahan yang sama, jangan tinggalkan aku.",
  },
  {
    no: 8,
    title: "Yesus Menghibur Perempuan-Perempuan Yerusalem",
    image: "/images/prayers/jalan-salib/station-08.jpg",
    scripture: '"Hai putri-putri Yerusalem, janganlah kamu menangisi Aku, melainkan tangisilah dirimu sendiri." — Luk 23:28',
    reflection: "Yesus, bahkan dalam penderitaan-Mu, Engkau peduli dengan orang lain. Semoga aku belajar untuk tidak terlalu tenggelam dalam diriku sendiri, tapi peka terhadap orang sekitarku.",
  },
  {
    no: 9,
    title: "Yesus Jatuh untuk Ketiga Kali",
    image: "/images/prayers/jalan-salib/station-09.jpg",
    scripture: '"Hamba-Ku itu tumbuh di hadapan Dia seperti tunas, seperti akar dari tanah yang kering." — Yes 53:2',
    reflection: "Yesus, tiga kali jatuh namun tetap bangkit dan melanjutkan perjalanan menuju Golgota. Ajarku ketekunan dan keteguhan dalam menanggung penderitaan.",
  },
  {
    no: 10,
    title: "Yesus Dilucuti Pakaian-Nya",
    image: "/images/prayers/jalan-salib/station-10.jpg",
    scripture: '"Mereka membagi-bagikan pakaian-Nya di antara mereka dengan membuang undi." — Yoh 19:24',
    reflection: "Yesus dilucuti segalanya, namun martabat-Nya tak dapat dirampas. Semoga aku tidak melekat pada harta duniawi, dan menemukan kekayaan sejati dalam Engkau.",
  },
  {
    no: 11,
    title: "Yesus Dipakukan di Salib",
    image: "/images/prayers/jalan-salib/station-11.jpg",
    scripture: '"Mereka menyalibkan Dia." — Luk 23:33',
    reflection: "Paku-paku itu adalah dosa-dosaku, Yesus. Ampunkan aku dan semua orang yang turut andil dalam penderitaan-Mu melalui dosa-dosa kami.",
  },
  {
    no: 12,
    title: "Yesus Wafat di Kayu Salib",
    image: "/images/prayers/jalan-salib/station-12.jpg",
    scripture: '"Sudah selesai!" Lalu Ia menundukkan kepala-Nya dan menyerahkan nyawa-Nya. — Yoh 19:30',
    reflection: "Yesus, kematian-Mu adalah puncak kasih-Mu. Tidak ada yang lebih besar dari ini. Aku mencintai-Mu, Tuhan.",
  },
  {
    no: 13,
    title: "Yesus Diturunkan dari Salib",
    image: "/images/prayers/jalan-salib/station-13.jpg",
    scripture: '"Berbahagialah orang yang berdukacita, karena mereka akan dihibur." — Mat 5:4',
    reflection: "Maria, ibumu menerima tubuh-Mu yang tak bernyawa dengan iman yang tak tergoyahkan. Semoga aku pun bertahan dalam iman, bahkan ketika segalanya tampak gelap.",
  },
  {
    no: 14,
    title: "Yesus Dimakamkan",
    image: "/images/prayers/jalan-salib/station-14.jpg",
    scripture: '"Mereka membaringkan Yesus di situ." — Yoh 19:42',
    reflection: "Yesus dikuburkan seperti benih di tanah. Tapi benih itu akan tumbuh menjadi kebangkitan. Tanamkan dalam hatiku harapan akan kebangkitan dan kehidupan kekal.",
  },
];

const BAPA_KAMI = `Bapa kami yang ada di surga,
dimuliakanlah nama-Mu,
datanglah kerajaan-Mu,
jadilah kehendak-Mu
di atas bumi seperti di dalam surga.
Berilah kami rezeki pada hari ini
dan ampunilah kesalahan kami,
seperti kami pun mengampuni
yang bersalah kepada kami;
dan janganlah masukkan kami ke dalam pencobaan,
tetapi bebaskanlah kami dari yang jahat. Amin.`;

const SALAM_MARIA = `Salam Maria, penuh rahmat,
Tuhan sertamu,
terpujilah engkau di antara wanita,
dan terpujilah buah tubuhmu, Yesus.
Santa Maria, Bunda Allah,
doakanlah kami yang berdosa ini,
sekarang dan waktu kami mati. Amin.`;

const KEMULIAAN = `Kemuliaan kepada Bapa, dan Putra, dan Roh Kudus,
seperti pada permulaan, sekarang, selalu,
dan sepanjang segala abad. Amin.`;

// Sub-steps per station: opening → scripture → reflection → Bapa Kami → Salam Maria → Kemuliaan
const SUB_STEPS = ["Pembukaan", "Sabda", "Renungan", "Bapa Kami", "Salam Maria", "Kemuliaan"];

function getSubText(stationIdx: number, subIdx: number): string {
  const s = STATIONS[stationIdx];
  switch (subIdx) {
    case 0: return `Pemimpin: "Kami menyembah-Mu ya Tuhan Yesus Kristus, dan memuji-Mu."\n\nJawab: "Karena dengan salib-Mu yang kudus, Engkau telah menebus dunia."`;
    case 1: return s.scripture;
    case 2: return s.reflection;
    case 3: return BAPA_KAMI;
    case 4: return SALAM_MARIA;
    case 5: return KEMULIAAN;
    default: return "";
  }
}

// ─── LANDSCAPE GUARD ──────────────────────────────────────────────────────────
function RotatePrompt() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6 text-center px-8">
      <div className="animate-bounce">
        <Smartphone className="h-16 w-16 text-amber-400" />
      </div>
      <h2 className="text-xl font-bold text-white">Putar Ponselmu</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        Jalan Salib dirancang untuk mode <span className="text-amber-300 font-bold">landscape</span>.<br />
        Putar ponselmu ke samping untuk pengalaman terbaik.
      </p>
      <div className="border border-amber-500/30 rounded-xl px-4 py-2 text-amber-300 text-xs">
        ↺ Landscape Mode
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function JalanSalibClient() {
  const [isLandscape, setIsLandscape] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stationIdx, setStationIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 1024;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(!mobile || landscape);
    }
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const totalSubSteps = SUB_STEPS.length;
  const isLastSub = subIdx === totalSubSteps - 1;
  const isLastStation = stationIdx === STATIONS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastSub) {
      if (isLastStation) { setDone(true); return; }
      setStationIdx(s => s + 1);
      setSubIdx(0);
    } else {
      setSubIdx(s => s + 1);
    }
  }, [isLastSub, isLastStation]);

  const handlePrev = useCallback(() => {
    if (subIdx > 0) {
      setSubIdx(s => s - 1);
    } else if (stationIdx > 0) {
      setStationIdx(s => s - 1);
      setSubIdx(totalSubSteps - 1);
    }
  }, [subIdx, stationIdx, totalSubSteps]);

  const station = STATIONS[stationIdx];
  const subTitle = SUB_STEPS[subIdx];
  const subText = getSubText(stationIdx, subIdx);
  const globalStep = stationIdx * totalSubSteps + subIdx;
  const totalSteps = STATIONS.length * totalSubSteps;

  if (isMobile && !isLandscape) return <RotatePrompt />;

  if (done) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="text-6xl">✝️</div>
        <h2 className="text-2xl font-bold text-white">Jalan Salib Selesai</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          "Jika kamu mau mengikut Aku, pikullah salibmu dan ikutlah Aku." — Mat 16:24
        </p>
        <button
          onClick={() => { setStationIdx(0); setSubIdx(0); setDone(false); }}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Mulai Lagi
        </button>
        <Link href="/faith/prayers" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          Kembali ke Doa
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">
      {/* LEFT: Image panel */}
      <div className="relative w-[45%] h-full flex-shrink-0">
        {/* Gradient background as placeholder until images are added */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950"
          style={{
            backgroundImage: `url(${station.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />

        {/* Station number badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Link href="/faith/prayers" className="text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            Peristiwa {stationIdx + 1} dari 14
          </div>
          <h2 className="text-white font-bold text-2xl leading-tight drop-shadow-lg">
            {station.title}
          </h2>
        </div>
      </div>

      {/* RIGHT: Prayer panel */}
      <div className="flex-1 flex flex-col bg-[#0d0d0d] h-full">
        {/* Progress bar */}
        <div className="h-1 bg-stone-800 flex-shrink-0">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${((globalStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Sub-step tabs */}
        <div className="flex border-b border-white/5 px-4 pt-3 gap-1 flex-shrink-0">
          {SUB_STEPS.map((label, i) => (
            <button
              key={i}
              onClick={() => setSubIdx(i)}
              className={`px-2 py-1 text-[10px] rounded-t font-medium transition-colors ${
                i === subIdx
                  ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500"
                  : i < subIdx
                  ? "text-gray-600 hover:text-gray-400"
                  : "text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Prayer text */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">{subTitle}</h3>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-serif">{subText}</p>
        </div>

        {/* Navigation buttons */}
        <div className="p-4 flex items-center gap-3 border-t border-white/5 flex-shrink-0">
          <button
            onClick={handlePrev}
            disabled={stationIdx === 0 && subIdx === 0}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handleNext}
            className="flex-1 bg-amber-700 hover:bg-amber-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(180,83,9,0.4)] flex items-center justify-center gap-2 text-sm"
          >
            {done || (isLastSub && isLastStation)
              ? "Selesai ✝️"
              : isLastSub
              ? <>Peristiwa Berikutnya <ChevronRight className="h-4 w-4" /></>
              : <>Lanjut <ChevronRight className="h-4 w-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
