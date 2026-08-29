-- Allow anon users to see communities so they can select them on signup
CREATE POLICY "communities_select_anon" ON public.communities 
FOR SELECT TO anon 
USING (is_public = true);

