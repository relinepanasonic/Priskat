-- =============================================
-- 029: Communities Table
-- Multi-community support for Ruang Iman
-- =============================================

-- Communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_public BOOLEAN DEFAULT true NOT NULL,
  member_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "communities_select" ON public.communities;
DROP POLICY IF EXISTS "communities_insert" ON public.communities;
DROP POLICY IF EXISTS "communities_update" ON public.communities;

CREATE POLICY "communities_select" ON public.communities FOR SELECT TO authenticated USING (true);
CREATE POLICY "communities_insert" ON public.communities FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role()::text IN ('founder', 'superadmin'));
CREATE POLICY "communities_update" ON public.communities FOR UPDATE TO authenticated
  USING (public.get_my_role()::text IN ('founder', 'superadmin')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = id AND ca.user_id = auth.uid()));

-- Community admins (owner or admin per community)
CREATE TABLE IF NOT EXISTS public.community_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (community_id, user_id)
);

ALTER TABLE public.community_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_admins_select" ON public.community_admins;
DROP POLICY IF EXISTS "community_admins_insert" ON public.community_admins;
DROP POLICY IF EXISTS "community_admins_delete" ON public.community_admins;

CREATE POLICY "community_admins_select" ON public.community_admins FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_admins_insert" ON public.community_admins FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role()::text IN ('founder', 'superadmin'));
CREATE POLICY "community_admins_delete" ON public.community_admins FOR DELETE TO authenticated
  USING (public.get_my_role()::text IN ('founder', 'superadmin'));

-- Seed CFM as the first community
INSERT INTO public.communities (name, slug, description, is_public)
VALUES ('Catholic Family Ministry', 'cfm', 'Camp dan pelayanan keluarga Katolik', true)
ON CONFLICT (slug) DO NOTHING;
