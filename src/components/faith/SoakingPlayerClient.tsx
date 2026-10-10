"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Disc, Moon, Clock, Volume2, Sparkles, Check } from "lucide-react";
import { usePlayer, PlayerSong } from "@/components/audio/PlayerProvider";

export interface SoakingTrack extends PlayerSong {
  subtitle: string;
  category: "Doa Malam" | "Instrumen" | "Pagi" | "Meditasi";
  durationStr: string;
}

export const SOAKING_TRACKS: SoakingTrack[] = [
  {
    id: "soaking-1",
    title: "Mazmur 23 & 91 — Doa Kedamaian Malam",
    subtitle: "Pembacaan Kitab Mazmur dengan alunan piano lembut",
    category: "Doa Malam",
    durationStr: "15:00",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=heavenly-music-113038.mp3",
    coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "soaking-2",
    title: "Suara Hujan & Piano Soaking Worship",
    subtitle: "Instrumental renungan malam & keheningan jiwa",
    category: "Instrumen",
    durationStr: "20:00",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-10781.mp3",
    coverImage: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "soaking-3",
    title: "Keheningan Pagi & Ucapan Syukur",
    subtitle: "Melodi akustik pengucapan syukur saat quiet time",
    category: "Pagi",
    durationStr: "12:30",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a14b30.mp3?filename=peaceful-garden-10492.mp3",
    coverImage: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "soaking-4",
    title: "Ombak Pantai & Instrumen Pengharapan",
    subtitle: "Alunan kecapi & desir ombak untuk ketenangan tidur",
    category: "Meditasi",
    durationStr: "30:00",
    url: "https://cdn.pixabay.com/download/audio/2021/11/24/audio_34945d8b74.mp3?filename=relaxing-ocean-waves-ambient-11116.mp3",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
  },
];

const SLEEP_OPTIONS = [
  { label: "Matikan Timer", minutes: 0 },
  { label: "15 Menit", minutes: 15 },
  { label: "30 Menit", minutes: 30 },
  { label: "45 Menit", minutes: 45 },
  { label: "60 Menit", minutes: 60 },
];

export default function SoakingPlayerClient({ lang = "id" }: { lang?: "id" | "en" }) {
  const { currentSong, isPlaying, playFrom, toggle, stop } = usePlayer();
  
  const [selectedTimerMins, setSelectedTimerMins] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);

  // Handle Sleep Timer Countdown
  useEffect(() => {
    if (selectedTimerMins <= 0) {
      setTimerSecondsLeft(null);
      return;
    }

    setTimerSecondsLeft(selectedTimerMins * 60);

    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          stop(); // Stop playback when sleep timer hits 0
          setSelectedTimerMins(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTimerMins, stop]);

  const formatTimerClock = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleTrackClick = (idx: number) => {
    const isCurrentTrack = currentSong?.id === SOAKING_TRACKS[idx].id;
    if (isCurrentTrack) {
      toggle();
    } else {
      playFrom(SOAKING_TRACKS, idx);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            {lang === "id" ? "Musik Relaksasi & Doa Malam" : "Peaceful Soaking & Meditation"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "id" ? "Ruang Soaking & Ketenangan" : "Soaking & Reflection Room"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
            {lang === "id"
              ? "Dengarkan alunan instrumen rohani & firman saat teduh, berdoa, atau menjelang tidur malam."
              : "Listen to peaceful instrumental worship and scripture narration during quiet time or sleep."}
          </p>
        </div>

        {/* Sleep Timer Selector Widget */}
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center sm:items-start space-y-2 min-w-[200px]">
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{lang === "id" ? "Sleep Timer Malam" : "Sleep Timer"}</span>
          </div>

          <div className="w-full grid grid-cols-2 gap-1.5 pt-1">
            {SLEEP_OPTIONS.slice(1).map((opt) => {
              const isSelected = selectedTimerMins === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  onClick={() => setSelectedTimerMins(isSelected ? 0 : opt.minutes)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {opt.minutes}m
                </button>
              );
            })}
          </div>

          {timerSecondsLeft !== null && (
            <div className="w-full text-center pt-2 border-t border-white/10 text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Mati dalam {formatTimerClock(timerSecondsLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Track List Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Disc className="w-4 h-4 text-amber-400" />
          {lang === "id" ? "Pilihan Musik & Doa Soaking" : "Selected Tracks"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOAKING_TRACKS.map((track, idx) => {
            const isCurrent = currentSong?.id === track.id;
            const isThisPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(idx)}
                className={`group relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${
                  isCurrent
                    ? "bg-gradient-to-r from-indigo-900/60 to-slate-900/80 border-indigo-500/60 shadow-lg shadow-indigo-500/20"
                    : "bg-[#14171f] border-white/10 hover:border-white/20 hover:bg-[#1a1d27]"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Track Thumbnail */}
                  <div
                    className="relative w-16 h-16 rounded-xl bg-cover bg-center shrink-0 overflow-hidden shadow-md flex items-center justify-center"
                    style={{ backgroundImage: `url(${track.coverImage})` }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Play/Pause Button Overlay */}
                    <div
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                        isThisPlaying
                          ? "bg-amber-400 text-black animate-pulse"
                          : "bg-white/90 text-black hover:bg-white"
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Track Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                        {track.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {track.durationStr}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {track.title}
                    </h4>

                    <p className="text-xs text-gray-400 truncate">
                      {track.subtitle}
                    </p>
                  </div>
                </div>

                {/* Active Soundwave Indicator */}
                {isThisPlaying && (
                  <div className="absolute bottom-2 right-4 flex items-end gap-1 h-3">
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3 [animation-delay:0.2s]" />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-1.5 [animation-delay:0.4s]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
