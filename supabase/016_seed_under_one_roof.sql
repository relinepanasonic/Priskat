
DO $$ 
DECLARE
  v_category_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- 1. Get or Create Category
  SELECT id INTO v_category_id FROM public.devotion_categories WHERE name = 'Love' LIMIT 1;
  IF v_category_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id) VALUES ('Love', 'Kasih') RETURNING id INTO v_category_id;
  END IF;

  -- 2. Insert Plan
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_category_id,
    $q$Under One Roof$q$,
    $q$Di Bawah Satu Atap$q$,
    $q$Learning to love the people closest to us$q$,
    $q$Belajar mengasihi orang-orang yang paling dekat dengan kita$q$,
    7,
    $q$Seven days on the love that is least optional and most tested: the love of family. Home is where we are known most closely, which means it is also where our patience, forgiveness, and faith are worn thin and made strong. Whether your household is full or quiet, whole or wounded, this plan gently turns your heart toward the ordinary, sacred work of loving the people under your roof.$q$,
    $q$Tujuh hari tentang kasih yang paling tidak bisa dihindari sekaligus paling sering diuji: kasih keluarga. Rumah adalah tempat kita paling dikenal secara dekat, yang berarti di situ pula kesabaran, pengampunan, dan iman kita menipis sekaligus dikuatkan. Entah rumahmu ramai atau sunyi, utuh atau terluka, devosi ini dengan lembut mengarahkan hatimu kepada pekerjaan yang biasa namun kudus: mengasihi orang-orang di bawah atapmu.$q$,
    'https://images.unsplash.com/photo-1511895426328-dc8714191300—q=80&w=2070&auto=format&fit=crop'
  ) RETURNING id INTO v_plan_id;

  -- Day 1
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    1,
    $q$As For My House$q$,
    $q$Aku dan Seisi Rumahku$q$,
    $q$Near the end of his life, Joshua gathered a whole nation and made them choose whom they would serve. And before anyone else had decided, he announced his own choice out loud, on behalf of his family: "But as for me and my household, we will serve the Lord." (Joshua 24:15) He did not wait for a family consensus. He went first, and he said it plainly.

Family faith almost always begins this way. Somebody has to decide, and say so, and then hold the door open for the rest to walk through in their own time. You may be the only one in your home who prays, or who still practices the faith, and that can feel lonely. But Joshua's example says it is not a failure — it is a beginning. Households are very often led toward God by one quiet, steady person who simply refuses to stop choosing well.

Notice too that Joshua's choice was not a private feeling; it was spoken and lived where his family could see it. Children and spouses and parents are shaped far more by what we do out loud than by what we merely believe in silence. A grace said before a meal, a Sunday habit kept, a prayer offered where others can hear — these small, visible choices preach louder than any lecture.

You are not responsible for how everyone in your home responds. You are only responsible for your own choice. Make one small choice out loud today for the good of your household, and trust God with the rest.$q$,
    $q$Menjelang akhir hidupnya, Yosua mengumpulkan seluruh bangsa dan meminta mereka memilih kepada siapa mereka akan beribadah. Dan sebelum orang lain memutuskan, ia menyatakan pilihannya sendiri dengan lantang, atas nama keluarganya: "tetapi aku dan seisi rumahku, kami akan beribadah kepada TUHAN!" (Yosua 24:15) Ia tidak menunggu kesepakatan keluarga. Ia memulai lebih dahulu, dan mengucapkannya dengan terang.

Iman keluarga hampir selalu dimulai seperti ini. Harus ada yang memutuskan, mengucapkannya, lalu menahan pintu tetap terbuka bagi yang lain untuk melangkah masuk pada waktu mereka sendiri. Mungkin engkau satu-satunya di rumahmu yang berdoa, atau yang masih menjalankan iman, dan itu bisa terasa sepi. Namun teladan Yosua berkata bahwa itu bukan kegagalan — itu sebuah permulaan. Rumah tangga sangat sering dipimpin menuju Allah oleh satu orang yang tenang dan teguh, yang sekadar menolak berhenti memilih yang baik.

