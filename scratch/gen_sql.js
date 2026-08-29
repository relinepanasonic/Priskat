const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('scratch/under_one_roof.csv', 'utf8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true
});

if (records.length === 0) {
    console.error("No records found");
    process.exit(1);
}

const plan = records[0];

const category_en = plan.category;
const category_id = "Kasih"; // Hardcoded translation for Love
const plan_title_en = plan.plan_title_en;
const plan_title_id = plan.plan_title_id;
const subtitle_en = plan.subtitle_en;
const subtitle_id = plan.subtitle_id;
const total_days = parseInt(plan.total_days);
const summary_en = plan.summary_en;
const summary_id = plan.summary_id;
const cover_url = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop'; // fallback image

let sql = `
DO $$ 
DECLARE
  v_category_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- 1. Get or Create Category
  SELECT id INTO v_category_id FROM public.devotion_categories WHERE name = '${category_en}' LIMIT 1;
  IF v_category_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id) VALUES ('${category_en}', '${category_id}') RETURNING id INTO v_category_id;
  END IF;

  -- 2. Insert Plan
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_category_id,
    $q$${plan_title_en}$q$,
    $q$${plan_title_id}$q$,
    $q$${subtitle_en}$q$,
    $q$${subtitle_id}$q$,
    ${total_days},
    $q$${summary_en}$q$,
    $q$${summary_id}$q$,
    '${cover_url}'
  ) RETURNING id INTO v_plan_id;
`;

records.forEach(row => {
    sql += `
  -- Day ${row.day}
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    ${row.day},
    $q$${row.section_title_en}$q$,
    $q$${row.section_title_id}$q$,
    $q$${row.devotion_en}$q$,
    $q$${row.devotion_id}$q$,
    $q$${row.reflection_en}$q$,
    $q$${row.reflection_id}$q$,
    $q$${row.prayer_en}$q$,
    $q$${row.prayer_id}$q$
  ) RETURNING id INTO v_day_id;
`;

    // Process Verses (they are newline separated in the CSV)
    const verses_en_arr = row.verses_en.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const verses_id_arr = row.verses_id.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    
    // We only need to insert the references.
    // E.g. "Joshua 24:15 | But as for me and my household..." -> we extract "Joshua 24:15"
    // E.g. "Yosua 24:15 | ...tetapi aku dan seisi..." -> we extract "Yosua 24:15 TB"
    
    let orderIndex = 0;
    verses_en_arr.forEach(v => {
        let ref = v.split('|')[0].trim();
        sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$${ref}$q$, 'WEB', ${orderIndex++});\n`;
    });
    verses_id_arr.forEach(v => {
        let ref = v.split('|')[0].trim();
        sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$${ref} TB$q$, 'TB', ${orderIndex++});\n`;
    });
});

sql += `
END $$;
`;

fs.writeFileSync('supabase/016_seed_under_one_roof.sql', sql);
console.log('SQL Generated to supabase/016_seed_under_one_roof.sql');
