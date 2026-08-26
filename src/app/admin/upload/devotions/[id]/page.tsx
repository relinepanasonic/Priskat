import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PlanDetailsAdminClient from "./PlanDetailsAdminClient";

export default async function AdminPlanDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("devotion_plans")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!plan) return notFound();

  const { data: days } = await supabase
    .from("devotion_plan_days")
    .select("*, verses:devotion_day_verses(*)")
    .eq("plan_id", plan.id)
    .order("day_number", { ascending: true });

  return <PlanDetailsAdminClient plan={plan} initialDays={days || []} />;
}
