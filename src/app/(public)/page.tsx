import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { ArrowRight, Calendar, Users, Newspaper } from "lucide-react";
import type { NewsPost, Event } from "@/lib/types/database.types";

export const revalidate = 60; // ISR: revalidate every minute

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: postsData }, { data: eventsData }] = await Promise.all([
    supabase
      .from("news_posts")
      .select("id, title, slug, cover_image_url, category, published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("events")
      .select("id, title, event_date, location, banner_image_url")
      .eq("status", "published")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3),
  ]);

  const posts = postsData as Pick<NewsPost, "id" | "title" | "slug" | "cover_image_url" | "category" | "published_at">[] | null;
  const events = eventsData as Pick<Event, "id" | "title" | "event_date" | "location" | "banner_image_url">[] | null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-blue-700 to-brand-blue py-20 px-4 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
            Welcome to{" "}
            <span className="text-brand-gold">PriskatCFM</span>
          </h1>
          <p className="mt-6 text-lg text-brand-blue-100 max-w-2xl mx-auto">
            A community platform for Priskat CFM — stay updated on news, join
            events, and connect with fellow members.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/news"
              className="rounded-lg bg-brand-gold px-6 py-3 font-semibold text-white hover:bg-brand-gold-500 transition-colors"
            >
              Read Latest News
            </Link>
            <Link
              href="/events"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-brand-gold" />
              <span>Community News</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-gold" />
              <span>Upcoming Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-gold" />
              <span>Member Directory</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Latest News */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-blue">Latest News</h2>
            <Link
              href="/news"
              className="flex items-center gap-1 text-sm font-medium text-brand-gold hover:text-brand-gold-500 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 bg-brand-blue-50">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Newspaper className="h-12 w-12 text-brand-blue-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="blue" className="mb-2">
                      {post.category}
                    </Badge>
                    <h3 className="font-semibold text-stone-900 group-hover:text-brand-blue transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-xs text-stone-400">
                      {post.published_at
                        ? formatDate(post.published_at)
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">
              No news published yet.
            </p>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-blue">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm font-medium text-brand-gold hover:text-brand-gold-500 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex gap-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {event.banner_image_url ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={event.banner_image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-brand-blue-50">
                      <Calendar className="h-7 w-7 text-brand-blue" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stone-900 group-hover:text-brand-blue transition-colors truncate">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-brand-gold font-medium">
                      {formatDate(event.event_date)}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {event.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">
              No upcoming events.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
