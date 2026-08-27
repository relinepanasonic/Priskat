import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import DayClient from "./DayClient";

export default async function DevotionPlanDayPage({ params }: { params: Promise<{ id: string, dayNum: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const dayNum = parseInt(resolvedParams.dayNum, 10);
  
  if (isNaN(dayNum)) return notFound();

  // Get user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    redirect("/login");
  }

  // Fetch plan
  const { data: plan } = await supabase
    .from("devotion_plans")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!plan) return notFound();

  // Fetch progress
  const { data: progress } = await supabase
    .from("user_devotion_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", plan.id)
    .single();

  if (!progress) {
    // If they haven't started, they shouldn't be here, but we can just render it anyway
  }

  // Fetch this day's data
  const { data: dayData } = await supabase
    .from("devotion_plan_days")
    .select("*, verses:devotion_day_verses(*)")
    .eq("plan_id", plan.id)
    .eq("day_number", dayNum)
    .single();

  // Sort verses by order_index
  if (dayData && dayData.verses) {
    dayData.verses.sort((a: any, b: any) => a.order_index - b.order_index);
  }

  return (
    <DayClient 
      plan={plan} 
      dayNum={dayNum} 
      progress={progress} 
      dayData={dayData}
    />
  );
}



