"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SLOTS, REMINDER_SLOTS } from "@/lib/reminders";

export const PUSH_CONSENT_KEY = "push-consent";

/**
 * Choose which prayer reminders to receive and switch on notifications.
 * Reminders arrive as notifications in the Android app; the person's choice is saved either way.
 */
export default function PrayerRemindersCard({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await createClient().from("prayer_reminders" as any).select("slots").eq("user_id", userId).maybeSingle();
      if (data && (data as any).slots) setSlots((data as any).slots);
      setLoaded(true);
    })();
  }, [userId]);

  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.from("prayer_reminders" as any).upsert({
      user_id: userId,
      slots,
      tz_offset: -new Date().getTimezoneOffset(),
      updated_at: new Date().toISOString(),
    });
    if (error) { setSaving(false); setMsg("Belum bisa menyimpan. Coba lagi sebentar lagi."); return; }

    // Ask for notification permission (Android app). Old app versions without the plugin just keep the choice.
    let note = "Pengingat tersimpan.";
    {
      try {
        if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("PushNotifications")) {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          let perm = await PushNotifications.checkPermissions();
          if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
          if (perm.receive === "granted") { localStorage.setItem(PUSH_CONSENT_KEY, "1"); note = "Pengingat dan notifikasi aktif."; }
          else note = "Pilihanmu tersimpan, tetapi notifikasi belum diizinkan. Kamu bisa mengaktifkannya di Pengaturan HP.";
        } else {
          localStorage.setItem(PUSH_CONSENT_KEY, "1");
          note = Capacitor.isNativePlatform()
            ? "Pengingat tersimpan. Notifikasi aktif setelah aplikasi diperbarui ke versi terbaru."
            : "Pengingat tersimpan. Notifikasi dikirim lewat aplikasi Android Ruang Iman.";
        }
      } catch { /* ignore */ }
    }
    setSaving(false);
    setMsg(note);
    onSaved?.();
  }

  // Switch every reminder off (the notification permission itself stays in the phone settings)
  async function turnOff() {
    setSaving(true);
    setMsg(null);
    const { error } = await createClient().from("prayer_reminders" as any).upsert({
      user_id: userId,
      slots: [],
      tz_offset: -new Date().getTimezoneOffset(),
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setMsg("Belum bisa menyimpan. Coba lagi sebentar lagi."); return; }
    setSlots([]);
    try { localStorage.removeItem(PUSH_CONSENT_KEY); } catch { /* ignore */ }
    setMsg("Semua pengingat dimatikan. Kamu bisa mengaktifkannya lagi kapan saja.");
    onSaved?.();
  }

  return (
    <div className="space-y-3">
      {REMINDER_SLOTS.map((s) => {
        const on = slots.includes(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            disabled={!loaded}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${on ? "border-brand-gold/60 bg-brand-gold/10" : "border-[#2a2d35] bg-[#1a1d24]"}`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-[#444]"}`}>
              {on && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">{s.label}</span>
              <span className="block text-xs text-brand-muted">{s.desc}</span>
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={save}
        disabled={saving || !loaded}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60"
      >
        <Bell className="h-4 w-4" /> {saving ? "Menyimpan…" : "Aktifkan notifikasi"}
      </button>
      <button
        type="button"
        onClick={turnOff}
        disabled={saving || !loaded}
        className="mx-auto block text-xs text-brand-muted underline underline-offset-4 hover:text-white disabled:opacity-60"
      >
        Tidak aktifkan
      </button>
      {msg && <p className="rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-brand-light">{msg}</p>}
    </div>
  );
}
