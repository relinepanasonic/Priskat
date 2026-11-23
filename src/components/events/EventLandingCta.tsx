"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The call to register at the bottom of the event page. The form is hidden until the person decides to register,
 * so they read about the event first. /e/<name>?daftar=1 opens the form straight away.
 */
export default function EventLandingCta({ closed, startOpen, share, children }: { closed: boolean; startOpen: boolean; share?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(startOpen);
  const form = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => form.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [open]);

  if (closed) {
    return (
      <div className="space-y-3">
        <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-5 text-center text-sm text-brand-muted">Pendaftaran acara ini belum dibuka atau sudah ditutup.</p>
        {share}
      </div>
    );
  }
  return (
    <>
      {open ? (
        <div ref={form} id="daftar" className="scroll-mt-4 space-y-4 border-t border-white/10 pt-6">{children}{share}</div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#121417] via-[#121417]/95 to-transparent px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8">
          <button onClick={() => setOpen(true)} className="mx-auto block w-full max-w-md rounded-2xl bg-brand-gold py-4 text-base font-bold text-brand-dark shadow-lg shadow-black/40 active:scale-[0.99]">Daftar sekarang</button>
          {share}
        </div>
      )}
    </>
  );
}
