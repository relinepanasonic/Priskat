import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { getSaints, daysInMonth, MONTH_NAMES } from "@/lib/katakombe";
import { FAMOUS_SAINTS } from "@/lib/data/famousSaints";
import { jakartaParts } from "@/lib/bacaanHarian";

export const dynamic = "force-dynamic";
export const metadata = { title: "Santo dan Santa" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

const addDay = (month: number, day: number, n: number) => {
  const d = new Date(Date.UTC(2024, month - 1, day + n)); // a leap year, so 29 February exists
  return { m: d.getUTCMonth() + 1, d: d.getUTCDate() };
};

export default async function SaintsPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const sp = await searchParams;
  const today = jakartaParts();
  let month = Number(sp.m) || today.month;
  let day = Number(sp.d) || today.day;
  if (month < 1 || month > 12) month = today.month;
  if (day < 1 || day > daysInMonth(month)) day = Math.min(Math.max(day, 1), daysInMonth(month));

  const saints = await getSaints(month, day);
  const prev = addDay(month, day, -1);
  const next = addDay(month, day, 1);
  const isToday = month === today.month && day === today.day;

  return (
    <div className="w-full max-w-4xl space-y-7 p-4 pb-28 md:p-6">
      <Link href="/faith" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Hari Ini
      </Link>

      {/* Pustaka Kisah Para Kudus Populer (Novel-style curated library) */}
      <section className="space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Pustaka Biografi</p>
          <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>Kisah Santo & Santa Populer</h1>
          <p className="mt-0.5 text-xs text-brand-muted">Baca kisah hidup para kudus dalam format buku yang nyaman — lengkap dengan teladan dan doa.</p>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
          {FAMOUS_SAINTS.map((s) => (
            <Link
              key={s.slug}
              href={`/faith/saints/read?slug=${s.slug}`}
              className="group relative flex w-44 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-brand-gold/30 p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/70 md:w-auto"
              style={{ background: `linear-gradient(155deg, ${s.coverFrom} 0%, ${s.coverTo} 100%)` }}
            >
              {/* Subtle book spine highlight */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-gold/70 via-brand-gold/30 to-transparent" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold/90">{s.feastDay}</p>
                <h2 className="mt-1.5 text-base font-bold leading-snug text-white group-hover:text-brand-gold transition-colors" style={serif}>
                  {s.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-[11px] italic leading-relaxed text-[#EAE5D9]/75" style={serif}>
                  {s.subtitle}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-brand-gold">
                <BookOpen className="h-3.5 w-3.5" />
                Baca buku kisah
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Kalender Para Kudus Harian */}
      <section className="space-y-4 border-t border-white/10 pt-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Kalender Para Kudus</p>
          <h2 className="mt-1 text-xl font-bold text-white" style={serif}>{day} {MONTH_NAMES[month - 1]}{isToday ? " (hari ini)" : ""}</h2>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link href={`/faith/saints?m=${prev.m}&d=${prev.d}`} className="inline-flex items-center gap-1 rounded-full border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:border-brand-gold/50">
            <ChevronLeft className="h-4 w-4" /> {prev.d} {MONTH_NAMES[prev.m - 1].slice(0, 3)}
          </Link>
          {!isToday && <Link href="/faith/saints" className="text-xs font-semibold text-brand-gold">Hari ini</Link>}
          <Link href={`/faith/saints?m=${next.m}&d=${next.d}`} className="inline-flex items-center gap-1 rounded-full border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:border-brand-gold/50">
            {next.d} {MONTH_NAMES[next.m - 1].slice(0, 3)} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MONTH_NAMES.map((n, i) => (
            <Link
              key={n}
              href={`/faith/saints?m=${i + 1}&d=${Math.min(day, daysInMonth(i + 1))}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${i + 1 === month ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted hover:text-white"}`}
            >
              {n.slice(0, 3)}
            </Link>
          ))}
        </div>

        {saints.length === 0 ? (
          <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">
            Tidak ada santo atau santa yang tercatat pada hari ini, atau datanya belum bisa dimuat.
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
