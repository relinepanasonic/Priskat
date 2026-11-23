"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const KEY = "cc-install-dismissed";
const ASK_AGAIN_AFTER = 3 * 24 * 3600 * 1000; // ask again after three days

/**
 * Asks to install the Community Center as an app (a real install, with its own icon and window, not only a shortcut).
 * Android and desktop Chrome: the browser's install window. iPhone: the steps to Add to Home Screen.
 */
export default function InstallApp() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // the app needs its service worker; it only passes pages through
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/cc-sw.js", { scope: "/" }).catch(() => {});

    const installed = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (installed) return;
    let dismissed = 0;
    try { dismissed = Number(localStorage.getItem(KEY) ?? 0); } catch { /* private window */ }
    if (dismissed && Date.now() - dismissed < ASK_AGAIN_AFTER) return;

    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); setShow(true); };
    const onInstalled = () => { setShow(false); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iPhone and iPad have no install prompt: show the steps instead
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    if (isIos) { setIos(true); setShow(true); }
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  function later() {
    setShow(false);
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const choice = await evt.userChoice.catch(() => null);
    setEvt(null);
    if (choice?.outcome === "accepted") setShow(false); else later();
  }

  if (!show) return null;
  return (
    <div role="dialog" aria-label="Pasang aplikasi Community Center" className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[90] mx-auto max-w-md rounded-2xl border border-brand-gold/40 bg-[#1c1c1c] p-4 shadow-2xl shadow-black/60 md:inset-x-auto md:right-6">
      <button onClick={later} aria-label="Nanti saja" className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3 pr-6">
        <Image src="/cc/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">Pasang Community Center</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-300">Buka langsung dari layar utama, seperti aplikasi, dengan ikonnya sendiri.</p>
        </div>
      </div>
      {ios ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-gray-200">
          <Share className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
          <span>Ketuk tombol <b>Bagikan</b> di Safari, lalu pilih <b>Tambah ke Layar Utama</b>.</span>
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={later} className="rounded-xl border border-[#333] py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5">Nanti</button>
          <button onClick={() => void install()} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark hover:opacity-90"><Download className="h-4 w-4" /> Pasang</button>
        </div>
      )}
    </div>
  );
}
