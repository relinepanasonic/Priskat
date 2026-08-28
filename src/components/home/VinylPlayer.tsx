"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Music, Plus, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { storagePath, uploadAudio } from "@/lib/upload";
import Image from "next/image";

// Compressed cover images from public/images/vinyl
const COVER_OPTIONS = Array.from({ length: 19 }).map((_, i) => `/images/vinyl/vinyl_${i + 1}.jpg`);

type Song = {
  id: string;
  title: string;
  url: string;
  coverImage: string;
};

export default function VinylPlayer({ 
  initialSongs = [],
  userId
}: {
  initialSongs?: Song[],
  userId: string
}) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

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
  }, [isPlaying, playingIdx]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    if (playingIdx === null) return;
    const nextIdx = (playingIdx + 1) % songs.length;
    setPlayingIdx(nextIdx);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (playingIdx === null) return;
    const prevIdx = (playingIdx - 1 + songs.length) % songs.length;
    setPlayingIdx(prevIdx);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    nextSong();
  };

  const handleVinylClick = (idx: number) => {
    if (songs[idx]) {
      // Already has a song, toggle play
      if (playingIdx === idx) {
        togglePlay();
      } else {
        setPlayingIdx(idx);
        setIsPlaying(true);
      }
    } else {
      // Empty slot, prompt to add song
      // Trigger hidden file input
      document.getElementById(`song-upload-${idx}`)?.click();
    }
  };

  const handleFileSelect = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCoverPicker(idx); // Next step: pick a cover
    }
    // reset input
    e.target.value = "";
  };

  const saveSong = async (idx: number, coverUrl: string) => {
    if (!selectedFile) return;
    setUploadingIdx(idx);
    setShowCoverPicker(null);

    try {
      // 1. Upload audio
      const path = storagePath(userId, selectedFile.name);
      const url = await uploadAudio(selectedFile, "profile-songs", path);

      // 2. Update DB
      const newSong: Song = {
        id: idx.toString(),
        title: selectedFile.name.replace(/\.[^/.]+$/, ""), // remove extension
        url,
        coverImage: coverUrl
      };

      const newSongs = [...songs];
      newSongs[idx] = newSong;

      const { error } = await supabase.from("profiles")
        .update({ favorite_songs: newSongs.filter(Boolean) })
        .eq("id", userId);

      if (error) throw error;
      setSongs(newSongs);

    } catch (e: any) {
      alert("Failed to upload song: " + e.message);
    } finally {
      setUploadingIdx(null);
      setSelectedFile(null);
    }
  };

  const deleteSong = async (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this song?")) return;

    if (playingIdx === idx) {
      setIsPlaying(false);
      setPlayingIdx(null);
    }

    const newSongs = [...songs];
    delete newSongs[idx]; // leaves undefined at idx

    try {
      await supabase.from("profiles")
        .update({ favorite_songs: newSongs.filter(Boolean) })
        .eq("id", userId);
      
      setSongs(newSongs);
    } catch (err: any) {
      alert("Error removing song");
    }
  };

  return (
    <div className="w-full">
      {/* Vinyl Records Row */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 py-4 px-2 sm:px-6 overflow-x-auto hide-scrollbar min-h-[100px]">
        {Array.from({ length: 5 }).map((_, idx) => {
          const song = songs[idx];
          const isThisPlaying = playingIdx === idx && isPlaying;
          const isUploading = uploadingIdx === idx;

          return (
            <div key={idx} className="relative group shrink-0">
              <input 
                type="file" 
                id={`song-upload-${idx}`} 
                accept="audio/*" 
                className="hidden" 
                onChange={(e) => handleFileSelect(idx, e)}
              />

              <button
                onClick={() => handleVinylClick(idx)}
                disabled={isUploading}
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 rounded-full relative flex items-center justify-center 
                  transition-all duration-300 shadow-xl border-4 
                  ${song ? "border-[#111] bg-[#111]" : "border-[#333] border-dashed bg-[#1a1d24] hover:border-brand-gold"}
                  ${isThisPlaying ? "animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(212,175,55,0.4)]" : ""}
                `}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                ) : song ? (
                  <>
                    {/* Thin Black Edge / Vinyl Texture */}
                    <div className="absolute inset-0 rounded-full border border-[#222] m-0.5"></div>
                    
                    {/* Center Label (Cover Image) fills almost the entire vinyl */}
                    <div className="absolute inset-1 rounded-full overflow-hidden z-10 border border-black shadow-inner bg-white">
                      <Image src={song.coverImage} alt="Cover" fill className="object-cover" />
                      {/* Center Hole */}
                      <div className="absolute inset-0 m-auto w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"></div>
                    </div>
                  </>
                ) : (
                  <Plus className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Delete Button */}
              {song && (
                <button
                  onClick={(e) => deleteSong(idx, e)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cover Picker Modal */}
      {showCoverPicker !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-[#1a1d24] p-6 rounded-2xl border border-[#333] w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Choose a Cover</h3>
              <button onClick={() => { setShowCoverPicker(null); setSelectedFile(null); }} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 grid grid-cols-4 gap-3 pr-2">
              {COVER_OPTIONS.map((url, i) => (
                <button 
                  key={i}
                  onClick={() => saveSong(showCoverPicker, url)}
                  className="aspect-square relative rounded-full overflow-hidden border-2 border-transparent hover:border-brand-gold transition-all"
                >
                  <Image src={url} alt={`Cover ${i}`} fill className="object-cover" />
                  <div className="absolute inset-0 m-auto w-2 h-2 bg-black rounded-full"></div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">Select a label design for your vinyl record.</p>
          </div>
        </div>
      )}

      {/* Mini Player Controls (Only shows if a song is loaded and selected/playing) */}
      {playingIdx !== null && songs[playingIdx] && (
        <div className="mx-6 mt-2 relative overflow-hidden rounded-full p-[1px] bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-brand-gold/40 shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 bg-[#1a1d24]/80 backdrop-blur-xl rounded-full px-4 py-2 relative z-10">
            
            <audio 
              ref={audioRef} 
              src={songs[playingIdx].url} 
              onEnded={handleEnded} 
              className="hidden" 
            />

            <div className={`h-8 w-8 rounded-full flex items-center justify-center border border-brand-gold/30 shrink-0 relative overflow-hidden ${isPlaying ? 'bg-brand-dark' : 'bg-brand-dark/50'}`}>
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

            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mb-0.5">Now Playing</p>
              <div className="relative w-full whitespace-nowrap">
                <p className={`text-xs text-white font-medium ${isPlaying ? 'animate-marquee' : 'truncate'}`}>
                  {songs[playingIdx].title}
                </p>
              </div>
            </div>

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
          
          {isPlaying && (
            <div className="absolute inset-0 bg-brand-gold/5 blur-xl z-0 animate-pulse"></div>
          )}
        </div>
      )}
    </div>
  );
}

