"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Settings2, Tent } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { communityNav } from "@/lib/communityNav";

type C = { id: string; name: string; slug: string | null };

/**
 * The Community Center sidebar: "my communities" (the ones you manage), and the pages of the
 * community you have open. Shown on communitycenter.ruangiman.com and to community admins.
 */
export default function CommunityCenterSidebar({
  communities, canManageAll, userName, avatarUrl,
}: { communities: C[]; canManageAll: boolean; userName: string; avatarUrl: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const m = pathname.match(/^\/admin\/communities\/([^/]+)/);
  const current = m ? communities.find((c) => (c.slug || c.id) === m[1]) ?? null : null;
  const nav = current ? communityNav(`/admin/communities/${current.slug || current.id}`, current) : [];

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#333] bg-[#1a1d24] md:flex">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Image src="/logo.png" alt="" width={36} height={36} className="rounded-lg" />
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Ruang Iman</p>
          <p className="text-sm font-bold text-white">Community Center</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <div>
          <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">Komunitas saya</p>
          {communities.length === 0 && <p className="px-2 text-xs text-brand-muted">Belum ada komunitas yang kamu kelola.</p>}
          <div className="space-y-1">
            {communities.map((c) => {
              const on = current?.id === c.id;
              return (
                <Link
                  key={c.id}
                  href={`/admin/communities/${c.slug || c.id}/dashboard`}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${on ? "bg-brand-gold text-brand-dark shadow-md" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <Tent className={`h-4 w-4 shrink-0 ${on ? "text-brand-dark" : "text-brand-muted"}`} />
                  <span className="truncate">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {current && (
          <div>
            <p className="mb-1.5 truncate px-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">{current.name}</p>
            <nav className="space-y-0.5" aria-label="Community Center">
              {nav.map((t) => {
                const on = pathname.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${on ? "bg-white/10 text-brand-gold" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <t.icon className={`h-4 w-4 shrink-0 ${on ? "text-brand-gold" : "text-brand-muted"}`} />
                    {t.name}
                  </Link>
                );
              })}
            </nav>
            <Link href={`/camp/${current.slug || current.id}`} className="mt-3 flex items-center gap-2 rounded-lg border border-brand-gold/30 px-3 py-2 text-xs font-semibold text-brand-gold hover:bg-brand-gold/10">
              <ExternalLink className="h-3.5 w-3.5" /> Halaman komunitas
            </Link>
          </div>
        )}

        {canManageAll && (
          <Link href="/admin/communities" className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${pathname === "/admin/communities" ? "bg-white/10 text-brand-gold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <Settings2 className="h-4 w-4" /> Kelola komunitas dan admin
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
  );
}
