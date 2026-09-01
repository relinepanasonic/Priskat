-- Update the sort_order of Basic Prayers to match the requested order:
-- 1. Doa Bapa Kami
-- 2. Doa Salam Maria
-- 3. Kemuliaan
-- 4. Doa Tobat
-- 5. Doa Syahadat

UPDATE public.prayers 
SET sort_order = 1 
WHERE category = 'basic_prayer' AND title_id ILIKE '%Bapa Kami%';

UPDATE public.prayers 
SET sort_order = 2 
WHERE category = 'basic_prayer' AND title_id ILIKE '%Salam Maria%';

UPDATE public.prayers 
SET sort_order = 3 
WHERE category = 'basic_prayer' AND title_id ILIKE '%Kemuliaan%';

UPDATE public.prayers 
SET sort_order = 4 
WHERE category = 'basic_prayer' AND title_id ILIKE '%Doa Tobat%';

UPDATE public.prayers 
SET sort_order = 5 
WHERE category = 'basic_prayer' AND title_id ILIKE '%Syahadat%';

