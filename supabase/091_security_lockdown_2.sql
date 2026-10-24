-- Security lockdown, part 2: storage buckets + what logged-out visitors can read from profiles.
-- Run once in the Supabase SQL editor (safe to run again). Uses is_site_admin() and is_admin_or_mod().

-- ── 1. Profiles: the public internet only sees name and photo ───────────────
-- profiles is readable without logging in (the anon key ships inside the app), so anyone could
-- download every member's phone number, birthdate, etc. Logged-out visitors now get only the
-- harmless columns; signed-in members keep full access as before.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, full_name, nama_panggilan, avatar_url, kota, community_id, role, created_at) ON public.profiles TO anon;

-- ── 2. Storage helpers ──────────────────────────────────────────────────────
-- Site admins, or an admin of the community whose id is the given folder name
CREATE OR REPLACE FUNCTION public.can_manage_community_folder(p_folder text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_site_admin()
      OR EXISTS (
        SELECT 1 FROM public.community_admins ca
        WHERE ca.user_id = auth.uid() AND ca.community_id::text = p_folder
      );
$$;

-- ── 3. profile-songs: everyone listens, people only change their own folder ─
DROP POLICY IF EXISTS "Auth Upload Profile Songs" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Profile Songs" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Profile Songs" ON storage.objects;
DROP POLICY IF EXISTS profile_songs_insert_own ON storage.objects;
DROP POLICY IF EXISTS profile_songs_update_own ON storage.objects;
DROP POLICY IF EXISTS profile_songs_delete_own ON storage.objects;
CREATE POLICY profile_songs_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-songs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY profile_songs_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-songs' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-songs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY profile_songs_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-songs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── 4. devotion-covers: admins and moderators only ──────────────────────────
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS devotion_covers_write ON storage.objects;
CREATE POLICY devotion_covers_write ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'devotion-covers' AND (public.is_site_admin() OR public.is_admin_or_mod()))
  WITH CHECK (bucket_id = 'devotion-covers' AND (public.is_site_admin() OR public.is_admin_or_mod()));

-- ── 5. communities: logos by site admins, gallery by that community's admins ─
--   logos/<file>               (Community Center, create/edit community)
--   gallery/<community id>/... (community gallery)
DROP POLICY IF EXISTS "Authenticated users can upload to communities" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update in communities" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from communities" ON storage.objects;
DROP POLICY IF EXISTS communities_bucket_write ON storage.objects;
CREATE POLICY communities_bucket_write ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'communities' AND (
      public.is_site_admin()
      OR ((storage.foldername(name))[1] = 'gallery' AND public.can_manage_community_folder((storage.foldername(name))[2]))
    )
  )
  WITH CHECK (
    bucket_id = 'communities' AND (
      public.is_site_admin()
      OR ((storage.foldername(name))[1] = 'gallery' AND public.can_manage_community_folder((storage.foldername(name))[2]))
    )
  );

-- ── 6. org-structure: <community id>/... by that community's admins ─────────
DROP POLICY IF EXISTS "Authenticated users can upload to org-structure" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update in org-structure" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from org-structure" ON storage.objects;
DROP POLICY IF EXISTS org_structure_bucket_write ON storage.objects;
CREATE POLICY org_structure_bucket_write ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'org-structure' AND public.can_manage_community_folder((storage.foldername(name))[1]))
  WITH CHECK (bucket_id = 'org-structure' AND public.can_manage_community_folder((storage.foldername(name))[1]));

-- (Public read policies for these buckets are unchanged.)
