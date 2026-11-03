"use client";

import { useEffect } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { addDays, localDay } from "@/lib/activity";

type WidgetData = { streak: number; lastDay: string; verseText: string; verseRef: string; celebration: string; readings: string; isEn: boolean };
const RuangWidget = registerPlugin<{ update(data: WidgetData): Promise<void> }>("RuangWidget");

/**
 * Keeps the Android home-screen widget up to date: streak, last prayer day, today's verse and today's readings.
 * Runs when the app opens, comes back to the front, or records a prayer. Does nothing in a
 * browser or in app builds without the widget.
 */
export default function WidgetSync({ userId, isEn }: { userId: string; isEn: boolean }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("RuangWidget")) return;

    const sync = async () => {
      const today = localDay();
      const { data } = await createClient()
        .from("daily_activity" as any)
        .select("day, kind")
        .eq("user_id", userId)
        .gte("day", addDays(today, -60));
      // A day counts when the person prayed or redeemed it (loot and campaign points alone do not)
      const done = new Set(((data as unknown as { day: string; kind: string }[]) ?? []).filter((r) => r.kind !== "loot" && r.kind !== "campaign").map((r) => r.day));
      let cursor = done.has(today) ? today : addDays(today, -1);
      const lastDay = done.has(cursor) ? cursor : [...done].sort().pop() ?? "";
      let streak = 0;
      while (done.has(cursor)) { streak += 1; cursor = addDays(cursor, -1); }

      let verseText = "";
      let verseRef = "";
      try {
        const r = await fetch(`/api/bible/votd?lang=${isEn ? "en" : "id"}`);
        if (r.ok) { const v = await r.json(); verseText = v.text ?? ""; verseRef = v.reference ?? ""; }
      } catch { /* keep the widget's streak even without the verse */ }

      // Today's Mass readings, one per line: "Bacaan I  Filipi 2:5-11"
      let celebration = "";
      let readings = "";
      try {
        const r = await fetch("/api/readings/today");
        if (r.ok) {
          const d = (await r.json()) as { celebration?: string; readings?: { label: string; title: string }[] };
          celebration = d.celebration ?? "";
          // Short lines so nothing is cut off: "Bacaan I  Filipi 2:5-11", "Mazmur  22:26b-27…", "Injil  Lukas 14:15-24"
          const short = (t: string) => (t.length > 22 ? `${t.slice(0, 21).trimEnd()}…` : t);
          readings = (d.readings ?? [])
            .map((x) => (x.label === "Mazmur" ? `Mazmur  ${short(x.title.replace(/^[^\d]*/, ""))}` : `${x.label}  ${short(x.title)}`))
            .join("\n");
        }
      } catch { /* the other cards still work */ }

      await RuangWidget.update({ streak, lastDay, verseText, verseRef, celebration, readings, isEn });
    };

    const run = () => { sync().catch(() => {}); };
    const onVisible = () => { if (document.visibilityState === "visible") run(); };
    run();
    window.addEventListener("activity-recorded", run);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("activity-recorded", run);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, isEn]);

  return null;
}
