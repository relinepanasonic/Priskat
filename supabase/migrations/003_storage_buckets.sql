-- ============================================================
-- PriskatCFM — Storage Buckets & Policies
-- Run AFTER 001 and 002
-- ============================================================

-- Create public storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',       'avatars',       true, 2097152, array['image/jpeg','image/png','image/webp','image/gif']),
  ('news-covers',   'news-covers',   true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('event-banners', 'event-banners', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS: avatars
-- ============================================================
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_auth"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Storage RLS: news-covers
-- ============================================================
create policy "news_covers_select_public"
  on storage.objects for select
  using (bucket_id = 'news-covers');

create policy "news_covers_insert_admin_mod"
  on storage.objects for insert
  with check (
    bucket_id = 'news-covers'
    and public.is_admin_or_mod()
  );

create policy "news_covers_update_admin_mod"
  on storage.objects for update
  using (bucket_id = 'news-covers' and public.is_admin_or_mod());

create policy "news_covers_delete_admin_mod"
  on storage.objects for delete
  using (bucket_id = 'news-covers' and public.is_admin_or_mod());

-- ============================================================
-- Storage RLS: event-banners
-- ============================================================
create policy "event_banners_select_public"
  on storage.objects for select
  using (bucket_id = 'event-banners');

create policy "event_banners_insert_admin_mod"
  on storage.objects for insert
  with check (
    bucket_id = 'event-banners'
    and public.is_admin_or_mod()
  );

create policy "event_banners_update_admin_mod"
  on storage.objects for update
  using (bucket_id = 'event-banners' and public.is_admin_or_mod());

create policy "event_banners_delete_admin_mod"
  on storage.objects for delete
  using (bucket_id = 'event-banners' and public.is_admin_or_mod());
