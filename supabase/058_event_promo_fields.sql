-- 058_event_promo_fields.sql
-- Promotional events surface on the public News > Events explore page,
-- grouped by "Same City" / "Same Community". Add the columns that makes
-- that grouping possible plus the slug of the News post a promotion
-- optionally spins off.
-- Idempotent — safe to run more than once.

alter table public.events
  add column if not exists community_id uuid references public.communities(id) on delete set null;
alter table public.events add column if not exists city text;
alter table public.events add column if not exists news_slug text;

create index if not exists idx_events_event_date on public.events (event_date);
create index if not exists idx_events_community on public.events (community_id);
