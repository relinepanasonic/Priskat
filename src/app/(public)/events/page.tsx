import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { Suspense } from "react";
import type { Event } from "@/lib/types/database.types";

export const revalidate = 60;

const PAGE_SIZE = 9;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .gte("event_date", new Date(Date.now() - 86400000).toISOString())
    .order("event_date", { ascending: true })
    .range(from, to);

  const events = data as Event[] | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-gold">Events</h1>
        <p className="mt-1 text-brand-muted">Upcoming events from PriskatCFM</p>
      </div>

      {events && events.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-brand-border bg-brand-surface shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative h-48 bg-brand-bg flex-shrink-0">
                  {event.banner_image_url ? (
                    <Image
                      src={event.banner_image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Calendar className="h-12 w-12 text-brand-gold-200" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-semibold text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-brand-gold font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(event.event_date, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                    {event.capacity && (
                      <div className="flex items-center gap-2 text-sm text-brand-muted">
                        <Users className="h-3.5 w-3.5" />
                        Capacity: {event.capacity}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Suspense>
            <Pagination currentPage={page} totalCount={count ?? 0} pageSize={PAGE_SIZE} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="h-12 w-12 text-brand-muted mb-3" />
          <p className="text-brand-muted">No upcoming events.</p>
        </div>
      )}
    </div>
  );
}
