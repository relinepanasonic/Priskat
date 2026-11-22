-- New community: Sukses Sejati Katolik (the About page is made from https://suksessejatikatolik.org/).
-- Owners of the community (community admins with the "owner" role): Nico Japar (founder) and Tony Chen.
-- Run once in the Supabase SQL editor (after 086 and 088). Safe to run again: it updates the same community.
-- The vision and mission are written from the site's "Mengapa harus ikut" points: edit them in Community Center if you like.

DO $$
DECLARE
  cid uuid;
  nico uuid;
  tony uuid;
BEGIN
  SELECT id INTO cid FROM public.communities WHERE slug = 'sukses-sejati-katolik' OR btrim(name) ILIKE 'sukses sejati katolik' LIMIT 1;

  IF cid IS NULL THEN
    INSERT INTO public.communities (name, slug, is_public) VALUES ('Sukses Sejati Katolik', 'sukses-sejati-katolik', false) RETURNING id INTO cid;
  END IF;

  UPDATE public.communities SET
    name = 'Sukses Sejati Katolik',
    slug = 'sukses-sejati-katolik',
    is_public = false,   -- private: everyone can read the About page, but joining needs approval
    logo_url = '/images/communities/sukses-sejati-katolik.png',
    tagline = 'Build to Bless, Lead to Bless',
    motto = 'Kesuksesan sejati dimulai dari cara berpikir yang benar.',
    description = $d$Camp Sukses Sejati Katolik mengajak pebisnis dan profesional Katolik membangun prinsip Kerajaan Allah dalam usaha, memperbarui pola pikir, dan meningkatkan kepedulian. Peserta diajak memahami bahwa bisnis dan pekerjaan adalah milik Tuhan yang harus dikelola dengan benar, untuk meraih terobosan pribadi serta kemajuan dalam usaha atau karier sebagai bagian dari pelayanan kepada-Nya.

Kegerakan Camp Sukses Sejati dirintis sejak 14 Januari 2005 oleh saudara-saudari dari komunitas Kristen interdenominasi, yaitu KBC (Kingdom Business Community). Pada 2015 kegerakan ini diperkenalkan kepada Badan Pelayanan Keuskupan Keuskupan Agung Jakarta (BPK KAJ). Camp Sukses Sejati Katolik mulai diselenggarakan pada 2016 di bawah Pukat Keuskupan Surabaya, dan pada 2017 di bawah Perhimpunan Perduki Keuskupan Jakarta. Pada 7 Desember 2022 kegerakan ini menerima Nihil Obstat, dan Imprimatur pada 16 Desember 2022. Kini CBC (Catholic Business Community) menyelenggarakannya bersama berbagai komunitas.$d$,
    vision = 'Pebisnis dan profesional Katolik yang membangun usaha dan kepemimpinan selaras dengan nilai-nilai Kerajaan Allah, menjadi berkat bagi sesama, dan meninggalkan warisan yang bernilai bagi generasi berikutnya.',
    mission = E'1. Menemukan arti kesuksesan yang sesungguhnya, bukan sekadar kekayaan atau posisi.\n2. Belajar dari pengusaha dan pemimpin yang telah mengalami perubahan nyata.\n3. Memperbarui pola pikir untuk hidup dan bisnis yang lebih bermakna.\n4. Membangun bisnis dengan prinsip Build to Bless dan memimpin dengan prinsip Lead to Bless.\n5. Hidup sebagai hamba pemilik: mengelola bisnis dan kekayaan sebagai amanah Tuhan.\n6. Membangun relasi dalam komunitas yang saling menguatkan dan mempersiapkan warisan bagi generasi mendatang.',
    join_mode = 'request',
    join_fields = '[
      {"key":"angkatan","label":"Angkatan Camp Sukses Sejati","type":"select","required":false,"options":["Belum pernah ikut","Angkatan 1","Angkatan 2","Angkatan 3","Angkatan 4","Angkatan 5"]},
      {"key":"kota","label":"Kota","type":"text","required":false,"placeholder":"mis. Surabaya"},
      {"key":"usaha","label":"Bidang usaha atau pekerjaan","type":"text","required":false}
    ]'::jsonb
  WHERE id = cid;

  -- Nico Japar (founder) and Tony Chen own the community
  SELECT id INTO nico FROM public.profiles WHERE role = 'founder' AND full_name ILIKE 'nico%japar%' ORDER BY created_at LIMIT 1;
  IF nico IS NULL THEN SELECT id INTO nico FROM public.profiles WHERE role = 'founder' ORDER BY created_at LIMIT 1; END IF;
  SELECT id INTO tony FROM public.profiles WHERE full_name ILIKE 'tony%chen%' ORDER BY (role IN ('founder', 'superadmin', 'admin')) DESC, created_at LIMIT 1;

  IF nico IS NOT NULL THEN
    INSERT INTO public.community_admins (community_id, user_id, role) VALUES (cid, nico, 'owner') ON CONFLICT (community_id, user_id) DO UPDATE SET role = 'owner';
    INSERT INTO public.community_memberships (user_id, community_id) VALUES (nico, cid) ON CONFLICT DO NOTHING;
  ELSE RAISE NOTICE 'Founder account not found';
  END IF;
  IF tony IS NOT NULL THEN
    INSERT INTO public.community_admins (community_id, user_id, role) VALUES (cid, tony, 'owner') ON CONFLICT (community_id, user_id) DO UPDATE SET role = 'owner';
    INSERT INTO public.community_memberships (user_id, community_id) VALUES (tony, cid) ON CONFLICT DO NOTHING;
  ELSE RAISE NOTICE 'Tony Chen not found: check the spelling of his name';
  END IF;
END $$;

SELECT c.name, c.slug, c.is_public, c.join_mode,
       (SELECT string_agg(p.full_name || ' (' || a.role || ')', ', ') FROM public.community_admins a JOIN public.profiles p ON p.id = a.user_id WHERE a.community_id = c.id) AS owners
FROM public.communities c WHERE c.slug = 'sukses-sejati-katolik';
