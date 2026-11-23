-- The account kitchenperfecto77@gmail.com (Yohanes Damar Prasetyo) stops being a bot and becomes a normal test account.
-- Name, bio, photo and everything else stay as they are. It is never made a founder or admin by this file.
-- Run once in the Supabase SQL editor. Safe to run again.

UPDATE public.profiles p
SET is_bot = false, bot_ready = false
FROM auth.users u
WHERE u.id = p.id
  AND lower(u.email) = 'kitchenperfecto77@gmail.com'
  AND p.role IS DISTINCT FROM 'founder';

-- Check: this should show is_bot = false and role = member (or another non-founder role)
SELECT p.full_name, p.role, p.is_bot, p.bot_ready, u.email
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = 'kitchenperfecto77@gmail.com';
