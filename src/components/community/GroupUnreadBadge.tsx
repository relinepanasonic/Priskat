"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GROUP_CHANGED } from "@/lib/dmEvents";

/**
 * Red count on the "Group" tab — unread group chats plus pending join
 * requests waiting on the viewer.
 */
export default function GroupUnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const check = async () => {
      const [unread, requests] = await Promise.all([
        supabase.rpc("my_unread_group_count"),
        supabase.rpc("my_pending_group_request_count"),
      ]);
      if (!alive) return;
      const n = (Number(unread.data) || 0) + (Number(requests.data) || 0);
      setCount(n);
    };

    check();
    const iv = setInterval(check, 15000);
    const onFocus = () => check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener(GROUP_CHANGED, check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(GROUP_CHANGED, check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (count <= 0) return null;
  return (
    <span className="absolute right-1/2 top-1.5 translate-x-3 rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
