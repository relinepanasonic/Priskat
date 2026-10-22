-- Security lockdown, part 1 (from the pg_policies audit of tables a..e).
-- Before this, ANY signed-in user could edit or delete camp crews, tasks, meetings, chats,
-- collaborators and all devotion content. Run once in the Supabase SQL editor.
-- It relies on is_site_admin() and is_admin_or_mod(), which already exist in your database.

-- ── Helpers ─────────────────────────────────────────────────────────────────
-- Site admins, or an admin of the community that owns the camp
CREATE OR REPLACE FUNCTION public.can_manage_cohort(p_cohort uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_site_admin()
      OR EXISTS (
        SELECT 1 FROM public.camp_cohorts cc
        JOIN public.community_admins ca ON ca.community_id = cc.community_id
        WHERE cc.id = p_cohort AND ca.user_id = auth.uid()
      );
$$;

-- Managers, plus the people who serve in that camp
CREATE OR REPLACE FUNCTION public.can_access_cohort(p_cohort uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.can_manage_cohort(p_cohort)
      OR EXISTS (SELECT 1 FROM public.camp_crew cr WHERE cr.cohort_id = p_cohort AND cr.user_id = auth.uid());
$$;

-- ── camp_crew: anyone may read (kept), only managers change ─────────────────
DROP POLICY IF EXISTS "Allow authenticated insert to camp_crew" ON public.camp_crew;
DROP POLICY IF EXISTS "Allow authenticated update to camp_crew" ON public.camp_crew;
DROP POLICY IF EXISTS "Allow authenticated delete from camp_crew" ON public.camp_crew;
CREATE POLICY camp_crew_insert ON public.camp_crew FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_cohort(cohort_id) OR (cohort_id IS NULL AND public.is_site_admin()));
CREATE POLICY camp_crew_update ON public.camp_crew FOR UPDATE TO authenticated
  USING (public.can_manage_cohort(cohort_id) OR (cohort_id IS NULL AND public.is_site_admin()))
  WITH CHECK (public.can_manage_cohort(cohort_id) OR (cohort_id IS NULL AND public.is_site_admin()));
CREATE POLICY camp_crew_delete ON public.camp_crew FOR DELETE TO authenticated
  USING (public.can_manage_cohort(cohort_id) OR (cohort_id IS NULL AND public.is_site_admin()));

-- ── camp_tasks / camp_meetings / camp_chats: only people in that camp ───────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['camp_tasks', 'camp_meetings', 'camp_chats'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated read access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.can_access_cohort(cohort_id))', t || '_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_access_cohort(cohort_id))', t || '_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_access_cohort(cohort_id)) WITH CHECK (public.can_access_cohort(cohort_id))', t || '_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_access_cohort(cohort_id))', t || '_delete', t);
  END LOOP;
END $$;

-- ── collaborators: public read (kept), site admins write ────────────────────
DROP POLICY IF EXISTS "Allow all access for authenticated users on collaborators" ON public.collaborators;
CREATE POLICY collaborators_admin_write ON public.collaborators FOR ALL TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());

-- ── Devotion content: everyone reads (kept), only admins / moderators change ─
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('devotion_categories', 'Categories are deletable by admins.', 'Categories are insertable by admins.', 'Categories are updatable by admins.'),
      ('devotion_day_verses', 'Verses are deletable by admins.',     'Verses are insertable by admins.',     'Verses are updatable by admins.'),
      ('devotion_plan_days',  'Days are deletable by admins.',       'Days are insertable by admins.',       'Days are updatable by admins.'),
      ('devotion_plans',      'Plans are deletable by admins.',      'Plans are insertable by admins.',      'Plans are updatable by admins.')
    ) AS v(tbl, del_policy, ins_policy, upd_policy)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %L ON public.%I', rec.del_policy, rec.tbl);
    EXECUTE format('DROP POLICY IF EXISTS %L ON public.%I', rec.ins_policy, rec.tbl);
    EXECUTE format('DROP POLICY IF EXISTS %L ON public.%I', rec.upd_policy, rec.tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_site_admin() OR public.is_admin_or_mod())', rec.tbl || '_admin_insert', rec.tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_site_admin() OR public.is_admin_or_mod()) WITH CHECK (public.is_site_admin() OR public.is_admin_or_mod())', rec.tbl || '_admin_update', rec.tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_site_admin() OR public.is_admin_or_mod())', rec.tbl || '_admin_delete', rec.tbl);
  END LOOP;
END $$;

-- ── Bug: community admins could never edit their own community ─────────────
-- The old rule compared community_admins.community_id with community_admins.id (never true).
DROP POLICY IF EXISTS communities_update ON public.communities;
CREATE POLICY communities_update ON public.communities FOR UPDATE TO authenticated
  USING (
    public.get_my_role()::text IN ('founder', 'superadmin')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = communities.id AND ca.user_id = auth.uid())
  )
  WITH CHECK (
    public.get_my_role()::text IN ('founder', 'superadmin')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = communities.id AND ca.user_id = auth.uid())
  );
