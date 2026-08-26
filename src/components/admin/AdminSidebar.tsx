"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Users,
  LogOut,
  ChevronRight,
  BookOpen,
  HandHeart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  role: string;
  fullName: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/members", label: "Members", icon: Users, adminOnly: true },
  { href: "/admin/devotions", label: "Devotions", icon: BookOpen },
  { href: "/admin/prayers", label: "Prayers / Doa", icon: HandHeart },
  { href: "/admin/invite", label: "Invite Users", icon: HandHeart, superAdminOnly: true },
];

export default function AdminSidebar({ role, fullName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = NAV.filter((n) => {
    if (n.superAdminOnly) return role === "superadmin";
    if (n.adminOnly) return role === "admin" || role === "superadmin";
    return true;
  });

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-[#333] bg-[#1a1d24]">
      <div className="px-3 py-5 border-b border-[#333]">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-lg bg-brand-gold text-brand-dark text-white font-bold text-base flex items-center justify-center shadow-glow-gold">
            P
          </div>
          <span className="font-bold text-white text-base tracking-wide">PriskatCFM</span>
        </Link>
        <p className="mt-1 text-[11px] text-gray-500 pl-11 font-medium capitalize">{role} panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                active
                  ? "bg-brand-gold text-brand-dark shadow-md"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent",
              ].join(" ")}
            >
              <Icon className={`h-4 w-4 ${active ? "text-brand-dark" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#333] p-3 space-y-2">
        <div className="px-3 py-1">
          <p className="text-[13px] font-bold text-gray-200 truncate">{fullName}</p>
          <p className="text-[10px] text-gray-500 capitalize">{role}</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 font-medium hover:bg-white/5 hover:text-white transition-colors border border-transparent"
        >
          <ChevronRight className="h-3 w-3 rotate-180" /> View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 font-medium hover:bg-white/5 transition-colors border border-transparent"
        >
          <LogOut className="h-3 w-3" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
