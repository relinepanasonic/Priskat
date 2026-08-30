UPDATE public.devotion_categories
SET image_url = '/images/categories/love.jpg'
WHERE name = 'Love' AND parent_id IS NULL;

UPDATE public.devotion_categories
SET image_url = '/images/categories/marriage.jpg'
WHERE name = 'Marriage' AND parent_id IS NULL;

UPDATE public.devotion_categories
SET image_url = '/images/categories/faith.jpg'
WHERE name = 'Faith' AND parent_id IS NULL;
