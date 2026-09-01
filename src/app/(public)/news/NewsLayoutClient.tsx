"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calendar, Church, Newspaper } from "lucide-react";

export default function NewsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Events", href: "/news/events", icon: Calendar },
    { name: "Church Schedule", href: "/news/schedule", icon: Church },
    { name: "Blog", href: "/news/blog", icon: Newspaper },
  ];

  return (
    <div className="w-full h-full px-4 pt-4 pb-28 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">CFM News & Updates</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex space-x-2 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${isActive 
                    ? "bg-brand-gold text-brand-dark shadow-md" 
                    : "text-brand-muted hover:text-white hover:bg-[#1a1d24] border border-transparent hover:border-[#333]"}
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <tab.icon className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-brand-muted"}`} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl shadow-xl overflow-hidden min-h-[500px]">
        {children}
      </div>
    </div>
  );
}

