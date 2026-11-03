-- Intensi Doa: members post a prayer intention, others tap "Aku mendoakan".
-- Everything goes through functions, so an anonymous post never exposes who wrote it.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.prayer_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 300),
  is_anonymous boolean NOT NULL DEFAULT false,
  is_answered boolean NOT NULL DEFAULT false,
  prayed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prayer_intention_prayers (
  intention_id uuid NOT NULL REFERENCES public.prayer_intentions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (intention_id, user_id)
);

CREATE INDEX IF NOT EXISTS prayer_intentions_created_idx ON public.prayer_intentions (created_at DESC);

-- No direct access: only the functions below can read or write
ALTER TABLE public.prayer_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_intention_prayers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prayer_intentions FROM anon, authenticated;
REVOKE ALL ON public.prayer_intention_prayers FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.add_intention(p_body text, p_anonymous boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  clean text := btrim(coalesce(p_body, ''));
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF char_length(clean) < 3 OR char_length(clean) > 300 THEN RAISE EXCEPTION 'intention must be 3 to 300 characters'; END IF;
  IF (SELECT count(*) FROM public.prayer_intentions pi WHERE pi.user_id = uid AND pi.created_at > now() - interval '1 day') >= 3 THEN
    RAISE EXCEPTION 'daily limit reached';
  END IF;
  INSERT INTO public.prayer_intentions (user_id, body, is_anonymous) VALUES (uid, clean, coalesce(p_anonymous, false)) RETURNING id INTO new_id;
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.list_intentions(p_limit integer DEFAULT 50)
RETURNS TABLE (id uuid, body text, who text, mine boolean, is_answered boolean, prayed_count integer, i_prayed boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pi.id, pi.body,
         CASE WHEN pi.is_anonymous THEN NULL ELSE coalesce(p.nama_panggilan, p.full_name) END,
         pi.user_id = auth.uid(),
         pi.is_answered,
         pi.prayed_count,
         EXISTS (SELECT 1 FROM public.prayer_intention_prayers x WHERE x.intention_id = pi.id AND x.user_id = auth.uid()),
         pi.created_at
  FROM public.prayer_intentions pi
  JOIN public.profiles p ON p.id = pi.user_id
  WHERE auth.uid() IS NOT NULL
  ORDER BY pi.created_at DESC
  LIMIT least(coalesce(p_limit, 50), 100);
$$;

CREATE OR REPLACE FUNCTION public.pray_for_intention(p_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  total integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  INSERT INTO public.prayer_intention_prayers (intention_id, user_id) VALUES (p_id, uid) ON CONFLICT DO NOTHING;
  UPDATE public.prayer_intentions pi
     SET prayed_count = (SELECT count(*) FROM public.prayer_intention_prayers x WHERE x.intention_id = pi.id)
   WHERE pi.id = p_id
   RETURNING pi.prayed_count INTO total;
  RETURN coalesce(total, 0);
END $$;

CREATE OR REPLACE FUNCTION public.answer_intention(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.prayer_intentions pi SET is_answered = true WHERE pi.id = p_id AND pi.user_id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.delete_intention(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.prayer_intentions pi WHERE pi.id = p_id AND (pi.user_id = auth.uid() OR public.is_site_admin());
END $$;

REVOKE ALL ON FUNCTION public.add_intention(text, boolean), public.list_intentions(integer), public.pray_for_intention(uuid),
  public.answer_intention(uuid), public.delete_intention(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_intention(text, boolean), public.list_intentions(integer), public.pray_for_intention(uuid),
  public.answer_intention(uuid), public.delete_intention(uuid) TO authenticated;