Perhatikan pula bahwa pilihan Yosua bukanlah perasaan pribadi; ia diucapkan dan dihidupi di tempat keluarganya dapat melihatnya. Anak, pasangan, dan orang tua jauh lebih dibentuk oleh apa yang kita lakukan dengan lantang daripada oleh apa yang sekadar kita percayai dalam diam. Doa sebelum makan, kebiasaan hari Minggu yang dipelihara, doa yang diucapkan agar terdengar orang lain — pilihan-pilihan kecil yang tampak ini berkhotbah lebih nyaring daripada ceramah mana pun.

Engkau tidak bertanggung jawab atas bagaimana setiap orang di rumahmu menanggapi. Engkau hanya bertanggung jawab atas pilihanmu sendiri. Buatlah satu pilihan kecil dengan lantang hari ini demi kebaikan rumah tanggamu, dan percayakanlah sisanya kepada Allah.$q$,
    $q$Someone in a home usually has to choose God first, and out loud. Today, let that be you — one small, visible choice for the good of your household.$q$,
    $q$Di sebuah rumah, biasanya harus ada yang memilih Allah lebih dahulu, dan dengan lantang. Hari ini, biarlah itu engkau — satu pilihan kecil yang tampak demi kebaikan rumah tanggamu.$q$,
    $q$Lord, let me be the one in my home who chooses You out loud, even if I choose alone. Hold the door open behind me, and in Your time, bring my whole household through it. Amen.$q$,
    $q$Tuhan, jadikanlah aku orang di rumahku yang memilih-Mu dengan lantang, meski aku memilih seorang diri. Tahanlah pintu tetap terbuka di belakangku, dan pada waktu-Mu, bawalah seisi rumahku melaluinya. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Joshua 24:15$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Yosua 24:15 TB$q$, 'TB', 1);

  -- Day 2
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    2,
    $q$Sanctifying the Ordinary$q$,
    $q$Menguduskan yang Biasa$q$,
    $q$For about thirty years, the Son of God lived an ordinary family life in a small town. He helped in a workshop, shared meals, obeyed His parents, and grew up inside the rhythms of a home. Of this long stretch the Gospels say almost nothing — only that "he was obedient to them" and "Jesus grew in wisdom and stature, and in favor with God and man." (Luke 2:51-52) The silence itself is a teaching: most of a holy life is hidden, unremarkable, and spent at home.

We tend to imagine that holiness happens in dramatic moments — the mission trip, the mountaintop prayer, the great sacrifice. But Jesus spent the overwhelming majority of His earthly life not preaching or healing, but simply belonging to a family and doing ordinary things well. If the quiet years of Nazareth were good enough for God, then the ordinary years of your own home are not a waste of time. They are holy ground.

This changes how we see the small, repetitive work of family life. The shared meal, the load of laundry, the homework helped with, the unremarkable evening on the couch — none of it is beneath God's notice. In fact, He sanctified exactly this kind of living from the inside, and He meets us in it still.

Today, do not wait for a spiritual moment somewhere else. Look for God in the ordinary hours of your home, and offer even the most routine task to Him. The most sacred thing you do all day may be something no one will ever notice.$q$,
    $q$Selama kira-kira tiga puluh tahun, Putra Allah menjalani hidup keluarga yang biasa di sebuah kota kecil. Ia membantu di bengkel, berbagi makan, menaati orang tua-Nya, dan bertumbuh di dalam irama sebuah rumah. Tentang masa yang panjang ini Injil hampir tak berkata apa pun — hanya bahwa "Ia tetap hidup dalam asuhan mereka" dan "Yesus makin bertambah besar dan bertambah hikmat-Nya, dan makin dikasihi oleh Allah dan manusia." (Lukas 2:51-52) Keheningan itu sendiri adalah pengajaran: sebagian besar hidup yang kudus itu tersembunyi, tak mencolok, dan dihabiskan di rumah.

