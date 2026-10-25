-- Prayer game, part 2: badges, daily loot (Berkat Harian), cosmetics, campaigns + quiz, leaderboard.
-- Run once in the Supabase SQL editor AFTER 094. Safe to run again.

-- ── 1. Profile fields: what a person wears, and whether they are on the leaderboard ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_frame text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_name_color text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard boolean NOT NULL DEFAULT true;

-- Wearing something goes only through equip_item(), so nobody can wear what they did not earn
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_role text;
  is_admin boolean;
BEGIN
  IF auth.uid() IS NULL OR current_setting('app.allow_community_change', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF (NEW.equipped_frame IS DISTINCT FROM OLD.equipped_frame
      OR NEW.equipped_name_color IS DISTINCT FROM OLD.equipped_name_color
      OR NEW.equipped_title IS DISTINCT FROM OLD.equipped_title)
     AND coalesce(current_setting('app.allow_equip', true), '') <> 'on' THEN
    RAISE EXCEPTION 'Use the collection page to change what you wear.' USING ERRCODE = '42501';
  END IF;

  caller_role := coalesce(public.get_my_role()::text, 'member');
  is_admin := caller_role IN ('admin', 'superadmin', 'founder');

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.role::text = 'founder' THEN
      RAISE EXCEPTION 'The founder role cannot be changed.' USING ERRCODE = '42501';
    END IF;
    IF NOT is_admin THEN
      RAISE EXCEPTION 'You are not allowed to change roles.' USING ERRCODE = '42501';
    END IF;
    IF NEW.role::text IN ('founder', 'superadmin') AND caller_role <> 'founder' THEN
      RAISE EXCEPTION 'Only the founder can assign this role.' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.community_id IS DISTINCT FROM OLD.community_id AND NOT is_admin AND NEW.community_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.communities WHERE id = NEW.community_id AND is_public) THEN
      RAISE EXCEPTION 'You cannot join a private community yourself.' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ── 2. Badges and owned items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_key)
);
CREATE TABLE IF NOT EXISTS public.user_items (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('frame', 'name_color', 'title', 'card')),
  item_key text NOT NULL,
  source text,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_type, item_key)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_badges_read ON public.user_badges;
