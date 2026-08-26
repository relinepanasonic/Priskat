import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import AdminMemberEditDialog from "@/components/admin/AdminMemberEditDialog";
import type { UserRole, Profile, UserGender } from "@/lib/types/database.types";

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role, gender, completed_modules, created_at")
    .order("created_at", { ascending: false });

  const members = data as Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "role" | "gender" | "completed_modules" | "created_at">[] | null;

  const roleVariant = (role: UserRole) =>
    role === "admin" ? "gold" : role === "moderator" ? "blue" : "gray";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <p className="text-sm text-brand-muted">{members?.length ?? 0} total members</p>
      </div>

      <div className="card-3d overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-brand-border bg-brand-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Member</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase hidden md:table-cell">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Role</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {members?.map((member) => (
              <tr key={member.id} className="hover:bg-brand-surface-hover">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      <Image src={member.avatar_url} alt={member.full_name} width={32} height={32} className="rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-gold text-xs font-semibold">
                        {member.full_name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{member.full_name}</p>
                      <p className="text-xs text-brand-muted">@{member.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-brand-muted">
                  {formatDate(member.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={roleVariant(member.role)}>{member.role}</Badge>
                </td>
                <td className="px-4 py-3 flex justify-end">
                  <AdminMemberEditDialog member={member} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
