"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Book, Heart, Sunrise, LifeBuoy, CircleDot, Cross, Church } from "lucide-react";

// These prayer pages have their own tab, so the "Doa" tab must not light up for them
const OWN_PRAYER_TABS = ["/faith/prayers/sos", "/faith/prayers/rosario", "/faith/prayers/jalan-salib", "/faith/prayers/ekaristi"];

export default function FaithLayoutClient({ children, lang }: { children: React.ReactNode; lang: "id" | "en" }) {
  const pathname = usePathname();
  const router = useRouter();
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  const isId = lang === "id";

  const isReadingChapter = pathname.match(/\/faith\/bible\/\d+\/\d+/);

  const tabs = [
    { name: "Spiritual", href: "/faith", icon: Sparkles, exact: true },
    { name: isId ? "Alkitab" : "Bible", href: "/faith/bible", icon: Book },
    { name: isId ? "Doa" : "Prayer", href: "/faith/prayers", icon: Heart, exclude: OWN_PRAYER_TABS },
    { name: isId ? "Renungan" : "Devotion", href: "/faith/devotions", icon: Sunrise },
    { name: isId ? "Rosario" : "Rosary", href: "/faith/prayers/rosario", icon: CircleDot },
    { name: isId ? "Jalan Salib" : "Stations", href: "/faith/prayers/jalan-salib", icon: Cross },
    { name: isId ? "Ekaristi" : "Eucharist", href: "/faith/prayers/ekaristi", icon: Church },
    { name: "SOS Doa", href: "/faith/prayers/sos", icon: LifeBuoy },
  ];

  const isActive = (t: (typeof tabs)[number]) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href) && !(t.exclude ?? []).some((e) => pathname.startsWith(e));

  // Keep the active tab in view in the scrolling bar
  useEffect(() => {
    document.querySelector<HTMLElement>("[data-faith-tabs] [aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  // Phones: swipe left/right to move between the sub pages
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const el = e.target as HTMLElement;
    let blocked = !!el.closest("input, textarea, select, svg, canvas, [data-noswipe]");
    for (let n: HTMLElement | null = el; !blocked && n && n !== e.currentTarget; n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) blocked = true;
    }
    touch.current = { x: t.clientX, y: t.clientY, ok: !blocked };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const st = touch.current;
    touch.current = null;
    if (!st || !st.ok) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - st.x;
    const dy = t.clientY - st.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const i = tabs.findIndex(isActive);
    if (i < 0) return;
    const next = tabs[dx < 0 ? i + 1 : i - 1];
    if (next) router.push(next.href);
  };

  return (
    <div className={`w-full h-full space-y-6 ${isReadingChapter ? "md:p-8" : "p-4 md:p-8 pb-32"}`}>
      {!isReadingChapter && (
        <>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{isId ? "Pertumbuhan Rohani" : "Spiritual Growth"}</h1>
          </div>

          {/* Tabs: the next one is always partly visible so it's clear there is more to the right */}
          <div className="relative -mx-4 sm:mx-0">
            <div className="overflow-x-auto pb-2 pl-4 pr-10 sm:px-0 hide-scrollbar">
              <nav data-faith-tabs className="flex min-w-max space-x-2" aria-label="Tabs">
                {tabs.map((tab) => {
                  const active = isActive(tab);
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      prefetch={true}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        active
                          ? "bg-brand-gold text-brand-dark shadow-md"
                          : "text-brand-muted hover:text-white hover:bg-[#1a1d24] border border-transparent hover:border-[#333]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <tab.icon className={`h-4 w-4 ${active ? "text-brand-dark" : "text-brand-muted"}`} />
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-dark to-transparent sm:hidden" />
          </div>
        </>
      )}

      {/* Sub page content */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={isReadingChapter ? "md:bg-[#1a1d24] md:border md:border-[#333] md:rounded-2xl md:shadow-xl md:overflow-hidden" : "bg-[#1a1d24] border border-[#333] rounded-2xl shadow-xl overflow-hidden min-h-[500px]"}
      >
        {children}
      </div>
    </div>
  );
}
