"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { playMessageChime } from "@/lib/sounds";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

const TOKEN_KEY = "push-token";

type BannerAction = { label: string; url: string };
type Banner = {
  title: string;
  body: string;
  url?: string;
  avatar?: string;
  image?: string;
  actions?: BannerAction[];
};

function parseActions(raw: unknown): BannerAction[] {
  if (!raw) return [];
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((a) => a && typeof a.label === "string" && typeof a.url === "string" && a.url.startsWith("/"))
      .slice(0, 2);
  } catch {
    return [];
  }
}

/**
 * Inside the Android app: ask for notification permission, register with
 * Firebase, and save this phone's token for the signed-in user. Tapping a
 * notification opens the page it came from. Shows a Facebook-style rich banner
 * when a notification arrives while the app is open.
 */
export default function PushRegistrar({ userId }: { userId: string }) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);

  // The in-app banner disappears by itself after 7 seconds
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 7000);
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
          const richSupported = Boolean((window as unknown as { __RUANG_RICH_PUSH__?: boolean }).__RUANG_RICH_PUSH__);
          // Saved by the server, so a token used before by another account on this phone moves to this account
          const res = await fetch("/api/push/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: value, platform: Capacitor.getPlatform(), richSupported }),
          }).catch(() => null);
          if (!res || !res.ok) {
            await supabase.from("push_tokens" as any).upsert({
              token: value, user_id: userId, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString(),
            });
          }
        }),
        PushNotifications.addListener("registrationError", (e) => console.warn("Push registration failed", e)),
        // Android does not show a notification while the app is open: show our own rich banner instead
        PushNotifications.addListener("pushNotificationReceived", (n) => {
          try { playMessageChime(); } catch { /* ignore */ }
          const d = (n.data ?? {}) as Record<string, string | undefined>;
          setBanner({
            title: n.title || d.title || "Ruang Iman",
            body: n.body || d.body || "",
            url: d.url,
            avatar: d.avatar,
            image: d.image,
            actions: parseActions(d.actions),
          });
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

  const go = (u?: string) => {
    setBanner(null);
    if (u && u.startsWith("/")) router.push(u);
  };

  return (
    <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[200] overflow-hidden rounded-2xl border border-brand-gold/40 bg-[#1a1d24]/95 shadow-2xl backdrop-blur-md md:left-auto md:right-4 md:w-96">
      <div className="flex items-start gap-3 p-3.5">
        <button type="button" onClick={() => go(banner.url)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          {banner.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner.avatar} alt="" className="mt-0.5 h-10 w-10 shrink-0 rounded-full border border-brand-gold/40 object-cover" />
          ) : (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
              <Bell className="h-4 w-4" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">{banner.title}</span>
            {banner.body && <span className="mt-0.5 block text-xs leading-relaxed text-brand-light">{banner.body}</span>}
          </span>
        </button>
        <button type="button" onClick={() => setBanner(null)} aria-label="Tutup" className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {banner.image && (
        <button type="button" onClick={() => go(banner.url)} className="block w-full px-3.5 pb-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.image} alt="" className="max-h-40 w-full rounded-xl object-cover" />
        </button>
      )}

      {banner.actions && banner.actions.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-black/20 px-3.5 py-2.5">
          {banner.actions.map((act, idx) => (
            <button
              key={act.label}
              type="button"
              onClick={() => go(act.url)}
              className={`rounded-lg py-1.5 text-xs font-bold transition ${
                idx === 0
                  ? "bg-brand-gold text-brand-dark hover:brightness-105"
                  : "border border-white/15 bg-white/5 text-brand-light hover:bg-white/10"
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
