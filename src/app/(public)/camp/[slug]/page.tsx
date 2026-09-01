import { redirect } from "next/navigation";

export default async function CommunitySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/camp/${slug}/crew`);
}