Kita cenderung membayangkan bahwa kekudusan terjadi dalam momen-momen dramatis — perjalanan misi, doa di puncak gunung, pengorbanan besar. Namun Yesus menghabiskan sebagian besar hidup duniawi-Nya bukan dengan berkhotbah atau menyembuhkan, melainkan sekadar menjadi bagian dari keluarga dan melakukan hal-hal biasa dengan baik. Jika tahun-tahun yang sunyi di Nazaret cukup baik bagi Allah, maka tahun-tahun biasa di rumahmu sendiri bukanlah pemborosan waktu. Itu adalah tanah yang kudus.

Ini mengubah cara kita memandang pekerjaan kecil yang berulang dalam hidup keluarga. Makan bersama, setumpuk cucian, pekerjaan rumah yang dibantu, malam yang tak istimewa di sofa — tak satu pun luput dari perhatian Allah. Bahkan, Ia menguduskan justru cara hidup semacam ini dari dalam, dan Ia menjumpai kita di dalamnya hingga kini.

Hari ini, jangan menunggu sebuah momen rohani di tempat lain. Carilah Allah dalam jam-jam biasa di rumahmu, dan persembahkanlah bahkan tugas yang paling rutin kepada-Nya. Hal paling kudus yang kaulakukan sepanjang hari mungkin adalah sesuatu yang tak akan pernah diperhatikan siapa pun.$q$,
    $q$God sanctified an ordinary home in Nazareth simply by living in it. Offer Him one routine task in your own home today.$q$,
    $q$Allah menguduskan sebuah rumah biasa di Nazaret semata dengan tinggal di dalamnya. Persembahkanlah kepada-Nya satu tugas rutin di rumahmu hari ini.$q$,
    $q$Lord Jesus, You made a home in Nazareth holy simply by living there. Sanctify the ordinary hours of my home too — the meals, the chores, the quiet evenings — and let me find You in them. Amen.$q$,
    $q$Tuhan Yesus, Engkau menguduskan rumah di Nazaret semata dengan tinggal di sana. Kuduskanlah juga jam-jam biasa di rumahku — makan, tugas, malam-malam yang sunyi — dan biarkan aku menemukan-Mu di dalamnya. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Luke 2:51-52$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Lukas 2:51-52 TB$q$, 'TB', 1);

  -- Day 3
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    3,
    $q$Faith Along the Road$q$,
    $q$Iman di Sepanjang Jalan$q$,
    $q$When God told His people how to pass faith to the next generation, He did not prescribe a ceremony or a classroom. He said: "Impress them on your children. Talk about them when you sit at home and when you walk along the road." (Deuteronomy 6:6-7) Faith is handed down not mainly in solemn moments, but in the ordinary in-between spaces of a shared life.

This is good news for tired parents who feel they have no time or training for elaborate religious instruction. You do not need a curriculum. You need to let faith show up naturally in the flow of the day — a mention of God in a normal conversation, an honest answer to a hard question, a prayer whispered at bedtime, a thank-you offered to God out loud in the car. Children absorb far more from what is woven into daily life than from anything formal.

And this is not only about children. Every relationship in a home is shaped over the small, repeated moments — the walk, the meal, the ride, the ordinary talk. The faith and love we want our households to hold are built there, one unremarkable conversation at a time, far more than in any single big event.

Today, let faith surface just once in an ordinary moment with someone in your home — a sentence, a small prayer, a simple why-we-do-this. Small seeds, dropped along the road, are how a household slowly grows toward God.$q$,
    $q$Ketika Allah memberi tahu umat-Nya cara meneruskan iman kepada generasi berikutnya, Ia tidak menetapkan sebuah upacara atau ruang kelas. Ia berkata: "haruslah engkau mengajarkannya berulang-ulang kepada anak-anakmu dan membicarakannya apabila engkau duduk di rumahmu dan apabila engkau berjalan di jalan." (Ulangan 6:6-7) Iman diwariskan bukan terutama dalam momen-momen khusyuk, melainkan dalam ruang-ruang sela biasa dari hidup bersama.

