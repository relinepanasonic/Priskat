"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Bell, BellOff, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PrayerRemindersCard from "@/components/profile/PrayerRemindersCard";

const ASKED_KEY = "push-ask-at";
const DAY = 86_400_000;

type Mode = "ask" | "denied" | null;

/**
 * Beranda: a gentle ask for notifications, only inside the Android app, only after the person has
 * prayed at least once (they have seen the value), and never more than every few days.
 * If they said no to Android's prompt, Android will not ask again, so we explain where to switch it on.
 */
export default function PushAskCard({ userId }: { userId: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "1") return;
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("PushNotifications")) return;
    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const perm = await PushNotifications.checkPermissions();
      if (perm.receive === "granted") return;

      let last = 0;
      try { last = Number(localStorage.getItem(ASKED_KEY) ?? 0); } catch { /* ignore */ }
      const wait = perm.receive === "denied" ? 14 * DAY : 3 * DAY;
      if (Date.now() - last < wait) return;

      const { count } = await createClient().from("daily_activity" as any).select("id", { count: "exact", head: true }).eq("user_id", userId);
      if ((count ?? 0) < 1) return;
      setMode(perm.receive === "denied" ? "denied" : "ask");
    })().catch(() => {});
  }, [userId]);

  const later = () => {
    try { localStorage.setItem(ASKED_KEY, String(Date.now())); } catch { /* ignore */ }
    setMode(null);
  };

  // After the person saved their choice (the card asks for notification permission itself)
  const saved = () => {
    try { localStorage.setItem(ASKED_KEY, String(Date.now())); } catch { /* ignore */ }
    setTimeout(() => { setChoosing(false); setMode(null); }, 5000);
  };

  if (!mode) return null;

  return (
    <div className="mx-4 mt-2 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-3.5 md:mx-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
          {mode === "ask" ? <Bell className="h-[18px] w-[18px]" /> : <BellOff className="h-[18px] w-[18px]" />}
        </span>
        <div className="min-w-0 flex-1">
          {mode === "ask" && choosing ? (
            <>
              <p className="text-sm font-semibold text-white">Pengingat doa mana yang kamu mau?</p>
              <p className="mb-3 mt-0.5 text-xs leading-relaxed text-brand-light">Pilih satu atau lebih. Bisa kamu ubah kapan saja di Profil.</p>
              <PrayerRemindersCard userId={userId} onSaved={saved} />
            </>
          ) : mode === "ask" ? (
            <>
              <p className="text-sm font-semibold text-white">Ingatkan aku berdoa?</p>
              <p className="mt-0.5 text-xs leading-relaxed text-brand-light">Kamu yang memilih doa mana yang mau diingatkan: Angelus, Rosario, bacaan harian, dan lainnya.</p>
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => setChoosing(true)} className="rounded-lg bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark active:scale-95">Pilih pengingat</button>
                <button onClick={later} className="rounded-lg px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/10">Nanti saja</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">Notifikasi sedang dimatikan</p>
              <p className="mt-0.5 text-xs leading-relaxed text-brand-light">Buka <b>Pengaturan HP, Aplikasi, Ruang Iman, Notifikasi</b> lalu izinkan, supaya pengingat doa bisa sampai.</p>
              <button onClick={later} className="mt-2 rounded-lg px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/10">Mengerti</button>
            </>
          )}
        </div>
        {!choosing && <button aria-label="Tutup" onClick={later} className="rounded-full p-1 text-gray-400 hover:bg-white/10"><X className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}
