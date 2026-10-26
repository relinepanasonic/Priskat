-- Daily Bible challenge: one random chapter a day, the same for everyone.
-- Run once in the Supabase SQL editor AFTER 095. Safe to run again.

-- All chapters of the Bible (Indonesian TB), so the daily pick is a quick lookup
CREATE TABLE IF NOT EXISTS public.bible_chapters (
  book_no integer NOT NULL,
  chapter integer NOT NULL,
  PRIMARY KEY (book_no, chapter)
);
INSERT INTO public.bible_chapters (book_no, chapter)
SELECT DISTINCT book_no, chapter FROM public.bible_verses WHERE translation = 'TB' AND book_no <= 66
ON CONFLICT DO NOTHING;
ALTER TABLE public.bible_chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bible_chapters_read ON public.bible_chapters;
CREATE POLICY bible_chapters_read ON public.bible_chapters FOR SELECT TO authenticated USING (true);

-- Who finished which day's challenge is stored as daily_activity rows of kind 'bible_challenge'
-- (ref = the day), so points, leaderboard and weekly totals just work.

-- Today's chapter: deterministic from the date, so everybody reads the same one
CREATE OR REPLACE FUNCTION public.bible_challenge_status(p_day date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pick record;
  done boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF abs(p_day - (now() AT TIME ZONE 'utc')::date) > 1 THEN RAISE EXCEPTION 'Bad day.'; END IF;
  SELECT c.book_no, c.chapter INTO pick FROM public.bible_chapters c
  ORDER BY md5(c.book_no::text || ':' || c.chapter::text || ':' || p_day::text) LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = uid AND day = p_day AND kind = 'bible_challenge') INTO done;
  RETURN jsonb_build_object('book', pick.book_no, 'chapter', pick.chapter, 'done', done);
END;
$$;

-- Finish the challenge: the person must have read today's chapter (recorded by the reader after ~30 s)
CREATE OR REPLACE FUNCTION public.claim_bible_challenge(p_day date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  st jsonb;
  n integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  st := public.bible_challenge_status(p_day);
  IF st IS NULL OR (st->>'done')::boolean THEN RETURN 0; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.daily_activity
    WHERE user_id = uid AND day = p_day AND kind = 'bible' AND ref = (st->>'book') || ':' || (st->>'chapter')
  ) THEN
    RAISE EXCEPTION 'Baca pasal tantangan hari ini dulu.';
  END IF;

  INSERT INTO public.daily_activity (user_id, day, kind, ref, points) VALUES (uid, p_day, 'bible_challenge', p_day::text, 20) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT count(*) INTO n FROM public.daily_activity WHERE user_id = uid AND kind = 'bible_challenge';
  IF n >= 7  THEN PERFORM public.grant_badge(uid, 'challenge_7'); END IF;
  IF n >= 30 THEN PERFORM public.grant_badge(uid, 'challenge_30'); PERFORM public.grant_item(uid, 'title', 'Pembaca Setia', 'challenge'); END IF;
  PERFORM public.sync_ladder(uid);
  RETURN 20;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bible_challenge_status(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bible_challenge(date) TO authenticated;
