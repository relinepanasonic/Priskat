ALTER TABLE public.camp_cohorts ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.camp_cohorts ADD COLUMN IF NOT EXISTS custom_name text;
