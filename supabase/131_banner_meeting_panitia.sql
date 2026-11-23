-- Promosi (in-app banner, with a request for more), meetings for a part of the committee.
-- Run once in the Supabase SQL editor after 130. Safe to run again.

-- 1. In-app banner: every event may put ONE banner in the app's promotional strip for free (premium_banners, News > Events)
ALTER TABLE public.premium_banners ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS premium_banners_event_idx ON public.premium_banners (event_id) WHERE event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_event_banner(p_event uuid, p_image text, p_title text, p_link text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bid uuid;
BEGIN
  IF NOT public.event_admin_of(p_event) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa membuat banner.' USING ERRCODE = '42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.premium_banners WHERE event_id = p_event) THEN
    RAISE EXCEPTION 'Banner gratis untuk event ini sudah dipakai. Ajukan banner tambahan atau Running Banner.';
  END IF;
  IF p_image IS NULL OR char_length(btrim(p_image)) < 10 THEN RAISE EXCEPTION 'Pilih gambar banner dulu.'; END IF;
  INSERT INTO public.premium_banners (image_url, link_url, title, is_active, sort_order, created_by, event_id)
  VALUES (btrim(p_image), nullif(btrim(coalesce(p_link, '')), ''), nullif(left(btrim(coalesce(p_title, '')), 120), ''), true, 0, auth.uid(), p_event)
  RETURNING id INTO bid;
  RETURN bid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_event_banner(uuid, text, text, text) TO authenticated;

-- action: 'on' | 'off' | 'delete' (deleting gives the free banner back)
CREATE OR REPLACE FUNCTION public.manage_event_banner(p_banner uuid, p_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev uuid;
BEGIN
  SELECT event_id INTO ev FROM public.premium_banners WHERE id = p_banner;
  IF ev IS NULL THEN RAISE EXCEPTION 'Banner tidak ditemukan.'; END IF;
  IF NOT public.event_admin_of(ev) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa mengubah banner.' USING ERRCODE = '42501'; END IF;
  IF p_action = 'delete' THEN DELETE FROM public.premium_banners WHERE id = p_banner;
  ELSIF p_action IN ('on', 'off') THEN UPDATE public.premium_banners SET is_active = (p_action = 'on') WHERE id = p_banner;
  ELSE RAISE EXCEPTION 'Aksi tidak dikenal.'; END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.manage_event_banner(uuid, text) TO authenticated;

-- Requests for more promotion (extra banner, Running Banner). The Ruang Iman team gets a notification and follows up.
CREATE TABLE IF NOT EXISTS public.event_banner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('extra', 'running')),
  price integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'done', 'cancelled')),
  requested_by uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_banner_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS event_banner_requests_read ON public.event_banner_requests;
CREATE POLICY event_banner_requests_read ON public.event_banner_requests FOR SELECT TO authenticated
  USING (public.event_admin_of(event_id) OR public.is_site_admin());
-- no insert policy: the server saves a request and sends the notification in one go

-- 2. Meetings for everybody, the leaders (Petinggi) or one team (a crew position)
ALTER TABLE public.camp_meetings ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'all';
ALTER TABLE public.camp_meetings ADD COLUMN IF NOT EXISTS notified_at timestamptz;
