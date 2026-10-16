-- Catholic Indonesia community pages: dioceses (Uskup + Peta), clergy (Romo badge), gallery.
-- Run once in the Supabase SQL editor.

-- Who may edit: global admins, or admins of the Catholic Indonesia community.
CREATE OR REPLACE FUNCTION public.is_ci_editor()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.get_my_role()::text IN ('founder', 'superadmin', 'admin')
      OR EXISTS (
        SELECT 1 FROM public.community_admins ca
        JOIN public.communities c ON c.id = ca.community_id
        WHERE ca.user_id = auth.uid() AND lower(c.name) = 'catholic indonesia'
      );
$$;

-- ── Dioceses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dioceses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('keuskupan_agung', 'keuskupan', 'ordinariat')),
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cathedral TEXT,
  bishop_name TEXT,
  bishop_note TEXT,
  bishop_photo_url TEXT,
  website TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dioceses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dioceses_read" ON public.dioceses;
CREATE POLICY "dioceses_read" ON public.dioceses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dioceses_write" ON public.dioceses;
CREATE POLICY "dioceses_write" ON public.dioceses FOR ALL TO authenticated
  USING (public.is_ci_editor()) WITH CHECK (public.is_ci_editor());

INSERT INTO public.dioceses (name, kind, province, city, lat, lng, cathedral, bishop_name, bishop_note, sort_order) VALUES
  ('Keuskupan Agung Medan', 'keuskupan_agung', 'Medan', 'Medan', 3.5952, 98.6722, 'Katedral Santa Maria Tak Bernoda', 'Mgr. Kornelius Sipayung, OFMCap', 'Uskup Agung', 10),
  ('Keuskupan Sibolga', 'keuskupan', 'Medan', 'Sibolga', 1.7427, 98.7792, NULL, 'Mgr. Fransiskus Tuaman Sasfo Sinaga', 'Uskup', 11),
  ('Keuskupan Padang', 'keuskupan', 'Medan', 'Padang', -0.9471, 100.4172, NULL, 'Mgr. Vitus Rubianto Solichin, SX', 'Uskup', 12),
  ('Keuskupan Agung Palembang', 'keuskupan_agung', 'Palembang', 'Palembang', -2.9761, 104.7754, 'Katedral Santa Maria', 'Mgr. Yohanes Harun Yuwono', 'Uskup Agung', 20),
  ('Keuskupan Pangkalpinang', 'keuskupan', 'Palembang', 'Pangkalpinang', -2.1291, 106.109, NULL, 'Mgr. Adrianus Sunarko, OFM', 'Uskup', 21),
  ('Keuskupan Tanjungkarang', 'keuskupan', 'Palembang', 'Bandar Lampung', -5.4292, 105.261, NULL, 'Mgr. Vinsensius Setiawan Triatmojo', 'Uskup', 22),
  ('Keuskupan Agung Jakarta', 'keuskupan_agung', 'Jakarta', 'Jakarta', -6.1693, 106.8331, 'Katedral Santa Maria Diangkat ke Surga', 'Ignatius Kardinal Suharyo', 'Uskup Agung', 30),
  ('Keuskupan Bandung', 'keuskupan', 'Jakarta', 'Bandung', -6.9147, 107.6098, 'Katedral Santo Petrus', 'Mgr. Antonius Subianto Bunjamin, OSC', 'Uskup', 31),
  ('Keuskupan Bogor', 'keuskupan', 'Jakarta', 'Bogor', -6.595, 106.797, 'Katedral Beatae Mariae Virginis', 'Mgr. Christophorus Tri Harsono', 'Administrator Apostolik (takhta lowong)', 32),
  ('Keuskupan Agung Semarang', 'keuskupan_agung', 'Semarang', 'Semarang', -6.9824, 110.4093, 'Katedral Santa Perawan Maria Ratu Rosario Suci', 'Mgr. Robertus Rubiyatmoko', 'Uskup Agung', 40),
  ('Keuskupan Purwokerto', 'keuskupan', 'Semarang', 'Purwokerto', -7.4245, 109.2396, NULL, 'Mgr. Christophorus Tri Harsono', 'Uskup', 41),
  ('Keuskupan Malang', 'keuskupan', 'Semarang', 'Malang', -7.9666, 112.6326, 'Katedral Santa Perawan Maria dari Gunung Karmel', 'Mgr. Henricus Pidyarto Gunawan, O.Carm', 'Uskup', 42),
  ('Keuskupan Surabaya', 'keuskupan', 'Semarang', 'Surabaya', -7.2575, 112.7521, 'Katedral Hati Kudus Yesus', 'Mgr. Agustinus Tri Budi Utomo', 'Uskup', 43),
  ('Keuskupan Agung Pontianak', 'keuskupan_agung', 'Pontianak', 'Pontianak', -0.0263, 109.3425, 'Katedral Santo Yosef', 'Mgr. Samuel Oton Sidin, OFMCap', 'Administrator Apostolik (takhta lowong)', 50),
  ('Keuskupan Ketapang', 'keuskupan', 'Pontianak', 'Ketapang', -1.85, 109.9833, NULL, 'Mgr. Pius Riana Prapdi', 'Uskup', 51),
  ('Keuskupan Sanggau', 'keuskupan', 'Pontianak', 'Sanggau', 0.124, 110.597, NULL, 'Mgr. Valentinus Saeng, CP', 'Uskup', 52),
  ('Keuskupan Sintang', 'keuskupan', 'Pontianak', 'Sintang', 0.07, 111.5, NULL, 'Mgr. Samuel Oton Sidin, OFMCap', 'Uskup', 53),
  ('Keuskupan Agung Samarinda', 'keuskupan_agung', 'Samarinda', 'Samarinda', -0.5022, 117.1536, NULL, 'Mgr. Yustinus Harjosusanto, MSF', 'Uskup Agung', 60),
  ('Keuskupan Banjarmasin', 'keuskupan', 'Samarinda', 'Banjarmasin', -3.3186, 114.5944, NULL, 'Mgr. Victorius Dwiardy, OFMCap', 'Uskup', 61),
  ('Keuskupan Palangkaraya', 'keuskupan', 'Samarinda', 'Palangka Raya', -2.2161, 113.9135, NULL, 'Mgr. Aloysius Maryadi Sutrisnaatmaka, MSF', 'Uskup', 62),
  ('Keuskupan Tanjung Selor', 'keuskupan', 'Samarinda', 'Tanjung Selor', 2.8375, 117.3653, NULL, 'Mgr. Paulinus Yan Olla, MSF', 'Uskup', 63),
  ('Keuskupan Agung Makassar', 'keuskupan_agung', 'Makassar', 'Makassar', -5.1477, 119.4327, 'Katedral Hati Yesus Yang Mahakudus', 'Mgr. Fransiskus Nipa', 'Uskup Agung', 70),
  ('Keuskupan Amboina', 'keuskupan', 'Makassar', 'Ambon', -3.6954, 128.1814, 'Katedral Santo Fransiskus Xaverius', 'Mgr. Seno Ngutra', 'Uskup', 71),
  ('Keuskupan Manado', 'keuskupan', 'Makassar', 'Manado', 1.4748, 124.8421, NULL, 'Mgr. Benedictus Estephanus Rolly Untu, MSC', 'Uskup', 72),
  ('Keuskupan Agung Ende', 'keuskupan_agung', 'Ende', 'Ende', -8.8432, 121.6623, NULL, 'Mgr. Paulus Budi Kleden, SVD', 'Uskup Agung', 80),
  ('Keuskupan Denpasar', 'keuskupan', 'Ende', 'Denpasar', -8.6705, 115.2126, 'Katedral Roh Kudus', 'Mgr. Silvester San', 'Uskup', 81),
  ('Keuskupan Larantuka', 'keuskupan', 'Ende', 'Larantuka', -8.35, 122.9833, 'Katedral Reinha Rosari', 'Mgr. Yohanes Hans Monteiro', 'Uskup', 82),
  ('Keuskupan Maumere', 'keuskupan', 'Ende', 'Maumere', -8.6199, 122.2111, NULL, 'Mgr. Ewaldus Martinus Sedu', 'Uskup', 83),
  ('Keuskupan Ruteng', 'keuskupan', 'Ende', 'Ruteng', -8.6118, 120.4655, NULL, 'Mgr. Siprianus Hormat', 'Uskup', 84),
  ('Keuskupan Labuan Bajo', 'keuskupan', 'Ende', 'Labuan Bajo', -8.4964, 119.8877, NULL, 'Mgr. Maksimus Regus', 'Uskup', 85),
  ('Keuskupan Agung Kupang', 'keuskupan_agung', 'Kupang', 'Kupang', -10.1772, 123.607, NULL, 'Mgr. Hironimus Pakaenoni', 'Uskup Agung', 90),
  ('Keuskupan Atambua', 'keuskupan', 'Kupang', 'Atambua', -9.1061, 124.8923, NULL, 'Mgr. Dominikus Saku', 'Uskup', 91),
  ('Keuskupan Weetebula', 'keuskupan', 'Kupang', 'Weetebula', -9.43, 119.25, NULL, 'Mgr. Edmund Woga, CSsR', 'Uskup', 92),
  ('Keuskupan Agung Merauke', 'keuskupan_agung', 'Merauke', 'Merauke', -8.4932, 140.4018, NULL, 'Mgr. Petrus Canisius Mandagi, MSC', 'Uskup Agung', 100),
  ('Keuskupan Agats', 'keuskupan', 'Merauke', 'Agats', -5.5432, 138.1346, NULL, 'Mgr. Aloysius Murwito, OFM', 'Uskup', 101),
  ('Keuskupan Jayapura', 'keuskupan', 'Merauke', 'Jayapura', -2.5337, 140.7181, NULL, 'Mgr. Yanuarius Teofilus Matopai You', 'Uskup', 102),
  ('Keuskupan Manokwari-Sorong', 'keuskupan', 'Merauke', 'Manokwari', -0.8615, 134.064, NULL, 'Mgr. Hilarion Datus Lega', 'Uskup', 103),
  ('Keuskupan Timika', 'keuskupan', 'Merauke', 'Timika', -4.55, 136.8833, NULL, 'Mgr. Bernardus Bofitwos Baru, OSA', 'Uskup', 104),
  ('Ordinariat Militer Indonesia', 'ordinariat', '—', 'Jakarta', NULL, NULL, 'Katedral Santa Maria Diangkat ke Surga (Jakarta)', 'Ignatius Kardinal Suharyo', 'Ordinaris Militer', 200)
