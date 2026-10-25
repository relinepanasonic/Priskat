"use client";

import { useEffect } from "react";
import { recordActivity, type ActivityKind } from "@/lib/activity";

/** Records a prayer-game activity once the person has stayed on the page for a while. Renders nothing. */
export default function ActivityTimer({ kind, refId = "", seconds = 20 }: { kind: ActivityKind; refId?: string; seconds?: number }) {
  useEffect(() => {
    let visibleMs = 0;
    let last = Date.now();
    let done = false;
    // Count only the time the page is actually in front of the person
    const tick = window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === "visible") visibleMs += now - last;
      last = now;
      if (!done && visibleMs >= seconds * 1000) {
        done = true;
        window.clearInterval(tick);
        void recordActivity(kind, refId);
      }
    }, 1000);
    return () => window.clearInterval(tick);
  }, [kind, refId, seconds]);
  return null;
}
