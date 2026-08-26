-- Add phone number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Add username if it's missing (though it was supposed to be there already)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
