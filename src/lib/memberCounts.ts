import type { SupabaseClient } from "@supabase/supabase-js";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

/**
 * Members of a community. Catholic Indonesia = every Ruang Iman member; other communities use the
 * community_memberships table (people can belong to several communities). Until the 088 SQL has been
 * run, it falls back to profiles.community_id so nothing breaks.
 */
export async function countCommunityMembers(
  supabase: SupabaseClient,
  c: { id: string; name?: string | null; slug?: string | null }
): Promise<number | null> {
  if (isCatholicIndonesia(c.name, c.slug)) {
    const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    return error ? null : count;
  }
  const m = await supabase.from("community_memberships" as any).select("user_id", { count: "exact", head: true }).eq("community_id", c.id);
  if (!m.error) return m.count;
  const p = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("community_id", c.id);
  return p.error ? null : p.count;
}

/** Profile rows of a community's members (same rule as above). `columns` are profile columns. */
export async function loadCommunityMembers<T = any>(
  supabase: SupabaseClient,
  c: { id: string; name?: string | null; slug?: string | null },
  columns: string,
  opts: { order?: { column: string; ascending: boolean }; limit?: number } = {}
): Promise<T[]> {
  const everyone = isCatholicIndonesia(c.name, c.slug);
  const order = opts.order ?? { column: "created_at", ascending: false };
  const limit = opts.limit ?? 20000;

  if (!everyone) {
    const m = await supabase
      .from("community_memberships" as any)
      .select(`profile:profiles!community_memberships_user_id_fkey(${columns})`)
      .eq("community_id", c.id)
      .limit(limit);
    if (!m.error) {
      const rows = ((m.data as any[]) ?? []).map((r) => r.profile).filter(Boolean);
      const key = order.column;
      rows.sort((a, b) => (a?.[key] > b?.[key] ? 1 : a?.[key] < b?.[key] ? -1 : 0) * (order.ascending ? 1 : -1));
      return rows as T[];
    }
  }
  let q = supabase.from("profiles").select(columns).order(order.column, { ascending: order.ascending }).limit(limit);
  if (!everyone) q = q.eq("community_id", c.id);
  const { data } = await q;
  return ((data as any[]) ?? []) as T[];
}

/**
 * Member totals per community id. A failed count is left out so the caller can fall back to the stored number.
 */
export async function MemberCountSafe(
  supabase: SupabaseClient,
  communities: { id: string; name?: string | null; slug?: string | null }[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  await Promise.all(
    communities.map(async (c) => {
      const n = await countCommunityMembers(supabase, c);
      if (n !== null) out[c.id] = n;
    })
  );
  return out;
}
