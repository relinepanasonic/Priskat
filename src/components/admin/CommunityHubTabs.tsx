"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { communityNav } from "@/lib/communityNav";

export default function CommunityHubTabs({ slug, name }: { slug: string; name: string | null }) {
  const pathname = usePathname();
  const tabs = communityNav(`/admin/communities/${slug}`, { name, slug });

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <nav className="flex min-w-max gap-2" aria-label="Community Center">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.name}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "border-brand-gold bg-brand-gold text-brand-dark shadow-md"
                  : "border-transparent text-brand-muted hover:border-[#333] hover:bg-[#1a1d24] hover:text-white"
              }`}
            >
              <t.icon className={`h-4 w-4 ${active ? "text-brand-dark" : "text-brand-muted"}`} />
              {t.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
