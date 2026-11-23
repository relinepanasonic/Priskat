-- Each community keeps its own camp / event names (e.g. "Camp Sukses Sejati Katolik") so the next event is just picked.
-- Catholic Family Ministry keeps its fixed list in the app. Run once in the Supabase SQL editor. Safe to run again.
CREATE TABLE IF NOT EXISTS public.community_event_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 3 AND 120),
  created_by uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_event_names_unique ON public.community_event_names (community_id, lower(btrim(name)));
ALTER TABLE public.community_event_names ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS community_event_names_all ON public.community_event_names;
CREATE POLICY community_event_names_all ON public.community_event_names FOR ALL TO authenticated
  USING (public.can_manage_event_community(community_id)) WITH CHECK (public.can_manage_event_community(community_id));
