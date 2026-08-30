import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import GroupClient from "./GroupClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Group" };

export default async function GroupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang = await getLanguage();

  const { data: me } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Groups I'm an accepted member of (Telegram "chats").
  const { data: memberships } = await supabase
    .from("group_members")
    .select(
      "role, group:groups(id, name, description, avatar_url, member_count, is_private, owner_id)"
    )
    .eq("user_id", user.id)
    .eq("status", "accepted");

  const groups = (memberships || [])
    .map((m: any) => (m.group ? { ...m.group, myRole: m.role } : null))
    .filter((g: any): g is any => !!g && !!g.id)
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  const groupIds = groups.map((g: any) => g.id);

  // Sub-channels (Telegram "topics") for every group I belong to.
  let channels: any[] = [];
  if (groupIds.length) {
    const { data } = await supabase
      .from("group_subgroups")
      .select("id, group_id, name, description, created_at")
      .in("group_id", groupIds)
      .order("created_at", { ascending: true });
    channels = data || [];
  }

  return (
    <GroupClient
      lang={lang}
      me={me}
      groups={groups}
      channels={channels}
    />
  );
}
