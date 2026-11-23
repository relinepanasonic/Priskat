-- Camp and Event are one thing: Event. Every event can open the same workspace a camp had
-- (crew, to do, meetings, chat) and now a simple Keuangan (money in and out).
-- Run once in the Supabase SQL editor. Safe to run again.

-- An event points to its workspace (made the first time it is opened)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE SET NULL;

-- Open (and create when missing) the workspace of an event. Community admins and site admins only.
CREATE OR REPLACE FUNCTION public.event_workspace(p_event uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev record; cid uuid; nm text;
BEGIN
  SELECT * INTO ev FROM public.events WHERE id = p_event;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event tidak ditemukan.'; END IF;
  IF NOT (public.is_site_admin() OR EXISTS (
        SELECT 1 FROM public.community_admins ca WHERE ca.community_id = ev.community_id AND ca.user_id = auth.uid())) THEN
    RAISE EXCEPTION 'Hanya admin yang bisa membuka workspace event.' USING ERRCODE = '42501';
  END IF;
  IF ev.cohort_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.camp_cohorts WHERE id = ev.cohort_id) THEN RETURN ev.cohort_id; END IF;

  -- camp_cohorts is unique on (branch, camp_name, angkatan): the event id keeps every event apart
  INSERT INTO public.camp_cohorts (branch, camp_name, angkatan, start_date, custom_name, community_id, banner_url)
  VALUES ('Umum', 'Other', left(ev.id::text, 8), (ev.event_date)::date, ev.title, ev.community_id, ev.banner_image_url)
  RETURNING id INTO cid;
  UPDATE public.events SET cohort_id = cid WHERE id = p_event;

  -- the person who opens it is the Ketua of the crew
  SELECT coalesce(full_name, username, 'Ketua') INTO nm FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.camp_crew (cohort_id, branch, camp, angkatan, name, position, user_id, profile_id)
  VALUES (cid, 'Umum', 'Other', left(ev.id::text, 8), nm, 'Ketua', auth.uid(), auth.uid());
  RETURN cid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.event_workspace(uuid) TO authenticated;

-- Keuangan: simple money in and out per event / camp
CREATE TABLE IF NOT EXISTS public.camp_finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('masuk', 'keluar')),
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 160),
  amount bigint NOT NULL CHECK (amount > 0),
  entry_date date NOT NULL DEFAULT current_date,
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  created_by uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS camp_finance_cohort_idx ON public.camp_finance (cohort_id, entry_date);
ALTER TABLE public.camp_finance ENABLE ROW LEVEL SECURITY;

-- Who may write: managers (admins of the community), the Ketua and the Bendahara of that event's crew
CREATE OR REPLACE FUNCTION public.can_edit_finance(p_cohort uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_manage_cohort(p_cohort) OR EXISTS (
    SELECT 1 FROM public.camp_crew cr
    WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND lower(coalesce(cr.position, '')) ~ '(ketua|bendahara|treasurer)'
  );
$$;
GRANT EXECUTE ON FUNCTION public.can_edit_finance(uuid) TO authenticated;

DROP POLICY IF EXISTS camp_finance_select ON public.camp_finance;
DROP POLICY IF EXISTS camp_finance_insert ON public.camp_finance;
DROP POLICY IF EXISTS camp_finance_update ON public.camp_finance;
DROP POLICY IF EXISTS camp_finance_delete ON public.camp_finance;
CREATE POLICY camp_finance_select ON public.camp_finance FOR SELECT TO authenticated USING (public.can_access_cohort(cohort_id));
CREATE POLICY camp_finance_insert ON public.camp_finance FOR INSERT TO authenticated WITH CHECK (public.can_edit_finance(cohort_id));
CREATE POLICY camp_finance_update ON public.camp_finance FOR UPDATE TO authenticated USING (public.can_edit_finance(cohort_id)) WITH CHECK (public.can_edit_finance(cohort_id));
CREATE POLICY camp_finance_delete ON public.camp_finance FOR DELETE TO authenticated USING (public.can_edit_finance(cohort_id));
