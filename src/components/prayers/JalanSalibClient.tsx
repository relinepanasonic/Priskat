"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

// ─── STATION DATA ──────────────────────────────────────────────────────────────
const STATIONS = [
  {
    no: 1,
    title: "Yesus Dihukum Mati",
    image: "/images/prayers/jalan-salib/station-01.jpeg",
    scripture: '"Pilatus menyerahkan Dia kepada mereka untuk disalibkan." — Yoh 19:16',
    reflection: "Yesus, Engkau menerima hukuman yang tidak adil tanpa melawan. Ajarku untuk menerima dengan sabar ketidakadilan yang menimpaku, dan percaya bahwa kebenaran-Mu akan menang.",
  },
  {
    no: 2,
    title: "Yesus Memanggul Salib",
    image: "/images/prayers/jalan-salib/station-02.jpeg",
    scripture: '"Sambil memikul salib-Nya, Ia pergi ke luar menuju ke tempat yang bernama Tempat Tengkorak." — Yoh 19:17',
    reflection: "Yesus, Engkau memanggul beban dosa kami. Bantu aku untuk memanggul salib hidupku dengan cinta dan kepercayaan kepada-Mu.",
  },
  {
    no: 3,
    title: "Yesus Jatuh Pertama Kali",
    image: "/images/prayers/jalan-salib/station-03.jpeg",
    scripture: '"Marilah kepada-Ku, semua yang lelah dan berbeban berat, Aku akan memberi kelegaan kepadamu." — Mat 11:28',
    reflection: "Yesus, meski jatuh, Engkau bangkit lagi. Ketika aku jatuh dalam dosa atau kesulitan, bangkitkan aku dan beri aku kekuatan untuk melanjutkan perjalanan.",
  },
  {
    no: 4,
    title: "Yesus Bertemu Bunda Maria",
    image: "/images/prayers/jalan-salib/station-04.jpeg",
    scripture: '"Di dekat salib Yesus, berdiri ibu-Nya." — Yoh 19:25',
    reflection: "Yesus dan Maria, pertemuan kalian dalam penderitaan ini adalah sumber kekuatan. Ajarku untuk tidak takut mendampingi orang-orang yang menderita.",
  },
  {
    no: 5,
    title: "Simon Memikul Salib",
    image: "/images/prayers/jalan-salib/station-05.jpeg",
    scripture: '"Seorang yang bernama Simon dari Kirene dipaksa memikul salib Yesus." — Mat 27:32',
    reflection: "Simon dipaksa, namun melaluinya ia menyentuh Yesus. Semoga aku rela membantu sesamaku yang menderita, dan dalam pelayanan itu menemukan wajah Kristus.",
  },
  {
    no: 6,
    title: "Veronika Mengusap Wajah Yesus",
    image: "/images/prayers/jalan-salib/station-06.jpeg",
    scripture: '"Sesungguhnya segala sesuatu yang kamu lakukan untuk salah seorang dari saudara-Ku yang paling hina ini, kamu lakukan untuk Aku." — Mat 25:40',
    reflection: "Veronika berani melawan ketakutan demi menghibur-Mu, Yesus. Berani-kanlah aku untuk menunjukkan kasih kepada sesama, meski lingkungan tidak mendukung.",
  },
  {
    no: 7,
    title: "Yesus Jatuh Kedua Kali",
    image: "/images/prayers/jalan-salib/station-07.jpeg",
    scripture: '"Roh memang penurut, tetapi daging lemah." — Mat 26:41',
    reflection: "Yesus yang jatuh dua kali, Engkau mengerti kelemahanku. Ketika aku berulang kali jatuh dalam kelemahan yang sama, jangan tinggalkan aku.",
  },
  {
    no: 8,
    title: "Yesus Menghibur Perempuan Yerusalem",
    image: "/images/prayers/jalan-salib/station-08.jpeg",
    scripture: '"Hai putri-putri Yerusalem, janganlah kamu menangisi Aku, melainkan tangisilah dirimu sendiri." — Luk 23:28',
    reflection: "Yesus, bahkan dalam penderitaan-Mu, Engkau peduli dengan orang lain. Semoga aku belajar untuk tidak terlalu tenggelam dalam diriku sendiri, tapi peka terhadap orang sekitarku.",
  },
  {
    no: 9,
    title: "Yesus Jatuh Ketiga Kali",
    image: "/images/prayers/jalan-salib/station-09.jpeg",
    scripture: '"Hamba-Ku itu tumbuh di hadapan Dia seperti tunas, seperti akar dari tanah yang kering." — Yes 53:2',
    reflection: "Yesus, tiga kali jatuh namun tetap bangkit dan melanjutkan perjalanan menuju Golgota. Ajarku ketekunan dan keteguhan dalam menanggung penderitaan.",
  },
  {
    no: 10,
    title: "Pakaian Yesus Dilucuti",
    image: "/images/prayers/jalan-salib/station-10.jpeg",
    scripture: '"Mereka membagi-bagikan pakaian-Nya di antara mereka dengan membuang undi." — Yoh 19:24',
    reflection: "Yesus dilucuti segalanya, namun martabat-Nya tak dapat dirampas. Semoga aku tidak melekat pada harta duniawi, dan menemukan kekayaan sejati dalam Engkau.",
  },
  {
    no: 11,
    title: "Yesus Dipakukan di Salib",
    image: "/images/prayers/jalan-salib/station-11.jpeg",
    scripture: '"Mereka menyalibkan Dia." — Luk 23:33',
    reflection: "Paku-paku itu adalah dosa-dosaku, Yesus. Ampunkan aku dan semua orang yang turut andil dalam penderitaan-Mu melalui dosa-dosa kami.",
  },
  {
    no: 12,
    title: "Yesus Wafat di Kayu Salib",
    image: "/images/prayers/jalan-salib/station-12.jpeg",
    scripture: '"Sudah selesai!" Lalu Ia menundukkan kepala-Nya dan menyerahkan nyawa-Nya. — Yoh 19:30',
    reflection: "Yesus, kematian-Mu adalah puncak kasih-Mu. Tidak ada yang lebih besar dari ini. Aku mencintai-Mu, Tuhan.",
  },
  {
    no: 13,
    title: "Yesus Diturunkan dari Salib",
    image: "/images/prayers/jalan-salib/station-13.jpeg",
    scripture: '"Berbahagialah orang yang berdukacita, karena mereka akan dihibur." — Mat 5:4',
    reflection: "Maria, ibumu menerima tubuh-Mu yang tak bernyawa dengan iman yang tak tergoyahkan. Semoga aku pun bertahan dalam iman, bahkan ketika segalanya tampak gelap.",
  },
  {
    no: 14,
    title: "Yesus Dimakamkan",
    image: "/images/prayers/jalan-salib/station-14.jpeg",
    scripture: '"Mereka membaringkan Yesus di situ." — Yoh 19:42',
    reflection: "Yesus dikuburkan seperti benih di tanah. Tapi benih itu akan tumbuh menjadi kebangkitan. Tanamkan dalam hatiku harapan akan kebangkitan dan kehidupan kekal.",
  },
];

