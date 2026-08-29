-- Add vision and mission to communities table
ALTER TABLE public.communities
ADD COLUMN IF NOT EXISTS vision TEXT,
ADD COLUMN IF NOT EXISTS mission TEXT;
