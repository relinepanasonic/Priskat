-- 048_group_rls_repair.sql
-- Re-applies the Row Level Security policies for the group-chat tables.
-- 027_community_social.sql created these, but if that script stopped early
-- (e.g. the community_post_comments policy referenced public.get_my_role()
-- before it existed) the policies below may be missing, which makes
-- "New group" fail silently. This migration is idempotent — safe to re-run.

-- ---------------------------------------------------------------- groups ---
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "groups_delete" ON public.groups;

CREATE POLICY "groups_select" ON public.groups FOR SELECT TO authenticated USING (
  NOT is_private
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
  )
);
CREATE POLICY "groups_insert" ON public.groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "groups_delete" ON public.groups FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- -------------------------------------------------------- group_members ---
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;

CREATE POLICY "group_members_select" ON public.group_members FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);
CREATE POLICY "group_members_update" ON public.group_members FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'owner')
  )
);
CREATE POLICY "group_members_delete" ON public.group_members FOR DELETE TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);

-- ------------------------------------------------------ group_subgroups ---
ALTER TABLE public.group_subgroups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subgroups_select" ON public.group_subgroups;
DROP POLICY IF EXISTS "subgroups_insert" ON public.group_subgroups;
DROP POLICY IF EXISTS "subgroups_delete" ON public.group_subgroups;

CREATE POLICY "subgroups_select" ON public.group_subgroups FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_subgroups.group_id AND gm.user_id = auth.uid()
      AND gm.status = 'accepted'
  )
);
CREATE POLICY "subgroups_insert" ON public.group_subgroups FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_subgroups.group_id AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'owner') AND gm.status = 'accepted'
  )
);
CREATE POLICY "subgroups_delete" ON public.group_subgroups FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);

-- ------------------------------------------------------- group_messages ---
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select" ON public.group_messages;
DROP POLICY IF EXISTS "messages_insert" ON public.group_messages;
DROP POLICY IF EXISTS "messages_delete" ON public.group_messages;

CREATE POLICY "messages_select" ON public.group_messages FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.group_subgroups gs
    JOIN public.group_members gm ON gm.group_id = gs.group_id
    WHERE gs.id = subgroup_id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
  )
);
CREATE POLICY "messages_insert" ON public.group_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.group_subgroups gs
    JOIN public.group_members gm ON gm.group_id = gs.group_id
    WHERE gs.id = subgroup_id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
  )
);
CREATE POLICY "messages_delete" ON public.group_messages FOR DELETE TO authenticated
  USING (auth.uid() = author_id);
