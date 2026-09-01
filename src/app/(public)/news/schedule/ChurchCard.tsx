import Link from "next/link";
import { MapPin, Clock, ArrowRight, Church } from "lucide-react";

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

/** A short kind label derived from the church name. */
export function kindLabel(name: string, isId = true) {
  const n = name.toLowerCase();
  if (n.includes("katedral") || n.includes("cathedral"))
    return isId ? "Katedral" : "Cathedral";
  if (n.startsWith("kapel") || n.startsWith("chapel"))
    return isId ? "Kapel" : "Chapel";
  if (n.startsWith("stasi")) return "Stasi";
  if (n.startsWith("paroki") || n.startsWith("kuasi paroki")) return "Paroki";
  if (n.startsWith("pertapaan") || n.startsWith("biara"))
    return isId ? "Biara" : "Monastery";
  return isId ? "Gereja" : "Church";
}

export default function ChurchCard({
  church,
  showRegion = false,
  lang = "id",
}: {
  church: MassChurch;
  showRegion?: boolean;
  lang?: "id" | "en";
}) {
  const isId = lang !== "en";
  const preview = previewSchedule(church);
  const href = `/news/schedule/${church.province_slug}/${church.regency_slug}/${church.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-glow-gold"
    >
      {/* gold hairline + faint watermark */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      <Church className="pointer-events-none absolute -right-5 -top-6 h-28 w-28 text-white/[0.03] transition-colors group-hover:text-brand-gold/[0.06]" />

      {/* letterhead */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-gold/25 bg-brand-gold/10 text-brand-gold">
          <Church className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold/70">
            {kindLabel(church.name, isId)}
          </p>
          <h3 className="mt-0.5 line-clamp-2 font-serif text-[15px] font-bold leading-snug text-brand-light transition-colors group-hover:text-white">
            {church.name}
          </h3>
        </div>
        {church.time_zone && (
          <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-brand-muted">
            {church.time_zone}
          </span>
        )}
      </div>

      {showRegion && (
        <p className="-mt-1 mb-1 px-4 text-[11px] font-medium text-brand-gold/75">
          {church.regency_name}, {church.province_name}
        </p>
      )}

      {church.address && (
        <p className="mx-4 mb-3 line-clamp-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-brand-muted/90">
          <MapPin className="mt-px h-3 w-3 shrink-0 text-brand-muted" />
          <span>{church.address}</span>
        </p>
      )}

      {/* schedule preview */}
      {preview && (
        <div className="mt-auto border-t border-white/[0.06] bg-black/20 px-4 py-3">
          <p className="mb-1.5 line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            {preview.title}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.times.slice(0, 4).map((t, i) => (
              <span
                key={i}
                className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-brand-gold/20 bg-brand-gold/[0.07] px-2 py-0.5 font-mono text-[11px] text-brand-light"
              >
                <Clock className="h-2.5 w-2.5 shrink-0 text-brand-gold" />
                {t}
              </span>
            ))}
            {preview.times.length > 4 && (
              <span className="self-center text-[11px] text-brand-muted">
                +{preview.times.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      <span className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-brand-gold">
        {isId ? "Lihat jadwal lengkap" : "View full schedule"}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