const BAPA_KAMI = `Bapa kami yang ada di surga,\ndimuliakanlah nama-Mu,\ndatanglah kerajaan-Mu,\njadilah kehendak-Mu\ndi atas bumi seperti di dalam surga.\nBerilah kami rezeki pada hari ini\ndan ampunilah kesalahan kami,\nseperti kami pun mengampuni\nyang bersalah kepada kami;\ndan janganlah masukkan kami ke dalam pencobaan,\ntetapi bebaskanlah kami dari yang jahat. Amin.`;

const SALAM_MARIA = `Salam Maria, penuh rahmat,\nTuhan sertamu,\nterpujilah engkau di antara wanita,\ndan terpujilah buah tubuhmu, Yesus.\nSanta Maria, Bunda Allah,\ndoakanlah kami yang berdosa ini,\nsekarang dan waktu kami mati. Amin.`;

const KEMULIAAN = `Kemuliaan kepada Bapa, dan Putra, dan Roh Kudus,\nseperti pada permulaan, sekarang, selalu,\ndan sepanjang segala abad. Amin.`;

const SUB_STEPS = ["Pembukaan", "Sabda", "Renungan", "Bapa Kami", "Salam Maria", "Kemuliaan"];

function getSubText(stationIdx: number, subIdx: number): string {
  const s = STATIONS[stationIdx];
  switch (subIdx) {
    case 0: return `Pemimpin:\n"Kami menyembah-Mu ya Tuhan Yesus Kristus, dan memuji-Mu."\n\nUmat:\n"Karena dengan salib-Mu yang kudus, Engkau telah menebus dunia."`;
    case 1: return s.scripture;
    case 2: return s.reflection;
    case 3: return BAPA_KAMI;
    case 4: return SALAM_MARIA;
    case 5: return KEMULIAAN;
    default: return "";
  }
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function JalanSalibClient() {
  const [stationIdx, setStationIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [done, setDone] = useState(false);

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
  const subText = getSubText(stationIdx, subIdx);
  const globalStep = stationIdx * totalSubSteps + subIdx;
  const totalSteps = STATIONS.length * totalSubSteps;

  if (done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="text-6xl animate-pulse">✝️</div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Jalan Salib Selesai</h2>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            "Jika kamu mau mengikut Aku, pikullah salibmu dan ikutlah Aku." — Mat 16:24
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={() => { setStationIdx(0); setSubIdx(0); setDone(false); }}
            className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto shadow-lg shadow-amber-900/30"
          >
            <RotateCcw className="h-4 w-4" />
            Mulai Lagi
          </button>
          <Link 
            href="/faith/prayers" 
            className="px-8 py-3.5 rounded-xl font-bold transition-all text-white/50 hover:text-white hover:bg-white/5 w-full sm:w-auto"
          >
            Kembali ke Doa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] text-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* ─── IMAGE PANEL (Top on Mobile, Left on PC) ─── */}
      <div className="relative w-full lg:w-1/2 xl:w-[55%] flex-shrink-0 flex flex-col bg-black h-[35vh] lg:h-full">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Blurred Background to fill empty space elegantly on PC */}
          <div 
            className="absolute inset-0 opacity-40 blur-2xl scale-110" 
            style={{ backgroundImage: `url(${station.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
          />
          {/* Uncropped Image */}
          <div className="relative w-full h-full lg:p-12 flex items-center justify-center">
            <div className="relative w-full h-full lg:rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={station.image} 
                alt={station.title} 
                fill 
                className="object-contain lg:object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Back Button Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <Link 
              href="/faith/prayers" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── CONTENT PANEL (Bottom on Mobile, Right on PC) ─── */}
      <div className="flex-1 flex flex-col bg-[#111] relative z-20 h-[65vh] lg:h-full shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/5 w-full flex-shrink-0">
           <div 
             className="h-full bg-amber-500 transition-all duration-500" 
             style={{ width: `${((globalStep + 1) / totalSteps) * 100}%` }} 
           />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 lg:px-10 lg:pt-10 lg:pb-6 flex-shrink-0">
            <div className="text-amber-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1.5 lg:mb-2">
              Peristiwa {stationIdx + 1} dari 14
            </div>
            <h2 className="text-2xl lg:text-4xl font-bold leading-tight text-white/90 tracking-tight">
              {station.title}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto px-6 lg:px-10 border-b border-white/5 scrollbar-hide flex-shrink-0">
             {SUB_STEPS.map((label, i) => (
               <button
                 key={i}
                 onClick={() => setSubIdx(i)}
                 className={`whitespace-nowrap px-4 py-3 text-xs lg:text-sm font-semibold transition-all border-b-2 ${
                   i === subIdx
                     ? "text-amber-400 border-amber-500"
                     : i < subIdx
                     ? "text-white/40 border-transparent hover:text-white/60"
                     : "text-white/20 border-transparent hover:text-white/40"
                 }`}
               >
                 {label}
               </button>
             ))}
          </div>

          {/* Text Body */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <p className="text-white/80 text-[15px] lg:text-lg leading-[1.8] lg:leading-[2] font-serif whitespace-pre-wrap">
              {subText}
            </p>
          </div>

          {/* Nav Buttons */}
          <div className="p-5 lg:p-8 border-t border-white/5 flex items-center gap-3 bg-[#111] flex-shrink-0">
             <button 
               onClick={handlePrev} 
               disabled={stationIdx === 0 && subIdx === 0}
               className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-30 transition-all"
             >
               <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
             </button>

             <button 
               onClick={handleNext} 
               className="flex-1 h-12 lg:h-14 flex items-center justify-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-600 active:scale-[0.98] text-white font-bold transition-all shadow-[0_0_20px_rgba(180,83,9,0.3)] text-sm lg:text-base"
             >
               {done || (isLastSub && isLastStation)
                 ? "Selesai ✝️"
                 : isLastSub
                 ? <>Peristiwa Berikutnya <ChevronRight className="h-5 w-5" /></>
                 : <>Lanjut <ChevronRight className="h-5 w-5" /></>
               }
             </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
