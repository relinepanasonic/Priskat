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

  const links = NAV.filter((n) => !n.adminOnly || role === "admin");

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-brand-border bg-brand-surface">
      <div className="px-4 py-5 border-b border-brand-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-gold text-brand-dark text-white font-bold text-sm flex items-center justify-center">
            P
          </div>
          <span className="font-bold text-brand-gold text-sm">PriskatCFM</span>
        </Link>
        <p className="mt-1 text-xs text-brand-muted pl-10 capitalize">{role} panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-bg text-brand-gold"
                  : "text-brand-light hover:bg-brand-surface-hover hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-border p-3">
        <div className="mb-2 px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{fullName}</p>
          <p className="text-xs text-brand-muted capitalize">{role}</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-muted hover:bg-brand-surface-hover"
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
