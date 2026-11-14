-- Catholic Family Ministry alumni: everyone who joined a camp (Waberkat, Young Women, Young Men, Priskat, Patriot).
-- These people do not need a Ruang Iman account. When they sign up later, claimed_user_id links the two.
-- Private: only the community's admins (and site admins) can read or change it. Phone numbers stay inside.
-- Run once in the Supabase SQL editor (needs 105_connect_groups.sql first). Safe to run again.
-- The data itself is in supabase/106_cfm_alumni_data.local.sql (gitignored: personal data).

CREATE TABLE IF NOT EXISTS public.cfm_alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  source text,                                    -- which import the row came from
  program text NOT NULL CHECK (program IN ('WB', 'YW', 'YM', 'PS', 'PT')),  -- Waberkat, Young Women, Young Men, Priskat, Patriot
  angkatan text,
  reg_no text,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 160),
  nickname text,
  city text,
  province text,
  phone text,
  phone2 text,
  religion text,
  paroki_group text,
  paroki text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  claimed_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cfm_alumni_community_idx ON public.cfm_alumni (community_id, program, angkatan);

ALTER TABLE public.cfm_alumni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cfm_alumni_admin_all ON public.cfm_alumni;
CREATE POLICY cfm_alumni_admin_all ON public.cfm_alumni
  FOR ALL TO authenticated
  USING (public.community_admin_of(community_id))
  WITH CHECK (public.community_admin_of(community_id));
