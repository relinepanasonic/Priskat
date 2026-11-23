import type { createAdminClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createAdminClient>;

/** What a ticket needs besides the person: the community logo, and the names of the event's groups. */
export async function ticketExtras(db: Db, eventId: string) {
  const { data: ev } = await db.from("events").select("community_id").eq("id", eventId).maybeSingle();
  const communityId = (ev as { community_id?: string | null } | null)?.community_id;
  let logoUrl: string | null = null;
  if (communityId) {
    const { data: c } = await db.from("communities").select("logo_url").eq("id", communityId).maybeSingle();
    logoUrl = (c as { logo_url?: string | null } | null)?.logo_url ?? null;
  }
  const { data: gs } = await db.from("event_groups" as any).select("id, name").eq("event_id", eventId);
  const groups = new Map<string, string>(((gs as { id: string; name: string }[]) ?? []).map((g) => [g.id, g.name]));
  return { logoUrl, groups };
}

/** The photo a guest uploaded in the registration form (the first photo question), or null. */
export async function guestPhoto(db: Db, answers: Record<string, string> | null | undefined): Promise<Buffer | null> {
  const ref = Object.values(answers ?? {}).find((v) => typeof v === "string" && v.startsWith("photo:"));
  if (!ref) return null;
  try {
    const { data } = await db.storage.from("event-guest-photos").download(ref.replace(/^photo:/, ""));
    return data ? Buffer.from(await data.arrayBuffer()) : null;
  } catch {
    return null;
  }
}
