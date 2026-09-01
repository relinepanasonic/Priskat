-- 059_premium_banners.sql
-- Founder-managed premium ad slides shown in the News > Events marquee.
-- Anyone signed in may read the active ones; only a founder may write.
-- Idempotent — safe to run more than once.

create table if not exists public.premium_banners (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  link_url   text,
  title      text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.premium_banners enable row level security;

create index if not exists idx_premium_banners_active
  on public.premium_banners (is_active, sort_order, created_at);

drop policy if exists premium_banners_select on public.premium_banners;
create policy premium_banners_select on public.premium_banners
  for select to authenticated using (true);

drop policy if exists premium_banners_write on public.premium_banners;
create policy premium_banners_write on public.premium_banners
  for all to authenticated
  using      (public.get_my_role()::text = 'founder')
  with check (public.get_my_role()::text = 'founder');
