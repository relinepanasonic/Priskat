"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, User, Home, Newspaper, Book, Tent, Users, Database, Upload } from "lucide-react";
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

const DESKTOP_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/friends", label: "Friends" },
  { href: "/faith", label: "Spiritual" },
  { href: "/camp", label: "Camp" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar({ profile, lang = "id" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
    {/* Mobile Top Header (Settings & Lang) */}
    <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#1a1d24] backdrop-blur-sm shadow-sm border-b border-[#333]">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-lg object-contain bg-white" />
        <span className="font-bold text-brand-gold text-xs truncate">Catholic Family Ministry</span>
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle currentLang={lang} />
        
        <button onClick={handleSignOut} className="text-brand-light hover:text-red-500 transition"><LogOut className="h-5 w-5" /></button>
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
            const isActive = pathname.startsWith(href) && (href !== "/" || pathname === "/");
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
                {label === "Spiritual" && <Book className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "News" && <Newspaper className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Friends" && <Users className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Camp" && <Tent className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                {label === "Profile" && <User className={`h-4 w-4 ${isActive ? "text-brand-dark" : "text-gray-400"}`} />}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Superadmin Invite & Database Buttons */}
        {String(profile?.role).toLowerCase() === "superadmin" && (
          <div className="mt-3 space-y-1">
            <a
              href="/admin/members"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </a>
            
            <a
                href="/admin/database"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
              >
                <Database className="h-4 w-4" />
                <span>Database</span>
              </a>
              <a
                href="/admin/upload"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </a>
          </div>
        )}

        {/* Bottom Section (Lang & User) */}
        <div className="mt-auto space-y-3 pt-4 border-t border-[#333]">
          <div className="px-3 flex justify-between items-center">
            <span className="text-[11px] text-gray-500 font-medium">Language</span>
            <LanguageToggle currentLang={lang} />
          </div>
          
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-2 py-1">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover border border-[#444]"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold font-semibold text-xs border border-[#333] shrink-0">
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="truncate w-full text-[12px] font-bold text-gray-200">
                    {profile?.full_name || "User"}
                  </span>
                  <span className="truncate w-full text-[10px] text-gray-500 font-normal">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
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
        <Link prefetch={true} href="/faith" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/faith') ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Book className="h-5 w-5" />
          <span className="text-[10px] font-medium">Spiritual</span>
        </Link>
        <Link prefetch={true} href="/news" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/news') ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Newspaper className="h-5 w-5" />
          <span className="text-[10px] font-medium">News</span>
        </Link>
        
        {/* Center Home Button */}
        <Link prefetch={true} href="/" className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-brand-gold' : 'text-gray-400'}`}>
          <div className={`absolute -top-3 flex items-center justify-center h-12 w-12 rounded-full border-4 border-[#1e1e1e] ${pathname === '/' ? 'bg-brand-gold text-brand-dark' : 'bg-brand-surface text-brand-light'}`}>
            <Home className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium pt-8">Home</span>
        </Link>

        <Link prefetch={true} href="/friends" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/friends') ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Friends</span>
        </Link>
        <Link prefetch={true} href="/camp" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/camp') ? 'text-brand-gold' : 'text-gray-500'}`}>
          <Tent className="h-5 w-5" />
          <span className="text-[10px] font-medium">Camp</span>
        </Link>
      </div>
    </nav>
    </>
  );
}



