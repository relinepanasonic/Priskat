-- Add community_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;

-- Automatically assign everyone to CFM as default for now if it exists
DO $$
DECLARE
  cfm_id UUID;
BEGIN
  SELECT id INTO cfm_id FROM public.communities WHERE slug = 'cfm' LIMIT 1;
  IF cfm_id IS NOT NULL THEN
    UPDATE public.profiles SET community_id = cfm_id WHERE community_id IS NULL AND role != 'founder';
  END IF;
END $$;
