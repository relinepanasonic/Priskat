-- Manual fix for the 5 unmatched covers
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/faith-when-the-paycheck-doesnt-stretch.jpeg' WHERE title_id ILIKE '%Iman ketika gaji tidak cukup%';
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/when-rejection-isnt-the-final-word.jpeg' WHERE title_id ILIKE '%Ketika penolakan bukan kata akhir%';
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/healing-the-wounds-weve-carried-since-childhood.jpeg' WHERE title_id ILIKE '%Memulihkan luka yang kita bawa sejak kecil%';
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/an-anchor-than-cannot-be-shaken.jpeg' WHERE title_id ILIKE '%Sauh yang tak tergoyahkan%';
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/a-house-ay-peace.jpeg' WHERE title_id ILIKE '%Rumah yang damai%';
