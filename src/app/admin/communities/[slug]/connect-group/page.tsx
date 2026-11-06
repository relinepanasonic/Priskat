import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import ConnectGroupsClient from "@/components/community/ConnectGroupsClient";

export const dynamic = "force-dynamic";

/** Community Center → Connect Group. The layout above already limits this to community admins. */
export default async function ConnectGroupAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const community = await resolveCommunity(supabase, slug);
  if (!community) notFound();
  return <ConnectGroupsClient communityId={community.id} communityName={community.name ?? "Komunitas"} isAdmin />;
}
