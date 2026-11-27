"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calendar, Church, ChevronLeft, Newspaper, Crown, HandHeart, ShoppingBag } from "lucide-react";

const FROM_KEY = "news-from-community";

export default function NewsLayoutClient({ children, lang = "id" }: { children: React.ReactNode; lang?: "id" | "en" }) {
  const pathname = usePathname();

  // Opened from a community page (?cm=<slug>)? Keep a way back while browsing the schedule.
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    try {
      const cm = new URLSearchParams(window.location.search).get("cm");
      if (cm) sessionStorage.setItem(FROM_KEY, cm);
      const stored = sessionStorage.getItem(FROM_KEY);
      if (stored && pathname.startsWith("/news/schedule")) setFrom(stored);
      else { sessionStorage.removeItem(FROM_KEY); setFrom(null); }
    } catch { setFrom(null); }
  }, [pathname]);
  const isEn = lang === "en";
  const fromName = from && from.replace(/[-_]/g, "").toLowerCase() === "catholicindonesia" ? "Catholic Indonesia" : (isEn ? "community" : "komunitas");

  const tabs = [
    { name: isEn ? "Agenda" : "Agenda", href: "/news/events", icon: Calendar },
    { name: isEn ? "Church" : "Gereja", href: "/news/schedule", icon: Church },
    { name: "Marketplace", href: "/news/marketplace", icon: ShoppingBag },
    { name: "Wall of Fame", href: "/news/wall-of-fame", icon: Crown },
    { name: isEn ? "Donation" : "Donasi", href: "/news/donation", icon: HandHeart },
    { name: "Blog", href: "/news/blog", icon: Newspaper },
  ];

  return (
    <div className="w-full h-full px-4 pt-4 pb-28 md:p-8 space-y-6">
      {from && (
        <Link
          href={`/camp/${from}`}
          className="inline-flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold"
        >
          <ChevronLeft className="h-4 w-4" />
          {isEn ? `Back to ${fromName}` : `Kembali ke ${fromName}`}
        </Link>
      )}

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{isEn ? "Faith Bulletin" : "Warta Iman"}</h1>
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

      {/* Tab Content — on phones, Marketplace runs borderless so cards get maximum width */}
      <div
        className={
          pathname.startsWith("/news/marketplace")
            ? "min-h-[500px] overflow-hidden md:rounded-2xl md:border md:border-[#333] md:bg-[#1a1d24] md:shadow-xl"
            : "min-h-[500px] overflow-hidden rounded-2xl border border-[#333] bg-[#1a1d24] shadow-xl"
        }
      >
        {children}
      </div>
    </div>
  );
}

