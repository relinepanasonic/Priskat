import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import type { Event } from "@/lib/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  const event = data as Event | null;
  if (!event) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Event</h1>
      <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
        <EventForm
          mode="edit"
          initialValues={{
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            event_date: event.event_date,
            end_date: event.end_date ?? undefined,
            capacity: event.capacity ? String(event.capacity) : undefined,
            status: event.status,
            banner_image_url: event.banner_image_url,
          }}
        />
      </div>
    </div>
  );
}
