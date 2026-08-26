-- Create the community_posts table for the social feed
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users" 
ON public.community_posts
FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "Allow authenticated users to insert posts" 
ON public.community_posts
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts" 
ON public.community_posts
FOR DELETE
TO authenticated 
USING (auth.uid() = author_id);

-- Create a view to easily fetch posts with author details
CREATE OR REPLACE VIEW public.community_posts_with_authors AS
SELECT 
    p.id,
    p.content,
    p.created_at,
    p.author_id,
    pr.full_name as author_name,
    pr.avatar_url as author_avatar
FROM public.community_posts p
JOIN public.profiles pr ON p.author_id = pr.id;

