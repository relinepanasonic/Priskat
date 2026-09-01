-- 1. Update Existing Basic Prayers to use the new 'basic_prayer' category
UPDATE public.prayers
SET category = 'basic_prayer'
WHERE title_id ILIKE '%Bapa Kami%' 
   OR title_id ILIKE '%Salam Maria%'
   OR title_id ILIKE '%Kemuliaan%'
   OR title_id ILIKE '%Syahadat%'
   OR title_id ILIKE '%Doa Tobat%';

-- 2. Update Existing Doa Harian (just in case they were miscategorized)
UPDATE public.prayers
SET category = 'doa_harian'
WHERE title_id ILIKE '%Angelus%'
   OR title_id ILIKE '%Doa Pagi%'
   OR title_id ILIKE '%Doa Malam%'
   OR title_id ILIKE '%Makan%';

-- 3. Insert Doa Ekaristi (Doa Syukur Agung 1 - 10)
-- Note: Providing the titles so they appear in the app. The actual long liturgical texts can be edited in the dashboard.
INSERT INTO public.prayers (slug, title_id, title_en, body_id, body_en, category, sort_order, is_published)
VALUES 
('doa-syukur-agung-1', 'Doa Syukur Agung I', 'Eucharistic Prayer I', '[Teks Doa Syukur Agung I - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer I]', 'doa_ekaristi', 1, true),
('doa-syukur-agung-2', 'Doa Syukur Agung II', 'Eucharistic Prayer II', '[Teks Doa Syukur Agung II - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer II]', 'doa_ekaristi', 2, true),
('doa-syukur-agung-3', 'Doa Syukur Agung III', 'Eucharistic Prayer III', '[Teks Doa Syukur Agung III - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer III]', 'doa_ekaristi', 3, true),
('doa-syukur-agung-4', 'Doa Syukur Agung IV', 'Eucharistic Prayer IV', '[Teks Doa Syukur Agung IV - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer IV]', 'doa_ekaristi', 4, true),
('doa-syukur-agung-5', 'Doa Syukur Agung V', 'Eucharistic Prayer V', '[Teks Doa Syukur Agung V - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer V]', 'doa_ekaristi', 5, true),
('doa-syukur-agung-6', 'Doa Syukur Agung VI', 'Eucharistic Prayer VI', '[Teks Doa Syukur Agung VI - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer VI]', 'doa_ekaristi', 6, true),
('doa-syukur-agung-7', 'Doa Syukur Agung VII', 'Eucharistic Prayer VII', '[Teks Doa Syukur Agung VII - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer VII]', 'doa_ekaristi', 7, true),
('doa-syukur-agung-8', 'Doa Syukur Agung VIII', 'Eucharistic Prayer VIII', '[Teks Doa Syukur Agung VIII - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer VIII]', 'doa_ekaristi', 8, true),
('doa-syukur-agung-9', 'Doa Syukur Agung IX', 'Eucharistic Prayer IX', '[Teks Doa Syukur Agung IX - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer IX]', 'doa_ekaristi', 9, true),
('doa-syukur-agung-10', 'Doa Syukur Agung X', 'Eucharistic Prayer X', '[Teks Doa Syukur Agung X - Silakan diisi dari buku Tata Perayaan Ekaristi / Puji Syukur]', '[Text for Eucharistic Prayer X]', 'doa_ekaristi', 10, true)
ON CONFLICT (slug) DO NOTHING;
