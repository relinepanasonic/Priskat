"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window { google?: any }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadGsi() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const s = existing ?? Object.assign(document.createElement("script"), { src: GSI_SRC, async: true, defer: true });
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("Google script failed to load")));
    if (!existing) document.head.appendChild(s);
  });
}

/**
 * "Continue with Google". With NEXT_PUBLIC_GOOGLE_CLIENT_ID set it uses Google's own button
 * (the sign-in window says "Ruang Iman", not the Supabase address); without it, it falls back
 * to the Supabase redirect sign-in. Hidden in the Android app: Google blocks sign-in inside
 * an app's embedded browser until native Google sign-in is added.
 */
export default function GoogleButton({ label, onError }: { label: string; onError?: (m: string) => void }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => { setShow(!Capacitor.isNativePlatform()); }, []);

  useEffect(() => {
    if (!show || !CLIENT_ID) return;
    let cancelled = false;
    (async () => {
      try {
        await loadGsi();
        if (cancelled || !holder.current) return;
        const raw = crypto.randomUUID() + crypto.randomUUID();
        const hashed = await sha256Hex(raw);
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          use_fedcm_for_prompt: true,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return;
            setBusy(true);
            const { error } = await createClient().auth.signInWithIdToken({ provider: "google", token: resp.credential, nonce: raw });
            if (error) { setBusy(false); onError?.(error.message); return; }
            router.push("/");
            router.refresh();
          },
        });
        const width = Math.min(400, Math.max(220, Math.round(holder.current.clientWidth || 320)));
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          width,
          locale: "id",
          text: /daftar/i.test(label) ? "signup_with" : "continue_with",
          logo_alignment: "center",
        });
        setGsiReady(true);
      } catch (e) {
        onError?.((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  async function redirectSignIn() {
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/`, queryParams: { prompt: "select_account" } },
    });
    if (error) { setBusy(false); onError?.(error.message); }
  }

  return (
    <>
      {CLIENT_ID ? (
        <div className={`flex min-h-[44px] w-full justify-center ${busy ? "pointer-events-none opacity-60" : ""}`}>
          <div ref={holder} className="w-full" style={{ display: "flex", justifyContent: "center" }} />
          {!gsiReady && <span className="sr-only">Google</span>}
        </div>
      ) : (
        <button
          type="button"
          onClick={redirectSignIn}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#3a3d46] bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition active:scale-[0.99] hover:bg-gray-100 disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          {busy ? "…" : label}
        </button>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-[#333]" /> atau <span className="h-px flex-1 bg-[#333]" />
      </div>
    </>
  );
}
