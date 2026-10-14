-- Content moderation for the community feed (required by Google Play UGC policy).
-- Run once in the Supabase SQL editor.

-- ── Reports ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can file reports" ON public.content_reports;
CREATE POLICY "Users can file reports" ON public.content_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can see their own reports" ON public.content_reports;
CREATE POLICY "Users can see their own reports" ON public.content_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- ── Blocks ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own blocks" ON public.user_blocks;
CREATE POLICY "Users manage their own blocks" ON public.user_blocks
  FOR ALL TO authenticated USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);
