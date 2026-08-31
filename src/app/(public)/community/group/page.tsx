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

  // Rooms RLS already hides hidden rooms I'm not a member of.
  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      "id, name, description, avatar_url, is_public, is_hidden, owner_id, created_at"
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  const { data: pendingReqRows } = await supabase.rpc(
    "my_pending_group_requests"
  );
  const pendingRequests = Array.isArray(pendingReqRows) ? pendingReqRows : [];

  const { data: unreadRows } = await supabase.rpc("my_unread_group_ids");
  const unreadGroupIds: string[] = Array.isArray(unreadRows)
    ? unreadRows.map((r: any) => (typeof r === "string" ? r : r?.my_unread_group_ids ?? r))
    : [];

  const { data: roomMemberships } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", user.id);
  const myRoomIds = (roomMemberships || []).map((m: any) => m.room_id);

  const { data: memberships } = await supabase
    .from("group_members")
    .select("role, group_id")
    .eq("user_id", user.id)
    .eq("status", "accepted");
  const myGroupIds = (memberships || []).map((m: any) => m.group_id);
  const myRoleByGroup: Record<string, string> = {};
  (memberships || []).forEach((m: any) => (myRoleByGroup[m.group_id] = m.role));

  const roomIds = (rooms || []).map((r: any) => r.id);

  let groups: any[] = [];
  if (roomIds.length) {
    const { data } = await supabase
      .from("groups")
      .select(
        "id, room_id, name, description, avatar_url, member_count, is_private, owner_id"
      )
      .in("room_id", roomIds)
      .order("created_at", { ascending: true });
    groups = data || [];
  }

  // One hidden sub-thread per group holds the chat. Resolve it for my groups.
  const chatIdByGroup: Record<string, string> = {};
  if (myGroupIds.length) {
    const { data: subs } = await supabase
      .from("group_subgroups")
      .select("id, group_id, created_at")
      .in("group_id", myGroupIds)
      .order("created_at", { ascending: true });
    (subs || []).forEach((s: any) => {
      if (!chatIdByGroup[s.group_id]) chatIdByGroup[s.group_id] = s.id;
    });
  }

  const shapedGroups = groups.map((g: any) => ({
    ...g,
    joined: myGroupIds.includes(g.id),
    myRole: myRoleByGroup[g.id] ?? null,
    chat_id: chatIdByGroup[g.id] ?? null,
  }));

  return (
    <GroupClient
      lang={lang}
      me={me}
      canCreateRoom={canCreateRoom}
      rooms={rooms || []}
      groups={shapedGroups}
      myRoomIds={myRoomIds}
      unreadGroupIds={unreadGroupIds}
      pendingRequests={pendingRequests}
    />
  );
}
