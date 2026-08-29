-- Add birthdate field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birthdate DATE;

