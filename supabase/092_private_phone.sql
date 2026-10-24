-- Phone numbers are private: only the member themself and site admins can see them.
-- Run once in the Supabase SQL editor, after 091. Safe to run again.
--
-- How it works: phone numbers move to their own table with strict rules. A trigger on profiles moves
-- any phone that is written to profiles (sign-up, profile edit) into that table and leaves
-- profiles.phone empty, so the app keeps working without other changes.

-- 1. Private table (keyed to the login account, so it also works during sign-up)
CREATE TABLE IF NOT EXISTS public.profile_private (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profile_private_select ON public.profile_private;
DROP POLICY IF EXISTS profile_private_write_own ON public.profile_private;
CREATE POLICY profile_private_select ON public.profile_private FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_site_admin());
CREATE POLICY profile_private_write_own ON public.profile_private FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_site_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_site_admin());

-- 2. Copy the phone numbers we already have
INSERT INTO public.profile_private (user_id, phone)
SELECT p.id, p.phone
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE coalesce(trim(p.phone), '') <> ''
ON CONFLICT (user_id) DO UPDATE SET phone = excluded.phone, updated_at = now();

-- 3. From now on, a phone written to profiles goes to the private table instead
CREATE OR REPLACE FUNCTION public.move_phone_to_private()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.phone IS NOT NULL THEN
    INSERT INTO public.profile_private (user_id, phone)
    VALUES (NEW.id, nullif(trim(NEW.phone), ''))
    ON CONFLICT (user_id) DO UPDATE SET phone = excluded.phone, updated_at = now();
    NEW.phone := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_phone_private ON public.profiles;
CREATE TRIGGER profiles_phone_private BEFORE INSERT OR UPDATE OF phone ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.move_phone_to_private();

-- 4. Empty the old column (the numbers are safe in profile_private now)
UPDATE public.profiles SET phone = NULL WHERE phone IS NOT NULL;

-- 5. The alumni database (names + phone numbers) was readable by every signed-in member.
--    Now only site admins and community admins can read it.
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.alumni_database;
DROP POLICY IF EXISTS alumni_database_select_admins ON public.alumni_database;
CREATE POLICY alumni_database_select_admins ON public.alumni_database FOR SELECT TO authenticated
  USING (public.is_site_admin() OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.user_id = auth.uid()));
