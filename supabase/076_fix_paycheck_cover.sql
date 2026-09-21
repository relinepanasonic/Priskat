-- Broad fallback for 'Iman ketika gaji tidak cukup'
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/faith-when-the-paycheck-doesnt-stretch.jpeg' WHERE title ILIKE '%paycheck%';
UPDATE public.devotion_plans SET cover_image_url = '/images/devotions/faith-when-the-paycheck-doesnt-stretch.jpeg' WHERE title_id ILIKE '%gaji%';
