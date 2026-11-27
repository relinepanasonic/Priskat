-- 147_admin_erp.sql
-- Ruang Iman Admin ERP (admin.ruangiman.com):
--   1. erp_finance_entries: Donations & Ministry Income (+ optional expenses) ledger
--   2. erp_platform_milestones: Website & Mobile App progress tracker

create table if not exists public.erp_finance_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  entry_type text not null default 'donation' check (entry_type in ('donation', 'income', 'expense')),
  category text not null default 'Persembahan Umum',
  donor_name text,
  payment_method text not null default 'BCA',
  amount bigint not null default 0 check (amount >= 0),
  reference_no text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_erp_finance_date
  on public.erp_finance_entries (entry_date desc, created_at desc);

create table if not exists public.erp_platform_milestones (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'website' check (platform in ('website', 'android', 'ios', 'community_center', 'seller_center', 'admin_erp')),
  title text not null,
  version_tag text,
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  status text not null default 'in_progress' check (status in ('planned', 'in_progress', 'live')),
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS: strictly Founder / Superadmin / Admin
alter table public.erp_finance_entries enable row level security;
alter table public.erp_platform_milestones enable row level security;

drop policy if exists "erp_finance_admin_all" on public.erp_finance_entries;
create policy "erp_finance_admin_all" on public.erp_finance_entries
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin')
    )
  );

drop policy if exists "erp_milestones_admin_all" on public.erp_platform_milestones;
create policy "erp_milestones_admin_all" on public.erp_platform_milestones
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role::text, '')) in ('founder', 'superadmin', 'admin')
    )
  );

-- Seed initial Ruang Iman platform progress (only if empty)
insert into public.erp_platform_milestones (platform, title, version_tag, progress_pct, status, notes)
select * from (values
  ('website', 'Ruang Iman Web App (apps.ruangiman.com)', 'v2.4 Live', 92, 'live', 'Beranda, Spiritual, Komunitas, Warta, Marketplace & Dual Language ID/EN'),
  ('android', 'Android Play Store App (com.ruangiman.app)', 'v2.4 · Build 12', 88, 'live', 'Rich Push Notifications, Full-Screen Splash, Native Bridge'),
  ('community_center', 'Community Center (communitycenter.ruangiman.com)', 'v2.0 Live', 90, 'live', 'Multi-community management, Events, Albums, QR Attendance'),
  ('seller_center', 'Seller Center (sellercenter.ruangiman.com)', 'v1.0', 45, 'in_progress', 'Shopee-style backoffice for UMKM & Store Owners'),
  ('admin_erp', 'Ruang Iman Admin ERP (admin.ruangiman.com)', 'v1.0 Live', 85, 'live', 'Executive Dashboard, Operations Hub, Donations Accounting'),
  ('ios', 'iOS App Store Build', 'Planned', 15, 'planned', 'Capacitor iOS packaging & Apple Developer release')
) as seed(platform, title, version_tag, progress_pct, status, notes)
where not exists (select 1 from public.erp_platform_milestones limit 1);
