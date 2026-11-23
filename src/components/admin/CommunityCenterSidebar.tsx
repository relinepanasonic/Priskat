"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Home, LogOut, Settings2, Tent } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { communityNav } from "@/lib/communityNav";

type C = { id: string; name: string; slug: string | null };

/**
 * The Community Center sidebar. A community is a workspace: pick it from the drop down, and the
 * menu below shows only that community's pages. Shown on communitycenter.ruangiman.com and to community admins.
 */
export default function CommunityCenterSidebar({
  communities, canManageAll, userName, avatarUrl,
}: { communities: C[]; canManageAll: boolean; userName: string; avatarUrl: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLElement>(null);
  const m = pathname.match(/^\/admin\/communities\/([^/]+)/);
  const current = m ? communities.find((c) => (c.slug || c.id) === m[1]) ?? null : null;
  const inWorkspace = /\/promotion\/workspace\//.test(pathname);
  const nav = current ? communityNav(`/admin/communities/${current.slug || current.id}`, current) : [];

  // Close the list when you tap outside it or move to another page
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);
  // phone: keep the open page's tab in view
  useEffect(() => { tabs.current?.querySelector<HTMLElement>("[aria-current]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
    {/* Phone: the community switcher and the pages as a row of tabs (the sidebar below is for tablets and computers) */}
    <div className="sticky top-0 z-30 border-b border-[#333] bg-[#1a1d24] md:hidden">
      <div className="flex items-center gap-3 px-4 pt-3">
        <Link href="/admin/communities" aria-label="Kembali ke Community Center" title="Community Center" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20"><Home className="h-5 w-5" /></Link>
        <select
          value={current ? current.slug || current.id : ""}
          onChange={(e) => e.target.value && router.push(`/admin/communities/${e.target.value}/dashboard`)}
          aria-label="Pilih komunitas"
          className="h-11 min-w-0 flex-1 truncate rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-3 text-sm font-semibold text-white focus:outline-none"
        >
          <option value="" disabled>Pilih komunitas</option>
          {communities.map((c) => <option key={c.id} value={c.slug || c.id}>{c.name}</option>)}
        </select>
        <button onClick={signOut} aria-label="Keluar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white"><LogOut className="h-5 w-5" /></button>
      </div>
      {/* inside one event the community's pages are hidden: the event has its own tabs and a Kembali button */}
      {!inWorkspace && current && (
        <nav
          ref={tabs}
          aria-label="Halaman Community Center"
          className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]"
        >
          {current && nav.map((t) => {
            const on = pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${on ? "bg-brand-gold text-brand-dark" : "bg-white/5 text-gray-300"}`}>
                <t.icon className="h-4 w-4" /> {t.name}
              </Link>
            );
          })}
        </nav>
      )}
    </div>

    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#333] bg-[#1a1d24] md:flex">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Image src="/logo.png" alt="" width={36} height={36} className="rounded-lg" />
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Ruang Iman</p>
          <p className="text-sm font-bold text-white">Community Center</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {pathname !== "/admin/communities" && (
          <Link href="/admin/communities" className="flex items-center gap-2.5 rounded-xl border border-brand-gold/30 px-3 py-2.5 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10">
            <Home className="h-4 w-4" /> Community Center
          </Link>
        )}
        {/* Workspace switcher: only the active community is shown, the rest are in the list */}
        <div ref={box} className="relative">
          <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">Komunitas saya</p>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center gap-2.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-3 py-2.5 text-left transition-colors hover:bg-brand-gold/15"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold text-brand-dark"><Tent className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{current?.name ?? "Pilih komunitas"}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-brand-muted" />
          </button>

          {open && (
            <div role="listbox" className="absolute left-0 right-0 z-20 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-[#333] bg-[#14171c] p-1 shadow-xl">
              {communities.length === 0 && <p className="px-3 py-2 text-xs text-brand-muted">Belum ada komunitas yang kamu kelola.</p>}
              {communities.map((c) => {
                const on = current?.id === c.id;
                return (
                  <Link
                    key={c.id}
                    href={`/admin/communities/${c.slug || c.id}/dashboard`}
                    role="option"
                    aria-selected={on}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${on ? "bg-white/10 font-semibold text-brand-gold" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    {on && <Check className="h-4 w-4 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {current && (
          <div>
            <nav className="space-y-0.5" aria-label={`Community Center ${current.name}`}>
              {nav.map((t) => {
                const on = pathname.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${on ? "bg-brand-gold text-brand-dark shadow-md" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <t.icon className={`h-4 w-4 shrink-0 ${on ? "text-brand-dark" : "text-brand-muted"}`} />
                    {t.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {!current && communities.length > 0 && <p className="px-2 text-xs leading-relaxed text-brand-muted">Pilih komunitas di atas untuk membuka Community Center-nya.</p>}

        {canManageAll && (
          <Link href="/admin/communities/kelola-komunitas" className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${pathname === "/admin/communities/kelola-komunitas" ? "bg-white/10 text-brand-gold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <Settings2 className="h-4 w-4" /> Add New Community
          </Link>
        )}
      </div>

      <div className="border-t border-[#333] p-3">
        <div className="flex items-center gap-2.5 px-1 pb-2">
          {avatarUrl ? <Image src={avatarUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-full border border-[#444] object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-bold text-brand-gold">{userName.slice(0, 1).toUpperCase()}</span>}
          <span className="min-w-0 flex-1 truncate text-sm text-white">{userName}</span>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
    </>
  );
}
