"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { storagePath, uploadAudio } from "@/lib/upload";
import { usePlayer } from "@/components/audio/PlayerProvider";
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
  userId,
  readOnly = false
}: {
  initialSongs?: Song[],
  userId: string,
  readOnly?: boolean
}) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { currentSong, isPlaying, playFrom, toggle, loadQueue, playingIdx } = usePlayer();
  const supabase = createClient();

  // Keep the global queue aligned with this profile's songs while nothing is
  // playing (so returning to Home doesn't wipe an in-progress track).
  useEffect(() => {
    if (!readOnly && playingIdx === null) loadQueue(songs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs]);

  const handleVinylClick = (idx: number) => {
    const song = songs[idx];
    if (song) {
      if (currentSong?.url === song.url) {
        toggle();
      } else {
        playFrom(songs, idx);
      }
      return;
    }
    if (readOnly) return;
    // Empty slot — prompt to add a song
    document.getElementById(`song-upload-${idx}`)?.click();
  };

  const handleFileSelect = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCoverPicker(idx); // Next step: pick a cover
    }
    e.target.value = "";
  };

  const saveSong = async (idx: number, coverUrl: string) => {
    if (!selectedFile) return;
    setUploadingIdx(idx);
    setShowCoverPicker(null);

    try {
      const path = storagePath(userId, selectedFile.name);
      const url = await uploadAudio(selectedFile, "profile-songs", path);

      const newSong: Song = {
        id: idx.toString(),
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
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
      loadQueue(newSongs);
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

    const newSongs = [...songs];
    delete newSongs[idx]; // leaves undefined at idx

    try {
      await supabase.from("profiles")
        .update({ favorite_songs: newSongs.filter(Boolean) })
        .eq("id", userId);

      setSongs(newSongs);
      loadQueue(newSongs);
    } catch (err: any) {
      alert("Error removing song");
    }
  };

  return (
    <div className="w-full">
      {/* Vinyl Records Row */}
      <div className="flex justify-center items-center gap-2 py-4 px-6 overflow-x-auto hide-scrollbar min-h-[100px]">
        {Array.from({ length: 5 }).map((_, idx) => {
          const song = songs[idx];
          const isThisPlaying = !!song && currentSong?.url === song.url && isPlaying;
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
                ) : readOnly ? null : (
                  <Plus className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Delete Button */}
              {song && !readOnly && (
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
    </div>
  );
}
