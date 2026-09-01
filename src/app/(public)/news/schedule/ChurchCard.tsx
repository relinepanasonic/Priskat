import Link from "next/link";
import { MapPin, Clock, ChevronRight } from "lucide-react";

export type MassChurch = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  maps_url: string | null;
  image_url: string | null;
  time_zone: string | null;
  province_slug: string;
  province_name: string;
  regency_slug: string;
  regency_name: string;
  schedules: { title: string; times: string[]; is_special?: boolean }[];
  special_schedules: { title: string; date: string | null; times: string[] }[];
  source_url: string | null;
  synced_at?: string;
};

/** Pick the most useful schedule row to preview on a card (prefer Sunday). */
function previewSchedule(church: MassChurch) {
  const s = church.schedules || [];
  return (
    s.find((x) => /minggu/i.test(x.title)) ||
    s.find((x) => /sabtu/i.test(x.title)) ||
    s[0] ||
    null
  );
}

export default function ChurchCard({
  church,
  showRegion = false,
}: {
  church: MassChurch;
  showRegion?: boolean;
}) {
  const preview = previewSchedule(church);
  const href = `/news/schedule/${church.province_slug}/${church.regency_slug}/${church.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-brand-bg border border-[#333] rounded-2xl overflow-hidden hover:border-brand-gold/40 hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-32 w-full bg-[#111] shrink-0">
        {church.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={church.image_url}
            alt={church.name}
            loading="lazy"
            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-brand-muted text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-transparent" />
        {church.time_zone && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-brand-light border border-[#444]">
            {church.time_zone}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-white leading-tight group-hover:text-brand-gold transition-colors">
          {church.name}
        </h3>

        {showRegion && (
          <p className="text-[11px] text-brand-gold/80 mt-1">
            {church.regency_name}, {church.province_name}
          </p>
        )}

        {church.address && (
          <p className="text-[11px] text-brand-muted mt-1.5 flex items-start gap-1 line-clamp-2">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
            <span>{church.address}</span>
          </p>
        )}

        {preview && (
          <div className="mt-3 pt-3 border-t border-[#2a2d35]">
            <p className="text-[10px] uppercase tracking-wider text-brand-muted mb-1.5">
              {preview.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {preview.times.slice(0, 5).map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-[#222] px-2 py-0.5 rounded-md text-[11px] font-mono text-brand-light border border-[#3a3d45]"
                >
                  <Clock className="h-2.5 w-2.5 text-brand-gold" />
                  {t}
                </span>
              ))}
              {preview.times.length > 5 && (
                <span className="text-[11px] text-brand-muted self-center">
                  +{preview.times.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-gold">
          Lihat jadwal lengkap
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
