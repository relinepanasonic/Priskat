-- Camp / event banner (same look as the event banner). Camps and events are one list now, so 118 is not needed.
-- Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.camp_cohorts ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.camp_cohorts DROP COLUMN IF EXISTS event_type;
