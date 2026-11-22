-- Hide communities from the public lists (Komunitas list, sign-up, welcome steps) without deleting anything.
-- Members, camps, Connect Groups, alumni and events all stay in the database; admins still see and manage hidden
-- communities in the Community Center. Un-hide one later with:  UPDATE public.communities SET is_hidden = false WHERE name = '...';
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Everything except Catholic Indonesia and Ruang Iman is hidden
UPDATE public.communities
SET is_hidden = true
WHERE NOT (btrim(name) ILIKE 'catholic indonesia' OR btrim(name) ILIKE 'ruang iman');

UPDATE public.communities
SET is_hidden = false
WHERE btrim(name) ILIKE 'catholic indonesia' OR btrim(name) ILIKE 'ruang iman';

SELECT name, is_hidden FROM public.communities ORDER BY is_hidden, name;
