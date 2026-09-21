"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

// ─── PRAYER TEXTS ─────────────────────────────────────────────────────────────
const AKU_PERCAYA = `Aku percaya akan Allah, Bapa yang mahakuasa,\npencipta langit dan bumi.\nDan akan Yesus Kristus, Putra-Nya yang tunggal, Tuhan kita,\nyang dikandung dari Roh Kudus, dilahirkan oleh Perawan Maria;\nyang menderita sengsara dalam pemerintahan Pontius Pilatus,\ndisalibkan, wafat, dan dimakamkan;\nyang turun ke tempat penantian;\npada hari ketiga bangkit dari antara orang mati;\nyang naik ke surga, duduk di sebelah kanan Allah Bapa;\ndari situ Ia akan datang mengadili orang yang hidup dan yang mati.\nAku percaya akan Roh Kudus, Gereja Katolik yang kudus,\npersekutuan para kudus, pengampunan dosa,\nkebangkitan badan, kehidupan kekal. Amin.`;

const BAPA_KAMI = `Bapa kami yang ada di surga,\ndimuliakanlah nama-Mu,\ndatanglah kerajaan-Mu,\njadilah kehendak-Mu\ndi atas bumi seperti di dalam surga.\nBerilah kami rezeki pada hari ini\ndan ampunilah kesalahan kami,\nseperti kami pun mengampuni\nyang bersalah kepada kami;\ndan janganlah masukkan kami ke dalam pencobaan,\ntetapi bebaskanlah kami dari yang jahat. Amin.`;

const SALAM_MARIA = `Salam Maria, penuh rahmat,\nTuhan sertamu,\nterpujilah engkau di antara wanita,\ndan terpujilah buah tubuhmu, Yesus.\nSanta Maria, Bunda Allah,\ndoakanlah kami yang berdosa ini,\nsekarang dan waktu kami mati. Amin.`;

const KEMULIAAN = `Kemuliaan kepada Bapa,\ndan Putra, dan Roh Kudus,\nseperti pada permulaan, sekarang, selalu,\ndan sepanjang segala abad. Amin.`;

const TERPUJILAH = `O Yesus yang baik, ampunilah dosa kami,\nbebaskanlah kami dari api neraka,\nhantarkanlah jiwa-jiwa ke surga,\nterutama mereka yang sangat membutuhkan\nkerahiman-Mu. Amin.`;

const SALAM_YA_RATU = `Salam ya Ratu, Bunda yang berbelaskasih,\nhidup, hiburan, dan harapan kami, salam.\nKepadamu kami berseru, anak-anak Hawa yang malang.\nKepadamu kami mengeluh, merintih dan menangis\ndi lembah air mata ini.\nMaka ya Ibunda kami, pengantara kami,\narahkanlah pandanganmu yang penuh belaskasih kepada kami.\nDan sesudah pengasingan ini, tunjukkanlah kepada kami\nYesus, buah tubuhmu yang terpuji.\nO yang murah hati, o yang pengasih,\no Santa Maria Bunda yang suci. Amin.`;

