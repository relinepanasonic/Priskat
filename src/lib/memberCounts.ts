import type { SupabaseClient } from "@supabase/supabase-js";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";

/**
 * Member totals per community id. Catholic Indonesia counts every Ruang Iman
 * member; other communities count the members assigned to them.
 * A failed count is left out so the caller can fall back to the stored number.
 */
export async function MemberCountSafe(
  supabase: SupabaseClient,
  communities: { id: string; name?: string | null; slug?: string | null }[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  await Promise.all(
    communities.map(async (c) => {
      const base = supabase.from("profiles").select("id", { count: "exact", head: true });
      const { count, error } = await (isCatholicIndonesia(c.name, c.slug) ? base : base.eq("community_id", c.id));
      if (!error && count !== null) out[c.id] = count;
    })
  );
  return out;
}
