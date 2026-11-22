-- Event registration with manual bank transfer, admin approval, QR ticket and attendance (check-in by scanning).
-- Flow:  person registers  ->  (paid event) transfers and uploads the proof  ->  admin approves or rejects
--        ->  approved person gets a QR ticket  ->  the event admin scans it at the door  ->  attendance is recorded.
-- Free events skip the payment: they are approved straight away.
-- Nobody writes these tables directly: every change goes through the functions below, which check who is allowed.
-- Needs 105_connect_groups.sql (community_admin_of) and 058 (events.community_id).
-- Run once in the Supabase SQL editor. Safe to run again.

-- Who may manage an event: site admins, the admins of its community, and the person who created it
CREATE OR REPLACE FUNCTION public.event_admin_of(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event AND (e.author_id = auth.uid() OR public.community_admin_of(e.community_id))
  ) OR public.is_site_admin();
$$;

-- Registration settings of one event (what it costs, where to transfer, which questions to ask)
CREATE TABLE IF NOT EXISTS public.event_reg_settings (
  event_id uuid PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  open boolean NOT NULL DEFAULT false,
  price integer NOT NULL DEFAULT 0 CHECK (price BETWEEN 0 AND 100000000),   -- rupiah, 0 = free
  bank_name text CHECK (bank_name IS NULL OR char_length(bank_name) <= 60),
  bank_account text CHECK (bank_account IS NULL OR char_length(bank_account) <= 60),
  bank_holder text CHECK (bank_holder IS NULL OR char_length(bank_holder) <= 120),
  payment_note text CHECK (payment_note IS NULL OR char_length(payment_note) <= 600),
  deadline date,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,   -- extra questions: [{"key","label","type":"text|select","required","options":[]}]
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'pending_review', 'approved', 'rejected', 'cancelled')),
  amount integer NOT NULL DEFAULT 0,
  proof_path text,
  reject_reason text CHECK (reject_reason IS NULL OR char_length(reject_reason) <= 300),
  ticket_code text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  checked_in_at timestamptz,
  checked_in_by uuid,
  decided_at timestamptz,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS event_registrations_event_idx ON public.event_registrations (event_id, status);
CREATE INDEX IF NOT EXISTS event_registrations_user_idx ON public.event_registrations (user_id);

ALTER TABLE public.event_reg_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_reg_settings_read ON public.event_reg_settings;
CREATE POLICY event_reg_settings_read ON public.event_reg_settings FOR SELECT TO authenticated
  USING (public.event_admin_of(event_id) OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));
DROP POLICY IF EXISTS event_reg_settings_admin ON public.event_reg_settings;
CREATE POLICY event_reg_settings_admin ON public.event_reg_settings FOR ALL TO authenticated
  USING (public.event_admin_of(event_id)) WITH CHECK (public.event_admin_of(event_id));

-- A person sees their own registrations; event admins see all of their event's. No direct writes.
DROP POLICY IF EXISTS event_registrations_read ON public.event_registrations;
CREATE POLICY event_registrations_read ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.event_admin_of(event_id));

