"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { upOf } from "@/lib/upPath";

declare global {
  interface Window {
    /** The phone's Back button asks this. "up" = handled here, "exit" = leave the app. Set by <UpNavigation />. */
    __ruangUp?: () => "up" | "exit";
    /** Screens register what Back should do first (close a window, return to the first tab). Return true when handled. */
    __ruangUpHooks?: Array<() => boolean>;
  }
}

/** Register a screen's own "Back" step. Returns a function that removes it. */
export function registerUp(hook: () => boolean) {
  const list = (window.__ruangUpHooks ??= []);
  list.push(hook);
  return () => { window.__ruangUpHooks = (window.__ruangUpHooks ?? []).filter((h) => h !== hook); };
}

function toast(text: string) {
  try {
    const el = document.createElement("div");
    el.textContent = text;
    el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:calc(96px + env(safe-area-inset-bottom));z-index:9999;background:rgba(20,22,28,.95);color:#fff;font:600 13px Inter,system-ui,sans-serif;padding:10px 16px;border-radius:999px;border:1px solid rgba(214,176,114,.5);box-shadow:0 8px 24px rgba(0,0,0,.4);max-width:90vw;text-align:center";
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 1900);
  } catch { /* the toast is a courtesy */ }
}

/**
 * Makes the Android Back button climb the page ladder (see upPath.ts): window.__ruangUp() is what the app's native
 * Back handler calls. It first lets an open screen take the step (a window, a tab), then goes one step up, and on
 * Beranda asks to press once more before leaving.
 */
export default function UpNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const path = useRef(pathname);
  const lastHomeBack = useRef(0);

  useEffect(() => { path.current = pathname; }, [pathname]);

  useEffect(() => {
    window.__ruangUp = () => {
      // 1. an open window or tab handles it first
      for (const hook of [...(window.__ruangUpHooks ?? [])].reverse()) {
        try { if (hook()) return "up"; } catch { /* ignore a broken hook */ }
      }
      const open = document.querySelector("dialog[open]") as HTMLDialogElement | null;
      if (open) { open.close(); return "up"; }

      // 2. one step up the ladder
      const parent = upOf(path.current);
      if (parent) { router.replace(parent); return "up"; }

      // 3. on Beranda: press once more to leave
      const now = Date.now();
      if (now - lastHomeBack.current < 2000) return "exit";
      lastHomeBack.current = now;
      toast("Tekan sekali lagi untuk keluar");
      return "up";
    };
    return () => { delete window.__ruangUp; };
  }, [router]);

  return null;
}
