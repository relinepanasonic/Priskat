"use client";

import { useEffect } from "react";
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
export default function PushRegistrar({ userId }: { userId: string }) {
  const router = useRouter();

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
          await supabase.from("push_tokens" as any).upsert({
            token: value, user_id: userId, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString(),
          });
        }),
        PushNotifications.addListener("registrationError", (e) => console.warn("Push registration failed", e)),
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
        if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive === "granted") await PushNotifications.register();
      } catch (e) {
        console.warn("Push setup failed", e);
      }
    })();

    return () => cleanup();
  }, [userId, router]);

  return null;
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
