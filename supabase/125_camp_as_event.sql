-- A camp becomes an event the first time its registration link is made (Link Peserta), so camps and events
-- share Peserta, QR & Absensi and Promosi. Run once in the Supabase SQL editor after 124. Safe to run again.

CREATE OR REPLACE FUNCTION public.camp_make_event(p_cohort uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; ev uuid; nm text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.camp_cohorts WHERE id = p_cohort;
  IF NOT FOUND THEN RAISE EXCEPTION 'Camp tidak ditemukan.'; END IF;
  IF NOT (public.is_site_admin() OR EXISTS (
        SELECT 1 FROM public.community_admins ca WHERE ca.community_id = c.community_id AND ca.user_id = auth.uid())) THEN
    RAISE EXCEPTION 'Hanya admin yang bisa membuat link pendaftaran.' USING ERRCODE = '42501';
  END IF;

  -- already has an event: use it
  SELECT id INTO ev FROM public.events WHERE cohort_id = p_cohort LIMIT 1;
  IF ev IS NOT NULL THEN
    INSERT INTO public.event_reg_settings (event_id) VALUES (ev) ON CONFLICT (event_id) DO NOTHING;
    RETURN ev;
  END IF;

  nm := coalesce(c.custom_name, c.camp_name || coalesce(' ' || c.angkatan, ''));
  INSERT INTO public.events (author_id, title, description, event_date, location, community_id, status, event_type, cohort_id, banner_image_url)
  VALUES (auth.uid(), left(nm, 200), coalesce(nullif(btrim(c.branch), ''), 'Camp'),
          coalesce(c.start_date::timestamptz, now()), coalesce(c.branch, ''), c.community_id,
          'published', coalesce(c.camp_name, 'Camp'), p_cohort, c.banner_url)
  RETURNING id INTO ev;
  INSERT INTO public.event_reg_settings (event_id) VALUES (ev) ON CONFLICT (event_id) DO NOTHING;
  RETURN ev;
END;
$$;
GRANT EXECUTE ON FUNCTION public.camp_make_event(uuid) TO authenticated;
