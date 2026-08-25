"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Profile } from "@/lib/types/database.types";

interface NavbarProps {
  profile?: Profile | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/directory", label: "Directory" },
];

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue-100 bg-brand-surface/95 backdrop-blur-sm shadow-sm">
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
        <div className="hidden md:flex items-center gap-3">
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-surface px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname === href
                    ? "bg-brand-bg text-brand-gold"
                    : "text-brand-light hover:bg-brand-surface-hover",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-brand-light hover:bg-brand-surface-hover"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-brand-blue px-4 py-2 text-center text-sm font-medium text-brand-gold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg bg-brand-gold text-brand-dark px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
