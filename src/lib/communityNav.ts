import { BadgeCheck, Building2, GraduationCap, CalendarDays, LayoutDashboard, Map, Users, UsersRound } from "lucide-react";
import { isCatholicFamilyMinistry } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

/** The pages of ONE community in the Community Center, in the order they appear in the sidebar. */
export function communityNav(base: string, community: { name?: string | null; slug?: string | null }) {
  const cfm = isCatholicFamilyMinistry(community.name, community.slug);
  const romo = isCatholicIndonesia(community.name, community.slug);
  return [
    { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    // the Super admin edits it, an Admin reads it
    { name: "Profil", href: `${base}/profil`, icon: Building2 },
    { name: "Anggota", href: `${base}/anggota`, icon: Users },
    // Camp and Event are one: Event. Registration, attendance, poster, crew, tasks and Keuangan are all part of it
    { name: "Event", href: `${base}/promotion`, icon: CalendarDays },
    ...(cfm ? [{ name: "Alumni", href: `${base}/alumni`, icon: GraduationCap }] : []),
    { name: "Komsel", href: `${base}/connect-group`, icon: UsersRound },
    { name: "Coverage", href: `${base}/coverage`, icon: Map },
    ...(romo ? [{ name: "Romo", href: `${base}/romo`, icon: BadgeCheck }] : []),
  ];
}
