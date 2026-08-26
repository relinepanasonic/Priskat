ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

