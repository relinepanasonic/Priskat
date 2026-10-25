"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Info } from "lucide-react";
import ActivityTimer from "@/components/home/ActivityTimer";
import { MASS, SEASONS, type SeasonId } from "@/lib/ekaristi";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function EkaristiClient({ defaultSeason, celebration }: { defaultSeason: SeasonId; celebration: string | null }) {
  const [seasonId, setSeasonId] = useState<SeasonId>(defaultSeason);
  const [open, setOpen] = useState<string | null>(null);
  const season = SEASONS.find((s) => s.id === seasonId)!;

  let n = 0;

  return (
    <div className="p-4 md:p-6">
      <ActivityTimer kind="ekaristi" refId="mass" seconds={20} />
      <h1 className="text-2xl font-bold text-white" style={serif}>Perayaan Ekaristi</h1>
      <p className="mt-1 text-sm text-brand-muted">Urutan Misa dari awal sampai berkat penutup. Pilih masa liturgi untuk melihat perbedaannya.</p>

      {/* Season picker */}
      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:px-0" data-noswipe>
        <div className="flex min-w-max gap-2">
          {SEASONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeasonId(s.id)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                s.id === seasonId ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-[#333] text-brand-light hover:border-brand-gold/50"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full border border-black/30" style={{ background: s.dot }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {celebration && seasonId === defaultSeason && <p className="mt-1 text-[11px] text-brand-muted">Hari ini: {celebration}</p>}

      {/* What changes in this season */}
      <div className="mt-4 rounded-2xl border bg-[#14171c] p-4" style={{ borderColor: `${GOLD}33` }}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-black/30" style={{ background: season.dot }} />
          <p className="text-sm font-bold text-white">{season.label}</p>
          <span className="text-xs text-brand-muted">· warna liturgi: {season.color}</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-brand-light">
          <li>• Madah Kemuliaan: <b>{season.gloria ? "dinyanyikan" : "tidak dinyanyikan"}</b></li>
          <li>• Bait Pengantar Injil: <b>{season.acclamation}</b></li>
          <li>• {season.credo}</li>
          {season.notes.map((t) => <li key={t}>• {t}</li>)}
        </ul>
      </div>

      {/* Order of the Mass */}
      <div className="mt-6 space-y-6">
        {MASS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{group.title}</h2>
            <div className="space-y-2">
              {group.parts.map((p) => {
                if (p.onlyIf === "gloria" && !season.gloria) return null;
                n += 1;
                const key = `${group.title}-${p.title}`;
                const isOpen = open === key;
                const hasMore = !!p.text || !!p.link;
                return (
                  <div key={key} className="rounded-2xl border border-[#2a2d35] bg-[#14171c]">
                    <button
                      onClick={() => hasMore && setOpen(isOpen ? null : key)}
                      className="flex w-full items-start gap-3 p-3.5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: `${GOLD}1f`, color: GOLD }}>{n}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{p.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">{p.what}</span>
                      </span>
                      {hasMore && <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-brand-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#2a2d35] px-4 pb-4 pt-3">
                        {p.text && <p className="whitespace-pre-line text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{p.text}</p>}
                        {p.link && (
                          <Link href={p.link.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: GOLD }}>
                            {p.link.label} <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-brand-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Teks dan urutan di sini adalah ringkasan untuk membantu umat mengikuti Misa. Rumusan resmi mengikuti Tata Perayaan Ekaristi yang dipakai di parokimu, dan bisa sedikit berbeda menurut edisi dan kebiasaan setempat.
      </p>
    </div>
  );
}
