-- Two banner shapes in the app (News > Events):
--   running  = the wide strip that slowly runs at the top (16:9, e.g. 1280 x 720). Paid; the Ruang Iman team puts it there.
--   portrait = the portrait card in "Sedang dipromosikan" (4:5, e.g. 1080 x 1350). Every event gets one for free.
-- Run once in the Supabase SQL editor after 133. Safe to run again.
ALTER TABLE public.premium_banners ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'running';
ALTER TABLE public.premium_banners DROP CONSTRAINT IF EXISTS premium_banners_format_check;
ALTER TABLE public.premium_banners ADD CONSTRAINT premium_banners_format_check CHECK (format IN ('running', 'portrait'));
-- banners that events made themselves are portrait
UPDATE public.premium_banners SET format = 'portrait' WHERE event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_event_banner(p_event uuid, p_image text, p_title text, p_link text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bid uuid;
BEGIN
  IF NOT public.event_admin_of(p_event) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa membuat banner.' USING ERRCODE = '42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.premium_banners WHERE event_id = p_event) THEN
    RAISE EXCEPTION 'Banner gratis untuk event ini sudah dipakai. Ajukan banner tambahan atau Running Banner.';
  END IF;
  IF p_image IS NULL OR char_length(btrim(p_image)) < 10 THEN RAISE EXCEPTION 'Pilih gambar banner dulu.'; END IF;
  INSERT INTO public.premium_banners (image_url, link_url, title, is_active, sort_order, created_by, event_id, format)
  VALUES (btrim(p_image), nullif(btrim(coalesce(p_link, '')), ''), nullif(left(btrim(coalesce(p_title, '')), 120), ''), true, 0, auth.uid(), p_event, 'portrait')
  RETURNING id INTO bid;
  RETURN bid;
END;
$$;
