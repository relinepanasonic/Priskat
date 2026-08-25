-- ============================================================
-- PriskatCFM — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles     enable row level security;
alter table public.news_posts   enable row level security;
alter table public.news_comments enable row level security;
alter table public.news_reactions enable row level security;
alter table public.events       enable row level security;
alter table public.event_rsvps  enable row level security;

-- ============================================================
-- HELPER: role-check functions (avoids repeated subqueries)
-- ============================================================
create or replace function public.get_my_role()
returns public.user_role
language sql stable security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_mod()
returns boolean
language sql stable security definer
as $$
  select role in ('admin', 'moderator')
  from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Anyone can view profiles
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Members can update their own profile; admins can update any
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid() or public.get_my_role() = 'admin')
  with check (id = auth.uid() or public.get_my_role() = 'admin');

-- Profiles are inserted by the trigger (service role), not by users directly
create policy "profiles_insert_trigger"
  on public.profiles for insert
  with check (id = auth.uid());

-- Only admin can delete profiles
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.get_my_role() = 'admin');

-- ============================================================
-- NEWS POSTS policies
-- ============================================================

-- Public can view published posts
create policy "news_posts_select_published"
  on public.news_posts for select
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
    or public.is_admin_or_mod()
  );

-- Admin/mod can insert
create policy "news_posts_insert_admin_mod"
  on public.news_posts for insert
  with check (public.is_admin_or_mod());

-- Admin/mod can update
create policy "news_posts_update_admin_mod"
  on public.news_posts for update
  using (public.is_admin_or_mod())
  with check (public.is_admin_or_mod());

-- Admin can delete
create policy "news_posts_delete_admin"
  on public.news_posts for delete
  using (public.get_my_role() = 'admin');

-- ============================================================
-- NEWS COMMENTS policies
-- ============================================================

-- Anyone can view non-hidden comments on published posts
create policy "news_comments_select"
  on public.news_comments for select
  using (
    (is_hidden = false)
    or public.is_admin_or_mod()
  );

-- Authenticated members can insert comments
create policy "news_comments_insert"
  on public.news_comments for insert
  with check (auth.uid() is not null and author_id = auth.uid());

-- Author can edit their own; admin/mod can edit any
create policy "news_comments_update"
  on public.news_comments for update
  using (author_id = auth.uid() or public.is_admin_or_mod())
  with check (author_id = auth.uid() or public.is_admin_or_mod());

-- Author can delete own; admin can delete any
create policy "news_comments_delete"
  on public.news_comments for delete
  using (author_id = auth.uid() or public.get_my_role() = 'admin');

-- ============================================================
-- NEWS REACTIONS policies
-- ============================================================

-- Anyone can view reactions
create policy "news_reactions_select"
  on public.news_reactions for select
  using (true);

-- Authenticated users can react
create policy "news_reactions_insert"
  on public.news_reactions for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- Users can delete their own reaction
create policy "news_reactions_delete"
  on public.news_reactions for delete
  using (user_id = auth.uid());

-- ============================================================
-- EVENTS policies
-- ============================================================

-- Published events visible to all
create policy "events_select_published"
  on public.events for select
  using (
    status = 'published'
    or public.is_admin_or_mod()
  );

-- Admin/mod can insert
create policy "events_insert_admin_mod"
  on public.events for insert
  with check (public.is_admin_or_mod());

-- Admin/mod can update
create policy "events_update_admin_mod"
  on public.events for update
  using (public.is_admin_or_mod())
  with check (public.is_admin_or_mod());

-- Admin can delete
create policy "events_delete_admin"
  on public.events for delete
  using (public.get_my_role() = 'admin');

-- ============================================================
-- EVENT RSVPS policies
-- ============================================================

-- Authenticated users can view RSVPs (for "who's going" list)
create policy "event_rsvps_select"
  on public.event_rsvps for select
  using (auth.uid() is not null);

-- Authenticated users can insert their own RSVP
create policy "event_rsvps_insert"
  on public.event_rsvps for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- Users can update their own RSVP status; admin can update any
create policy "event_rsvps_update"
  on public.event_rsvps for update
  using (user_id = auth.uid() or public.get_my_role() = 'admin')
  with check (user_id = auth.uid() or public.get_my_role() = 'admin');

-- Users can delete their own RSVP; admin can delete any
create policy "event_rsvps_delete"
  on public.event_rsvps for delete
  using (user_id = auth.uid() or public.get_my_role() = 'admin');
