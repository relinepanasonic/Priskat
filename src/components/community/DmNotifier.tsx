"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { pingDmChanged, getViewingThread } from "@/lib/dmEvents";
import { unlockAudio, playMessageChime } from "@/lib/sounds";

/**
 * Mounted once, app-wide. Keeps a realtime subscription on dm_messages so
 * every unread badge (Messages tab, Connect nav dot) can react in a split
 * second, and plays a short chime for messages that land while you're not
 * looking at that chat.
 */
export default function DmNotifier() {
  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    let myId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      myId = data.user?.id ?? null;
    });

    // Audio can't start until the user has interacted with the page.
    const unlock = () => unlockAudio();
    const gestureEvents = ["pointerdown", "keydown", "touchstart"];
    gestureEvents.forEach((e) =>
      window.addEventListener(e, unlock, { once: true, passive: true })
    );

    // RLS means we only receive inserts for threads we're a member of.
    const channel = supabase
      .channel("dm_notify")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        (payload) => {
          if (!alive) return;
          const row = payload.new as {
            author_id: string;
            thread_id: string;
          };
          pingDmChanged();
          const mine = myId != null && row.author_id === myId;
          const viewing = row.thread_id === getViewingThread();
          if (!mine && !viewing && document.visibilityState === "visible") {
            playMessageChime();
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
