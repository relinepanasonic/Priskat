-- The Mass readings in the lectionary wording, entered by an admin per day (on top of the Mazmur from 100).
-- When a day has a text, the Ekaristi page shows it instead of the Terjemahan Baru verses.
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.liturgy_texts
  ADD COLUMN IF NOT EXISTS bacaan1_text text,
  ADD COLUMN IF NOT EXISTS bacaan2_text text,
  ADD COLUMN IF NOT EXISTS injil_text text,
  ADD COLUMN IF NOT EXISTS bait_text text;
