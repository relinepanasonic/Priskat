-- Event workspace tabs: Peserta (with groups and a Fasilitator per group), QR and lanyard design (template + gradient),
-- Promosi (status). Run once in the Supabase SQL editor after 123. Safe to run again.

-- Promotion status of an event: draft = not promoted yet, active = being promoted, closed = promotion ended
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promo_status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_promo_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_promo_status_check CHECK (promo_status IN ('draft', 'active', 'closed'));

-- Groups of participants. The Fasilitator is a member of the event's crew (camp_crew) who is the PIC of the group.
CREATE TABLE IF NOT EXISTS public.event_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  facilitator_crew_id uuid REFERENCES public.camp_crew(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_groups_event_idx ON public.event_groups (event_id, created_at);
ALTER TABLE public.event_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS event_groups_admin ON public.event_groups;
CREATE POLICY event_groups_admin ON public.event_groups FOR ALL TO authenticated
  USING (public.event_admin_of(event_id)) WITH CHECK (public.event_admin_of(event_id));

ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.event_groups(id) ON DELETE SET NULL;

-- Put a participant in a group (or take them out with NULL). Registrations are never written directly.
CREATE OR REPLACE FUNCTION public.set_registration_group(p_reg uuid, p_group uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev uuid;
BEGIN
  SELECT event_id INTO ev FROM public.event_registrations WHERE id = p_reg;
  IF ev IS NULL THEN RAISE EXCEPTION 'Peserta tidak ditemukan.'; END IF;
  IF NOT public.event_admin_of(ev) THEN RAISE EXCEPTION 'Hanya admin acara yang bisa mengatur grup.' USING ERRCODE = '42501'; END IF;
  IF p_group IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.event_groups WHERE id = p_group AND event_id = ev) THEN
    RAISE EXCEPTION 'Grup tidak ditemukan.';
  END IF;
  UPDATE public.event_registrations SET group_id = p_group WHERE id = p_reg;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_registration_group(uuid, uuid) TO authenticated;

-- Printable ticket (lanyard) design: template and gradient (used when there is no background picture)
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS ticket_template text NOT NULL DEFAULT 'klasik';
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS ticket_gradient text NOT NULL DEFAULT 'navy';
