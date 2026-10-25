import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KoleksiClient from "./KoleksiClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Koleksi" };

export default async function KoleksiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: badges }, { data: items }, { data: me }, { data: total }] = await Promise.all([
    supabase.from("user_badges" as any).select("badge_key").eq("user_id", user.id),
    supabase.from("user_items" as any).select("item_type, item_key").eq("user_id", user.id),
    supabase.from("profiles").select("full_name, nama_panggilan, avatar_url, equipped_frame, equipped_name_color, equipped_title, show_on_leaderboard").eq("id", user.id).maybeSingle(),
    supabase.rpc("my_total_points"),
  ]);

  return (
    <KoleksiClient
      badges={((badges as any[]) ?? []).map((b) => b.badge_key)}
      items={((items as any[]) ?? []) as { item_type: string; item_key: string }[]}
      me={{
        name: (me as any)?.nama_panggilan || (me as any)?.full_name || "Kamu",
        avatar: (me as any)?.avatar_url ?? null,
        frame: (me as any)?.equipped_frame ?? null,
        color: (me as any)?.equipped_name_color ?? null,
        title: (me as any)?.equipped_title ?? null,
        onBoard: (me as any)?.show_on_leaderboard ?? true,
      }}
      points={typeof total === "number" ? total : 0}
    />
  );
}
