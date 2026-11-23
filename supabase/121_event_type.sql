-- Every event has a type (Event, Camp type, KKR, Persekutuan Doa, Konser, ...) shown on its card.
-- Run once in the Supabase SQL editor after 120. Safe to run again.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'Event';

-- The workspace of an event is a camp_cohorts row named after the event (its type is read from events.event_type)
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
  VALUES ('Umum', 'Event', left(ev.id::text, 8), (ev.event_date)::date, ev.title, ev.community_id, ev.banner_image_url)
  RETURNING id INTO cid;
  UPDATE public.events SET cohort_id = cid WHERE id = p_event;

  SELECT coalesce(full_name, username, 'Ketua') INTO nm FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.camp_crew (cohort_id, branch, camp, angkatan, name, position, user_id, profile_id)
  VALUES (cid, 'Umum', 'Event', left(ev.id::text, 8), nm, 'Ketua', auth.uid(), auth.uid());
  RETURN cid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.event_workspace(uuid) TO authenticated;
