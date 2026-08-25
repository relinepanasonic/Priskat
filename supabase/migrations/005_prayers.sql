-- ============================================================
-- Migration 005: Prayers / Doa
-- ============================================================

-- Category enum
create type public.prayer_category as enum (
  'rosario',
  'bunda_maria',
  'hati_kudus_yesus',
  'roh_kudus',
  'malaikat',
  'jalan_salib',
  'para_kudus',
  'keluarga',
  'doa_harian',
  'tobat_syukur'
);

-- Language enum
create type public.prayer_language as enum ('id', 'en', 'both');

-- Prayers table
create table public.prayers (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title_id      text not null,
  title_en      text not null,
  body_id       text not null,
  body_en       text not null,
  category      public.prayer_category not null default 'doa_harian',
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_prayers_category on public.prayers(category);
create index idx_prayers_slug on public.prayers(slug);

create trigger prayers_updated_at before update on public.prayers
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.prayers enable row level security;

create policy "Prayers are viewable by everyone."
  on public.prayers for select using (is_published = true);

create policy "Admins and mods can manage prayers."
  on public.prayers for all using (public.is_admin_or_mod());

-- ============================================================
-- SEED DATA — Standard Catholic Prayers (ID + EN)
-- ============================================================

insert into public.prayers (slug, title_id, title_en, category, sort_order, body_id, body_en) values

-- ============ DOA HARIAN ============
('doa-pagi', 'Doa Pagi', 'Morning Prayer', 'doa_harian', 10,
'Tuhan Allah,
Pagi ini aku datang ke hadapan-Mu dengan penuh syukur atas kasih-Mu yang tidak pernah berakhir.

Terima kasih atas tidur yang nyenyak, atas napas kehidupan yang Engkau berikan, dan atas hari baru yang penuh rahmat ini.

Hari ini, aku persembahkan seluruh pikiran, perkataan, dan perbuatanku kepada-Mu. Jadikan aku alat kasih-Mu bagi sesama.

Lindungi aku dari segala bahaya dan godaan. Sertai aku dalam setiap langkah yang aku ambil hari ini.

Bapa, aku percaya bahwa dalam tangan-Mu, semuanya akan baik-baik saja. Amin.',
'Lord God,
This morning I come before You with gratitude for Your endless love.

Thank You for restful sleep, for the breath of life You have given me, and for this new day full of grace.

Today, I offer You all my thoughts, words, and deeds. Make me an instrument of Your love for others.

Protect me from all danger and temptation. Walk with me in every step I take today.

Father, I trust that in Your hands, all will be well. Amen.'),

('doa-malam', 'Doa Malam', 'Night Prayer', 'doa_harian', 20,
'Bapa yang Maha Baik,
Hari ini telah berakhir. Aku datang ke hadirat-Mu dengan hati yang penuh syukur.

Terima kasih atas segala berkat yang Engkau curahkan kepadaku hari ini — atas perlindungan-Mu, atas kasih orang-orang yang kucintai, atas kekuatan yang Engkau berikan dalam menghadapi setiap tantangan.

Ampunilah segala dosa dan kesalahanku yang telah aku perbuat hari ini, baik yang kusadari maupun yang tidak.

Kini, aku serahkan diriku ke dalam tangan-Mu. Jagalah aku dan orang-orang yang kucintai sepanjang malam ini.

Dalam nama Yesus, Amin.',
'Good Father,
This day has come to an end. I come before You with a grateful heart.

Thank You for all the blessings You have poured upon me today — for Your protection, for the love of those I hold dear, for the strength You gave me in facing every challenge.

Forgive me for all the sins and mistakes I have committed today, both those I am aware of and those I am not.

Now, I place myself in Your hands. Watch over me and those I love throughout this night.

In Jesus'' name, Amen.'),

('doa-makan', 'Doa Sebelum Makan', 'Grace Before Meals', 'doa_harian', 30,
'Tuhan Yesus, terima kasih atas makanan yang akan kami santap ini.
Berkati kami yang akan menerimanya dan semua orang yang telah berjerih-payah menyediakannya.
Ingatlah juga mereka yang kekurangan makan hari ini. Amin.',
'Lord Jesus, thank You for this food we are about to receive.
Bless us who are about to receive it and all who have worked to provide it.
Remember also those who go without food today. Amen.'),

('doa-sesudah-makan', 'Doa Sesudah Makan', 'Grace After Meals', 'doa_harian', 40,
'Tuhan kami, kami mengucap syukur atas nikmat yang telah Engkau berikan kepada kami.
Semoga semua kebaikan ini memperkuat kami untuk melayani-Mu dan sesama.
Amin.',
'Lord, we give You thanks for the blessings You have given us.
May all these gifts strengthen us to serve You and others.
Amen.'),

('doa-tobat', 'Doa Tobat', 'Act of Contrition', 'tobat_syukur', 50,
'Ya Allah yang Maha Rahim,
Aku menyesal atas segala dosaku dengan sepenuh hati,
bukan hanya karena aku takut akan hukuman-Mu,
melainkan terutama karena aku mencintai-Mu.

Aku berjanji dengan pertolongan rahmat-Mu untuk bertobat
dan tidak akan mengulangi dosa-dosaku.
Amin.',
'O my God,
I am heartily sorry for having offended Thee,
and I detest all my sins, because I dread the loss of Heaven and the pains of Hell,
but most of all because they offend Thee, my God, who art all-good and deserving of all my love.

I firmly resolve with the help of Thy grace to confess my sins, to do penance, and to amend my life.
Amen.'),

-- ============ ROSARIO ============
('bapa-kami', 'Doa Bapa Kami', 'Our Father', 'rosario', 100,
'Bapa kami yang ada di surga,
dimuliakanlah nama-Mu.
Datanglah kerajaan-Mu.
Jadilah kehendak-Mu
di atas bumi seperti di dalam surga.

Berilah kami pada hari ini
makanan kami yang secukupnya.
Dan ampunilah kami akan kesalahan kami,
seperti kami juga mengampuni orang yang bersalah kepada kami.
Dan janganlah membawa kami ke dalam pencobaan,
tetapi lepaskanlah kami dari yang jahat.

Amin.',
'Our Father, who art in Heaven,
hallowed be Thy name.
Thy Kingdom come,
Thy will be done
on earth as it is in Heaven.

Give us this day our daily bread.
And forgive us our trespasses,
as we forgive those who trespass against us.
And lead us not into temptation,
but deliver us from evil.

Amen.'),

('salam-maria', 'Salam Maria', 'Hail Mary', 'rosario', 110,
'Salam Maria, penuh rahmat,
Tuhan sertamu,
terpujilah engkau di antara wanita,
dan terpujilah buah tubuhmu, Yesus.

Santa Maria, Bunda Allah,
doakanlah kami yang berdosa ini,
sekarang dan waktu kami mati.

Amin.',
'Hail Mary, full of grace,
the Lord is with thee.
Blessed art thou among women,
and blessed is the fruit of thy womb, Jesus.

Holy Mary, Mother of God,
pray for us sinners,
now and at the hour of our death.

Amen.'),

('kemuliaan', 'Kemuliaan', 'Glory Be', 'rosario', 120,
'Kemuliaan kepada Bapa, dan Putra, dan Roh Kudus.
Seperti pada permulaan, sekarang, selalu, dan sepanjang segala abad.
Amin.',
'Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be, world without end.
Amen.'),

('syahadat', 'Syahadat Para Rasul', 'Apostles'' Creed', 'rosario', 130,
'Aku percaya akan Allah, Bapa yang mahakuasa,
Pencipta langit dan bumi.

Dan akan Yesus Kristus, Putra-Nya yang tunggal, Tuhan kita;
yang dikandung dari Roh Kudus,
dilahirkan oleh Perawan Maria;
yang menderita sengsara dalam pemerintahan Pontius Pilatus,
disalibkan, wafat, dan dimakamkan;
yang turun ke tempat penantian;
pada hari ketiga bangkit dari antara orang mati;
yang naik ke surga,
duduk di sebelah kanan Allah Bapa yang mahakuasa;
dari situ Ia akan datang mengadili orang yang hidup dan yang mati.

Aku percaya akan Roh Kudus,
Gereja Katolik yang kudus,
persekutuan para kudus,
pengampunan dosa,
kebangkitan badan,
dan kehidupan kekal.

Amin.',
'I believe in God,
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

Amen.'),

-- ============ BUNDA MARIA ============
('doa-kepada-bunda-maria', 'Doa Kepada Bunda Maria', 'Prayer to Our Lady', 'bunda_maria', 200,
'Ya Maria, Bunda yang penuh kasih,
engkau adalah bintang penunjuk jalan bagi kami.
Engkau membimbing kami menuju Yesus, Putramu.

Doakanlah kami kepada Putramu yang terkasih.
Bantulah kami agar setia dalam iman,
teguh dalam harapan,
dan bertumbuh dalam kasih.

Bunda yang penuh rahmat,
lindungilah kami dalam setiap bahaya.
Tuntunlah kami ke jalan keselamatan.

Amin.',
'O Mary, Mother full of love,
you are the guiding star for us.
You lead us to Jesus, your Son.

Intercede for us to your beloved Son.
Help us to be faithful in faith,
firm in hope,
and growing in love.

Mother full of grace,
protect us in every danger.
Lead us on the path of salvation.

Amen.'),

('novena-bunda-penolong-abadi', 'Novena Bunda Penolong Abadi', 'Novena to Our Lady of Perpetual Help', 'bunda_maria', 210,
'Ya Maria, Bunda Penolong Abadi,
nama-Mu sungguh mengungkapkan kerahiman yang ingin Allah anugerahkan kepada kami melalui dirimu.

Engkau adalah Penolong abadi bagi semua yang berharap kepadamu.
Berikan kepadaku pertolonganmu dalam segala perkara hidupku, terutama dalam keperluan (sebutkan permohonanmu...).

Berilah aku terutama pertolongan yang besar dalam menghadapi pencobaan yang setiap hari menyerangku.
Jagalah aku dari godaan, dan terutama di saat-saat terakhir hidupku.

Tinggallah bersamaku, ya Maria, dan jangan biarkan aku jatuh dalam dosa.
Dengan kepercayaan ini, aku datang kepadamu setiap hari, berharap mendapat pertolonganmu.
Jadilah benar-benar Penolongku.

Amin.',
'O Mary, Mother of Perpetual Help,
your very name expresses the mercy that God wishes to grant us through you.

You are the perpetual Helper of all who hope in you.
Grant me your help in all the needs of my life, especially in this necessity (mention your request...).

Give me above all the great grace of resisting the temptations that attack me every day.
Preserve me from them, and most especially at the hour of my death.

Stay with me, O Mary, and do not let me fall into sin.
With this trust, I come to you every day, hoping to receive your help.
Be truly my Helper.

Amen.'),

-- ============ HATI KUDUS YESUS ============
('novena-hati-kudus', 'Novena Kepada Hati Kudus Yesus', 'Novena to the Sacred Heart of Jesus', 'hati_kudus_yesus', 300,
'Ya Yesus, yang telah bersabda: "Mintalah dan kamu akan menerima, carilah dan kamu akan mendapat, ketuklah dan pintu akan dibukakan bagimu," — aku mengetuk pintu Hati-Mu, dan mohon dengan rendah hati: kabulkanlah permohonanku (sebutkan permohonanmu...).

Ya Yesus, yang telah bersabda: "Segala sesuatu yang kamu minta kepada Bapa dalam nama-Ku, akan diberikan-Nya kepadamu" — mohon dengan rendah hati kepada Bapa-Mu yang terkasih, dalam nama-Mu yang kudus, kabulkanlah permohonanku.

Ya Yesus, yang telah bersabda: "Langit dan bumi akan berlalu, tetapi firman-Ku tidak akan berlalu" — atas dasar kata-kata-Mu yang tak dapat gagal ini, aku dengan penuh keyakinan mohon: kabulkanlah permohonanku.

Hati Kudus Yesus yang maha pengasih, aku percaya kepada-Mu. Amin.',
'O Jesus, who hast said, "Ask and you shall receive, seek and you shall find, knock and it shall be opened to you," through the intercession of Mary, Thy most holy Mother, I knock, I seek, I ask that my prayer be granted (mention your request...).

O Jesus, who hast said, "Whatsoever you shall ask of the Father in My Name, He will give it to you," through the intercession of Mary, Thy most holy Mother, I humbly and urgently ask Thy Father in Thy Name that my prayer be granted.

O Jesus, who hast said, "Heaven and earth shall pass away, but My word shall not pass away," through the intercession of Mary, Thy most holy Mother, I feel confident that my prayer will be granted.

Sacred Heart of Jesus, I trust in Thee. Amen.'),

('persembahan-hati-kudus', 'Persembahan Kepada Hati Kudus Yesus', 'Consecration to the Sacred Heart', 'hati_kudus_yesus', 310,
'Ya Yesus Kristus yang maha pengasih,
Hari ini, aku mempersembahkan diri seutuhnya kepada Hati-Mu yang kudus.

Aku mempersembahkan jiwa dan ragaku,
seluruh hidupku, perbuatan, penderitaan, dan kematianku.

Terimalah persembahan ini sebagai tanda cintaku kepada-Mu.
Bentuklah aku seturut hati-Mu yang lemah lembut dan rendah hati.

Hati Kudus Yesus, jadikanlah hatiku serupa dengan Hati-Mu.
Amin.',
'O most loving Jesus Christ,
Today, I consecrate myself entirely to Your Sacred Heart.

I offer You my soul and body,
my entire life, deeds, sufferings, and death.

Accept this offering as a sign of my love for You.
Form me according to Your meek and humble heart.

Sacred Heart of Jesus, make my heart like unto Thine.
Amen.'),

-- ============ ROH KUDUS ============
('doa-roh-kudus', 'Doa Kepada Roh Kudus', 'Prayer to the Holy Spirit', 'roh_kudus', 400,
'Datanglah, ya Roh Kudus,
penuhilah hati umat-Mu
dan nyalakanlah di dalam kami api cinta-Mu.

Kirimkanlah Roh-Mu dan kami akan diciptakan kembali,
dan Engkau akan memperbarui muka bumi.

Ya Allah, yang telah mengajar hati umat-Mu
dengan penerangan Roh Kudus,
berilah kami oleh Roh yang sama
agar kami selalu mencintai yang benar
dan selalu bergembira dalam penghiburan-Nya.

Demi Kristus, Tuhan kami. Amin.',
'Come, Holy Spirit,
fill the hearts of Your faithful
and kindle in us the fire of Your love.

Send forth Your Spirit and we shall be created,
and You shall renew the face of the earth.

O God, who taught the hearts of the faithful
by the light of the Holy Spirit,
grant that by the gift of the same Spirit
we may always be truly wise
and rejoice in His consolation.

Through Christ our Lord. Amen.'),

('tujuh-karunia-roh-kudus', 'Mohon Tujuh Karunia Roh Kudus', 'Prayer for the Seven Gifts of the Holy Spirit', 'roh_kudus', 410,
'Ya Tuhan Yesus yang maha pengasih,
Engkau telah menjanjikan kepada murid-murid-Mu Roh Kudus,
yang akan mengajar dan memimpin mereka ke dalam seluruh kebenaran.

Aku mohon dengan rendah hati kepada-Mu,
anugerahkanlah kepadaku Tujuh Karunia Roh Kudus:

Karunia Hikmat — agar aku dapat menilai segala sesuatu menurut ukuran ilahi.
Karunia Pengertian — agar aku dapat memahami misteri iman dengan lebih dalam.
Karunia Nasihat — agar aku dapat memilih yang baik dan menghindari yang jahat.
Karunia Keperkasaan — agar aku dapat bertindak dengan berani dalam kebaikan.
Karunia Pengetahuan — agar aku dapat mengetahui kehendak-Mu dalam hidupku.
Karunia Kesalehan — agar aku dapat berdoa dengan khidmat dan penuh kasih.
Karunia Takut akan Allah — agar aku dapat menjauhi segala dosa.

Amin.',
'O Lord Jesus Christ, most loving,
You promised Your disciples the Holy Spirit,
who would teach and guide them into all truth.

I humbly ask You,
grant me the Seven Gifts of the Holy Spirit:

The Gift of Wisdom — that I may judge all things by divine measure.
The Gift of Understanding — that I may understand the mysteries of faith more deeply.
The Gift of Counsel — that I may choose what is good and avoid what is evil.
The Gift of Fortitude — that I may act courageously in goodness.
The Gift of Knowledge — that I may know Your will in my life.
The Gift of Piety — that I may pray with reverence and love.
The Gift of Fear of the Lord — that I may avoid all sin.

Amen.'),

-- ============ MALAIKAT ============
('doa-malaikat-pelindung', 'Doa Kepada Malaikat Pelindung', 'Prayer to Guardian Angel', 'malaikat', 500,
'Malaikat Allah,
yang dipercaya oleh Allah untuk menjaga dan melindungiku,
terangi, jagalah, bimbinglah, dan pimpinlah aku.

Pada hari ini dan selama hidupku,
tetaplah bersamaku.
Ingatkan aku akan kasih Allah yang tak terbatas.

Amin.',
'Angel of God,
my guardian dear,
to whom God''s love commits me here,
ever this day be at my side,
to light and guard, to rule and guide.

Amen.'),

('doa-malaikat-tuhan', 'Doa Malaikat Tuhan (Angelus)', 'The Angelus', 'malaikat', 510,
'Malaikat Tuhan mewartakan kepada Maria:
Dan ia mengandung dari Roh Kudus.
— Salam Maria...

Sesungguhnya aku ini hamba Tuhan.
Terjadilah padaku menurut perkataanmu.
— Salam Maria...

Dan Firman itu telah menjadi manusia:
Dan tinggal di antara kita.
— Salam Maria...

Doakanlah kami, ya Santa Maria Bunda Allah,
Supaya kami layak menerima janji-janji Kristus.

Marilah kita berdoa:
Ya Allah, dengan kabar malaikat, Engkau telah menyatakan kepada kami
bahwa Putra-Mu yang terkasih menjadi manusia.
Kami mohon, curahkanlah rahmat-Mu ke dalam hati kami,
supaya kami yang percaya bahwa Kristus sungguh-sungguh adalah Allah dan manusia,
karena sengsara dan salib-Nya dibawa kepada kemuliaan kebangkitan.
Demi Kristus, Tuhan kami. Amin.',
'The angel of the Lord declared to Mary:
And she conceived of the Holy Spirit.
— Hail Mary...

Behold the handmaid of the Lord:
Be it done unto me according to thy word.
— Hail Mary...

And the Word was made flesh:
And dwelt among us.
— Hail Mary...

Pray for us, O Holy Mother of God,
That we may be made worthy of the promises of Christ.

Let us pray:
Pour forth, we beseech Thee, O Lord, Thy grace into our hearts,
that we, to whom the incarnation of Christ, Thy Son,
was made known by the message of an angel,
may by His Passion and Cross be brought to the glory of His Resurrection,
through the same Christ our Lord. Amen.'),

-- ============ PARA KUDUS / SAINTS ============
('novena-st-monica', 'Novena Kepada St. Monica', 'Novena to St. Monica', 'para_kudus', 600,
'Ya St. Monica yang terberkati,
engkau menderita dengan sabar karena anak-anakmu yang jauh dari Tuhan.
Dalam air mata dan doa yang tak henti-hentinya,
engkau menyerahkan mereka kepada kasih Allah.

Ajarilah aku kesabaran dan ketekunanmu dalam berdoa.
Doakanlah orang-orang yang kucintai yang jauh dari iman:
(sebutkan nama-nama...).

Bawalah mereka kembali kepada Tuhan, seperti engkau membawa St. Agustinus.
Berilah aku penghiburan bahwa doa-doaku tidak akan sia-sia.

Amin.',
'Blessed St. Monica,
you suffered patiently for your children who were far from God.
With constant tears and prayer,
you entrusted them to God''s love.

Teach me your patience and perseverance in prayer.
Intercede for those I love who are far from faith:
(mention their names...).

Bring them back to God, as you brought back St. Augustine.
Give me the consolation that my prayers will not be in vain.

Amen.'),

('novena-st-yudas', 'Novena Kepada St. Yudas Tadeus', 'Novena to St. Jude Thaddeus', 'para_kudus', 610,
'Ya St. Yudas Tadeus yang mulia,
rasul yang setia dan sahabat Yesus yang terkasih,
Gereja menghormatimu dan memanggilmu sebagai pelindung orang-orang yang putus asa.

Penolongku yang kuat, mohon kiranya engkau berkenan menjadi perantaraku.
Aku memohon bantuanmu dengan penuh harap dalam keperluanku yang mendesak ini (sebutkan permohonanmu...).

Ya Tuhan, berikanlah aku kekuatan dan harapan.
Jangan biarkan aku menyerah dalam kesusahan.

Amin.',
'Glorious St. Jude Thaddeus,
faithful apostle and beloved friend of Jesus,
the Church honors you as patron of desperate cases.

My powerful helper, please deign to intercede for me.
I beseech your aid with full hope in this urgent need (mention your request...).

O Lord, grant me strength and hope.
Do not let me give up in my distress.

Amen.'),

('novena-st-antonius', 'Novena Kepada St. Antonius dari Padua', 'Novena to St. Anthony of Padua', 'para_kudus', 620,
'Ya St. Antonius yang penuh kerahiman,
Tuhan telah memberikan kepadamu karunia yang istimewa untuk menolong semua orang yang memanggilmu.

Aku datang dengan rendah hati kepadamu dengan permohonanku (sebutkan permohonanmu...).

Dengarkanlah doaku dan mohonkanlah kepada Allah supaya mengabulkan permohonanku jika itu sesuai dengan kehendak-Nya.

Doakanlah aku agar aku selalu tekun dalam iman, teguh dalam harapan, dan bertumbuh dalam cinta kasih.

Amin.',
'O beloved St. Anthony of Padua,
God has given you a special gift to help all who call upon you.

I come to you humbly with my petition (mention your request...).

Hear my prayer and intercede with God to grant my request if it is in accord with His holy will.

Pray for me that I may always be faithful in faith, firm in hope, and growing in love.

Amen.'),

('doa-kepada-st-yusuf', 'Doa Yang Indah Kepada St. Yusuf', 'Beautiful Prayer to St. Joseph', 'para_kudus', 630,
'Ya St. Yusuf yang terberkati,
bapa Putra Allah menurut hukum dan pelindung Keluarga Kudus,
aku datang kepadamu dengan kepercayaan seorang anak.

Engkau yang telah merawat Yesus dan Maria dengan penuh kasih,
rawatlah aku dan keluargaku juga.

Lindungi kami dari segala bahaya.
Bimbinglah kami dengan kebijaksanaanmu.
Doakanlah kami agar kami dapat hidup dalam kesucian dan kesetiaan kepada Allah.

Doakanlah kami, ya St. Yusuf, terutama pada saat-saat terakhir hidup kami.
Amin.',
'O blessed St. Joseph,
legal father of the Son of God and protector of the Holy Family,
I come to you with the trust of a child.

You who cared for Jesus and Mary with such great love,
care also for me and my family.

Protect us from all danger.
Guide us with your wisdom.
Pray for us that we may live in holiness and faithfulness to God.

Pray for us, O St. Joseph, especially at the hour of our death.
Amen.'),

-- ============ KELUARGA ============
('doa-keluarga', 'Doa Untuk Keluarga', 'Prayer for the Family', 'keluarga', 700,
'Ya Allah Bapa yang pengasih,
Engkau telah memberikan kami anugerah keluarga ini.
Terima kasih atas cinta yang mengalir di antara kami.

Kami mohon berkat-Mu atas keluarga kami:
Jadikan rumah kami tempat yang penuh kasih, damai, dan sukacita.
Berikan kepada kami kekuatan untuk saling mengampuni dan memahami.

Lindungi kami dari perpecahan dan ketidakharmonisan.
Bantulah kami untuk selalu menjadikan-Mu pusat dari kehidupan keluarga kami.

Bunda Maria, Ratu Keluarga,
doakanlah kami.

Amin.',
'O God our loving Father,
You have given us the gift of this family.
Thank You for the love that flows among us.

We ask Your blessing upon our family:
Make our home a place full of love, peace, and joy.
Give us the strength to forgive and understand each other.

Protect us from division and disharmony.
Help us to always make You the center of our family life.

Blessed Virgin Mary, Queen of the Family,
pray for us.

Amen.'),

('doa-untuk-orang-sakit', 'Doa Untuk Orang Sakit', 'Prayer for the Sick', 'keluarga', 710,
'Ya Tuhan Yesus,
engkau adalah Tabib Ilahi yang menyembuhkan semua orang yang datang kepada-Mu.

Aku datang kepada-Mu dengan membawa (nama orang sakit...) yang sedang menderita.
Curahkanlah kasih dan kekuatan-Mu kepadanya.

Jika sesuai dengan kehendak-Mu, sentuhlah dia dengan tangan penyembuhan-Mu.
Berilah dia kesabaran dalam penderitaan.
Berilah dia kekuatan iman untuk menerima kehendak-Mu.

Ya Maria, Kesehatan Orang-Orang Sakit, doakanlah dia.
Amin.',
'O Lord Jesus,
You are the Divine Physician who heals all who come to You.

I bring to You (name of the sick person...) who is suffering.
Pour forth Your love and strength upon them.

If it is in accordance with Your will, touch them with Your healing hand.
Give them patience in suffering.
Give them the strength of faith to accept Your will.

O Mary, Health of the Sick, pray for them.
Amen.'),

('doa-untuk-yang-meninggal', 'Doa Untuk Orang Yang Telah Meninggal', 'Prayer for the Deceased', 'keluarga', 720,
'Ya Tuhan yang Maha Pengasih,
dengan penuh harapan aku mohon belas kasih-Mu bagi (nama yang telah meninggal...).

Engkau yang telah menciptakan mereka dan menebus mereka dengan darah Putra-Mu yang terkasih.
Kini aku serahkan jiwa mereka kepada kasih-Mu yang tak terbatas.

Ampunilah segala dosa dan kesalahan mereka.
Terimalah mereka dalam pelukan kasih-Mu yang kekal.
Berikan kepada mereka istirahat abadi dalam terang wajah-Mu.

Semoga jiwa mereka dan jiwa semua orang beriman yang telah meninggal,
beristirahat dalam damai.
Amin.',
'O most merciful God,
with full hope I implore Your mercy for (name of the deceased...).

You who created them and redeemed them with the blood of Your beloved Son,
now I entrust their soul to Your boundless love.

Forgive them all their sins and faults.
Receive them in the embrace of Your eternal love.
Grant them eternal rest in the light of Your face.

May their soul and the souls of all the faithful departed
rest in peace.
Amen.'),

-- ============ JALAN SALIB ============
('doa-jalan-salib', 'Doa Jalan Salib Singkat', 'Short Stations of the Cross', 'jalan_salib', 800,
'Pembukaan:
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.

Stasi I — Yesus dijatuhi hukuman mati
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Tuhan, betapa besar cinta-Mu bagi kami.

Stasi II — Yesus memanggul salib-Nya
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Ajarlah aku memanggul salibku setiap hari.

Stasi III — Yesus jatuh pertama kali
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Tuhan, bangkitkan aku setiap kali aku jatuh dalam dosa.

Stasi IV — Yesus berjumpa dengan Bunda-Nya
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Maria, doakanlah aku di saat-saat sukarku.

Stasi V — Simon dari Kirene membantu Yesus
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Jadikan aku Simon bagi sesama yang menderita.

Stasi VI — Veronika mengusap wajah Yesus
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Jadikan aku berani melayani-Mu dalam diri sesama.

Stasi VII — Yesus jatuh kedua kali
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Tuhan, jangan biarkan aku putus asa.

Stasi VIII — Yesus menghibur wanita-wanita Yerusalem
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Berikan aku hati yang peduli terhadap penderitaan sesama.

Stasi IX — Yesus jatuh ketiga kali
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Tuhan, berikan aku kekuatan untuk bangkit terus.

Stasi X — Yesus ditelanjangi
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Bebaskan aku dari segala kelekatan duniawi.

Stasi XI — Yesus dipakukan pada salib
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Kuku-kuku itu dipakukan demi cinta kepada-Mu.

Stasi XII — Yesus wafat di salib
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Ya Yesus, pengorbanan-Mu adalah tanda cinta terbesar.

Stasi XIII — Yesus diturunkan dari salib
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Maria, pangkulah aku dalam doa-doamu.

Stasi XIV — Yesus dimakamkan
Kami menyembah Engkau, ya Kristus, dan memuji Engkau.
Sebab dengan salib suci-Mu, Engkau telah menebus dunia.
Tuhan, engkau telah wafat tetapi bangkit dalam kemuliaan.

Penutup:
Ya Kristus yang terkasih,
Engkau telah menanggung semua ini demi cinta-Mu kepada kami.
Terima kasih atas pengorbanan-Mu yang tak ternilai.
Semoga penderitaan-Mu menjadi kekuatan kami setiap hari.
Amin.',
'Opening:
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.

Station I — Jesus is condemned to death
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Lord, how great is Your love for us.

Station II — Jesus takes up His Cross
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Teach me to carry my cross each day.

Station III — Jesus falls the first time
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Lord, raise me up each time I fall into sin.

Station IV — Jesus meets His Mother
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Mary, pray for me in my difficult moments.

Station V — Simon of Cyrene helps Jesus
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Make me a Simon for those who suffer.

Station VI — Veronica wipes the face of Jesus
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Make me brave to serve You in the faces of others.

Station VII — Jesus falls the second time
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Lord, do not let me despair.

Station VIII — Jesus speaks to the women of Jerusalem
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Give me a heart that cares for the suffering of others.

Station IX — Jesus falls the third time
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Lord, give me strength to keep rising.

Station X — Jesus is stripped of His garments
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Free me from all earthly attachments.

Station XI — Jesus is nailed to the Cross
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Those nails were driven out of love for me.

Station XII — Jesus dies on the Cross
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
O Jesus, Your sacrifice is the greatest sign of love.

Station XIII — Jesus is taken down from the Cross
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Mary, hold me in your prayers.

Station XIV — Jesus is laid in the tomb
We adore You, O Christ, and we bless You.
Because by Your Holy Cross, You have redeemed the world.
Lord, You died but rose in glory.

Closing:
O beloved Christ,
You endured all of this out of love for us.
Thank You for Your priceless sacrifice.
May Your suffering be our strength each day.
Amen.');

