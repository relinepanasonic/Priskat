"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Music } from "lucide-react";

// Fallback royalty-free songs for demonstration. User can replace these.
const DEFAULT_SONGS = [
  { title: "Worship Instrumental 1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Peaceful Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Morning Prayer", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Holy Spirit Come", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Grace Abounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
];

export default function MiniPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Autoplay prevented:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIdx]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    setCurrentIdx((prev) => (prev + 1) % DEFAULT_SONGS.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setCurrentIdx((prev) => (prev - 1 + DEFAULT_SONGS.length) % DEFAULT_SONGS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    nextSong();
  };

  return (
    <div className="mx-6 mt-4 relative overflow-hidden rounded-full p-[1px] bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-brand-gold/40 shadow-lg">
      <div className="flex items-center gap-3 bg-[#1a1d24]/80 backdrop-blur-xl rounded-full px-4 py-2 relative z-10">
        
        {/* Audio Element */}
        <audio 
          ref={audioRef} 
          src={DEFAULT_SONGS[currentIdx].url} 
          onEnded={handleEnded} 
          className="hidden" 
        />

        {/* Visualizer / Icon */}
        <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center border border-brand-gold/30 shrink-0 relative overflow-hidden">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-1 bg-brand-gold animate-[bounce_0.8s_infinite] h-full"></div>
              <div className="w-1 bg-brand-gold animate-[bounce_1.2s_infinite] h-2/3"></div>
              <div className="w-1 bg-brand-gold animate-[bounce_0.9s_infinite] h-full"></div>
            </div>
          ) : (
            <Music className="w-3.5 h-3.5 text-brand-gold" />
          )}
        </div>

        {/* Marquee Title */}
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-brand-gold font-bold uppercase tracking-wider mb-0.5">Now Playing</p>
          <div className="relative w-full whitespace-nowrap">
            <p className={`text-sm text-white font-medium ${isPlaying ? 'animate-marquee' : 'truncate'}`}>
              {DEFAULT_SONGS[currentIdx].title}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={prevSong} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          
          <button onClick={togglePlay} className="h-9 w-9 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center hover:scale-105 hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          
          <button onClick={nextSong} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
      
      {/* Background glow when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-brand-gold/5 blur-xl z-0 animate-pulse"></div>
      )}
    </div>
  );
}

