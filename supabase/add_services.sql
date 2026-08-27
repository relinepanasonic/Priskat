ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS services_history JSONB DEFAULT '[]'::jsonb;
