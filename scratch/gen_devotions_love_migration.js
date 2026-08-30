// Generates supabase/038_seed_devotions_love.sql from the 26-devotion master CSV.
// Re-runnable: each plan is deleted by title (cascade) then re-inserted.
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const CSV = path.join(__dirname, "../Gallery/Devotional/All_26_Devotions_Master.csv");
const OUT = path.join(__dirname, "../supabase/038_seed_devotions_love.sql");

const q = (v) => (v == null ? "" : String(v)).replace(/'/g, "''");
const lit = (v) => `'${q(v)}'`;
const nlit = (v) => (v == null || String(v).trim() === "" ? "NULL" : lit(v));

// Indonesian names for the fixed Love category tree (not present in the CSV).
const CAT_ID = {
  Love: "Kasih",
  "Love of God": "Kasih kepada Allah",
  "Family Love": "Kasih Keluarga",
  "Partner Love": "Kasih Pasangan",
  "Love for Neighbor": "Kasih kepada Sesama",
  "Love for the Poor & Suffering": "Kasih bagi yang Miskin dan Menderita",
};

const records = parse(fs.readFileSync(CSV, "utf8").replace(/^﻿/, ""), {
  columns: true,
  skip_empty_lines: true,
});

const plans = new Map();
for (const row of records) {
  const key = row.plan_title_en;
  if (!plans.has(key)) plans.set(key, { head: row, days: [] });
  plans.get(key).days.push(row);
}

const subCats = [...new Set(records.map((r) => r.sub_category))];

const parseVerses = (raw) =>
  (raw || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split("|")[0].trim());

let sql = `-- 038_seed_devotions_love.sql
-- Seeds the "Love" devotion category tree and 26 plans (${records.length} days)
-- from Gallery/Devotional/All_26_Devotions_Master.csv.
--
-- Self-contained: adds every column it needs if a prior migration was skipped,
-- so the seed cannot fail (and silently roll back) on a missing column.
--
-- Re-runnable: every plan is deleted by title and re-inserted. Because
-- user_devotion_progress references devotion_plans ON DELETE CASCADE, re-running
-- this after users have started a plan will reset their progress for it.

-- --- Guard: make sure every column this seed writes exists -------------------
ALTER TABLE public.devotion_categories ADD COLUMN IF NOT EXISTS parent_id UUID
  REFERENCES public.devotion_categories(id) ON DELETE CASCADE;
ALTER TABLE public.devotion_categories ADD COLUMN IF NOT EXISTS name_id TEXT;

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
  v_love_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Top-level category ------------------------------------------------------
  SELECT id INTO v_love_id FROM public.devotion_categories
    WHERE name = 'Love' AND parent_id IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_love_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Love', ${lit(CAT_ID.Love)}, NULL)
      RETURNING id INTO v_love_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = ${lit(CAT_ID.Love)}
      WHERE id = v_love_id;
  END IF;

  -- Sub-categories --------------------------------------------------------
`;

for (const sc of subCats) {
  const idName = CAT_ID[sc] || sc;
  sql += `
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = ${lit(sc)} AND parent_id = v_love_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES (${lit(sc)}, ${lit(idName)}, v_love_id);
  ELSE
    UPDATE public.devotion_categories SET name_id = ${lit(idName)}
      WHERE id = v_cat_id;
  END IF;
`;
}

for (const { head, days } of plans.values()) {
  const duration = parseInt(head.total_days, 10) || days.length;
  sql += `
  -- ===================================================================
  -- Plan: ${head.plan_title_en}  (${head.sub_category}, ${duration} days)
  -- ===================================================================
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = ${lit(head.sub_category)} AND parent_id = v_love_id
    ORDER BY created_at ASC
    LIMIT 1;

  DELETE FROM public.devotion_plans WHERE title = ${lit(head.plan_title_en)};

  INSERT INTO public.devotion_plans
    (category_id, title, title_id, subtitle, subtitle_id,
     description, description_id, duration_days)
  VALUES
    (v_cat_id, ${lit(head.plan_title_en)}, ${nlit(head.plan_title_id)},
     ${nlit(head.subtitle_en)}, ${nlit(head.subtitle_id)},
     ${nlit(head.summary_en)}, ${nlit(head.summary_id)}, ${duration})
  RETURNING id INTO v_plan_id;
`;

  for (const row of days) {
    const dayNum = parseInt(row.day, 10);
    sql += `
  INSERT INTO public.devotion_plan_days
    (plan_id, day_number, devotional_title, devotional_title_id,
     devotional_content, devotional_content_id,
     reflection, reflection_id, prayer, prayer_id)
  VALUES
    (v_plan_id, ${dayNum}, ${nlit(row.section_title_en)}, ${nlit(row.section_title_id)},
     ${nlit(row.devotion_en)}, ${nlit(row.devotion_id)},
     ${nlit(row.reflection_en)}, ${nlit(row.reflection_id)},
     ${nlit(row.prayer_en)}, ${nlit(row.prayer_id)})
  RETURNING id INTO v_day_id;
`;
    const ve = parseVerses(row.verses_en);
    const vi = parseVerses(row.verses_id);
    let order = 0;
    for (const ref of ve) {
      sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, ${lit(ref)}, 'WEB', ${order++});\n`;
    }
    for (const ref of vi) {
      sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, ${lit(ref)}, 'TB', ${order++});\n`;
    }
  }
}

sql += `
  RAISE NOTICE 'Devotion seed done: % categories, % plans, % days, % verses',
    (SELECT count(*) FROM public.devotion_categories),
    (SELECT count(*) FROM public.devotion_plans),
    (SELECT count(*) FROM public.devotion_plan_days),
    (SELECT count(*) FROM public.devotion_day_verses);
END $$;

-- --- Verification (these results are shown in the SQL editor) ---------------
SELECT 'category tree' AS check, parent.name AS parent, child.name AS name,
       child.name_id
  FROM public.devotion_categories child
  LEFT JOIN public.devotion_categories parent ON parent.id = child.parent_id
 ORDER BY parent.name NULLS FIRST, child.name;

SELECT c.name AS sub_category, count(*) AS plans, sum(p.duration_days) AS total_days
  FROM public.devotion_plans p
  JOIN public.devotion_categories c ON c.id = p.category_id
 GROUP BY c.name
 ORDER BY c.name;
`;

fs.writeFileSync(OUT, sql);
console.log(`Wrote ${OUT}`);
console.log(`Plans: ${plans.size}, days: ${records.length}, sub-categories: ${subCats.length}`);