Ini kabar baik bagi orang tua yang lelah dan merasa tak punya waktu atau bekal untuk pengajaran agama yang rumit. Engkau tak butuh kurikulum. Engkau perlu membiarkan iman muncul secara wajar dalam arus hari — sebutan tentang Allah dalam percakapan biasa, jawaban jujur atas pertanyaan yang sulit, doa yang dibisikkan menjelang tidur, ucapan syukur kepada Allah yang dilantangkan di mobil. Anak-anak menyerap jauh lebih banyak dari apa yang terjalin dalam hidup sehari-hari daripada dari hal formal mana pun.

Dan ini bukan hanya tentang anak-anak. Setiap hubungan dalam sebuah rumah dibentuk melalui momen-momen kecil yang berulang — jalan bersama, makan, perjalanan, percakapan biasa. Iman dan kasih yang kita ingin rumah tangga kita pegang dibangun di situ, satu percakapan tak istimewa demi satu percakapan, jauh lebih daripada dalam satu peristiwa besar mana pun.

Hari ini, biarkan iman muncul sekali saja dalam momen biasa bersama seseorang di rumahmu — sebuah kalimat, doa kecil, sebuah alasan-mengapa-kita-melakukan-ini yang sederhana. Benih-benih kecil, yang dijatuhkan di sepanjang jalan, itulah cara sebuah rumah tangga perlahan bertumbuh menuju Allah.$q$,
    $q$Faith passes down in ordinary moments, not just solemn ones. Let it surface once today in a normal conversation at home.$q$,
    $q$Iman diwariskan dalam momen biasa, bukan hanya yang khusyuk. Biarkan ia muncul sekali hari ini dalam percakapan biasa di rumah.$q$,
    $q$Father, I do not always have the words or the time. Let faith slip naturally into the ordinary hours of my home, so that those I love absorb Your goodness without my forcing it. Amen.$q$,
    $q$Bapa, aku tak selalu punya kata-kata atau waktu. Biarkan iman menyelinap secara wajar ke dalam jam-jam biasa di rumahku, agar mereka yang kukasihi menyerap kebaikan-Mu tanpa kupaksakan. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Deuteronomy 6:6-7$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Ulangan 6:6-7 TB$q$, 'TB', 1);

  -- Day 4
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    4,
    $q$Honor Father and Mother$q$,
    $q$Hormati Ayah dan Ibu$q$,
    $q$"Honor your father and your mother" is the one commandment that comes with a promise attached: "so that you may live long in the land." (Exodus 20:12) It is a command we grow into over a lifetime. As children it mostly means obedience. As adults it usually means something harder: patience, presence, and gratitude toward parents who are no longer strong — or the slow work of making peace with parents who were imperfect.

Scripture is tender and honest about the hardest season of this: "My child, help your father in his old age... even if his mind fails, be patient with him." (Sirach 3:12-13) It does not pretend that caring for aging parents is easy. It simply asks for patience, and reminds us that the strength we still have is meant, in part, for those who gave us theirs.

For some, honoring parents is a joy; for others it is complicated, tangled with old wounds. Honor does not mean pretending everything was perfect. Sometimes it takes the form of a visit or a phone call; sometimes, when a parent has passed or a relationship is broken, it takes the form of a prayer for them, or the quiet forgiveness that finally sets your own heart free.

