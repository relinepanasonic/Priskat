-- Everyone joins "Catholic Indonesia" (public, main community) by default.
-- The "Ruang Iman" community / badge is only for the Ruang Iman team, assigned by admins.
-- Run once in the Supabase SQL editor.

-- ── 1. Make sure both communities exist ─────────────────────────────────────
INSERT INTO public.communities (name, slug, description, is_public)
SELECT 'Catholic Indonesia', 'catholic-indonesia',
       'Komunitas umum untuk seluruh umat Katolik Indonesia', true
WHERE NOT EXISTS (SELECT 1 FROM public.communities WHERE name = 'Catholic Indonesia');

INSERT INTO public.communities (name, slug, description, is_public)
SELECT 'Ruang Iman', 'ruang-iman', 'Tim Ruang Iman', false
WHERE NOT EXISTS (SELECT 1 FROM public.communities WHERE name = 'Ruang Iman');

-- Catholic Indonesia must be selectable by everyone
UPDATE public.communities SET is_public = true WHERE name = 'Catholic Indonesia';

-- ── 2. New sign-ups: default to Catholic Indonesia ──────────────────────────
-- A self-chosen community is only honoured if it is public (or the user was invited by an admin),
-- so nobody can sign themselves into the private Ruang Iman team community.
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

  INSERT INTO public.profiles(
    id, username, full_name, role, phone, community_id, camp_history, completed_modules
  )
  VALUES (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member'),
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

-- ── 3. Existing members without a community → Catholic Indonesia ────────────
UPDATE public.profiles
SET community_id = (SELECT id FROM public.communities WHERE name = 'Catholic Indonesia' LIMIT 1)
WHERE community_id IS NULL;

-- ── 4. OPTIONAL: put the Ruang Iman team in their own community ─────────────
-- Replace the emails with your team's, then un-comment and run.
-- UPDATE public.profiles p
-- SET community_id = (SELECT id FROM public.communities WHERE name = 'Ruang Iman' LIMIT 1)
-- FROM auth.users u
-- WHERE u.id = p.id AND u.email IN ('team1@example.com', 'team2@example.com');
-- (Admins can also do this per member in Admin → Members → Edit → Community.)
