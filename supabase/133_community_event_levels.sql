-- Levels in a community and in an event.
--
-- COMMUNITY
--   Super admin (community_admins.role = 'owner' or 'superadmin'): edits the community profile and assigns the admins of THIS community.
--                Cannot delete the community or add another one, and cannot work in another community.
--   Admin (role = 'admin'): sees the dashboard and the profile, adds and accepts anggota, makes Komsel and events.
--   Member: none of the above.
-- EVENT (levels that last only while the event is open: closed by an admin, or 7 days after it ends)
--   Ketua: assigned by an admin when the event is made. Does Tentang, the crew, and may add people to the community. Cannot make events.
--   Panitia Tinggi (Ketua, Wakil Ketua, Sekretaris, Bendahara): everything in the event except deleting it.
--   PIC of a division (Perlengkapan, Doa, Konsumsi ...): makes meetings and to do's, and builds the team of their own division.
--   Crew: sees, chats, and takes part.
-- Run once in the Supabase SQL editor after 132. Safe to run again.

-- ── Community levels ────────────────────────────────────────────────────────
ALTER TABLE public.community_admins DROP CONSTRAINT IF EXISTS community_admins_role_check;
ALTER TABLE public.community_admins ADD CONSTRAINT community_admins_role_check CHECK (role IN ('owner', 'admin', 'superadmin'));

CREATE OR REPLACE FUNCTION public.community_superadmin_of(p_community uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_site_admin()
      OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = p_community AND ca.user_id = auth.uid() AND ca.role IN ('owner', 'superadmin'));
$$;
GRANT EXECUTE ON FUNCTION public.community_superadmin_of(uuid) TO authenticated;

-- Only the community's Super admin (or the site's admins) edits the community profile; adding or deleting a community stays with the site
DROP POLICY IF EXISTS communities_update ON public.communities;
CREATE POLICY communities_update ON public.communities FOR UPDATE TO authenticated
  USING (public.community_superadmin_of(id)) WITH CHECK (public.community_superadmin_of(id));

-- A community Super admin assigns and removes the Admins of their own community (not other Super admins)
DROP POLICY IF EXISTS community_admins_insert ON public.community_admins;
DROP POLICY IF EXISTS community_admins_delete ON public.community_admins;
CREATE POLICY community_admins_insert ON public.community_admins FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role()::text IN ('founder', 'superadmin') OR (role = 'admin' AND public.community_superadmin_of(community_id)));
CREATE POLICY community_admins_delete ON public.community_admins FOR DELETE TO authenticated
  USING (public.get_my_role()::text IN ('founder', 'superadmin') OR (role = 'admin' AND public.community_superadmin_of(community_id)));

-- ── Event levels ────────────────────────────────────────────────────────────
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE public.camp_crew ADD COLUMN IF NOT EXISTS is_pic boolean NOT NULL DEFAULT false;

