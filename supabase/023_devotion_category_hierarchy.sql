-- 023_devotion_category_hierarchy.sql
-- Adds parent_id to devotion_categories to support 4-level structure:
-- Category (Love) -> Sub-Category (Love of God) -> Plan -> Day

-- Step 1: Add parent_id column
ALTER TABLE public.devotion_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.devotion_categories(id) ON DELETE CASCADE;

-- Step 2: Create top-level Love category and link existing sub-categories
DO $$
DECLARE
  v_love_id UUID;
BEGIN
  INSERT INTO public.devotion_categories (name, parent_id)
  VALUES ('Love', NULL)
  RETURNING id INTO v_love_id;

  UPDATE public.devotion_categories
  SET parent_id = v_love_id
  WHERE name IN (
    'Love of God',
    'Family Love',
    'Partner Love',
    'Love for Neighbor',
    'Love for the Poor & Suffering'
  )
  AND parent_id IS NULL
  AND id <> v_love_id;
END $$;

