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

      for (const plan of plans) {
        setLog(prev => [...prev, `Importing plan: ${plan.title}...`]);
        
        // 1. Get or create category
        let { data: cat } = await supabase.from('devotion_categories').select('id').eq('name', plan.category).single();
        if (!cat) {
          const { data: newCat, error } = await supabase.from('devotion_categories').insert({ name: plan.category }).select('id').single();
          if (error) throw error;
          cat = newCat;
        }

        // 2. Delete old plan if exists
        await supabase.from('devotion_plans').delete().eq('title', plan.title);

        // 3. Create plan
        const { data: pData, error: pError } = await supabase.from('devotion_plans').insert({
          category_id: cat.id,
          title: plan.title,
          description: plan.description,
          duration_days: plan.duration_days
        }).select('id').single();
        
        if (pError) throw pError;

        // 4. Create days
        for (const day of plan.days) {
          const { data: dData, error: dError } = await supabase.from('devotion_plan_days').insert({
            plan_id: pData.id,
            day_number: day.day_number,
            devotional_title: day.title,
            devotional_content: day.content
          }).select('id').single();

          if (dError) throw dError;

          // 5. Create verses
          for (const verse of day.verses) {
            await supabase.from('devotion_day_verses').insert({
              day_id: dData.id,
              verse_reference: verse.reference,
              translation: 'TB',
              order_index: verse.order
            });
          }
        }
        setLog(prev => [...prev, `✓ Success: ${plan.title}`]);
      }
      setLog(prev => [...prev, "All plans imported successfully!"]);

    } catch (e: any) {
      setLog(prev => [...prev, `Error: ${e.message}`]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Bulk Import Devotions</h1>
      <p className="mb-6 text-gray-400">This will parse /data/devotions.json and insert them into the database.</p>
      
      <button 
        onClick={handleImport} 
        disabled={loading}
        className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? "Importing..." : "Start Import"}
      </button>

      <div className="mt-8 bg-[#1a1d24] p-4 rounded-lg h-[400px] overflow-y-auto font-mono text-sm border border-[#333]">
        {log.map((l, i) => <div key={i}>{l}</div>)}
        {log.length === 0 && <span className="text-gray-500">Waiting to start...</span>}
      </div>
    </div>
  );
}
