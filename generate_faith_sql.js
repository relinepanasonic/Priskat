const fs = require('fs');
const { parse } = require('csv-parse/sync');

const inputCSV = fs.readFileSync('Gallery/Devotional/faith_devotions.csv', 'utf8');

const records = parse(inputCSV, {
  columns: true,
  skip_empty_lines: true,
});

let sql = `
-- 043_seed_devotions_faith.sql
-- Seeds the "Faith" devotion category tree and plans
-- from Gallery/Devotional/faith_devotions.csv.

-- --- Guard: make sure every column this seed writes exists -------------------
ALTER TABLE public.devotion_categories ADD COLUMN IF NOT EXISTS parent_id UUID
  REFERENCES public.devotion_categories(id) ON DELETE CASCADE;
ALTER TABLE public.devotion_categories ADD COLUMN IF NOT EXISTS name_id TEXT;
ALTER TABLE public.devotion_categories ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.devotion_plans ADD COLUMN IF NOT EXISTS title_id TEXT;
ALTER TABLE public.devotion_plans ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.devotion_plans ADD COLUMN IF NOT EXISTS subtitle_id TEXT;
ALTER TABLE public.devotion_plans ADD COLUMN IF NOT EXISTS description_id TEXT;

ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS devotional_title_id TEXT;
ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS devotional_content_id TEXT;
ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS reflection TEXT;
ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS reflection_id TEXT;
ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS prayer TEXT;
ALTER TABLE public.devotion_plan_days ADD COLUMN IF NOT EXISTS prayer_id TEXT;

DO $$
DECLARE
  v_faith_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Top-level category ------------------------------------------------------
  SELECT id INTO v_faith_id FROM public.devotion_categories
    WHERE name = 'Faith' AND parent_id IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_faith_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Faith', 'Iman', NULL)
      RETURNING id INTO v_faith_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Iman'
      WHERE id = v_faith_id;
  END IF;

`;

// Delete old plans
const uniquePlans = [...new Set(records.map(r => r.plan_title_en))];
for (const plan of uniquePlans) {
  sql += `  DELETE FROM public.devotion_plans WHERE title = '${plan.replace(/'/g, "''")}';\n`;
}

sql += '\n';

let currentSubCategory = '';
let currentPlan = '';

for (const row of records) {
  const {
    sub_category,
    sub_category_id,
    plan_title_en,
    plan_title_id,
    subtitle_en,
    subtitle_id,
    total_days,
    summary_en,
    summary_id,
    day,
    section_title_en,
    section_title_id,
    devotion_en,
    devotion_id,
    verses_en,
    verses_id,
    reflection_en,
    reflection_id,
    prayer_en,
    prayer_id,
    cover_url
  } = row;

  if (sub_category && sub_category !== currentSubCategory) {
    currentSubCategory = sub_category;
    sql += `
  -- Sub-category: ${sub_category} --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = '${sub_category.replace(/'/g, "''")}' AND parent_id = v_faith_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('${sub_category.replace(/'/g, "''")}', '${sub_category_id.replace(/'/g, "''")}', v_faith_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = '${sub_category_id.replace(/'/g, "''")}'
      WHERE id = v_cat_id;
  END IF;
`;
  }

  if (plan_title_en && plan_title_en !== currentPlan) {
    currentPlan = plan_title_en;
    
    // We try to use a cover image matching the slugified title.
    const slug = plan_title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const fallbackImage = `/images/devotions/${slug}.jpeg`;
    
    sql += `
  -- Plan: ${plan_title_en}
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    '${plan_title_en.replace(/'/g, "''")}',
    '${plan_title_id.replace(/'/g, "''")}',
    '${subtitle_en.replace(/'/g, "''")}',
    '${subtitle_id.replace(/'/g, "''")}',
    ${total_days},
    '${summary_en.replace(/'/g, "''")}',
    '${summary_id.replace(/'/g, "''")}',
    '${cover_url || fallbackImage}'
  ) RETURNING id INTO v_plan_id;
`;
  }

  // Parse verses
  // Usually the format in the CSV is something like:
  // "Isaiah 40:31 | but those who hope..."
  // Since we need to insert verses, we should do an INSERT INTO devotion_plan_days then handle verses.
  
  sql += `
  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, ${day},
    '${section_title_en.replace(/'/g, "''")}', '${section_title_id.replace(/'/g, "''")}',
    '${devotion_en.replace(/'/g, "''")}', '${devotion_id.replace(/'/g, "''")}',
    '${reflection_en.replace(/'/g, "''")}', '${reflection_id.replace(/'/g, "''")}',
    '${prayer_en.replace(/'/g, "''")}', '${prayer_id.replace(/'/g, "''")}'
  ) RETURNING id INTO v_day_id;
`;

  // Verses insertion logic
    let orderIndex = 0;
  function processVerses(verseText, translationLabel) {
    if (!verseText) return;
    const parts = verseText.split('|');
    const ref = parts[0].trim().replace(/'/g, "''");
    if (ref) {
      sql += `
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index)
  VALUES (v_day_id, '${ref}', '${translationLabel}', ${orderIndex});
`;
      orderIndex++;
    }
  }

  processVerses(verses_en, 'WEB');
  processVerses(verses_id, 'TB');
}

sql += `
END $$;
`;

fs.writeFileSync('supabase/043_seed_devotions_faith.sql', sql, 'utf8');
console.log('Done!');

