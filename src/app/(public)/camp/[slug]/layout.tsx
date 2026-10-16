"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Map,
  Calendar,
  LayoutDashboard,
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
} from "lucide-react";
import { resolveCommunity } from "@/lib/community";
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
  const params = useParams();
  const slug = (params.slug as string) || "";
  const validSlug = slug && slug !== "undefined" && slug !== "null";

  const [communityName, setCommunityName] = useState<string | null>(null);
  // Known from the URL immediately; confirmed by name once the community loads
  const [isCI, setIsCI] = useState(isCatholicIndonesia(null, slug));
  const [canPromote, setCanPromote] = useState(false);
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
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        const role = String(prof?.role ?? "").toLowerCase();
        let ok = ["founder", "superadmin", "admin"].includes(role);
        if (!ok && community) {
          const { data: ca } = await supabase
            .from("community_admins")
            .select("id")
            .eq("user_id", user.id)
            .eq("community_id", community.id)
            .maybeSingle();
          ok = !!ca;
        }
        if (alive) setCanPromote(ok);
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
    ...(canPromote ? [{ name: "Promotional", href: `/camp/${slug}/promotion`, icon: Megaphone }] : []),
  ];

  const tabs = isCI ? ciTabs : [
    { name: "Camp Event", href: `/camp/${slug}/crew`, icon: Users },
    { name: "My Ongoing Services", href: `/camp/${slug}/ongoing`, icon: Tent },
    { name: "Schedule", href: `/camp/${slug}/schedule`, icon: Calendar },
    ...(canPromote
      ? [
          {
            name: "Promotional",
            href: `/camp/${slug}/promotion`,
            icon: Megaphone,
          },
        ]
      : []),
    { name: "Org Structure", href: `/camp/${slug}/org-structure`, icon: Network },
    { name: "Coverage", href: `/camp/${slug}/coverage`, icon: Map },
    {
      name: "Dashboard",
      href: `/camp/${slug}/dashboard`,
      icon: LayoutDashboard,
    },
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
        <h1 className="text-lg font-bold text-white tracking-wider">{heading}</h1>
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
                  ${
                    isActive
                      ? "bg-brand-gold text-brand-dark shadow-md"
                      : "text-brand-muted hover:text-white hover:bg-[#1a1d24] border border-transparent hover:border-[#333]"
                  }
                `}
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

      {/* Main Content Area */}
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl shadow-xl overflow-x-hidden overflow-y-auto min-h-[500px] flex-1 flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
