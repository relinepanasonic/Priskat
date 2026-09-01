import { redirect } from "next/navigation";

export default function CommunitySlugPage({ params }: { params: { slug: string } }) {
  redirect(`/camp/${params.slug}/crew`);
}
