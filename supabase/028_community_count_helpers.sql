-- Add increment helpers for cached counts

CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS void LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id UUID)
RETURNS void LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE public.community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_comments_count(post_id UUID)
RETURNS void LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = post_id;
$$;
