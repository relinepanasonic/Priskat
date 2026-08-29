-- 1. Add Motto and Tagline to communities
ALTER TABLE public.communities
ADD COLUMN IF NOT EXISTS motto TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- 2. Create 'communities' storage bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('communities', 'communities', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for 'communities' bucket
-- Allow public read access
CREATE POLICY "Public Access Communities" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'communities' );

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload to communities" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'communities' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update logos
CREATE POLICY "Authenticated users can update in communities" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'communities' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete from communities" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'communities' 
  AND auth.role() = 'authenticated'
);

