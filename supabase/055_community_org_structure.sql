CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.community_org_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
    role_title TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.community_org_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community_org_structure"
    ON public.community_org_structure FOR SELECT
    USING (true);

CREATE POLICY "Community admins can insert community_org_structure"
    ON public.community_org_structure FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_admins ca 
            WHERE ca.community_id = community_org_structure.community_id 
            AND ca.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND (p.role = 'superadmin' OR p.role = 'founder')
        )
    );

CREATE POLICY "Community admins can update community_org_structure"
    ON public.community_org_structure FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_admins ca 
            WHERE ca.community_id = community_org_structure.community_id 
            AND ca.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND (p.role = 'superadmin' OR p.role = 'founder')
        )
    );

CREATE POLICY "Community admins can delete community_org_structure"
    ON public.community_org_structure FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_admins ca 
            WHERE ca.community_id = community_org_structure.community_id 
            AND ca.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND (p.role = 'superadmin' OR p.role = 'founder')
        )
    );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_community_org_structure ON public.community_org_structure;
CREATE TRIGGER handle_updated_at_community_org_structure
    BEFORE UPDATE ON public.community_org_structure
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
