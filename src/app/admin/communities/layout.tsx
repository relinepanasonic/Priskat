import type { Metadata } from "next";

// The browser tab says "Community Center Ruang Iman" on every page of the Community Center
export const metadata: Metadata = { title: { absolute: "Community Center Ruang Iman" } };

export default function CommunitiesAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
