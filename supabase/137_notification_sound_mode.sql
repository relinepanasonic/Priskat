-- Sound or vibrate only, for the prayer reminders and for chat and friend notifications.
-- Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.prayer_reminders ADD COLUMN IF NOT EXISTS prayer_mode text NOT NULL DEFAULT 'sound';
ALTER TABLE public.prayer_reminders ADD COLUMN IF NOT EXISTS chat_mode text NOT NULL DEFAULT 'sound';
ALTER TABLE public.prayer_reminders DROP CONSTRAINT IF EXISTS prayer_reminders_prayer_mode_check;
ALTER TABLE public.prayer_reminders DROP CONSTRAINT IF EXISTS prayer_reminders_chat_mode_check;
ALTER TABLE public.prayer_reminders ADD CONSTRAINT prayer_reminders_prayer_mode_check CHECK (prayer_mode IN ('sound', 'vibrate'));
ALTER TABLE public.prayer_reminders ADD CONSTRAINT prayer_reminders_chat_mode_check CHECK (chat_mode IN ('sound', 'vibrate'));
