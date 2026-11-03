-- Daily Mazmur Tanggapan as sung in the Mass (with its Ulangan / refrain), entered by an admin.
-- The Bible text in our database is the Terjemahan Baru; the Mass psalm uses the lectionary wording
-- and a refrain, so the Ekaristi page shows this text when it exists for the day.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.liturgy_texts (
  day date PRIMARY KEY,
  mazmur_ulangan text,
  mazmur_text text,
  source text,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liturgy_texts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS liturgy_texts_read ON public.liturgy_texts;
DROP POLICY IF EXISTS liturgy_texts_write ON public.liturgy_texts;
CREATE POLICY liturgy_texts_read ON public.liturgy_texts FOR SELECT TO authenticated USING (true);
CREATE POLICY liturgy_texts_write ON public.liturgy_texts FOR ALL TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
