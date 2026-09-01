import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityEventsPanel from "@/components/admin/CommunityEventsPanel";

export const dynamic = "force-dynamic";

export default async function CampPromotionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: community } = await supabase
    .from("communities")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  const [{ data: prof }, { data: ca }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    community
      ? supabase
          .from("community_admins")
          .select("id")
          .eq("user_id", user.id)
          .eq("community_id", community.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const role = String(prof?.role ?? "").toLowerCase();
  const canPromote =
    ["founder", "superadmin", "admin"].includes(role) || !!ca;

  if (!canPromote) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-brand-muted">
        Only community organisers can create promotions.
      </div>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, end_date, location, maps_url, banner_image_url, status, created_at"
    )
    .order("event_date", { ascending: false })
    .limit(50);

  return (
    <div className="p-4 md:p-6">
      <h2 className="mb-4 text-lg font-bold text-white">
        Promotion{community?.name ? ` · ${community.name}` : ""}
      </h2>
      <CommunityEventsPanel initialEvents={events || []} />
    </div>
  );
}
