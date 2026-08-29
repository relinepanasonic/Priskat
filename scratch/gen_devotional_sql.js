const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const dirPath = 'Gallery/Devotional/Love';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.csv'));

let sql = '-- Generated Devotion Import Script\n\n';

for (const file of files) {
  const data = fs.readFileSync(path.join(dirPath, file), 'utf8').replace(/^\uFEFF/, '');
  const records = parse(data, { columns: true, skip_empty_lines: true });
  if (records.length === 0) continue;

  const first = records[0];
  const catName = first.sub_category.replace(/'/g, "''");
  const planTitle = first.plan_title_id.replace(/'/g, "''");
  const planDesc = first.summary_id.replace(/'/g, "''");
  const duration = parseInt(first.total_days) || records.length;

  sql += `
-- -----------------------------------------------------------------------------
-- Plan: ${planTitle}
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Category
  SELECT id INTO v_cat_id FROM public.devotion_categories WHERE name = '${catName}';
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name) VALUES ('${catName}') RETURNING id INTO v_cat_id;
  END IF;

  -- Plan (Delete old if exists)
  DELETE FROM public.devotion_plans WHERE title = '${planTitle}';
  
  INSERT INTO public.devotion_plans (category_id, title, description, duration_days)
  VALUES (v_cat_id, '${planTitle}', '${planDesc}', ${duration})
  RETURNING id INTO v_plan_id;

`;

  for (const row of records) {
    const dayNum = parseInt(row.day);
    const dayTitle = row.section_title_id.replace(/'/g, "''");
    
    let content = row.devotion_id.replace(/'/g, "''");
    if (row.reflection_id) content += '\n\n**Refleksi:**\n' + row.reflection_id.replace(/'/g, "''");
    if (row.prayer_id) content += '\n\n**Doa:**\n' + row.prayer_id.replace(/'/g, "''");

    sql += `
  -- Day ${dayNum}
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_content)
  VALUES (v_plan_id, ${dayNum}, '${dayTitle}', '${content}')
  RETURNING id INTO v_day_id;
`;

    const verses = row.verses_id.split('\n').map(v => v.trim()).filter(v => v.length > 0);
    for (let i = 0; i < verses.length; i++) {
      let line = verses[i];
      let ref = line;
      if (line.includes('|')) ref = line.split('|')[0].trim();
      ref = ref.replace(/'/g, "''");
      
      sql += `
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index)
  VALUES (v_day_id, '${ref}', 'TB', ${i});
`;
    }
  }

  sql += `
END $$;
`;
}

fs.writeFileSync('C:/Users/nicoj/.gemini/antigravity/brain/1568926b-43b0-49f5-8744-7b0ccdaf7ebf/import_devotions.md', sql);
console.log('Done generating SQL');

