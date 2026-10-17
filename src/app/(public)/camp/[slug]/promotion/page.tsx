import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityEventsPanel from "@/components/admin/CommunityEventsPanel";
import { resolveCommunity } from "@/lib/community";

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
  const community = await resolveCommunity(supabase, slug);
  if (!community) redirect("/camp");

  const [{ data: prof }, { data: ca }] = await Promise.all([
    user ? supabase.from("profiles").select("role").eq("id", user.id).single() : Promise.resolve({ data: null }),
    community && user
      ? supabase
          .from("community_admins")
          .select("id")
          .eq("user_id", user!.id)
          .eq("community_id", community.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const role = String(prof?.role ?? "").toLowerCase();
  const canPromote =
    ["founder", "superadmin", "admin"].includes(role) || !!ca;

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, end_date, location, maps_url, banner_image_url, status, created_at"
    )
    .eq("community_id", community.id)
    .order("event_date", { ascending: false })
    .limit(50);

  if (!canPromote) {
    const list = (events as any[]) ?? [];
    return (
      <div className="p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Promotion</h2>
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-muted">Belum ada promosi.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-2xl border border-[#333] bg-[#15181e]">
                {e.banner_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.banner_image_url} alt="" className="h-36 w-full object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-white">{e.title}</h3>
                  {e.event_date && <p className="mt-0.5 text-xs text-brand-gold">{new Date(e.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>}
                  {e.location && <p className="text-xs text-brand-muted">{e.location}</p>}
                  {e.description && <p className="mt-2 line-clamp-3 text-sm text-gray-300">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="mb-4 text-lg font-bold text-white">
        Promotional{community?.name ? ` · ${community.name}` : ""}
      </h2>
      <CommunityEventsPanel
        initialEvents={events || []}
        communityId={community?.id ?? null}
      />
    </div>
  );
}
