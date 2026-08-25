"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  eventId: string;
  initialCount: number;
}

export default function LiveRSVPCount({ eventId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes on event_rsvps for this specific event only
    const channel = supabase
      .channel(`rsvp-count-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          // Refetch count on any change
          const { count: newCount } = await supabase
            .from("event_rsvps")
            .select("id", { count: "exact", head: true })
            .eq("event_id", eventId)
            .eq("status", "going");
          setCount(newCount ?? 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return <span className="font-semibold text-brand-blue">{count}</span>;
}
