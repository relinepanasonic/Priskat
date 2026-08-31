"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DM_CHANGED } from "@/lib/dmEvents";

/**
 * Small red dot for the "Connect" nav item — lit whenever there are
 * unread direct messages or group chats.
 */
export default function ConnectUnreadDot({ className = "" }: { className?: string }) {
  const [has, setHas] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const check = async () => {
      const [dm, grp] = await Promise.all([
        supabase.rpc("my_unread_dm_count"),
        supabase.rpc("my_unread_group_count"),
      ]);
      if (!alive) return;
      const n = (Number(dm.data) || 0) + (Number(grp.data) || 0);
      setHas(n > 0);
    };

    check();
    const iv = setInterval(check, 15000);
    const onFocus = () => check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener(DM_CHANGED, check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(DM_CHANGED, check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!has) return null;
  return (
    <span
      className={`absolute h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1a1d24] ${className}`}
    />
  );
}
