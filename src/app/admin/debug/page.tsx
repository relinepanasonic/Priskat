import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from("devotion_categories").select("*");
  const { data: plans } = await supabase.from("devotion_plans").select("*");

  return (
    <div className="p-8 text-white font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Database Debug</h1>
      <h2 className="text-lg mt-4">Categories: {categories?.length}</h2>
      <pre className="bg-[#222] p-4 mt-2 overflow-auto max-h-96">{JSON.stringify(categories, null, 2)}</pre>
      
      <h2 className="text-lg mt-4">Plans: {plans?.length}</h2>
      <pre className="bg-[#222] p-4 mt-2 overflow-auto max-h-96">{JSON.stringify(plans, null, 2)}</pre>
    </div>
  );
}

