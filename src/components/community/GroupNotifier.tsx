"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { pingGroupChanged } from "@/lib/dmEvents";
import { unlockAudio, playKnock } from "@/lib/sounds";

/**
 * Mounted once, app-wide. Fires a short knock + badge refresh when a
 * pending join request lands on a group the viewer owns / administers.
 * Realtime is the fast path; a 12s count poll is the fallback for when
 * the group_members table isn't on the realtime publication yet.
 */
export default function GroupNotifier() {
  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    let myId: string | null = null;
    let lastCount: number | null = null;

    supabase.auth.getUser().then(({ data }) => {
      myId = data.user?.id ?? null;
    });

    const unlock = () => unlockAudio();
    const gestureEvents = ["pointerdown", "keydown", "touchstart"];
    gestureEvents.forEach((e) =>
      window.addEventListener(e, unlock, { once: true, passive: true })
    );

    const knockIfVisible = () => {
      if (document.visibilityState === "visible") playKnock();
    };

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
          if (row.user_id !== myId) knockIfVisible();
        }
      )
      .subscribe();

    // fallback: notice the count going up even without realtime
    const poll = async () => {
      if (!alive || document.visibilityState !== "visible") return;
      const { data } = await supabase.rpc("my_pending_group_request_count");
      const n = Number(data) || 0;
      if (lastCount !== null && n > lastCount) {
        playKnock();
        pingGroupChanged();
      }
      lastCount = n;
    };
    poll();
    const iv = setInterval(poll, 12000);

    return () => {
      alive = false;
      clearInterval(iv);
      gestureEvents.forEach((e) => window.removeEventListener(e, unlock));
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
