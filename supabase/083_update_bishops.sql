-- Corrects bishops that changed since the first seed (supabase/080). Safe to run more than once,
-- and safe whether or not 080 was already run. Verified against Wikipedia + news, October 2026.

-- Bogor: Mgr. Paskalis Bruno Syukur resigned (19 Jan 2026); administered by the Bishop of Purwokerto.
UPDATE public.dioceses
SET bishop_name = 'Mgr. Christophorus Tri Harsono', bishop_note = 'Administrator Apostolik (takhta lowong)', bishop_photo_url = NULL, updated_at = NOW()
WHERE name = 'Keuskupan Bogor';

-- Pontianak: Mgr. Agustinus Agus retired (30 Aug 2025); administered by the Bishop of Sintang.
UPDATE public.dioceses
SET bishop_name = 'Mgr. Samuel Oton Sidin, OFMCap', bishop_note = 'Administrator Apostolik (takhta lowong)', bishop_photo_url = NULL, updated_at = NOW()
WHERE name = 'Keuskupan Agung Pontianak';

-- Larantuka: Mgr. Fransiskus Kopong Kung retired (22 Nov 2025); Mgr. Yohanes Hans Monteiro succeeded him.
UPDATE public.dioceses
SET bishop_name = 'Mgr. Yohanes Hans Monteiro', bishop_note = 'Uskup', bishop_photo_url = NULL, updated_at = NOW()
WHERE name = 'Keuskupan Larantuka';

-- Agats: bishop filled in.
UPDATE public.dioceses
SET bishop_name = 'Mgr. Aloysius Murwito, OFM', bishop_note = 'Uskup', updated_at = NOW()
WHERE name = 'Keuskupan Agats' AND bishop_name IS NULL;

-- Military Ordinariate: led by the Archbishop of Jakarta.
UPDATE public.dioceses
SET bishop_name = 'Ignatius Kardinal Suharyo', bishop_note = 'Ordinaris Militer', cathedral = coalesce(cathedral, 'Katedral Santa Maria Diangkat ke Surga (Jakarta)'), updated_at = NOW()
WHERE name = 'Ordinariat Militer Indonesia' AND bishop_name IS NULL;
