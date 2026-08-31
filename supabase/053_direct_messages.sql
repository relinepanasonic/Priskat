-- 053_direct_messages.sql
-- 1-on-1 direct messages between any two members.
--   dm_threads  – one row per unordered pair (user_a < user_b), unique
--   dm_messages – the messages in a thread
--   dm_reads    – per-user last_read_at, for unread tracking
-- Entry point is the RPC get_or_create_dm_thread(other) so the client never
-- has to worry about pair ordering or races.
-- Idempotent — safe to run more than once.

-- ---------------------------------------------------------------- tables ---
create table if not exists public.dm_threads (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint dm_threads_pair_ordered check (user_a < user_b),
  constraint dm_threads_pair_unique  unique (user_a, user_b)
);
alter table public.dm_threads enable row level security;

create table if not exists public.dm_messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.dm_threads(id) on delete cascade,
  author_id  uuid not null references public.profiles(id)   on delete cascade,
  content    text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);
alter table public.dm_messages enable row level security;

create table if not exists public.dm_reads (
  thread_id    uuid not null references public.dm_threads(id) on delete cascade,
  user_id      uuid not null references public.profiles(id)   on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);
alter table public.dm_reads enable row level security;

create index if not exists idx_dm_threads_user_a on public.dm_threads (user_a);
create index if not exists idx_dm_threads_user_b on public.dm_threads (user_b);
create index if not exists idx_dm_messages_thread_created
  on public.dm_messages (thread_id, created_at);

-- --------------------------------------------------------------- helpers ---
create or replace function public.is_dm_member(tid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.dm_threads
    where id = tid and (user_a = auth.uid() or user_b = auth.uid())
  );
$$;

-- Resolve (or lazily create) the single thread between me and `other`.
create or replace function public.get_or_create_dm_thread(other uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  me  uuid := auth.uid();
  lo  uuid;
  hi  uuid;
  tid uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if other is null or other = me then
    raise exception 'invalid recipient';
  end if;
  if not exists (select 1 from public.profiles where id = other) then
    raise exception 'recipient not found';
  end if;

  if me < other then lo := me; hi := other; else lo := other; hi := me; end if;

  insert into public.dm_threads (user_a, user_b)
  values (lo, hi)
  on conflict (user_a, user_b) do nothing;

  select id into tid from public.dm_threads where user_a = lo and user_b = hi;
  return tid;
end;
$$;

-- Inbox: every thread I'm in, with the other person + last message + unread flag.
create or replace function public.my_dm_overview()
returns table (
  thread_id      uuid,
  other_id       uuid,
  other_name     text,
  other_avatar   text,
  last_content   text,
  last_author_id uuid,
  last_at        timestamptz,
  unread         boolean
) language sql stable security definer set search_path = public as $$
  with my as (
    select t.id,
           case when t.user_a = auth.uid() then t.user_b else t.user_a end as other_id
    from public.dm_threads t
    where t.user_a = auth.uid() or t.user_b = auth.uid()
  ),
  last_msg as (
    select distinct on (m.thread_id)
           m.thread_id, m.content, m.author_id, m.created_at
    from public.dm_messages m
    join my on my.id = m.thread_id
    order by m.thread_id, m.created_at desc
  )
  select my.id, my.other_id, p.full_name, p.avatar_url,
         lm.content, lm.author_id, lm.created_at,
         (lm.author_id is not null
          and lm.author_id <> auth.uid()
          and (r.last_read_at is null or lm.created_at > r.last_read_at)) as unread
  from my
  join public.profiles p on p.id = my.other_id
  left join last_msg lm on lm.thread_id = my.id
  left join public.dm_reads r on r.thread_id = my.id and r.user_id = auth.uid()
  order by coalesce(lm.created_at, 'epoch'::timestamptz) desc;
$$;

create or replace function public.my_unread_dm_count()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.my_dm_overview() where unread;
$$;

create or replace function public.mark_dm_read(tid uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.dm_reads (thread_id, user_id, last_read_at)
  values (tid, auth.uid(), now())
  on conflict (thread_id, user_id) do update set last_read_at = now();
$$;

grant execute on function public.is_dm_member(uuid)             to authenticated;
grant execute on function public.get_or_create_dm_thread(uuid)  to authenticated;
grant execute on function public.my_dm_overview()               to authenticated;
grant execute on function public.my_unread_dm_count()           to authenticated;
grant execute on function public.mark_dm_read(uuid)             to authenticated;

-- ------------------------------------------------------------- policies ---
drop policy if exists dm_threads_select on public.dm_threads;
create policy dm_threads_select on public.dm_threads for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());
-- writes to dm_threads go exclusively through get_or_create_dm_thread().

drop policy if exists dm_messages_select on public.dm_messages;
drop policy if exists dm_messages_insert on public.dm_messages;
drop policy if exists dm_messages_delete on public.dm_messages;
create policy dm_messages_select on public.dm_messages for select to authenticated
  using (public.is_dm_member(thread_id));
create policy dm_messages_insert on public.dm_messages for insert to authenticated
  with check (auth.uid() = author_id and public.is_dm_member(thread_id));
create policy dm_messages_delete on public.dm_messages for delete to authenticated
  using (auth.uid() = author_id);

drop policy if exists dm_reads_rw on public.dm_reads;
create policy dm_reads_rw on public.dm_reads for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------- realtime ---
do $$
begin
  alter publication supabase_realtime add table public.dm_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
