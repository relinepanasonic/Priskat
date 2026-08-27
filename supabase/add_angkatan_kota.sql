ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS angkatan TEXT,
ADD COLUMN IF NOT EXISTS kota TEXT,
ADD COLUMN IF NOT EXISTS camp_history JSONB DEFAULT '[]'::jsonb;

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
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || base_username;
  end if;
  final_username := base_username;

  while exists(select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles(id, username, full_name, role, angkatan, kota, camp_history, completed_modules)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')::public.user_role,
    new.raw_user_meta_data->>'angkatan',
    new.raw_user_meta_data->>'kota',
    coalesce((new.raw_user_meta_data->>'camp_history')::jsonb, '[]'::jsonb),
    -- Also parse completed_modules from JSON array
    ARRAY(SELECT jsonb_array_elements_text(coalesce((new.raw_user_meta_data->>'completed_modules')::jsonb, '[]'::jsonb)))
  );
  return new;
end;
$$;