Wherever you stand, reach toward your parents today in whatever way this season allows — with patience where it is hard, gratitude where it is deserved, and forgiveness where it is needed.$q$,
    $q$"Hormatilah ayahmu dan ibumu" adalah satu-satunya perintah yang disertai janji: "supaya lanjut umurmu di tanah yang diberikan TUHAN, Allahmu, kepadamu." (Keluaran 20:12) Ini perintah yang kita tumbuhi seumur hidup. Sebagai anak, ia terutama berarti ketaatan. Sebagai orang dewasa, ia biasanya berarti sesuatu yang lebih berat: kesabaran, kehadiran, dan syukur kepada orang tua yang tak lagi kuat — atau kerja perlahan untuk berdamai dengan orang tua yang tak sempurna.

Kitab Suci berbicara dengan lembut dan jujur tentang musim tersulit dari ini: "Anakku, tolonglah ayahmu di masa tuanya... Sekalipun akalnya berkurang, hendaklah sabar terhadapnya." (Sirakh 3:12-13) Ia tak berpura-pura bahwa merawat orang tua yang menua itu mudah. Ia sekadar meminta kesabaran, dan mengingatkan kita bahwa kekuatan yang masih kita miliki, sebagian, dimaksudkan bagi mereka yang telah memberikan kekuatan mereka.

Bagi sebagian orang, menghormati orang tua adalah sukacita; bagi yang lain ia rumit, terjalin dengan luka lama. Penghormatan tidak berarti berpura-pura bahwa segalanya sempurna. Kadang ia berbentuk kunjungan atau panggilan telepon; kadang, ketika orang tua telah tiada atau hubungan itu patah, ia berbentuk doa bagi mereka, atau pengampunan tenang yang akhirnya membebaskan hatimu sendiri.

Di mana pun engkau berada, ulurkanlah tanganmu kepada orang tuamu hari ini dengan cara apa pun yang diizinkan musim ini — dengan kesabaran di tempat yang sulit, syukur di tempat yang layak, dan pengampunan di tempat yang perlu.$q$,
    $q$Honoring parents grows from obedience into patience, gratitude, and sometimes forgiveness. Reach toward yours today in the way this season allows.$q$,
    $q$Menghormati orang tua bertumbuh dari ketaatan menjadi kesabaran, syukur, dan kadang pengampunan. Ulurkanlah tanganmu kepada orang tuamu hari ini dengan cara yang diizinkan musim ini.$q$,
    $q$Lord, teach me to honor those who raised me — with patience where it is hard, gratitude where it is deserved, and forgiveness where it is needed. Give me a tender heart toward them today. Amen.$q$,
    $q$Tuhan, ajarilah aku menghormati mereka yang membesarkanku — dengan kesabaran di tempat yang sulit, syukur di tempat yang layak, dan pengampunan di tempat yang perlu. Berilah aku hati yang lembut terhadap mereka hari ini. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Exodus 20:12$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Sirach 3:12-13$q$, 'WEB', 1);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Keluaran 20:12 TB$q$, 'TB', 2);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Sirakh 3:12-13 TB$q$, 'TB', 3);

  -- Day 5
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    5,
    $q$Love Is Patient at Home$q$,
    $q$Kasih Itu Sabar di Rumah$q$,
    $q$We usually hear Paul's famous words about love at weddings, dressed in their best. But they are hardest to live not on the wedding day, but on an ordinary tired evening at home, when someone has left the same mess for the third time. "Love is patient, love is kind... it is not easily angered, it keeps no record of wrongs." (1 Corinthians 13:4-5) The family is exactly the place we are most tempted to keep the record — and to read it back at the worst moment.

A home runs on a thousand small, invisible acts of patience that no one ever sees or thanks us for. Love that "keeps no record of wrongs" chooses, again and again, not to bring up the old list, not to win the argument by reciting history. This is not weakness or being a pushover. It is one of the strongest and most Christlike things a person can do.

Try reading the passage again slowly, but put your own name where the word "love" appears: "[Your name] is patient, [your name] is kind, [your name] keeps no record of wrongs." Suddenly it stops being poetry and becomes a mirror — an honest look at how you actually treat the people you live with.

