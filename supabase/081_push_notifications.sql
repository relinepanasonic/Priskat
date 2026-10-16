-- Push notifications for new messages (Android app via Firebase Cloud Messaging).
-- Run once in the Supabase SQL editor AFTER:
--   1. setting PUSH_WEBHOOK_SECRET in Vercel, and
--   2. replacing REPLACE_WITH_PUSH_WEBHOOK_SECRET below with the same value.

-- ── Device tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'android',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS push_tokens_user_idx ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_tokens_own" ON public.push_tokens;
CREATE POLICY "push_tokens_own" ON public.push_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Tell the app server about new messages ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_push_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://apps.ruangiman.com/api/push/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', 'REPLACE_WITH_PUSH_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object('table', TG_TABLE_NAME, 'record', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dm_messages_push ON public.dm_messages;
CREATE TRIGGER dm_messages_push AFTER INSERT ON public.dm_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_message();

DROP TRIGGER IF EXISTS group_messages_push ON public.group_messages;
CREATE TRIGGER group_messages_push AFTER INSERT ON public.group_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_message();
