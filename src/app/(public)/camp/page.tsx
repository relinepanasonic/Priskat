import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Lock, Globe, ArrowRight, Settings } from "lucide-react";
import { sortCommunities } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";
import JoinCommunityButton from "@/components/community/JoinCommunityButton";
import { MemberCountSafe } from "@/lib/memberCounts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community" };

export default async function CommunityListingPage() {
  const supabase = await createClient();

  const { data: communityRows } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: true });
  const communities = sortCommunities(communityRows);
  // Everyone in Ruang Iman is a Catholic Indonesia member; other communities count their own members
  const memberCounts = await MemberCountSafe(supabase, communities);

  const { data: { user } } = await supabase.auth.getUser();
  let myCommunityId = null;
  let isSuperAdmin = false;
  let myAdminCommunityIds: string[] = [];
  const pendingIds = new Set<string>();
  const memberIds = new Set<string>();

  if (user) {
    const { data: prof } = await supabase.from("profiles").select("community_id, role").eq("id", user.id).single();
    if (prof) {
      myCommunityId = prof.community_id;
      isSuperAdmin = ["founder", "superadmin"].includes(prof.role || "");
    }
    const { data: admins } = await supabase.from("community_admins").select("community_id").eq("user_id", user.id);
    if (admins) {
      myAdminCommunityIds = admins.map((a: any) => a.community_id);
    }
    const { data: reqs } = await supabase.from("community_join_requests").select("community_id").eq("user_id", user.id).eq("status", "pending");
    for (const r of (reqs as { community_id: string }[]) ?? []) pendingIds.add(r.community_id);
    const { data: mems } = await supabase.from("community_memberships" as any).select("community_id").eq("user_id", user.id);
    for (const m of (mems as { community_id: string }[]) ?? []) memberIds.add(m.community_id);
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Community</h1>
          <p className="text-brand-muted mt-1 text-sm">Pilih komunitas yang ingin kamu masuki</p>
        </div>
        {/* Phones have no sidebar, so admins get the Community Center here */}
        {(isSuperAdmin || myAdminCommunityIds.length > 0) && (
          <Link
            href="/admin/communities"
            className="md:hidden flex shrink-0 items-center gap-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold active:scale-95"
          >
            <Settings className="h-4 w-4" />
            Community Center
          </Link>
        )}
      </div>

      {/* Phone: 2 cards across, ~2.5 rows per screen */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {(communities || []).map((c: any) => {
          const hasAccess = c.is_public || isSuperAdmin || myCommunityId === c.id || memberIds.has(c.id) || myAdminCommunityIds.includes(c.id);
          const isMember = myCommunityId === c.id || memberIds.has(c.id) || isCatholicIndonesia(c.name, c.slug);
          const pending = pendingIds.has(c.id);
          // join_mode exists once the 086 SQL has been run
          const joinable = !!user && !isMember && "join_mode" in c && c.join_mode !== "closed";
          const cardStyle = { minHeight: "min(26vh, 230px)" };

          const head = (
            <>
              <div className="mb-2 flex items-start justify-between gap-1">
                {c.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo_url} alt={c.name} className="h-10 w-10 rounded-xl object-cover md:h-14 md:w-14" loading="lazy" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 md:h-14 md:w-14">
                    <Users className="h-5 w-5 text-brand-gold md:h-7 md:w-7" />
                  </div>
                )}
                <span className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold md:px-2.5 md:py-1 md:text-[11px] ${
                  c.is_public
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                }`}>
                  {c.is_public ? <Globe className="h-2.5 w-2.5 md:h-3 md:w-3" /> : <Lock className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                  {c.is_public ? "Public" : "Private"}
                </span>
              </div>

              <h3 className={`line-clamp-2 text-sm font-bold leading-tight text-white transition-colors md:text-xl ${hasAccess ? "group-hover:text-brand-gold" : ""}`}>
                {c.name}
              </h3>
              {(c.tagline || c.motto) && <p className="mt-0.5 line-clamp-2 text-[10px] italic leading-snug text-brand-gold/80 md:text-xs">{c.tagline || c.motto}</p>}
              {c.description && <p className="mt-1 hidden line-clamp-2 text-sm text-brand-muted md:block">{c.description}</p>}
            </>
          );

          return (
            <div
              key={c.id}
              style={cardStyle}
              className={`group flex flex-col rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-3 shadow-lg transition-all md:p-5 ${
                hasAccess ? "hover:border-brand-gold/50 hover:bg-[#1e2129]" : "opacity-90"
              }`}
            >
              {hasAccess ? (
                <Link href={`/camp/${c.slug || c.id}`} className="block flex-1">{head}</Link>
              ) : (
                <div className="flex-1">{head}</div>
              )}

              <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#2a2d35] pt-2 md:pt-4">
                <span className="flex items-center gap-1 text-[11px] text-gray-400 md:text-sm">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  {memberCounts[c.id] ?? c.member_count}
                </span>
                {joinable ? (
                  <JoinCommunityButton
                    community={{ id: c.id, name: c.name, join_mode: c.join_mode, join_fields: c.join_fields }}
                    status={pending ? "pending" : "none"}
                  />
                ) : hasAccess ? (
                  <Link href={`/camp/${c.slug || c.id}`} className="flex items-center gap-1 text-xs font-bold text-brand-gold md:text-sm">
                    Enter <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 md:text-sm"><Lock className="h-3 w-3" /> Private</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!communities || communities.length === 0) && (
        <div className="text-center text-brand-muted py-16">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No communities available yet.</p>
        </div>
      )}
    </div>
  );
}