Today, catch yourself just once before you reach for the record of wrongs, and set it down. Let one small thing go, unrecorded, for the peace of your home. That is love, quietly doing its daily work.$q$,
    $q$Kita biasanya mendengar kata-kata masyhur Paulus tentang kasih di pesta pernikahan, dalam pakaian terbaiknya. Namun kata-kata itu paling sulit dihidupi bukan pada hari pernikahan, melainkan pada suatu malam biasa yang melelahkan di rumah, ketika seseorang meninggalkan kekacauan yang sama untuk ketiga kalinya. "Kasih itu sabar; kasih itu murah hati... Ia tidak pemarah dan tidak menyimpan kesalahan orang lain." (1 Korintus 13:4-5) Keluarga justru tempat kita paling tergoda untuk menyimpan catatan itu — dan membacakannya kembali pada saat yang paling buruk.

Sebuah rumah berjalan di atas seribu tindakan kesabaran kecil yang tak tampak, yang tak pernah dilihat atau disyukuri siapa pun untuk kita. Kasih yang "tidak menyimpan kesalahan orang lain" memilih, berulang kali, untuk tidak mengungkit daftar lama, untuk tidak memenangkan pertengkaran dengan membacakan sejarah. Ini bukan kelemahan atau sikap lemah. Ini salah satu hal terkuat dan paling menyerupai Kristus yang bisa dilakukan seseorang.

Cobalah membaca bacaan itu kembali perlahan, tetapi letakkan namamu sendiri di tempat kata "kasih" muncul: "[Namamu] itu sabar, [namamu] itu murah hati, [namamu] tidak menyimpan kesalahan." Tiba-tiba ia berhenti menjadi puisi dan menjadi cermin — pandangan jujur atas caramu sesungguhnya memperlakukan orang-orang yang tinggal bersamamu.

Hari ini, tangkaplah dirimu sekali saja sebelum kau meraih catatan kesalahan itu, dan letakkanlah. Relakan satu hal kecil, tanpa dicatat, demi damai rumahmu. Itulah kasih, yang dengan tenang mengerjakan tugas hariannya.$q$,
    $q$The home is where we are most tempted to keep a record of wrongs. Catch yourself once today, and set one small thing down for the peace of your household.$q$,
    $q$Rumah adalah tempat kita paling tergoda menyimpan catatan kesalahan. Tangkaplah dirimu sekali hari ini, dan letakkanlah satu hal kecil demi damai rumah tanggamu.$q$,
    $q$Lord, at home I keep a record I should have torn up long ago. Help me set it down today. Make me patient with the ones I live with, and slow to recite their faults. Amen.$q$,
    $q$Tuhan, di rumah aku menyimpan catatan yang seharusnya sudah lama kurobek. Tolonglah aku meletakkannya hari ini. Jadikanlah aku sabar terhadap mereka yang tinggal bersamaku, dan lambat untuk membacakan kesalahan mereka. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$1 Corinthians 13:4-5$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$1 Korintus 13:4-5 TB$q$, 'TB', 1);

  -- Day 6
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    6,
    $q$Forgive as You've Been Forgiven$q$,
    $q$Mengampuni seperti Engkau Telah Diampuni$q$,
    $q$No family shares a life without wounding one another. The people who know best how to comfort us also know exactly how to hurt us, because they know us so well. So the real question is never whether hurt will happen at home, but whether forgiveness will follow it. Paul writes: "Bear with each other and forgive one another... And over all these virtues put on love, which binds them all together in perfect unity." (Colossians 3:13-14)

Notice the order: bear with each other, then forgive, then over it all put on love. Love is not what removes the need for patience and forgiveness in a family — it is what holds them together, the outer garment that keeps the household from coming apart at the seams. A home where grievances are collected but never released slowly hardens into something cold. Forgiveness is the daily maintenance that keeps family love alive.

