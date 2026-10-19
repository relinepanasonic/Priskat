-- Prayer reminders (Angelus, daily reading, Rosary ...) sent as push notifications to the Android app.
-- Run once in the Supabase SQL editor AFTER 081 (push tokens + pg_net).
-- Replace REPLACE_WITH_PUSH_WEBHOOK_SECRET with the same value as PUSH_WEBHOOK_SECRET in Vercel
-- (or use a *.local.sql copy, which git ignores).

CREATE TABLE IF NOT EXISTS public.prayer_reminders (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  slots text[] NOT NULL DEFAULT '{}',
  tz_offset integer NOT NULL DEFAULT 420,   -- minutes from UTC (Jakarta = 420)
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_reminders_own ON public.prayer_reminders;
CREATE POLICY prayer_reminders_own ON public.prayer_reminders FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Every 15 minutes ask the app server which reminders are due
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'prayer-reminders';
SELECT cron.schedule(
  'prayer-reminders',
  '*/15 * * * *',
  $$ SELECT net.http_post(
       url := 'https://apps.ruangiman.com/api/push/reminders',
       headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', 'REPLACE_WITH_PUSH_WEBHOOK_SECRET'),
       body := '{}'::jsonb
     ) $$
);
