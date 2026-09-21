"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

// ─── PRAYER TEXTS ─────────────────────────────────────────────────────────────
const AKU_PERCAYA = `Aku percaya akan Allah, Bapa yang mahakuasa, pencipta langit dan bumi.
Dan akan Yesus Kristus, Putra-Nya yang tunggal, Tuhan kita,
yang dikandung dari Roh Kudus, dilahirkan oleh Perawan Maria;
yang menderita sengsara dalam pemerintahan Pontius Pilatus,
disalibkan, wafat, dan dimakamkan;
yang turun ke tempat penantian;
pada hari ketiga bangkit dari antara orang mati;
yang naik ke surga, duduk di sebelah kanan Allah Bapa yang mahakuasa;
dari situ Ia akan datang mengadili orang yang hidup dan yang mati.
Aku percaya akan Roh Kudus,
Gereja Katolik yang kudus, persekutuan para kudus,
pengampunan dosa, kebangkitan badan,
kehidupan kekal. Amin.`;

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

const TERPUJILAH = `O Yesus yang baik, ampunilah dosa kami,
bebaskanlah kami dari api neraka,
hantarkanlah jiwa-jiwa ke surga,
terutama mereka yang sangat membutuhkan kerahiman-Mu. Amin.`;

const SALAM_YA_RATU = `Salam ya Ratu, Bunda yang berbelaskasih,
hidup, hiburan, dan harapan kami, salam.
Kepadamu kami berseru, anak-anak Hawa yang malang.
Kepadamu kami mengeluh, merintih dan menangis
di lembah air mata ini.
Maka ya Ibunda kami, pengantara kami,
arahkanlah pandanganmu yang penuh belaskasih kepada kami.
Dan sesudah pengasingan ini, tunjukkanlah kepada kami,
Yesus, buah tubuhmu yang terpuji.
O yang murah hati, o yang pengasih,
o Santa Maria Bunda yang suci. Amin.`;

