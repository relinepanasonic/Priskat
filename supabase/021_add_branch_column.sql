-- Add branch column if it doesn't exist
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS branch text;

-- Backfill data (copy kota to branch where branch is null)
UPDATE public.branches SET branch = kota WHERE branch IS NULL;
