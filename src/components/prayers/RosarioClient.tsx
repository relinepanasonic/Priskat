"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import RosaryBeads3D, { stepToBeadPos } from "./RosaryBeads3D";
import SwipeDial from "./SwipeDial";

type ViewMode = "2d" | "3d";
const VIEW_KEY = "rosario-view";
const ROMAN = ["", "I", "II", "III", "IV", "V"];

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
  beadType?: "cross" | "our-father" | "hail-mary" | "glory" | "mystery" | "closing";
  beadIndex?: number; // which bead position in the decade (1-10 for hail marys)
  decade?: number;    // 0 = opening, 1-5 = decade
}

function buildSteps(pk: PeristiwaKey): Step[] {
  const p = PERISTIWA[pk];
  const steps: Step[] = [];

  // Opening
  steps.push({ phase: "Pembukaan", title: "Aku Percaya", text: AKU_PERCAYA, beadType: "cross" });
  steps.push({ phase: "Pembukaan", title: "Bapa Kami", text: BAPA_KAMI, beadType: "our-father", decade: 0 });
  steps.push({ phase: "Pembukaan", title: "Salam Putri Allah Bapa", sub: "Salam Maria pertama — untuk iman", text: SALAM_MARIA, counter: "1 / 3", beadType: "hail-mary", beadIndex: 1, decade: 0 });
  steps.push({ phase: "Pembukaan", title: "Salam Bunda Allah Putra", sub: "Salam Maria kedua — untuk pengharapan", text: SALAM_MARIA, counter: "2 / 3", beadType: "hail-mary", beadIndex: 2, decade: 0 });
  steps.push({ phase: "Pembukaan", title: "Salam Mempelai Allah Roh Kudus", sub: "Salam Maria ketiga — untuk kasih", text: SALAM_MARIA, counter: "3 / 3", beadType: "hail-mary", beadIndex: 3, decade: 0 });
  steps.push({ phase: "Pembukaan", title: "Kemuliaan", text: KEMULIAAN, beadType: "glory", decade: 0 });

  // 5 Decades
  p.mysteries.forEach((m, i) => {
    const dec = i + 1;
    steps.push({
      phase: `Dekade ${dec}`,
      title: m.title,
      sub: `${m.ref}  ·  Intensi: ${m.intention}`,
      text: `Renungkanlah peristiwa ini dalam hati...\n\n"${m.ref}"`,
      beadType: "mystery",
      decade: dec,
    });
    steps.push({ phase: `Dekade ${dec}`, title: "Bapa Kami", text: BAPA_KAMI, beadType: "our-father", decade: dec });
    for (let j = 1; j <= 10; j++) {
      steps.push({ phase: `Dekade ${dec}`, title: "Salam Maria", sub: `Manik ke-${j}`, text: SALAM_MARIA, counter: `${j} / 10`, beadType: "hail-mary", beadIndex: j, decade: dec });
    }
    steps.push({ phase: `Dekade ${dec}`, title: "Kemuliaan", text: KEMULIAAN, beadType: "glory", decade: dec });
    steps.push({ phase: `Dekade ${dec}`, title: "Terpujilah", sub: "Doa Fatima", text: TERPUJILAH, beadType: "glory", decade: dec });
  });

  steps.push({ phase: "Penutup", title: "Salam Ya Ratu", text: SALAM_YA_RATU, beadType: "closing" });
  return steps;
}

