import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";
import CommunityHubTabs from "@/components/admin/CommunityHubTabs";

export const dynamic = "force-dynamic";

/** Community Center for ONE community: members, camps, events, structure, coverage (and Romo for Catholic Indonesia). */
export default async function CommunityHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await resolveCommunity(supabase, slug);
  if (!community) notFound();

  // Global admins, or admins of this community
  const [{ data: prof }, { data: ca }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("community_admins").select("id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle(),
  ]);
  const globalAdmin = ["founder", "superadmin", "admin", "moderator"].includes(String(prof?.role ?? "").toLowerCase());
  if (!globalAdmin && !ca) redirect("/admin/communities");

  const showRomo = isCatholicIndonesia(community.name, community.slug);
  const publicSlug = community.slug || community.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/communities" className="flex items-center gap-1 text-sm text-brand-muted transition-colors hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Semua komunitas
          </Link>
          <span className="text-[#333]">|</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Community Center</p>
            <h1 className="text-xl font-bold text-white">{community.name}</h1>
          </div>
        </div>
        <Link
          href={`/camp/${publicSlug}`}
          className="flex items-center gap-1.5 rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-semibold text-brand-gold hover:bg-brand-gold/10"
        >
          Lihat halaman komunitas <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CommunityHubTabs slug={publicSlug} showRomo={showRomo} />

      <div className="overflow-hidden rounded-2xl border border-[#333] bg-[#1a1d24]">{children}</div>
    </div>
  );
}