CREATE POLICY user_badges_read ON public.user_badges FOR SELECT TO authenticated USING (true);   -- badges are meant to be seen
DROP POLICY IF EXISTS user_items_own ON public.user_items;
CREATE POLICY user_items_own ON public.user_items FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.grant_item(p_user uuid, p_type text, p_key text, p_source text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_key IS NULL OR p_key = '' THEN RETURN false; END IF;
  INSERT INTO public.user_items (user_id, item_type, item_key, source) VALUES (p_user, p_type, p_key, p_source) ON CONFLICT DO NOTHING;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_badge(p_user uuid, p_key text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ INSERT INTO public.user_badges (user_id, badge_key) VALUES (p_user, p_key) ON CONFLICT DO NOTHING; $$;

-- Rewards that come with the badge ladder (points thresholds match the app)
CREATE OR REPLACE FUNCTION public.sync_ladder(p_user uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE total integer;
BEGIN
  SELECT coalesce(sum(points), 0) INTO total FROM public.daily_activity WHERE user_id = p_user;
  IF total >= 100  THEN PERFORM public.grant_badge(p_user, 'ladder_peziarah');  PERFORM public.grant_item(p_user, 'frame', 'silver_ring', 'ladder'); END IF;
  IF total >= 300  THEN PERFORM public.grant_badge(p_user, 'ladder_setia');     PERFORM public.grant_item(p_user, 'name_color', 'emerald', 'ladder'); END IF;
  IF total >= 700  THEN PERFORM public.grant_badge(p_user, 'ladder_sahabat');   PERFORM public.grant_item(p_user, 'frame', 'gold_ring', 'ladder'); END IF;
  IF total >= 1500 THEN PERFORM public.grant_badge(p_user, 'ladder_pendoa');    PERFORM public.grant_item(p_user, 'name_color', 'gold', 'ladder'); END IF;
  IF total >= 3000 THEN PERFORM public.grant_badge(p_user, 'ladder_saksi');     PERFORM public.grant_item(p_user, 'frame', 'dove', 'ladder'); PERFORM public.grant_item(p_user, 'title', 'Saksi Iman', 'ladder'); END IF;
  IF total >= 6000 THEN PERFORM public.grant_badge(p_user, 'ladder_murid');     PERFORM public.grant_item(p_user, 'frame', 'disciple_crown', 'ladder'); PERFORM public.grant_item(p_user, 'name_color', 'disciple', 'ladder'); PERFORM public.grant_item(p_user, 'title', 'Murid Kristus', 'ladder'); END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_achievements(p_user uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE best_streak integer; full_week boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = p_user AND kind = 'bible') THEN PERFORM public.grant_badge(p_user, 'first_bible'); END IF;
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = p_user AND kind = 'rosary') THEN PERFORM public.grant_badge(p_user, 'first_rosary'); END IF;
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = p_user AND kind = 'jalan_salib') THEN PERFORM public.grant_badge(p_user, 'first_jalan_salib'); END IF;
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = p_user AND kind = 'devotion') THEN PERFORM public.grant_badge(p_user, 'first_devotion'); END IF;
  IF EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = p_user AND kind = 'redeem') THEN PERFORM public.grant_badge(p_user, 'first_redeem'); END IF;
  IF (SELECT count(DISTINCT ref) FROM public.daily_activity WHERE user_id = p_user AND kind = 'bible') >= 10 THEN PERFORM public.grant_badge(p_user, 'bible_10'); END IF;
  IF (SELECT count(*) FROM public.daily_activity WHERE user_id = p_user AND kind = 'rosary') >= 10 THEN PERFORM public.grant_badge(p_user, 'rosary_10'); END IF;
  IF (SELECT count(*) FROM public.daily_activity WHERE user_id = p_user AND kind = 'devotion') >= 7 THEN PERFORM public.grant_badge(p_user, 'devotion_7'); END IF;

  SELECT EXISTS (
    SELECT 1 FROM (
      SELECT date_trunc('week', day::timestamp) AS w, count(DISTINCT day) AS n
      FROM public.daily_activity WHERE user_id = p_user AND kind IN ('bible','devotion','prayer','rosary','jalan_salib','ekaristi','aramaic','reading','redeem')
      GROUP BY 1
    ) x WHERE n >= 7
  ) INTO full_week;
  IF full_week THEN PERFORM public.grant_badge(p_user, 'week_full'); END IF;

  SELECT coalesce(max(c), 0) INTO best_streak FROM (
    SELECT count(*) AS c FROM (
      SELECT day, day - (row_number() OVER (ORDER BY day))::integer AS g
      FROM (SELECT DISTINCT day FROM public.daily_activity WHERE user_id = p_user AND kind IN ('bible','devotion','prayer','rosary','jalan_salib','ekaristi','aramaic','reading','redeem')) d
    ) s GROUP BY g
  ) t;
  IF best_streak >= 7  THEN PERFORM public.grant_badge(p_user, 'streak_7');  END IF;
  IF best_streak >= 30 THEN PERFORM public.grant_badge(p_user, 'streak_30'); END IF;
END;
$$;

-- ── 3. record_activity / redeem_day now also award badges ───────────────────
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
  IF abs(d - (now() AT TIME ZONE 'utc')::date) > 1 THEN RAISE EXCEPTION 'Bad day.'; END IF;

  SELECT coalesce(sum(points), 0) INTO total FROM public.daily_activity
  WHERE user_id = uid AND day = d AND kind NOT IN ('redeem', 'loot', 'campaign');
  IF total >= 100 THEN RETURN 0; END IF;

  INSERT INTO public.daily_activity (user_id, day, kind, ref, points)
  VALUES (uid, d, p_kind, left(coalesce(p_ref, ''), 80), pts)
  ON CONFLICT DO NOTHING;
  IF FOUND THEN
    PERFORM public.check_achievements(uid);
    PERFORM public.sync_ladder(uid);
    RETURN pts;
  END IF;
  RETURN 0;
