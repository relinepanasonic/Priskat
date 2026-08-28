CREATE TABLE public.camp_crew (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  branch text,
  camp text,
  angkatan text,
  name text,
  position text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.camp_crew ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on camp_crew" 
  ON public.camp_crew FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert to camp_crew"
  ON public.camp_crew FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to camp_crew"
  ON public.camp_crew FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete from camp_crew"
  ON public.camp_crew FOR DELETE
  TO authenticated
  USING (true);

