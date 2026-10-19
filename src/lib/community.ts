import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Display order for community lists; anything not listed follows alphabetically.
const COMMUNITY_ORDER = ["catholic indonesia", "ruang iman", "catholic family ministry"];

export function sortCommunities<T extends { name?: string | null }>(list: T[] | null | undefined): T[] {
  const rank = (c: T) => {
    const i = COMMUNITY_ORDER.indexOf((c.name ?? "").trim().toLowerCase());
    return i === -1 ? COMMUNITY_ORDER.length : i;
  };
  return [...(list ?? [])].sort((a, b) => rank(a) - rank(b) || (a.name ?? "").localeCompare(b.name ?? ""));
}

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
  const raw = (slugOrId ?? "").trim();
  const key = raw.toLowerCase();

  if (key && key !== "undefined" && key !== "null") {
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
    // a non-empty segment that matches nothing → genuinely broken
    return null;
  }

  // No usable segment (stale /camp/undefined link): fall back to the
  // signed-in user's own community rather than erroring.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: prof } = await supabase
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof?.community_id) return null;
  const { data } = await supabase
    .from("communities")
    .select("id, name, slug")
    .eq("id", prof.community_id)
    .maybeSingle();
  return (data as ResolvedCommunity) ?? null;
}

/** Catholic Family Ministry runs camps; every other community uses plain events. */
export function isCatholicFamilyMinistry(name?: string | null, slug?: string | null) {
  const n = (name ?? "").toLowerCase();
  const s = (slug ?? "").toLowerCase();
  return n.includes("family ministry") || s === "cfm" || s.startsWith("cfm-") || s.includes("catholic-family");
}
