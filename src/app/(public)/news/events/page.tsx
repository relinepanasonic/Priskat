import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import EventsExplore, {
  type ExploreEvent,
  type PremiumBanner,
} from "./EventsExplore";

export const dynamic = "force-dynamic";

export default async function NewsEventsPage() {
  const supabase = await createClient();
  const lang = await getLanguage();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myCity: string | null = null;
  let myCommunityId: string | null = null;
  let myCommunityName: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("kota, community_id, community:communities!community_id(name)")
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

  // running = the wide strip on top, portrait = the cards of events that are being promoted (134 SQL adds the format)
  let bannerRows: PremiumBanner[] | null = null;
  const withFormat = await supabase.from("premium_banners").select("id, image_url, link_url, title, format").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (!withFormat.error) bannerRows = withFormat.data as PremiumBanner[];
  else {
    const plain = await supabase.from("premium_banners").select("id, image_url, link_url, title").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    bannerRows = (plain.data ?? []) as PremiumBanner[];
  }
  const banners = (bannerRows ?? []).filter((b) => b.format !== "portrait");
  const promos = (bannerRows ?? []).filter((b) => b.format === "portrait");

  return (
    <EventsExplore
      events={events}
      banners={banners}
      promos={promos}
      myCity={myCity}
      myCommunityId={myCommunityId}
      myCommunityName={myCommunityName}
      lang={lang}
    />
  );
}
