"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Book, Heart, Sunrise } from "lucide-react";

export default function FaithLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Bible", href: "/faith/bible", icon: Book },
    { name: "Prayer", href: "/faith/prayers", icon: Heart },
    { name: "Devotion", href: "/faith/devotions", icon: Sunrise },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Spiritual Growth</h1>
        <p className="mt-2 text-brand-muted max-w-2xl text-sm">
          Deepen your faith with daily scripture, guided prayers, and personal devotions.
        </p>
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