ON CONFLICT (name) DO NOTHING;

-- ── Clergy (Romo badge) ──────────────────────────────────────────────────────
-- Separate from profiles so members can't give themselves a title.
CREATE TABLE IF NOT EXISTS public.clergy (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'romo' CHECK (title IN ('romo', 'uskup', 'diakon', 'frater', 'suster', 'bruder')),
  congregation TEXT,       -- e.g. SJ, OFM, Projo
  parish TEXT,
  diocese_id UUID REFERENCES public.dioceses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clergy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clergy_read" ON public.clergy;
CREATE POLICY "clergy_read" ON public.clergy FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "clergy_write" ON public.clergy;
CREATE POLICY "clergy_write" ON public.clergy FOR ALL TO authenticated
  USING (public.is_ci_editor()) WITH CHECK (public.is_ci_editor());

-- ── Community gallery ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS community_gallery_community_idx ON public.community_gallery (community_id, created_at DESC);

ALTER TABLE public.community_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gallery_read" ON public.community_gallery;
CREATE POLICY "gallery_read" ON public.community_gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "gallery_write" ON public.community_gallery;
CREATE POLICY "gallery_write" ON public.community_gallery FOR ALL TO authenticated
  USING (
    public.get_my_role()::text IN ('founder', 'superadmin', 'admin')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = community_gallery.community_id AND ca.user_id = auth.uid())
  )
  WITH CHECK (
    public.get_my_role()::text IN ('founder', 'superadmin', 'admin')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = community_gallery.community_id AND ca.user_id = auth.uid())
  );
