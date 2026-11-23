-- Event registration by a short link, without logging in:
--   /e/<code> shows "Selamat datang pada Event ..." with a simple form (name, paroki, email, WhatsApp + the admin's own questions).
--   The person gets a Ruang Iman account automatically (by email), the QR ticket on screen, and a confirmation email.
--   The ticket can be printed as a portrait A5 sheet or a business-card sized badge with the admin's background design.
-- Run once in the Supabase SQL editor after 108. Safe to run again.

-- The short code of the link and the ticket design, per event
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS public_code text;
UPDATE public.event_reg_settings SET public_code = substr(md5(random()::text || event_id::text), 1, 6) WHERE public_code IS NULL;
ALTER TABLE public.event_reg_settings ALTER COLUMN public_code SET DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 6);
CREATE UNIQUE INDEX IF NOT EXISTS event_reg_settings_public_code_idx ON public.event_reg_settings (public_code);
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS link_open boolean NOT NULL DEFAULT true;
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS welcome_text text CHECK (welcome_text IS NULL OR char_length(welcome_text) <= 300);
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS ticket_size text NOT NULL DEFAULT 'a5' CHECK (ticket_size IN ('a5', 'card'));
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS ticket_bg_url text;
-- a person who registers by the link is approved straight away unless the event costs money
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS link_auto_approve boolean NOT NULL DEFAULT true;

-- Who registered, as the admin needs to see it
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS paroki text;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'account' CHECK (source IN ('account', 'link'));
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS emailed_at timestamptz;

-- Find an account by email (only the server, with the service key, may call this)
CREATE OR REPLACE FUNCTION public.admin_user_id_by_email(p_email text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(btrim(p_email)) LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.admin_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_id_by_email(text) TO service_role;

-- Public bucket for the admins' ticket background pictures (designs are not secret); private bucket for guests' photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-designs', 'event-designs', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 8388608;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-guest-photos', 'event-guest-photos', false, 4194304, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 4194304;

DROP POLICY IF EXISTS event_designs_read ON storage.objects;
CREATE POLICY event_designs_read ON storage.objects FOR SELECT USING (bucket_id = 'event-designs');
DROP POLICY IF EXISTS event_designs_write ON storage.objects;
CREATE POLICY event_designs_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-designs' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.event_admin_of(((storage.foldername(name))[1])::uuid));
DROP POLICY IF EXISTS event_designs_delete ON storage.objects;
CREATE POLICY event_designs_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-designs' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.event_admin_of(((storage.foldername(name))[1])::uuid));

-- Event admins read the guests' photos (the server saves them with the service key)
DROP POLICY IF EXISTS event_guest_photos_read ON storage.objects;
CREATE POLICY event_guest_photos_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'event-guest-photos' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.event_admin_of(((storage.foldername(name))[1])::uuid));
