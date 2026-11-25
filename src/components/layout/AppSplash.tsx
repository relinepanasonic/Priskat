"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "ruangiman-splash-shown";

/**
 * Full-screen Ruang Iman splash screen shown once when the app opens.
 * Uses public/loadingRI.png (1080x1920): edge-to-edge cover on phones, centered on matching navy on PC.
 * Skipped on communitycenter.* and public guest event/ticket links (/e/*, /t/*).
 */
export default function AppSplash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    try {
      const host = window.location.hostname.toLowerCase();
      const path = window.location.pathname;
      if (
        host.startsWith("communitycenter.") ||
        path.startsWith("/e/") ||
        path.startsWith("/t/") ||
        sessionStorage.getItem(SEEN_KEY) === "1"
      ) {
        setPhase("gone");
        return;
      }
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // private browsing: still show once
    }

    const fadeTimer = window.setTimeout(() => setPhase("fade"), 1100);
    const goneTimer = window.setTimeout(() => setPhase("gone"), 1550);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden={phase === "fade"}
      className={`fixed inset-0 z-[99999] flex h-dvh w-screen items-center justify-center bg-[#051022] transition-opacity duration-500 ease-out ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/loadingRI.png"
        alt="Ruang Iman"
        className="h-full w-full select-none object-cover md:object-contain"
        draggable={false}
      />
    </div>
  );
}
