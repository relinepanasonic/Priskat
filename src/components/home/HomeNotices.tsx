"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Clock, Users, X } from "lucide-react";

const KEY = "photo-nudge-dismissed";

/** Beranda reminders: add a profile photo (dismissible) and join requests still waiting for an admin. */
export default function HomeNotices({ noPhoto, pendingCommunities, needsMain = false }: { noPhoto: boolean; pendingCommunities: string[]; needsMain?: boolean }) {
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    if (!noPhoto) return;
    try { setShowPhoto(localStorage.getItem(KEY) !== String(new Date().toDateString())); } catch { setShowPhoto(true); }
  }, [noPhoto]);

  if (!showPhoto && pendingCommunities.length === 0 && !needsMain) return null;

  return (
    <div className="space-y-2 px-4 pt-3 md:px-0 md:pt-0">
      {needsMain && (
        <Link href="/profile/edit#komunitas" className="flex items-start gap-3 rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-3.5">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
          <p className="text-xs leading-relaxed text-brand-light">
            Kamu sekarang tergabung di lebih dari satu komunitas. <b>Pilih komunitas utama</b> untuk profilmu.
          </p>
        </Link>
      )}
      {pendingCommunities.length > 0 && (
        <Link href="/camp" className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-relaxed text-amber-100">
            Permintaanmu bergabung ke <b>{pendingCommunities.join(", ")}</b> sedang ditinjau oleh admin komunitas. Kami akan memperbarui statusnya di halaman Komunitas.
          </p>
        </Link>
      )}
      {showPhoto && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-3.5">
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
          <Link href="/profile/edit" className="flex-1 text-xs leading-relaxed text-brand-light">
            Apps ini akan lebih hidup kalau ada <b>foto profil</b>. Ketuk untuk menambahkan.
          </Link>
          <button
            aria-label="Tutup"
            onClick={() => { setShowPhoto(false); try { localStorage.setItem(KEY, new Date().toDateString()); } catch { /* ignore */ } }}
            className="rounded-full p-1 text-gray-400 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
