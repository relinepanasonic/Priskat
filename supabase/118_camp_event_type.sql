-- Tipe Event for camp_cohorts: Camp, KKR, Persekutuan Doa / Fellowship, Konser, Doa Bersama, Rosario, Jalan Salib, Other.
-- Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.camp_cohorts ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'Camp';
