"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImportDevotionsPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const supabase = createClient();

  const handleImport = async () => {
    setLoading(true);
    setLog(["Starting import... fetching JSON..."]);
    try {
      const res = await fetch("/data/devotions.json");
      const plans = await res.json();

      setLog(prev => [...prev, `Found ${plans.length} plans to import.`]);

      // Step 1: Ensure top-level "Love" category exists
      let { data: loveCat } = await supabase
        .from("devotion_categories")
        .select("id")
        .eq("name", "Love")
        .is("parent_id", null)
        .single();

      if (!loveCat) {
        const { data: newLove, error } = await supabase
          .from("devotion_categories")
          .insert({ name: "Love", parent_id: null })
          .select("id")
          .single();
        if (error) throw error;
        loveCat = newLove;
      }

      setLog(prev => [...prev, `✓ Top-level category "Love" ready (id: ${loveCat!.id})`]);

      // Step 2: Import each plan
      for (const plan of plans) {
        setLog(prev => [...prev, `Importing plan: ${plan.title}...`]);

        // Get or create sub-category under Love
        let { data: subCat } = await supabase
          .from("devotion_categories")
          .select("id")
          .eq("name", plan.category)
          .eq("parent_id", loveCat!.id)
          .single();

        if (!subCat) {
          const { data: newSub, error } = await supabase
            .from("devotion_categories")
            .insert({ name: plan.category, parent_id: loveCat!.id })
            .select("id")
            .single();
          if (error) throw error;
          subCat = newSub;
          setLog(prev => [...prev, `  ✓ Created sub-category: ${plan.category}`]);
        }

        // Delete old plan if exists
        await supabase.from("devotion_plans").delete().eq("title", plan.title);

        // Create plan under sub-category
        const { data: pData, error: pError } = await supabase
          .from("devotion_plans")
          .insert({
            category_id: subCat!.id,
            title: plan.title,
            description: plan.description,
            duration_days: plan.duration_days
          })
          .select("id")
          .single();

        if (pError) throw pError;

        // Create days
        for (const day of plan.days) {
          const { data: dData, error: dError } = await supabase
            .from("devotion_plan_days")
            .insert({
              plan_id: pData.id,
              day_number: day.day_number,
              devotional_title: day.title,
              devotional_content: day.content
            })
            .select("id")
            .single();

          if (dError) throw dError;

          // Create verses
          for (const verse of day.verses) {
            await supabase.from("devotion_day_verses").insert({
              day_id: dData.id,
              verse_reference: verse.reference,
              translation: "TB",
              order_index: verse.order
            });
          }
        }
        setLog(prev => [...prev, `  ✓ Success: ${plan.title} (${plan.days.length} days)`]);
      }

      setLog(prev => [...prev, "", "🎉 All plans imported successfully!"]);
    } catch (e: any) {
      setLog(prev => [...prev, `❌ Error: ${e.message}`]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-2">Bulk Import Devotions</h1>
      <p className="mb-6 text-gray-400 text-sm">
        This will import all 25 devotion plans from <code className="bg-[#222] px-1 rounded">/data/devotions.json</code> into the correct category hierarchy:
        <br />
        <span className="text-brand-gold">Love</span> → <span className="text-white">Love of God / Family Love / Partner Love / ...</span> → Plan → Days
      </p>

      <button
        onClick={handleImport}
        disabled={loading}
        className="bg-brand-gold text-brand-dark px-8 py-3 rounded-lg font-bold disabled:opacity-50 text-sm"
      >
        {loading ? "Importing..." : "Start Import"}
      </button>

      <div className="mt-8 bg-[#1a1d24] p-4 rounded-lg h-[400px] overflow-y-auto font-mono text-sm border border-[#333]">
        {log.map((l, i) => (
          <div key={i} className={l.startsWith("❌") ? "text-red-400" : l.startsWith("🎉") ? "text-green-400 font-bold" : l.startsWith("  ✓") ? "text-gray-400 pl-4" : "text-white"}>
            {l}
          </div>
        ))}
        {log.length === 0 && <span className="text-gray-500">Waiting to start...</span>}
      </div>
    </div>
  );
}
