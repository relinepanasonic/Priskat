-- Add Indonesian translations to devotion categories
ALTER TABLE public.devotion_categories 
ADD COLUMN IF NOT EXISTS name_id TEXT;

-- Add Indonesian translations to devotion plans
ALTER TABLE public.devotion_plans 
ADD COLUMN IF NOT EXISTS title_id TEXT,
ADD COLUMN IF NOT EXISTS description_id TEXT;

-- Add Indonesian translations to devotion plan days
ALTER TABLE public.devotion_plan_days 
ADD COLUMN IF NOT EXISTS devotional_title_id TEXT,
ADD COLUMN IF NOT EXISTS devotional_content_id TEXT;

