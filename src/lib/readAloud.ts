"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Reads a list of verses aloud, one after another.
 * - Android app: native text-to-speech (@capacitor-community/text-to-speech)
 * - Browser: Web Speech API
 * Exposes the verse being read so the reader can highlight and follow it.
 */
export type ReadItem = { verse: number; text: string };

const native = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("TextToSpeech");
const web = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

export function readAloudSupported() {
  return native() || web();
}

function pickVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base)) ?? null;
}

async function speakOne(text: string, lang: string, rate: number, cancelled: () => boolean) {
  if (native()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.speak({ text, lang, rate, pitch: 1, volume: 1, category: "playback" });
    return;
  }
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

async function stopAll() {
  if (native()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.stop().catch(() => {});
  } else if (web()) {
    window.speechSynthesis.cancel();
  }
}

export function useReadAloud(items: ReadItem[], lang: "id" | "en", intro?: string) {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const runId = useRef(0);

  const stop = useCallback(() => {
    runId.current++;
    setPlaying(false);
    setCurrent(null);
    void stopAll();
  }, []);

  const play = useCallback(async (fromVerse?: number) => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    await stopAll();
    setPlaying(true);
    const voiceLang = lang === "id" ? "id-ID" : "en-US";
    const start = Math.max(0, fromVerse == null ? 0 : items.findIndex((i) => i.verse === fromVerse));

    if (intro && start === 0) {
      setCurrent(null);
      await speakOne(intro, voiceLang, rate, cancelled);
    }
    for (let i = start; i < items.length; i++) {
      if (cancelled()) return;
      setCurrent(items[i].verse);
      await speakOne(items[i].text, voiceLang, rate, cancelled);
    }
    if (!cancelled()) { setPlaying(false); setCurrent(null); }
  }, [items, lang, intro, rate]);

  // Stop speaking when leaving the page
  useEffect(() => () => { runId.current++; void stopAll(); }, []);

  return { playing, current, play, stop, rate, setRate, supported: readAloudSupported() };
}
