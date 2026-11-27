"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Tent,
  Upload,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LanguageToggle from "@/components/ui/LanguageToggle";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  founderOnly?: boolean;
};

type NavGroup = {
  key: string;
  title: string;
  items: NavItem[];
};

export default function AdminErpSidebar({
  userName,
  userEmail,
  avatarUrl,
  role,
  lang = "id",
}: {
  userName: string;
  userEmail?: string | null;
  avatarUrl?: string | null;
  role: string;
  lang?: "id" | "en";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isEn = lang === "en";
  const isFounder = role.toLowerCase() === "founder";

  function toggleGroup(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const groups: NavGroup[] = [
    {
      key: "executive",
      title: isEn ? "Executive" : "Eksekutif",
      items: [
        { href: "/admin", label: isEn ? "ERP Dashboard" : "Dashboard ERP", icon: LayoutDashboard, exact: true },
        { href: "/admin/operations", label: isEn ? "Operations & Progress" : "Operasional & Progres", icon: Activity },
      ],
    },
    {
      key: "accounting",
      title: isEn ? "Accounting" : "Akuntansi",
      items: [
        { href: "/admin/accounting", label: isEn ? "Donations & Finance" : "Donasi & Keuangan", icon: HandHeart },
      ],
    },
    {
      key: "community",
      title: isEn ? "Community & Content" : "Komunitas & Konten",
      items: [
        { href: "/admin/communities", label: isEn ? "Communities" : "Komunitas", icon: Tent },
        { href: "/admin/members", label: isEn ? "Users & Members" : "Pengguna & Anggota", icon: Users },
        { href: "/admin/upload", label: isEn ? "Content & Upload" : "Konten & Unggah", icon: Upload },
        { href: "/admin/campaigns", label: isEn ? "Campaigns" : "Kampanye", icon: Sparkles },
        { href: "/admin/bots", label: "Bots", icon: Bot },
      ],
    },
    {
      key: "system",
      title: isEn ? "System" : "Sistem",
      items: [
        { href: "/admin/database", label: "Database", icon: Database, founderOnly: true },
        { href: "/admin/security", label: isEn ? "Security Log" : "Log Keamanan", icon: ShieldCheck, founderOnly: true },
      ],
    },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#12151b] text-white">
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3.5">
        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ruang Iman"
            width={30}
            height={30}
            className="rounded-lg bg-white object-contain shadow-md shadow-brand-gold/20"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight text-white">Ruang Iman</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">Admin ERP</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded-lg p-1 text-brand-muted hover:bg-white/10 md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Collapsible Navigation Groups */}
      <nav className="flex-1 space-y-2.5 overflow-y-auto px-2.5 py-3">
        {groups.map((g) => {
          const visibleItems = g.items.filter((i) => !i.founderOnly || isFounder);
          if (visibleItems.length === 0) return null;
          const isCollapsed = Boolean(collapsed[g.key]);
          return (
            <div key={g.key}>
              <button
                type="button"
                onClick={() => toggleGroup(g.key)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
              >
                <span>{g.title}</span>
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 opacity-70" />
                ) : (
                  <ChevronDown className="h-3 w-3 opacity-70" />
                )}
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                          active
                            ? "bg-brand-gold font-semibold text-brand-dark shadow-sm shadow-brand-gold/15"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-brand-dark" : "text-brand-gold/80"}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Ecosystem Portals (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => toggleGroup("ecosystem")}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
          >
            <span>{isEn ? "Ecosystem" : "Ekosistem"}</span>
            {collapsed.ecosystem ? (
              <ChevronRight className="h-3 w-3 opacity-70" />
            ) : (
              <ChevronDown className="h-3 w-3 opacity-70" />
            )}
          </button>
          {!collapsed.ecosystem && (
            <div className="mt-0.5 space-y-0.5">
              <a
                href="https://apps.ruangiman.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-brand-muted transition hover:bg-white/5 hover:text-white"
              >
                <span>Ruang Iman App</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href="https://communitycenter.ruangiman.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-brand-muted transition hover:bg-white/5 hover:text-white"
              >
                <span>Community Center</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Footer: Language + User + Sign Out */}
      <div className="space-y-2 border-t border-white/10 p-2.5">
        <div className="flex items-center justify-between px-1.5">
          <span className="text-[10px] font-medium text-gray-500">{isEn ? "Language" : "Bahasa"}</span>
          <LanguageToggle currentLang={lang} />
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={userName} className="h-7 w-7 rounded-full border border-brand-gold/30 object-cover" />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-[11px] font-bold text-brand-gold">
              {userName[0]?.toUpperCase() || "A"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-white">{userName}</p>
            <p className="truncate text-[9px] uppercase tracking-wider text-brand-gold/80">{role}</p>
            {userEmail && <p className="truncate text-[9px] text-gray-500">{userEmail}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isEn ? "Sign Out" : "Keluar"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#12151b] px-4 py-2.5 md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs font-bold text-white">Ruang Iman</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">Admin ERP</p>
          </div>
        </div>
        <LanguageToggle currentLang={lang} />
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setOpen(false)}>
          <div className="w-56 max-w-[80vw] border-r border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/70 backdrop-blur-sm" />
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden h-dvh w-56 shrink-0 border-r border-white/10 md:block">
        {sidebarContent}
      </aside>
    </>
  );
}
