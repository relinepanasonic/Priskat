import type { SupabaseClient } from "@supabase/supabase-js";

/** Ids of the community bots. Empty (never an error) when the 111 SQL has not been run yet. */
export async function botIdSet(supabase: SupabaseClient): Promise<Set<string>> {
  try {
    const { data, error } = await supabase.from("profiles").select("id").eq("is_bot", true);
    if (error) return new Set();
    return new Set(((data as { id: string }[]) ?? []).map((b) => b.id));
  } catch {
    return new Set();
  }
}

/** Number of bots, for member counts that should not include them. 0 when unknown. */
export async function botCount(supabase: SupabaseClient): Promise<number> {
  try {
    const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_bot", true);
    return error ? 0 : count ?? 0;
  } catch {
    return 0;
  }
}
