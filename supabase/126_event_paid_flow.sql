-- Paid flow for events:
--   1. A person registers by the link: entry in Peserta as "Belum bayar", no QR code yet.
--   2. Only the Ketua, Wakil Ketua, Sekretaris and Bendahara of the event (and site admins) can mark it Paid or Not Paid.
--   3. Paid puts the money in Keuangan as revenue (Pemasukan), once, and shows the QR code.
--   4. The WhatsApp message with the QR link has an editable template per event (never empty).
-- Run once in the Supabase SQL editor after 125. Safe to run again.

-- Roles that run the money and the participants of an event
CREATE OR REPLACE FUNCTION public.event_finance_crew(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.camp_crew cr ON cr.cohort_id = e.cohort_id
    WHERE e.id = p_event AND cr.user_id = auth.uid()
      AND lower(btrim(coalesce(cr.position, ''))) IN ('ketua', 'wakil ketua', 'sekretaris', 'sekertaris', 'bendahara')
  );
$$;
GRANT EXECUTE ON FUNCTION public.event_finance_crew(uuid) TO authenticated;

-- Who may change Paid / Not Paid: those four roles, and site admins (Founder, superadmin, admin)
CREATE OR REPLACE FUNCTION public.can_mark_paid(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_site_admin() OR public.event_finance_crew(p_event);
$$;
GRANT EXECUTE ON FUNCTION public.can_mark_paid(uuid) TO authenticated;

-- The same four roles can also manage that event (see participants, groups, scan, settings)
CREATE OR REPLACE FUNCTION public.event_admin_of(p_event uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = p_event AND (e.author_id = auth.uid() OR public.community_admin_of(e.community_id))
  ) OR public.is_site_admin() OR public.event_finance_crew(p_event);
$$;

-- A revenue row in Keuangan remembers which registration it came from, so it is made once and removed with "Belum bayar"
ALTER TABLE public.camp_finance ADD COLUMN IF NOT EXISTS registration_id uuid REFERENCES public.event_registrations(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS camp_finance_registration_idx ON public.camp_finance (registration_id) WHERE registration_id IS NOT NULL;

-- The WhatsApp message with the QR link. NULL = our default text. A text that is set can never be empty.
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS wa_template text;
ALTER TABLE public.event_reg_settings DROP CONSTRAINT IF EXISTS event_reg_settings_wa_template_check;
ALTER TABLE public.event_reg_settings ADD CONSTRAINT event_reg_settings_wa_template_check
  CHECK (wa_template IS NULL OR (char_length(btrim(wa_template)) BETWEEN 10 AND 1000));

-- Mark a registration Paid (approved, QR shows, revenue in Keuangan) or Not Paid (back to Belum bayar, revenue removed)
CREATE OR REPLACE FUNCTION public.set_registration_paid(p_reg uuid, p_paid boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.event_registrations%ROWTYPE; ev public.events%ROWTYPE; cid uuid;
BEGIN
  SELECT * INTO r FROM public.event_registrations WHERE id = p_reg;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peserta tidak ditemukan.'; END IF;
  SELECT * INTO ev FROM public.events WHERE id = r.event_id;
  IF NOT public.can_mark_paid(r.event_id) THEN
    RAISE EXCEPTION 'Hanya Ketua, Wakil Ketua, Sekretaris, dan Bendahara yang bisa mengubah status bayar.' USING ERRCODE = '42501';
  END IF;

  IF p_paid THEN
    UPDATE public.event_registrations
    SET status = 'approved', decided_at = now(), decided_by = auth.uid(), reject_reason = NULL
    WHERE id = p_reg;
    IF r.amount > 0 THEN
      cid := ev.cohort_id;
      IF cid IS NULL OR NOT EXISTS (SELECT 1 FROM public.camp_cohorts WHERE id = cid) THEN
        -- an event without a workspace yet: make it (same as event_workspace), so there is a Keuangan to write to
        INSERT INTO public.camp_cohorts (branch, camp_name, angkatan, start_date, custom_name, community_id, banner_url)
        VALUES ('Umum', 'Event', left(ev.id::text, 8), (ev.event_date)::date, ev.title, ev.community_id, ev.banner_image_url)
        RETURNING id INTO cid;
        UPDATE public.events SET cohort_id = cid WHERE id = ev.id;
      END IF;
      INSERT INTO public.camp_finance (cohort_id, kind, label, amount, entry_date, note, registration_id)
      VALUES (cid, 'masuk', left('Pendaftaran: ' || r.full_name, 160), r.amount, (now() AT TIME ZONE 'Asia/Jakarta')::date, 'Peserta lunas', p_reg)
      ON CONFLICT (registration_id) WHERE registration_id IS NOT NULL DO NOTHING;
    END IF;
  ELSE
    UPDATE public.event_registrations
    SET status = 'awaiting_payment', decided_at = NULL, decided_by = NULL, checked_in_at = NULL, checked_in_by = NULL
    WHERE id = p_reg;
    DELETE FROM public.camp_finance WHERE registration_id = p_reg;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_registration_paid(uuid, boolean) TO authenticated;
