-- Blog posts: daily auto-generated Catholic-community content, public + SEO-facing.
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,               -- Markdown body
    meta_description TEXT NOT NULL,      -- <160 chars, used for <meta name="description"> and og:description
    cover_image_url TEXT,
    category TEXT NOT NULL DEFAULT 'umum',   -- e.g. 'orang-kudus', 'sejarah-gereja', 'katekese', 'komunitas', 'umum'
    tags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'flagged')),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_daily')),
    author_name TEXT NOT NULL DEFAULT 'CFM Editorial',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON public.blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public (including anonymous/crawlers) can read only published posts — this is what makes the blog SEO-indexable.
CREATE POLICY "Public can read published posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Global admins/moderators can see and manage everything (draft, flagged, published).
-- Uses the repo's existing public.get_my_role() helper (returns the public.user_role
-- enum) rather than querying profiles.role directly — matches the convention used
-- everywhere else (see 026_add_founder_role.sql, 027_community_social.sql, etc.)
-- and avoids lower(user_role) type errors, since role is an enum, not text.
CREATE POLICY "Admins can read all posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator'));

CREATE POLICY "Admins can insert posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator'));

CREATE POLICY "Admins can update posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator'));

CREATE POLICY "Admins can delete posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.get_my_role()::text IN ('founder', 'superadmin', 'admin', 'moderator'));

-- The daily generator writes via the service-role key (src/lib/supabase/admin.ts),
-- which bypasses RLS entirely, so no separate "service role" policy is needed here.

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.set_blog_posts_updated_at();
