import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">New Event</h1>
      <div className="rounded-2xl bg-white border border-stone-100 p-6">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
