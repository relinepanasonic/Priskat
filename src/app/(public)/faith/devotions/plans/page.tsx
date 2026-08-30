import { createClient } from "@/lib/supabase/server";
import PlansClient from "./PlansClient";
import { getLanguage } from "@/lib/lang";

export const metadata = { title: "Devotion Plans" };
// Revalidate every 5 minutes — still fast but picks up new plans
export const revalidate = 300;

export default async function DevotionPlansPage() {
  const supabase = await createClient();
  const language = await getLanguage();

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("devotion_categories")
    .select("*")
    .order("name", { ascending: true });

  // Fetch plans
  const { data: plansData } = await supabase
    .from("devotion_plans")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch user progress
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  let progressData = [];
  if (userId) {
    const { data } = await supabase
      .from("user_devotion_progress")
      .select("*, plans:devotion_plans(*)")
      .eq("user_id", userId);
    progressData = data || [];
  }

  return (
    <PlansClient 
      categories={categoriesData || []} 
      plans={plansData || []} 
      userProgress={progressData} 
      userId={userId}
      language={language} 
    />
  );
}

