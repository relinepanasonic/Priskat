"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Megaphone,
  Navigation,
  Sparkles,
  X,
} from "lucide-react";

export type ExploreEvent = {
  id: string;
  title: string;
  description: string;
  banner_image_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string;
  city: string | null;
  maps_url: string | null;
  community_id: string | null;
  news_slug: string | null;
};

export type PremiumBanner = {
  id: string;
  image_url: string;
  link_url: string | null;
  title: string | null;
};

/* ---------------------------------------------------------------- helpers --- */

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const dayNum = (iso: string) => new Date(iso).getDate();
const monthShort = (iso: string) => MONTHS[new Date(iso).getMonth()];

function countdown(startIso: string, endIso: string | null) {
  const now = new Date();
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  if (end && now >= start && now <= end) return "Now on";
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const days = Math.round((d1.getTime() - d0.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} wk`;
  return `In ${Math.round(days / 30)} mo`;
}

function fullWhen(startIso: string, endIso: string | null) {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const start = new Date(startIso);
  const time = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  let s = `${start.toLocaleDateString(undefined, opts)} · ${time}`;
  if (endIso) {
    const end = new Date(endIso);
    const sameDay = start.toDateString() === end.toDateString();
    s += sameDay
      ? ` – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : ` – ${end.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;
  }
  return s;
}

const norm = (s: string | null | undefined) =>
  (s ?? "").trim().toLowerCase();

/* ------------------------------------------------------------------- card --- */

function EventCard({
  ev,
  onOpen,
}: {
  ev: ExploreEvent;
  onOpen: (e: ExploreEvent) => void;
}) {
  return (
    <button
      onClick={() => onOpen(ev)}
      className="group w-40 flex-shrink-0 text-left sm:w-44"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[#2a2d35] bg-[#111]">
        {ev.banner_image_url ? (
          <Image
            src={ev.banner_image_url}
            alt={ev.title}
            fill
            sizes="180px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#1a1d24] to-[#0d0f14] text-brand-gold/40">
            <CalendarDays className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* date chip */}
        <div className="absolute left-2 top-2 rounded-lg bg-black/65 px-2 py-1 text-center leading-none backdrop-blur-sm">
          <p className="text-[13px] font-black text-white">
            {dayNum(ev.event_date)}
          </p>
          <p className="text-[9px] font-bold tracking-wide text-brand-gold">
            {monthShort(ev.event_date)}
          </p>
        </div>
        {/* countdown */}
        <span className="absolute bottom-2 left-2 rounded-full bg-brand-gold/90 px-2 py-0.5 text-[10px] font-bold text-brand-dark">
          {countdown(ev.event_date, ev.end_date)}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-tight text-white">
        {ev.title}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-muted">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{ev.city || ev.location}</span>
      </p>
    </button>
  );
}

function Row({
  events,
  onOpen,
}: {
  events: ExploreEvent[];
  onOpen: (e: ExploreEvent) => void;
}) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {events.map((ev) => (
        <EventCard key={ev.id} ev={ev} onOpen={onOpen} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- component --- */

export default function EventsExplore({
  events,
  banners = [],
  myCity,
  myCommunityId,
  myCommunityName,
}: {
  events: ExploreEvent[];
  banners?: PremiumBanner[];
  myCity: string | null;
  myCommunityId: string | null;
  myCommunityName: string | null;
}) {
  const [active, setActive] = useState<ExploreEvent | null>(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const { sameCity, sameCommunity, others } = useMemo(() => {
    const city = norm(myCity);
    const sc: ExploreEvent[] = [];
    const scom: ExploreEvent[] = [];
    const ot: ExploreEvent[] = [];
    for (const e of events) {
      const matchCity =
        !!city &&
        (norm(e.city) === city || norm(e.location).includes(city));
      const matchCom = !!myCommunityId && e.community_id === myCommunityId;
      if (matchCity) sc.push(e);
      else if (matchCom) scom.push(e);
      else ot.push(e);
    }
    return { sameCity: sc, sameCommunity: scom, others: ot };
  }, [events, myCity, myCommunityId]);

  // one repeating unit, then rendered twice so translateX(-50%) loops seamlessly
  const unit: (PremiumBanner | null)[] = banners.length
    ? Array.from(
        { length: Math.max(banners.length, 4) },
        (_, i) => banners[i % banners.length]
      )
    : Array.from({ length: 5 }, () => null);
  const slides = [...unit, ...unit];

  const slideCls =
    "relative aspect-[16/9] w-[78vw] flex-shrink-0 overflow-hidden rounded-2xl sm:w-[44vw] lg:w-[30vw] xl:w-[23vw]";

  return (
    <div className="p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-6 md:pb-12">
      {/* premium ad banner — infinite slow marquee, ~3 visible on desktop */}
      <div className="premium-marquee -mx-4 overflow-hidden sm:mx-0">
        <div className="premium-track flex gap-3 px-4 sm:px-0">
          {slides.map((b, i) =>
            b ? (
              <a
                key={i}
                href={b.link_url || undefined}
                target={b.link_url ? "_blank" : undefined}
                rel={b.link_url ? "noreferrer" : undefined}
                className={`${slideCls} border border-[#2a2d35] bg-[#111]`}
              >
                <Image
                  src={b.image_url}
                  alt={b.title || "Sponsored"}
                  fill
                  sizes="30vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  Sponsored
                </span>
                {b.title && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-[12px] font-semibold text-white">
                    {b.title}
                  </span>
                )}
              </a>
            ) : (
              <div
                key={i}
                className={`${slideCls} flex items-center justify-center border-2 border-dashed border-brand-gold/25 bg-gradient-to-br from-[#15181e] to-[#1a1d24]`}
              >
                <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Sponsored
                </span>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Megaphone className="h-6 w-6 text-brand-gold/60" />
                  <p className="text-sm font-bold text-brand-light">
                    Premium ad space
                  </p>
                  <p className="text-[11px] text-brand-muted">
                    Featured event placement — coming soon
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <style>{`
        .premium-track {
          width: max-content;
          animation: premiumScroll 60s linear infinite;
        }
        .premium-marquee:hover .premium-track { animation-play-state: paused; }
        @keyframes premiumScroll { to { transform: translateX(-50%); } }
      `}</style>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-brand-surface">
            <CalendarDays className="h-8 w-8 text-brand-gold" />
          </div>
          <h2 className="text-[15px] font-bold text-white">
            No upcoming events yet
          </h2>
          <p className="max-w-xs text-[13px] text-brand-muted">
            Promotions published from a community will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* upcoming — soonest first */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Upcoming</h2>
            <Row events={events} onOpen={setActive} />
          </section>

          {/* recommended for you */}
          {(sameCity.length > 0 ||
            sameCommunity.length > 0 ||
            others.length > 0) && (
            <section className="space-y-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles className="h-4 w-4 text-brand-gold" />
                Recommended for you
              </h2>

              {sameCity.length > 0 && (
                <div>
                  <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-brand-gold">
                    Same city{myCity ? ` · ${myCity}` : ""}
                  </h3>
                  <Row events={sameCity} onOpen={setActive} />
                </div>
              )}

              {sameCommunity.length > 0 && (
                <div>
                  <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-brand-gold">
                    Same community
                    {myCommunityName ? ` · ${myCommunityName}` : ""}
                  </h3>
                  <Row events={sameCommunity} onOpen={setActive} />
                </div>
              )}

              {others.length > 0 && (
                <div>
                  <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-brand-muted">
                    Others
                  </h3>
                  <Row events={others} onOpen={setActive} />
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* detail modal */}
      {active && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#2a2d35] bg-[#16181d] pb-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="relative aspect-[4/5] max-h-[55vh] w-full bg-[#111]">
                {active.banner_image_url ? (
                  <Image
                    src={active.banner_image_url}
                    alt={active.title}
                    fill
                    sizes="480px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand-gold/40">
                    <CalendarDays className="h-12 w-12" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 pt-4">
              <h1 className="text-lg font-bold text-white">{active.title}</h1>

              <div className="space-y-1.5 text-[13px]">
                <p className="flex items-center gap-2 text-brand-light">
                  <CalendarDays className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                  {fullWhen(active.event_date, active.end_date)}
                </p>
                <p className="flex items-center gap-2 text-brand-light">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                  {active.location}
                  {active.city ? ` · ${active.city}` : ""}
                </p>
              </div>

              {active.maps_url && (
                <a
                  href={active.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-2 text-[13px] font-bold text-brand-gold hover:bg-brand-gold hover:text-brand-dark"
                >
                  <Navigation className="h-4 w-4" />
                  Open in Maps
                </a>
              )}

              {active.description && (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-brand-light">
                  {active.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