// ─── PERISTIWA DATA ────────────────────────────────────────────────────────────
const PERISTIWA = {
  gembira: {
    label: "Peristiwa Gembira",
    emoji: "😊",
    days: "Senin & Sabtu",
    color: "from-yellow-900/60 to-yellow-950/80",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    mysteries: [
      { title: "1. Kabar Sukacita", ref: "Luk 1:26-38", intention: "Menumbuhkan kerendahan hati" },
      { title: "2. Maria Mengunjungi Elisabeth", ref: "Luk 1:39-56", intention: "Menumbuhkan kasih kepada sesama" },
      { title: "3. Yesus Lahir di Betlehem", ref: "Luk 2:1-20", intention: "Menumbuhkan kemiskinan rohani" },
      { title: "4. Yesus Dipersembahkan di Bait Allah", ref: "Luk 2:22-40", intention: "Menumbuhkan ketaatan kepada Allah" },
      { title: "5. Yesus Ditemukan di Bait Allah", ref: "Luk 2:41-52", intention: "Menumbuhkan kecintaan pada hidup doa" },
    ],
  },
  terang: {
    label: "Peristiwa Terang",
    emoji: "✨",
    days: "Kamis",
    color: "from-sky-900/60 to-sky-950/80",
    border: "border-sky-500/30",
    text: "text-sky-300",
    mysteries: [
      { title: "1. Yesus Dibaptis di Sungai Yordan", ref: "Mat 3:13-17", intention: "Menghayati pembaptisan" },
      { title: "2. Yesus di Pesta Kana", ref: "Yoh 2:1-12", intention: "Kepercayaan melalui perantaraan Maria" },
      { title: "3. Yesus Memberitakan Kerajaan Allah", ref: "Mrk 1:14-15", intention: "Tobat dan percaya pada Injil" },
      { title: "4. Yesus Dimuliakan di Tabor", ref: "Luk 9:28-36", intention: "Kemitraan dengan Kristus yang dimuliakan" },
      { title: "5. Yesus Mengadakan Ekaristi", ref: "Mat 26:26-28", intention: "Adorasi Ekaristi" },
    ],
  },
  sedih: {
    label: "Peristiwa Sedih",
    emoji: "😢",
    days: "Selasa & Jumat",
    color: "from-violet-900/60 to-violet-950/80",
    border: "border-violet-500/30",
    text: "text-violet-300",
    mysteries: [
      { title: "1. Yesus Berdoa di Taman Getsemani", ref: "Mat 26:36-46", intention: "Ketabahan dalam pencobaan" },
      { title: "2. Yesus Didera", ref: "Yoh 19:1", intention: "Silih atas dosa-dosa terhadap kemurnian" },
      { title: "3. Yesus Dimahkotai Duri", ref: "Mat 27:28-29", intention: "Silih atas dosa kesombongan" },
      { title: "4. Yesus Memanggul Salib", ref: "Yoh 19:17", intention: "Ketabahan memanggul salib" },
      { title: "5. Yesus Wafat di Kayu Salib", ref: "Yoh 19:25-30", intention: "Silih atas dosa-dosa kita" },
    ],
  },
  mulia: {
    label: "Peristiwa Mulia",
    emoji: "👑",
    days: "Rabu & Minggu",
    color: "from-amber-900/60 to-amber-950/80",
    border: "border-amber-500/30",
    text: "text-amber-300",
    mysteries: [
      { title: "1. Yesus Bangkit dari Mati", ref: "Luk 24:1-12", intention: "Iman yang kuat" },
      { title: "2. Yesus Naik ke Surga", ref: "Luk 24:50-53", intention: "Kerinduan akan surga" },
      { title: "3. Roh Kudus Turun atas Para Rasul", ref: "Kis 2:1-13", intention: "Karunia Roh Kudus" },
      { title: "4. Maria Diangkat ke Surga", ref: "Why 12:1", intention: "Kesalehan hidup" },
      { title: "5. Maria Dimahkotai di Surga", ref: "Why 12:1", intention: "Semangat doa" },
    ],
  },
} as const;

type PeristiwaKey = keyof typeof PERISTIWA;

// ─── BUILD STEPS ───────────────────────────────────────────────────────────────
interface Step {
  phase: string;
  title: string;
  sub?: string;
  text: string;
  counter?: string;
}

function buildSteps(pk: PeristiwaKey): Step[] {
  const p = PERISTIWA[pk];
  const steps: Step[] = [];

  // Opening
  steps.push({ phase: "Pembukaan", title: "Aku Percaya", text: AKU_PERCAYA });
  steps.push({ phase: "Pembukaan", title: "Bapa Kami", text: BAPA_KAMI });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "1 dari 3 — untuk iman", text: SALAM_MARIA, counter: "1/3" });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "2 dari 3 — untuk pengharapan", text: SALAM_MARIA, counter: "2/3" });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "3 dari 3 — untuk kasih", text: SALAM_MARIA, counter: "3/3" });
  steps.push({ phase: "Pembukaan", title: "Kemuliaan", text: KEMULIAAN });

  // 5 Decades
  p.mysteries.forEach((m, i) => {
    steps.push({ phase: `Dekade ${i + 1}`, title: m.title, sub: `${m.ref} — ${m.intention}`, text: `Renungkan peristiwa ini...\n\n"${m.ref}"` });
    steps.push({ phase: `Dekade ${i + 1}`, title: "Bapa Kami", text: BAPA_KAMI });
    for (let j = 1; j <= 10; j++) {
      steps.push({ phase: `Dekade ${i + 1}`, title: "Salam Maria", sub: `${j} dari 10`, text: SALAM_MARIA, counter: `${j}/10` });
    }
    steps.push({ phase: `Dekade ${i + 1}`, title: "Kemuliaan", text: KEMULIAAN });
    steps.push({ phase: `Dekade ${i + 1}`, title: "Terpujilah (Fatima)", text: TERPUJILAH });
  });

  // Closing
  steps.push({ phase: "Penutup", title: "Salam Ya Ratu", text: SALAM_YA_RATU });
  return steps;
}

