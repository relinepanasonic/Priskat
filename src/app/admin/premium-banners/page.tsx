import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PremiumBannersClient, { type Banner } from "./PremiumBannersClient";

export const dynamic = "force-dynamic";

export default async function PremiumBannersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (String(prof?.role ?? "").toLowerCase() !== "founder") redirect("/admin");

  const { data: banners } = await supabase
    .from("premium_banners")
    .select("id, image_url, link_url, title, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Premium Banner</h1>
        <p className="mt-1 text-brand-muted">
          Sponsored slides in the News &rsaquo; Events marquee. 16:9, ~1600×900.
        </p>
      </div>
      <PremiumBannersClient initialBanners={(banners as Banner[]) || []} />
    </div>
  );
}
