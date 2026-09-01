-- 060_camp_cohorts_community.sql
-- Camps belong to a community — each /camp/<community> card is its own
-- workspace. Scope camp_cohorts by community_id; legacy rows go to the
-- oldest community so nothing is orphaned.
-- Idempotent — safe to run more than once.

alter table public.camp_cohorts
  add column if not exists community_id uuid
  references public.communities(id) on delete cascade;

update public.camp_cohorts
  set community_id = (
    select id from public.communities order by created_at asc limit 1
  )
  where community_id is null;

create index if not exists idx_camp_cohorts_community
  on public.camp_cohorts (community_id);