And the standard is a high and freeing one: we forgive one another "as the Lord forgave you" — not as the other person has earned it, not after they have suffered enough, but freely, the way we ourselves have been forgiven by God more times than we can count. The mercy you have already received is the measure of the mercy you are now asked to give.

Is there a grievance you are still holding against someone in your home— Bring it to God today, ask for the grace to forgive it the way you have been forgiven, and, if you can, take one small step to release it in person.$q$,
    $q$Tak ada keluarga yang berbagi hidup tanpa saling melukai. Orang-orang yang paling tahu cara menghibur kita juga tahu persis cara menyakiti kita, karena mereka begitu mengenal kita. Maka pertanyaan yang sesungguhnya bukanlah apakah luka akan terjadi di rumah, melainkan apakah pengampunan akan menyusulnya. Paulus menulis: "Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain... Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan." (Kolose 3:13-14)

Perhatikan urutannya: sabar seorang terhadap yang lain, lalu mengampuni, lalu di atas semuanya mengenakan kasih. Kasih bukanlah yang meniadakan kebutuhan akan kesabaran dan pengampunan dalam keluarga — melainkan yang menyatukannya, pakaian luar yang menjaga rumah tangga agar tidak terurai pada jahitannya. Sebuah rumah yang mengumpulkan dendam namun tak pernah melepaskannya perlahan mengeras menjadi sesuatu yang dingin. Pengampunan adalah perawatan harian yang menjaga kasih keluarga tetap hidup.

Dan ukurannya tinggi sekaligus membebaskan: kita saling mengampuni "sama seperti Tuhan telah mengampuni kamu" — bukan sesuai apa yang telah diusahakan orang lain, bukan setelah ia cukup menderita, melainkan dengan cuma-cuma, sebagaimana kita sendiri telah diampuni Allah lebih sering daripada yang bisa kita hitung. Belas kasih yang telah kauterima adalah ukuran belas kasih yang kini diminta darimu.

Adakah dendam yang masih kausimpan terhadap seseorang di rumahmu— Bawalah itu kepada Allah hari ini, mintalah rahmat untuk mengampuninya sebagaimana engkau telah diampuni, dan, jika kaubisa, ambillah satu langkah kecil untuk melepaskannya secara langsung.$q$,
    $q$Forgiveness is the daily maintenance that keeps family love alive. Forgive as you have been forgiven — freely, before it is earned.$q$,
    $q$Pengampunan adalah perawatan harian yang menjaga kasih keluarga tetap hidup. Ampunilah sebagaimana engkau telah diampuni — dengan cuma-cuma, sebelum ia diusahakan.$q$,
    $q$Lord, You forgave me before I deserved it, more times than I can count. Give me the grace to forgive the one in my home the same way, and to lay down the grievance I have been holding. Amen.$q$,
    $q$Tuhan, Engkau mengampuniku sebelum aku layak, lebih sering daripada yang bisa kuhitung. Berilah aku rahmat untuk mengampuni orang di rumahku dengan cara yang sama, dan meletakkan dendam yang selama ini kusimpan. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Colossians 3:13-14$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Kolose 3:13-14 TB$q$, 'TB', 1);

  -- Day 7
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    7,
    $q$The Table We Share$q$,
    $q$Meja yang Kita Bagi$q$,
    $q$The first Christians did not build grand institutions before they built shared tables. Their faith grew in homes, around meals: "They broke bread in their homes and ate together with glad and sincere hearts, praising God." (Acts 2:46-47) The family gathered around a table was the original church, and that table was its altar of ordinary grace. The psalmist sang of the same gift: "How good and pleasant it is when God's people live together in unity!" (Psalm 133:1)

There is something quietly powerful about a family that eats together, prays together, and gives thanks together. In a world that pulls every household in a dozen directions at once, the simple discipline of a shared meal — phones set down, a grace said, faces actually present — becomes a small act of resistance and a real means of grace. It is where a family remembers, day after day, that it is one thing and not merely several busy people under one roof.

