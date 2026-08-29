"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Map, Calendar, LayoutDashboard, Tent, Users, ChevronLeft } from "lucide-react";

export default function CommunitySlugLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;

  const tabs = [
    { name: "Coverage", href: `/camp/${slug}/coverage`, icon: Map },
    { name: "My Ongoing Camp", href: `/camp/${slug}/ongoing`, icon: Tent },
    { name: "Camp Crew", href: `/camp/${slug}/crew`, icon: Users },
    { name: "Schedule", href: `/camp/${slug}/schedule`, icon: Calendar },
    { name: "Dashboard", href: `/camp/${slug}/dashboard`, icon: LayoutDashboard },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-4 flex flex-col font-sans">
      {/* Back button + Community name */}
      <div className="flex items-center gap-3">
        <Link
          href="/camp"
          className="flex items-center gap-1 text-brand-muted hover:text-white text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-[#333]">|</span>
        <h1 className="text-lg font-bold text-white uppercase tracking-wider">{slug.toUpperCase()}</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex space-x-2 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
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
                <Icon className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-brand-muted"}`} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl shadow-xl overflow-x-hidden overflow-y-auto min-h-[500px] flex-1 flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
