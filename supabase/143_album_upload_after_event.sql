-- Album: the camera is only for the event itself, but photos can be uploaded from the phone gallery afterwards.
-- So adding photos no longer depends on the event being on; only attendees (and the event's admins) may add them.
-- (The app turns the camera button off after the event.)
-- Run once in the Supabase SQL editor. Safe to run again.

DROP POLICY IF EXISTS event_photos_insert ON public.event_photos;
CREATE POLICY event_photos_insert ON public.event_photos FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid() AND public.event_attendee(event_id));

DROP POLICY IF EXISTS event_photos_storage_insert ON storage.objects;
CREATE POLICY event_photos_storage_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (CASE WHEN bucket_id = 'event-photos' THEN public.event_attendee(((storage.foldername(name))[1])::uuid) ELSE false END);

SELECT policyname FROM pg_policies WHERE tablename = 'event_photos' OR policyname = 'event_photos_storage_insert';
