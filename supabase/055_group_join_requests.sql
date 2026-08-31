-- 055_group_join_requests.sql
-- "Knock on the door" for private groups: joining a private group now
-- creates a pending request that an owner / admin accepts or declines.
-- (Public groups still join instantly — handled client-side.)
--
--   * widen group_members RLS so admins, not just the owner, can see
--     and delete pending rows
--   * request RPCs for the badge + the review list
--   * put group_members on realtime so the knock lands in a split second
-- Idempotent — safe to run more than once.

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members for select to authenticated
  using (user_id = auth.uid() or public.is_group_admin(group_id));

drop policy if exists group_members_delete on public.group_members;
create policy group_members_delete on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_group_admin(group_id));

-- pending join requests for every group I own or administer
create or replace function public.my_pending_group_requests()
returns table (
  request_id  uuid,
  group_id    uuid,
  group_name  text,
  user_id     uuid,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz
) language sql stable security definer set search_path = public as $$
  select gm.id, gm.group_id, g.name, gm.user_id, p.full_name, p.avatar_url, gm.created_at
  from public.group_members gm
  join public.groups   g on g.id = gm.group_id
  join public.profiles p on p.id = gm.user_id
  where gm.status = 'pending'
    and public.is_group_admin(gm.group_id)
  order by gm.created_at desc;
$$;

create or replace function public.my_pending_group_request_count()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.my_pending_group_requests();
$$;

grant execute on function public.my_pending_group_requests()      to authenticated;
grant execute on function public.my_pending_group_request_count() to authenticated;

alter table public.group_members replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.group_members;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
