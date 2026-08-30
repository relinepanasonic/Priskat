"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Small red dot shown on the "Group" tab when there are unread group chats. */
export default function GroupUnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const check = async () => {
      const { data, error } = await supabase.rpc("my_unread_group_count");
      if (!alive || error) return;
      setCount(typeof data === "number" ? data : Number(data) || 0);
    };

    check();
    const iv = setInterval(check, 20000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (count <= 0) return null;
  return (
    <span className="absolute right-1/2 top-1.5 translate-x-3 rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
