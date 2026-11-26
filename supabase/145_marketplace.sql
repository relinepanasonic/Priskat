create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Benda Rohani',
  price integer not null default 0,
  description text,
  image_url text,
  city text,
  whatsapp text,
  status text not null default 'active' check (status in ('active', 'sold')),
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_items_status_created
  on public.marketplace_items (status, created_at desc);

alter table public.marketplace_items enable row level security;

drop policy if exists "marketplace_read" on public.marketplace_items;
create policy "marketplace_read"
  on public.marketplace_items for select
  using (status = 'active' or auth.uid() = seller_id);

drop policy if exists "marketplace_insert" on public.marketplace_items;
create policy "marketplace_insert"
  on public.marketplace_items for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "marketplace_update" on public.marketplace_items;
create policy "marketplace_update"
  on public.marketplace_items for update
  to authenticated
  using (
    auth.uid() = seller_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin', 'moderator')
    )
  );

drop policy if exists "marketplace_delete" on public.marketplace_items;
create policy "marketplace_delete"
  on public.marketplace_items for delete
  to authenticated
  using (
    auth.uid() = seller_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin', 'moderator')
    )
  );

insert into storage.buckets (id, name, public)
values ('marketplace', 'marketplace', true)
on conflict (id) do nothing;

drop policy if exists "marketplace_storage_read" on storage.objects;
create policy "marketplace_storage_read"
  on storage.objects for select
  using (bucket_id = 'marketplace');

drop policy if exists "marketplace_storage_upload" on storage.objects;
create policy "marketplace_storage_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'marketplace' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "marketplace_storage_delete" on storage.objects;
create policy "marketplace_storage_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'marketplace' and (storage.foldername(name))[1] = auth.uid()::text);
