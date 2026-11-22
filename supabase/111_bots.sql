-- Ruang Iman bots: accounts that post short daily reflections so the community feed stays alive.
-- They are always labelled "Bot" in the app and kept out of the leaderboard, friend suggestions and member counts.
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_ready boolean NOT NULL DEFAULT false;   -- true once the bot has its new name, bio and picture

-- The test accounts you showed (test, Nico, Test) become bots. Edit this list if needed. Real accounts (any role other than member) are never touched.
UPDATE public.profiles SET is_bot = true
WHERE role = 'member' AND lower(btrim(full_name)) IN ('test', 'nico');

-- The leaderboard never shows bots
CREATE OR REPLACE FUNCTION public.leaderboard_view(p_scope text, p_from date DEFAULT NULL)
RETURNS TABLE (
  rank integer, user_id uuid, name text, avatar_url text, frame text, name_color text, title text,
  points integer, is_me boolean, total_players integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH pts AS (
    SELECT a.user_id AS uid, sum(a.points)::integer AS total
    FROM public.daily_activity a
    WHERE p_scope = 'all' OR (p_from IS NOT NULL AND a.day BETWEEN p_from AND p_from + 6)
    GROUP BY a.user_id
  ),
  ranked AS (
    SELECT (rank() OVER (ORDER BY pts.total DESC))::integer AS r, p.id AS uid,
           coalesce(nullif(p.nama_panggilan, ''), p.full_name) AS nm, p.avatar_url AS av,
           p.equipped_frame AS fr, p.equipped_name_color AS nc, p.equipped_title AS tt, pts.total AS tot
    FROM pts JOIN public.profiles p ON p.id = pts.uid
    WHERE coalesce(p.show_on_leaderboard, true) AND NOT coalesce(p.is_bot, false) AND pts.total > 0
  ),
  me AS (SELECT r FROM ranked WHERE uid = auth.uid()),
  n AS (SELECT count(*)::integer AS c FROM ranked)
  SELECT ranked.r, ranked.uid, ranked.nm, ranked.av, ranked.fr, ranked.nc, ranked.tt, ranked.tot,
         (ranked.uid = auth.uid()), n.c
  FROM ranked CROSS JOIN n
  WHERE auth.uid() IS NOT NULL
    AND (ranked.r <= 10 OR EXISTS (SELECT 1 FROM me WHERE ranked.r BETWEEN me.r - 4 AND me.r + 3))
  ORDER BY ranked.r, ranked.nm
  LIMIT 30;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_view(text, date) TO authenticated;
