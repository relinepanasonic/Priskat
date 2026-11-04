-- Connect Groups (CG): small groups inside a community, each with a PIC, pengurus, anggota and an event log.
-- Who can do what:
--   community admins / site admins : create and edit CGs, set PIC and pengurus, everything below
--   PIC and pengurus of a CG       : see their CG, add / edit / remove ordinary anggota, keep the event log
--   everyone else                  : nothing (member phone numbers and addresses stay private)
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.connect_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  address text CHECK (address IS NULL OR char_length(address) <= 300),
  event_day smallint CHECK (event_day BETWEEN 1 AND 7),   -- 1 = Monday ... 7 = Sunday
  event_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS connect_groups_community_idx ON public.connect_groups (community_id);

CREATE TABLE IF NOT EXISTS public.connect_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cg_id uuid NOT NULL REFERENCES public.connect_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,   -- the person's app account (needed for PIC / pengurus)
  role text NOT NULL DEFAULT 'anggota' CHECK (role IN ('pic', 'pengurus', 'anggota')),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  baptism_name text CHECK (baptism_name IS NULL OR char_length(baptism_name) <= 120),
  priskat_ke text CHECK (priskat_ke IS NULL OR char_length(priskat_ke) <= 20),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  address text CHECK (address IS NULL OR char_length(address) <= 300),
  joined_at date NOT NULL DEFAULT current_date,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS connect_group_members_cg_idx ON public.connect_group_members (cg_id);
CREATE UNIQUE INDEX IF NOT EXISTS connect_group_members_one_account
  ON public.connect_group_members (cg_id, user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.connect_group_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cg_id uuid NOT NULL REFERENCES public.connect_groups(id) ON DELETE CASCADE,
  event_date date NOT NULL DEFAULT current_date,
  attendees integer NOT NULL DEFAULT 0 CHECK (attendees BETWEEN 0 AND 10000),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 160),
  memo text CHECK (memo IS NULL OR char_length(memo) <= 2000),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS connect_group_logs_cg_idx ON public.connect_group_logs (cg_id, event_date DESC);

-- The colour of the PIC and pengurus rows, chosen by the community admin
CREATE TABLE IF NOT EXISTS public.connect_group_colors (
  community_id uuid PRIMARY KEY REFERENCES public.communities(id) ON DELETE CASCADE,
  pic_color text NOT NULL DEFAULT '#D6B072' CHECK (pic_color ~ '^#[0-9a-fA-F]{6}$'),
  pengurus_color text NOT NULL DEFAULT '#38BDF8' CHECK (pengurus_color ~ '^#[0-9a-fA-F]{6}$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Who is who (SECURITY DEFINER so the policies below do not loop through their own tables)
CREATE OR REPLACE FUNCTION public.community_admin_of(p_community uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_site_admin()
      OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = p_community AND ca.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.cg_is_admin(p_cg uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.connect_groups g WHERE g.id = p_cg AND public.community_admin_of(g.community_id));
$$;

CREATE OR REPLACE FUNCTION public.cg_is_leader(p_cg uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.connect_group_members m WHERE m.cg_id = p_cg AND m.user_id = auth.uid() AND m.role IN ('pic', 'pengurus'));
$$;

CREATE OR REPLACE FUNCTION public.cg_leads_in_community(p_community uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connect_group_members m JOIN public.connect_groups g ON g.id = m.cg_id
    WHERE g.community_id = p_community AND m.user_id = auth.uid() AND m.role IN ('pic', 'pengurus')
  );
$$;

ALTER TABLE public.connect_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_group_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_group_colors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.connect_groups, public.connect_group_members, public.connect_group_logs, public.connect_group_colors FROM anon;

-- Groups: admins manage; leaders can see their own
DROP POLICY IF EXISTS cg_select ON public.connect_groups;
DROP POLICY IF EXISTS cg_insert ON public.connect_groups;
DROP POLICY IF EXISTS cg_update ON public.connect_groups;
DROP POLICY IF EXISTS cg_delete ON public.connect_groups;
CREATE POLICY cg_select ON public.connect_groups FOR SELECT TO authenticated USING (public.cg_is_admin(id) OR public.cg_is_leader(id));
CREATE POLICY cg_insert ON public.connect_groups FOR INSERT TO authenticated WITH CHECK (public.community_admin_of(community_id));
CREATE POLICY cg_update ON public.connect_groups FOR UPDATE TO authenticated USING (public.cg_is_admin(id)) WITH CHECK (public.community_admin_of(community_id));
CREATE POLICY cg_delete ON public.connect_groups FOR DELETE TO authenticated USING (public.cg_is_admin(id));

-- Members: admins do everything; PIC and pengurus add and manage ordinary anggota only (never PIC / pengurus)
DROP POLICY IF EXISTS cgm_select ON public.connect_group_members;
DROP POLICY IF EXISTS cgm_insert ON public.connect_group_members;
DROP POLICY IF EXISTS cgm_update ON public.connect_group_members;
DROP POLICY IF EXISTS cgm_delete ON public.connect_group_members;
CREATE POLICY cgm_select ON public.connect_group_members FOR SELECT TO authenticated USING (public.cg_is_admin(cg_id) OR public.cg_is_leader(cg_id));
CREATE POLICY cgm_insert ON public.connect_group_members FOR INSERT TO authenticated
  WITH CHECK (public.cg_is_admin(cg_id) OR (public.cg_is_leader(cg_id) AND role = 'anggota'));
CREATE POLICY cgm_update ON public.connect_group_members FOR UPDATE TO authenticated
  USING (public.cg_is_admin(cg_id) OR (public.cg_is_leader(cg_id) AND role = 'anggota'))
  WITH CHECK (public.cg_is_admin(cg_id) OR (public.cg_is_leader(cg_id) AND role = 'anggota'));
CREATE POLICY cgm_delete ON public.connect_group_members FOR DELETE TO authenticated
  USING (public.cg_is_admin(cg_id) OR (public.cg_is_leader(cg_id) AND role = 'anggota'));

-- Event log: admins and the group's leaders
DROP POLICY IF EXISTS cgl_all ON public.connect_group_logs;
CREATE POLICY cgl_all ON public.connect_group_logs FOR ALL TO authenticated
  USING (public.cg_is_admin(cg_id) OR public.cg_is_leader(cg_id))
  WITH CHECK (public.cg_is_admin(cg_id) OR public.cg_is_leader(cg_id));

-- Colours: leaders read, community admins write
DROP POLICY IF EXISTS cgc_select ON public.connect_group_colors;
DROP POLICY IF EXISTS cgc_insert ON public.connect_group_colors;
DROP POLICY IF EXISTS cgc_update ON public.connect_group_colors;
CREATE POLICY cgc_select ON public.connect_group_colors FOR SELECT TO authenticated
  USING (public.community_admin_of(community_id) OR public.cg_leads_in_community(community_id));
CREATE POLICY cgc_insert ON public.connect_group_colors FOR INSERT TO authenticated WITH CHECK (public.community_admin_of(community_id));
CREATE POLICY cgc_update ON public.connect_group_colors FOR UPDATE TO authenticated
  USING (public.community_admin_of(community_id)) WITH CHECK (public.community_admin_of(community_id));

-- The helper functions are for signed-in members only
REVOKE ALL ON FUNCTION public.community_admin_of(uuid), public.cg_is_admin(uuid), public.cg_is_leader(uuid), public.cg_leads_in_community(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.community_admin_of(uuid), public.cg_is_admin(uuid), public.cg_is_leader(uuid), public.cg_leads_in_community(uuid) TO authenticated;
