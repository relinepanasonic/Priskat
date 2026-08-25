import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import RSVPButton from "@/components/events/RSVPButton";
import LiveRSVPCount from "@/components/events/LiveRSVPCount";
import AttendeeList from "@/components/events/AttendeeList";
import type { Metadata } from "next";
import type { Event, EventRSVP, Profile } from "@/lib/types/database.types";

export const revalidate = 30;

interface Props {
  params: Promise<{ id: string }>;
}

type RsvpWithProfile = EventRSVP & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url" | "username"> | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", id)
    .single();
  const row = data as Pick<Event, "title" | "description"> | null;
  return { title: row?.title ?? "Event", description: row?.description?.slice(0, 160) };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: eventData }, { data: { user } }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).eq("status", "published").single(),
    supabase.auth.getUser(),
  ]);

  const event = eventData as Event | null;
  if (!event) notFound();

  const { data: rsvpData } = await supabase
    .from("event_rsvps")
    .select("id, event_id, user_id, status, created_at, profiles(id, full_name, avatar_url, username)")
    .eq("event_id", id)
    .in("status", ["going", "waitlist"]);

  const rsvps = (rsvpData ?? []) as unknown as RsvpWithProfile[];
  const goingCount = rsvps.filter((r) => r.status === "going").length;
  const userRsvp = user ? (rsvps.find((r) => r.user_id === user.id) ?? null) : null;
  const attendees = rsvps
    .filter((r) => r.status === "going" && r.profiles)
    .map((r) => r.profiles as Pick<Profile, "id" | "full_name" | "avatar_url" | "username">);

  const isFull = event.capacity !== null && goingCount >= event.capacity;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-blue transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {event.banner_image_url && (
        <div className="relative mb-6 h-72 w-full overflow-hidden rounded-2xl sm:h-96">
          <Image src={event.banner_image_url} alt={event.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{event.title}</h1>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-brand-gold font-medium">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(event.event_date)}</span>
              {event.end_date && (
                <span className="text-stone-400">→ {formatDateTime(event.end_date)}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <Users className="h-4 w-4" />
              <LiveRSVPCount eventId={id} initialCount={goingCount} />
              {event.capacity ? ` / ${event.capacity} going` : " going"}
              {isFull && (
                <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  Full
                </span>
              )}
            </div>
          </div>

          <p className="mt-6 text-stone-700 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
            <RSVPButton
              eventId={id}
              initialStatus={userRsvp?.status ?? null}
              isFull={isFull}
              userId={user?.id ?? null}
            />
          </div>
          <AttendeeList attendees={attendees} />
        </div>
      </div>
    </article>
  );
}
