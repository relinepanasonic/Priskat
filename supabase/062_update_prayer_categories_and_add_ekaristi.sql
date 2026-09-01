-- 1. Insert or Update Basic Prayers
INSERT INTO public.prayers (slug, title_id, title_en, body_id, body_en, category, sort_order, is_published)
VALUES 
('bapa-kami', 'Bapa Kami', 'Our Father', 
'Bapa kami yang ada di surga, Dimuliakanlah nama-Mu. Datanglah kerajaan-Mu. Jadilah kehendak-Mu di atas bumi seperti di dalam surga. Berilah kami rezeki pada hari ini, dan ampunilah kesalahan kami, seperti kami pun mengampuni yang bersalah kepada kami. Dan janganlah masukkan kami ke dalam pencobaan, tetapi bebaskanlah kami dari yang jahat. Amin.', 
'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.', 
'basic_prayer', 1, true),

('salam-maria', 'Salam Maria', 'Hail Mary', 
'Salam Maria, penuh rahmat, Tuhan sertamu, terpujilah engkau di antara wanita, dan terpujilah buah tubuhmu, Yesus. Santa Maria, bunda Allah, doakanlah kami yang berdosa ini sekarang dan waktu kami mati. Amin.', 
'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.', 
'basic_prayer', 2, true),

('kemuliaan', 'Kemuliaan', 'Glory Be', 
'Kemuliaan kepada Bapa dan Putra dan Roh Kudus, seperti pada permulaan, sekarang, selalu, dan sepanjang segala abad. Amin.', 
'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.', 
'basic_prayer', 3, true),

('syahadat-para-rasul', 'Syahadat Para Rasul', 'Apostles Creed', 
'Aku percaya akan Allah, Bapa yang Mahakuasa, pencipta langit dan bumi. Dan akan Yesus Kristus, Putra-Nya yang tunggal, Tuhan kita. Yang dikandung dari Roh Kudus, dilahirkan oleh perawan Maria. Yang menderita sengsara dalam pemerintahan Pontius Pilatus, disalibkan, wafat, dan dimakamkan. Yang turun ke tempat penantian, pada hari ketiga bangkit dari antara orang mati. Yang naik ke surga, duduk di sebelah kanan Allah Bapa yang Mahakuasa. Dari situ Ia akan datang mengadili orang hidup dan mati. Aku percaya akan Roh Kudus, Gereja Katolik yang kudus, persekutuan para kudus, pengampunan dosa, kebangkitan badan, kehidupan kekal. Amin.', 
'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.', 
'basic_prayer', 4, true),

('doa-tobat', 'Doa Tobat', 'Act of Contrition', 
'Allah yang maharahim, aku menyesal atas dosa-dosaku. Aku sungguh patut Engkau hukum, terutama karena aku telah tidak setia kepada Engkau yang maha pengasih dan mahabaik bagiku. Aku benci akan segala dosaku, dan berjanji dengan pertolongan rahmat-Mu hendak memperbaiki hidupku dan tidak akan berbuat dosa lagi. Allah yang mahamurah, ampunilah aku, orang berdosa. Amin.', 
'O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all-good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.', 
'basic_prayer', 5, true)
ON CONFLICT (slug) DO UPDATE 
SET category = 'basic_prayer',
    title_id = EXCLUDED.title_id,
    body_id = EXCLUDED.body_id;

-- 2. Update Existing Doa Harian (just in case they were miscategorized)
UPDATE public.prayers
SET category = 'doa_harian'
WHERE title_id ILIKE '%Angelus%'
   OR title_id ILIKE '%Doa Pagi%'
   OR title_id ILIKE '%Doa Malam%'
   OR title_id ILIKE '%Makan%';

-- 3. Insert Doa Ekaristi (Doa Syukur Agung 1 - 10)
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