// ─── BEAD PROGRESS ────────────────────────────────────────────────────────────
function BeadProgress({ current, total }: { current: number; total: number }) {
  const MAX_DOTS = 20;
  const step = Math.max(1, Math.ceil(total / MAX_DOTS));
  const dots = Math.ceil(total / step);
  const filled = Math.round((current / total) * dots);

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < filled
              ? "w-2.5 h-2.5 bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]"
              : "w-2 h-2 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function RosarioClient() {
  const [chosen, setChosen] = useState<PeristiwaKey | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const steps = chosen ? buildSteps(chosen) : [];
  const current = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) { setDone(true); return; }
    setStepIdx(s => s + 1);
  }, [isLast]);

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
  }, [stepIdx]);

  const restart = () => { setChosen(null); setStepIdx(0); setDone(false); };

  // ── PICKER ──
  if (!chosen) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <Image
          src="/images/prayers/rosario-bg.jpg"
          alt="Rosario"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 w-full max-w-sm">
          <Link href="/faith/prayers" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-8">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📿</div>
            <h1 className="text-3xl font-bold text-white mb-2">Rosario</h1>
            <p className="text-gray-400 text-sm">Pilih peristiwa yang ingin kamu renungkan</p>
          </div>

          <div className="space-y-3">
            {(Object.entries(PERISTIWA) as [PeristiwaKey, typeof PERISTIWA[PeristiwaKey]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setChosen(key)}
                className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r ${val.color} border ${val.border} hover:scale-[1.02] active:scale-[0.98] transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-base ${val.text}`}>{val.emoji} {val.label}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{val.days}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (done) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Image src="/images/prayers/rosario-bg.jpg" alt="Rosario" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10">
          <div className="text-6xl mb-6">🕊️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Rosario Selesai</h2>
          <p className="text-gray-400 mb-8 max-w-xs">Terima kasih telah berdoa bersama Maria. Semoga doamu dikabulkan.</p>
          <button
            onClick={restart}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Mulai Lagi
          </button>
        </div>
      </div>
    );
  }

  // ── PRAYER STEP ──
  const peristiwa = PERISTIWA[chosen];

  return (
    <div className="relative min-h-screen flex flex-col">
      <Image src="/images/prayers/rosario-bg.jpg" alt="Rosario" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <button onClick={stepIdx === 0 ? restart : handlePrev} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
            <ChevronLeft className="h-4 w-4" />
            {stepIdx === 0 ? "Pilih" : "Kembali"}
          </button>
          <span className={`text-xs font-semibold ${peristiwa.text}`}>{peristiwa.emoji} {peristiwa.label}</span>
          <span className="text-xs text-gray-500">{stepIdx + 1} / {steps.length}</span>
        </div>

        {/* Bead progress */}
        <div className="px-6 pb-4">
          <BeadProgress current={stepIdx + 1} total={steps.length} />
        </div>

        {/* Phase label */}
        <div className="px-6 pb-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{current.phase}</span>
        </div>

        {/* Prayer content - scrollable */}
        <div className="flex-1 overflow-y-auto px-6">
          <h2 className="text-xl font-bold text-white mb-1">{current.title}</h2>
          {current.sub && <p className="text-purple-300 text-xs mb-4">{current.sub}</p>}
          {current.counter && (
            <div className="inline-flex items-center gap-1 bg-purple-900/40 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-bold mb-4">
              📿 {current.counter}
            </div>
          )}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-serif">{current.text}</p>
          </div>
          <div className="h-8" />
        </div>

        {/* Bottom next button */}
        <div className="p-6 pb-10">
          <button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-base transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
          >
            {isLast ? "Selesai 🕊️" : (
              <>
                Lanjut
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
