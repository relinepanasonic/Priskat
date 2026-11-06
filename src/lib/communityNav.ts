import { BadgeCheck, CalendarDays, LayoutDashboard, Map, Megaphone, Network, Tent, Users, UsersRound } from "lucide-react";
import { isCatholicFamilyMinistry } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

/** The pages of ONE community in the Community Center, in the order they appear in the sidebar. */
export function communityNav(base: string, community: { name?: string | null; slug?: string | null }) {
  const cfm = isCatholicFamilyMinistry(community.name, community.slug);
  const romo = isCatholicIndonesia(community.name, community.slug);
  return [
    { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { name: "Anggota", href: `${base}/anggota`, icon: Users },
    // Catholic Family Ministry runs camps; every other community uses events
    cfm ? { name: "Camp", href: `${base}/camp`, icon: Tent } : { name: "Event", href: `${base}/acara`, icon: CalendarDays },
    { name: "Connect Group", href: `${base}/connect-group`, icon: UsersRound },
    { name: "Promotion", href: `${base}/promotion`, icon: Megaphone },
    { name: "Struktur Organisasi", href: `${base}/struktur`, icon: Network },
    { name: "Coverage", href: `${base}/coverage`, icon: Map },
    ...(romo ? [{ name: "Romo", href: `${base}/romo`, icon: BadgeCheck }] : []),
  ];
}
