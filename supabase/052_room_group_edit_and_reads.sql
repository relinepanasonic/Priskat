-- 052_room_group_edit_and_reads.sql
-- - rooms.avatar_url (Edit Room picture)
-- - group admins (not just owner) may edit their group
-- - group_reads + RPCs for per-group unread tracking
-- Run after 051. Idempotent.

alter table public.rooms  add column if not exists avatar_url text;

-- group admins may edit the group ----------------------------------------
drop policy if exists groups_update on public.groups;
create policy groups_update on public.groups for update to authenticated using (
  owner_id = auth.uid()
  or public.is_group_admin(id)
  or public.get_my_role() in ('founder', 'superadmin')
);

-- read receipts ---------------------------------------------------------
create table if not exists public.group_reads (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  group_id     uuid not null references public.groups(id)   on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, group_id)
);
alter table public.group_reads enable row level security;
drop policy if exists group_reads_rw on public.group_reads;
create policy group_reads_rw on public.group_reads for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- groups I've joined, paired with their single chat thread
create or replace function public.my_unread_group_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  with my_groups as (
    select gm.group_id,
           (select gs.id from public.group_subgroups gs
             where gs.group_id = gm.group_id
             order by gs.created_at limit 1) as chat_id
    from public.group_members gm
    where gm.user_id = auth.uid() and gm.status = 'accepted'
  ),
  latest as (
    select mg.group_id,
           max(m.created_at) as last_msg,
           (array_agg(m.author_id order by m.created_at desc))[1] as last_author
    from my_groups mg
    join public.group_messages m on m.subgroup_id = mg.chat_id
    group by mg.group_id
  )
  select l.group_id
  from latest l
  left join public.group_reads r
    on r.user_id = auth.uid() and r.group_id = l.group_id
  where l.last_author <> auth.uid()
    and (r.last_read_at is null or l.last_msg > r.last_read_at);
$$;

create or replace function public.my_unread_group_count()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.my_unread_group_ids();
$$;

create or replace function public.mark_group_read(gid uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.group_reads (user_id, group_id, last_read_at)
  values (auth.uid(), gid, now())
  on conflict (user_id, group_id) do update set last_read_at = now();
$$;

grant execute on function public.my_unread_group_ids()   to authenticated;
grant execute on function public.my_unread_group_count() to authenticated;
grant execute on function public.mark_group_read(uuid)   to authenticated;
