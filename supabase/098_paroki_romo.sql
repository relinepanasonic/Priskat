-- Home parish on the profile + the Romo corner (prayers, homilies, videos by priests).
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paroki text;

CREATE TABLE IF NOT EXISTS public.romo_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('doa', 'homili', 'video')),
  title text NOT NULL,
  body text,
  video_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS romo_posts_created_idx ON public.romo_posts (created_at DESC);

ALTER TABLE public.romo_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS romo_posts_read ON public.romo_posts;
DROP POLICY IF EXISTS romo_posts_insert ON public.romo_posts;
DROP POLICY IF EXISTS romo_posts_update ON public.romo_posts;
DROP POLICY IF EXISTS romo_posts_delete ON public.romo_posts;

-- Everyone signed in reads published posts (authors and admins also see drafts)
CREATE POLICY romo_posts_read ON public.romo_posts FOR SELECT TO authenticated
  USING (is_published OR author_id = auth.uid() OR public.is_site_admin());

-- Priests (listed in the clergy table) and site admins write; people only change their own posts
CREATE POLICY romo_posts_insert ON public.romo_posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (EXISTS (SELECT 1 FROM public.clergy c WHERE c.user_id = auth.uid()) OR public.is_site_admin())
  );
CREATE POLICY romo_posts_update ON public.romo_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_site_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_site_admin());
CREATE POLICY romo_posts_delete ON public.romo_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_site_admin());
