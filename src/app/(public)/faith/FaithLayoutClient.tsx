"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sunrise, Book, HandHeart, Church, Heart, LifeBuoy, Mic2, CircleDot, Cross, Flame } from "lucide-react";

type TabId = "today" | "bible" | "hidup" | "devosi" | "ekaristi";

/** Which tab a page belongs to. The specific pages are checked before the general ones. */
function tabOf(p: string): TabId {
  if (p === "/faith") return "today";
  if (p.startsWith("/faith/bible")) return "bible";
  if (p.startsWith("/faith/prayers/ekaristi")) return "ekaristi";
  if (["/faith/devosi", "/faith/prayers/rosario", "/faith/prayers/jalan-salib", "/faith/intensi"].some((x) => p.startsWith(x))) return "devosi";
  return "hidup";
}

export default function FaithLayoutClient({ children, lang }: { children: React.ReactNode; lang: "id" | "en" }) {
  const pathname = usePathname();
  const router = useRouter();
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  const isId = lang === "id";

  const isReadingChapter = pathname.match(/\/faith\/bible\/\d+\/\d+/);

  const tabs: { id: TabId; name: string; href: string; icon: typeof Book }[] = [
    { id: "today", name: isId ? "Hari Ini" : "Today", href: "/faith", icon: Sunrise },
    { id: "bible", name: isId ? "Alkitab" : "Bible", href: "/faith/bible", icon: Book },
    { id: "hidup", name: isId ? "Hidup Doa" : "Prayer Life", href: "/faith/hidup-doa", icon: Flame },
    { id: "devosi", name: isId ? "Devosi" : "Devotions", href: "/faith/devosi", icon: CircleDot },
    { id: "ekaristi", name: isId ? "Ekaristi" : "Eucharist", href: "/faith/prayers/ekaristi", icon: Church },
  ];

  // The small second row of links for the two tabs that hold several pages
  const SUBS: Partial<Record<TabId, { name: string; href: string; icon: typeof Book; active: (p: string) => boolean }[]>> = {
    hidup: [
      { name: isId ? "Doa" : "Prayers", href: "/faith/prayers", icon: Heart, active: (p) => p.startsWith("/faith/prayers") && !p.startsWith("/faith/prayers/sos") },
      { name: isId ? "Renungan" : "Devotion", href: "/faith/devotions", icon: Sunrise, active: (p) => p.startsWith("/faith/devotions") || p.startsWith("/faith/plans") },
      { name: isId ? "Kotbah Romo" : "Romo", href: "/faith/romo", icon: Mic2, active: (p) => p.startsWith("/faith/romo") },
      { name: "SOS Doa", href: "/faith/prayers/sos", icon: LifeBuoy, active: (p) => p.startsWith("/faith/prayers/sos") },
    ],
    devosi: [
      { name: isId ? "Rosario" : "Rosary", href: "/faith/prayers/rosario", icon: CircleDot, active: (p) => p.startsWith("/faith/prayers/rosario") },
      { name: isId ? "Jalan Salib" : "Stations", href: "/faith/prayers/jalan-salib", icon: Cross, active: (p) => p.startsWith("/faith/prayers/jalan-salib") },
      { name: isId ? "Intensi Doa" : "Intentions", href: "/faith/intensi", icon: HandHeart, active: (p) => p.startsWith("/faith/intensi") },
    ],
  };

  const current = tabOf(pathname);
  const subs = SUBS[current];

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
    const i = tabs.findIndex((t) => t.id === current);
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
            <div className="overflow-x-auto pb-2 pl-4 pr-4 sm:px-0 hide-scrollbar">
              <nav data-faith-tabs className="flex min-w-max gap-1.5 sm:gap-2" aria-label="Tabs">
                {tabs.map((tab) => {
                  const active = tab.id === current;
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      prefetch={true}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
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
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-brand-dark/90 to-transparent sm:hidden" />
          </div>

          {subs && (
            <div className="-mt-3 flex flex-wrap gap-1.5" data-noswipe>
              {subs.map((sub) => {
                const on = sub.active(pathname);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    prefetch={true}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "border-brand-gold bg-brand-gold/15 text-brand-gold" : "border-[#333] text-brand-muted hover:text-white"}`}
                  >
                    <sub.icon className="h-3.5 w-3.5" />
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
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
