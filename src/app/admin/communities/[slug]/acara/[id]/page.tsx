import EventRegAdminPage from "@/components/events/EventRegAdminPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran event" };

export default async function CommunityEventRegPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <EventRegAdminPage eventId={id} backHref={`/admin/communities/${slug}/acara`} />;
}
