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
    <div className="container mx-auto p-4 md:p-8 max-w-full">
      <div className="mb-8 flex justify-between items-center"><div className="flex-1"><h1 className="text-3xl font-bold text-white">Devotion Plans Admin</h1><p className="text-brand-muted mt-2">Manage devotion categories and plans.</p></div><button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold shadow-md hover:bg-brand-gold/80 transition-colors">Import CSV (Coming Soon)</button></div>
      <DevotionPlansAdminClient
        initialCategories={categories || []}
        initialPlans={plans || []}
      />
    </div>
  );
}



