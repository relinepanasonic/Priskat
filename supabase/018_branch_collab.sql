create table if not exists public.branches (
  id uuid default gen_random_uuid() primary key,
  negara text not null,
  provinsi text not null,
  kota text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.collaborators (
  id uuid default gen_random_uuid() primary key,
  nama_komunitas text not null,
  keuskupan text not null,
  payung_organisasi text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.branches enable row level security;
alter table public.collaborators enable row level security;

create policy "Allow public read access on branches"
  on public.branches for select
  using (true);

create policy "Allow all access for authenticated users on branches"
  on public.branches for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow public read access on collaborators"
  on public.collaborators for select
  using (true);

create policy "Allow all access for authenticated users on collaborators"
  on public.collaborators for all
  to authenticated
  using (true)
  with check (true);
