-- 1) The Bendahara's WhatsApp number, where people send their transfer proof (shown after they register for a paid event)
-- 2) Delete a registration (a person who is not coming): event admins for unpaid ones, the people who may mark paid for paid ones.
--    A paid registration's income in Keuangan is removed with it.
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS treasurer_wa text;

CREATE OR REPLACE FUNCTION public.delete_event_registration(p_reg uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.event_registrations%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.event_registrations WHERE id = p_reg;
  IF NOT FOUND THEN RETURN; END IF;
  IF r.status = 'approved' AND COALESCE(r.amount, 0) > 0 THEN
    IF NOT public.can_mark_paid(r.event_id) THEN RAISE EXCEPTION 'Hanya Ketua, Wakil Ketua, Sekretaris, atau Bendahara yang boleh menghapus peserta yang sudah lunas.'; END IF;
  ELSIF NOT (public.event_admin_of(r.event_id) OR public.can_mark_paid(r.event_id)) THEN
    RAISE EXCEPTION 'Tidak diizinkan.';
  END IF;
  DELETE FROM public.camp_finance WHERE registration_id = p_reg;
  DELETE FROM public.event_registrations WHERE id = p_reg;
END $$;
GRANT EXECUTE ON FUNCTION public.delete_event_registration(uuid) TO authenticated;

SELECT column_name FROM information_schema.columns WHERE table_name = 'event_reg_settings' AND column_name = 'treasurer_wa';
