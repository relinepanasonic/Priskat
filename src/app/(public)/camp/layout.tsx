"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Calendar, LayoutDashboard, Database, Tent } from "lucide-react";

export default function CampLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

    const tabs = [
    { name: "CFM Services", href: "/camp/map", icon: Map },
    { name: "My Ongoing Camp", href: "/camp/ongoing", icon: Tent },
    // { name: "Alumni Data", href: "/camp/alumni-data", icon: Database }, // Hidden for now as requested
    { name: "Schedule", href: "/camp/schedule", icon: Calendar },
    { name: "Dashboard", href: "/camp/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-6 flex flex-col font-sans">
      
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Alumni CFM</h1>
      </div>

      {/* Tabs Navigation (Matches Faith Layout) */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex space-x-2 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
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



