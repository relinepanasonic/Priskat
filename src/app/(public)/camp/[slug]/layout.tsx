"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  Map,
  Calendar,
  Tent,
  Users,
  ChevronLeft,
  Network,
  Megaphone,
  Info,
  ScrollText,
  Church,
  BadgeCheck,
  Images,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { resolveCommunity, isCatholicFamilyMinistry, isRuangImanCommunity } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

const titleCase = (s: string) =>
  s
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export default function CommunitySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  const params = useParams();
  const slug = (params.slug as string) || "";
  const validSlug = slug && slug !== "undefined" && slug !== "null";

  const [communityName, setCommunityName] = useState<string | null>(null);
  // Known from the URL immediately; confirmed by name once the community loads
  const [isCI, setIsCI] = useState(isCatholicIndonesia(null, slug));
  const [isCFM, setIsCFM] = useState(isCatholicFamilyMinistry(null, slug));
  const [isRI, setIsRI] = useState(isRuangImanCommunity(null, slug));
  const [canPromote, setCanPromote] = useState(false);
  const [leadsCg, setLeadsCg] = useState(false);
  // null = not known yet. Not a member of a community (other than Catholic Indonesia): only "Tentang" is open
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let alive = true;
    (async () => {
      // This URL segment identifies ONE community (slug or id). No
      // fallback to "a" community — a wrong link must not silently open
      // someone else's workspace.
      const community = await resolveCommunity(supabase, slug);
      if (alive && community?.name) {
        setCommunityName(community.name);
        setIsCI(isCatholicIndonesia(community.name, community.slug));
        setIsCFM(isCatholicFamilyMinistry(community.name, community.slug));
        setIsRI(isRuangImanCommunity(community.name, community.slug));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && alive) setIsMember(false);
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role, community_id")
          .eq("id", user.id)
          .maybeSingle();
        const role = String(prof?.role ?? "").toLowerCase();
        let ok = ["founder", "superadmin", "admin"].includes(role);
        let member = ok || (!!community && (prof as { community_id?: string | null } | null)?.community_id === community.id);
        if (!member && community) {
          const { data: ms } = await supabase.from("community_memberships" as any).select("community_id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle();
          member = !!ms;
        }
        if (!ok && community) {
          const { data: ca } = await supabase
            .from("community_admins")
            .select("id")
            .eq("user_id", user.id)
            .eq("community_id", community.id)
            .maybeSingle();
          ok = !!ca;
          if (ok) member = true;
        }
        if (alive) { setCanPromote(ok); setIsMember(member); }
        // PIC or pengurus of a Komsel in this community
        if (community) {
          const { data: lead } = await supabase
            .from("connect_group_members" as any)
            .select("id, cg:connect_groups!cg_id(community_id)")
            .eq("user_id", user.id)
            .in("role", ["pic", "pengurus"]);
          const leads = ((lead as unknown as { cg: { community_id: string } | null }[]) ?? []).some((r) => r.cg?.community_id === community.id);
          if (alive) setLeadsCg(leads);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, validSlug, supabase]);

  const heading =
    communityName || (validSlug ? titleCase(slug) : "Community");

  // Each community gets its own set of pages; Catholic Indonesia is the public "Catholic website".
  const ciTabs = [
    { name: "Tentang", href: `/camp/${slug}/tentang`, icon: Info },
    { name: "Sejarah", href: `/camp/${slug}/sejarah`, icon: ScrollText },
    { name: "Uskup", href: `/camp/${slug}/uskup`, icon: Church },
    { name: "Romo", href: `/camp/${slug}/romo`, icon: BadgeCheck },
    { name: "Galeri", href: `/camp/${slug}/galeri`, icon: Images },
    { name: "Peta Keuskupan", href: `/camp/${slug}/peta`, icon: Map },
    { name: "Jadwal Misa", href: `/news/schedule?cm=${slug}`, icon: Calendar },
  ];

  // Members see Tentang, Event, Komsel and Coverage; non-members only Tentang and Event.
  // Ruang Iman's own community also exposes its dedicated public Features showcase tab.
  const tabs = isCI
    ? ciTabs
    : isRI
    ? [
        { name: "Tentang", href: `/camp/${slug}/tentang`, icon: Info },
        { name: "Features", href: `/camp/${slug}/features`, icon: Sparkles },
        { name: "Event", href: `/camp/${slug}/event`, icon: Calendar },
        { name: "Komsel", href: `/camp/${slug}/connect-group`, icon: UsersRound },
        { name: "Coverage", href: `/camp/${slug}/coverage`, icon: Map },
      ]
    : [
        { name: "Tentang", href: `/camp/${slug}/tentang`, icon: Info },
        { name: "Event", href: `/camp/${slug}/event`, icon: Calendar },
        { name: "Komsel", href: `/camp/${slug}/connect-group`, icon: UsersRound },
        { name: "Coverage", href: `/camp/${slug}/coverage`, icon: Map },
      ];

  const browseOnly = !isCI && isMember === false;
  const shownTabs = browseOnly
    ? tabs.filter((t) => t.name === "Tentang" || t.name === "Event" || (isRI && t.name === "Features"))
    : tabs;
  useEffect(() => {
    if (
      browseOnly &&
      !pathname.startsWith(`/camp/${slug}/tentang`) &&
      !pathname.startsWith(`/camp/${slug}/event`) &&
      !(isRI && pathname.startsWith(`/camp/${slug}/features`))
    ) {
      router.replace(`/camp/${slug}/tentang`);
    }
  }, [browseOnly, isRI, pathname, slug, router]);

  // keep the active tab visible in the scrolling tab bar
  useEffect(() => {
    document.querySelector<HTMLElement>("[data-community-tabs] [aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  // Phones: swipe left/right to move between the tabs (Uskup → Romo → Galeri ...)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const el = e.target as HTMLElement;
    // don't hijack maps, inputs, tables or anything that scrolls sideways itself
    const blocked = !!el.closest("input, textarea, select, svg, table, canvas, [data-noswipe]") ||
      (() => { let n: HTMLElement | null = el; while (n && n !== e.currentTarget) { if (n.scrollWidth > n.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true; n = n.parentElement; } return false; })();
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
    const i = tabs.findIndex((tab) => pathname.startsWith(tab.href.split("?")[0]));
    if (i < 0) return;
    const next = tabs[dx < 0 ? i + 1 : i - 1];
    if (next) router.push(next.href);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-3 overflow-x-hidden pb-28 pt-3 font-sans md:space-y-5 md:px-8 md:py-7">
      {/* Back button + Community name */}
      <div className="flex min-w-0 items-center gap-2.5 px-4 md:gap-3 md:px-0">
        <Link
          href="/camp"
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-sm text-brand-muted transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white md:border-white/10 md:bg-[#1a1d24] md:px-3 md:py-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-[#333] md:hidden">|</span>
        <h1 className="truncate text-lg font-bold tracking-wide text-white md:text-2xl" style={{ fontFamily: "'Lora', Georgia, serif" }}>{heading}</h1>
        {canPromote && (
          <a
            href={`https://communitycenter.ruangiman.com/admin/communities/${slug}/dashboard`}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-dark md:px-4 md:py-2"
          >
            <Settings className="h-3.5 w-3.5" />
            Community Center
          </a>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <nav
          data-community-tabs
          className="flex min-w-max gap-1.5 md:inline-flex md:rounded-xl md:border md:border-white/10 md:bg-[#161920] md:p-1.5"
          aria-label="Tabs"
        >
          {shownTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all md:px-4 md:py-2 ${
                  isActive
                    ? "bg-brand-gold text-brand-dark shadow-md shadow-brand-gold/20"
                    : "border border-transparent text-brand-muted hover:bg-white/5 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-brand-dark" : "text-brand-muted"
                  }`}
                />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area — single smooth scroll on PC (no nested inner scrollbar) */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative flex flex-1 flex-col overflow-x-hidden md:min-h-[540px] md:rounded-3xl md:border md:border-white/10 md:bg-[#161920] md:shadow-2xl md:shadow-black/40"
      >
        {children}
      </div>
    </div>
  );
}
