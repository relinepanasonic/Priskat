import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">New Event</h1>
      <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
