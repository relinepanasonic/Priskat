-- Add new fields to devotion_plans
ALTER TABLE public.devotion_plans 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS subtitle_id TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS summary_id TEXT;

-- Add new fields to devotion_plan_days
ALTER TABLE public.devotion_plan_days 
ADD COLUMN IF NOT EXISTS reflection TEXT,
ADD COLUMN IF NOT EXISTS reflection_id TEXT,
ADD COLUMN IF NOT EXISTS prayer TEXT,
ADD COLUMN IF NOT EXISTS prayer_id TEXT;

