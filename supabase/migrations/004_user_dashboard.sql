-- ============================================================
-- Migration 004: User Dashboard, Badges, Devotions
-- ============================================================

-- 1. Add gender enum
create type public.user_gender as enum ('male', 'female');

-- 2. Update profiles table
alter table public.profiles
  add column gender public.user_gender,
  add column completed_modules text[] default '{}';

-- 3. Create daily_devotions table
create table public.daily_devotions (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null unique,
  verse_reference text not null,
  verse_text text not null,
  prayer_title text not null,
  prayer_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_daily_devotions_date on public.daily_devotions(publish_date);

-- Trigger for updated_at
create trigger daily_devotions_updated_at before update on public.daily_devotions
  for each row execute procedure public.set_updated_at();

-- 4. RLS for daily_devotions
alter table public.daily_devotions enable row level security;

-- Anyone can view devotions
create policy "Devotions are viewable by everyone." 
  on public.daily_devotions for select using (true);

-- Only admins/mods can insert/update/delete
create policy "Admins and mods can insert devotions." 
  on public.daily_devotions for insert with check (public.is_admin_or_mod());

create policy "Admins and mods can update devotions." 
  on public.daily_devotions for update using (public.is_admin_or_mod());

create policy "Admins and mods can delete devotions." 
  on public.daily_devotions for delete using (public.is_admin_or_mod());

