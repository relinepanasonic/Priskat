-- The registration link uses the event's name: /e/<event-name>, e.g. /e/pria-sejati-katolik-58-surabaya.
-- The old 6-letter links (/e/b5e4d4) keep working. Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.event_reg_settings DROP CONSTRAINT IF EXISTS event_reg_settings_slug_check;
ALTER TABLE public.event_reg_settings ADD CONSTRAINT event_reg_settings_slug_check
  CHECK (slug IS NULL OR slug ~ '^[a-z0-9][a-z0-9-]{1,79}$');
CREATE UNIQUE INDEX IF NOT EXISTS event_reg_settings_slug_idx ON public.event_reg_settings (slug) WHERE slug IS NOT NULL;
