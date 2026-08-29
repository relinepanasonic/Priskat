-- Run this AFTER 026_add_founder_role.sql (which adds 'founder' to user_role enum)
-- This script safely drops and recreates policies that may have partially executed

-- ==============================================================================
-- PART 1: CREATE TABLES
-- ==============================================================================

-- -----------------------------------------------
-- 1. Friendships
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (requester_id, receiver_id)
);

-- -----------------------------------------------
-- 2. Extend community_posts
-- -----------------------------------------------
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0 NOT NULL;

-- -----------------------------------------------
-- 3. Post Likes
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (post_id, user_id)
);

-- -----------------------------------------------
-- 4. Post Comments
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.community_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- 5. Groups
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT true NOT NULL,
  member_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- 6. Group Members
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (group_id, user_id)
);

-- -----------------------------------------------
-- 7. Group Subgroups
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_subgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- 8. Group Messages
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subgroup_id UUID NOT NULL REFERENCES public.group_subgroups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- PART 2: ENABLE ROW LEVEL SECURITY & CREATE POLICIES
-- ==============================================================================

-- 1. Friendships Policies
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friendships_select" ON public.friendships;
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
DROP POLICY IF EXISTS "friendships_update" ON public.friendships;
DROP POLICY IF EXISTS "friendships_delete" ON public.friendships;

CREATE POLICY "friendships_select" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships_insert" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update" ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = requester_id);
CREATE POLICY "friendships_delete" ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 3. Post Likes Policies
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes_select" ON public.community_post_likes;
DROP POLICY IF EXISTS "likes_insert" ON public.community_post_likes;
DROP POLICY IF EXISTS "likes_delete" ON public.community_post_likes;

CREATE POLICY "likes_select" ON public.community_post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_insert" ON public.community_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.community_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Post Comments Policies
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON public.community_post_comments;
DROP POLICY IF EXISTS "comments_insert" ON public.community_post_comments;
DROP POLICY IF EXISTS "comments_delete" ON public.community_post_comments;

CREATE POLICY "comments_select" ON public.community_post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON public.community_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON public.community_post_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.get_my_role()::text IN ('admin', 'superadmin', 'founder'));

-- 5. Groups Policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "groups_delete" ON public.groups;

CREATE POLICY "groups_select" ON public.groups FOR SELECT TO authenticated USING (
  NOT is_private OR
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.status = 'accepted')
);
CREATE POLICY "groups_insert" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "groups_delete" ON public.groups FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- 6. Group Members Policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;

CREATE POLICY "group_members_select" ON public.group_members FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);
CREATE POLICY "group_members_update" ON public.group_members FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role IN ('admin', 'owner'))
);
CREATE POLICY "group_members_delete" ON public.group_members FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);

-- 7. Group Subgroups Policies
ALTER TABLE public.group_subgroups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subgroups_select" ON public.group_subgroups;
DROP POLICY IF EXISTS "subgroups_insert" ON public.group_subgroups;
DROP POLICY IF EXISTS "subgroups_delete" ON public.group_subgroups;

CREATE POLICY "subgroups_select" ON public.group_subgroups FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'accepted')
);
CREATE POLICY "subgroups_insert" ON public.group_subgroups FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role IN ('admin', 'owner') AND gm.status = 'accepted')
);
CREATE POLICY "subgroups_delete" ON public.group_subgroups FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid())
);

-- 8. Group Messages Policies
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
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.group_subgroups gs
    JOIN public.group_members gm ON gm.group_id = gs.group_id
    WHERE gs.id = subgroup_id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
  )
);
CREATE POLICY "messages_delete" ON public.group_messages FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Enable Realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
