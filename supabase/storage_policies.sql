-- Allow anyone to view images in devotion-covers
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'devotion-covers' );

-- Allow authenticated users to upload images to devotion-covers
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'devotion-covers' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'devotion-covers' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'devotion-covers' 
  AND auth.role() = 'authenticated'
);

