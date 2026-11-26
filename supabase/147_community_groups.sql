-- Community Groups: sub-communities inside a community (by city, or by sister community).
--   * every Group has a leader (a member of the community) and its own members
--   * a person can be in many Groups
--   * people get in by invitation (they accept) or by asking to join (leader / community admin approves)
--   * every Group owns a private chat in the existing Community -> Messages -> Group; active members are
--     added to it and removed from it automatically, and the leader is the chat owner
-- Who can do what:
--   community admins / site admins : create, edit, delete Groups, set the leader, manage members
--   the Group's leader             : invite people, approve requests, remove members
--   community members              : see the Groups of their community, ask to join, answer invitations, leave
-- All writes go through the functions below (SECURITY DEFINER); the tables have no write policies.
-- Run once in the Supabase SQL editor, after 105_connect_groups.sql. Safe to run again.

-- ── Tables ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  kind text NOT NULL DEFAULT 'city' CHECK (kind IN ('city', 'sister_community')),
  area text CHECK (area IS NULL OR char_length(area) <= 80),            -- the city, or the sister community's name
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  leader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  chat_group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,   -- the Group's chat in Messages -> Group
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_groups_community_idx ON public.community_groups (community_id);

CREATE TABLE IF NOT EXISTS public.community_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'requested', 'active')),
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS community_group_members_user_idx ON public.community_group_members (user_id);

