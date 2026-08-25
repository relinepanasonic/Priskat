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
          <h1 className="text-2xl font-bold text-stone-900">Events</h1>
          <p className="text-sm text-stone-500">{events?.length ?? 0} total events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Event
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-stone-100 bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase hidden md:table-cell">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-900 line-clamp-1">{event.title}</p>
                  {event.capacity && (
                    <p className="text-xs text-stone-400">Cap: {event.capacity}</p>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-stone-500">
                  {formatDate(event.event_date)}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-stone-500">
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
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-brand-blue-50 hover:text-brand-blue transition-colors"
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
          <div className="py-12 text-center text-stone-400 text-sm">
            No events yet.{" "}
            <Link href="/admin/events/new" className="text-brand-blue hover:underline">
              Create your first event.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
