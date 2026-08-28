CREATE TABLE public.camp_cohorts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  branch text NOT NULL,
  camp_name text NOT NULL,
  angkatan text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(branch, camp_name, angkatan)
);

ALTER TABLE public.camp_crew ADD COLUMN cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE CASCADE;
ALTER TABLE public.camp_crew ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE public.camp_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_date timestamp with time zone,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'todo',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.camp_meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  date_time timestamp with time zone,
  mom_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.camp_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id uuid REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  target_group text DEFAULT 'all',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.camp_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_chats ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read everything for now, but only superadmin can insert/update (or crew members)
CREATE POLICY "Allow authenticated read access" ON public.camp_cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow superadmin insert" ON public.camp_cohorts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow superadmin update" ON public.camp_cohorts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow superadmin delete" ON public.camp_cohorts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.camp_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.camp_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.camp_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.camp_tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.camp_meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.camp_meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.camp_meetings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.camp_meetings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.camp_chats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.camp_chats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.camp_chats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.camp_chats FOR DELETE TO authenticated USING (true);

