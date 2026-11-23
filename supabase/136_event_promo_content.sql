-- Promotional content of an event: a promotional text, up to 3 pictures, and the answers the admin gave to the guided questions.
-- Shown on the event's landing page (/e/<name>) before the registration form. Run once in the Supabase SQL editor after 135.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promo_text text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promo_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promo_answers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_promo_images_check;
ALTER TABLE public.events ADD CONSTRAINT events_promo_images_check CHECK (jsonb_typeof(promo_images) = 'array' AND jsonb_array_length(promo_images) <= 3);
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_promo_text_check;
ALTER TABLE public.events ADD CONSTRAINT events_promo_text_check CHECK (promo_text IS NULL OR char_length(promo_text) <= 4000);
