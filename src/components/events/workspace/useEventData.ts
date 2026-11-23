"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventGroup, RegSettings, Registration } from "@/lib/eventReg";

export type WorkspaceEvent = {
  id: string;
  title: string;
  event_date: string;
  banner_image_url: string | null;
  promo_status: "draft" | "active" | "closed";
  capacity: number | null;
};

/** Everything an event workspace tab needs about the event: the registrations, groups, registration settings. */
export function useEventData(eventId: string) {
  const [event, setEvent] = useState<WorkspaceEvent | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [settings, setSettings] = useState<RegSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const db = createClient() as any;
    const [e, r, g, s] = await Promise.all([
      db.from("events").select("id, title, event_date, banner_image_url, promo_status, capacity").eq("id", eventId).maybeSingle(),
      db.from("event_registrations").select("*").eq("event_id", eventId).order("created_at", { ascending: false }).limit(2000),
      db.from("event_groups").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
      db.from("event_reg_settings").select("*").eq("event_id", eventId).maybeSingle(),
    ]);
    setEvent((e.data as WorkspaceEvent) ?? null);
    setRegs((r.data as Registration[]) ?? []);
    setGroups((g.data as EventGroup[]) ?? []);
    setSettings((s.data as RegSettings) ?? null);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { void load(); }, [load]);

  return { event, regs, groups, settings, loading, reload: load };
}
