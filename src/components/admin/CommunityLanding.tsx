import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Settings2, Tent } from "lucide-react";

export type LandingCommunity = { id: string; name: string; slug: string | null; logo_url?: string | null };

/**
 * The Community Center front page, the same for everyone who can enter it: a grid of small cards with the logo
 * and the name, and one button, "Masuk". The work (members, admins, events ...) happens inside each community.
 */
export default function CommunityLanding({ communities, canManage }: { communities: LandingCommunity[]; canManage: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Community Center</h1>
          <p className="mt-1 text-sm text-brand-muted">Pilih komunitas yang ingin kamu kelola.</p>
          <p className="mt-2 text-sm italic text-brand-gold">&ldquo;Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada di tengah-tengah mereka.&rdquo; <span className="not-italic text-brand-muted">(Matius 18:20)</span></p>
        </div>
        {canManage && (
          <Link href="/admin/communities/kelola-komunitas" className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/40 px-3 py-2 text-xs font-semibold text-brand-gold hover:bg-brand-gold/10">
            <Settings2 className="h-3.5 w-3.5" /> Kelola komunitas dan admin
          </Link>
        )}
      </div>

      {communities.length === 0 && <p className="text-sm text-brand-muted">Belum ada komunitas yang bisa kamu kelola.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {communities.map((c) => (
          <div key={c.id} className="flex aspect-[4/5] flex-col items-center rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 text-center">
            <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-3">
              {c.logo_url
                ? <Image src={c.logo_url} alt="" width={240} height={240} className="max-h-full w-full object-contain" />
                : <Tent className="h-16 w-16 text-brand-gold" />}
            </div>
            <p className="mt-4 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-tight text-white">{c.name}</p>
            <Link
              href={`/admin/communities/${c.slug || c.id}/dashboard`}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-gold px-3 py-2.5 text-sm font-bold text-brand-dark hover:opacity-90"
            >
              Masuk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
