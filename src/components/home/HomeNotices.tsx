"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Users, X } from "lucide-react";

const KEY = "photo-nudge-dismissed";

/** Slim Beranda hints: add a profile photo (dismissible) and choose a main community. */
export default function HomeNotices({ noPhoto, needsMain = false }: { noPhoto: boolean; needsMain?: boolean }) {
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    if (!noPhoto) return;
    try { setShowPhoto(localStorage.getItem(KEY) !== String(new Date().toDateString())); } catch { setShowPhoto(true); }
  }, [noPhoto]);

  if (!showPhoto && !needsMain) return null;

  return (
    <div className="space-y-1.5 px-4 pt-2 md:px-0 md:pt-0">
      {needsMain && (
        <Link href="/profile/edit#komunitas" className="flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-[11px] text-brand-light">
          <Users className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
          <span className="min-w-0 flex-1 truncate">Kamu di beberapa komunitas. <b>Pilih komunitas utama</b></span>
        </Link>
      )}
      {showPhoto && (
        <div className="flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-[11px] text-brand-light">
          <Camera className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
          <Link href="/profile/edit" className="min-w-0 flex-1 truncate">Tambahkan <b>foto profil</b> supaya lebih hidup</Link>
          <button
            aria-label="Tutup"
            onClick={() => { setShowPhoto(false); try { localStorage.setItem(KEY, new Date().toDateString()); } catch { /* ignore */ } }}
            className="rounded-full p-0.5 text-gray-400 hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