-- Open until an admin closes it, or 7 days after it ends
CREATE OR REPLACE FUNCTION public.event_is_open(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event AND e.closed_at IS NULL AND now() < coalesce(e.end_date, e.event_date) + interval '7 days');
$$;
GRANT EXECUTE ON FUNCTION public.event_is_open(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.crew_is_tinggi(p_position text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(btrim(coalesce(p_position, ''))) IN ('ketua', 'wakil ketua', 'sekretaris', 'sekertaris', 'bendahara');
$$;

-- Ketua, Wakil Ketua, Sekretaris, Bendahara of an event, while it is open (replaces the version of 126)
CREATE OR REPLACE FUNCTION public.event_finance_crew(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.event_is_open(p_event) AND EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.camp_crew cr ON cr.cohort_id = e.cohort_id
    WHERE e.id = p_event AND cr.user_id = auth.uid() AND public.crew_is_tinggi(cr.position)
  );
$$;

CREATE OR REPLACE FUNCTION public.event_ketua_of(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.event_is_open(p_event) AND EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.camp_crew cr ON cr.cohort_id = e.cohort_id
    WHERE e.id = p_event AND cr.user_id = auth.uid() AND lower(btrim(coalesce(cr.position, ''))) = 'ketua'
  );
$$;
GRANT EXECUTE ON FUNCTION public.event_ketua_of(uuid) TO authenticated;

-- A camp or event workspace: still open for its crew's special powers?
CREATE OR REPLACE FUNCTION public.cohort_open(p_cohort uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.events e WHERE e.cohort_id = p_cohort AND NOT public.event_is_open(e.id));
$$;

CREATE OR REPLACE FUNCTION public.cohort_tinggi_of(p_cohort uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.cohort_open(p_cohort) AND EXISTS (
    SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND public.crew_is_tinggi(cr.position));
$$;

CREATE OR REPLACE FUNCTION public.cohort_pic_any(p_cohort uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.cohort_open(p_cohort) AND EXISTS (
    SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND cr.is_pic);
$$;

CREATE OR REPLACE FUNCTION public.cohort_pic_in(p_cohort uuid, p_position text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.cohort_open(p_cohort) AND EXISTS (
    SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND cr.is_pic
      AND lower(btrim(coalesce(cr.position, ''))) = lower(btrim(coalesce(p_position, ''))));
$$;

-- Who may make meetings and to do's: managers, Panitia Tinggi, and the PIC of any division
CREATE OR REPLACE FUNCTION public.can_lead_cohort(p_cohort uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_manage_cohort(p_cohort) OR public.cohort_tinggi_of(p_cohort) OR public.cohort_pic_any(p_cohort);
$$;

-- Who may change the crew list: managers do everything; Panitia Tinggi everything but the Ketua row; a PIC only their own division
CREATE OR REPLACE FUNCTION public.can_edit_crew(p_cohort uuid, p_position text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_manage_cohort(p_cohort) OR (
    lower(btrim(coalesce(p_position, ''))) <> 'ketua' AND (public.cohort_tinggi_of(p_cohort) OR public.cohort_pic_in(p_cohort, p_position)));
$$;
GRANT EXECUTE ON FUNCTION public.can_lead_cohort(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_crew(uuid, text) TO authenticated;

-- my level in a workspace, for the screens: {"role": manager | ketua | tinggi | pic | crew, "division": "Doa"}
CREATE OR REPLACE FUNCTION public.cohort_my_role(p_cohort uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r text; d text;
BEGIN
  IF public.can_manage_cohort(p_cohort) THEN RETURN jsonb_build_object('role', 'manager', 'division', NULL); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid()) THEN RETURN jsonb_build_object('role', NULL, 'division', NULL); END IF;
  IF public.cohort_open(p_cohort) THEN
    IF EXISTS (SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND lower(btrim(coalesce(cr.position, ''))) = 'ketua') THEN r := 'ketua';
    ELSIF public.cohort_tinggi_of(p_cohort) THEN r := 'tinggi';
    ELSIF public.cohort_pic_any(p_cohort) THEN
      r := 'pic';
      SELECT cr.position INTO d FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid() AND cr.is_pic LIMIT 1;
    END IF;
  END IF;
  RETURN jsonb_build_object('role', coalesce(r, 'crew'), 'division', d);
END;
$$;
GRANT EXECUTE ON FUNCTION public.cohort_my_role(uuid) TO authenticated;

-- ── Policies ────────────────────────────────────────────────────────────────
-- crew list
DROP POLICY IF EXISTS camp_crew_insert ON public.camp_crew;
DROP POLICY IF EXISTS camp_crew_update ON public.camp_crew;
DROP POLICY IF EXISTS camp_crew_delete ON public.camp_crew;
CREATE POLICY camp_crew_insert ON public.camp_crew FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_crew(cohort_id, position) OR (cohort_id IS NULL AND public.is_site_admin()));
CREATE POLICY camp_crew_update ON public.camp_crew FOR UPDATE TO authenticated
  USING (public.can_edit_crew(cohort_id, position) OR (cohort_id IS NULL AND public.is_site_admin()))
  WITH CHECK (public.can_edit_crew(cohort_id, position) OR (cohort_id IS NULL AND public.is_site_admin()));
CREATE POLICY camp_crew_delete ON public.camp_crew FOR DELETE TO authenticated
  USING (public.can_edit_crew(cohort_id, position) OR (cohort_id IS NULL AND public.is_site_admin()));

-- meetings and to do's: leaders only (everybody in the crew still reads them)
DROP POLICY IF EXISTS camp_meetings_insert ON public.camp_meetings;
DROP POLICY IF EXISTS camp_meetings_update ON public.camp_meetings;
DROP POLICY IF EXISTS camp_meetings_delete ON public.camp_meetings;
CREATE POLICY camp_meetings_insert ON public.camp_meetings FOR INSERT TO authenticated WITH CHECK (public.can_lead_cohort(cohort_id));
CREATE POLICY camp_meetings_update ON public.camp_meetings FOR UPDATE TO authenticated USING (public.can_lead_cohort(cohort_id)) WITH CHECK (public.can_lead_cohort(cohort_id));
CREATE POLICY camp_meetings_delete ON public.camp_meetings FOR DELETE TO authenticated USING (public.can_lead_cohort(cohort_id));

DROP POLICY IF EXISTS camp_tasks_insert ON public.camp_tasks;
DROP POLICY IF EXISTS camp_tasks_update ON public.camp_tasks;
DROP POLICY IF EXISTS camp_tasks_delete ON public.camp_tasks;
CREATE POLICY camp_tasks_insert ON public.camp_tasks FOR INSERT TO authenticated WITH CHECK (public.can_lead_cohort(cohort_id));
-- the person a task is given to may tick it
CREATE POLICY camp_tasks_update ON public.camp_tasks FOR UPDATE TO authenticated
  USING (public.can_lead_cohort(cohort_id) OR (assigned_to = auth.uid() AND public.can_access_cohort(cohort_id)))
  WITH CHECK (public.can_lead_cohort(cohort_id) OR (assigned_to = auth.uid() AND public.can_access_cohort(cohort_id)));
CREATE POLICY camp_tasks_delete ON public.camp_tasks FOR DELETE TO authenticated USING (public.can_lead_cohort(cohort_id));

-- the event itself: edited by community admins and by Panitia Tinggi (the Ketua too) while it is open; deleted only by community admins
DROP POLICY IF EXISTS events_update_manage ON public.events;
CREATE POLICY events_update_manage ON public.events FOR UPDATE TO authenticated
  USING (public.can_manage_event_community(community_id) OR public.event_finance_crew(id))
  WITH CHECK (public.can_manage_event_community(community_id) OR public.event_finance_crew(id));

-- ── Functions the screens call ──────────────────────────────────────────────
-- Every event made by an admin gets one Ketua (replaces the earlier one)
CREATE OR REPLACE FUNCTION public.assign_event_ketua(p_event uuid, p_user uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev record; cid uuid; nm text;
BEGIN
  SELECT * INTO ev FROM public.events WHERE id = p_event;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event tidak ditemukan.'; END IF;
  IF NOT public.can_manage_event_community(ev.community_id) THEN RAISE EXCEPTION 'Hanya admin komunitas yang bisa menunjuk Ketua.' USING ERRCODE = '42501'; END IF;
  SELECT coalesce(full_name, username) INTO nm FROM public.profiles WHERE id = p_user;
  IF nm IS NULL THEN RAISE EXCEPTION 'Akun Ketua tidak ditemukan.'; END IF;

  cid := ev.cohort_id;
  IF cid IS NULL OR NOT EXISTS (SELECT 1 FROM public.camp_cohorts WHERE id = cid) THEN
    INSERT INTO public.camp_cohorts (branch, camp_name, angkatan, start_date, custom_name, community_id, banner_url)
    VALUES ('Umum', 'Event', left(ev.id::text, 8), (ev.event_date)::date, ev.title, ev.community_id, ev.banner_image_url)
    RETURNING id INTO cid;
    UPDATE public.events SET cohort_id = cid WHERE id = p_event;
  END IF;
  DELETE FROM public.camp_crew WHERE cohort_id = cid AND lower(btrim(coalesce(position, ''))) = 'ketua';
  INSERT INTO public.camp_crew (cohort_id, branch, camp, angkatan, name, position, user_id, profile_id)
  VALUES (cid, 'Umum', 'Event', left(ev.id::text, 8), nm, 'Ketua', p_user, p_user);
  RETURN cid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.assign_event_ketua(uuid, uuid) TO authenticated;

-- The Ketua brings an outsider into the community, only while he is Ketua of an open event
CREATE OR REPLACE FUNCTION public.ketua_add_member(p_event uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid;
BEGIN
  SELECT community_id INTO cid FROM public.events WHERE id = p_event;
  IF cid IS NULL THEN RAISE EXCEPTION 'Event ini tidak punya komunitas.'; END IF;
  IF NOT (public.can_manage_event_community(cid) OR public.event_ketua_of(p_event)) THEN
    RAISE EXCEPTION 'Hanya Ketua event yang masih berjalan, atau admin komunitas, yang bisa menambahkan anggota.' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.community_memberships (user_id, community_id) VALUES (p_user, cid) ON CONFLICT DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.ketua_add_member(uuid, uuid) TO authenticated;

-- Close an event (the Ketua level and the other event powers end) or open it again
CREATE OR REPLACE FUNCTION public.close_event(p_event uuid, p_closed boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid;
BEGIN
  SELECT community_id INTO cid FROM public.events WHERE id = p_event;
  IF NOT public.can_manage_event_community(cid) THEN RAISE EXCEPTION 'Hanya admin komunitas yang bisa menutup event.' USING ERRCODE = '42501'; END IF;
  UPDATE public.events SET closed_at = CASE WHEN p_closed THEN now() ELSE NULL END WHERE id = p_event;
END;
$$;
GRANT EXECUTE ON FUNCTION public.close_event(uuid, boolean) TO authenticated;
