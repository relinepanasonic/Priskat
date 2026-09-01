-- 067_org_structure_photo.sql
-- Let manually-added org structure members (no linked profile) carry their
-- own photo instead of only showing the generic user icon.
-- Idempotent — safe to run more than once.

ALTER TABLE public.community_org_structure
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Storage bucket for org structure member photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-structure', 'org-structure', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Org Structure"
ON storage.objects FOR SELECT
USING ( bucket_id = 'org-structure' );

CREATE POLICY "Authenticated users can upload to org-structure"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-structure'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update in org-structure"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-structure'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from org-structure"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-structure'
  AND auth.role() = 'authenticated'
);
