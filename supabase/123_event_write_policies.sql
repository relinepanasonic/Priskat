-- "new row violates row-level security policy for table events" when creating an event.
-- Cause: only is_admin_or_mod() could insert or update events. The live version of that function does not always include
-- the Founder, and it never includes a community admin, so a community admin could not create an event for their community.
-- Now: site admins (founder, superadmin, admin), the old admin/moderator check, and the admins of the event's own community
-- can create, change and delete that community's events. Reading is unchanged except that these people also see drafts.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE OR REPLACE FUNCTION public.can_manage_event_community(p_community uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_site_admin() OR coalesce(public.is_admin_or_mod(), false)
      OR (p_community IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.community_admins ca WHERE ca.community_id = p_community AND ca.user_id = auth.uid()));
$$;
GRANT EXECUTE ON FUNCTION public.can_manage_event_community(uuid) TO authenticated;

DROP POLICY IF EXISTS events_insert_admin_mod ON public.events;
DROP POLICY IF EXISTS events_update_admin_mod ON public.events;
DROP POLICY IF EXISTS events_delete_admin ON public.events;
DROP POLICY IF EXISTS events_select_published ON public.events;
DROP POLICY IF EXISTS events_insert_manage ON public.events;
DROP POLICY IF EXISTS events_update_manage ON public.events;
DROP POLICY IF EXISTS events_delete_manage ON public.events;

CREATE POLICY events_select_published ON public.events FOR SELECT
  USING (status = 'published' OR public.can_manage_event_community(community_id));
CREATE POLICY events_insert_manage ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_event_community(community_id));
CREATE POLICY events_update_manage ON public.events FOR UPDATE TO authenticated
  USING (public.can_manage_event_community(community_id)) WITH CHECK (public.can_manage_event_community(community_id));
CREATE POLICY events_delete_manage ON public.events FOR DELETE TO authenticated
  USING (public.can_manage_event_community(community_id));
