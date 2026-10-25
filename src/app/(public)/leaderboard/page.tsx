import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeaderboardClient from "./LeaderboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Papan Peringkat" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <LeaderboardClient myId={user.id} />;
}
