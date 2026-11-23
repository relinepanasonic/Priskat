-- Event pictures (banner / poster) failed with "new row violates row-level security policy".
-- Cause: the event-banners bucket only let is_admin_or_mod() upload, and the live version of that function does not
-- always include the Founder, and never includes a community admin. Now: site admins (founder, superadmin, admin),
-- the old admin/moderator check, and the admins of any community may upload, replace and delete event pictures.
-- Run once in the Supabase SQL editor. Safe to run again.

DROP POLICY IF EXISTS event_banners_insert_admin_mod ON storage.objects;
DROP POLICY IF EXISTS event_banners_update_admin_mod ON storage.objects;
DROP POLICY IF EXISTS event_banners_delete_admin_mod ON storage.objects;
DROP POLICY IF EXISTS event_banners_write ON storage.objects;

CREATE POLICY event_banners_write ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'event-banners' AND (
      public.is_site_admin() OR public.is_admin_or_mod()
      OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.user_id = auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'event-banners' AND (
      public.is_site_admin() OR public.is_admin_or_mod()
      OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.user_id = auth.uid())
    )
  );
