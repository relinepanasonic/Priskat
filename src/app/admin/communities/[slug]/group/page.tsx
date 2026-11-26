import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import CommunityGroupsClient from "@/components/community/CommunityGroupsClient";

export const dynamic = "force-dynamic";

/** Community Center → Group: sub-communities (by city or sister community) with a leader and a chat. The layout above limits this to community admins. */
export default async function CommunityGroupAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const community = await resolveCommunity(supabase, slug);
  if (!community) notFound();
  return <CommunityGroupsClient communityId={community.id} communityName={community.name ?? "Community"} />;
}
