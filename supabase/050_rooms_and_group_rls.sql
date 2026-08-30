-- 050_rooms_and_group_rls.sql
-- 1. Fixes "infinite recursion detected in policy for relation groups":
--    groups_select referenced group_members and group_members_select referenced
--    groups. Both checks now go through SECURITY DEFINER helper functions that
--    read the tables with RLS bypassed, so the policies never cross-trigger.
-- 2. Adds the "Room" layer: a room has many groups; only founder / superadmin
--    can create rooms.
-- Idempotent — safe to run more than once. Supersedes 048.

-- ---------------------------------------------------------------- helpers ---
create or replace function public.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and status = 'accepted'
  );
$$;

create or replace function public.is_group_owner(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.groups where id = gid and owner_id = auth.uid());
$$;

create or replace function public.is_group_admin(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from public.groups where id = gid and owner_id = auth.uid())
    or exists (
      select 1 from public.group_members
      where group_id = gid and user_id = auth.uid()
        and status = 'accepted' and role in ('owner', 'admin')
    );
$$;

create or replace function public.subgroup_group_id(sid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select group_id from public.group_subgroups where id = sid;
$$;

grant execute on function public.is_group_member(uuid)  to authenticated;
grant execute on function public.is_group_owner(uuid)   to authenticated;
grant execute on function public.is_group_admin(uuid)   to authenticated;
grant execute on function public.subgroup_group_id(uuid) to authenticated;

-- ------------------------------------------------------------------ rooms ---
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid references public.profiles(id) on delete set null,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.rooms enable row level security;

drop policy if exists rooms_select on public.rooms;
drop policy if exists rooms_write  on public.rooms;

create policy rooms_select on public.rooms for select to authenticated using (true);
create policy rooms_write on public.rooms for all to authenticated
  using      (public.get_my_role() in ('founder', 'superadmin'))
  with check (public.get_my_role() in ('founder', 'superadmin'));

alter table public.groups add column if not exists room_id uuid
  references public.rooms(id) on delete cascade;
create index if not exists idx_groups_room on public.groups (room_id);

-- ------------------------------------------------- group policies (fixed) ---
alter table public.groups enable row level security;
drop policy if exists groups_select on public.groups;
drop policy if exists groups_insert on public.groups;
drop policy if exists groups_update on public.groups;
drop policy if exists groups_delete on public.groups;

create policy groups_select on public.groups for select to authenticated using (
  not is_private or owner_id = auth.uid() or public.is_group_member(id)
);
create policy groups_insert on public.groups for insert to authenticated
  with check (auth.uid() = owner_id);
create policy groups_update on public.groups for update to authenticated
  using (owner_id = auth.uid());
create policy groups_delete on public.groups for delete to authenticated
  using (owner_id = auth.uid() or public.get_my_role() in ('founder', 'superadmin'));

alter table public.group_members enable row level security;
drop policy if exists group_members_select on public.group_members;
drop policy if exists group_members_insert on public.group_members;
drop policy if exists group_members_update on public.group_members;
drop policy if exists group_members_delete on public.group_members;

create policy group_members_select on public.group_members for select to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id));
create policy group_members_insert on public.group_members for insert to authenticated
  with check (user_id = auth.uid() or public.is_group_owner(group_id));
create policy group_members_update on public.group_members for update to authenticated
  using (public.is_group_admin(group_id));
create policy group_members_delete on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id));

alter table public.group_subgroups enable row level security;
drop policy if exists subgroups_select on public.group_subgroups;
drop policy if exists subgroups_insert on public.group_subgroups;
drop policy if exists subgroups_delete on public.group_subgroups;

create policy subgroups_select on public.group_subgroups for select to authenticated
  using (public.is_group_member(group_id));
create policy subgroups_insert on public.group_subgroups for insert to authenticated
  with check (public.is_group_admin(group_id));
create policy subgroups_delete on public.group_subgroups for delete to authenticated
  using (public.is_group_admin(group_id));

alter table public.group_messages enable row level security;
drop policy if exists messages_select on public.group_messages;
drop policy if exists messages_insert on public.group_messages;
drop policy if exists messages_delete on public.group_messages;

create policy messages_select on public.group_messages for select to authenticated
  using (public.is_group_member(public.subgroup_group_id(subgroup_id)));
create policy messages_insert on public.group_messages for insert to authenticated
  with check (
    auth.uid() = author_id
    and public.is_group_member(public.subgroup_group_id(subgroup_id))
  );
create policy messages_delete on public.group_messages for delete to authenticated
  using (auth.uid() = author_id);
