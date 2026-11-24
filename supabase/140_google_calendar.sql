-- Google Calendar: the Ruang Iman Gmail creates one calendar event per Ruang Iman event and invites every registrant,
-- so the event lands in their own Google Calendar.
-- The sign-in (refresh token) and the event ids are only read by the server (service role); nobody can read them from the app.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.google_calendar_link (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  refresh_token text NOT NULL,
  connected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  connected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_google_calendar (
  event_id uuid PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  google_event_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS on, no policies: only the service role (server) can touch them
ALTER TABLE public.google_calendar_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_google_calendar ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.google_calendar_link FROM anon, authenticated;
REVOKE ALL ON public.event_google_calendar FROM anon, authenticated;

SELECT 'google_calendar_link' AS t, count(*) FROM public.google_calendar_link
UNION ALL SELECT 'event_google_calendar', count(*) FROM public.event_google_calendar;
