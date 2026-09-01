import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Clock, Calendar, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import type { MassChurch } from "../../../ChurchCard";

export const revalidate = 3600;

function TimeChips({ times }: { times: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {times.map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 bg-[#222] px-2.5 py-1 rounded-md text-xs font-mono text-brand-light border border-[#3a3d45]"
        >
          <Clock className="h-3 w-3 text-brand-gold" />
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
      {/* Hero */}
      <div className="relative h-48 md:h-60 w-full bg-[#111]">
        {church.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={church.image_url}
            alt={church.name}
            className="h-full w-full object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] via-[#1a1d24]/40 to-transparent" />

        <Link
          href={`/news/schedule/${province}/${regency}`}
          className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {church.regency_name}
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <p className="text-xs text-brand-gold font-medium">
            {church.regency_name}, {church.province_name}
          </p>
          <h1 className="text-lg md:text-2xl font-bold text-white leading-tight mt-0.5">
            {church.name}
          </h1>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Address + map */}
        {church.address && (
          <div className="flex items-start justify-between gap-4 bg-brand-bg border border-[#333] rounded-xl p-4">
            <p className="text-xs text-brand-muted flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-gold" />
              <span>{church.address}</span>
            </p>
            {church.maps_url && (
              <a
                href={church.maps_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark bg-brand-gold px-3 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                {isId ? "Peta" : "Map"}
              </a>
            )}
          </div>
        )}

        {/* Regular schedule */}
        <div>
          <h2 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isId ? "Jadwal Misa Reguler" : "Regular Mass Schedule"}
          </h2>
          {regular.length > 0 ? (
            <div className="space-y-2.5">
              {regular.map((s, i) => (
                <div
                  key={i}
                  className="bg-brand-bg border border-[#333] rounded-xl p-3.5"
                >
                  <p className="text-sm font-semibold text-white mb-2">{s.title}</p>
                  <TimeChips times={s.times} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-muted italic">
              {isId ? "Belum ada jadwal reguler." : "No regular schedule listed."}
            </p>
          )}
        </div>

        {/* Special / liturgical schedule */}
        {special.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isId ? "Jadwal Misa Khusus & Hari Raya" : "Special & Feast Day Masses"}
            </h2>
            <div className="space-y-2.5">
              {special.map((s, i) => (
                <div
                  key={i}
                  className="bg-brand-bg border border-[#333] rounded-xl p-3.5"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    {s.date && (
                      <span className="text-[11px] text-brand-muted shrink-0">
                        {s.date}
                      </span>
                    )}
                  </div>
                  <TimeChips times={s.times} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="pt-4 border-t border-[#333] flex flex-wrap items-center justify-between gap-2 text-[10px] text-brand-muted">
          <span>
            {isId ? "Terakhir disinkron: " : "Last synced: "}
            {new Date(church.synced_at as any).toLocaleDateString("id-ID")}
          </span>
          {church.source_url && (
            <a
              href={church.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-gold/70 hover:text-brand-gold underline"
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
