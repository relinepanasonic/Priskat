import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { getSaints, fetchWikiPortraits, daysInMonth } from "@/lib/katakombe";
import { FAMOUS_SAINTS } from "@/lib/data/famousSaints";
import { jakartaParts } from "@/lib/bacaanHarian";
import { getLanguage } from "@/lib/lang";
import SaintsDateBar from "@/components/faith/SaintsDateBar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Santo dan Santa" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function SaintsPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const [sp, lang] = await Promise.all([searchParams, getLanguage()]);
  const isEn = lang === "en";
  const today = jakartaParts();
  let month = Number(sp.m) || today.month;
  let day = Number(sp.d) || today.day;
  if (month < 1 || month > 12) month = today.month;
  if (day < 1 || day > daysInMonth(month)) day = Math.min(Math.max(day, 1), daysInMonth(month));

  const [saints, famousPortraits] = await Promise.all([
    getSaints(month, day),
    fetchWikiPortraits(FAMOUS_SAINTS.map((s) => s.wikiTitle)),
  ]);

  return (
    <div className="w-full max-w-4xl space-y-7 p-4 pb-28 md:p-6">
      <Link href="/faith" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {isEn ? "Today" : "Hari Ini"}
      </Link>

      {/* Pustaka Kisah Para Kudus Populer (Novel-style curated library) */}
      <section className="space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            {isEn ? "Biography Library" : "Pustaka Biografi"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>
            {isEn ? "Lives of Beloved Saints" : "Kisah Santo & Santa Populer"}
          </h1>
          <p className="mt-0.5 text-xs text-brand-muted">
            {isEn
              ? "Read the lives of the saints in a comfortable book format — complete with inspiration and prayer."
              : "Baca kisah hidup para kudus dalam format buku yang nyaman — lengkap dengan teladan dan doa."}
          </p>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
          {FAMOUS_SAINTS.map((s) => {
            const portrait = famousPortraits.get(s.wikiTitle) ?? null;
            return (
              <Link
                key={s.slug}
                href={`/faith/saints/read?slug=${s.slug}`}
                className="group relative flex h-64 w-44 shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-brand-gold/35 p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/75 md:w-auto"
                style={{ background: `linear-gradient(155deg, ${s.coverFrom} 0%, ${s.coverTo} 100%)` }}
              >
                {portrait && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portrait}
                    alt={s.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* Warm dark gradient overlay so the gold title & feast day always pop cleanly */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: portrait
                      ? "linear-gradient(180deg, rgba(10,12,16,0.12) 0%, rgba(10,12,16,0.55) 48%, rgba(10,12,16,0.95) 100%)"
                      : "none",
                  }}
                />
                {/* Subtle book spine highlight */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-gold/80 via-brand-gold/30 to-transparent" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">{s.feastDay}</p>
                  <h2 className="mt-1 text-base font-bold leading-snug text-white transition-colors group-hover:text-brand-gold" style={serif}>
                    {s.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[11px] italic leading-relaxed text-[#EAE5D9]/85" style={serif}>
                    {s.subtitle}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-brand-gold">
                    <BookOpen className="h-3.5 w-3.5" />
                    {isEn ? "Read biography" : "Baca buku kisah"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Kalender Para Kudus Harian */}
      <section className="space-y-4 border-t border-white/10 pt-6">
        <SaintsDateBar
          year={today.year}
          month={month}
          day={day}
          todayMonth={today.month}
          todayDay={today.day}
          lang={lang}
        />

        {saints.length === 0 ? (
          <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">
            {isEn
              ? "No saints are recorded for this day, or the data could not be loaded yet."
              : "Tidak ada santo atau santa yang tercatat pada hari ini, atau datanya belum bisa dimuat."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {saints.map((s) => (
              <Link
                key={s.href}
                href={`/faith/saints/read?url=${encodeURIComponent(s.href)}&name=${encodeURIComponent(s.title)}&m=${month}&d=${day}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-[#333] bg-[#1a1d24] p-4 transition-all hover:border-brand-gold/45 hover:bg-[#1e222b]"
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-brand-gold/25 bg-brand-gold/10 text-brand-gold">
                    <Sparkles className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-white transition-colors group-hover:text-brand-gold" style={serif}>{s.title}</p>
                  {s.description && <p className="mt-0.5 line-clamp-2 text-sm text-brand-muted">{s.description}</p>}
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-gold">
                    <BookOpen className="h-3.5 w-3.5" /> Baca riwayat hidupnya
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-brand-muted">Sumber kalender: katakombe.org & Wikipedia Indonesia.</p>
      </section>
    </div>
  );
}
