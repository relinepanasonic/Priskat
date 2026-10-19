-- Onboarding wizard + joining communities with admin approval.
-- Run once in the Supabase SQL editor.

-- 1. Wizard flag: everyone who exists today skips the wizard
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
UPDATE public.profiles SET onboarded_at = now() WHERE onboarded_at IS NULL;

-- 2. How each community accepts new members
--   open    : joining is instant
--   request : the user asks, a community admin approves (optional extra questions in join_fields)
--   closed  : only admins can add members (e.g. the Ruang Iman team)
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS join_mode text NOT NULL DEFAULT 'open';
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_join_mode_check;
ALTER TABLE public.communities ADD CONSTRAINT communities_join_mode_check CHECK (join_mode IN ('open', 'request', 'closed'));
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS join_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.communities SET join_mode = 'request' WHERE is_public = false AND join_mode = 'open';
UPDATE public.communities SET join_mode = 'open'    WHERE name = 'Catholic Indonesia';
UPDATE public.communities SET join_mode = 'closed'  WHERE name = 'Ruang Iman';

-- Catholic Family Ministry asks about the camp the person attended
UPDATE public.communities
SET join_mode = 'request',
    join_fields = '[
      {"key":"camp","label":"Camp Modul 1","type":"select","required":true,
       "options":["Pria Sejati","Patriot","Wanita Berhikmat","Young Man","Young Woman"]},
      {"key":"angkatan","label":"Angkatan","type":"text","required":true,"placeholder":"mis. 2024"},
      {"key":"kota","label":"Kota Camp","type":"text","required":true,"placeholder":"mis. Jakarta"}
    ]'::jsonb
WHERE name ILIKE '%family ministry%' OR slug ILIKE 'cfm%';

-- 3. Requests
CREATE TABLE IF NOT EXISTS public.community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by uuid REFERENCES public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_join_requests_one_pending
  ON public.community_join_requests (community_id, user_id) WHERE status = 'pending';

ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS jr_select ON public.community_join_requests;
CREATE POLICY jr_select ON public.community_join_requests FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator')
  OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = community_join_requests.community_id AND ca.user_id = auth.uid())
);
-- No insert/update policies: requests are made and decided only through the functions below.

-- 4. Profile guard: let the functions below change community_id
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_role text;
  is_admin boolean;
BEGIN
  IF auth.uid() IS NULL OR current_setting('app.allow_community_change', true) = 'on' THEN
    RETURN NEW;
  END IF;

  caller_role := coalesce(public.get_my_role()::text, 'member');
  is_admin := caller_role IN ('admin', 'superadmin', 'founder');

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.role::text = 'founder' THEN
      RAISE EXCEPTION 'The founder role cannot be changed.' USING ERRCODE = '42501';
    END IF;
    IF NOT is_admin THEN
      RAISE EXCEPTION 'You are not allowed to change roles.' USING ERRCODE = '42501';
    END IF;
    IF NEW.role::text IN ('founder', 'superadmin') AND caller_role <> 'founder' THEN
      RAISE EXCEPTION 'Only the founder can assign this role.' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.community_id IS DISTINCT FROM OLD.community_id AND NOT is_admin AND NEW.community_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.communities WHERE id = NEW.community_id AND is_public) THEN
      RAISE EXCEPTION 'You cannot join a private community yourself.' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Join (instant) or ask to join (needs approval)
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

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND community_id = p_community_id) THEN
    RETURN 'joined';
  END IF;

  IF c.join_mode = 'open' THEN
    PERFORM set_config('app.allow_community_change', 'on', true);
    UPDATE public.profiles SET community_id = p_community_id WHERE id = uid;
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

-- 6. A community admin approves or rejects
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
    PERFORM set_config('app.allow_community_change', 'on', true);
    UPDATE public.profiles
    SET community_id = r.community_id,
        camp_history = CASE
          WHEN coalesce(r.answers->>'camp', '') <> '' THEN
            coalesce(camp_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
              'camp', r.answers->>'camp', 'angkatan', r.answers->>'angkatan', 'kota', r.answers->>'kota'))
          ELSE camp_history
        END
    WHERE id = r.user_id;
  END IF;
  RETURN CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_community(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_join_request(uuid, boolean) TO authenticated;
