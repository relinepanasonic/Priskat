"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function daysInMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Luxury date selector for Kalender Para Kudus:
 *   - Clean Month dropdown selector
 *   - 7-day Monday–Sunday week strip (e.g. 23 Nov | 24 Nov | 25 Nov ...) with prev/next week arrows
 */
export default function SaintsDateBar({
  year,
  month,
  day,
  todayMonth,
  todayDay,
}: {
  year: number;
  month: number;
  day: number;
  todayMonth: number;
  todayDay: number;
}) {
  const router = useRouter();
  const isToday = month === todayMonth && day === todayDay;

  // Compute the Monday of the week containing (year, month, day)
  const selectedUtc = new Date(Date.UTC(year, month - 1, day));
  const dow = (selectedUtc.getUTCDay() + 6) % 7; // 0 = Mon ... 6 = Sun
  const monday = new Date(Date.UTC(year, month - 1, day - dow));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + i));
    return {
      m: d.getUTCMonth() + 1,
      d: d.getUTCDate(),
      dowLabel: DAY_SHORT[i],
    };
  });

  const prevWeek = new Date(Date.UTC(year, month - 1, day - 7));
  const nextWeek = new Date(Date.UTC(year, month - 1, day + 7));

  function onChangeMonth(newMonth: number) {
    const clampedDay = Math.min(day, daysInMonth(newMonth, year));
    router.push(`/faith/saints?m=${newMonth}&d=${clampedDay}`);
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Selected date + Month dropdown + Today shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            Kalender Para Kudus
          </p>
          <h2 className="mt-0.5 text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {day} {MONTH_NAMES[month - 1]}
            {isToday && <span className="ml-2 text-xs font-sans font-semibold text-brand-gold">(Hari ini)</span>}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <Link
              href="/faith/saints"
              className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold/20"
            >
              Hari ini
            </Link>
          )}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-gold" />
            <select
              aria-label="Pilih bulan"
              value={month}
              onChange={(e) => onChangeMonth(Number(e.target.value))}
              className="appearance-none rounded-xl border border-white/15 bg-[#1a1d24] py-2 pl-8 pr-8 text-xs font-semibold text-white transition hover:border-brand-gold/50 focus:border-brand-gold focus:outline-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-[#1a1d24] text-white">
                  {name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Mon – Sun 7-day week bar (23 Nov | 24 Nov | 25 Nov ...) */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#14171c] p-1.5">
        <Link
          href={`/faith/saints?m=${prevWeek.getUTCMonth() + 1}&d=${prevWeek.getUTCDate()}`}
          aria-label="Minggu sebelumnya"
          className="flex h-12 w-7 shrink-0 items-center justify-center rounded-xl text-brand-muted transition hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="grid flex-1 grid-cols-7 gap-1">
          {weekDays.map((wd) => {
            const active = wd.m === month && wd.d === day;
            const isTodayCell = wd.m === todayMonth && wd.d === todayDay;
            return (
              <Link
                key={`${wd.m}-${wd.d}`}
                href={`/faith/saints?m=${wd.m}&d=${wd.d}`}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 text-center transition ${
                  active
                    ? "bg-brand-gold text-brand-dark shadow-md shadow-brand-gold/25"
                    : "text-brand-light hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? "text-brand-dark/75" : "text-brand-muted"}`}>
                  {wd.dowLabel}
                </span>
                <span className="mt-0.5 text-[11px] font-bold leading-tight sm:text-xs">
                  {wd.d} {MONTH_SHORT[wd.m - 1]}
                </span>
                {isTodayCell && !active && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-brand-gold" />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href={`/faith/saints?m=${nextWeek.getUTCMonth() + 1}&d=${nextWeek.getUTCDate()}`}
          aria-label="Minggu berikutnya"
          className="flex h-12 w-7 shrink-0 items-center justify-center rounded-xl text-brand-muted transition hover:bg-white/5 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
