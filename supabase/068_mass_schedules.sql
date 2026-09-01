-- 068_mass_schedules.sql
-- Catholic Mass schedules ("Jadwal Misa"), one row per church/parish.
-- Data is imported once from public jadwalmisa.id data endpoints (see
-- scripts/scrape_jadwalmisa.js) and seeded via 069_seed_mass_churches.sql.
-- Browsed in-app under News -> Church Schedule.
-- Idempotent — safe to run more than once.

CREATE TABLE IF NOT EXISTS public.mass_churches (
  id            BIGINT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  address       TEXT,
  maps_url      TEXT,
  image_url     TEXT,
  time_zone     TEXT,
  province_slug TEXT NOT NULL,
  province_name TEXT NOT NULL,
  regency_slug  TEXT NOT NULL,
  regency_name  TEXT NOT NULL,
  -- [{ title, times: string[], is_special }]
  schedules         JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- [{ title, date, times: string[] }] — liturgical / one-off Masses
  special_schedules JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url    TEXT,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mass_churches_region
  ON public.mass_churches (province_slug, regency_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mass_churches_slug
  ON public.mass_churches (province_slug, regency_slug, slug);
CREATE INDEX IF NOT EXISTS idx_mass_churches_name_lower
  ON public.mass_churches (lower(name));

ALTER TABLE public.mass_churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view mass_churches" ON public.mass_churches;
CREATE POLICY "Anyone can view mass_churches"
  ON public.mass_churches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Superadmins manage mass_churches" ON public.mass_churches;
CREATE POLICY "Superadmins manage mass_churches"
  ON public.mass_churches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'superadmin' OR p.role = 'founder')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'superadmin' OR p.role = 'founder')
    )
  );
