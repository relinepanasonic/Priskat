"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageCircle, UsersRound } from "lucide-react";
import GroupUnreadBadge from "@/components/community/GroupUnreadBadge";

const TABS = [
  { href: "/community/friends", label: "Friends", icon: Users },
  { href: "/community/thought", label: "Thought", icon: MessageCircle },
  { href: "/community/group", label: "Group", icon: UsersRound, badge: true },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full min-h-[100dvh] bg-brand-dark text-white font-sans">
      {/* Sub-tab header */}
      <div className="sticky top-0 z-30 bg-[#1a1d24] border-b border-[#333]">
        <div className="flex">
          {TABS.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold tracking-wide transition-colors ${
                  active ? "text-brand-gold border-b-2 border-brand-gold" : "text-gray-500 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
                {badge && <GroupUnreadBadge />}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
