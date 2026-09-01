import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResolvedCommunity = {
  id: string;
  name: string | null;
  slug: string | null;
};

/**
 * The /camp/[slug] segment may be a real community slug OR a community id
 * (used as a fallback when a community has no slug). Resolve either.
 * Returns null when nothing matches — callers decide what to show.
 */
export async function resolveCommunity(
  // both the browser and server Supabase clients satisfy this
  supabase: SupabaseClient,
  slugOrId: string | null | undefined
): Promise<ResolvedCommunity | null> {
  const key = (slugOrId ?? "").trim();
  if (!key || key === "undefined" || key === "null") return null;

  const bySlug = await supabase
    .from("communities")
    .select("id, name, slug")
    .eq("slug", key)
    .maybeSingle();
  if (bySlug.data) return bySlug.data as ResolvedCommunity;

  if (UUID_RE.test(key)) {
    const byId = await supabase
      .from("communities")
      .select("id, name, slug")
      .eq("id", key)
      .maybeSingle();
    if (byId.data) return byId.data as ResolvedCommunity;
  }
  return null;
}
