"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, User, Home, Newspaper, Book, BookOpen, Settings, Users, UserPlus, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Profile } from "@/lib/types/database.types";
import LanguageToggle from "@/components/ui/LanguageToggle";
import InvitePanel from "@/components/layout/InvitePanel";

interface NavbarProps {
  profile?: Profile | null;
  lang?: "id" | "en";
}

const DESKTOP_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/friends", label: "Friends" },
  { href: "/bible", label: "Bible" },
  { href: "/prayers", label: "Prayer" },
];

const MOBILE_NAV_LINKS = [
  { href: "/prayers", label: "Prayer" },
  { href: "/news", label: "News" },
  { href: "/", label: "Home" },
  { href: "/friends", label: "Friends" },
  { href: "/bible", label: "Bible" },
];

export default function Navbar({ profile, lang = "id" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
    {inviteOpen && <InvitePanel onClose={() => setInviteOpen(false)} />}
    {/* Mobile Top Header (Settings & Lang) */}
    <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#1a1d24] backdrop-blur-sm shadow-sm border-b border-[#333]">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-lg object-contain bg-white" />
        <span className="font-bold text-brand-gold text-xs truncate">Catholic Family Ministry</span>
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle currentLang={lang} />
        {profile?.role === "superadmin" && (
          <button onClick={() => setInviteOpen(true)} className="text-brand-gold hover:opacity-80 transition">
            <UserPlus className="h-5 w-5" />
          </button>
        )}
        <Link href="/profile" className="text-brand-light hover:text-brand-gold transition">
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>

    {/* Desktop Sidebar */}
    <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 z-50 border-r border-[#333] bg-[#1a1d24] shadow-lg">
      <div className="flex flex-col h-full px-3 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
          <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="rounded-xl object-contain bg-white shadow-md shadow-brand-gold/20" />
          <span className="font-bold text-white text-[13px] leading-tight tracking-wide">Catholic Family<br/>Ministry</span>
        </Link>

        {/* Desktop nav */}
        <nav className="flex-1 space-y-1">
          {DESKTOP_NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-brand-gold text-brand-dark shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
                ].join(" ")}
              >
                {label === "Home" && <Home className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Prayer" && <BookOpen className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "News" && <Newspaper className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Friends" && <Users className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Bible" && <Book className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Superadmin Invite & Database Buttons */}
        {profile?.role === "superadmin" && (
          <div className="mt-3 space-y-1">
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite User</span>
            </button>
            <Link
              href="/admin/database"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
            >
              <Database className="h-4 w-4" />
              <span>Database</span>
            </Link>
          </div>
        )}

        {/* Bottom Section (Lang & User) */}
        <div className="mt-auto space-y-3 pt-4 border-t border-[#333]">
          <div className="px-3 flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-medium">Language</span>
            <LanguageToggle currentLang={lang} />
          </div>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full gap-2.5 rounded-lg p-2 text-sm font-medium text-brand-light hover:bg-white/5 transition-colors border border-transparent hover:border-[#333]"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover border border-[#444]"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold font-semibold text-xs border border-[#333]">
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-start flex-1 overflow-hidden">
                  <span className="truncate w-full text-[13px] font-bold text-gray-200">
                    {profile?.full_name || "User"}
                  </span>
                  <span className="truncate w-full text-[10px] text-gray-500 font-normal">
                    {user.email}
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl bg-brand-surface shadow-2xl border border-[#333] py-2 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-brand-light hover:bg-brand-bg hover:text-brand-gold"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  {profile?.role && ["superadmin", "admin", "moderator"].includes(profile.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-brand-light hover:bg-brand-bg hover:text-brand-gold"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  {profile?.role === "superadmin" && (
                    <Link
                      href="/admin/users"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-brand-light hover:bg-brand-bg hover:text-brand-gold"
                    >
                      <Users className="h-4 w-4" />
                      Manage Users
                    </Link>
                  )}
                  <hr className="my-1 border-[#333]" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-brand-bg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-xs font-medium text-brand-light hover:text-brand-gold border border-[#333] rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center rounded-lg bg-brand-gold text-brand-dark px-4 py-2 text-xs font-bold hover:bg-yellow-400 transition-colors shadow-glow-gold"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
    
    {/* Mobile Bottom Navigation (Visible only on mobile) */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e1e] border-t border-[#333333] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/prayers" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/prayers' ? 'text-brand-gold' : 'text-gray-500'}`}>
          <BookOpen className="h-5 w-5" />
          <span className="text-[10px] font-medium">Prayer</span>
        </Link>
        <Link href="/news" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/news' ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Newspaper className="h-5 w-5" />
          <span className="text-[10px] font-medium">News</span>
        </Link>
        
        {/* Center Home Button */}
        <Link href="/" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-brand-gold' : 'text-gray-400'}`}>
          <div className={`absolute -top-3 flex items-center justify-center h-12 w-12 rounded-full border-4 border-[#1e1e1e] ${pathname === '/' ? 'bg-brand-gold text-brand-dark' : 'bg-brand-surface text-brand-light'}`}>
            <Home className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium pt-8">Home</span>
        </Link>

        <Link href="/friends" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/friends' ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Friends</span>
        </Link>
        <Link href="/bible" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/bible' ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Book className="h-5 w-5" />
          <span className="text-[10px] font-medium">Bible</span>
        </Link>
      </div>
    </nav>
    </>
  );
}
