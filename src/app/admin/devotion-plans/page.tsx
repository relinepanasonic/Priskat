import { createClient } from "@/lib/supabase/server";
import DevotionPlansAdminClient from "@/components/admin/DevotionPlansAdminClient";

export default async function DevotionPlansAdminPage() {
  const supabase = await createClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("devotion_categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
  }

  const { data: plans, error: plansError } = await supabase
    .from("devotion_plans")
    .select(`
      *,
      devotion_categories (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (plansError) {
    console.error("Error fetching plans:", plansError);
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Devotion Plans Admin</h1>
        <p className="text-gray-600 mt-2">Manage devotion categories and plans.</p>
      </div>
      <DevotionPlansAdminClient
        initialCategories={categories || []}
        initialPlans={plans || []}
      />
    </div>
  );
}
