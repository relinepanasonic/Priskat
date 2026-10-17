"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Reads a list of verses aloud, one after another.
 * 1. Natural neural voice from /api/tts (male or female) when the server has it configured
 * 2. Otherwise the phone's own voice: native text-to-speech in the Android app, Web Speech API in a browser
 * Exposes the verse being read so the reader can highlight and follow it.
 */
export type ReadItem = { verse: number; text: string; /** verse range for the server voice, e.g. "3" or "3-5" */ v?: string };
export type CloudRef = { book: number; chapter: number };
export type Gender = "f" | "m";

const native = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("TextToSpeech");
const web = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

export function readAloudSupported() {
  return native() || web();
}

// null = not tried yet; false = server voice unavailable (no key / offline) → use the device voice
let cloudOk: boolean | null = null;
const VOICE_KEY = "tts-voice";

function pickVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base)) ?? null;
}

async function speakDevice(text: string, lang: string, rate: number, cancelled: () => boolean) {
  if (native()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.speak({ text, lang, rate, pitch: 1, volume: 1, category: "playback" });
    return;
  }
  if (!web()) return;
  await new Promise<void>((resolve) => {
    if (cancelled()) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

async function stopDevice() {
  if (native()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.stop().catch(() => {});
  } else if (web()) {
    window.speechSynthesis.cancel();
  }
}

export function useReadAloud(items: ReadItem[], lang: "id" | "en", intro?: string, cloud?: CloudRef, introVerse?: string) {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoiceState] = useState<Gender>("f");
  const runId = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(VOICE_KEY) === "m") setVoiceState("m"); } catch { /* ignore */ }
  }, []);
  const setVoice = useCallback((g: Gender) => {
    setVoiceState(g);
    try { localStorage.setItem(VOICE_KEY, g); } catch { /* ignore */ }
  }, []);

  const stopAudio = () => {
    const a = audio.current;
    audio.current = null;
    if (a) { a.pause(); a.removeAttribute("src"); a.load(); }
  };

  const stop = useCallback(() => {
    runId.current++;
    setPlaying(false);
    setCurrent(null);
    stopAudio();
    void stopDevice();
  }, []);

  /** Play one clip from the server. Resolves false if it could not be played at all. */
  const speakCloud = (qs: string, cancelled: () => boolean) =>
    new Promise<boolean>((resolve) => {
      if (cancelled()) return resolve(true);
      const a = new Audio(`/api/tts?${qs}&lang=${lang}&voice=${voice}`);
      a.playbackRate = rate;
      audio.current = a;
      let started = false;
      a.onplaying = () => { started = true; };
      a.onended = () => resolve(true);
      a.onerror = () => resolve(started); // before any sound = unavailable
      a.play().catch(() => resolve(false));
    });

  const speak = async (text: string, qs: string | null, cancelled: () => boolean) => {
    if (cloud && qs && cloudOk !== false) {
      const ok = await speakCloud(qs, cancelled);
      if (cancelled()) return;
      if (ok) { cloudOk = true; return; }
      cloudOk = false; // fall through to the device voice for this and the following clips
    }
    if (cancelled()) return;
    await speakDevice(text, lang === "id" ? "id-ID" : "en-US", rate, cancelled);
  };

  const play = useCallback(async (fromVerse?: number) => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    stopAudio();
    await stopDevice();
    setPlaying(true);
    const start = Math.max(0, fromVerse == null ? 0 : items.findIndex((i) => i.verse === fromVerse));

    if (intro && start === 0) {
      setCurrent(null);
      await speak(intro, cloud ? `b=${cloud.book}&c=${cloud.chapter}&intro=1${introVerse ? `&v=${introVerse}` : ""}` : null, cancelled);
    }
    for (let i = start; i < items.length; i++) {
      if (cancelled()) return;
      setCurrent(items[i].verse);
      const nx = items[i + 1];
      if (cloud && nx && cloudOk !== false) fetch(`/api/tts?b=${cloud.book}&c=${cloud.chapter}&v=${nx.v ?? nx.verse}&lang=${lang}&voice=${voice}`).catch(() => {});
      await speak(items[i].text, cloud ? `b=${cloud.book}&c=${cloud.chapter}&v=${items[i].v ?? items[i].verse}` : null, cancelled);
    }
    if (!cancelled()) { setPlaying(false); setCurrent(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, intro, rate, voice, cloud?.book, cloud?.chapter, introVerse]);

  // Keep the speed in sync for the clip that is already playing
  useEffect(() => { if (audio.current) audio.current.playbackRate = rate; }, [rate]);

  // Stop speaking when leaving the page
  useEffect(() => () => { runId.current++; stopAudio(); void stopDevice(); }, []);

  return { playing, current, play, stop, rate, setRate, voice, setVoice, supported: readAloudSupported() || cloudOk !== false };
}
