-- 062d_format_basic_prayers.sql
-- Formats the basic prayers with proper line breaks and stanzas for better UI/UX

UPDATE public.prayers
SET body_id = 'Bapa kami yang ada di surga,
Dimuliakanlah nama-Mu.
Datanglah kerajaan-Mu.
Jadilah kehendak-Mu
di atas bumi seperti di dalam surga.

Berilah kami rezeki pada hari ini,
dan ampunilah kesalahan kami,
seperti kami pun mengampuni yang bersalah kepada kami.

Dan janganlah masukkan kami
ke dalam pencobaan,
tetapi bebaskanlah kami dari yang jahat.

Amin.',
body_en = 'Our Father, who art in heaven,
hallowed be thy name;
thy kingdom come;
thy will be done on earth as it is in heaven.

Give us this day our daily bread;
and forgive us our trespasses
as we forgive those who trespass against us;

and lead us not into temptation,
but deliver us from evil.

Amen.'
WHERE slug = 'bapa-kami';

UPDATE public.prayers
SET body_id = 'Salam Maria, penuh rahmat,
Tuhan sertamu,
terpujilah engkau di antara wanita,
dan terpujilah buah tubuhmu, Yesus.

Santa Maria, bunda Allah,
doakanlah kami yang berdosa ini
sekarang dan waktu kami mati.

Amin.',
body_en = 'Hail Mary, full of grace,
the Lord is with thee;
blessed art thou among women,
and blessed is the fruit of thy womb, Jesus.

Holy Mary, Mother of God,
pray for us sinners,
now and at the hour of our death.

Amen.'
WHERE slug = 'salam-maria';

UPDATE public.prayers
SET body_id = 'Kemuliaan kepada Bapa dan Putra dan Roh Kudus,
seperti pada permulaan, sekarang, selalu,
dan sepanjang segala abad.

Amin.',
body_en = 'Glory be to the Father,
and to the Son,
and to the Holy Spirit.

As it was in the beginning,
is now, and ever shall be,
world without end.

Amen.'
WHERE slug = 'kemuliaan';

UPDATE public.prayers
SET body_id = 'Aku percaya akan Allah,
Bapa yang Mahakuasa, 
pencipta langit dan bumi.

Dan akan Yesus Kristus, 
Putra-Nya yang tunggal, Tuhan kita.
Yang dikandung dari Roh Kudus, 
dilahirkan oleh perawan Maria.

Yang menderita sengsara 
dalam pemerintahan Pontius Pilatus, 
disalibkan, wafat, dan dimakamkan.
Yang turun ke tempat penantian, 
pada hari ketiga bangkit dari antara orang mati.
Yang naik ke surga, 
duduk di sebelah kanan Allah Bapa yang Mahakuasa.
Dari situ Ia akan datang mengadili orang hidup dan mati.

Aku percaya akan Roh Kudus, 
Gereja Katolik yang kudus, 
persekutuan para kudus, 
pengampunan dosa, 
kebangkitan badan, 
kehidupan kekal.

Amin.',
body_en = 'I believe in God,
the Father almighty,
Creator of heaven and earth,

and in Jesus Christ, his only Son, our Lord,
who was conceived by the Holy Spirit,
born of the Virgin Mary,
suffered under Pontius Pilate,
was crucified, died and was buried;
he descended into hell;
on the third day he rose again from the dead;
he ascended into heaven,
and is seated at the right hand of God the Father almighty;
from there he will come to judge the living and the dead.

I believe in the Holy Spirit,
the holy catholic Church,
the communion of saints,
the forgiveness of sins,
the resurrection of the body,
and life everlasting.

Amen.'
WHERE slug = 'syahadat-para-rasul';

UPDATE public.prayers
SET body_id = 'Allah yang maharahim, aku menyesal atas dosa-dosaku.
Aku sungguh patut Engkau hukum, 
terutama karena aku telah tidak setia kepada Engkau
yang maha pengasih dan mahabaik bagiku.

Aku benci akan segala dosaku,
dan berjanji dengan pertolongan rahmat-Mu
hendak memperbaiki hidupku dan tidak akan berbuat dosa lagi.

Allah yang mahamurah, ampunilah aku, orang berdosa.

Amin.',
body_en = 'O my God, I am heartily sorry for having offended Thee,
and I detest all my sins because of Thy just punishments,
but most of all because they offend Thee, my God,
Who art all-good and deserving of all my love.

I firmly resolve, with the help of Thy grace,
to sin no more and to avoid the near occasions of sin.

Amen.'
WHERE slug = 'doa-tobat';