// ─── ANIMATED ROSARY VISUAL ────────────────────────────────────────────────────
function RosaryVisual({ steps, stepIdx, accent }: { steps: Step[]; stepIdx: number; accent: string }) {
  const current = steps[stepIdx];
  const decade = current?.decade ?? 0;
  const beadIndex = current?.beadIndex ?? 0;
  const beadType = current?.beadType ?? "hail-mary";

  // Compute how many hail marys done in the current decade
  const hailMarysDone = beadType === "hail-mary" ? beadIndex : beadType === "glory" ? 10 : 0;

  return (
    <div className="flex flex-col items-center py-4 select-none">
      {/* Rosary chain visualisation */}
      <div className="flex flex-col items-center gap-1.5">

        {/* Cross bead */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-5 h-7 rounded-sm flex items-center justify-center text-[11px] shadow-lg transition-all duration-500"
            style={{
              background: beadType === "cross"
                ? `radial-gradient(circle at 35% 30%, #fff, ${accent})`
                : "rgba(255,255,255,0.12)",
              boxShadow: beadType === "cross"
                ? `0 0 18px 6px ${accent}99, 0 0 40px ${accent}55`
                : "none",
              border: `1px solid ${beadType === "cross" ? accent : "rgba(255,255,255,0.18)"}`,
            }}
          >
            ✝
          </div>
          <div className="w-px h-2 bg-white/20" />
        </div>

        {/* Opening 3 hail-mary beads */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((n) => {
            const isActive = decade === 0 && beadType === "hail-mary" && beadIndex === n;
            const isPast = decade > 0 || (decade === 0 && beadType === "glory") || (decade === 0 && beadType === "hail-mary" && beadIndex > n);
            return (
              <div key={n} className="flex items-center">
                {n > 1 && <div className="w-2 h-px bg-white/20" />}
                <div
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: isActive ? "14px" : "10px",
                    height: isActive ? "14px" : "10px",
                    background: isActive
                      ? `radial-gradient(circle at 35% 30%, #fff, ${accent})`
                      : isPast
                        ? `${accent}88`
                        : "rgba(255,255,255,0.15)",
                    boxShadow: isActive
                      ? `0 0 14px 5px ${accent}bb, 0 0 30px ${accent}66`
                      : isPast
                        ? `0 0 6px ${accent}55`
                        : "none",
                    border: `1px solid ${isActive ? accent : isPast ? `${accent}60` : "rgba(255,255,255,0.2)"}`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Opening Our Father */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-2 bg-white/20" />
          <OurFatherBead
            isActive={beadType === "our-father" && decade === 0}
            isPast={decade > 0}
            accent={accent}
          />
          <div className="w-px h-2 bg-white/20" />
        </div>

        {/* 5 Decades in a circle-like chain */}
        <div className="flex flex-col items-center gap-2">
          {[1, 2, 3, 4, 5].map((dec) => {
            const isCurrentDec = decade === dec;
            const isPastDec = decade > dec;
            return (
              <div key={dec} className="flex items-center gap-1">
                {/* Our Father bead */}
                {dec > 1 && (
                  <div className="flex flex-col items-center">
                    <div className="w-px h-2 bg-white/20" />
                    <OurFatherBead
                      isActive={isCurrentDec && beadType === "our-father"}
                      isPast={isPastDec}
                      accent={accent}
                    />
                    <div className="w-px h-2 bg-white/20" />
                  </div>
                )}

                {/* 10 hail-mary beads */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const beadN = idx + 1;
                    const isActive = isCurrentDec && beadType === "hail-mary" && beadIndex === beadN;
                    const isPast = isPastDec || (isCurrentDec && hailMarysDone >= beadN);
                    return (
                      <div key={idx} className="flex items-center">
                        {idx > 0 && <div className="w-0.5 h-px bg-white/15" />}
                        <div
                          className="rounded-full transition-all duration-500"
                          style={{
                            width: isActive ? "13px" : "8px",
                            height: isActive ? "13px" : "8px",
                            background: isActive
                              ? `radial-gradient(circle at 35% 30%, #fff, ${accent})`
                              : isPast
                                ? `${accent}88`
                                : "rgba(255,255,255,0.12)",
                            boxShadow: isActive
                              ? `0 0 12px 4px ${accent}cc, 0 0 28px ${accent}66`
                              : isPast
                                ? `0 0 4px ${accent}44`
                                : "none",
                            border: `1px solid ${isActive ? accent : isPast ? `${accent}55` : "rgba(255,255,255,0.18)"}`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-2 bg-white/20" />
          <div
            className="w-3 h-3 rounded-full transition-all duration-500"
            style={{
              background: beadType === "closing"
                ? `radial-gradient(circle at 35% 30%, #fff, ${accent})`
                : "rgba(255,255,255,0.12)",
              boxShadow: beadType === "closing"
                ? `0 0 14px 5px ${accent}cc, 0 0 30px ${accent}66`
                : "none",
              border: `1px solid ${beadType === "closing" ? accent : "rgba(255,255,255,0.2)"}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function OurFatherBead({ isActive, isPast, accent }: { isActive: boolean; isPast: boolean; accent: string }) {
  return (
    <div
      className="rounded-full transition-all duration-500 flex items-center justify-center"
      style={{
        width: isActive ? "18px" : "13px",
        height: isActive ? "18px" : "13px",
        background: isActive
          ? `radial-gradient(circle at 35% 30%, #fff, ${accent})`
          : isPast
            ? `${accent}aa`
            : "rgba(255,255,255,0.18)",
        boxShadow: isActive
          ? `0 0 20px 8px ${accent}cc, 0 0 40px ${accent}77`
          : isPast
            ? `0 0 8px ${accent}66`
            : "none",
        border: `1.5px solid ${isActive ? accent : isPast ? `${accent}70` : "rgba(255,255,255,0.22)"}`,
      }}
    />
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
    transitionTo(() => setStepIdx(s => Math.min(s + 1, steps.length - 1)));
  }, [isLast, transitionTo, steps.length]);

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) {
      transitionTo(() => setStepIdx(s => Math.max(s - 1, 0)));
    }
  }, [stepIdx, transitionTo]);

  // 2D / 3D view, remembered per device
  const [view, setView] = useState<ViewMode>("2d");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "2d" || saved === "3d") setView(saved);
    } catch { /* storage unavailable */ }
  }, []);
  const changeView = (v: ViewMode) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* storage unavailable */ }
  };

  // Keyboard: → / Space / Enter = lanjut, ← = kembali
  useEffect(() => {
    if (!chosen || done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); handleNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chosen, done, handleNext, handlePrev]);

  const restart = () => {
    setChosen(null);
    setStepIdx(0);
    setDone(false);
    setVisible(true);
  };

  // ── PICKER ──────────────────────────────────────────────────────────────────
  if (!chosen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col">
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
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-20 px-6 text-center">
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
  const beadPos = stepToBeadPos(current.beadType, current.decade, current.beadIndex);

  // Dial readout
  const dial = (() => {
    if (isLast) return { big: "Amin", small: "selesai" };
    switch (current.beadType) {
      case "cross": return { big: "✝", small: "aku percaya" };
      case "hail-mary": return { big: String(current.beadIndex), small: `manik / ${current.decade ? 10 : 3}` };
      case "our-father": return { big: "✦", small: "bapa kami" };
      case "mystery": return { big: ROMAN[current.decade ?? 0], small: "peristiwa" };
      case "glory": return { big: "✧", small: current.title === "Terpujilah" ? "fatima" : "kemuliaan" };
      default: return { big: String(stepIdx + 1), small: "langkah" };
    }
  })();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col select-none overflow-hidden">
      {/* Background - fully visible */}
      <Image
        src="/images/prayers/rosario-bg.jpg"
        alt="Rosario"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />

      <div className="relative z-10 flex flex-col h-[100dvh]">

        {/* ── TOP BAR ── */}
        <div className="relative z-20 flex items-start justify-between px-5 pt-5 pb-2">
          <button
            onClick={stepIdx === 0 ? restart : handlePrev}
            aria-label="Kembali"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{peristiwa.emoji} {peristiwa.label}</p>

            {/* 2D / 3D toggle */}
            <div
              role="tablist"
              aria-label="Tampilan rosario"
              className="inline-flex p-0.5 rounded-full backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}40` }}
            >
              {(["2d", "3d"] as ViewMode[]).map((m) => {
                const on = view === m;
                return (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={on}
                    onClick={() => changeView(m)}
                    className="px-3.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] transition-all duration-300"
                    style={on
                      ? { background: `linear-gradient(135deg, ${accent}55, ${accent}25)`, color: "#fff", boxShadow: `0 0 12px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.15)` }
                      : { color: "rgba(255,255,255,0.45)" }}
                  >
                    {m.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-9 h-9 flex items-center justify-center">
            <span className="text-white/30 text-xs font-mono">{stepIdx + 1}/{steps.length}</span>
          </div>
        </div>

        {/* ── ROSARY VISUAL ── */}
        {view === "2d" ? (
          <div className="px-6 py-1">
            <RosaryVisual steps={steps} stepIdx={stepIdx} accent={accent} />
          </div>
        ) : (
          <div
            className="relative flex-shrink-0 h-[40dvh] min-h-[230px] -mt-14 lg:mt-0 lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-[45%] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)] lg:[mask-image:linear-gradient(to_right,black_65%,transparent)] lg:[-webkit-mask-image:linear-gradient(to_right,black_65%,transparent)]"
          >
            <RosaryBeads3D pos={beadPos} accent={accent} />
          </div>
        )}

        {/* ── PRAYER TEXT — fades in/out ── */}
        <div
          className="relative flex-1 overflow-y-auto scrollbar-hide px-6 pt-2 pb-48 md:pb-4 flex flex-col lg:w-[55%] lg:ml-auto lg:pr-20 lg:pl-10 lg:pb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <div className="w-full max-w-2xl mr-auto lg:ml-auto lg:mr-0 lg:mt-auto">
            {/* Phase label */}
            <p className="text-white/40 text-[10px] lg:text-xs uppercase tracking-widest mb-2 lg:mb-3 font-semibold">{current.phase}</p>

            {/* Prayer title */}
            <h2 className="text-white font-bold text-xl lg:text-4xl mb-2 lg:mb-4 drop-shadow-md">{current.title}</h2>

            {/* Counter pill */}
            {current.counter && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold mb-3 lg:mb-5 w-fit shadow-lg"
                style={{ background: `${accent}30`, color: accent, border: `1px solid ${accent}50` }}
              >
                📿 {current.counter}
              </div>
            )}

            {/* Sub label */}
            {current.sub && (
              <p className="text-white/60 text-xs lg:text-base mb-3 lg:mb-5 leading-relaxed italic">{current.sub}</p>
            )}

            {/* Prayer body */}
            <p className="text-white/90 text-sm lg:text-[22px] leading-[1.9] lg:leading-[1.8] font-light whitespace-pre-wrap drop-shadow-lg">
              {current.text}
            </p>
          </div>
        </div>

        {/* ── PHONE: Swipe dial (bottom right) ── */}
        <SwipeDial accent={accent} big={dial.big} small={dial.small} onNext={handleNext} onPrev={handlePrev} />

        {/* ── TABLET / DESKTOP: Round Press Button ── */}
        <div className="relative hidden md:flex flex-col items-center pb-12 pt-6 flex-shrink-0">
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
