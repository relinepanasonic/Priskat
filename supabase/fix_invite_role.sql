create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter        integer := 0;
begin
  -- derive username from email prefix, strip non-alphanumeric
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || base_username;
  end if;
  final_username := base_username;

  -- ensure uniqueness
  while exists(select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles(id, username, full_name, role)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$;

