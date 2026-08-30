/*
 * gen_devotion_seed.js — turn a devotion CSV into a re-runnable Supabase seed.
 *
 *   node scripts/gen_devotion_seed.js <input.csv> [output.sql]
 *
 * If output.sql is omitted it is written next to the CSV with a .sql extension.
 * See Gallery/Devotional/README.md for the CSV spec.
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const inPath = process.argv[2];
if (!inPath) {
  console.error("usage: node scripts/gen_devotion_seed.js <input.csv> [output.sql]");
  process.exit(1);
}
const outPath =
  process.argv[3] || inPath.replace(/\.csv$/i, "") + ".sql";

// Optional Indonesian names for well-known category slugs. Anything not listed
// falls back to the CSV's *_id column, then to the English name.
const CAT_ID_FALLBACK = {
  Love: "Kasih",
  "Love of God": "Kasih kepada Allah",
  "Family Love": "Kasih Keluarga",
  "Partner Love": "Kasih Pasangan",
  "Love for Neighbor": "Kasih kepada Sesama",
  "Love for the Poor & Suffering": "Kasih bagi yang Miskin dan Menderita",
  Faith: "Iman",
  Hope: "Pengharapan",
};

const q = (v) => (v == null ? "" : String(v)).replace(/'/g, "''");
const lit = (v) => `'${q(v)}'`;
const nlit = (v) => (v == null || String(v).trim() === "" ? "NULL" : lit(v));
const idName = (row, enKey, idKey) =>
  (row[idKey] && row[idKey].trim()) || CAT_ID_FALLBACK[row[enKey]] || row[enKey];

const records = parse(fs.readFileSync(inPath, "utf8").replace(/^﻿/, ""), {
  columns: true,
  skip_empty_lines: true,
});
if (!records.length) {
  console.error("CSV has no rows");
  process.exit(1);
}

// ---- validate -------------------------------------------------------------
const REQUIRED = [
  "category", "sub_category", "plan_title_en", "plan_title_id",
  "total_days", "day", "section_title_en", "section_title_id",
  "devotion_en", "devotion_id",
];
for (const col of REQUIRED) {
  if (!(col in records[0])) {
    console.error(`Missing required column: ${col}`);
    process.exit(1);
  }
}

const topCats = new Map();  // name -> id-name
const subCats = new Map();  // name -> {parent, idName}
const plans = new Map();    // plan_title_en -> { head, days: [] }

for (const row of records) {
  topCats.set(row.category, idName(row, "category", "category_id"));
  subCats.set(row.sub_category, {
    parent: row.category,
    idName: idName(row, "sub_category", "sub_category_id"),
  });
  const key = row.plan_title_en;
  if (!plans.has(key)) plans.set(key, { head: row, days: [] });
  plans.get(key).days.push(row);
}

// day-numbering sanity check
for (const [title, { days }] of plans) {
  const nums = days.map((d) => parseInt(d.day, 10)).sort((a, b) => a - b);
  const ok = nums.every((n, i) => n === i + 1);
  if (!ok) console.warn(`WARN: plan "${title}" has non-contiguous days: ${nums.join(",")}`);
}

const parseVerses = (raw) =>
  (raw || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split("|")[0].trim());

// ---- build sql ----------------------------------------------------------
let sql = `-- ${path.basename(outPath)}
-- Generated from ${path.basename(inPath)} by scripts/gen_devotion_seed.js
-- Plans: ${plans.size}  Days: ${records.length}  Top categories: ${topCats.size}  Sub-categories: ${subCats.size}
--
-- Self-contained: adds any missing bilingual columns first, so a skipped
-- earlier migration cannot make this roll back.
-- Re-runnable: each plan is deleted by English title and re-inserted. Because
-- user_devotion_progress cascades on plan delete, re-running resets progress
-- for any plan a user had already started.

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
  v_top_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
`;

// top-level categories
for (const [name, nid] of topCats) {
  sql += `
  SELECT id INTO v_top_id FROM public.devotion_categories
    WHERE name = ${lit(name)} AND parent_id IS NULL
    ORDER BY created_at ASC LIMIT 1;
  IF v_top_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES (${lit(name)}, ${lit(nid)}, NULL) RETURNING id INTO v_top_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = ${lit(nid)} WHERE id = v_top_id;
  END IF;
`;
  for (const [sub, meta] of subCats) {
    if (meta.parent !== name) continue;
    sql += `
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = ${lit(sub)} AND parent_id = v_top_id
    ORDER BY created_at ASC LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES (${lit(sub)}, ${lit(meta.idName)}, v_top_id);
  ELSE
    UPDATE public.devotion_categories SET name_id = ${lit(meta.idName)} WHERE id = v_cat_id;
  END IF;
`;
  }
}

// plans + days + verses
for (const { head, days } of plans.values()) {
  const duration = parseInt(head.total_days, 10) || days.length;
  const cover = head.cover_url && head.cover_url.trim() ? head.cover_url.trim() : null;
  sql += `
  -- =================================================================
  -- ${head.plan_title_en}  (${head.category} > ${head.sub_category}, ${duration}d)
  -- =================================================================
  SELECT c.id INTO v_cat_id
    FROM public.devotion_categories c
    JOIN public.devotion_categories p ON p.id = c.parent_id
   WHERE c.name = ${lit(head.sub_category)} AND p.name = ${lit(head.category)}
   ORDER BY c.created_at ASC LIMIT 1;

  DELETE FROM public.devotion_plans WHERE title = ${lit(head.plan_title_en)};

  INSERT INTO public.devotion_plans
    (category_id, title, title_id, subtitle, subtitle_id,
     description, description_id, duration_days, cover_image_url)
  VALUES
    (v_cat_id, ${lit(head.plan_title_en)}, ${nlit(head.plan_title_id)},
     ${nlit(head.subtitle_en)}, ${nlit(head.subtitle_id)},
     ${nlit(head.summary_en)}, ${nlit(head.summary_id)}, ${duration}, ${cover ? lit(cover) : "NULL"})
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
    let order = 0;
    for (const ref of parseVerses(row.verses_en))
      sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, ${lit(ref)}, 'WEB', ${order++});\n`;
    for (const ref of parseVerses(row.verses_id))
      sql += `  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, ${lit(ref)}, 'TB', ${order++});\n`;
  }
}

const titleList = [...plans.keys()].map((t) => "    " + lit(t)).join(",\n");
sql += `
  RAISE NOTICE 'Seed done: % categories, % plans, % days, % verses',
    (SELECT count(*) FROM public.devotion_categories),
    (SELECT count(*) FROM public.devotion_plans),
    (SELECT count(*) FROM public.devotion_plan_days),
    (SELECT count(*) FROM public.devotion_day_verses);
END $$;

-- --- Verification (shown in the Supabase SQL editor) ----------------------
SELECT p.name AS parent, c.name AS category, c.name_id
  FROM public.devotion_categories c
  LEFT JOIN public.devotion_categories p ON p.id = c.parent_id
 ORDER BY p.name NULLS FIRST, c.name;

SELECT count(*) AS plans_in_this_batch, sum(duration_days) AS days_in_this_batch
  FROM public.devotion_plans
 WHERE title IN (
${titleList}
 );
`;

fs.writeFileSync(outPath, sql);
console.log(`Wrote ${outPath}`);
console.log(`  plans ${plans.size}, days ${records.length}, top cats ${topCats.size}, sub cats ${subCats.size}`);
