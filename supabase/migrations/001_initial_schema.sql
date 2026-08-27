-- ============================================================
-- PriskatCFM â€” Initial Schema
-- Run in Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type public.user_role as enum ('member', 'moderator', 'admin');
create type public.post_status as enum ('draft', 'scheduled', 'published');
create type public.event_status as enum ('draft', 'published', 'cancelled');
create type public.rsvp_status as enum ('going', 'waitlist', 'cancelled');
create type public.reaction_type as enum ('like');

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  full_name    text not null default '',
  avatar_url   text,
  bio          text default '',
  skills       text[] default '{}',
  interests    text[] default '{}',
  role         public.user_role not null default 'member',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- NEWS POSTS
-- ============================================================
create table public.news_posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles(id) on delete set null,
  title          text not null,
  slug           text unique not null,
  body           text not null default '',
  cover_image_url text,
  category       text not null default 'General',
  status         public.post_status not null default 'draft',
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_news_posts_status_published on public.news_posts(status, published_at desc);
create index idx_news_posts_category on public.news_posts(category);
create index idx_news_posts_slug on public.news_posts(slug);

-- ============================================================
-- NEWS COMMENTS
-- ============================================================
create table public.news_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.news_posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_news_comments_post_id on public.news_comments(post_id, created_at);

-- ============================================================
-- NEWS REACTIONS
-- ============================================================
create table public.news_reactions (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.news_posts(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reaction_type public.reaction_type not null default 'like',
  created_at    timestamptz not null default now(),
  unique(post_id, user_id)
);

create index idx_news_reactions_post_id on public.news_reactions(post_id);

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references public.profiles(id) on delete set null,
  title            text not null,
  description      text not null default '',
  banner_image_url text,
  event_date       timestamptz not null,
  end_date         timestamptz,
  location         text not null default '',
  capacity         integer, -- null = unlimited
  status           public.event_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_events_status_date on public.events(status, event_date);

-- ============================================================
-- EVENT RSVPS
-- ============================================================
create table public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     public.rsvp_status not null default 'going',
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index idx_event_rsvps_event_id on public.event_rsvps(event_id, status);
create index idx_event_rsvps_user_id on public.event_rsvps(user_id);

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter        integer := 0;
begin
  -- derive username from email prefix, strip non-alphanumeric
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || base_username;
  end if;
  final_username := base_username;

  -- ensure uniqueness
  while exists(select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles(id, username, full_name, role)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at auto-update helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger news_posts_updated_at before update on public.news_posts
  for each row execute procedure public.set_updated_at();

create trigger news_comments_updated_at before update on public.news_comments
  for each row execute procedure public.set_updated_at();

create trigger events_updated_at before update on public.events
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- FUNCTION: get RSVP going count for an event
-- ============================================================
create or replace function public.event_going_count(event_uuid uuid)
returns integer
language sql stable
as $$
  select count(*)::integer
  from public.event_rsvps
  where event_id = event_uuid and status = 'going';
$$;

-- ============================================================
-- FUNCTION: enforce capacity before RSVP insert
-- ============================================================
create or replace function public.enforce_event_capacity()
returns trigger
language plpgsql
as $$
declare
  cap     integer;
  going   integer;
begin
  if new.status <> 'going' then
    return new;
  end if;

  select capacity into cap from public.events where id = new.event_id;

  if cap is null then
    return new; -- unlimited
  end if;

  select count(*) into going
  from public.event_rsvps
  where event_id = new.event_id and status = 'going';

  if going >= cap then
    -- auto-downgrade to waitlist instead of hard error
    new.status := 'waitlist';
  end if;

  return new;
end;
$$;

create trigger before_rsvp_insert
  before insert on public.event_rsvps
  for each row execute procedure public.enforce_event_capacity();

-- ============================================================
-- SEED: promote first admin (replace email before running)
-- ============================================================
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@priskatcfm.org');

