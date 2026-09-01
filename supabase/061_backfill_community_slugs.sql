-- 061_backfill_community_slugs.sql
-- Communities with no slug made /camp links resolve to "/camp/undefined".
-- Give every community a slug derived from its name.
-- Idempotent — safe to run more than once. If two names slugify to the
-- same value, append a short id suffix to keep them unique.

update public.communities
set slug = trim(both '-' from
  lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null or btrim(coalesce(slug, '')) = '';

-- de-duplicate any collisions
with dups as (
  select id,
         slug,
         row_number() over (partition by slug order by created_at) as rn
  from public.communities
)
update public.communities c
set slug = c.slug || '-' || left(c.id::text, 4)
from dups
where dups.id = c.id and dups.rn > 1;
