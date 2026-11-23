import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, Tent } from "lucide-react";

export type LandingCommunity = { id: string; name: string; slug: string | null; logo_url?: string | null };

/**
 * The Community Center front page, the same for everyone who can enter it: portrait cards with a big logo, a small
 * name and one button, "Masuk". The work (members, admins, events ...) happens inside each community.
 */
export default function CommunityLanding({ communities, canManage }: { communities: LandingCommunity[]; canManage: boolean }) {
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Ruang Iman</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">Community Center</h1>
            <p className="mt-1 text-sm text-brand-muted">Pilih komunitas yang ingin kamu kelola.</p>
          </div>
          {canManage && (
            <Link href="/admin/communities/kelola-komunitas" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-dark shadow-md transition hover:opacity-90">
              <Plus className="h-4 w-4" /> Add New Community
            </Link>
          )}
        </div>
        <blockquote className="border-l-2 border-brand-gold/60 pl-3.5 text-sm italic leading-relaxed text-gray-300">
          &ldquo;Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada di tengah-tengah mereka.&rdquo;{" "}
          <span className="not-italic text-brand-muted">Matius 18:20</span>
        </blockquote>
      </header>

      {communities.length === 0 && <p className="text-sm text-brand-muted">Belum ada komunitas yang bisa kamu kelola.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {communities.map((c) => (
          <article key={c.id} className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c2029] to-[#14171c] p-2.5 shadow-lg shadow-black/20 transition hover:border-brand-gold/40 sm:p-3">
            {/* a big logo: it is the first thing you recognise */}
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/5">
              {c.logo_url
                ? <Image src={c.logo_url} alt="" width={320} height={320} sizes="(max-width: 640px) 45vw, 240px" className="h-full w-full object-contain transition group-hover:scale-105" />
                : <Tent className="h-14 w-14 text-brand-gold" />}
            </div>
            <h2 className="mt-3 line-clamp-2 min-h-[2.2rem] px-0.5 text-center text-[13px] font-semibold leading-snug text-white sm:text-sm">{c.name}</h2>
            <Link
              href={`/admin/communities/${c.slug || c.id}/dashboard`}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark transition hover:opacity-90"
            >
              Masuk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
