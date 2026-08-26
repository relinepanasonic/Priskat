-- 1. Devotion Categories
CREATE TABLE public.devotion_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.devotion_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.devotion_categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by admins." ON public.devotion_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Categories are updatable by admins." ON public.devotion_categories FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. Devotion Plans
CREATE TABLE public.devotion_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.devotion_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  duration_days INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.devotion_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone." ON public.devotion_plans FOR SELECT USING (true);
CREATE POLICY "Plans are insertable by admins." ON public.devotion_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Plans are updatable by admins." ON public.devotion_plans FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Devotion Plan Days
CREATE TABLE public.devotion_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES public.devotion_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  devotional_title TEXT,
  devotional_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(plan_id, day_number)
);

ALTER TABLE public.devotion_plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Days are viewable by everyone." ON public.devotion_plan_days FOR SELECT USING (true);
CREATE POLICY "Days are insertable by admins." ON public.devotion_plan_days FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Days are updatable by admins." ON public.devotion_plan_days FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Devotion Day Verses
CREATE TABLE public.devotion_day_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID REFERENCES public.devotion_plan_days(id) ON DELETE CASCADE,
  verse_reference TEXT NOT NULL,
  translation TEXT DEFAULT 'TB' NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.devotion_day_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verses are viewable by everyone." ON public.devotion_day_verses FOR SELECT USING (true);
CREATE POLICY "Verses are insertable by admins." ON public.devotion_day_verses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Verses are updatable by admins." ON public.devotion_day_verses FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. User Devotion Progress
CREATE TABLE public.user_devotion_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.devotion_plans(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1 NOT NULL,
  completed_days INTEGER[] DEFAULT '{}'::INTEGER[] NOT NULL,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  is_finished BOOLEAN DEFAULT false NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_devotion_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_devotion_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_devotion_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_devotion_progress FOR UPDATE USING (auth.uid() = user_id);

