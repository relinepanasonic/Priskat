import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

export default async function CommunitySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await resolveCommunity(await createClient(), slug);
  redirect(isCatholicIndonesia(community?.name, community?.slug ?? slug) ? `/camp/${slug}/tentang` : `/camp/${slug}/crew`);
}
