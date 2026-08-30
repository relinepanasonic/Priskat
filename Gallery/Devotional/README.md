# Devotion import — how to add a new batch

One CSV in, one SQL file out, one paste into Supabase. No code changes, no Vercel deploy — devotions are database content and the app reads them live.

## 1. Build the CSV

One **row per day**. Plan-level columns repeat on every row of that plan.

| column | required | notes |
|---|---|---|
| `category` | yes | Top-level tab, English. e.g. `Love`, `Faith`, `Hope` |
| `category_id` | no | Indonesian name for the tab. If blank, a built-in dictionary is tried, then the English name |
| `sub_category` | yes | Second level, English. e.g. `Love of God` |
| `sub_category_id` | no | Indonesian name for the sub-category |
| `plan_title_en` | yes | **Must be unique across ALL devotions.** This is the key used to update on re-import |
| `plan_title_id` | yes | Indonesian plan title |
| `subtitle_en` / `subtitle_id` | no | one-line subtitle |
| `total_days` | yes | number of days in the plan (same on every row) |
| `summary_en` / `summary_id` | no | paragraph shown on the plan cover |
| `cover_url` | no | full https URL to a cover image; blank = no image (UI shows a fallback) |
| `cover_prompt` | no | ignored by the importer; keep it if you use it to generate art |
| `day` | yes | `1`, `2`, `3` … contiguous, starting at 1 |
| `section_title_en` / `section_title_id` | yes | the day's title |
| `devotion_en` / `devotion_id` | yes | the day's main text. Line breaks are fine |
| `reflection_en` / `reflection_id` | no | short reflection line |
| `prayer_en` / `prayer_id` | no | short prayer |
| `verses_en` / `verses_id` | no | see below |

### Verses format

Inside one cell, one verse per line, `Reference | verse text`:

```
1 John 4:19 | We love because he first loved us.
1 John 4:10 | This is love: not that we loved God...
```

Only the part **before the `|`** is stored. Keep it to 1–3 verses per day.
- English (`verses_en`) → use WEB book names (`1 John`, `Psalm`, `Song of Solomon`).
- Indonesian (`verses_id`) → use TB book names (`1 Yohanes`, `Mazmur`, `Kidung Agung`).

### Bilingual rule

Every `*_en` field should have a matching `*_id` value. A blank cell is stored as
`NULL` and the reader falls back to the other language, but the goal is **both
languages filled in for every plan**.

## 2. Generate the SQL

Put the file at `Gallery/Devotional/<Batch Name>.csv`, then:

```
node scripts/gen_devotion_seed.js "Gallery/Devotional/<Batch Name>.csv" "supabase/0NN_seed_devotions_<name>.sql"
```

Use the next free migration number for `0NN`. The script:
- prepends `ADD COLUMN IF NOT EXISTS` guards so it can't half-fail,
- creates any missing `category` / `sub_category` rows (with Indonesian names),
- **deletes each plan by `plan_title_en` then re-inserts it**, so re-running the
  same file just updates the content,
- ends with two verification `SELECT`s.

It prints warnings for non-contiguous `day` numbers — fix those in the CSV and
regenerate.

## 3. Run it

Supabase → SQL Editor → new query → paste the whole `.sql` file → **Run**
(15–40s for a large batch). Check the two result grids at the bottom:
- category tree — your new `category` with its sub-categories,
- `plans_in_this_batch` / `days_in_this_batch` — should match your CSV.

Then open the app → **Spiritual → Renungan / Devotion**. Use the `ID / EN`
toggle bottom-left to check both languages.

## 4. If you re-import / need to clean duplicates

Re-running the same `.sql` is safe. To remove stray plans from an old partial
import, delete any plan under a category whose title is **not** one of your
current `plan_title_en` values (ask for the exact query if needed).

## Gotchas

- `plan_title_en` collisions across batches silently overwrite — keep titles unique.
- Re-importing a plan a user already started **resets their progress for that plan**
  (cascade on delete). Fine for new content; avoid re-running on live plans people use.
- Verse text after `|` is not stored; the reader fetches verse text from the
  `bible_verses` table by reference, so references must match books that exist there.
