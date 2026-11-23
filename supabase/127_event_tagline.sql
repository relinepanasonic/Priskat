-- Event About tab: a tagline for the event (name, place, dates, capacity already exist).
-- Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_tagline_check;
ALTER TABLE public.events ADD CONSTRAINT events_tagline_check CHECK (tagline IS NULL OR char_length(tagline) <= 160);