This is how ordinary homes are slowly made holy — not by grand gestures, but by unity practiced at the table, gladness shared, thanks offered together. Across these seven days we have seen it from every angle: someone choosing God first, the ordinary made sacred, faith passed along the road, parents honored, patience kept, forgiveness given. All of it comes home to this — a family, gathered, in love.

As this plan closes, recover one shared moment this week — a meal eaten together without screens, begun with a short grace and glad hearts. It does not need to be elaborate. The first Christians changed the world from exactly such tables, and God can do quiet, world-changing things at yours.$q$,
    $q$Umat Kristen perdana tidak membangun lembaga megah sebelum mereka membangun meja bersama. Iman mereka bertumbuh di rumah-rumah, di seputar makan: "...dan secara bergilir makan bersama-sama di rumah masing-masing dengan gembira dan dengan tulus hati, sambil memuji Allah." (Kisah Para Rasul 2:46-47) Keluarga yang berkumpul di sekeliling meja adalah gereja yang mula-mula, dan meja itu adalah altar rahmat sederhananya. Sang pemazmur menyanyikan karunia yang sama: "Sungguh, alangkah baiknya dan indahnya, apabila saudara-saudara diam bersama dengan rukun!" (Mazmur 133:1)

Ada kekuatan yang tenang dalam keluarga yang makan bersama, berdoa bersama, dan bersyukur bersama. Di dunia yang menarik setiap rumah tangga ke belasan arah sekaligus, disiplin sederhana dari satu makan bersama — ponsel diletakkan, doa diucapkan, wajah-wajah sungguh hadir — menjadi tindakan perlawanan kecil dan sarana rahmat yang nyata. Di situlah keluarga mengingat, hari demi hari, bahwa ia adalah satu kesatuan dan bukan sekadar beberapa orang sibuk di bawah satu atap.

Beginilah rumah-rumah biasa perlahan dijadikan kudus — bukan oleh gerakan besar, melainkan oleh kerukunan yang dipraktikkan di meja, kegembiraan yang dibagi, syukur yang dipersembahkan bersama. Sepanjang tujuh hari ini kita telah melihatnya dari segala sudut: seseorang memilih Allah lebih dahulu, yang biasa dijadikan kudus, iman yang diteruskan di sepanjang jalan, orang tua yang dihormati, kesabaran yang dijaga, pengampunan yang diberikan. Semuanya bermuara ke sini — sebuah keluarga, berkumpul, dalam kasih.

Saat devosi ini ditutup, rebutlah kembali satu momen bersama minggu ini — satu makan bersama tanpa layar, dibuka dengan doa singkat dan hati yang gembira. Ia tak perlu mewah. Umat Kristen perdana mengubah dunia justru dari meja-meja semacam itu, dan Allah dapat melakukan hal-hal tenang yang mengubah dunia di mejamu.$q$,
    $q$The shared family table is a small altar of grace. Recover one meal together this week — no screens, a grace said, glad hearts.$q$,
    $q$Meja keluarga yang dibagi adalah altar rahmat kecil. Rebutlah kembali satu makan bersama minggu ini — tanpa layar, doa diucapkan, hati yang gembira.$q$,
    $q$Father, gather my family around one table this week, with glad and sincere hearts. Make our shared meals small altars where we remember You, and remember that we belong to each other. Amen.$q$,
    $q$Bapa, kumpulkanlah keluargaku di satu meja minggu ini, dengan hati yang gembira dan tulus. Jadikanlah makan bersama kami altar-altar kecil tempat kami mengingat-Mu, dan mengingat bahwa kami saling memiliki. Amin.$q$
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Acts 2:46-47$q$, 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Psalm 133:1$q$, 'WEB', 1);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Kisah Para Rasul 2:46-47 TB$q$, 'TB', 2);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$Mazmur 133:1 TB$q$, 'TB', 3);

END $$;