// ─── PERISTIWA DATA ────────────────────────────────────────────────────────────
const PERISTIWA = {
  gembira: {
    label: "Peristiwa Gembira",
    emoji: "😊",
    days: "Senin & Sabtu",
    accentColor: "#d4a017",
    mysteries: [
      { title: "1. Kabar Sukacita", ref: "Luk 1:26-38", intention: "Kerendahan hati" },
      { title: "2. Maria Mengunjungi Elisabeth", ref: "Luk 1:39-56", intention: "Kasih kepada sesama" },
      { title: "3. Yesus Lahir di Betlehem", ref: "Luk 2:1-20", intention: "Kemiskinan rohani" },
      { title: "4. Yesus Dipersembahkan di Bait Allah", ref: "Luk 2:22-40", intention: "Ketaatan kepada Allah" },
      { title: "5. Yesus Ditemukan di Bait Allah", ref: "Luk 2:41-52", intention: "Kecintaan pada hidup doa" },
    ],
  },
  terang: {
    label: "Peristiwa Terang",
    emoji: "✨",
    days: "Kamis",
    accentColor: "#60a5fa",
    mysteries: [
      { title: "1. Yesus Dibaptis di Sungai Yordan", ref: "Mat 3:13-17", intention: "Menghayati pembaptisan" },
      { title: "2. Yesus di Pesta Kana", ref: "Yoh 2:1-12", intention: "Kepercayaan melalui Maria" },
      { title: "3. Yesus Memberitakan Kerajaan Allah", ref: "Mrk 1:14-15", intention: "Tobat dan iman" },
      { title: "4. Yesus Dimuliakan di Tabor", ref: "Luk 9:28-36", intention: "Kemitraan dengan Kristus" },
      { title: "5. Yesus Mengadakan Ekaristi", ref: "Mat 26:26-28", intention: "Adorasi Ekaristi" },
    ],
  },
  sedih: {
    label: "Peristiwa Sedih",
    emoji: "😢",
    days: "Selasa & Jumat",
    accentColor: "#a78bfa",
    mysteries: [
      { title: "1. Yesus di Taman Getsemani", ref: "Mat 26:36-46", intention: "Ketabahan dalam pencobaan" },
      { title: "2. Yesus Didera", ref: "Yoh 19:1", intention: "Silih dosa kemurnian" },
      { title: "3. Yesus Dimahkotai Duri", ref: "Mat 27:28-29", intention: "Silih dosa kesombongan" },
      { title: "4. Yesus Memanggul Salib", ref: "Yoh 19:17", intention: "Memanggul salib harian" },
      { title: "5. Yesus Wafat di Kayu Salib", ref: "Yoh 19:25-30", intention: "Silih atas dosa-dosa" },
    ],
  },
  mulia: {
    label: "Peristiwa Mulia",
    emoji: "👑",
    days: "Rabu & Minggu",
    accentColor: "#f59e0b",
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

  steps.push({ phase: "Pembukaan", title: "Aku Percaya", text: AKU_PERCAYA });
  steps.push({ phase: "Pembukaan", title: "Bapa Kami", text: BAPA_KAMI });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "untuk iman", text: SALAM_MARIA, counter: "1 / 3" });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "untuk pengharapan", text: SALAM_MARIA, counter: "2 / 3" });
  steps.push({ phase: "Pembukaan", title: "Salam Maria", sub: "untuk kasih", text: SALAM_MARIA, counter: "3 / 3" });
  steps.push({ phase: "Pembukaan", title: "Kemuliaan", text: KEMULIAAN });

  p.mysteries.forEach((m, i) => {
    steps.push({
      phase: `Dekade ${i + 1}`,
      title: m.title,
      sub: `${m.ref}  ·  Intensi: ${m.intention}`,
      text: `Renungkanlah peristiwa ini dalam hati...\n\n"${m.ref}"`,
    });
    steps.push({ phase: `Dekade ${i + 1}`, title: "Bapa Kami", text: BAPA_KAMI });
    for (let j = 1; j <= 10; j++) {
      steps.push({ phase: `Dekade ${i + 1}`, title: "Salam Maria", sub: `Manik ke-${j}`, text: SALAM_MARIA, counter: `${j} / 10` });
    }
    steps.push({ phase: `Dekade ${i + 1}`, title: "Kemuliaan", text: KEMULIAAN });
    steps.push({ phase: `Dekade ${i + 1}`, title: "Terpujilah", sub: "Doa Fatima", text: TERPUJILAH });
  });

  steps.push({ phase: "Penutup", title: "Salam Ya Ratu", text: SALAM_YA_RATU });
  return steps;
}

