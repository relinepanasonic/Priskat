-- Add 'superadmin' to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Update the is_admin_or_mod helper function
create or replace function public.is_admin_or_mod()
returns boolean
language sql stable security definer
as $$
  select role in ('superadmin', 'admin', 'moderator')
  from public.profiles where id = auth.uid();
$$;

-- Fix the Profiles Update Policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'))
  WITH CHECK (id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the Profiles Delete Policy
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the Events Delete Policy
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  USING (public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the News Delete Policy
DROP POLICY IF EXISTS "news_posts_delete_admin" ON public.news_posts;
CREATE POLICY "news_posts_delete_admin"
  ON public.news_posts FOR DELETE
  USING (public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the News Comments Delete Policy
DROP POLICY IF EXISTS "news_comments_delete" ON public.news_comments;
CREATE POLICY "news_comments_delete"
  ON public.news_comments FOR DELETE
  USING (author_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the Event RSVPs Update Policy
DROP POLICY IF EXISTS "event_rsvps_update" ON public.event_rsvps;
CREATE POLICY "event_rsvps_update"
  ON public.event_rsvps FOR UPDATE
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'))
  WITH CHECK (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'));

-- Fix the Event RSVPs Delete Policy
DROP POLICY IF EXISTS "event_rsvps_delete" ON public.event_rsvps;
CREATE POLICY "event_rsvps_delete"
  ON public.event_rsvps FOR DELETE
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'superadmin'));


