-- A person can belong to several communities and picks ONE as their main community
-- (the one shown on their profile). Run after 086_onboarding_and_join.sql.

-- 1. Memberships (the main community stays in profiles.community_id)
CREATE TABLE IF NOT EXISTS public.community_memberships (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, community_id)
);
CREATE INDEX IF NOT EXISTS community_memberships_community_idx ON public.community_memberships (community_id);

-- Everyone who has a community today is a member of it
INSERT INTO public.community_memberships (user_id, community_id)
SELECT id, community_id FROM public.profiles WHERE community_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cm_select ON public.community_memberships;
CREATE POLICY cm_select ON public.community_memberships FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator')
  OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = community_memberships.community_id AND ca.user_id = auth.uid())
);
-- Writes only through the functions below (admins can still use the table editor / service role).

-- 2. Has the person chosen their main community yet?
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_community_chosen boolean NOT NULL DEFAULT false;

-- 3. New sign-ups are members of the community they start in
CREATE OR REPLACE FUNCTION public.add_membership_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.community_id IS NOT NULL THEN
    INSERT INTO public.community_memberships (user_id, community_id) VALUES (NEW.id, NEW.community_id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_add_membership ON public.profiles;
CREATE TRIGGER profiles_add_membership AFTER INSERT OR UPDATE OF community_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.add_membership_for_profile();

-- 4. Joining adds a membership; it no longer replaces the main community
CREATE OR REPLACE FUNCTION public.join_community(p_community_id uuid, p_answers jsonb DEFAULT '{}'::jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  c record;
  f jsonb;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.communities WHERE id = p_community_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Community not found.'; END IF;
  IF c.join_mode = 'closed' THEN RAISE EXCEPTION 'This community is by invitation only.' USING ERRCODE = '42501'; END IF;

  IF EXISTS (SELECT 1 FROM public.community_memberships WHERE user_id = uid AND community_id = p_community_id) THEN
    RETURN 'joined';
  END IF;

  IF c.join_mode = 'open' THEN
    INSERT INTO public.community_memberships (user_id, community_id) VALUES (uid, p_community_id) ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET main_community_chosen = false WHERE id = uid;  -- ask them to pick a main community
    RETURN 'joined';
  END IF;

  FOR f IN SELECT * FROM jsonb_array_elements(coalesce(c.join_fields, '[]'::jsonb)) LOOP
    IF coalesce((f->>'required')::boolean, false) AND coalesce(trim(p_answers->>(f->>'key')), '') = '' THEN
      RAISE EXCEPTION 'Please fill in: %', f->>'label';
    END IF;
  END LOOP;

  INSERT INTO public.community_join_requests (community_id, user_id, answers)
  VALUES (p_community_id, uid, coalesce(p_answers, '{}'::jsonb))
  ON CONFLICT DO NOTHING;
  RETURN 'pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_join_request(p_request_id uuid, p_approve boolean)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  r record;
  allowed boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO r FROM public.community_join_requests WHERE id = p_request_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found or already decided.'; END IF;

  allowed := coalesce(public.get_my_role()::text, 'member') IN ('founder', 'superadmin', 'admin', 'moderator')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = r.community_id AND ca.user_id = uid);
  IF NOT allowed THEN RAISE EXCEPTION 'Not allowed.' USING ERRCODE = '42501'; END IF;

  UPDATE public.community_join_requests
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END, decided_by = uid, decided_at = now()
  WHERE id = p_request_id;

  IF p_approve THEN
    INSERT INTO public.community_memberships (user_id, community_id) VALUES (r.user_id, r.community_id) ON CONFLICT DO NOTHING;
    -- Keep the camp they told us about on their journey
    IF coalesce(r.answers->>'camp', '') <> '' THEN
      PERFORM set_config('app.allow_community_change', 'on', true);
      UPDATE public.profiles
      SET camp_history = coalesce(camp_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
            'camp', r.answers->>'camp', 'angkatan', r.answers->>'angkatan', 'kota', r.answers->>'kota')),
          -- a second community means they should choose a main one
          main_community_chosen = false
      WHERE id = r.user_id;
    ELSE
      UPDATE public.profiles SET main_community_chosen = false WHERE id = r.user_id;
    END IF;
  END IF;
  RETURN CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END;
END;
$$;

-- 5. Choose the main community (must be one the person belongs to, or Catholic Indonesia)
CREATE OR REPLACE FUNCTION public.set_main_community(p_community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.community_memberships WHERE user_id = uid AND community_id = p_community_id)
     AND NOT EXISTS (SELECT 1 FROM public.communities WHERE id = p_community_id AND name = 'Catholic Indonesia') THEN
    RAISE EXCEPTION 'You are not a member of this community.' USING ERRCODE = '42501';
  END IF;
  PERFORM set_config('app.allow_community_change', 'on', true);
  INSERT INTO public.community_memberships (user_id, community_id) VALUES (uid, p_community_id) ON CONFLICT DO NOTHING;
  UPDATE public.profiles SET community_id = p_community_id, main_community_chosen = true WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_main_community(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_community(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_join_request(uuid, boolean) TO authenticated;
