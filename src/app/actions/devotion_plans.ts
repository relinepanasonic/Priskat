"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function importDevotionCSV(records: any[]) {
  if (!records || records.length === 0) return { error: "No records found in CSV." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authorized" };

  const planRow = records[0];
  const category_en = planRow.category || "General";
  
  // 1. Get or Create Category
  let { data: catData, error: catError } = await supabase
    .from("devotion_categories")
    .select("id")
    .eq("name", category_en)
    .single();

  let category_id = catData?.id;

  if (!category_id) {
    const { data: newCat, error: insertCatError } = await supabase
      .from("devotion_categories")
      .insert({ name: category_en, name_id: category_en }) // Use English name for ID as fallback if missing
      .select("id")
      .single();
    if (insertCatError) return { error: "Failed to create category: " + insertCatError.message };
    category_id = newCat.id;
  }

  // 2. Create Plan
  const planData = {
    category_id,
    title: planRow.plan_title_en,
    title_id: planRow.plan_title_id,
    subtitle: planRow.subtitle_en,
    subtitle_id: planRow.subtitle_id,
    duration_days: parseInt(planRow.total_days || "1"),
    description: planRow.summary_en,
    description_id: planRow.summary_id,
    cover_image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop'
  };

  const { data: newPlan, error: planError } = await supabase
    .from("devotion_plans")
    .insert(planData)
    .select("id")
    .single();

  if (planError) return { error: "Failed to create plan: " + planError.message };
  
  const plan_id = newPlan.id;

  // 3. Insert Days and Verses
  for (const row of records) {
    const dayNumber = parseInt(row.day);
    if (isNaN(dayNumber)) continue;

    const dayData = {
      plan_id,
      day_number: dayNumber,
      devotional_title: row.section_title_en,
      devotional_title_id: row.section_title_id,
      devotional_content: row.devotion_en,
      devotional_content_id: row.devotion_id,
      reflection: row.reflection_en,
      reflection_id: row.reflection_id,
      prayer: row.prayer_en,
      prayer_id: row.prayer_id
    };

    const { data: newDay, error: dayError } = await supabase
      .from("devotion_plan_days")
      .insert(dayData)
      .select("id")
      .single();

    if (dayError || !newDay) {
        console.error("Day insert error:", dayError);
        continue;
    }

    const day_id = newDay.id;

    // Process Verses
    const verses_en_arr = (row.verses_en || "").split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const verses_id_arr = (row.verses_id || "").split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    let orderIndex = 0;
    
    for (const v of verses_en_arr) {
        const ref = v.split('|')[0].trim();
        await supabase.from("devotion_day_verses").insert({
            day_id,
            verse_reference: ref,
            translation: 'WEB',
            order_index: orderIndex++
        });
    }

    for (const v of verses_id_arr) {
        let ref = v.split('|')[0].trim();
        // If it ends with TB already, clean it. Otherwise add TB.
        ref = ref.replace(/\s*TB$/, "").trim() + " TB";
        await supabase.from("devotion_day_verses").insert({
            day_id,
            verse_reference: ref,
            translation: 'TB',
            order_index: orderIndex++
        });
    }
  }

  revalidatePath("/admin/upload/devotions");
  return { success: true, plan_id };
}
