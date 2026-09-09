"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MessagesTabs({ isEn }: { isEn: boolean }) {
  const pathname = usePathname();
  const isGroup = pathname.includes("/messages/group");

  return (
    <div className="bg-brand-surface pt-4 pb-0 px-4 border-b border-brand-border/50 sticky top-[60px] z-40">
      <div className="flex space-x-6">
        <Link
          href="/community/messages/private"
          className={"pb-3 text-sm font-bold transition-colors border-b-2 " + (!isGroup ? "text-brand-gold border-brand-gold" : "text-brand-muted border-transparent hover:text-white")}
        >
          {isEn ? "Private" : "Pribadi"}
        </Link>
        <Link
          href="/community/messages/group"
          className={"pb-3 text-sm font-bold transition-colors border-b-2 " + (isGroup ? "text-brand-gold border-brand-gold" : "text-brand-muted border-transparent hover:text-white")}
        >
          {isEn ? "Group" : "Grup"}
        </Link>
      </div>
    </div>
  );
}
