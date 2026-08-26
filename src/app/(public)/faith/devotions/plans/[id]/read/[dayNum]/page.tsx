import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ReadClient from "./ReadClient";

export default async function DevotionPlanReadPage({ 
  params 
}: { 
  params: { id: string, dayNum: string } 
}) {
  const supabase = await createClient();
  const dayNum = parseInt(params.dayNum, 10);
  
  if (isNaN(dayNum)) return notFound();

  // Get user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    redirect("/auth/login");
  }

  // Fetch plan
  const { data: plan } = await supabase
    .from("devotion_plans")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!plan) return notFound();

  // Fetch this day's data
  const { data: dayData } = await supabase
    .from("devotion_plan_days")
    .select("*, verses:devotion_day_verses(*)")
    .eq("plan_id", plan.id)
    .eq("day_number", dayNum)
    .single();

  if (!dayData) return notFound();

  // Sort verses by order_index
  if (dayData.verses) {
    dayData.verses.sort((a: any, b: any) => a.order_index - b.order_index);
  }

  return (
    <ReadClient 
      plan={plan} 
      dayNum={dayNum} 
      dayData={dayData}
      userId={userId}
    />
  );
}
