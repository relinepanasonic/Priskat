"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Calendar, LayoutDashboard } from "lucide-react";

export default function CampLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Map", href: "/camp/map", icon: Map },
    { name: "Schedule", href: "/camp/schedule", icon: Calendar },
    { name: "Dashboard", href: "/camp/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="w-full min-h-[100dvh] bg-[#0a0f18] text-white flex flex-col font-sans">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-blue-900/10 blur-[100px] pointer-events-none"></div>

      {/* Navigation Tabs */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-4 relative z-20">
        <h1 className="text-3xl font-bold font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-200">
          Alumni CFM Command Center
        </h1>
        <div className="flex gap-4 border-b border-blue-500/30 pb-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all border-b-2 font-semibold ${
                  isActive
                    ? "border-cyan-400 text-cyan-400 bg-blue-900/20"
                    : "border-transparent text-gray-400 hover:text-cyan-200 hover:bg-blue-900/10"
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
      <div className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-4 pb-24">
        {children}
      </div>
    </div>
  );
}
