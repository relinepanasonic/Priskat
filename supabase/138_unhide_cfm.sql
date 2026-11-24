-- Show the Catholic Family Ministry (CFM) community again in the public lists (Komunitas, sign-up, welcome steps).
-- Matches the same rule as isCatholicFamilyMinistry() in src/lib/community.ts.
-- Run once in the Supabase SQL editor. Safe to run again.

UPDATE public.communities
SET is_hidden = false
WHERE lower(name) LIKE '%family ministry%'
   OR lower(slug) = 'cfm'
   OR lower(slug) LIKE 'cfm-%'
   OR lower(slug) LIKE '%catholic-family%';

-- Check: CFM should show is_hidden = false
SELECT name, slug, is_hidden FROM public.communities WHERE lower(name) LIKE '%family ministry%' OR lower(slug) LIKE '%cfm%' OR lower(slug) LIKE '%catholic-family%';
