import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import GroupClient from "./GroupClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Group" };

const ROOM_ADMIN_ROLES = ["founder", "superadmin"];

export default async function GroupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang = await getLanguage();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  const me = {
    id: profileRow?.id ?? user.id,
    full_name:
      profileRow?.full_name ??
      ((user.user_metadata?.full_name as string) || user.email || null),
    avatar_url: profileRow?.avatar_url ?? null,
  };
  const canCreateRoom = ROOM_ADMIN_ROLES.includes(profileRow?.role ?? "");

  // Rooms (everyone sees every room).
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, description, created_at")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  // Groups I'm an accepted member of.
  const { data: memberships } = await supabase
    .from("group_members")
    .select("role, group_id")
    .eq("user_id", user.id)
    .eq("status", "accepted");
  const myGroupIds = (memberships || []).map((m: any) => m.group_id);
  const myRoleByGroup: Record<string, string> = {};
  (memberships || []).forEach((m: any) => (myRoleByGroup[m.group_id] = m.role));

  const roomIds = (rooms || []).map((r: any) => r.id);

  // Every group inside those rooms that RLS lets me see (public ones + mine).
  let groups: any[] = [];
  if (roomIds.length) {
    const { data } = await supabase
      .from("groups")
      .select(
        "id, room_id, name, description, avatar_url, member_count, is_private, owner_id"
      )
      .in("room_id", roomIds)
      .order("created_at", { ascending: true });
    groups = (data || []).map((g: any) => ({
      ...g,
      joined: myGroupIds.includes(g.id),
      myRole: myRoleByGroup[g.id] ?? null,
    }));
  }

  // Sub-channels for groups I've actually joined.
  let channels: any[] = [];
  if (myGroupIds.length) {
    const { data } = await supabase
      .from("group_subgroups")
      .select("id, group_id, name, description, created_at")
      .in("group_id", myGroupIds)
      .order("created_at", { ascending: true });
    channels = data || [];
  }

  return (
    <GroupClient
      lang={lang}
      me={me}
      canCreateRoom={canCreateRoom}
      rooms={rooms || []}
      groups={groups}
      channels={channels}
    />
  );
}
