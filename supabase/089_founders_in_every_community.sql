-- The founder is a member of every community (existing ones and any created later).
-- Run after 088_main_community.sql.

-- 1. Backfill: every founder joins every community
INSERT INTO public.community_memberships (user_id, community_id)
SELECT p.id, c.id
FROM public.profiles p
CROSS JOIN public.communities c
WHERE p.role::text = 'founder'
ON CONFLICT DO NOTHING;

-- 2. A new community automatically gets the founder(s) as members
CREATE OR REPLACE FUNCTION public.add_founders_to_new_community()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_memberships (user_id, community_id)
  SELECT id, NEW.id FROM public.profiles WHERE role::text = 'founder'
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS communities_add_founders ON public.communities;
CREATE TRIGGER communities_add_founders AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.add_founders_to_new_community();

-- 3. Someone who becomes founder joins every community
CREATE OR REPLACE FUNCTION public.add_new_founder_to_communities()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role::text = 'founder' AND (TG_OP = 'INSERT' OR OLD.role::text IS DISTINCT FROM 'founder') THEN
    INSERT INTO public.community_memberships (user_id, community_id)
    SELECT NEW.id, id FROM public.communities
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_founder_memberships ON public.profiles;
CREATE TRIGGER profiles_founder_memberships AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.add_new_founder_to_communities();
