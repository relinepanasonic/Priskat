import { createClient } from "@/lib/supabase/server";
import { resolveCommunity } from "@/lib/community";
import { DIOCESE_SEED, type Diocese } from "@/lib/catholicIndonesia";

/** Community for a /camp/[slug] page plus whether the viewer may edit its content. */
export async function getCommunityPageContext(slug: string) {
  const supabase = await createClient();
  const [community, { data: { user } }] = await Promise.all([
    resolveCommunity(supabase, slug),
    supabase.auth.getUser(),
  ]);

  let canEdit = false;
  if (user && community) {
    const [{ data: prof }, { data: ca }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("community_admins").select("id").eq("user_id", user.id).eq("community_id", community.id).maybeSingle(),
    ]);
    canEdit = ["founder", "superadmin", "admin"].includes(String(prof?.role ?? "").toLowerCase()) || !!ca;
  }
  return { supabase, community, user, canEdit };
}

/** Dioceses from the database, or the built-in list if the table isn't there yet. */
export async function loadDioceses(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("dioceses" as any).select("*").order("sort_order");
  if (error || !data?.length) return { dioceses: DIOCESE_SEED, fromDb: false };
  return { dioceses: data as unknown as Diocese[], fromDb: true };
}
