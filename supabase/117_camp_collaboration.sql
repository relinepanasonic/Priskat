-- Camp collaboration: an admin shares a camp with another community (it also shows in that community's Camp Directory)
-- or with a person (it appears in that person's Timeline Saya as an invitation they accept or decline).
-- Replaces "Move to another community". Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.camp_collaborations (
  cohort_id uuid NOT NULL REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, community_id)
);
ALTER TABLE public.camp_collaborations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS camp_collab_read ON public.camp_collaborations;
CREATE POLICY camp_collab_read ON public.camp_collaborations FOR SELECT TO authenticated USING (true);
-- writes only through the functions below

ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS camp_cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.camp_collab_community(p_cohort uuid, p_community uuid, p_add boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Hanya admin yang bisa berkolaborasi.' USING ERRCODE = '42501'; END IF;
  IF p_add THEN
    IF EXISTS (SELECT 1 FROM public.camp_cohorts WHERE id = p_cohort AND community_id = p_community) THEN
      RAISE EXCEPTION 'Camp ini sudah milik komunitas itu.';
    END IF;
    INSERT INTO public.camp_collaborations (cohort_id, community_id) VALUES (p_cohort, p_community) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.camp_collaborations WHERE cohort_id = p_cohort AND community_id = p_community;
  END IF;
END;
$$;

-- Invite a person (any member, not only friends) to a camp: creates (once) a timeline event for the camp and tags them
CREATE OR REPLACE FUNCTION public.camp_collab_person(p_cohort uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; ev uuid; ttl text;
BEGIN
  IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Hanya admin yang bisa berkolaborasi.' USING ERRCODE = '42501'; END IF;
  IF p_user = auth.uid() THEN RAISE EXCEPTION 'Kamu sudah ada di camp ini.'; END IF;
  SELECT * INTO c FROM public.camp_cohorts WHERE id = p_cohort;
  IF NOT FOUND THEN RAISE EXCEPTION 'Camp tidak ditemukan.'; END IF;
  ttl := coalesce(c.custom_name, c.camp_name || coalesce(' ' || c.angkatan::text, ''));
  SELECT id INTO ev FROM public.timeline_events WHERE camp_cohort_id = p_cohort AND owner_id = auth.uid() LIMIT 1;
  IF ev IS NULL THEN
    INSERT INTO public.timeline_events (owner_id, title, starts_at, notes, visibility, camp_cohort_id)
    VALUES (auth.uid(), left(ttl, 120), coalesce(c.start_date::timestamptz, now()), 'Kolaborasi camp', 'tagged', p_cohort)
    RETURNING id INTO ev;
  END IF;
  INSERT INTO public.timeline_participants (event_id, user_id) VALUES (ev, p_user) ON CONFLICT (event_id, user_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.camp_collab_community(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.camp_collab_person(uuid, uuid) TO authenticated;
