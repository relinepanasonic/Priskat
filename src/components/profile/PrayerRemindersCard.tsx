"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Bell, Check, Smartphone, Volume2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AUTO_KEYS, CHOOSABLE_SLOTS, DEFAULT_SLOTS } from "@/lib/reminders";

export const PUSH_CONSENT_KEY = "push-consent";

/**
 * Choose which prayer reminders to receive and switch on notifications.
 * Reminders arrive as notifications in the Android app; the person's choice is saved either way.
 */
export default function PrayerRemindersCard({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [loaded, setLoaded] = useState(false);
  // how the two kinds of notification announce themselves: with the tone, or only vibrate
  const [prayerMode, setPrayerMode] = useState<"sound" | "vibrate">("sound");
  const [chatMode, setChatMode] = useState<"sound" | "vibrate">("sound");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      let { data, error } = await supabase.from("prayer_reminders" as any).select("slots, prayer_mode, chat_mode").eq("user_id", userId).maybeSingle();
      if (error) ({ data } = await supabase.from("prayer_reminders" as any).select("slots").eq("user_id", userId).maybeSingle()); // before 137_notification_sound_mode.sql
      if (data && (data as any).slots) setSlots((data as any).slots);
      if ((data as any)?.prayer_mode === "vibrate") setPrayerMode("vibrate");
      if ((data as any)?.chat_mode === "vibrate") setChatMode("vibrate");
      setLoaded(true);
    })();
  }, [userId]);

  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const row = {
      user_id: userId,
      // the automatic notifications (weekly result, streak, chat ...) are always included
      slots: [...new Set([...slots.filter((k) => !AUTO_KEYS.includes(k)), ...AUTO_KEYS])],
      tz_offset: -new Date().getTimezoneOffset(),
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabase.from("prayer_reminders" as any).upsert({ ...row, prayer_mode: prayerMode, chat_mode: chatMode });
    if (error) ({ error } = await supabase.from("prayer_reminders" as any).upsert(row)); // the choice of sound or vibrate needs 137_notification_sound_mode.sql
    if (error) { setSaving(false); setMsg("Belum bisa menyimpan. Coba lagi sebentar lagi."); return; }

    // Ask for notification permission (Android app). Old app versions without the plugin just keep the choice.
    let note = "Pengingat tersimpan.";
    {
      try {
        if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("PushNotifications")) {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          let perm = await PushNotifications.checkPermissions();
          if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
          if (perm.receive === "granted") {
            localStorage.setItem(PUSH_CONSENT_KEY, "1");
            await PushNotifications.register(); // saves this phone for notifications right away
            note = "Pengingat dan notifikasi aktif.";
          }
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
      <p className="text-xs leading-relaxed text-brand-muted">Pilih doa yang mau diingatkan. Pesan chat, hasil mingguan, apimu, dan kabar lain dikirim otomatis.</p>
      {CHOOSABLE_SLOTS.map((s) => {
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

      <div className="space-y-2.5 rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-3.5">
        <p className="text-sm font-semibold text-white">Bunyi notifikasi</p>
        <ModeRow label="Pengingat doa" hint="Lonceng gereja" mode={prayerMode} onMode={setPrayerMode} tone="/sounds/church-bell.mp3" />
        <ModeRow label="Pesan dan teman" hint="Nada pesan" mode={chatMode} onMode={setChatMode} tone="/sounds/chat.mp3" />
        <p className="text-[11px] leading-relaxed text-brand-muted">Kabar otomatis lain (hasil mingguan, apimu, Santo hari ini, dan sebagainya) berbunyi dengan nada Ruang Iman, atau getar atau senyap, sesuai pengaturan HP-mu.</p>
      </div>

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

/** Two buttons: with the tone, or only vibrate. The speaker button also plays the tone once. */
function ModeRow({ label, hint, mode, onMode, tone }: { label: string; hint: string; mode: "sound" | "vibrate"; onMode: (m: "sound" | "vibrate") => void; tone: string }) {
  const play = () => { try { void new Audio(tone).play(); } catch { /* ignore */ } };
  const btn = (on: boolean) => `flex h-10 w-12 items-center justify-center rounded-xl border transition ${on ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-[#444] text-gray-300 hover:bg-white/5"}`;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-white">{label}</p>
        <p className="text-[11px] text-brand-muted">{mode === "sound" ? hint : "Getar saja, tanpa suara"}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" aria-label={`${label}: dengan suara`} aria-pressed={mode === "sound"} onClick={() => { onMode("sound"); play(); }} className={btn(mode === "sound")}><Volume2 className="h-5 w-5" /></button>
        <button type="button" aria-label={`${label}: getar saja`} aria-pressed={mode === "vibrate"} onClick={() => { onMode("vibrate"); try { navigator.vibrate?.(200); } catch { /* ignore */ } }} className={btn(mode === "vibrate")}><Smartphone className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
