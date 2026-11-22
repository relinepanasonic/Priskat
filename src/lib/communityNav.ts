import { BadgeCheck, GraduationCap, CalendarDays, LayoutDashboard, Map, Tent, Users, UsersRound } from "lucide-react";
import { isCatholicFamilyMinistry } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

/** The pages of ONE community in the Community Center, in the order they appear in the sidebar. */
export function communityNav(base: string, community: { name?: string | null; slug?: string | null }) {
  const cfm = isCatholicFamilyMinistry(community.name, community.slug);
  const romo = isCatholicIndonesia(community.name, community.slug);
  return [
    { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { name: "Anggota", href: `${base}/anggota`, icon: Users },
    // Catholic Family Ministry also runs camps
    ...(cfm ? [{ name: "Camp", href: `${base}/camp`, icon: Tent }] : []),
    // Create the event first; its registration, attendance and promotion (poster) are part of it
    { name: "Event", href: `${base}/promotion`, icon: CalendarDays },
    ...(cfm ? [{ name: "Alumni", href: `${base}/alumni`, icon: GraduationCap }] : []),
    { name: "Connect Group", href: `${base}/connect-group`, icon: UsersRound },
    { name: "Coverage", href: `${base}/coverage`, icon: Map },
    ...(romo ? [{ name: "Romo", href: `${base}/romo`, icon: BadgeCheck }] : []),
  ];
}
