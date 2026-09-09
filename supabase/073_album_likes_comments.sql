CREATE TABLE IF NOT EXISTS public.album_likes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    album_owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, album_owner_id)
);

CREATE TABLE IF NOT EXISTS public.album_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.album_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_comments ENABLE ROW LEVEL SECURITY;

-- Policies for album_likes
DO $
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Anyone can view album likes') THEN
    CREATE POLICY "Anyone can view album likes" ON public.album_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can insert their own likes') THEN
    CREATE POLICY "Users can insert their own likes" ON public.album_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own likes') THEN
    CREATE POLICY "Users can delete their own likes" ON public.album_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$;

-- Policies for album_comments
DO $
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Anyone can view album comments') THEN
    CREATE POLICY "Anyone can view album comments" ON public.album_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can insert their own comments') THEN
    CREATE POLICY "Users can insert their own comments" ON public.album_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON public.album_comments FOR DELETE USING (auth.uid() = author_id);
  END IF;
END
$;
