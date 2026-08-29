-- Add bio fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nama_baptis TEXT,
ADD COLUMN IF NOT EXISTS nama_panggilan TEXT,
ADD COLUMN IF NOT EXISTS relationship_status TEXT, -- 'Single', 'Couple', 'Married'
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS favorite_verse TEXT;
