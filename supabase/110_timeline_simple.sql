-- Timeline made simpler: two levels of who can see an event.
--   tagged  : only the owner and the people tagged
--   friends : also the owner's friends (this is the default)
-- The "network" level of 109 is removed; events that used it become "friends".
-- Run once in the Supabase SQL editor after 109_timeline.sql. Safe to run again.

UPDATE public.timeline_events SET visibility = 'friends' WHERE visibility = 'network';
ALTER TABLE public.timeline_events DROP CONSTRAINT IF EXISTS timeline_events_visibility_check;
ALTER TABLE public.timeline_events ADD CONSTRAINT timeline_events_visibility_check CHECK (visibility IN ('tagged', 'friends'));
ALTER TABLE public.timeline_events ALTER COLUMN visibility SET DEFAULT 'friends';

CREATE OR REPLACE FUNCTION public.timeline_can_see(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.timeline_events e
    WHERE e.id = p_event AND (
      e.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.timeline_participants p WHERE p.event_id = e.id AND p.user_id = auth.uid() AND p.status <> 'declined')
      OR (e.visibility = 'friends' AND public.are_friends(e.owner_id, auth.uid()))
    )
  );
$$;

-- The owner always sees and edits their own row directly (a function that re-reads the table cannot see a row
-- that is being inserted or returned in the same statement)
DROP POLICY IF EXISTS timeline_events_read ON public.timeline_events;
CREATE POLICY timeline_events_read ON public.timeline_events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.timeline_can_see(id));
DROP POLICY IF EXISTS timeline_events_update ON public.timeline_events;
CREATE POLICY timeline_events_update ON public.timeline_events FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.timeline_can_edit(id)) WITH CHECK (owner_id = auth.uid() OR public.timeline_can_edit(id));
