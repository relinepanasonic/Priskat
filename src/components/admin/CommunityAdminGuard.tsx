"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * A community admin only works inside the Community Center. Any other admin address
 * (members, database, upload, news ...) sends them back there.
 */
export default function CommunityAdminGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.startsWith("/admin/communities")) router.replace("/admin/communities");
  }, [pathname, router]);

  return null;
}
