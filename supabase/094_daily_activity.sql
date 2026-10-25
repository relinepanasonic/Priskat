-- Prayer game: daily activity (what the person actually prayed or read), points, and "Tebus Hari".
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.daily_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day date NOT NULL,                 -- the person's own local date
  kind text NOT NULL,                -- bible, devotion, prayer, rosary, jalan_salib, ekaristi, aramaic, reading, redeem
  ref text NOT NULL DEFAULT '',      -- e.g. "43:3" (book:chapter), a prayer id
  points integer NOT NULL,
  redeemed_on date,                  -- only for kind = 'redeem': the day the missed day was redeemed
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day, kind, ref)
);
CREATE INDEX IF NOT EXISTS daily_activity_user_day_idx ON public.daily_activity (user_id, day DESC);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_activity_own_read ON public.daily_activity;
CREATE POLICY daily_activity_own_read ON public.daily_activity FOR SELECT TO authenticated USING (user_id = auth.uid());
-- No insert/update/delete policies: everything goes through the functions below.

-- ── Record one activity (points are decided here, not by the phone) ─────────
CREATE OR REPLACE FUNCTION public.record_activity(p_kind text, p_ref text DEFAULT '', p_day date DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  d date;
  pts integer;
  total integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;

  pts := CASE p_kind
    WHEN 'bible' THEN 10 WHEN 'devotion' THEN 15 WHEN 'prayer' THEN 5 WHEN 'rosary' THEN 20
    WHEN 'jalan_salib' THEN 15 WHEN 'ekaristi' THEN 5 WHEN 'aramaic' THEN 5 WHEN 'reading' THEN 10
    ELSE NULL END;
  IF pts IS NULL THEN RAISE EXCEPTION 'Unknown activity.'; END IF;

  d := coalesce(p_day, (now() AT TIME ZONE 'Asia/Jakarta')::date);
  -- local dates differ from UTC by at most a day; anything else is a wrong clock or a cheat
  IF abs(d - (now() AT TIME ZONE 'utc')::date) > 1 THEN RAISE EXCEPTION 'Bad day.'; END IF;

  SELECT coalesce(sum(points), 0) INTO total FROM public.daily_activity WHERE user_id = uid AND day = d AND kind <> 'redeem';
  IF total >= 100 THEN RETURN 0; END IF;  -- daily cap

  INSERT INTO public.daily_activity (user_id, day, kind, ref, points)
  VALUES (uid, d, p_kind, left(coalesce(p_ref, ''), 80), pts)
  ON CONFLICT DO NOTHING;
  IF FOUND THEN RETURN pts; END IF;
  RETURN 0;
END;
$$;

-- ── Tebus Hari: redeem a missed day by praying the prayer given today ───────
CREATE OR REPLACE FUNCTION public.redeem_day(p_missed date, p_today date, p_ref text DEFAULT '')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  wk date;
  used integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF abs(p_today - (now() AT TIME ZONE 'utc')::date) > 1 THEN RAISE EXCEPTION 'Bad day.'; END IF;
  IF p_missed >= p_today OR p_today - p_missed > 3 THEN RAISE EXCEPTION 'Hari ini tidak bisa ditebus.'; END IF;
  IF p_missed < DATE '2026-10-26' THEN RAISE EXCEPTION 'Hari ini tidak bisa ditebus.'; END IF;
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = uid AND day = p_missed) THEN
    RAISE EXCEPTION 'Hari itu sudah tercatat.';
  END IF;

  wk := date_trunc('week', p_today::timestamp)::date;  -- Monday
  SELECT count(*) INTO used FROM public.daily_activity WHERE user_id = uid AND kind = 'redeem' AND redeemed_on >= wk;
  IF used >= 2 THEN RAISE EXCEPTION 'Batas tebus minggu ini sudah tercapai.'; END IF;

  INSERT INTO public.daily_activity (user_id, day, kind, ref, points, redeemed_on)
  VALUES (uid, p_missed, 'redeem', left(coalesce(p_ref, ''), 80), 5, p_today);
  RETURN 'redeemed';
END;
$$;

CREATE OR REPLACE FUNCTION public.my_total_points()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce(sum(points), 0)::integer FROM public.daily_activity WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.record_activity(text, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_day(date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_total_points() TO authenticated;
