-- 056_group_chat_previews.sql
-- The group list should show the last chat message under each group name
-- (like the DM inbox), not just "N members". This RPC returns the latest
-- message for every group the caller has joined, resolved through the
-- group's single chat sub-thread.
-- Idempotent — safe to run more than once.

create or replace function public.my_group_previews()
returns table (
  group_id         uuid,
  last_content     text,
  last_author_id   uuid,
  last_author_name text,
  last_at          timestamptz
) language sql stable security definer set search_path = public as $$
  with my as (
    select gm.group_id,
           (select gs.id
              from public.group_subgroups gs
             where gs.group_id = gm.group_id
             order by gs.created_at
             limit 1) as chat_id
    from public.group_members gm
    where gm.user_id = auth.uid() and gm.status = 'accepted'
  ),
  last_msg as (
    select distinct on (m.subgroup_id)
           m.subgroup_id, m.content, m.author_id, m.created_at
    from public.group_messages m
    join my on my.chat_id = m.subgroup_id
    order by m.subgroup_id, m.created_at desc
  )
  select my.group_id, lm.content, lm.author_id, p.full_name, lm.created_at
  from my
  join last_msg lm on lm.subgroup_id = my.chat_id
  left join public.profiles p on p.id = lm.author_id;
$$;

grant execute on function public.my_group_previews() to authenticated;
