-- Security log: weekly reports from the automated security review (cloud agent).
-- Only the founder can read them; the app server writes them with the service-role key.
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.security_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  severity text NOT NULL DEFAULT 'none' CHECK (severity IN ('none', 'low', 'medium', 'high', 'critical')),
  summary text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  commit_range text,
  pr_url text,
  emailed boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS security_reports_created_idx ON public.security_reports (created_at DESC);

ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS security_reports_founder_read ON public.security_reports;
CREATE POLICY security_reports_founder_read ON public.security_reports FOR SELECT TO authenticated
  USING (public.get_my_role()::text = 'founder');
-- No insert/update/delete policies: only the server (service role) writes reports.
