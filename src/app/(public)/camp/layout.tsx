"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Calendar, LayoutDashboard } from "lucide-react";

export default function CampLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "CFM Services", href: "/camp/map", icon: Map },
    { name: "Schedule", href: "/camp/schedule", icon: Calendar },
    { name: "Dashboard", href: "/camp/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="w-full min-h-[100dvh] bg-[#1a1d24] text-white flex flex-col font-sans">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-brand-gold/5 blur-[100px] pointer-events-none z-0"></div>

      {/* Navigation Tabs */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-4 relative z-20">
        <h1 className="text-3xl font-bold font-serif mb-6 text-brand-gold">
          Alumni CFM
        </h1>
        <div className="flex gap-4 border-b border-[#333] pb-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all border-b-2 font-semibold whitespace-nowrap ${
                  isActive
                    ? "border-brand-gold text-brand-gold bg-brand-gold/10"
                    : "border-transparent text-gray-400 hover:text-brand-light hover:bg-[#22252d]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 pb-24">
        {children}
      </div>
    </div>
  );
}
