"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlayerSong = {
  id: string;
  title: string;
  url: string;
  coverImage: string;
};

interface PlayerContextValue {
  queue: PlayerSong[];
  playingIdx: number | null;
  isPlaying: boolean;
  currentSong: PlayerSong | null;
  /** Replace the queue without changing playback (used to keep it in sync after edits). */
  loadQueue: (songs: PlayerSong[]) => void;
  /** Set a fresh queue and start playing the given slot. */
  playFrom: (songs: PlayerSong[], idx: number) => void;
  /** Play a slot within the current queue. */
  playIndex: (idx: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}

export default function PlayerProvider({
  initialQueue = [],
  children,
}: {
  initialQueue?: PlayerSong[];
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<PlayerSong[]>(initialQueue);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = playingIdx !== null ? queue[playingIdx] ?? null : null;

  // Indexes of slots that actually hold a song (the grid can have gaps).
  const filledOrder = useMemo(
    () => queue.reduce<number[]>((acc, s, i) => (s ? (acc.push(i), acc) : acc), []),
    [queue]
  );

  const next = useCallback(() => {
    setPlayingIdx((cur) => {
      if (!filledOrder.length) return cur;
      const pos = cur === null ? -1 : filledOrder.indexOf(cur);
      return filledOrder[(pos + 1) % filledOrder.length];
    });
    setIsPlaying(true);
  }, [filledOrder]);

  const prev = useCallback(() => {
    setPlayingIdx((cur) => {
      if (!filledOrder.length) return cur;
      const pos = cur === null ? 0 : filledOrder.indexOf(cur);
      return filledOrder[(pos - 1 + filledOrder.length) % filledOrder.length];
    });
    setIsPlaying(true);
  }, [filledOrder]);

  const playIndex = useCallback((idx: number) => {
    setPlayingIdx(idx);
    setIsPlaying(true);
  }, []);

  const playFrom = useCallback((songs: PlayerSong[], idx: number) => {
    setQueue(songs);
    setPlayingIdx(idx);
    setIsPlaying(true);
  }, []);

  const loadQueue = useCallback((songs: PlayerSong[]) => setQueue(songs), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);
  const stop = useCallback(() => {
    setIsPlaying(false);
    setPlayingIdx(null);
  }, []);

  // Drive the single, always-mounted <audio> element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      audio.pause();
      return;
    }

    if (!audio.src.endsWith(currentSong.url) && audio.src !== currentSong.url) {
      audio.src = currentSong.url;
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying]);

  // Lock-screen / notification controls where supported.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: "Ruang Iman",
        artwork: currentSong.coverImage
          ? [{ src: currentSong.coverImage, sizes: "512x512", type: "image/jpeg" }]
          : undefined,
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
  }, [currentSong, isPlaying, next, prev]);

  const value: PlayerContextValue = {
    queue,
    playingIdx,
    isPlaying,
    currentSong,
    loadQueue,
    playFrom,
    playIndex,
    toggle,
    next,
    prev,
    stop,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} onEnded={next} preload="none" hidden />
    </PlayerContext.Provider>
  );
}
