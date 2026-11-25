"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "ruangiman-splash-shown";
const CC_SEEN_KEY = "communitycenter-splash-shown";

/**
 * Full-screen Ruang Iman splash screen shown once when the app opens.
 * Uses public/loadingRI.png (1080x1920): edge-to-edge cover on phones, centered on matching navy on PC.
 * On communitycenter.* ("cc" variant) it shows public/cc/loadingcc.png instead, on its own dark background.
 * Skipped on public guest event/ticket links (/e/*, /t/*).
 */
export default function AppSplash({ variant = "ri" }: { variant?: "ri" | "cc" }) {
  const isCc = variant === "cc";
  const seenKey = isCc ? CC_SEEN_KEY : SEEN_KEY;
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (
        path.startsWith("/e/") ||
        path.startsWith("/t/") ||
        sessionStorage.getItem(seenKey) === "1"
      ) {
        setPhase("gone");
        return;
      }
      sessionStorage.setItem(seenKey, "1");
    } catch {
      // private browsing: still show once
    }

    const fadeTimer = window.setTimeout(() => setPhase("fade"), 750);
    const goneTimer = window.setTimeout(() => setPhase("gone"), 1150);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
    };
  }, [seenKey]);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden={phase === "fade"}
      className={`fixed inset-0 z-[99999] flex h-dvh w-screen items-center justify-center ${isCc ? "bg-[#1b1b1b]" : "bg-[#051022]"} transition-opacity duration-500 ease-out ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isCc ? "/cc/loadingcc.png" : "/loadingRI.png"}
        alt={isCc ? "Ruang Iman Community Center" : "Ruang Iman"}
        className="h-full w-full select-none object-cover md:object-contain"
        draggable={false}
      />
    </div>
  );
}
