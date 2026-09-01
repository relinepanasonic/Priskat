import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Clock,
  CalendarDays,
  ExternalLink,
  Church,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import { kindLabel, type MassChurch } from "../../../ChurchCard";

export const revalidate = 3600;

function TimeChips({ times, gold }: { times: string[]; gold?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {times.map((t, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs ${
            gold
              ? "border border-brand-gold/30 bg-brand-gold/10 text-brand-light"
              : "border border-white/10 bg-white/[0.04] text-brand-light"
          }`}
        >
          <Clock className="h-3 w-3 shrink-0 text-brand-gold" />
          {t}
        </span>
      ))}
    </div>
  );
}

export default async function ChurchDetailPage({
  params,
}: {
  params: Promise<{ province: string; regency: string; church: string }>;
}) {
  const { province, regency, church: churchSlug } = await params;
  const supabase = await createClient();
  const lang = await getLanguage();
  const isId = lang !== "en";

  const { data } = await supabase
    .from("mass_churches")
    .select("*")
    .eq("province_slug", province)
    .eq("regency_slug", regency)
    .eq("slug", churchSlug)
    .maybeSingle();

  const church = data as MassChurch | null;
  if (!church) notFound();

  const regular = church.schedules || [];
  const special = church.special_schedules || [];

  return (
    <div>
      {/* ── Hero banner (no photo, pure typographic) ── */}
      <div className="relative overflow-hidden border-b border-brand-border bg-gradient-to-br from-[#31353d] via-[#24272d] to-[#1b1d22] px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(214,176,114,0.22),transparent_60%)]" />
        <Church className="pointer-events-none absolute -bottom-10 right-2 h-48 w-48 text-white/[0.035]" />

        <nav className="relative mb-6 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-muted">
          <Link href="/news/schedule" className="transition-colors hover:text-brand-gold">
            {isId ? "Jadwal Misa" : "Mass Schedule"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{church.province_name}</span>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/news/schedule/${province}/${regency}`}
            className="transition-colors hover:text-brand-gold"
          >
            {church.regency_name}
          </Link>
        </nav>

        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
              {kindLabel(church.name, isId)}
            </span>
            {church.time_zone && (
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-brand-muted">
                {church.time_zone}
              </span>
            )}
          </div>
          <h1 className="max-w-2xl font-serif text-xl font-bold leading-tight text-white md:text-3xl">
            {church.name}
          </h1>
          <p className="mt-1.5 text-xs text-brand-muted">
            {church.regency_name}, {church.province_name}
          </p>
        </div>
      </div>

      <div className="space-y-7 px-5 py-7 md:px-8">
        {/* Address + map */}
        {church.address && (
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-light/90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
              <span>{church.address}</span>
            </p>
            {church.maps_url && (
              <a
                href={church.maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-gold-hover"
              >
                <MapPin className="h-3.5 w-3.5" />
                {isId ? "Buka Peta" : "Open Map"}
              </a>
            )}
          </div>
        )}

        {/* Regular schedule */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-serif text-base font-bold text-brand-gold">
            <Clock className="h-4 w-4" />
            {isId ? "Jadwal Misa Reguler" : "Regular Mass Schedule"}
          </h2>
          {regular.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429] divide-y divide-white/[0.06]">
              {regular.map((s, i) => (
                <div key={i} className="relative p-4 pl-5">
                  <span className="absolute left-0 top-4 h-6 w-[3px] rounded-r bg-brand-gold/70" />
                  <p className="mb-2 font-serif text-sm font-semibold text-white">
                    {s.title}
                  </p>
                  <TimeChips times={s.times} />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-brand-border bg-brand-bg/40 p-4 text-xs italic text-brand-muted">
              {isId
                ? "Jadwal reguler belum tersedia untuk gereja ini."
                : "No regular schedule listed for this church yet."}
            </p>
          )}
        </section>

        {/* Special / liturgical */}
        {special.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-serif text-base font-bold text-brand-gold">
              <CalendarDays className="h-4 w-4" />
              {isId
                ? "Jadwal Misa Khusus & Hari Raya"
                : "Special & Feast-Day Masses"}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-brand-gold/15 bg-[radial-gradient(ellipse_at_top,rgba(214,176,114,0.07),transparent_70%)] divide-y divide-white/[0.06]">
              {special.map((s, i) => (
                <div key={i} className="p-4">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="font-serif text-sm font-semibold text-white">
                      {s.title}
                    </p>
                    {s.date && (
                      <span className="shrink-0 text-[11px] text-brand-muted">
                        {s.date}
                      </span>
                    )}
                  </div>
                  <TimeChips times={s.times} gold />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Attribution */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-4 text-[10px] text-brand-muted">
          <span>
            {isId ? "Terakhir disinkron " : "Last synced "}
            {new Date(church.synced_at as any).toLocaleDateString(
              isId ? "id-ID" : "en-US",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </span>
          {church.source_url && (
            <a
              href={church.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-gold/70 underline transition-colors hover:text-brand-gold"
            >
              {isId ? "Sumber: jadwalmisa.id" : "Source: jadwalmisa.id"}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
