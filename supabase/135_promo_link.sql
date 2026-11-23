-- Promotion links: our own registration link, plus a second link (Google Form or another app), and which one is the default
-- for the banner and the WhatsApp broadcast. Run once in the Supabase SQL editor after 134. Safe to run again.
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS external_link text;
ALTER TABLE public.event_reg_settings DROP CONSTRAINT IF EXISTS event_reg_settings_external_link_check;
ALTER TABLE public.event_reg_settings ADD CONSTRAINT event_reg_settings_external_link_check CHECK (external_link IS NULL OR (char_length(external_link) <= 500 AND external_link ~* '^https?://'));
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS default_link text NOT NULL DEFAULT 'ruangiman';
ALTER TABLE public.event_reg_settings DROP CONSTRAINT IF EXISTS event_reg_settings_default_link_check;
ALTER TABLE public.event_reg_settings ADD CONSTRAINT event_reg_settings_default_link_check CHECK (default_link IN ('ruangiman', 'external'));

-- Change where an event's banner leads
CREATE OR REPLACE FUNCTION public.set_event_banner_link(p_banner uuid, p_link text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev uuid;
BEGIN
  SELECT event_id INTO ev FROM public.premium_banners WHERE id = p_banner;
  IF ev IS NULL THEN RAISE EXCEPTION 'Banner tidak ditemukan.'; END IF;
  IF NOT public.event_admin_of(ev) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa mengubah banner.' USING ERRCODE = '42501'; END IF;
  UPDATE public.premium_banners SET link_url = nullif(btrim(coalesce(p_link, '')), '') WHERE id = p_banner;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_event_banner_link(uuid, text) TO authenticated;
