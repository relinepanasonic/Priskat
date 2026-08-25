import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { Plus, Edit } from "lucide-react";
import AdminDeleteEventButton from "@/components/admin/AdminDeleteEventButton";
import type { Event } from "@/lib/types/database.types";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, event_date, location, status, capacity")
    .order("event_date", { ascending: false });

  const events = data as Pick<Event, "id" | "title" | "event_date" | "location" | "status" | "capacity">[] | null;

  const statusVariant = (s: string) =>
    s === "published" ? "green" : s === "cancelled" ? "red" : "gray";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-brand-muted">{events?.length ?? 0} total events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gold text-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-gold text-brand-dark-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Event
        </Link>
      </div>

      <div className="card-3d overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-brand-border bg-brand-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase hidden md:table-cell">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-brand-surface-hover">
                <td className="px-4 py-3">
                  <p className="font-medium text-white line-clamp-1">{event.title}</p>
                  {event.capacity && (
                    <p className="text-xs text-brand-muted">Cap: {event.capacity}</p>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-brand-muted">
                  {formatDate(event.event_date)}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-brand-muted">
                  {event.location}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(event.status) as "green" | "red" | "gray"}>
                    {event.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-bg hover:text-brand-gold transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <AdminDeleteEventButton eventId={event.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <div className="py-12 text-center text-brand-muted text-sm">
            No events yet.{" "}
            <Link href="/admin/events/new" className="text-brand-gold hover:underline">
              Create your first event.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
