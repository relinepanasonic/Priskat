-- Note: We assume ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'founder'; 
-- was already run successfully in the previous step.

-- Update the is_admin_or_mod helper function
create or replace function public.is_admin_or_mod()
returns boolean
language sql stable security definer
as $$
  select role in ('founder', 'superadmin', 'admin', 'moderator')
  from public.profiles where id = auth.uid();
$$;

-- Fix the Profiles Update Policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'))
  WITH CHECK (id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the Profiles Delete Policy
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the Events Delete Policy
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the News Delete Policy
DROP POLICY IF EXISTS "news_posts_delete_admin" ON public.news_posts;
CREATE POLICY "news_posts_delete_admin"
  ON public.news_posts FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the News Comments Delete Policy
DROP POLICY IF EXISTS "news_comments_delete" ON public.news_comments;
CREATE POLICY "news_comments_delete"
  ON public.news_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the Event RSVPs Update Policy
DROP POLICY IF EXISTS "event_rsvps_update" ON public.event_rsvps;
CREATE POLICY "event_rsvps_update"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'))
  WITH CHECK (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Fix the Event RSVPs Delete Policy
DROP POLICY IF EXISTS "event_rsvps_delete" ON public.event_rsvps;
CREATE POLICY "event_rsvps_delete"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin', 'founder'));

-- Ensure nicojapar@gmail.com becomes a founder
DO $$ 
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'nicojapar@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles SET role = 'founder' WHERE id = target_user_id;
    -- Also update raw_user_meta_data to keep it in sync in auth.users
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"founder"')
    WHERE id = target_user_id;
  END IF;
END $$;