// ─── BEAD DOTS ────────────────────────────────────────────────────────────────
function BeadDots({ current, total, accent }: { current: number; total: number; accent: string }) {
  const MAX = 22;
  const step = Math.max(1, Math.ceil(total / MAX));
  const dots = Math.ceil(total / step);
  const filled = Math.round((current / total) * dots);
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i < filled ? "10px" : "7px",
            height: i < filled ? "10px" : "7px",
            background: i < filled ? accent : "rgba(255,255,255,0.15)",
            boxShadow: i < filled ? `0 0 8px ${accent}99` : "none",
          }}
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

  // Fade state
  const [visible, setVisible] = useState(true);
  const [pressing, setPressing] = useState(false);
  const pendingStep = useRef<() => void>(() => {});

  const steps = chosen ? buildSteps(chosen) : [];
  const current = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const accent = chosen ? PERISTIWA[chosen].accentColor : "#d4a017";

  // Fade out → change → fade in
  const transitionTo = useCallback((fn: () => void) => {
    setVisible(false);
    pendingStep.current = fn;
    setTimeout(() => {
      fn();
      setVisible(true);
    }, 320);
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      transitionTo(() => setDone(true));
      return;
    }
    transitionTo(() => setStepIdx(s => s + 1));
  }, [isLast, transitionTo]);

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) {
      transitionTo(() => setStepIdx(s => s - 1));
    }
  }, [stepIdx, transitionTo]);

  const restart = () => {
    setChosen(null);
    setStepIdx(0);
    setDone(false);
    setVisible(true);
  };

  // ── PICKER ──────────────────────────────────────────────────────────────────
  if (!chosen) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <Image
          src="/images/prayers/rosario-bg.jpg"
          alt="Rosario"
          fill
          className="object-cover"
          priority
        />
        {/* Heavy gradient only on bottom so top photo shows */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="p-5">
            <Link href="/faith/prayers" className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm">
              <ChevronLeft className="h-4 w-4" /> Kembali
            </Link>
          </div>

          {/* Push picker to bottom over gradient */}
          <div className="flex-1" />

          <div className="px-6 pb-12">
            <div className="text-center mb-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Doa Rosario</p>
              <h1 className="text-2xl font-bold text-white">Pilih Peristiwa</h1>
            </div>

            <div className="space-y-2.5">
              {(Object.entries(PERISTIWA) as [PeristiwaKey, typeof PERISTIWA[PeristiwaKey]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setChosen(key)}
                  className="w-full text-left px-5 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 active:scale-[0.98] transition-all"
                  style={{ borderColor: `${val.accentColor}40` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{val.emoji} {val.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{val.days}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-end pb-20 px-6 text-center">
        <Image src="/images/prayers/rosario-bg.jpg" alt="Rosario" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10">
          <div className="text-5xl mb-5">🕊️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Rosario Selesai</h2>
          <p className="text-white/50 text-sm mb-8 max-w-xs mx-auto">
            Terima kasih telah berdoa bersama Maria.
          </p>
          <button
            onClick={restart}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mx-auto"
          >
            <RotateCcw className="h-4 w-4" /> Mulai Lagi
          </button>
        </div>
      </div>
    );
  }

  // ── PRAYER STEP ─────────────────────────────────────────────────────────────
  const peristiwa = PERISTIWA[chosen];

  return (
    <div className="relative min-h-screen flex flex-col select-none overflow-hidden">
      {/* Background - fully visible */}
      <Image
        src="/images/prayers/rosario-bg.jpg"
        alt="Rosario"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Gradient: dark at very top for readability, lighter in middle, dark at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-black/90" />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={stepIdx === 0 ? restart : handlePrev}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{peristiwa.emoji} {peristiwa.label}</p>
          </div>

          <div className="w-9 h-9 flex items-center justify-center">
            <span className="text-white/30 text-xs font-mono">{stepIdx + 1}/{steps.length}</span>
          </div>
        </div>

        {/* ── BEAD PROGRESS ── */}
        <div className="px-6 py-3">
          <BeadDots current={stepIdx + 1} total={steps.length} accent={accent} />
        </div>

        {/* ── PRAYER TEXT — fades in/out, sits in the upper empty space ── */}
        <div
          className="flex-1 flex flex-col justify-start px-6 pt-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Phase label */}
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">{current.phase}</p>

          {/* Prayer title */}
          <h2 className="text-white font-bold text-xl mb-0.5">{current.title}</h2>

          {/* Counter pill */}
          {current.counter && (
            <div
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold mb-3 w-fit"
              style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
            >
              📿 {current.counter}
            </div>
          )}

          {/* Sub label */}
          {current.sub && (
            <p className="text-white/40 text-xs mb-3 leading-relaxed">{current.sub}</p>
          )}

          {/* Prayer body */}
          <p className="text-white/85 text-sm leading-[1.9] font-light whitespace-pre-wrap">
            {current.text}
          </p>
        </div>

        {/* ── BOTTOM: Round Press Button ── */}
        <div className="flex flex-col items-center pb-12 pt-6">
          {/* Phase dots mini nav */}
          <p className="text-white/20 text-[10px] mb-6 uppercase tracking-wider">{current.phase}</p>

          {/* THE BIG ROUND BUTTON */}
          <button
            onPointerDown={() => setPressing(true)}
            onPointerUp={() => { setPressing(false); handleNext(); }}
            onPointerLeave={() => setPressing(false)}
            className="relative"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: `radial-gradient(circle, ${accent}20, transparent 70%)`,
                transform: pressing ? "scale(0.92)" : "scale(1.2)",
                opacity: pressing ? 0 : 1,
              }}
            />
            {/* Pulsing ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border: `1.5px solid ${accent}50`,
                transform: "scale(1.25)",
                animationDuration: "2s",
              }}
            />
            {/* Main circle */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                background: pressing
                  ? `radial-gradient(circle at 40% 35%, ${accent}dd, ${accent}88)`
                  : `radial-gradient(circle at 40% 35%, ${accent}99, ${accent}44)`,
                border: `1.5px solid ${accent}60`,
                boxShadow: pressing
                  ? `0 0 0 0 ${accent}00, inset 0 2px 10px rgba(0,0,0,0.4)`
                  : `0 0 30px ${accent}40, 0 0 60px ${accent}20, inset 0 1px 0 rgba(255,255,255,0.2)`,
                transform: pressing ? "scale(0.93)" : "scale(1)",
              }}
            >
              {isLast ? (
                <span className="text-2xl">🕊️</span>
              ) : (
                <ChevronRight className="h-7 w-7 text-white" strokeWidth={2.5} />
              )}
            </div>
          </button>

          <p className="text-white/25 text-[10px] mt-4 uppercase tracking-widest">
            {isLast ? "Selesai" : "Lanjut"}
          </p>
        </div>
      </div>
    </div>
  );
}
