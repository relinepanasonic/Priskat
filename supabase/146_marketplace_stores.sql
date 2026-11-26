create table if not exists public.marketplace_stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  category text not null default 'Benda Rohani',
  logo_url text,
  city text,
  whatsapp text,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_stores_activity
  on public.marketplace_stores (last_activity_at desc);

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.marketplace_stores(id) on delete cascade,
  title text not null,
  category text not null default 'Benda Rohani',
  sku_id text not null default '',
  variants jsonb not null default '[]'::jsonb,
  description text,
  price integer not null default 0,
  stock integer not null default 0,
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_products_store
  on public.marketplace_products (store_id, created_at desc);

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.marketplace_stores(id) on delete cascade,
  product_id uuid references public.marketplace_products(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null default 5 check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_reviews_store
  on public.marketplace_reviews (store_id, created_at desc);

create index if not exists idx_marketplace_reviews_product
  on public.marketplace_reviews (product_id, created_at desc);

-- Max 30 products per store
create or replace function public.enforce_store_product_limit()
returns trigger
language plpgsql
as $$
declare
  cnt integer;
begin
  select count(*) into cnt from public.marketplace_products where store_id = new.store_id;
  if cnt >= 30 then
    raise exception 'Maksimal 30 produk per toko.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_store_product_limit on public.marketplace_products;
create trigger trg_store_product_limit
  before insert on public.marketplace_products
  for each row execute function public.enforce_store_product_limit();

-- Fairness bump: editing store, adding/editing products, or receiving a review bumps store to top
create or replace function public.bump_store_activity()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.marketplace_stores
  set last_activity_at = now()
  where id = new.store_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_store_on_product on public.marketplace_products;
create trigger trg_bump_store_on_product
  after insert or update on public.marketplace_products
  for each row execute function public.bump_store_activity();

drop trigger if exists trg_bump_store_on_review on public.marketplace_reviews;
create trigger trg_bump_store_on_review
  after insert on public.marketplace_reviews
  for each row execute function public.bump_store_activity();

-- RLS
alter table public.marketplace_stores enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.marketplace_reviews enable row level security;

drop policy if exists "mp_stores_read" on public.marketplace_stores;
create policy "mp_stores_read" on public.marketplace_stores for select using (true);

drop policy if exists "mp_stores_insert" on public.marketplace_stores;
create policy "mp_stores_insert" on public.marketplace_stores for insert to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "mp_stores_update" on public.marketplace_stores;
create policy "mp_stores_update" on public.marketplace_stores for update to authenticated
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) in ('founder', 'superadmin', 'admin', 'moderator'))
  );

drop policy if exists "mp_stores_delete" on public.marketplace_stores;
create policy "mp_stores_delete" on public.marketplace_stores for delete to authenticated
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) in ('founder', 'superadmin', 'admin', 'moderator'))
  );

drop policy if exists "mp_products_read" on public.marketplace_products;
create policy "mp_products_read" on public.marketplace_products for select using (true);

drop policy if exists "mp_products_write" on public.marketplace_products;
create policy "mp_products_write" on public.marketplace_products for all to authenticated
  using (
    exists (select 1 from public.marketplace_stores s where s.id = store_id and s.owner_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) in ('founder', 'superadmin', 'admin', 'moderator'))
  )
  with check (
    exists (select 1 from public.marketplace_stores s where s.id = store_id and s.owner_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) in ('founder', 'superadmin', 'admin', 'moderator'))
  );

drop policy if exists "mp_reviews_read" on public.marketplace_reviews;
create policy "mp_reviews_read" on public.marketplace_reviews for select using (true);

drop policy if exists "mp_reviews_insert" on public.marketplace_reviews;
create policy "mp_reviews_insert" on public.marketplace_reviews for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "mp_reviews_delete" on public.marketplace_reviews;
create policy "mp_reviews_delete" on public.marketplace_reviews for delete to authenticated
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and lower(coalesce(p.role, '')) in ('founder', 'superadmin', 'admin', 'moderator'))
  );

insert into storage.buckets (id, name, public)
values ('marketplace', 'marketplace', true)
on conflict (id) do nothing;

drop policy if exists "marketplace_storage_read" on storage.objects;
create policy "marketplace_storage_read" on storage.objects for select using (bucket_id = 'marketplace');

drop policy if exists "marketplace_storage_upload" on storage.objects;
create policy "marketplace_storage_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'marketplace' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "marketplace_storage_delete" on storage.objects;
create policy "marketplace_storage_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'marketplace' and (storage.foldername(name))[1] = auth.uid()::text);