-- ── Register ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.register_for_event(p_event uuid, p_name text, p_phone text, p_answers jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  ev public.events%ROWTYPE;
  st public.event_reg_settings%ROWTYPE;
  taken integer;
  f jsonb;
  reg_id uuid;
  existing public.event_registrations%ROWTYPE;
  had_existing boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO ev FROM public.events WHERE id = p_event AND status = 'published';
  IF NOT FOUND THEN RAISE EXCEPTION 'Acara tidak ditemukan.'; END IF;
  SELECT * INTO st FROM public.event_reg_settings WHERE event_id = p_event;
  IF NOT FOUND OR NOT st.open THEN RAISE EXCEPTION 'Pendaftaran acara ini belum dibuka.'; END IF;
  IF st.deadline IS NOT NULL AND st.deadline < (now() AT TIME ZONE 'Asia/Jakarta')::date THEN
    RAISE EXCEPTION 'Pendaftaran sudah ditutup.';
  END IF;
  IF char_length(btrim(coalesce(p_name, ''))) < 2 THEN RAISE EXCEPTION 'Isi nama lengkap.'; END IF;
  IF length(coalesce(p_answers, '{}'::jsonb)::text) > 4000 THEN RAISE EXCEPTION 'Jawaban terlalu panjang.'; END IF;

  FOR f IN SELECT * FROM jsonb_array_elements(st.fields) LOOP
    IF coalesce((f->>'required')::boolean, false) AND btrim(coalesce(p_answers->>(f->>'key'), '')) = '' THEN
      RAISE EXCEPTION 'Isi: %', coalesce(f->>'label', f->>'key');
    END IF;
  END LOOP;

  SELECT * INTO existing FROM public.event_registrations WHERE event_id = p_event AND user_id = uid;
  had_existing := FOUND;
  IF had_existing AND existing.status IN ('awaiting_payment', 'pending_review', 'approved') THEN
    RAISE EXCEPTION 'Kamu sudah terdaftar di acara ini.';
  END IF;

  IF ev.capacity IS NOT NULL THEN
    SELECT count(*) INTO taken FROM public.event_registrations
    WHERE event_id = p_event AND status IN ('awaiting_payment', 'pending_review', 'approved') AND user_id <> uid;
    IF taken >= ev.capacity THEN RAISE EXCEPTION 'Maaf, kuota acara ini sudah penuh.'; END IF;
  END IF;

  IF had_existing THEN
    UPDATE public.event_registrations SET
      full_name = btrim(p_name), phone = nullif(btrim(coalesce(p_phone, '')), ''), answers = coalesce(p_answers, '{}'::jsonb),
      status = CASE WHEN st.price = 0 THEN 'approved' ELSE 'awaiting_payment' END, amount = st.price,
      proof_path = NULL, reject_reason = NULL, decided_at = CASE WHEN st.price = 0 THEN now() END, decided_by = NULL,
      checked_in_at = NULL, checked_in_by = NULL, created_at = now()
    WHERE id = existing.id RETURNING id INTO reg_id;
  ELSE
    INSERT INTO public.event_registrations (event_id, user_id, full_name, phone, answers, status, amount, decided_at)
    VALUES (p_event, uid, btrim(p_name), nullif(btrim(coalesce(p_phone, '')), ''), coalesce(p_answers, '{}'::jsonb),
            CASE WHEN st.price = 0 THEN 'approved' ELSE 'awaiting_payment' END, st.price,
            CASE WHEN st.price = 0 THEN now() END)
    RETURNING id INTO reg_id;
  END IF;
  RETURN reg_id;
END;
$$;

-- ── Transfer proof (the file itself goes to the private event-proofs bucket) ─
CREATE OR REPLACE FUNCTION public.submit_payment_proof(p_reg uuid, p_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  IF p_path IS NULL OR p_path NOT LIKE uid::text || '/%' OR char_length(p_path) > 300 THEN RAISE EXCEPTION 'Berkas tidak valid.'; END IF;
  UPDATE public.event_registrations
  SET proof_path = p_path, status = 'pending_review', reject_reason = NULL
  WHERE id = p_reg AND user_id = uid AND status IN ('awaiting_payment', 'pending_review', 'rejected');
  IF NOT FOUND THEN RAISE EXCEPTION 'Pendaftaran tidak ditemukan.'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_registration(p_reg uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.event_registrations SET status = 'cancelled'
  WHERE id = p_reg AND user_id = auth.uid() AND checked_in_at IS NULL AND status <> 'cancelled';
  IF NOT FOUND THEN RAISE EXCEPTION 'Pendaftaran tidak ditemukan.'; END IF;
END;
$$;

-- ── Admin: approve or reject ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decide_registration(p_reg uuid, p_approve boolean, p_reason text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.event_registrations%ROWTYPE; new_status text;
BEGIN
  SELECT * INTO r FROM public.event_registrations WHERE id = p_reg;
  IF NOT FOUND OR NOT public.event_admin_of(r.event_id) THEN RAISE EXCEPTION 'Tidak diizinkan.' USING ERRCODE = '42501'; END IF;
  IF r.status = 'cancelled' THEN RAISE EXCEPTION 'Pendaftaran ini sudah dibatalkan.'; END IF;
  new_status := CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END;
  UPDATE public.event_registrations
  SET status = new_status, decided_at = now(), decided_by = auth.uid(),
      reject_reason = CASE WHEN p_approve THEN NULL ELSE left(nullif(btrim(coalesce(p_reason, '')), ''), 300) END,
      checked_in_at = CASE WHEN p_approve THEN checked_in_at ELSE NULL END
  WHERE id = p_reg;
  RETURN new_status;
END;
$$;

-- ── Attendance: scan the QR ticket ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.event_check_in(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.event_registrations%ROWTYPE; ev_title text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  SELECT * INTO r FROM public.event_registrations WHERE ticket_code = lower(btrim(coalesce(p_code, '')));
  IF NOT FOUND THEN RETURN jsonb_build_object('result', 'invalid'); END IF;
  IF NOT public.event_admin_of(r.event_id) THEN RETURN jsonb_build_object('result', 'forbidden'); END IF;
  SELECT title INTO ev_title FROM public.events WHERE id = r.event_id;
  IF r.status <> 'approved' THEN
    RETURN jsonb_build_object('result', 'not_approved', 'name', r.full_name, 'event', ev_title, 'event_id', r.event_id);
  END IF;
  IF r.checked_in_at IS NOT NULL THEN
    RETURN jsonb_build_object('result', 'already', 'name', r.full_name, 'event', ev_title, 'event_id', r.event_id, 'at', r.checked_in_at);
  END IF;
  UPDATE public.event_registrations SET checked_in_at = now(), checked_in_by = auth.uid() WHERE id = r.id;
  RETURN jsonb_build_object('result', 'ok', 'name', r.full_name, 'event', ev_title, 'event_id', r.event_id);
END;
$$;

-- Admin: mark present by hand (or undo)
CREATE OR REPLACE FUNCTION public.set_attendance(p_reg uuid, p_present boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.event_registrations%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.event_registrations WHERE id = p_reg;
  IF NOT FOUND OR NOT public.event_admin_of(r.event_id) THEN RAISE EXCEPTION 'Tidak diizinkan.' USING ERRCODE = '42501'; END IF;
  IF r.status <> 'approved' THEN RAISE EXCEPTION 'Hanya peserta yang sudah disetujui.'; END IF;
  UPDATE public.event_registrations
  SET checked_in_at = CASE WHEN p_present THEN coalesce(checked_in_at, now()) ELSE NULL END,
      checked_in_by = CASE WHEN p_present THEN auth.uid() ELSE NULL END
  WHERE id = p_reg;
END;
$$;

GRANT EXECUTE ON FUNCTION public.event_admin_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_event(uuid, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_payment_proof(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_registration(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.event_check_in(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_attendance(uuid, boolean) TO authenticated;

-- ── Private storage for the transfer proofs ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-proofs', 'event-proofs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS event_proofs_insert ON storage.objects;
CREATE POLICY event_proofs_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS event_proofs_read ON storage.objects;
CREATE POLICY event_proofs_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'event-proofs' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.event_registrations r WHERE r.proof_path = storage.objects.name AND public.event_admin_of(r.event_id))
  ));
DROP POLICY IF EXISTS event_proofs_delete ON storage.objects;
CREATE POLICY event_proofs_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
