import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import MessagesClient, { type ThreadRow, type Person } from "./MessagesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang = await getLanguage();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const me = {
    id: profileRow?.id ?? user.id,
    full_name:
      profileRow?.full_name ??
      ((user.user_metadata?.full_name as string) || user.email || null),
    avatar_url: profileRow?.avatar_url ?? null,
  };

  // Deep link: /community/messages?u=<userId> opens (creating if needed) that thread.
  let openThreadId: string | null = sp.t ?? null;
  if (!openThreadId && sp.u && sp.u !== me.id) {
    const { data, error } = await supabase.rpc("get_or_create_dm_thread", {
      other: sp.u,
    });
    if (!error && data) openThreadId = data as string;
  }

  const { data: overview } = await supabase.rpc("my_dm_overview");

  // Accepted friends — surfaced first in the "New message" people search.
  const { data: friendRows } = await supabase
    .from("friendships")
    .select(
      "requester_id, receiver_id, requester:profiles!friendships_requester_id_fkey(id, full_name, avatar_url), receiver:profiles!friendships_receiver_id_fkey(id, full_name, avatar_url)"
    )
    .or(`requester_id.eq.${me.id},receiver_id.eq.${me.id}`)
    .eq("status", "accepted");

  type FriendRow = {
    requester_id: string;
    receiver_id: string;
    requester: Person | null;
    receiver: Person | null;
  };
  const friends: Person[] = ((friendRows || []) as unknown as FriendRow[])
    .map((r) => (r.requester_id === me.id ? r.receiver : r.requester))
    .filter((p): p is Person => !!p && p.id !== me.id)
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  return (
    <MessagesClient
      lang={lang}
      me={me}
      threads={(overview as ThreadRow[] | null) || []}
      openThreadId={openThreadId}
      friends={friends}
    />
  );
}
