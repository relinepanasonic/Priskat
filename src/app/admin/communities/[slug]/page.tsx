import { redirect } from "next/navigation";

export default async function CommunityHubIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/admin/communities/${slug}/dashboard`);
}
