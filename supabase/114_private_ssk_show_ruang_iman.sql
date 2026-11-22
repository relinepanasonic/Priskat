-- 1) Sukses Sejati Katolik is a private community (everyone can still read its About page and ask to join).
-- 2) Show the Ruang Iman community again. The hide step (107) can only have hidden it if its name or slug differs
--    from the plain "Ruang Iman", so this matches any community with "ruang" and "iman" in its name or slug.
-- Run once in the Supabase SQL editor. Safe to run again.

UPDATE public.communities SET is_public = false WHERE slug = 'sukses-sejati-katolik';

UPDATE public.communities
SET is_hidden = false
WHERE name ILIKE '%ruang%iman%' OR slug ILIKE '%ruang%iman%' OR slug = 'ruang-iman';

-- Check: every community with its flags (send me this list if Ruang Iman is still missing)
SELECT name, slug, is_public, is_hidden FROM public.communities ORDER BY is_hidden, name;
