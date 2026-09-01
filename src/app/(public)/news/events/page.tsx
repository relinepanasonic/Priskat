import { createClient } from "@/lib/supabase/server";
import EventsExplore, {
  type ExploreEvent,
  type PremiumBanner,
} from "./EventsExplore";

export const dynamic = "force-dynamic";

export default async function NewsEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myCity: string | null = null;
  let myCommunityId: string | null = null;
  let myCommunityName: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("kota, community_id, community:communities(name)")
      .eq("id", user.id)
      .maybeSingle();
    myCity = prof?.kota ?? null;
    myCommunityId = prof?.community_id ?? null;
    myCommunityName =
      (prof?.community as { name?: string } | null)?.name ?? null;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: rows } = await supabase
    .from("events")
    .select(
      "id, title, description, banner_image_url, event_date, end_date, location, city, maps_url, community_id, news_slug"
    )
    .eq("status", "published")
    .gte("event_date", startOfToday.toISOString())
    .order("event_date", { ascending: true })
    .limit(100);

  const events = (rows ?? []) as ExploreEvent[];

  const { data: bannerRows } = await supabase
    .from("premium_banners")
    .select("id, image_url, link_url, title")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const banners = (bannerRows ?? []) as PremiumBanner[];

  return (
    <EventsExplore
      events={events}
      banners={banners}
      myCity={myCity}
      myCommunityId={myCommunityId}
      myCommunityName={myCommunityName}
    />
  );
}
