import EventRegAdminPage from "@/components/events/EventRegAdminPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran event" };

export default async function EventRegPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventRegAdminPage eventId={id} backHref="/admin/events" />;
}
