"use client";

import { Play, Pause, SkipForward, SkipBack, Music, X } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

export default function GlobalMiniPlayer() {
  const { currentSong, isPlaying, toggle, next, prev, stop } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed z-40 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:left-auto md:right-4 md:translate-x-0 md:bottom-4">
      <div className="relative overflow-hidden rounded-full p-[1px] bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-brand-gold/40 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3 bg-[#1a1d24]/90 backdrop-blur-xl rounded-full pl-4 pr-2 py-2 relative z-10">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center border border-brand-gold/30 shrink-0 overflow-hidden ${
              isPlaying ? "bg-brand-dark" : "bg-brand-dark/50"
            }`}
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-1 bg-brand-gold animate-[bounce_0.8s_infinite] h-full" />
                <div className="w-1 bg-brand-gold animate-[bounce_1.2s_infinite] h-2/3" />
                <div className="w-1 bg-brand-gold animate-[bounce_0.9s_infinite] h-full" />
              </div>
            ) : (
              <Music className="w-3.5 h-3.5 text-brand-gold" />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mb-0.5">
              Now Playing
            </p>
            <p className="text-xs text-white font-medium truncate">{currentSong.title}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={prev} className="p-1.5 text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={toggle}
              className="h-9 w-9 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center hover:scale-105 hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)]"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button onClick={next} className="p-1.5 text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={stop}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              aria-label="Stop"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
