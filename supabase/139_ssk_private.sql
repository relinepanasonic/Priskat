-- Sukses Sejati Katolik is a private community (everyone can still read its About page and ask to join).
-- Run once in the Supabase SQL editor. Safe to run again.
UPDATE public.communities
SET is_public = false
WHERE slug = 'sukses-sejati-katolik' OR lower(name) LIKE '%sukses sejati%';

SELECT name, slug, is_public FROM public.communities WHERE lower(name) LIKE '%sukses sejati%';