-- One hidden chat room per community holds all of its Groups' chats
CREATE TABLE IF NOT EXISTS public.community_group_rooms (
  community_id uuid PRIMARY KEY REFERENCES public.communities(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_rooms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_groups, public.community_group_members, public.community_group_rooms FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.community_groups, public.community_group_members, public.community_group_rooms FROM authenticated;

-- ── Who is who ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cgrp_in_community(p_community uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_memberships m WHERE m.community_id = p_community AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.cgrp_is_admin(p_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_groups g WHERE g.id = p_group AND public.community_admin_of(g.community_id));
$$;

CREATE OR REPLACE FUNCTION public.cgrp_is_leader(p_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_groups g WHERE g.id = p_group AND g.leader_id = auth.uid());
$$;

-- Admin or leader of the Group
CREATE OR REPLACE FUNCTION public.cgrp_can_manage(p_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.cgrp_is_admin(p_group) OR public.cgrp_is_leader(p_group);
$$;

-- ── Read access ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS cgrp_select ON public.community_groups;
CREATE POLICY cgrp_select ON public.community_groups FOR SELECT TO authenticated
  USING (public.community_admin_of(community_id) OR leader_id = auth.uid() OR public.cgrp_in_community(community_id));

DROP POLICY IF EXISTS cgrpm_select ON public.community_group_members;
CREATE POLICY cgrpm_select ON public.community_group_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.cgrp_can_manage(group_id));

-- ── Chat sync (internal) ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._cgrp_room(p_community uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r uuid;
BEGIN
  SELECT room_id INTO r FROM public.community_group_rooms WHERE community_id = p_community;
  IF r IS NULL THEN
    INSERT INTO public.rooms (name, created_by, owner_id, is_public, is_hidden)
    VALUES ((SELECT 'Group ' || coalesce(c.name, 'Community') FROM public.communities c WHERE c.id = p_community), auth.uid(), NULL, false, true)
    RETURNING id INTO r;
    INSERT INTO public.community_group_rooms (community_id, room_id) VALUES (p_community, r);
  END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public._cgrp_recount(p_chat uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.groups SET member_count = (SELECT count(*) FROM public.group_members WHERE group_id = p_chat AND status = 'accepted') WHERE id = p_chat;
$$;

CREATE OR REPLACE FUNCTION public._cgrp_chat_add(p_group uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE chat uuid; lead uuid; rid uuid;
BEGIN
  SELECT chat_group_id, leader_id INTO chat, lead FROM public.community_groups WHERE id = p_group;
  IF chat IS NULL THEN RETURN; END IF;
  SELECT room_id INTO rid FROM public.groups WHERE id = chat;
  INSERT INTO public.group_members (group_id, user_id, role, status)
  VALUES (chat, p_user, CASE WHEN p_user = lead THEN 'owner' ELSE 'member' END, 'accepted')
  ON CONFLICT (group_id, user_id) DO UPDATE SET status = 'accepted', role = EXCLUDED.role;
  IF rid IS NOT NULL THEN
    INSERT INTO public.room_members (room_id, user_id, role) VALUES (rid, p_user, 'member') ON CONFLICT (room_id, user_id) DO NOTHING;
  END IF;
  PERFORM public._cgrp_recount(chat);
END $$;

CREATE OR REPLACE FUNCTION public._cgrp_chat_remove(p_group uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE chat uuid; rid uuid;
BEGIN
  SELECT chat_group_id INTO chat FROM public.community_groups WHERE id = p_group;
  IF chat IS NULL THEN RETURN; END IF;
  SELECT room_id INTO rid FROM public.groups WHERE id = chat;
  DELETE FROM public.group_members WHERE group_id = chat AND user_id = p_user;
  -- leave the community's chat room only when no other Group chat in it still includes the person
  IF rid IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.group_members gm JOIN public.groups g ON g.id = gm.group_id
    WHERE g.room_id = rid AND gm.user_id = p_user AND gm.status = 'accepted'
  ) THEN
    DELETE FROM public.room_members WHERE room_id = rid AND user_id = p_user;
  END IF;
  PERFORM public._cgrp_recount(chat);
END $$;

-- ── Admin: create / edit / delete a Group ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_community_group(
  p_community uuid, p_name text, p_kind text, p_area text, p_description text, p_leader uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE gid uuid; chat uuid; rid uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.community_admin_of(p_community) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF p_leader IS NULL THEN RAISE EXCEPTION 'A Group needs a leader'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.community_memberships WHERE community_id = p_community AND user_id = p_leader) THEN
    RAISE EXCEPTION 'The leader must be a member of this community';
  END IF;

  INSERT INTO public.community_groups (community_id, name, kind, area, description, leader_id)
  VALUES (p_community, btrim(p_name), p_kind, nullif(btrim(p_area), ''), nullif(btrim(p_description), ''), p_leader)
  RETURNING id INTO gid;

  rid := public._cgrp_room(p_community);
  INSERT INTO public.groups (name, description, room_id, owner_id, is_private, member_count)
  VALUES (btrim(p_name), nullif(btrim(p_description), ''), rid, p_leader, true, 0)
  RETURNING id INTO chat;
  INSERT INTO public.group_subgroups (group_id, name) VALUES (chat, 'main');
  UPDATE public.community_groups SET chat_group_id = chat WHERE id = gid;

  INSERT INTO public.community_group_members (group_id, user_id, status, invited_by) VALUES (gid, p_leader, 'active', auth.uid());
  PERFORM public._cgrp_chat_add(gid, p_leader);
  RETURN gid;
END $$;

CREATE OR REPLACE FUNCTION public.update_community_group(
  p_group uuid, p_name text, p_kind text, p_area text, p_description text, p_leader uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.community_groups%ROWTYPE;
BEGIN
  SELECT * INTO g FROM public.community_groups WHERE id = p_group;
  IF g.id IS NULL THEN RAISE EXCEPTION 'Group not found'; END IF;
  IF auth.uid() IS NULL OR NOT public.community_admin_of(g.community_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF p_leader IS NULL THEN RAISE EXCEPTION 'A Group needs a leader'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.community_memberships WHERE community_id = g.community_id AND user_id = p_leader) THEN
    RAISE EXCEPTION 'The leader must be a member of this community';
  END IF;

  UPDATE public.community_groups
     SET name = btrim(p_name), kind = p_kind, area = nullif(btrim(p_area), ''), description = nullif(btrim(p_description), ''), leader_id = p_leader
   WHERE id = p_group;

  IF g.chat_group_id IS NOT NULL THEN
    UPDATE public.groups SET name = btrim(p_name), description = nullif(btrim(p_description), ''), owner_id = p_leader WHERE id = g.chat_group_id;
  END IF;

  IF g.leader_id IS DISTINCT FROM p_leader THEN
    -- the new leader is always an active member (and the chat owner); the old one stays as an ordinary member
    INSERT INTO public.community_group_members (group_id, user_id, status, invited_by)
    VALUES (p_group, p_leader, 'active', auth.uid())
    ON CONFLICT (group_id, user_id) DO UPDATE SET status = 'active';
    IF g.chat_group_id IS NOT NULL AND g.leader_id IS NOT NULL THEN
      UPDATE public.group_members SET role = 'member' WHERE group_id = g.chat_group_id AND user_id = g.leader_id;
    END IF;
    PERFORM public._cgrp_chat_add(p_group, p_leader);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.delete_community_group(p_group uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE chat uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.cgrp_is_admin(p_group) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT chat_group_id INTO chat FROM public.community_groups WHERE id = p_group;
  DELETE FROM public.community_groups WHERE id = p_group;
  IF chat IS NOT NULL THEN DELETE FROM public.groups WHERE id = chat; END IF;   -- takes the chat and its messages with it
END $$;

-- ── Membership: invite, ask, answer, decide, remove ─────────────────────────
-- Admin or leader invites a community member (or accepts their pending request)
CREATE OR REPLACE FUNCTION public.invite_to_community_group(p_group uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid; cur text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.cgrp_can_manage(p_group) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT community_id INTO cid FROM public.community_groups WHERE id = p_group;
  IF NOT EXISTS (SELECT 1 FROM public.community_memberships WHERE community_id = cid AND user_id = p_user) THEN
    RAISE EXCEPTION 'This person is not a member of the community';
  END IF;
  SELECT status INTO cur FROM public.community_group_members WHERE group_id = p_group AND user_id = p_user;
  IF cur = 'active' OR cur = 'invited' THEN RETURN; END IF;
  IF cur = 'requested' THEN
    UPDATE public.community_group_members SET status = 'active' WHERE group_id = p_group AND user_id = p_user;
    PERFORM public._cgrp_chat_add(p_group, p_user);
  ELSE
    INSERT INTO public.community_group_members (group_id, user_id, status, invited_by) VALUES (p_group, p_user, 'invited', auth.uid());
  END IF;
END $$;

-- A community member asks to join (or accepts an invitation that is waiting)
CREATE OR REPLACE FUNCTION public.request_join_community_group(p_group uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid; cur text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT community_id INTO cid FROM public.community_groups WHERE id = p_group;
  IF cid IS NULL OR NOT public.cgrp_in_community(cid) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT status INTO cur FROM public.community_group_members WHERE group_id = p_group AND user_id = auth.uid();
  IF cur = 'active' OR cur = 'requested' THEN RETURN; END IF;
  IF cur = 'invited' THEN
    UPDATE public.community_group_members SET status = 'active' WHERE group_id = p_group AND user_id = auth.uid();
    PERFORM public._cgrp_chat_add(p_group, auth.uid());
  ELSE
    INSERT INTO public.community_group_members (group_id, user_id, status) VALUES (p_group, auth.uid(), 'requested');
  END IF;
END $$;

-- The invited person accepts or declines
CREATE OR REPLACE FUNCTION public.respond_community_group_invite(p_group uuid, p_accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.community_group_members WHERE group_id = p_group AND user_id = auth.uid() AND status = 'invited') THEN
    RAISE EXCEPTION 'No invitation found';
  END IF;
  IF p_accept THEN
    UPDATE public.community_group_members SET status = 'active' WHERE group_id = p_group AND user_id = auth.uid();
    PERFORM public._cgrp_chat_add(p_group, auth.uid());
  ELSE
    DELETE FROM public.community_group_members WHERE group_id = p_group AND user_id = auth.uid();
  END IF;
END $$;

-- Admin or leader approves / rejects a request
CREATE OR REPLACE FUNCTION public.decide_community_group_request(p_group uuid, p_user uuid, p_approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.cgrp_can_manage(p_group) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.community_group_members WHERE group_id = p_group AND user_id = p_user AND status = 'requested') THEN
    RAISE EXCEPTION 'No request found';
  END IF;
  IF p_approve THEN
    UPDATE public.community_group_members SET status = 'active' WHERE group_id = p_group AND user_id = p_user;
    PERFORM public._cgrp_chat_add(p_group, p_user);
  ELSE
    DELETE FROM public.community_group_members WHERE group_id = p_group AND user_id = p_user;
  END IF;
END $$;

-- Remove a member / cancel an invitation (admin or leader), or leave the Group yourself. The leader cannot be removed.
CREATE OR REPLACE FUNCTION public.remove_community_group_member(p_group uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF p_user <> auth.uid() AND NOT public.cgrp_can_manage(p_group) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF EXISTS (SELECT 1 FROM public.community_groups WHERE id = p_group AND leader_id = p_user) THEN
    RAISE EXCEPTION 'Change the leader first';
  END IF;
  DELETE FROM public.community_group_members WHERE group_id = p_group AND user_id = p_user;
  PERFORM public._cgrp_chat_remove(p_group, p_user);
END $$;

-- Internal helpers are not callable from the app; the rest is for signed-in people only
REVOKE ALL ON FUNCTION public._cgrp_room(uuid), public._cgrp_recount(uuid), public._cgrp_chat_add(uuid, uuid), public._cgrp_chat_remove(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION
  public.cgrp_in_community(uuid), public.cgrp_is_admin(uuid), public.cgrp_is_leader(uuid), public.cgrp_can_manage(uuid),
  public.create_community_group(uuid, text, text, text, text, uuid), public.update_community_group(uuid, text, text, text, text, uuid),
  public.delete_community_group(uuid), public.invite_to_community_group(uuid, uuid), public.request_join_community_group(uuid),
  public.respond_community_group_invite(uuid, boolean), public.decide_community_group_request(uuid, uuid, boolean),
  public.remove_community_group_member(uuid, uuid)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.cgrp_in_community(uuid), public.cgrp_is_admin(uuid), public.cgrp_is_leader(uuid), public.cgrp_can_manage(uuid),
  public.create_community_group(uuid, text, text, text, text, uuid), public.update_community_group(uuid, text, text, text, text, uuid),
  public.delete_community_group(uuid), public.invite_to_community_group(uuid, uuid), public.request_join_community_group(uuid),
  public.respond_community_group_invite(uuid, boolean), public.decide_community_group_request(uuid, uuid, boolean),
  public.remove_community_group_member(uuid, uuid)
TO authenticated;
