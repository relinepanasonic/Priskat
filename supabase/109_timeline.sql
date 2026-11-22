-- Personal timeline inside "Pelayanan Saya" (Beranda): your own events, tagged friends and collaborators.
-- Who can see an event (the owner picks one level per event):
--   tagged   : only the owner and the people tagged in it
--   friends  : also the owner's friends
--   network  : also the collaborators of the owner's friends (people who are in an event that a friend of the owner owns)
-- Tagging: only friends can be tagged. A tagged person accepts or declines; a collaborator can be allowed to edit.
-- Nobody writes the participants table directly: tagging, answering and editor rights go through the functions below.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE OR REPLACE FUNCTION public.are_friends(a uuid, b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a IS NOT NULL AND b IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted' AND ((f.requester_id = a AND f.receiver_id = b) OR (f.requester_id = b AND f.receiver_id = a))
  );
$$;

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  place text CHECK (place IS NULL OR char_length(place) <= 200),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  visibility text NOT NULL DEFAULT 'network' CHECK (visibility IN ('tagged', 'friends', 'network')),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,   -- optional link to a community event
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS timeline_events_owner_idx ON public.timeline_events (owner_id, starts_at);
CREATE INDEX IF NOT EXISTS timeline_events_start_idx ON public.timeline_events (starts_at);

CREATE TABLE IF NOT EXISTS public.timeline_participants (
  event_id uuid NOT NULL REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  can_edit boolean NOT NULL DEFAULT false,
  invited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS timeline_participants_user_idx ON public.timeline_participants (user_id, status);

-- May the signed-in person see this event?
CREATE OR REPLACE FUNCTION public.timeline_can_see(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.timeline_events e
    WHERE e.id = p_event AND (
      e.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.timeline_participants p WHERE p.event_id = e.id AND p.user_id = auth.uid() AND p.status <> 'declined')
      OR (e.visibility IN ('friends', 'network') AND public.are_friends(e.owner_id, auth.uid()))
      OR (e.visibility = 'network' AND EXISTS (
            SELECT 1 FROM public.timeline_participants p2
            JOIN public.timeline_events e2 ON e2.id = p2.event_id
            WHERE p2.user_id = auth.uid() AND p2.status = 'accepted' AND e2.owner_id <> e.owner_id
              AND public.are_friends(e2.owner_id, e.owner_id)))
    )
  );
$$;

-- May the signed-in person change this event? (the owner, or a collaborator who accepted and was given edit rights)
CREATE OR REPLACE FUNCTION public.timeline_can_edit(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.timeline_events e
    WHERE e.id = p_event AND (
      e.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.timeline_participants p WHERE p.event_id = e.id AND p.user_id = auth.uid() AND p.status = 'accepted' AND p.can_edit)
    )
  );
$$;

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS timeline_events_read ON public.timeline_events;
CREATE POLICY timeline_events_read ON public.timeline_events FOR SELECT TO authenticated USING (public.timeline_can_see(id));
DROP POLICY IF EXISTS timeline_events_insert ON public.timeline_events;
CREATE POLICY timeline_events_insert ON public.timeline_events FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS timeline_events_update ON public.timeline_events;
CREATE POLICY timeline_events_update ON public.timeline_events FOR UPDATE TO authenticated
  USING (public.timeline_can_edit(id)) WITH CHECK (public.timeline_can_edit(id));
DROP POLICY IF EXISTS timeline_events_delete ON public.timeline_events;
CREATE POLICY timeline_events_delete ON public.timeline_events FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS timeline_participants_read ON public.timeline_participants;
CREATE POLICY timeline_participants_read ON public.timeline_participants FOR SELECT TO authenticated USING (public.timeline_can_see(event_id));
-- no insert / update policies: see the functions below. The owner may remove a participant, and a person may leave.
DROP POLICY IF EXISTS timeline_participants_delete ON public.timeline_participants;
CREATE POLICY timeline_participants_delete ON public.timeline_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.timeline_events e WHERE e.id = event_id AND e.owner_id = auth.uid()));

-- Tag a friend (the owner, or a collaborator with edit rights, may tag; only friends of the tagger)
CREATE OR REPLACE FUNCTION public.timeline_tag(p_event uuid, p_user uuid, p_can_edit boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  IF NOT public.timeline_can_edit(p_event) THEN RAISE EXCEPTION 'Tidak diizinkan.' USING ERRCODE = '42501'; END IF;
  IF p_user = auth.uid() THEN RAISE EXCEPTION 'Kamu sudah ada di acara ini.'; END IF;
  IF NOT public.are_friends(auth.uid(), p_user) THEN RAISE EXCEPTION 'Hanya teman yang bisa ditandai.'; END IF;
  SELECT count(*) INTO n FROM public.timeline_participants WHERE event_id = p_event;
  IF n >= 30 THEN RAISE EXCEPTION 'Maksimal 30 orang per acara.'; END IF;
  -- only the owner can give edit rights
  IF p_can_edit AND NOT EXISTS (SELECT 1 FROM public.timeline_events WHERE id = p_event AND owner_id = auth.uid()) THEN p_can_edit := false; END IF;
  INSERT INTO public.timeline_participants (event_id, user_id, can_edit) VALUES (p_event, p_user, p_can_edit)
  ON CONFLICT (event_id, user_id) DO UPDATE SET can_edit = EXCLUDED.can_edit;
END;
$$;

CREATE OR REPLACE FUNCTION public.timeline_respond(p_event uuid, p_accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.timeline_participants SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,
         can_edit = CASE WHEN p_accept THEN can_edit ELSE false END
  WHERE event_id = p_event AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Ajakan tidak ditemukan.'; END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeline_can_see(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeline_can_edit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeline_tag(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeline_respond(uuid, boolean) TO authenticated;
