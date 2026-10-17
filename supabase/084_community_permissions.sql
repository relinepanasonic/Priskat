-- Who may change what (run once in the Supabase SQL editor):
--   * Uskup (dioceses) and Romo (clergy): only admin, superadmin and founder — not members,
--     moderators, or community admins.
--   * CFM camps (camp_cohorts): only admin, superadmin and founder can add / edit / delete camps.
--     (Before this, ANY signed-in user could write to camp_cohorts directly.)
--   * Coverage branches: only admin, superadmin and founder.

CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce(public.get_my_role()::text IN ('founder', 'superadmin', 'admin'), false);
$$;

-- Catholic Indonesia content editors = site admins only
CREATE OR REPLACE FUNCTION public.is_ci_editor()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_site_admin();
$$;

-- ── Camps ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow superadmin insert" ON public.camp_cohorts;
DROP POLICY IF EXISTS "Allow superadmin update" ON public.camp_cohorts;
DROP POLICY IF EXISTS "Allow superadmin delete" ON public.camp_cohorts;
DROP POLICY IF EXISTS "camp_cohorts_admin_insert" ON public.camp_cohorts;
DROP POLICY IF EXISTS "camp_cohorts_admin_update" ON public.camp_cohorts;
DROP POLICY IF EXISTS "camp_cohorts_admin_delete" ON public.camp_cohorts;

CREATE POLICY "camp_cohorts_admin_insert" ON public.camp_cohorts FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "camp_cohorts_admin_update" ON public.camp_cohorts FOR UPDATE TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "camp_cohorts_admin_delete" ON public.camp_cohorts FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── Coverage branches ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all access for authenticated users on branches" ON public.branches;
DROP POLICY IF EXISTS "branches_admin_write" ON public.branches;
CREATE POLICY "branches_admin_write" ON public.branches FOR ALL TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
