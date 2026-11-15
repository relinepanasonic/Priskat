"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

const TOKEN_KEY = "push-token";

/**
 * Inside the Android app: ask for notification permission, register with
 * Firebase, and save this phone's token for the signed-in user. Tapping a
 * notification opens the chat it came from. Does nothing in a normal browser
 * or in older app builds without the push plugin.
 */
type Banner = { title: string; body: string; url?: string };

export default function PushRegistrar({ userId }: { userId: string }) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);

  // The in-app banner disappears by itself after a few seconds
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 6000);
    return () => window.clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    // Off until Firebase is configured (google-services.json in the app build + server keys);
    // registering without Firebase would crash the app.
    if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "1") return;
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("PushNotifications")) return;
    let cleanup = () => {};

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const supabase = createClient();

      const handles = await Promise.all([
        PushNotifications.addListener("registration", async ({ value }) => {
          try { localStorage.setItem(TOKEN_KEY, value); } catch { /* ignore */ }
          // Saved by the server, so a token used before by another account on this phone moves to this account
          const res = await fetch("/api/push/register", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: value, platform: Capacitor.getPlatform() }),
          }).catch(() => null);
          if (!res || !res.ok) {
            await supabase.from("push_tokens" as any).upsert({
              token: value, user_id: userId, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString(),
            });
          }
        }),
        PushNotifications.addListener("registrationError", (e) => console.warn("Push registration failed", e)),
        // Android does not show a notification while the app is open: show our own banner instead
        PushNotifications.addListener("pushNotificationReceived", (n) => {
          setBanner({ title: n.title ?? "Ruang Iman", body: n.body ?? "", url: (n.data as { url?: string } | undefined)?.url });
        }),
        PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
          const url = (notification.data as { url?: string } | undefined)?.url;
          if (url && url.startsWith("/")) router.push(url);
        }),
      ]);
      cleanup = () => handles.forEach((h) => h.remove());

      try {
        await PushNotifications.createChannel({
          id: "messages", name: "Pesan", description: "Pesan pribadi dan grup", importance: 5, visibility: 1, vibration: true,
        });
        let perm = await PushNotifications.checkPermissions();
        // Ask only after the person said yes (reminders card / welcome step), never as a surprise
        const consented = (() => { try { return localStorage.getItem("push-consent") === "1"; } catch { return false; } })();
        if ((perm.receive === "prompt" || perm.receive === "prompt-with-rationale") && consented) {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive === "granted") await PushNotifications.register();
      } catch (e) {
        console.warn("Push setup failed", e);
      }
    })();

    return () => cleanup();
  }, [userId, router]);

  if (!banner) return null;
  return (
    <button
      type="button"
      onClick={() => { const u = banner.url; setBanner(null); if (u && u.startsWith("/")) router.push(u); }}
      className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[200] flex items-start gap-3 rounded-2xl border border-brand-gold/40 bg-[#1a1d24]/95 p-3.5 text-left shadow-2xl backdrop-blur md:left-auto md:right-4 md:w-96"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold"><Bell className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{banner.title}</span>
        {banner.body && <span className="mt-0.5 block text-xs leading-relaxed text-brand-light">{banner.body}</span>}
      </span>
    </button>
  );
}

/** Call before signing out so this phone stops getting the old account's messages. */
export async function forgetPushToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await createClient().from("push_tokens" as any).delete().eq("token", token);
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}
