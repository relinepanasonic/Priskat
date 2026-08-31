"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { pingGroupChanged } from "@/lib/dmEvents";
import { unlockAudio, playKnock } from "@/lib/sounds";

/**
 * Mounted once, app-wide. Listens for pending join requests on groups the
 * viewer owns / administers (RLS scopes the realtime feed to those) and
 * plays a short knock, so a request lands in a split second — same as the
 * DM notifier, different sound.
 */
export default function GroupNotifier() {
  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    let myId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      myId = data.user?.id ?? null;
    });

    const unlock = () => unlockAudio();
    const gestureEvents = ["pointerdown", "keydown", "touchstart"];
    gestureEvents.forEach((e) =>
      window.addEventListener(e, unlock, { once: true, passive: true })
    );

    const channel = supabase
      .channel("group_notify")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_members",
          filter: "status=eq.pending",
        },
        (payload) => {
          if (!alive) return;
          const row = payload.new as { user_id: string };
          pingGroupChanged();
          if (row.user_id !== myId && document.visibilityState === "visible") {
            playKnock();
          }
        }
      )
      .subscribe();

    return () => {
      alive = false;
      gestureEvents.forEach((e) => window.removeEventListener(e, unlock));
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
