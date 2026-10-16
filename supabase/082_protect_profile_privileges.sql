-- Closes the "anyone can make themselves an admin" hole.
-- Before this, any signed-in user could UPDATE their own profile row (including `role`
-- and `community_id`), and anyone could sign up with `role: 'founder'` in the sign-up data.
-- Run once in the Supabase SQL editor.

-- ── 1. Sign-up: new accounts are always plain members ───────────────────────
-- (an admin-invited account, which has invited_at set, may still carry a role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username  text;
  final_username text;
  counter        integer := 0;
  default_community uuid;
  chosen_community  uuid;
  new_role       text;
BEGIN
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF length(base_username) < 3 THEN
    base_username := 'user' || base_username;
  END IF;
  final_username := coalesce(new.raw_user_meta_data->>'username', base_username);

  WHILE exists(SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  SELECT id INTO default_community FROM public.communities WHERE name = 'Catholic Indonesia' LIMIT 1;

  chosen_community := nullif(new.raw_user_meta_data->>'community_id', '')::uuid;
  IF chosen_community IS NOT NULL
     AND new.invited_at IS NULL
     AND NOT EXISTS (SELECT 1 FROM public.communities WHERE id = chosen_community AND is_public) THEN
    chosen_community := NULL;
  END IF;

  -- Never trust a role typed into the sign-up form
  new_role := CASE WHEN new.invited_at IS NOT NULL THEN coalesce(new.raw_user_meta_data->>'role', 'member') ELSE 'member' END;
  IF new_role IN ('founder', 'superadmin') THEN new_role := 'member'; END IF;

  INSERT INTO public.profiles(
    id, username, full_name, role, phone, community_id, camp_history, completed_modules
  )
  VALUES (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new_role::public.user_role,
    new.raw_user_meta_data->>'phone',
    coalesce(chosen_community, default_community),
    coalesce((new.raw_user_meta_data->>'camp_history')::jsonb, '[]'::jsonb),
    coalesce(
      array(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'completed_modules')),
      '{}'::text[]
    )
  );
  RETURN new;
END;
$$;

-- ── 2. Profile edits: members cannot change their own role or join private communities ──
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_role text;
  is_admin boolean;
BEGIN
  -- No end-user session: the service role, the SQL editor, and sign-up triggers pass through.
  IF auth.uid() IS NULL THEN
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

DROP TRIGGER IF EXISTS profiles_protect_privileges ON public.profiles;
CREATE TRIGGER profiles_protect_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

-- ── 3. Check: lists everyone who currently holds an elevated role ───────────
-- Review this after running; anyone you don't recognise should be set back to 'member'.
SELECT p.username, p.full_name, p.role::text AS role, u.email, p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role::text <> 'member'
ORDER BY p.role::text, p.created_at;
