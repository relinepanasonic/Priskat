import { redirect } from "next/navigation";

// "Event" became "Promotion"; keep old links working
export default async function OldEventAddress({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/admin/communities/${slug}/promotion`);
}
