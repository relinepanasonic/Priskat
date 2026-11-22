import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadCommunityMembers } from "@/lib/memberCounts";
import { resolveCommunity, sortCommunities } from "@/lib/community";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import AdminMemberEditDialog from "@/components/admin/AdminMemberEditDialog";
import AdminMemberDeleteButton from "@/components/admin/AdminMemberDeleteButton";
import JoinRequestsPanel, { type JoinRequestRow } from "@/components/admin/JoinRequestsPanel";
import InviteUserButton from "@/components/admin/InviteUserButton";
import AddMemberButton from "@/components/admin/AddMemberButton";
import { botIdSet } from "@/lib/botIds";
import type { UserRole } from "@/lib/types/database.types";

export const dynamic = "force-dynamic";

const roleVariant = (role: string) =>
  role === "founder" || role === "superadmin" || role === "admin" ? "gold" : role === "moderator" ? "blue" : "gray";

export default async function CommunityMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/admin/communities");

  const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const callerRole = (caller?.role ?? "member") as UserRole;
  // Editing and deleting members changes accounts, so it stays with admin, superadmin and founder
  const canManage = ["founder", "superadmin", "admin"].includes(String(callerRole));

  // Catholic Indonesia is everyone's community; other communities list their own members
  const everyone = isCatholicIndonesia(community.name, community.slug);
  const [data, { data: communityRows }] = await Promise.all([
    loadCommunityMembers(supabase, community, "id, username, full_name, avatar_url, role, gender, completed_modules, created_at, camp_history, community_id, community:communities!community_id(id, name, slug)"),
    supabase.from("communities").select("id, name").order("name"),
  ]);
  const communities = sortCommunities(communityRows);

  // People asking to join this community (needs the 086 SQL; empty until then)
  let joinRequests: JoinRequestRow[] = [];
  if (!everyone) {
    const { data: reqs } = await supabase
      .from("community_join_requests")
      .select("id, created_at, answers, profile:profiles!community_join_requests_user_id_fkey(full_name, username, avatar_url)")
      .eq("community_id", community.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    joinRequests = ((reqs as any[]) ?? []) as JoinRequestRow[];
  }
  // Bots are not community members
  const botSet = await botIdSet(supabase);
  const members = (data as any[]).filter((m) => !botSet.has(m.id));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Anggota</h2>
          <p className="text-sm text-brand-muted">
            {members.length} anggota{everyone ? " (seluruh member Ruang Iman)" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Catholic Indonesia already has everyone; for the others, pick from all users. Invite is for people without an account. */}
          {!everyone && <AddMemberButton communityId={community.id} communityName={community.name ?? "komunitas"} memberIds={members.map((m: any) => m.id)} />}
          <InviteUserButton />
        </div>
      </div>

      <JoinRequestsPanel requests={joinRequests} />

      {!canManage && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Mengubah dan menghapus anggota hanya bisa dilakukan oleh admin atau superadmin.
        </p>
      )}

      <div className="hidden overflow-x-auto rounded-xl border border-[#333] md:block">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-brand-border bg-brand-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-muted">Anggota</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-muted">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-muted">Komunitas</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-brand-muted md:table-cell">Bergabung</th>
              {canManage && <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-brand-muted">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d35]">
            {members.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-sm text-brand-muted">Belum ada anggota.</td></tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-brand-surface-hover">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {m.avatar_url ? (
                      <Image src={m.avatar_url} alt={m.full_name || ""} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg text-xs font-semibold text-brand-gold">{m.full_name?.[0] || "?"}</div>
                    )}
                    <div>
                      <p className="font-medium text-white">{m.full_name}</p>
                      <p className="text-xs text-brand-muted">@{m.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={roleVariant(m.role)}>{m.role}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-300">{m.role === "founder" ? "Semua" : m.community?.name || "-"}</td>
                <td className="hidden px-4 py-3 text-sm text-brand-muted md:table-cell">{formatDate(m.created_at)}</td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <AdminMemberEditDialog member={m} callerRole={callerRole} communities={communities || []} />
                      <AdminMemberDeleteButton memberId={m.id} memberName={m.full_name || m.username || "User"} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: one card per person instead of a table that has to be scrolled sideways */}
      <div className="space-y-2.5 md:hidden">
        {members.length === 0 && <p className="rounded-xl border border-[#333] py-10 text-center text-sm text-brand-muted">Belum ada anggota.</p>}
        {members.map((m) => (
          <div key={m.id} className="rounded-2xl border border-[#333] bg-[#1a1d24] p-3.5">
            <div className="flex items-center gap-3">
              {m.avatar_url ? (
                <Image src={m.avatar_url} alt={m.full_name || ""} width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-bg text-sm font-semibold text-brand-gold">{m.full_name?.[0] || "?"}</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{m.full_name}</p>
                <p className="truncate text-xs text-brand-muted">@{m.username}</p>
              </div>
              <Badge variant={roleVariant(m.role)}>{m.role}</Badge>
            </div>
            <p className="mt-2 text-xs text-brand-muted">{m.role === "founder" ? "Semua komunitas" : m.community?.name || "-"} · Bergabung {formatDate(m.created_at)}</p>
            {canManage && (
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#2a2d35] pt-3">
                <AdminMemberEditDialog member={m} callerRole={callerRole} communities={communities || []} />
                <AdminMemberDeleteButton memberId={m.id} memberName={m.full_name || m.username || "User"} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
