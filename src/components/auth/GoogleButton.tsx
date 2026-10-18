"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

/**
 * One-tap "Continue with Google" (Supabase OAuth). Google refuses sign-in inside an app's
 * embedded browser, so it is hidden in the Android app until native Google sign-in is added.
 */
export default function GoogleButton({ label, onError }: { label: string; onError?: (m: string) => void }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setShow(!Capacitor.isNativePlatform()); }, []);
  if (!show) return null;

  async function go() {
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) { setBusy(false); onError?.(error.message); }
  }

  return (
    <>
      <button
        type="button"
        onClick={go}
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
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-[#333]" /> atau <span className="h-px flex-1 bg-[#333]" />
      </div>
    </>
  );
}
