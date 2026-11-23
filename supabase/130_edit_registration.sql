-- Event admins can correct a participant's name, paroki, WhatsApp and the answers of the event's own columns.
-- Registrations are never written directly, so this goes through a function that checks who may do it.
-- Run once in the Supabase SQL editor. Safe to run again.
CREATE OR REPLACE FUNCTION public.update_registration_details(p_reg uuid, p_name text, p_paroki text, p_phone text, p_answers jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev uuid;
BEGIN
  SELECT event_id INTO ev FROM public.event_registrations WHERE id = p_reg;
  IF ev IS NULL THEN RAISE EXCEPTION 'Peserta tidak ditemukan.'; END IF;
  IF NOT public.event_admin_of(ev) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa mengubah data peserta.' USING ERRCODE = '42501'; END IF;
  IF char_length(btrim(coalesce(p_name, ''))) < 2 THEN RAISE EXCEPTION 'Isi nama (minimal 2 huruf).'; END IF;
  IF length(coalesce(p_answers, '{}'::jsonb)::text) > 4000 THEN RAISE EXCEPTION 'Isian terlalu panjang.'; END IF;
  UPDATE public.event_registrations
  SET full_name = left(btrim(p_name), 120),
      paroki = nullif(left(btrim(coalesce(p_paroki, '')), 120), ''),
      phone = nullif(left(btrim(coalesce(p_phone, '')), 30), ''),
      answers = coalesce(answers, '{}'::jsonb) || coalesce(p_answers, '{}'::jsonb)
  WHERE id = p_reg;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_registration_details(uuid, text, text, text, jsonb) TO authenticated;