END;
$$;

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

  wk := date_trunc('week', p_today::timestamp)::date;
  SELECT count(*) INTO used FROM public.daily_activity WHERE user_id = uid AND kind = 'redeem' AND redeemed_on >= wk;
  IF used >= 2 THEN RAISE EXCEPTION 'Batas tebus minggu ini sudah tercapai.'; END IF;

  INSERT INTO public.daily_activity (user_id, day, kind, ref, points, redeemed_on)
  VALUES (uid, p_missed, 'redeem', left(coalesce(p_ref, ''), 80), 5, p_today);
  PERFORM public.check_achievements(uid);
  PERFORM public.sync_ladder(uid);
  RETURN 'redeemed';
END;
$$;

-- ── 4. Berkat Harian: one chest a day, after the first prayer ───────────────
CREATE TABLE IF NOT EXISTS public.loot_claims (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day date NOT NULL,
  reward jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.loot_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS loot_claims_own ON public.loot_claims;
CREATE POLICY loot_claims_own ON public.loot_claims FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.claim_loot(p_day date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cards text[] := ARRAY['card_maria','card_yosef','card_fransiskus','card_theresia','card_agustinus','card_ignatius','card_antonius','card_yohanes_paulus_2','card_teresa_kalkuta','card_katarina_siena','card_dominikus','card_benediktus','card_faustina','card_padre_pio','card_yohanes_bosco','verse_yoh_3_16','verse_mzm_23_1','verse_mat_11_28'];
  frames text[] := ARRAY['olive_branch','star_ring'];
  colors text[] := ARRAY['rose','sky','violet'];
  r double precision := random();
  streak integer := 0;
  cur date;
  pick text;
  reward jsonb;
  recent_special integer;
  big boolean;
  pool text[];
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF abs(p_day - (now() AT TIME ZONE 'utc')::date) > 1 THEN RAISE EXCEPTION 'Bad day.'; END IF;
  IF EXISTS (SELECT 1 FROM public.loot_claims WHERE user_id = uid AND day = p_day) THEN RAISE EXCEPTION 'Berkat hari ini sudah diambil.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = uid AND day = p_day AND kind NOT IN ('redeem','loot','campaign')) THEN
    RAISE EXCEPTION 'Berdoalah dulu hari ini.';
  END IF;

  -- a bigger chest on the 7th day in a row
  cur := p_day;
  WHILE EXISTS (SELECT 1 FROM public.daily_activity WHERE user_id = uid AND day = cur AND kind NOT IN ('loot','campaign')) AND streak < 7 LOOP
    streak := streak + 1; cur := cur - 1;
  END LOOP;
  big := streak >= 7;

  -- pity: after 6 chests without a card or cosmetic, the next one has one
  SELECT count(*) INTO recent_special FROM (
    SELECT reward FROM public.loot_claims WHERE user_id = uid ORDER BY day DESC LIMIT 6
  ) x WHERE reward->>'type' IN ('card', 'cosmetic');
  IF (SELECT count(*) FROM public.loot_claims WHERE user_id = uid) >= 6 AND recent_special = 0 THEN r := 0.7; END IF;
  IF big THEN r := 0.7; END IF;

  IF r < 0.60 THEN
    reward := jsonb_build_object('type', 'points', 'amount', 5 + floor(random() * 11)::int);
  ELSIF r < 0.88 THEN
    SELECT array_agg(c) INTO pool FROM unnest(cards) c WHERE NOT EXISTS (SELECT 1 FROM public.user_items WHERE user_id = uid AND item_type = 'card' AND item_key = c);
    IF pool IS NULL THEN
      reward := jsonb_build_object('type', 'points', 'amount', 15);
    ELSE
      pick := pool[1 + floor(random() * array_length(pool, 1))::int];
      PERFORM public.grant_item(uid, 'card', pick, 'loot');
      reward := jsonb_build_object('type', 'card', 'key', pick);
    END IF;
  ELSIF r < 0.97 THEN
    SELECT array_agg(f) INTO pool FROM unnest(frames) f WHERE NOT EXISTS (SELECT 1 FROM public.user_items WHERE user_id = uid AND item_type = 'frame' AND item_key = f);
    IF pool IS NOT NULL AND random() < 0.5 THEN
      pick := pool[1 + floor(random() * array_length(pool, 1))::int];
      PERFORM public.grant_item(uid, 'frame', pick, 'loot');
      reward := jsonb_build_object('type', 'cosmetic', 'item_type', 'frame', 'key', pick);
    ELSE
      SELECT array_agg(c) INTO pool FROM unnest(colors) c WHERE NOT EXISTS (SELECT 1 FROM public.user_items WHERE user_id = uid AND item_type = 'name_color' AND item_key = c);
      IF pool IS NULL THEN
        reward := jsonb_build_object('type', 'points', 'amount', 20);
      ELSE
        pick := pool[1 + floor(random() * array_length(pool, 1))::int];
        PERFORM public.grant_item(uid, 'name_color', pick, 'loot');
        reward := jsonb_build_object('type', 'cosmetic', 'item_type', 'name_color', 'key', pick);
      END IF;
    END IF;
  ELSE
    reward := jsonb_build_object('type', 'points', 'amount', 50);
  END IF;

  IF big AND reward->>'type' = 'points' THEN
    reward := jsonb_build_object('type', 'points', 'amount', (reward->>'amount')::int + 20);
  END IF;
  IF big THEN reward := reward || jsonb_build_object('big', true); END IF;

  INSERT INTO public.loot_claims (user_id, day, reward) VALUES (uid, p_day, reward);
  IF reward->>'type' = 'points' THEN
    INSERT INTO public.daily_activity (user_id, day, kind, ref, points) VALUES (uid, p_day, 'loot', 'loot', (reward->>'amount')::int) ON CONFLICT DO NOTHING;
    PERFORM public.sync_ladder(uid);
  END IF;
  RETURN reward;
END;
$$;

-- ── 5. Wearing items ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.equip_item(p_type text, p_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF p_type NOT IN ('frame', 'name_color', 'title') THEN RAISE EXCEPTION 'Unknown item type.'; END IF;
  IF coalesce(p_key, '') <> '' AND NOT EXISTS (SELECT 1 FROM public.user_items WHERE user_id = uid AND item_type = p_type AND item_key = p_key) THEN
    RAISE EXCEPTION 'Kamu belum memiliki item ini.' USING ERRCODE = '42501';
  END IF;
  PERFORM set_config('app.allow_equip', 'on', true);
  IF p_type = 'frame' THEN UPDATE public.profiles SET equipped_frame = nullif(p_key, '') WHERE id = uid;
  ELSIF p_type = 'name_color' THEN UPDATE public.profiles SET equipped_name_color = nullif(p_key, '') WHERE id = uid;
  ELSE UPDATE public.profiles SET equipped_title = nullif(p_key, '') WHERE id = uid; END IF;
END;
$$;

-- ── 6. Campaigns ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  emoji text DEFAULT '🎯',
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  reward_frame text,
  reward_name_color text,
  reward_title text,
  reward_badge text,
  reward_points integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.campaign_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kind text NOT NULL,            -- an activity kind, or 'quiz'
  target integer NOT NULL,       -- days to pray, or the pass mark of the quiz
  label text NOT NULL,
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.campaign_quiz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  answer integer NOT NULL
);
CREATE TABLE IF NOT EXISTS public.quiz_results (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total integer NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, campaign_id)
);
CREATE TABLE IF NOT EXISTS public.campaign_completions (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, campaign_id)
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_read ON public.campaigns;
DROP POLICY IF EXISTS campaigns_write ON public.campaigns;
CREATE POLICY campaigns_read ON public.campaigns FOR SELECT TO authenticated USING (is_active OR public.is_site_admin());
CREATE POLICY campaigns_write ON public.campaigns FOR ALL TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS campaign_tasks_read ON public.campaign_tasks;
DROP POLICY IF EXISTS campaign_tasks_write ON public.campaign_tasks;
CREATE POLICY campaign_tasks_read ON public.campaign_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY campaign_tasks_write ON public.campaign_tasks FOR ALL TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
-- The quiz table holds the answers: only admins read or write it; members use get_campaign_quiz()/submit_quiz()
DROP POLICY IF EXISTS campaign_quiz_admin ON public.campaign_quiz;
CREATE POLICY campaign_quiz_admin ON public.campaign_quiz FOR ALL TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS quiz_results_own ON public.quiz_results;
CREATE POLICY quiz_results_own ON public.quiz_results FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS campaign_completions_own ON public.campaign_completions;
CREATE POLICY campaign_completions_own ON public.campaign_completions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.campaign_progress(p_campaign uuid)
RETURNS TABLE (task_id uuid, label text, kind text, target integer, done integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT t.id, t.label, t.kind, t.target,
    CASE WHEN t.kind = 'quiz'
      THEN coalesce((SELECT q.score FROM public.quiz_results q WHERE q.user_id = auth.uid() AND q.campaign_id = c.id), 0)
      ELSE (SELECT count(DISTINCT a.day)::integer FROM public.daily_activity a
            WHERE a.user_id = auth.uid() AND a.kind = t.kind AND a.day BETWEEN c.starts_on AND c.ends_on)
    END
  FROM public.campaign_tasks t JOIN public.campaigns c ON c.id = t.campaign_id
  WHERE t.campaign_id = p_campaign
  ORDER BY t.sort, t.label;
$$;

-- Everyone together: how many prayers of the first task's kind were said during the campaign
CREATE OR REPLACE FUNCTION public.campaign_community_total(p_campaign uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.daily_activity a, public.campaigns c
  WHERE c.id = p_campaign AND a.day BETWEEN c.starts_on AND c.ends_on
    AND a.kind = (SELECT t.kind FROM public.campaign_tasks t WHERE t.campaign_id = c.id AND t.kind <> 'quiz' ORDER BY t.sort LIMIT 1);
$$;

CREATE OR REPLACE FUNCTION public.get_campaign_quiz(p_campaign uuid)
RETURNS TABLE (idx integer, question text, options jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT q.idx, q.question, q.options FROM public.campaign_quiz q
  JOIN public.campaigns c ON c.id = q.campaign_id
  WHERE q.campaign_id = p_campaign AND c.is_active ORDER BY q.idx;
$$;

CREATE OR REPLACE FUNCTION public.submit_quiz(p_campaign uuid, p_answers integer[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  total integer;
  score integer := 0;
  q record;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.campaigns WHERE id = p_campaign AND is_active) THEN RAISE EXCEPTION 'Kampanye tidak ditemukan.'; END IF;
  SELECT count(*) INTO total FROM public.campaign_quiz WHERE campaign_id = p_campaign;
  FOR q IN SELECT idx, answer FROM public.campaign_quiz WHERE campaign_id = p_campaign ORDER BY idx LOOP
    IF p_answers[q.idx + 1] IS NOT NULL AND p_answers[q.idx + 1] = q.answer THEN score := score + 1; END IF;
  END LOOP;
  INSERT INTO public.quiz_results (user_id, campaign_id, score, total) VALUES (uid, p_campaign, score, total)
  ON CONFLICT (user_id, campaign_id) DO UPDATE SET score = greatest(public.quiz_results.score, excluded.score), total = excluded.total, taken_at = now();
  RETURN jsonb_build_object('score', score, 'total', total);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_campaign_reward(p_campaign uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  c record;
  open_tasks integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.campaigns WHERE id = p_campaign AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Kampanye tidak ditemukan.'; END IF;
  IF EXISTS (SELECT 1 FROM public.campaign_completions WHERE user_id = uid AND campaign_id = p_campaign) THEN RAISE EXCEPTION 'Hadiah sudah diambil.'; END IF;

  SELECT count(*) INTO open_tasks FROM public.campaign_progress(p_campaign) WHERE done < target;
  IF open_tasks > 0 OR NOT EXISTS (SELECT 1 FROM public.campaign_tasks WHERE campaign_id = p_campaign) THEN
    RAISE EXCEPTION 'Tugas kampanye belum selesai.';
  END IF;

  INSERT INTO public.campaign_completions (user_id, campaign_id) VALUES (uid, p_campaign);
  PERFORM public.grant_item(uid, 'frame', c.reward_frame, 'campaign:' || c.slug);
  PERFORM public.grant_item(uid, 'name_color', c.reward_name_color, 'campaign:' || c.slug);
  PERFORM public.grant_item(uid, 'title', c.reward_title, 'campaign:' || c.slug);
  IF c.reward_badge IS NOT NULL AND c.reward_badge <> '' THEN PERFORM public.grant_badge(uid, c.reward_badge); END IF;
  IF c.reward_points > 0 THEN
    INSERT INTO public.daily_activity (user_id, day, kind, ref, points)
    VALUES (uid, (now() AT TIME ZONE 'utc')::date, 'campaign', left(c.slug, 70), c.reward_points) ON CONFLICT DO NOTHING;
    PERFORM public.sync_ladder(uid);
  END IF;
  RETURN jsonb_build_object('frame', c.reward_frame, 'name_color', c.reward_name_color, 'title', c.reward_title, 'badge', c.reward_badge, 'points', c.reward_points);
END;
$$;

-- ── 7. Leaderboard (weekly or all time; people can switch themselves off) ────
CREATE OR REPLACE FUNCTION public.leaderboard(p_scope text, p_from date DEFAULT NULL)
RETURNS TABLE (rank integer, user_id uuid, name text, avatar_url text, frame text, name_color text, title text, points integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH pts AS (
    SELECT a.user_id AS uid, sum(a.points)::integer AS total
    FROM public.daily_activity a
    WHERE p_scope = 'all' OR (p_from IS NOT NULL AND a.day BETWEEN p_from AND p_from + 6)
    GROUP BY a.user_id
  )
  SELECT (rank() OVER (ORDER BY pts.total DESC))::integer, p.id, coalesce(nullif(p.nama_panggilan, ''), p.full_name), p.avatar_url,
         p.equipped_frame, p.equipped_name_color, p.equipped_title, pts.total
  FROM pts JOIN public.profiles p ON p.id = pts.uid
  WHERE coalesce(p.show_on_leaderboard, true) AND pts.total > 0 AND auth.uid() IS NOT NULL
  ORDER BY pts.total DESC, p.full_name
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.my_rank(p_scope text, p_from date DEFAULT NULL)
RETURNS TABLE (rank integer, points integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH pts AS (
    SELECT a.user_id AS uid, sum(a.points)::integer AS total
    FROM public.daily_activity a
    WHERE p_scope = 'all' OR (p_from IS NOT NULL AND a.day BETWEEN p_from AND p_from + 6)
    GROUP BY a.user_id
  ), mine AS (SELECT total FROM pts WHERE uid = auth.uid())
  SELECT ((SELECT count(*) FROM pts JOIN public.profiles p ON p.id = pts.uid WHERE coalesce(p.show_on_leaderboard, true) AND pts.total > (SELECT total FROM mine)) + 1)::integer,
         (SELECT total FROM mine)
  WHERE EXISTS (SELECT 1 FROM mine);
$$;

GRANT EXECUTE ON FUNCTION public.claim_loot(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.equip_item(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.campaign_progress(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.campaign_community_total(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_quiz(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz(uuid, integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_campaign_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard(text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_rank(text, date) TO authenticated;
-- The helper functions are for the server-side functions above only
REVOKE EXECUTE ON FUNCTION public.grant_item(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_badge(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_ladder(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_achievements(uuid) FROM PUBLIC, anon, authenticated;

-- ── 8. First campaign: Bulan Arwah (November 2026) ───────────────────────────
INSERT INTO public.campaigns (slug, title, description, emoji, starts_on, ends_on, reward_frame, reward_title, reward_badge, reward_points)
VALUES ('bulan-arwah-2026', 'Bulan Arwah', 'November adalah bulan doa bagi jiwa-jiwa orang beriman yang sudah meninggal. Berdoalah setiap hari dan jawab kuis untuk memperoleh bingkai lilin Arwah.',
        '🕯️', DATE '2026-11-01', DATE '2026-11-30', 'arwah_candle', 'Pendoa Arwah 2026', 'camp_arwah_2026', 100)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.campaign_tasks (campaign_id, kind, target, label, sort)
SELECT c.id, 'prayer', 15, 'Berdoa 15 hari di bulan November', 1 FROM public.campaigns c
WHERE c.slug = 'bulan-arwah-2026' AND NOT EXISTS (SELECT 1 FROM public.campaign_tasks t WHERE t.campaign_id = c.id);
INSERT INTO public.campaign_tasks (campaign_id, kind, target, label, sort)
SELECT c.id, 'quiz', 7, 'Kuis Bulan Arwah (nilai minimal 7 dari 10)', 2 FROM public.campaigns c
WHERE c.slug = 'bulan-arwah-2026' AND (SELECT count(*) FROM public.campaign_tasks t WHERE t.campaign_id = c.id) = 1;

INSERT INTO public.campaign_quiz (campaign_id, idx, question, options, answer)
SELECT c.id, v.idx, v.q, v.opts::jsonb, v.ans
FROM public.campaigns c,
(VALUES
  (0, 'Pada tanggal 2 November Gereja Katolik memperingati …', '["Semua Orang Kudus","Arwah semua orang beriman","Kenaikan Tuhan","Pentakosta"]', 1),
  (1, 'Hari Raya Semua Orang Kudus dirayakan pada tanggal …', '["31 Oktober","1 November","2 November","8 Desember"]', 1),
  (2, 'Keadaan pemurnian setelah kematian bagi mereka yang belum sepenuhnya murni disebut …', '["Api penyucian","Limbo","Neraka","Surga"]', 0),
  (3, 'Doa yang paling berdaya bagi arwah, menurut ajaran Gereja, adalah …', '["Perayaan Ekaristi (Misa)","Berpuasa saja","Menyalakan lilin saja","Membaca koran"]', 0),
  (4, 'Kitab yang menceritakan Yudas Makabe mempersembahkan kurban bagi orang yang telah gugur adalah …', '["2 Makabe","Kejadian","Wahyu","Rut"]', 0),
  (5, 'Persekutuan para kudus terdiri dari Gereja jaya, Gereja yang berziarah, dan …', '["Gereja yang menderita","Gereja yang bersembunyi","Gereja yang pergi","Gereja yang tidur"]', 0),
  (6, 'Warna liturgi yang boleh dipakai pada Misa arwah adalah …', '["Merah muda saja","Hijau saja","Ungu, hitam, atau putih","Biru saja"]', 2),
  (7, 'Siapa sahabat Yesus yang dibangkitkan dari kematian menurut Injil Yohanes 11?', '["Lazarus","Petrus","Yohanes","Andreas"]', 0),
  (8, 'Kita berdoa bagi arwah supaya mereka …', '["Disucikan dan masuk dalam kemuliaan surga","Kembali ke dunia","Dilupakan","Menjadi malaikat"]', 0),
  (9, 'Yesus bersabda: "Akulah kebangkitan dan hidup. Barangsiapa percaya kepada-Ku, ia akan …"', '["Hidup walaupun ia sudah mati","Kaya raya","Tidak pernah sakit","Menjadi raja"]', 0)
) AS v(idx, q, opts, ans)
WHERE c.slug = 'bulan-arwah-2026' AND NOT EXISTS (SELECT 1 FROM public.campaign_quiz z WHERE z.campaign_id = c.id);
