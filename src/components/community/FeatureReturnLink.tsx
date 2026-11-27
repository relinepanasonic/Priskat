"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const FEATURES_RETURN_KEY = "ri_features_return";

/**
 * Link used by Ruang Iman's Features showcase cards.
 * Remembers the Features page in sessionStorage so pressing the phone's hardware Back
 * button from the destination feature returns cleanly to Features instead of climbing
 * that feature's default parent ladder.
 */
export default function FeatureReturnLink({
  href,
  returnTo,
  className,
  children,
}: {
  href: string;
  returnTo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        try {
          sessionStorage.setItem(FEATURES_RETURN_KEY, returnTo);
        } catch {
          /* ignore storage errors */
        }
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
