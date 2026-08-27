CREATE POLICY "Categories are deletable by admins." ON public.devotion_categories FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Plans are deletable by admins." ON public.devotion_plans FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Days are deletable by admins." ON public.devotion_plan_days FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Verses are deletable by admins." ON public.devotion_day_verses FOR DELETE USING (auth.role() = 'authenticated');
