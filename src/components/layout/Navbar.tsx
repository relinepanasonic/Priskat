"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, User, Home, Newspaper, Book, BookOpen, Settings, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Profile } from "@/lib/types/database.types";
import LanguageToggle from "@/components/ui/LanguageToggle";

interface NavbarProps {
  profile?: Profile | null;
  lang?: "id" | "en";
}

const NAV_LINKS = [
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

  async function handleSignOut() {
    const supabase = createClient();
  }

  return (
    <>
    {/* Mobile Top Header (Settings & Lang) */}
    <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-brand-bg backdrop-blur-sm shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-brand-dark font-bold text-xs">P</div>
        <span className="font-bold text-brand-gold text-sm">PriskatCFM</span>
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle currentLang={lang} />
        <Link href="/profile" className="text-brand-light hover:text-brand-gold transition">
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>

    {/* Desktop Header */}
    <header className="hidden md:block sticky top-0 z-50 border-b border-brand-blue-100 bg-brand-surface/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold text-brand-dark text-white font-bold text-sm">
            P
          </div>
          <span className="font-bold text-brand-gold text-lg">PriskatCFM</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-brand-bg text-brand-gold"
                  : "text-brand-light hover:text-brand-gold hover:bg-brand-bg",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageToggle currentLang={lang} />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-light hover:bg-brand-surface-hover transition-colors"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold font-semibold text-xs">
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate">
                  {profile?.full_name || user.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-brand-surface shadow-lg border border-brand-border py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-light hover:bg-brand-surface-hover"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  {profile?.role && ["admin", "moderator"].includes(profile.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-light hover:bg-brand-surface-hover"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-brand-border" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-light hover:text-brand-gold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-gold text-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-gold text-brand-dark-800 transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-brand-light hover:bg-brand-surface-hover"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
    
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
