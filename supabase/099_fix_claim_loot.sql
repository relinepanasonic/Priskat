-- Fix: "column reference reward is ambiguous" when opening Berkat Harian.
-- Run once in the Supabase SQL editor. (The same fix is now in 095.)

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
    SELECT lc.reward FROM public.loot_claims lc WHERE lc.user_id = uid ORDER BY lc.day DESC LIMIT 6
  ) x WHERE x.reward->>'type' IN ('card', 'cosmetic');
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

GRANT EXECUTE ON FUNCTION public.claim_loot(date) TO authenticated;
