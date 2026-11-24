-- Event album: everyone who attends an event takes photos with the app or uploads them to the event's shared album.
-- Who may SEE the album: people registered (approved) for the event, and the event's admins.
-- Who may ADD photos: the same people, only while the event is on (from 2 hours before the start until 06:00 the morning after the last day).
-- Tags (like Instagram), a personal album cover and sharing build on top of this.
-- Run once in the Supabase SQL editor. Safe to run again.

-- 1) helpers -------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.event_attendee(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.event_registrations r WHERE r.event_id = p_event AND r.user_id = auth.uid() AND r.status = 'approved')
      OR public.event_admin_of(p_event);
$$;
GRANT EXECUTE ON FUNCTION public.event_attendee(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.event_gallery_open(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event
      AND now() >= e.event_date - interval '2 hours'
      AND now() <= ((((COALESCE(e.end_date, e.event_date) AT TIME ZONE 'Asia/Jakarta')::date + 1)::timestamp + interval '6 hours') AT TIME ZONE 'Asia/Jakarta')
  );
$$;
GRANT EXECUTE ON FUNCTION public.event_gallery_open(uuid) TO authenticated;

-- 2) tables --------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_photos_event_idx ON public.event_photos (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_photo_tags (
  photo_id uuid NOT NULL REFERENCES public.event_photos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  x numeric CHECK (x BETWEEN 0 AND 100),
  y numeric CHECK (y BETWEEN 0 AND 100),
  tagged_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (photo_id, user_id)
);

-- my own cover for each album
CREATE TABLE IF NOT EXISTS public.event_album_prefs (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_photo_id uuid REFERENCES public.event_photos(id) ON DELETE SET NULL,
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_album_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_photos_read ON public.event_photos;
CREATE POLICY event_photos_read ON public.event_photos FOR SELECT TO authenticated USING (public.event_attendee(event_id));
DROP POLICY IF EXISTS event_photos_insert ON public.event_photos;
CREATE POLICY event_photos_insert ON public.event_photos FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid() AND public.event_attendee(event_id) AND public.event_gallery_open(event_id));
DROP POLICY IF EXISTS event_photos_delete ON public.event_photos;
CREATE POLICY event_photos_delete ON public.event_photos FOR DELETE TO authenticated
  USING (uploader_id = auth.uid() OR public.event_admin_of(event_id));

DROP POLICY IF EXISTS event_photo_tags_read ON public.event_photo_tags;
CREATE POLICY event_photo_tags_read ON public.event_photo_tags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.event_photos p WHERE p.id = photo_id AND public.event_attendee(p.event_id)));
DROP POLICY IF EXISTS event_photo_tags_insert ON public.event_photo_tags;
CREATE POLICY event_photo_tags_insert ON public.event_photo_tags FOR INSERT TO authenticated
  WITH CHECK (tagged_by = auth.uid() AND EXISTS (SELECT 1 FROM public.event_photos p WHERE p.id = photo_id AND public.event_attendee(p.event_id)));
DROP POLICY IF EXISTS event_photo_tags_delete ON public.event_photo_tags;
CREATE POLICY event_photo_tags_delete ON public.event_photo_tags FOR DELETE TO authenticated
  USING (tagged_by = auth.uid() OR user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.event_photos p WHERE p.id = photo_id AND public.event_admin_of(p.event_id)));

DROP POLICY IF EXISTS event_album_prefs_all ON public.event_album_prefs;
CREATE POLICY event_album_prefs_all ON public.event_album_prefs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3) the shelf: my albums (events I attended, or where I uploaded or was tagged) with a cover -------------------------
CREATE OR REPLACE FUNCTION public.my_albums()
RETURNS TABLE (event_id uuid, title text, event_date timestamptz, photo_count bigint, cover_path text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.title, e.event_date,
    (SELECT count(*) FROM public.event_photos p WHERE p.event_id = e.id),
    COALESCE(
      (SELECT p.path FROM public.event_album_prefs a JOIN public.event_photos p ON p.id = a.cover_photo_id WHERE a.event_id = e.id AND a.user_id = auth.uid()),
      (SELECT p.path FROM public.event_photos p WHERE p.event_id = e.id ORDER BY p.created_at ASC LIMIT 1)
    )
  FROM public.events e
  WHERE auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.event_registrations r WHERE r.event_id = e.id AND r.user_id = auth.uid() AND r.status = 'approved')
    OR EXISTS (SELECT 1 FROM public.event_photos p WHERE p.event_id = e.id AND p.uploader_id = auth.uid())
  )
  ORDER BY e.event_date DESC;
$$;
GRANT EXECUTE ON FUNCTION public.my_albums() TO authenticated;

-- 3b) the people of an album (for tags and names): approved registrants, only for people who may see the album
CREATE OR REPLACE FUNCTION public.event_album_people(p_event uuid)
RETURNS TABLE (user_id uuid, name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $
  SELECT p.id, COALESCE(NULLIF(p.nama_panggilan, ''), p.full_name, 'Peserta'), p.avatar_url
  FROM public.profiles p
  WHERE public.event_attendee(p_event)
    AND (p.id IN (SELECT r.user_id FROM public.event_registrations r WHERE r.event_id = p_event AND r.status = 'approved')
         OR p.id IN (SELECT ph.uploader_id FROM public.event_photos ph WHERE ph.event_id = p_event))
  ORDER BY 2;
$;
GRANT EXECUTE ON FUNCTION public.event_album_people(uuid) TO authenticated;

-- 4) the photos themselves: a public bucket with unguessable paths (<event id>/<random>.webp); the list of photos is protected above
INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS event_photos_storage_insert ON storage.objects;
CREATE POLICY event_photos_storage_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (CASE WHEN bucket_id = 'event-photos' THEN public.event_attendee(((storage.foldername(name))[1])::uuid) AND public.event_gallery_open(((storage.foldername(name))[1])::uuid) ELSE false END);
DROP POLICY IF EXISTS event_photos_storage_delete ON storage.objects;
CREATE POLICY event_photos_storage_delete ON storage.objects FOR DELETE TO authenticated
  USING (CASE WHEN bucket_id = 'event-photos' THEN (owner = auth.uid() OR public.event_admin_of(((storage.foldername(name))[1])::uuid)) ELSE false END);

SELECT 'event_photos' AS t, count(*) FROM public.event_photos
UNION ALL SELECT 'event_photo_tags', count(*) FROM public.event_photo_tags
UNION ALL SELECT 'event_album_prefs', count(*) FROM public.event_album_prefs;
