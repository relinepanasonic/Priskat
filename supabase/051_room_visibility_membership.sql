-- 051_room_visibility_membership.sql
-- Rooms get an owner + two owner-controlled switches:
--   is_public : true  -> anyone can add a group to the room
--               false -> only the room owner / room members can
--   is_hidden : true  -> only room members (and the owner) can see the room
--               false -> everyone sees it
-- Adds room_members. Run after 050. Idempotent.

alter table public.rooms add column if not exists owner_id  uuid references public.profiles(id) on delete set null;
alter table public.rooms add column if not exists is_public boolean not null default true;
alter table public.rooms add column if not exists is_hidden boolean not null default false;
update public.rooms set owner_id = created_by where owner_id is null;

create table if not exists public.room_members (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);
alter table public.room_members enable row level security;

insert into public.room_members (room_id, user_id, role)
  select id, owner_id, 'owner' from public.rooms where owner_id is not null
  on conflict (room_id, user_id) do nothing;

-- ---------------------------------------------------------------- helpers ---
create or replace function public.is_room_member(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.room_members where room_id = rid and user_id = auth.uid());
$$;

create or replace function public.is_room_owner(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rooms where id = rid and owner_id = auth.uid());
$$;

create or replace function public.room_visible(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rooms r
    where r.id = rid
      and (
        not r.is_hidden
        or r.owner_id = auth.uid()
        or exists (select 1 from public.room_members m where m.room_id = rid and m.user_id = auth.uid())
      )
  );
$$;

create or replace function public.room_allows_group(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rooms r
    where r.id = rid
      and (
        r.is_public
        or r.owner_id = auth.uid()
        or exists (select 1 from public.room_members m where m.room_id = rid and m.user_id = auth.uid())
      )
  );
$$;

grant execute on function public.is_room_member(uuid)    to authenticated;
grant execute on function public.is_room_owner(uuid)     to authenticated;
grant execute on function public.room_visible(uuid)      to authenticated;
grant execute on function public.room_allows_group(uuid) to authenticated;

-- ------------------------------------------------------------ rooms rls ---
alter table public.rooms enable row level security;
drop policy if exists rooms_select on public.rooms;
drop policy if exists rooms_write  on public.rooms;
drop policy if exists rooms_insert on public.rooms;
drop policy if exists rooms_update on public.rooms;
drop policy if exists rooms_delete on public.rooms;

create policy rooms_select on public.rooms for select to authenticated using (
  not is_hidden
  or owner_id = auth.uid()
  or public.is_room_member(id)
  or public.get_my_role() in ('founder', 'superadmin')
);
create policy rooms_insert on public.rooms for insert to authenticated with check (
  owner_id = auth.uid() and public.get_my_role() in ('founder', 'superadmin')
);
create policy rooms_update on public.rooms for update to authenticated using (
  owner_id = auth.uid() or public.get_my_role() in ('founder', 'superadmin')
);
create policy rooms_delete on public.rooms for delete to authenticated using (
  owner_id = auth.uid() or public.get_my_role() in ('founder', 'superadmin')
);

-- ----------------------------------------------------- room_members rls ---
drop policy if exists room_members_select on public.room_members;
drop policy if exists room_members_insert on public.room_members;
drop policy if exists room_members_delete on public.room_members;

create policy room_members_select on public.room_members for select to authenticated
  using (user_id = auth.uid() or public.is_room_owner(room_id));
create policy room_members_insert on public.room_members for insert to authenticated
  with check (user_id = auth.uid() or public.is_room_owner(room_id));
create policy room_members_delete on public.room_members for delete to authenticated
  using (user_id = auth.uid() or public.is_room_owner(room_id));

-- ------------------------------------------- groups rls (room-aware) ---
alter table public.groups enable row level security;
drop policy if exists groups_select on public.groups;
drop policy if exists groups_insert on public.groups;

create policy groups_select on public.groups for select to authenticated using (
  public.room_visible(room_id)
  and (not is_private or owner_id = auth.uid() or public.is_group_member(id))
);
create policy groups_insert on public.groups for insert to authenticated with check (
  auth.uid() = owner_id and public.room_allows_group(room_id)
);
