"use client";

import { useState } from "react";
import { TAGLINE, TAGLINE_REF } from "@/lib/tagline";

/**
 * A short thank you from the founder, shown once after a new person saves their profile.
 * The photo is /images/founder.jpg; if it is missing the round frame shows the initials.
 */
export default function FounderWelcome({ name, onContinue }: { name: string; onContinue: () => void }) {
  const [noPhoto, setNoPhoto] = useState(false);
  const first = name.trim().split(" ")[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 pb-24 backdrop-blur-sm sm:items-center sm:pb-4" role="dialog" aria-modal="true" aria-label="Pesan dari pendiri">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-brand-gold/30 bg-[#16191f] p-6 text-center shadow-2xl">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-brand-gold bg-brand-gold/15 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
          {noPhoto ? (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-gold">NJ</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/founder.jpg" alt="Nico Japar, pendiri Ruang Iman" className="h-full w-full object-cover" onError={() => setNoPhoto(true)} />
          )}
        </div>

        <p className="mt-5 font-serif text-[15px] italic leading-relaxed text-brand-gold">&ldquo;{TAGLINE}&rdquo;</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">{TAGLINE_REF}</p>

        <div className="mt-5 space-y-3 text-left font-serif text-[16px] leading-[1.75] text-brand-light">
          <p>Halo{first ? `, ${first}` : ""}. Terima kasih sudah mendukung dan bergabung di Ruang Iman.</p>
          <p>Ruang ini akan terasa lebih hidup kalau kamu ditemani banyak teman: saling terhubung, saling mendoakan, dan bertumbuh bersama dalam iman.</p>
          <p>Selamat datang di rumah kita.</p>
        </div>

        <p className="mt-4 text-sm text-white"><span className="font-bold">Nico Japar</span><br /><span className="text-xs text-brand-muted">Pendiri Ruang Iman</span></p>

        <button onClick={onContinue} className="mt-6 w-full rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark active:scale-[0.98]">
          Amin, lanjut
        </button>
      </div>
    </div>
  );
}
