
-- 044_seed_devotions_family.sql
-- Seeds the "Family" devotion category tree and plans
-- from Gallery/Devotional/family_devotions.csv.

DO $$
DECLARE
  v_family_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Top-level category ------------------------------------------------------
  SELECT id INTO v_family_id FROM public.devotion_categories
    WHERE name = 'Family' AND parent_id IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_family_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Family', 'Keluarga', NULL)
      RETURNING id INTO v_family_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Keluarga'
      WHERE id = v_family_id;
  END IF;

  DELETE FROM public.devotion_plans WHERE title = 'Held in the Waiting';
  DELETE FROM public.devotion_plans WHERE title = 'Letting Go of the Map';
  DELETE FROM public.devotion_plans WHERE title = 'Bread for the Unknown Road';
  DELETE FROM public.devotion_plans WHERE title = 'Faith When the Paycheck Doesn''t Stretch';
  DELETE FROM public.devotion_plans WHERE title = 'Strength for the Weary Body';
  DELETE FROM public.devotion_plans WHERE title = 'When Heaven Feels Silent';
  DELETE FROM public.devotion_plans WHERE title = 'Small Beginnings: A Daily Prayer Habit';
  DELETE FROM public.devotion_plans WHERE title = 'Bread for the Journey: Growing Through Scripture';
  DELETE FROM public.devotion_plans WHERE title = 'Roots in Dry Ground: Faith That Matures';
  DELETE FROM public.devotion_plans WHERE title = 'When God Feels Silent';
  DELETE FROM public.devotion_plans WHERE title = 'Honest Questions, Held Faith';
  DELETE FROM public.devotion_plans WHERE title = 'Finding My Way Back';


  -- Sub-category: Trusting God in Uncertainty --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Trusting God in Uncertainty' AND parent_id = v_family_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Trusting God in Uncertainty', 'Percaya kepada Allah dalam Ketidakpastian', v_family_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Percaya kepada Allah dalam Ketidakpastian'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Held in the Waiting
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Held in the Waiting',
    'Ditopang dalam Penantian',
    'Finding God''s peace in the space between prayer and answer',
    'Menemukan damai Allah dalam jarak antara doa dan jawaban',
    5,
    'A five-day journey for anyone stuck in a waiting room they didn''t choose — a job search, a diagnosis, a relationship, a prayer that hasn''t been answered yet. Each day gently turns the ache of delay into an invitation to trust the character of the God who holds the timeline, not just the outcome.',
    'Perjalanan lima hari bagi siapa saja yang terjebak di ruang tunggu yang tidak mereka pilih — pencarian kerja, diagnosis, hubungan, atau doa yang belum terjawab. Setiap hari dengan lembut mengubah kegelisahan karena penundaan menjadi undangan untuk percaya pada karakter Allah yang memegang waktu, bukan hanya hasil akhirnya.',
    '/images/devotions/held-in-the-waiting.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Ache of Waiting', 'Kerinduan dalam Penantian',
    'There is a particular kind of tiredness that comes from waiting. It is not the tiredness of hard labor but the tiredness of holding your breath for a long time — checking the phone, replaying the conversation, wondering if today is the day the answer finally comes. Waiting seasons rarely announce how long they will last, and that uncertainty is often harder to carry than the waiting itself.

Scripture never pretends that waiting is easy. The psalmists cried out, the prophets grew weary, and even Jesus'' closest friends spent three long days between the cross and the empty tomb not knowing what would happen next. If the Bible is honest about anything, it is honest about how long God''s people have had to wait for what He promised. This is not a flaw in the story; it is part of the story.

Isaiah 40:31 does not promise that the waiting will be short. It promises that those who wait will be renewed — not despite the waiting, but through it. There is something being built in us during delay that cannot be built any other way: a deeper trust, a slower heart, a strength that does not depend on circumstances lining up in our favor. God is not simply making us wait; He is meeting us in the waiting.

Today, if you are in a season where the answer has not come, let this be permission to name the ache honestly before God. He is not offended by your impatience or your exhaustion. He is near to it, ready to exchange your borrowed strength for His own.', 'Ada semacam kelelahan tersendiri yang datang dari menanti. Ini bukan kelelahan karena kerja keras, melainkan kelelahan karena menahan napas untuk waktu yang lama — memeriksa ponsel, mengulang percakapan dalam pikiran, bertanya-tanya apakah hari ini jawabannya akhirnya datang. Musim penantian jarang memberi tahu berapa lama ia akan berlangsung, dan ketidakpastian itu sering kali lebih berat dipikul daripada penantian itu sendiri.

Alkitab tidak pernah berpura-pura bahwa menanti itu mudah. Pemazmur berseru, para nabi menjadi lelah, dan bahkan sahabat-sahabat terdekat Yesus menghabiskan tiga hari panjang antara salib dan kubur kosong tanpa tahu apa yang akan terjadi selanjutnya. Jika Alkitab jujur tentang sesuatu, ia jujur tentang betapa lamanya umat Allah harus menanti apa yang Ia janjikan. Ini bukan kekurangan dalam kisah itu; ini bagian dari kisah itu.

Yesaya 40:31 tidak menjanjikan bahwa penantian akan singkat. Ia menjanjikan bahwa mereka yang menanti akan dipulihkan — bukan meski menanti, melainkan justru melalui penantian itu. Ada sesuatu yang sedang dibentuk dalam diri kita selama masa tunda yang tidak dapat dibentuk dengan cara lain: kepercayaan yang lebih dalam, hati yang lebih tenang, kekuatan yang tidak bergantung pada keadaan yang berpihak pada kita. Allah tidak sekadar membuat kita menunggu; Ia menemui kita dalam penantian itu.

Hari ini, jika engkau berada dalam musim di mana jawaban belum juga datang, biarlah ini menjadi izin untuk menyebut kegelisahan itu dengan jujur di hadapan Allah. Ia tidak tersinggung oleh ketidaksabaranmu atau keletihanmu. Ia dekat dengan itu semua, siap menukar kekuatanmu yang meminjam dengan kekuatan-Nya sendiri.',
    'What would it look like today to hand God your exhaustion instead of just your request?', 'Seperti apa jadinya hari ini jika engkau menyerahkan keletihanmu kepada Allah, bukan hanya permintaanmu?',
    'Lord, I am tired of waiting and I don''t know how much longer this season will last. Please renew my strength today, not by ending the wait, but by meeting me inside it. Teach me to trust Your timing even when I cannot see Your plan. Amen.', 'Tuhan, aku lelah menanti dan aku tidak tahu berapa lama lagi musim ini akan berlangsung. Pulihkanlah kekuatanku hari ini, bukan dengan mengakhiri penantian ini, tetapi dengan menemuiku di dalamnya. Ajarlah aku untuk percaya pada waktu-Mu sekalipun aku belum bisa melihat rencana-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 40:31', 'WEB', 'but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 40:31', 'TB', 'tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Waiting Without Losing Heart', 'Menanti Tanpa Kehilangan Hati',
    'One of the quiet dangers of a long wait is not that we stop believing God exists, but that we slowly stop expecting Him to move. We keep going through the motions of faith while our hearts grow guarded, protecting ourselves from another disappointment. It feels safer to expect less. Many of us know this instinct well — the quiet decision to stop hoping so hard, just in case.

Psalm 27 was written by someone surrounded by real trouble, not someone with an easy life who could afford to be patient. David writes about enemies, about fear, about the very real possibility of falling. And in the middle of that chapter, after describing his confidence in God''s goodness, he gives himself — and us — a command: wait for the Lord, be strong, take heart, and wait for the Lord again. He says it twice, as if he knows how easily we drift.

Notice that waiting, in this psalm, is not passive. It is paired with strength and courage. Biblical waiting is not sitting in a corner with folded hands, hoping something happens. It is an active posture of the heart — choosing, again and again, to keep believing God is good even when the evidence has not yet arrived. That kind of waiting takes more strength than most people realize, because it means resisting the pull toward cynicism every single day.

If your heart has grown guarded during this season, today is a good day to notice it without shame and to ask God to soften it again. Taking heart is not naivety. It is a decision to keep believing that the God who has been faithful before will be faithful again.', 'Salah satu bahaya diam-diam dari penantian yang panjang bukanlah kita berhenti percaya bahwa Allah ada, melainkan kita perlahan berhenti mengharapkan Ia bertindak. Kita terus menjalani rutinitas iman sementara hati kita mulai berjaga-jaga, melindungi diri dari kekecewaan berikutnya. Rasanya lebih aman untuk berharap lebih sedikit. Banyak dari kita mengenal betul dorongan ini — keputusan diam-diam untuk berhenti berharap terlalu keras, siapa tahu kecewa lagi.

Mazmur 27 ditulis oleh seseorang yang dikelilingi kesulitan nyata, bukan oleh orang yang hidupnya mudah sehingga bisa bersabar dengan santai. Daud menulis tentang musuh, tentang ketakutan, tentang kemungkinan nyata untuk jatuh. Dan di tengah pasal itu, setelah menggambarkan keyakinannya pada kebaikan Allah, ia memberi dirinya sendiri — dan kita — sebuah perintah: nantikanlah TUHAN, kuatkan dan teguhkanlah hatimu, lalu nantikanlah TUHAN sekali lagi. Ia mengatakannya dua kali, seolah tahu betapa mudahnya kita mulai menyimpang.

Perhatikan bahwa penantian, dalam mazmur ini, bukanlah sikap pasif. Ia dipasangkan dengan kekuatan dan keberanian. Penantian alkitabiah bukanlah duduk di sudut dengan tangan terlipat, berharap sesuatu terjadi. Ini adalah sikap hati yang aktif — memilih, berulang-ulang, untuk terus percaya bahwa Allah itu baik sekalipun buktinya belum tiba. Penantian semacam itu membutuhkan lebih banyak kekuatan daripada yang disadari kebanyakan orang, karena itu berarti melawan dorongan menuju sikap sinis setiap hari.

Jika hatimu mulai berjaga-jaga selama musim ini, hari ini adalah hari yang baik untuk menyadarinya tanpa rasa malu dan meminta Allah melembutkannya kembali. Meneguhkan hati bukanlah kepolosan. Itu adalah keputusan untuk terus percaya bahwa Allah yang setia di masa lalu akan setia lagi.',
    'Has your heart quietly stopped expecting God to move? Ask Him to soften it again today.', 'Apakah hatimu diam-diam berhenti mengharapkan Allah bertindak? Mintalah Ia melembutkannya kembali hari ini.',
    'Father, I confess that I have started guarding my heart against disappointment instead of trusting You with it. Give me the courage to keep hoping. Strengthen me to wait well, not passively, but actively believing in Your goodness. Amen.', 'Bapa, aku mengaku bahwa aku mulai menjaga hatiku dari kekecewaan alih-alih mempercayakannya kepada-Mu. Berilah aku keberanian untuk terus berharap. Kuatkanlah aku untuk menanti dengan baik, bukan secara pasif, melainkan dengan aktif percaya pada kebaikan-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 27:14', 'WEB', 'Wait for the LORD; be strong and take heart and wait for the LORD.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 27:14', 'TB', 'Nantikanlah TUHAN! Kuatkan dan teguhkanlah hatimu! Ya, nantikanlah TUHAN!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'The Silence Isn''t Absence', 'Keheningan Bukan Berarti Ketiadaan',
    'The Book of Lamentations is an unlikely place to look for hope. It is a book of grief, written in the ruins of a city that had lost everything. And yet right in the middle of that devastation, the writer pauses and says something startling: the Lord is good to those who hope in Him. Not despite the ruins — in the middle of them.

Silence is one of the hardest parts of waiting. When we don''t hear anything from God, we can start to interpret that silence as absence, as if He has stepped away or stopped caring. But Scripture consistently shows the opposite pattern: God is often doing His deepest work in the quiet, unseen places, long before anything visible changes. The years Joseph spent forgotten in an Egyptian prison were not wasted years; they were preparation years, even though he could not have known it at the time.

This verse in Lamentations pairs God''s goodness with quiet waiting — ''it is good to wait quietly for the salvation of the LORD.'' Quiet here does not mean numb or resigned. It means a settled trust that does not need constant reassurance to keep believing. It is the difference between a child who panics every time a parent leaves the room and a child who has learned, through years of being cared for, that the parent always comes back.

If this season feels silent, consider that silence is not the same as absence. God''s goodness does not depend on how loudly He is speaking to you right now. It depends on who He has always been — and He has not changed.', 'Kitab Ratapan adalah tempat yang tak terduga untuk mencari harapan. Ini adalah kitab dukacita, ditulis di reruntuhan sebuah kota yang telah kehilangan segalanya. Namun tepat di tengah kehancuran itu, sang penulis berhenti sejenak dan mengatakan sesuatu yang mengejutkan: TUHAN itu baik bagi orang yang berharap kepada-Nya. Bukan meski di reruntuhan — justru di tengah-tengahnya.

Keheningan adalah salah satu bagian tersulit dari penantian. Ketika kita tidak mendengar apa pun dari Allah, kita bisa mulai menafsirkan keheningan itu sebagai ketiadaan, seolah Ia menjauh atau berhenti peduli. Namun Alkitab secara konsisten menunjukkan pola sebaliknya: Allah sering melakukan karya-Nya yang paling dalam di tempat-tempat sunyi yang tak terlihat, jauh sebelum ada perubahan yang tampak. Bertahun-tahun yang Yusuf habiskan terlupakan di penjara Mesir bukanlah tahun yang sia-sia; itu adalah tahun-tahun persiapan, meskipun ia tidak dapat mengetahuinya saat itu.

Ayat dalam Ratapan ini memadukan kebaikan Allah dengan penantian yang tenang — ''adalah baik menanti dengan diam pertolongan TUHAN.'' Diam di sini bukan berarti mati rasa atau pasrah tanpa daya. Ini berarti kepercayaan yang mantap, yang tidak memerlukan jaminan terus-menerus untuk tetap percaya. Ini adalah perbedaan antara anak yang panik setiap kali orang tuanya meninggalkan ruangan dan anak yang telah belajar, melalui bertahun-tahun dirawat, bahwa orang tuanya selalu kembali.

Jika musim ini terasa sunyi, pertimbangkanlah bahwa keheningan tidak sama dengan ketiadaan. Kebaikan Allah tidak bergantung pada seberapa keras Ia berbicara kepadamu saat ini. Itu bergantung pada siapa Dia selalu ada — dan Dia tidak berubah.',
    'Where in your life have you mistaken God''s silence for His absence?', 'Di bagian mana dalam hidupmu engkau salah mengira keheningan Allah sebagai ketiadaan-Nya?',
    'Lord, when I hear nothing from You, help me remember that You are still working even when I cannot see or hear it. Give me a quiet, settled trust instead of anxious striving. You are good, even in the silence. Amen.', 'Tuhan, ketika aku tidak mendengar apa-apa dari-Mu, tolonglah aku mengingat bahwa Engkau tetap bekerja walau aku tak dapat melihat atau mendengarnya. Berilah aku kepercayaan yang tenang dan mantap, bukan usaha yang cemas. Engkau baik, bahkan dalam keheningan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lamentations 3:25-26', 'WEB', 'The LORD is good to those whose hope is in him, to the one who seeks him; it is good to wait quietly for the salvation of the LORD.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ratapan 3:25-26', 'TB', 'TUHAN itu baik bagi orang yang berharap kepada-Nya, bagi jiwa yang mencari Dia. Adalah baik menanti dengan diam pertolongan TUHAN.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Hope That Watches the Horizon', 'Harapan yang Menatap Ufuk',
    'There is a difference between waiting and watching. Waiting can be passive, even resentful, counting the days until something is over. Watching is different — it is waiting with your eyes open, expecting that something is coming, even if you can''t see it yet. Psalm 130 gives us the image of a watchman, someone whose job depends on staying alert through the long, uncertain hours of the night.

The psalmist says his whole being waits for the Lord, more than watchmen wait for the morning. Anyone who has stayed up through a hard night — with a sick child, a worried mind, or simply insomnia — knows the particular ache of watching the clock and longing for daylight. The watchman doesn''t know exactly when dawn will break, but he knows it will. His confidence isn''t in the clock; it''s in the sun''s faithful pattern of rising.

That is the posture this psalm invites us into: not certainty about timing, but certainty about God''s character. We may not know exactly when our answer will come, our circumstances will shift, or our prayer will be resolved. But we can know, the way a watchman knows the sun will rise, that God''s word can be trusted and His faithfulness does not run out.

Today, try shifting from waiting to watching. Instead of simply enduring the hours, look for God''s small movements in the details of your day — a timely word from a friend, an unexpected provision, a moment of unexplained peace. These are often the first light before the full dawn.', 'Ada perbedaan antara menanti dan berjaga-jaga. Menanti bisa bersifat pasif, bahkan penuh kejengkelan, menghitung hari sampai sesuatu berakhir. Berjaga-jaga berbeda — itu adalah menanti dengan mata terbuka, mengharapkan sesuatu akan datang, sekalipun belum bisa dilihat. Mazmur 130 memberi kita gambaran seorang penjaga malam, seseorang yang pekerjaannya bergantung pada tetap waspada melewati jam-jam malam yang panjang dan tak pasti.

Pemazmur berkata seluruh jiwanya menanti TUHAN, lebih dari penjaga-penjaga malam menanti pagi. Siapa pun yang pernah begadang melewati malam yang berat — dengan anak yang sakit, pikiran yang cemas, atau sekadar sulit tidur — tahu betul kegelisahan khusus saat menatap jam dan merindukan siang. Penjaga malam tidak tahu persis kapan fajar akan menyingsing, tetapi ia tahu itu akan tiba. Keyakinannya bukan pada jam, melainkan pada pola matahari yang setia terbit.

Itulah sikap yang diundang oleh mazmur ini kepada kita: bukan kepastian tentang waktu, melainkan kepastian tentang karakter Allah. Kita mungkin tidak tahu persis kapan jawaban kita akan datang, keadaan kita akan berubah, atau doa kita akan terselesaikan. Tetapi kita dapat tahu, sebagaimana penjaga malam tahu matahari akan terbit, bahwa firman Allah dapat dipercaya dan kesetiaan-Nya tidak pernah habis.

Hari ini, cobalah beralih dari menanti menjadi berjaga-jaga. Alih-alih sekadar bertahan melewati jam demi jam, carilah gerak kecil Allah dalam detail harimu — kata-kata yang tepat waktu dari seorang teman, penyediaan yang tak terduga, momen damai yang tak terjelaskan. Ini sering kali adalah cahaya pertama sebelum fajar penuh tiba.',
    'What small signs of God''s presence might you be missing because you''re only counting the hours instead of watching for Him?', 'Tanda-tanda kecil kehadiran Allah apa yang mungkin terlewat olehmu karena engkau hanya menghitung jam, bukan menantikan Dia?',
    'Lord, turn my passive waiting into active watching. Open my eyes to see You at work even in small, ordinary moments today. I put my hope in Your word, not in my ability to predict what happens next. Amen.', 'Tuhan, ubahlah penantianku yang pasif menjadi sikap berjaga-jaga yang aktif. Bukalah mataku untuk melihat-Mu bekerja bahkan dalam momen-momen kecil dan biasa hari ini. Aku menaruh harapanku pada firman-Mu, bukan pada kemampuanku menebak apa yang akan terjadi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 130:5', 'WEB', 'I wait for the LORD, my whole being waits, and in his word I put my hope.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 130:5', 'TB', 'Aku menanti-nantikan TUHAN, jiwaku menanti-nanti, dan aku mengharapkan firman-Nya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Patience as a Form of Trust', 'Kesabaran sebagai Wujud Kepercayaan',
    'By the final day of a devotional like this, it would be nice if the answer had arrived — the job offer, the test results, the resolution we''ve been praying for. But real life rarely wraps up on our schedule. Some of us will close this week still in the exact same waiting room we started in. If that''s you, this last day is for you especially.

Paul writes in Romans 8 about hoping for what we do not yet see, and waiting for it patiently. He connects hope directly to patience, as if the two cannot really be separated. Real hope is not wishful thinking that fades the moment things get hard; it is a steady confidence that produces endurance, because it is rooted in who God is rather than in how quickly things resolve.

It''s worth remembering that patience, in Scripture, is never framed as a weakness or a consolation prize for people who couldn''t get what they wanted faster. It is listed among the fruit of the Spirit — a genuine mark of a life being shaped by God. Every long wait you endure with your eyes on Him is not wasted time; it is patience being grown in you, the very character of Christ taking deeper root.

So as this week closes, let this be your commitment: not that the waiting will end today, but that you will keep hoping anyway. You will keep bringing your unanswered questions to God, keep watching for His movement, and keep trusting that the God who has walked with His people through every long night in history has not forgotten you in yours.', 'Pada hari terakhir renungan seperti ini, akan menyenangkan jika jawabannya sudah tiba — tawaran kerja, hasil pemeriksaan, penyelesaian yang telah kita doakan. Namun kehidupan nyata jarang selesai sesuai jadwal kita. Beberapa dari kita akan mengakhiri minggu ini masih berada di ruang tunggu yang sama persis dengan tempat kita memulai. Jika itu dirimu, hari terakhir ini secara khusus untukmu.

Paulus menulis dalam Roma 8 tentang mengharapkan apa yang belum kita lihat, dan menantikannya dengan tekun. Ia menghubungkan harapan langsung dengan kesabaran, seolah keduanya tidak dapat benar-benar dipisahkan. Harapan yang sejati bukanlah angan-angan yang pudar begitu keadaan menjadi sulit; itu adalah keyakinan yang teguh yang menghasilkan ketekunan, karena berakar pada siapa Allah, bukan pada seberapa cepat keadaan terselesaikan.

Perlu diingat bahwa kesabaran, dalam Alkitab, tidak pernah digambarkan sebagai kelemahan atau hadiah hiburan bagi orang yang tidak bisa mendapatkan keinginannya lebih cepat. Ia termasuk dalam buah Roh — tanda sejati dari kehidupan yang sedang dibentuk oleh Allah. Setiap penantian panjang yang kau tanggung dengan mata tertuju kepada-Nya bukanlah waktu yang sia-sia; itu adalah kesabaran yang sedang bertumbuh dalam dirimu, karakter Kristus sendiri yang mengakar lebih dalam.

Jadi saat minggu ini berakhir, biarlah ini menjadi komitmenmu: bukan bahwa penantian akan berakhir hari ini, melainkan bahwa engkau akan tetap berharap. Engkau akan terus membawa pertanyaan yang belum terjawab kepada Allah, terus menantikan gerak-Nya, dan terus percaya bahwa Allah yang telah menyertai umat-Nya melalui setiap malam panjang dalam sejarah tidak melupakanmu dalam malammu sendiri.',
    'Even if nothing changes today, what would it mean to keep hoping anyway?', 'Sekalipun tidak ada yang berubah hari ini, apa artinya jika engkau tetap terus berharap?',
    'God, I don''t know when this waiting will end, but I choose to keep hoping in You. Grow patience in me that I could not grow on my own. Thank You for staying with me through every long night. I trust You with what I cannot yet see. Amen.', 'Allah, aku tidak tahu kapan penantian ini akan berakhir, tetapi aku memilih untuk tetap berharap kepada-Mu. Tumbuhkanlah dalam diriku kesabaran yang tidak dapat kutumbuhkan sendiri. Terima kasih karena tetap menyertaiku melewati setiap malam yang panjang. Aku memercayakan kepada-Mu apa yang belum bisa kulihat. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 8:25', 'WEB', 'But if we hope for what we do not yet have, we wait for it patiently.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 8:25', 'TB', 'Tetapi jika kita mengharapkan apa yang tidak kita lihat, kita menantikannya dengan tekun.');

  -- Plan: Letting Go of the Map
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Letting Go of the Map',
    'Melepaskan Peta Sendiri',
    'Surrendering your plans to a God who sees further than you',
    'Menyerahkan rencanamu kepada Allah yang melihat lebih jauh',
    3,
    'A short, focused three-day reset for the planner, the control-keeper, the five-year-plan maker whose plans just fell apart. Rooted in classic wisdom and gospel teaching, this plan helps you open your clenched hands and trade your map for the guidance of the One who already knows the road.',
    'Reset singkat dan terfokus selama tiga hari bagi si perencana, si penjaga kendali, pembuat rencana lima tahun yang rencananya baru saja berantakan. Berakar pada hikmat klasik dan pengajaran Injil, renungan ini membantumu membuka genggaman tanganmu dan menukar petamu dengan tuntunan Dia yang sudah tahu jalannya.',
    '/images/devotions/letting-go-of-the-map.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'When Our Plans Aren''t the Plan', 'Ketika Rencana Kita Bukan Rencana-Nya',
    'Most of us like to think of ourselves as reasonably good planners. We map out the next steps, weigh the options, do the research, and build something we''re confident in. There is nothing wrong with planning — Scripture is full of wisdom about diligence and foresight. But there is a particular kind of grief that comes when a plan we worked hard on falls apart anyway, despite our best effort and best intentions.

Proverbs 3:5-6 is one of the most quoted verses in the Bible for a reason: it names exactly this tension. Trust in the Lord with all your heart, and lean not on your own understanding. Notice it doesn''t say our understanding is worthless — it says don''t lean on it entirely, as though it''s the only support we need. Our understanding is limited by definition; we can only see the road behind us and a short stretch ahead. God sees the whole terrain.

This isn''t a call to stop thinking or planning altogether. It''s a call to hold our plans with open hands rather than clenched fists — to submit them to God in all our ways, as the verse says, so that He can straighten the path even when our own map turns out to be wrong. Many of us have looked back on a season where a plan fell through and later recognized, with some surprise, that the detour turned out to be exactly where we needed to be.

Today, consider the plan you''re holding most tightly right now. Not to abandon it, but to genuinely offer it to God — asking Him to redirect it if your understanding has led you somewhere He never intended.', 'Kebanyakan dari kita suka menganggap diri sebagai perencana yang cukup baik. Kita memetakan langkah selanjutnya, menimbang pilihan, melakukan riset, dan membangun sesuatu yang kita yakini. Tidak ada yang salah dengan merencanakan — Alkitab penuh dengan hikmat tentang ketekunan dan pandangan ke depan. Tetapi ada semacam dukacita tersendiri yang muncul ketika rencana yang telah kita kerjakan keras ternyata tetap gagal, meski sudah dengan usaha dan niat terbaik.

Amsal 3:5-6 adalah salah satu ayat yang paling sering dikutip dalam Alkitab, dan bukan tanpa alasan: ia menyebutkan tepat ketegangan ini. Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Perhatikan, ayat ini tidak berkata bahwa pengertian kita tidak berharga — ia berkata jangan bersandar padanya sepenuhnya, seolah itu satu-satunya sandaran yang kita butuhkan. Pengertian kita, menurut sifatnya, terbatas; kita hanya bisa melihat jalan di belakang kita dan sepenggal jalan di depan. Allah melihat seluruh medan.

Ini bukan seruan untuk berhenti berpikir atau merencanakan sama sekali. Ini adalah seruan untuk memegang rencana kita dengan tangan terbuka, bukan tangan terkepal — untuk mengakui-Nya dalam segala laku kita, seperti kata ayat itu, sehingga Ia dapat meluruskan jalan bahkan ketika peta kita sendiri ternyata keliru. Banyak dari kita pernah menoleh ke belakang pada musim ketika sebuah rencana gagal, dan kemudian menyadari, dengan sedikit terkejut, bahwa jalan memutar itu ternyata justru tempat yang kita butuhkan.

Hari ini, pikirkanlah rencana yang paling erat kau genggam saat ini. Bukan untuk meninggalkannya, tetapi untuk sungguh-sungguh menyerahkannya kepada Allah — memohon Ia mengarahkannya kembali jika pengertianmu telah membawamu ke tempat yang tak pernah Ia maksudkan.',
    'Which plan are you holding with a clenched fist right now, and what would it look like to open your hand?', 'Rencana mana yang sedang kau genggam erat sekarang, dan seperti apa jadinya jika kau membuka tanganmu?',
    'Lord, I bring You the plan I''ve been holding so tightly. I don''t fully understand where this road is going, but I trust You more than I trust my own map. Straighten my path where I''ve gone the wrong way. Amen.', 'Tuhan, aku membawa kepada-Mu rencana yang telah kugenggam begitu erat. Aku tidak sepenuhnya memahami ke mana jalan ini menuju, tetapi aku percaya kepada-Mu lebih daripada peta buatanku sendiri. Luruskanlah jalanku di mana aku telah salah arah. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Proverbs 3:5-6', 'WEB', 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Amsal 3:5-6', 'TB', 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'One Day at a Time', 'Selangkah demi Selangkah',
    'There''s a certain kind of anxiety that comes not from today''s problems, but from all the tomorrows we''re trying to solve in advance. Will this job work out? What if the diagnosis is bad? What happens if the relationship doesn''t survive this? Our minds can spiral years into the future, gathering worries that haven''t even happened yet and carrying them as if they already have.

Jesus addresses this directly in the Sermon on the Mount, right after teaching about God''s care for birds and flowers. Do not worry about tomorrow, He says, because tomorrow will worry about itself. Each day has enough trouble of its own. It''s almost startlingly practical — not a mystical promise, but an instruction about where to place our attention. Today has enough to handle without also carrying next year''s uncertainty.

This teaching isn''t asking us to stop caring about the future or to abandon wisdom and preparation. It''s inviting us to release the illusion that we can control the future by worrying about it hard enough. Worry doesn''t actually secure tomorrow; it only steals the peace available to us today. Letting go of the map doesn''t mean we stop moving forward — it means we stop trying to see ten steps ahead before we''re willing to take the next one.

Today, practice narrowing your focus. Instead of trying to solve every uncertain outcome at once, ask God simply for what you need for today — today''s strength, today''s wisdom, today''s provision — and trust Him to be present again tomorrow when tomorrow actually arrives.', 'Ada semacam kecemasan tertentu yang muncul bukan dari masalah hari ini, melainkan dari semua hari esok yang kita coba selesaikan lebih dulu. Apakah pekerjaan ini akan berhasil? Bagaimana jika diagnosisnya buruk? Apa yang terjadi jika hubungan ini tidak bertahan melewati ini? Pikiran kita bisa berputar bertahun-tahun ke depan, mengumpulkan kekhawatiran yang bahkan belum terjadi dan membawanya seolah-olah sudah terjadi.

Yesus membahas hal ini secara langsung dalam Khotbah di Bukit, tepat setelah mengajar tentang perhatian Allah bagi burung-burung dan bunga-bunga. Janganlah kuatir akan hari besok, kata-Nya, karena hari besok mempunyai kesusahannya sendiri. Kesusahan sehari cukuplah untuk sehari. Ini hampir mengejutkan karena begitu praktis — bukan janji mistis, melainkan instruksi tentang ke mana kita harus mengarahkan perhatian. Hari ini sudah cukup berat tanpa harus juga membawa ketidakpastian tahun depan.

Ajaran ini tidak meminta kita berhenti peduli pada masa depan atau meninggalkan hikmat dan persiapan. Ini mengundang kita untuk melepaskan ilusi bahwa kita bisa mengendalikan masa depan dengan mengkhawatirkannya cukup keras. Kekhawatiran sebenarnya tidak mengamankan hari esok; ia hanya mencuri damai yang tersedia bagi kita hari ini. Melepaskan peta sendiri bukan berarti kita berhenti melangkah maju — itu berarti kita berhenti mencoba melihat sepuluh langkah ke depan sebelum bersedia mengambil langkah berikutnya.

Hari ini, latihlah untuk mempersempit fokusmu. Alih-alih mencoba menyelesaikan setiap kemungkinan yang tak pasti sekaligus, mintalah kepada Allah hanya apa yang kau butuhkan untuk hari ini — kekuatan hari ini, hikmat hari ini, penyediaan hari ini — dan percayalah Ia akan hadir lagi besok ketika esok benar-benar tiba.',
    'Which future worry are you carrying today that actually belongs to a day that hasn''t come yet?', 'Kekhawatiran masa depan mana yang sedang kau bawa hari ini padahal sebenarnya milik hari yang belum tiba?',
    'Jesus, I confess I''ve been trying to solve tomorrow''s problems today, and it''s exhausting me. Help me set down what isn''t mine to carry yet. Give me what I need for today, and I will trust You for tomorrow when it comes. Amen.', 'Yesus, aku mengaku bahwa aku telah mencoba menyelesaikan masalah hari esok hari ini, dan itu melelahkanku. Tolong aku meletakkan apa yang belum menjadi bagianku untuk dipikul. Berilah aku apa yang kubutuhkan untuk hari ini, dan aku akan mempercayakan hari esok kepada-Mu ketika ia tiba. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:34', 'WEB', 'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:34', 'TB', 'Sebab itu janganlah kamu kuatir akan hari besok, karena hari besok mempunyai kesusahannya sendiri. Kesusahan sehari cukuplah untuk sehari.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Holding Plans with Open Hands', 'Menggenggam Rencana dengan Tangan Terbuka',
    'There is a certain confidence many of us grew up with — the idea that if we just plan carefully enough, we can guarantee our own outcomes. Today or tomorrow we will do this, go there, build that, become this. It''s not a bad instinct; ambition and diligence are gifts. But James, writing to early Christians who were making exactly these kinds of confident business plans, offers a gentle but firm correction.

James doesn''t condemn planning itself. He condemns planning as though our lives are entirely in our own hands, as though tomorrow is a guarantee we''re owed. He reminds his readers that life itself is like a mist — here for a little while, then gone. That''s not meant to be morbid; it''s meant to be freeing. If our days are genuinely a gift rather than a guarantee, then every plan we make is already, quietly, an act of trust.

James''s suggested phrase — ''if it is the Lord''s will'' — isn''t superstition or a magic formula to attach to our sentences. It''s a posture of the heart: an ongoing acknowledgment that our plans exist inside God''s larger will, not the other way around. Saying this, out loud or in our hearts, isn''t a sign of weak ambition. It''s actually a sign of security, because it means our identity and peace aren''t riding entirely on whether our plans succeed exactly as drawn.

As this short plan closes, consider writing down one plan you''re currently making — for your career, your family, your future — and simply adding this phrase to it in your own words. Not as a formality, but as a genuine surrender: this, Lord, if it is Your will. Let that be the map you carry instead of the one you drew alone.', 'Ada semacam keyakinan tertentu yang tumbuh dalam diri banyak dari kita — gagasan bahwa jika kita cukup teliti merencanakan, kita dapat menjamin hasil kita sendiri. Hari ini atau besok kami akan melakukan ini, pergi ke sana, membangun itu, menjadi begini. Ini bukan dorongan yang buruk; ambisi dan ketekunan adalah anugerah. Tetapi Yakobus, menulis kepada orang-orang Kristen mula-mula yang sedang membuat rencana bisnis yang penuh keyakinan seperti ini, memberikan koreksi yang lembut namun tegas.

Yakobus tidak mengutuk perencanaan itu sendiri. Ia mengutuk perencanaan yang seolah-olah hidup kita sepenuhnya ada di tangan kita sendiri, seolah esok adalah jaminan yang menjadi hak kita. Ia mengingatkan para pembacanya bahwa hidup itu sendiri seperti uap — ada sebentar, lalu lenyap. Ini bukan dimaksudkan untuk menakutkan; ini dimaksudkan untuk membebaskan. Jika hari-hari kita sungguh adalah anugerah dan bukan jaminan, maka setiap rencana yang kita buat sesungguhnya, secara diam-diam, sudah menjadi tindakan percaya.

Ungkapan yang disarankan Yakobus — ''jika Tuhan menghendakinya'' — bukanlah takhayul atau rumus ajaib yang ditempelkan pada kalimat kita. Itu adalah sikap hati: pengakuan yang terus-menerus bahwa rencana kita berada di dalam kehendak Allah yang lebih besar, bukan sebaliknya. Mengucapkan ini, secara lisan maupun dalam hati, bukanlah tanda ambisi yang lemah. Sebenarnya ini tanda keamanan, karena berarti identitas dan kedamaian kita tidak sepenuhnya bergantung pada apakah rencana kita berhasil persis seperti yang dirancang.

Saat renungan singkat ini berakhir, cobalah menuliskan satu rencana yang sedang kau susun — untuk karier, keluarga, atau masa depanmu — dan sederhana saja tambahkan ungkapan ini dengan kata-katamu sendiri. Bukan sebagai formalitas, melainkan sebagai penyerahan yang sungguh-sungguh: ini, Tuhan, jika Engkau menghendakinya. Biarlah itu menjadi peta yang kau bawa, menggantikan peta yang kau gambar sendirian.',
    'What plan could you offer to God today with an honest ''if it is Your will'' instead of a demand?', 'Rencana apa yang bisa kau serahkan kepada Allah hari ini dengan ucapan jujur ''jika Engkau menghendakinya'', bukan sebuah tuntutan?',
    'Father, my life is a gift, not a guarantee, and my plans belong inside Your will, not the other way around. I offer You my plans today — my career, my family, my future — and ask that Your will be done, even when it reshapes mine. Amen.', 'Bapa, hidupku adalah anugerah, bukan jaminan, dan rencanaku berada di dalam kehendak-Mu, bukan sebaliknya. Aku menyerahkan rencanaku kepada-Mu hari ini — karierku, keluargaku, masa depanku — dan memohon agar kehendak-Mu jadi, bahkan ketika itu membentuk ulang rencanaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'James 4:13-15', 'WEB', 'Now listen, you who say, ''Today or tomorrow we will go to this or that city, spend a year there, carry on business and make money.'' Instead, you ought to say, ''If it is the Lord''s will, we will live and do this or that.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yakobus 4:13-15', 'TB', 'Jadi sekarang, hai kamu yang berkata: ''Hari ini atau besok kami berangkat ke kota ini atau itu, dan berdagang setahun di sana, dan mendapat untung.'' Sebaliknya kamu harus berkata: ''Jika Tuhan menghendakinya, kami akan hidup dan berbuat ini atau itu.''');

  -- Plan: Bread for the Unknown Road
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Bread for the Unknown Road',
    'Roti bagi Jalan yang Tak Diketahui',
    'Trusting God''s provision when you cannot see tomorrow',
    'Mempercayai penyediaan Allah ketika esok tak terlihat',
    7,
    'A seven-day walk through God''s promises of provision, for anyone facing an unknown road — a career shift, a diagnosis, a move, a decision with no clear outcome. Drawing on stories of manna, sparrows, and shepherds, this plan builds a steady, week-long confidence that the God who provided yesterday can be trusted with tomorrow, one day''s bread at a time.',
    'Perjalanan tujuh hari menyusuri janji-janji penyediaan Allah, bagi siapa saja yang menghadapi jalan yang tak diketahui — perubahan karier, diagnosis, kepindahan, atau keputusan tanpa hasil yang pasti. Berlandaskan kisah manna, burung pipit, dan gembala, renungan ini membangun keyakinan yang mantap selama seminggu bahwa Allah yang menyediakan kemarin dapat dipercaya untuk esok, sehari demi sehari.',
    '/images/devotions/bread-for-the-unknown-road.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The God Who Sees What You Need', 'Allah yang Tahu Kebutuhanmu',
    'Uncertainty about the future almost always comes wrapped in a question about resources. Will there be enough? Enough time, enough money, enough strength, enough support to get through what''s ahead. When we can''t see the road, our minds instinctively start counting supplies, as if we were the ones responsible for stocking the entire journey ourselves.

Paul wrote to the Philippians from a place with very little control over his own circumstances — a prison cell, dependent on the gifts of a church far away to meet his basic needs. And yet from that place he writes one of the most confident promises in all of Scripture: my God will meet all your needs. Not some needs, not the needs he approves of, but all of them, according to the riches of His glory, not according to what''s left over.

Notice the source of this confidence. Paul isn''t promising provision because he has a clever plan or a financial safety net. He is promising it because of who God is — rich, generous, and personally attentive to His children. The riches of God''s glory in Christ Jesus are not a limited account that might run dry when too many people ask at once. They are inexhaustible, the way sunlight doesn''t run low no matter how many plants turn toward it.

As you begin this week, bring your specific uncertainty to God honestly — not just the vague fear of ''the unknown,'' but the actual thing you are worried about running out of. He is not intimidated by the specifics, and He already knows the need before you say it out loud.', 'Ketidakpastian tentang masa depan hampir selalu datang berbalut pertanyaan tentang sumber daya. Akankah cukup? Cukup waktu, cukup uang, cukup kekuatan, cukup dukungan untuk melewati apa yang ada di depan. Ketika kita tidak bisa melihat jalannya, pikiran kita secara naluriah mulai menghitung perbekalan, seolah-olah kitalah yang bertanggung jawab menyediakan seluruh perjalanan itu sendiri.

Paulus menulis kepada jemaat di Filipi dari tempat dengan sangat sedikit kendali atas keadaannya sendiri — sebuah sel penjara, bergantung pada pemberian dari sebuah jemaat yang jauh untuk memenuhi kebutuhan dasarnya. Namun justru dari tempat itu ia menulis salah satu janji paling penuh keyakinan dalam seluruh Alkitab: Allahku akan memenuhi segala keperluanmu. Bukan sebagian keperluan, bukan hanya yang Ia setujui, melainkan segala keperluanmu, menurut kekayaan kemuliaan-Nya, bukan menurut sisa yang ada.

Perhatikan sumber keyakinan ini. Paulus tidak menjanjikan penyediaan karena ia memiliki rencana cerdik atau jaring pengaman finansial. Ia menjanjikannya karena siapa Allah itu — kaya, murah hati, dan penuh perhatian secara pribadi kepada anak-anak-Nya. Kekayaan kemuliaan Allah dalam Kristus Yesus bukanlah rekening terbatas yang bisa habis jika terlalu banyak orang meminta sekaligus. Itu tak terbatas, seperti sinar matahari yang tidak berkurang betapa pun banyak tanaman yang menghadap kepadanya.

Saat memulai minggu ini, bawalah ketidakpastianmu yang spesifik kepada Allah dengan jujur — bukan sekadar ketakutan samar tentang ''yang tak diketahui'', melainkan hal nyata yang kau khawatirkan akan habis. Ia tidak gentar dengan hal-hal yang spesifik, dan Ia sudah tahu kebutuhan itu bahkan sebelum kau mengucapkannya.',
    'What specific resource are you afraid of running out of? Name it honestly to God today.', 'Sumber daya spesifik apa yang kau khawatirkan akan habis? Sebutkanlah dengan jujur kepada Allah hari ini.',
    'Father, You already know what I am afraid I won''t have enough of. Thank You that Your resources are not limited the way mine are. Meet my specific need today according to Your riches, not according to what I can see in my own hands. Amen.', 'Bapa, Engkau sudah tahu apa yang kutakutkan tidak akan cukup. Terima kasih karena sumber daya-Mu tidak terbatas seperti milikku. Penuhilah kebutuhanku yang spesifik hari ini menurut kekayaan-Mu, bukan menurut apa yang bisa kulihat di tanganku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 4:19', 'WEB', 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 4:19', 'TB', 'Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'More Valuable Than Sparrows', 'Lebih Berharga daripada Burung Pipit',
    'Jesus points to birds in the middle of His most famous sermon, right after warning His listeners not to worry. Look at the birds of the air, He says — creatures with no storehouse, no harvest, no salary, and yet they are fed. It''s a strange comfort at first. If you''re staring down an uncertain future, being compared to a bird with no plan doesn''t sound especially reassuring.

But look again at the actual logic Jesus is building. He isn''t saying don''t plan, don''t work, don''t prepare — He worked with His hands for years before His ministry began. He is making an argument from lesser to greater: if the Father tends this carefully to a creature that cannot pray, cannot plan, cannot even understand its own need, how much more attentive is He to you, someone He calls by name, someone made in His image?

This isn''t a promise that hard seasons never come. Even the ravens that fed Elijah appeared during one of the worst droughts in Israel''s history. What the birds and the ravens teach us is not that need disappears, but that God notices need and moves toward it, often through means we never would have planned or predicted ourselves.

Today, whatever uncertain road you''re facing, let this comparison sink in slowly: if God is this attentive to a sparrow, He has not stopped being attentive to you. Your worth to Him was never in question, and neither is His willingness to notice what you actually need.', 'Yesus menunjuk ke arah burung-burung di tengah khotbah-Nya yang paling terkenal, tepat setelah memperingatkan para pendengar-Nya untuk tidak kuatir. Pandanglah burung-burung di langit, kata-Nya — makhluk tanpa lumbung, tanpa panen, tanpa gaji, namun tetap diberi makan. Awalnya ini terdengar seperti penghiburan yang aneh. Jika kau sedang menatap masa depan yang tidak pasti, dibandingkan dengan burung tanpa rencana rasanya kurang meyakinkan.

Tetapi perhatikan kembali logika yang sebenarnya sedang dibangun Yesus. Ia tidak berkata jangan merencanakan, jangan bekerja, jangan bersiap — Ia sendiri bekerja dengan tangan-Nya selama bertahun-tahun sebelum pelayanan-Nya dimulai. Ia sedang membuat argumen dari yang lebih kecil ke yang lebih besar: jika Bapa begitu teliti memelihara makhluk yang bahkan tidak bisa berdoa, tidak bisa merencanakan, bahkan tidak memahami kebutuhannya sendiri, betapa lebih Ia memperhatikan dirimu, seseorang yang Ia panggil dengan nama, seseorang yang diciptakan menurut gambar-Nya?

Ini bukan janji bahwa musim sulit tidak akan pernah datang. Bahkan burung-burung gagak yang memberi makan Elia muncul di tengah salah satu masa kekeringan terburuk dalam sejarah Israel. Yang diajarkan oleh burung-burung dan burung gagak itu bukanlah bahwa kebutuhan lenyap, melainkan bahwa Allah memperhatikan kebutuhan itu dan bergerak menuju kepadanya, sering kali melalui cara yang tak pernah kita rencanakan atau perkirakan sendiri.

Hari ini, apa pun jalan tak pasti yang sedang kau hadapi, biarlah perbandingan ini meresap perlahan: jika Allah sedemikian penuh perhatian pada seekor burung pipit, Ia tidak pernah berhenti memperhatikanmu. Nilaimu di mata-Nya tidak pernah dipertanyakan, begitu pula kesediaan-Nya untuk memperhatikan apa yang benar-benar kau butuhkan.',
    'Where have you been quietly doubting your own worth to God because of an uncertain circumstance?', 'Di bagian mana selama ini engkau diam-diam meragukan nilaimu di mata Allah karena sebuah keadaan yang tidak pasti?',
    'Lord, help me believe today that I am more valuable to You than the birds You already feed so faithfully. Quiet the doubt that says I might be forgotten. I am not a sparrow left to figure this out alone. Amen.', 'Tuhan, tolong aku percaya hari ini bahwa aku lebih berharga bagi-Mu daripada burung-burung yang begitu setia Kau beri makan. Diamkan keraguan yang berkata aku mungkin terlupakan. Aku bukan burung pipit yang dibiarkan menyelesaikan ini sendirian. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:26', 'WEB', 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:26', 'TB', 'Pandanglah burung-burung di langit, yang tidak menabur dan tidak menuai dan tidak mengumpulkan bekal dalam lumbung, namun diberi makan oleh Bapamu yang di sorga. Bukankah kamu jauh melebihi burung-burung itu?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'The Shepherd Who Does Not Let Me Want', 'Gembala yang Tak Membiarkan Aku Kekurangan',
    'Psalm 23 opens with a sentence so familiar it can be easy to skip past: the Lord is my shepherd, I lack nothing. Before the green pastures, before the still waters, before the valley of the shadow, before the table prepared in front of enemies, there is this simple declaration of trust. Everything else in the psalm is really just an unpacking of what it means to believe this first line.

A shepherd''s job in the ancient world was not glamorous. It meant knowing where the water was during a drought, scouting ahead for danger, staying awake through cold nights, physically placing the body between the flock and a predator. When David — himself a former shepherd — calls God his shepherd, he isn''t reaching for a decorative metaphor. He is describing someone who does the unseen, unglamorous work of provision long before the sheep ever notice they were in danger of lacking.

''I lack nothing'' is not a claim that David had everything he wanted. It is a claim that under this shepherd''s care, nothing essential would be missing when it mattered most. That is a very different promise than ''you will get everything you ask for.'' It is the promise of a caretaker who knows the difference between what you want and what you truly need, and provides the second even when the first isn''t given.

On an unknown road, it helps to remember you are not walking it as a lone traveler responsible for your own supplies. You are walking it as a sheep under a shepherd who has never once, in all of history, let His flock starve in the wilderness. Rest in that today, even if you cannot yet see the pasture ahead.', 'Mazmur 23 dibuka dengan kalimat yang begitu akrab sehingga mudah dilewati begitu saja: TUHAN adalah gembalaku, takkan kekurangan aku. Sebelum padang rumput hijau, sebelum air yang tenang, sebelum lembah kekelaman, sebelum meja yang disediakan di hadapan musuh, ada pernyataan sederhana tentang kepercayaan ini. Sisa mazmur ini sebenarnya hanyalah penjabaran dari apa artinya percaya pada baris pertama ini.

Pekerjaan seorang gembala di dunia kuno bukanlah pekerjaan yang mentereng. Itu berarti mengetahui di mana air berada saat kekeringan, mengintai bahaya di depan, terjaga sepanjang malam yang dingin, secara fisik menempatkan diri di antara kawanan domba dan pemangsa. Ketika Daud — yang dulunya sendiri seorang gembala — menyebut Allah sebagai gembalanya, ia tidak sedang meraih sebuah kiasan yang indah semata. Ia sedang menggambarkan seseorang yang melakukan pekerjaan penyediaan yang tak terlihat dan tak mentereng, jauh sebelum domba-domba itu bahkan menyadari mereka nyaris kekurangan.

''Takkan kekurangan aku'' bukanlah klaim bahwa Daud memiliki segala yang ia inginkan. Ini adalah klaim bahwa di bawah pemeliharaan gembala ini, tidak ada yang esensial akan hilang saat itu benar-benar penting. Itu adalah janji yang sangat berbeda dari ''kamu akan mendapatkan semua yang kau minta.'' Ini adalah janji dari seorang penjaga yang tahu perbedaan antara apa yang kau inginkan dan apa yang sungguh kau butuhkan, dan menyediakan yang kedua bahkan ketika yang pertama tidak diberikan.

Di jalan yang tak diketahui, ada baiknya mengingat bahwa kau tidak berjalan sebagai musafir sendirian yang bertanggung jawab atas perbekalanmu sendiri. Kau berjalan sebagai domba di bawah gembala yang tidak pernah sekalipun, dalam sepanjang sejarah, membiarkan kawanan-Nya kelaparan di padang gurun. Beristirahatlah dalam kebenaran ini hari ini, sekalipun kau belum bisa melihat padang rumput di depan.',
    'What is the difference, for you today, between what you want and what you actually need?', 'Apa perbedaan, bagimu hari ini, antara apa yang kau inginkan dan apa yang sungguh kau butuhkan?',
    'Shepherd of my life, thank You for the unseen ways You have already been providing for me. Help me trust that under Your care, I will not lack what truly matters, even on this uncertain road. Lead me to rest today. Amen.', 'Gembala hidupku, terima kasih atas cara-cara tak terlihat yang telah Kau lakukan untuk menyediakan bagiku. Tolong aku percaya bahwa di bawah pemeliharaan-Mu, aku tidak akan kekurangan apa yang sungguh penting, bahkan di jalan yang tak pasti ini. Tuntunlah aku untuk beristirahat hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 23:1', 'WEB', 'The LORD is my shepherd, I lack nothing.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 23:1', 'TB', 'TUHAN adalah gembalaku, takkan kekurangan aku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Plans to Prosper, Not to Harm', 'Rancangan Damai Sejahtera, Bukan Kecelakaan',
    'Jeremiah 29:11 is one of the most beloved verses in Scripture, and also one of the most misunderstood if we forget its context. God speaks these words not to people enjoying comfortable circumstances, but to Israelites who had just been carried off into exile in Babylon — their homeland lost, their temple destroyed, their future completely unclear. This promise was given inside genuine uncertainty, not instead of it.

What makes the verse remarkable is not that God promised an easy or quick resolution. In fact, the surrounding verses tell the exiles to settle down, build houses, plant gardens, and expect to be there for decades. God''s plan for their flourishing unfolded slowly, inside a hard season they did not choose and could not shorten by force of will. And yet He still calls His intentions toward them plans to prosper and not to harm, plans for hope and a future.

This is worth sitting with if your own uncertain road feels long rather than short. God''s good plans for you are not disproven by the fact that things are taking time, or that the path looks nothing like what you expected. The exiles could not see how they would ever return home, and yet God''s plan was already moving underneath the surface of their ordinary, difficult days.

Today, hold this promise with both hands: not as a guarantee that your circumstances will resolve on your preferred timeline, but as a settled confidence in the character behind the plan. The God who spoke this over an exiled, uncertain people has not changed His posture toward His children.', 'Yeremia 29:11 adalah salah satu ayat yang paling dicintai dalam Alkitab, dan juga salah satu yang paling sering disalahpahami jika kita lupa konteksnya. Allah mengucapkan kata-kata ini bukan kepada orang-orang yang menikmati keadaan nyaman, melainkan kepada orang Israel yang baru saja dibawa ke pembuangan di Babel — tanah air mereka hilang, bait suci mereka hancur, masa depan mereka sama sekali tidak jelas. Janji ini diberikan di tengah ketidakpastian yang nyata, bukan sebagai gantinya.

Yang membuat ayat ini luar biasa bukanlah karena Allah menjanjikan penyelesaian yang mudah atau cepat. Faktanya, ayat-ayat di sekitarnya menyuruh para buangan untuk menetap, membangun rumah, menanam kebun, dan bersiap tinggal di sana selama puluhan tahun. Rencana Allah bagi kesejahteraan mereka terwujud secara perlahan, di dalam musim sulit yang tidak mereka pilih dan tidak dapat dipersingkat dengan kemauan mereka sendiri. Namun Ia tetap menyebut niat-Nya bagi mereka sebagai rancangan damai sejahtera dan bukan rancangan kecelakaan, rancangan untuk memberi harapan dan hari depan.

Ini patut direnungkan jika jalan tak pastimu sendiri terasa panjang, bukan singkat. Rencana baik Allah bagimu tidak terbantahkan oleh fakta bahwa segalanya membutuhkan waktu, atau bahwa jalannya sama sekali tidak seperti yang kau harapkan. Para buangan itu tidak dapat melihat bagaimana mereka akan pernah pulang, namun rencana Allah sudah bergerak di bawah permukaan hari-hari biasa mereka yang sulit.

Hari ini, peganglah janji ini dengan kedua tangan: bukan sebagai jaminan bahwa keadaanmu akan terselesaikan sesuai jadwal yang kau sukai, melainkan sebagai kepercayaan yang mantap pada karakter di balik rencana itu. Allah yang mengucapkan ini kepada umat buangan yang tidak pasti tidak pernah mengubah sikap-Nya terhadap anak-anak-Nya.',
    'If God''s good plan for you is unfolding slowly rather than quickly, what would it mean to trust Him inside the slowness?', 'Jika rencana baik Allah bagimu terwujud perlahan, bukan cepat, apa artinya mempercayai-Nya di dalam kelambatan itu?',
    'Lord, I don''t know how long this road will be, but I trust that Your plans for me are for good and not for harm. Give me patience like the exiles had to have, and confidence that You are already at work beneath what I can see. Amen.', 'Tuhan, aku tidak tahu berapa panjang jalan ini, tetapi aku percaya bahwa rencana-Mu bagiku adalah untuk kebaikan, bukan kecelakaan. Berilah aku kesabaran seperti yang harus dimiliki umat buangan itu, dan keyakinan bahwa Engkau sudah bekerja di balik apa yang bisa kulihat. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Jeremiah 29:11', 'WEB', 'For I know the plans I have for you,'' declares the LORD, ''plans to prosper you and not to harm you, plans to give you hope and a future.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yeremia 29:11', 'TB', 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Grace Sufficient for Every Season', 'Anugerah yang Cukup bagi Setiap Musim',
    'One of the quiet fears of an uncertain future is that we might run out — not just of money or resources, but of grace itself. What if the season ahead requires more patience, more strength, more faith than we have in us? What if we simply aren''t equipped for whatever is coming next?

Paul''s second letter to the Corinthians was written to a church he had appealed to for generosity, and in the middle of that appeal he makes a sweeping promise about God''s ability to provide: God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work. Notice the phrase ''at all times'' — not just in the easy seasons, but in every season, including the ones we cannot yet see coming.

This is a promise about sufficiency, not excess. It doesn''t guarantee comfort or ease. It guarantees enough — enough grace to meet whatever the day requires, released at the pace we need it rather than all at once in advance. This is the same principle behind the manna in the wilderness: God gave the Israelites exactly enough for each day, no more, teaching them to trust Him again tomorrow rather than stockpile today out of fear.

You do not need to have, right now, all the grace an entire uncertain future will require. You only need what today requires, and God has already promised that much. Trust that tomorrow''s portion will be there tomorrow, the same way it always has been.', 'Salah satu ketakutan diam-diam tentang masa depan yang tidak pasti adalah kita mungkin kehabisan — bukan hanya uang atau sumber daya, melainkan anugerah itu sendiri. Bagaimana jika musim di depan membutuhkan lebih banyak kesabaran, lebih banyak kekuatan, lebih banyak iman daripada yang kita miliki? Bagaimana jika kita sekadar tidak siap untuk apa pun yang akan datang berikutnya?

Surat kedua Paulus kepada jemaat Korintus ditulis kepada gereja yang ia mintai kemurahan hati, dan di tengah permintaan itu ia membuat janji yang luas tentang kemampuan Allah untuk menyediakan: Allah sanggup melimpahkan segala kasih karunia kepada kamu, supaya kamu senantiasa berkecukupan di dalam segala sesuatu dan malah berkelebihan di dalam segala kebajikan. Perhatikan frasa ''senantiasa'' — bukan hanya pada musim yang mudah, melainkan pada setiap musim, termasuk yang belum bisa kita lihat datangnya.

Ini adalah janji tentang kecukupan, bukan kelimpahan berlebihan. Ia tidak menjamin kenyamanan atau kemudahan. Ia menjamin kecukupan — anugerah yang cukup untuk memenuhi apa pun yang dibutuhkan hari itu, dilepaskan sesuai kecepatan yang kita perlukan, bukan sekaligus di muka. Ini adalah prinsip yang sama di balik manna di padang gurun: Allah memberi orang Israel tepat cukup untuk setiap hari, tidak lebih, mengajar mereka untuk percaya kepada-Nya lagi esok hari, bukan menimbun hari ini karena takut.

Kau tidak perlu memiliki, saat ini juga, seluruh anugerah yang dibutuhkan oleh masa depan yang tidak pasti. Kau hanya membutuhkan apa yang dibutuhkan hari ini, dan Allah telah menjanjikan sebanyak itu. Percayalah bahwa jatah esok akan ada besok, sebagaimana selalu terjadi.',
    'Are you trying to carry grace for a future you can''t yet see, instead of trusting God for today''s portion?', 'Apakah engkau sedang mencoba memikul anugerah untuk masa depan yang belum bisa kau lihat, alih-alih mempercayai Allah untuk jatah hari ini?',
    'Father, I confess I''ve been worrying about having enough grace for a future I cannot see. Thank You that Your grace comes at the pace I need it, not all at once. Give me what today requires, and I will trust You for tomorrow''s portion when it comes. Amen.', 'Bapa, aku mengaku telah mengkhawatirkan apakah aku punya cukup anugerah untuk masa depan yang belum bisa kulihat. Terima kasih karena anugerah-Mu datang sesuai kecepatan yang kubutuhkan, bukan sekaligus. Berilah aku apa yang dibutuhkan hari ini, dan aku akan mempercayakan jatah esok kepada-Mu ketika ia tiba. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Corinthians 9:8', 'WEB', 'And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Korintus 9:8', 'TB', 'Dan Allah sanggup melimpahkan segala kasih karunia kepada kamu, supaya kamu senantiasa berkecukupan di dalam segala sesuatu dan malah berkelebihan di dalam segala kebajikan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'Bread That Never Fails', 'Roti yang Tak Pernah Gagal',
    'Psalm 37 is written by someone with decades of life behind him, looking back over a long stretch of years and drawing a conclusion he clearly considers hard-won: I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread. This isn''t a naive statement from someone who never faced hardship. It''s the testimony of someone who watched God''s faithfulness prove itself across an entire lifetime.

There''s something powerful about hearing this from an elder rather than a beginner. Anyone can say ''God will provide'' in a moment of fresh optimism. It means something different coming from someone who has actually lived long enough to test the claim — through good years and lean years, through plans that worked and plans that fell apart — and can still say, on the other side of all of it, that God did not abandon those who trusted Him.

This verse doesn''t promise a life free of hardship or want in the moment. The psalmist himself elsewhere describes real struggle. What it promises is a pattern observed over time: God''s faithfulness to His people holds, generation after generation, even when any single day inside that story looked uncertain or difficult. We are often too close to our own moment to see the pattern; the psalmist offers us his longer view as a gift.

As you continue on your own unknown road, let this ancient testimony lend you its confidence. You may not yet have decades of hindsight to look back on, but you are joining a very long line of people who can say, honestly, that God''s provision held even when the path ahead was unclear.', 'Mazmur 37 ditulis oleh seseorang dengan puluhan tahun kehidupan di belakangnya, menoleh ke belakang sepanjang rentang tahun yang panjang dan menarik kesimpulan yang jelas ia anggap sebagai hasil perjuangan: Dahulu aku muda, sekarang telah menjadi tua, tetapi tidak pernah kulihat orang benar ditinggalkan, atau anak cucunya meminta-minta roti. Ini bukan pernyataan naif dari seseorang yang tidak pernah menghadapi kesulitan. Ini adalah kesaksian dari seseorang yang menyaksikan kesetiaan Allah membuktikan dirinya sepanjang seumur hidup.

Ada sesuatu yang kuat dalam mendengar ini dari seorang tua, bukan dari seorang pemula. Siapa pun bisa berkata ''Allah akan menyediakan'' dalam momen optimisme yang baru. Namun artinya berbeda ketika diucapkan oleh seseorang yang benar-benar telah hidup cukup lama untuk menguji klaim itu — melewati tahun-tahun baik dan tahun-tahun sulit, melewati rencana yang berhasil dan rencana yang gagal — dan tetap bisa berkata, di ujung semua itu, bahwa Allah tidak meninggalkan mereka yang percaya kepada-Nya.

Ayat ini tidak menjanjikan kehidupan yang bebas dari kesulitan atau kekurangan saat itu terjadi. Pemazmur sendiri di bagian lain menggambarkan perjuangan yang nyata. Yang dijanjikan adalah pola yang diamati sepanjang waktu: kesetiaan Allah kepada umat-Nya bertahan, dari generasi ke generasi, bahkan ketika satu hari saja di dalam kisah itu tampak tidak pasti atau sulit. Kita sering kali terlalu dekat dengan momen kita sendiri untuk melihat polanya; pemazmur menawarkan pandangan jangka panjangnya sebagai sebuah hadiah bagi kita.

Saat engkau melanjutkan perjalananmu sendiri di jalan yang tak diketahui, biarlah kesaksian kuno ini meminjamkan keyakinannya kepadamu. Kau mungkin belum memiliki puluhan tahun untuk ditengok ke belakang, tetapi kau sedang bergabung dengan barisan panjang orang-orang yang bisa berkata, dengan jujur, bahwa penyediaan Allah tetap bertahan bahkan ketika jalan di depan tidak jelas.',
    'Whose long testimony of God''s faithfulness could you lean on today when your own view feels too close to see clearly?', 'Kesaksian panjang siapa tentang kesetiaan Allah yang bisa kau jadikan sandaran hari ini, saat pandanganmu sendiri terasa terlalu dekat untuk melihat dengan jelas?',
    'Lord, I borrow the confidence of those who have walked this road before me and can testify to Your faithfulness. I have not seen the whole pattern yet, but I trust that You do not abandon those who trust You. Hold me steady today. Amen.', 'Tuhan, aku meminjam keyakinan dari mereka yang telah berjalan di jalan ini sebelum aku dan dapat bersaksi tentang kesetiaan-Mu. Aku belum melihat keseluruhan polanya, tetapi aku percaya bahwa Engkau tidak meninggalkan mereka yang percaya kepada-Mu. Teguhkan aku hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 37:25', 'WEB', 'I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 37:25', 'TB', 'Dahulu aku muda, sekarang telah menjadi tua, tetapi tidak pernah kulihat orang benar ditinggalkan, atau anak cucunya meminta-minta roti.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'Seek First, Trust the Rest', 'Carilah Dahulu, Percayakan Selebihnya',
    'This week began with a promise about provision and ends with an instruction about priority. Jesus, still teaching in the Sermon on the Mount, having already covered birds, flowers, and tomorrow''s worries, arrives at a single sentence that reorders everything: seek first His kingdom and His righteousness, and all these things will be given to you as well.

It''s worth noticing the order here. Jesus doesn''t say ignore your needs, or pretend they don''t matter. He says put them second, not first — not because they''re unimportant, but because chasing provision directly, as the main goal of your life, tends to produce anxiety rather than peace. Seeking the kingdom first means orienting your whole life — your decisions, your trust, your daily posture — around God and His purposes, and trusting that the practical needs will be met as a byproduct of that pursuit, not as the main project.

This is easier to hear than to live, especially on an unclear road where the practical needs feel urgent and the kingdom can feel abstract by comparison. But this teaching isn''t asking you to stop being practical. It''s asking you to place your deepest trust somewhere sturdier than your own ability to secure your future — in the God whose kingdom does not run out, whose righteousness does not fail, and who has promised, again and again this week, in a dozen different ways, that He notices and provides for those who seek Him first.

As this seven-day journey closes, carry this with you: you don''t need to see the whole unknown road today. You need enough bread for today, a Shepherd who has never once let His flock go truly wanting, and a heart set on seeking Him first. The rest — the timing, the outcome, the how — has always belonged to Him, and it still does.', 'Minggu ini dimulai dengan janji tentang penyediaan dan diakhiri dengan instruksi tentang prioritas. Yesus, masih mengajar dalam Khotbah di Bukit, setelah membahas burung, bunga, dan kekhawatiran hari esok, tiba pada satu kalimat yang menata ulang segalanya: carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.

Perlu diperhatikan urutan di sini. Yesus tidak berkata abaikan kebutuhanmu, atau berpura-pura kebutuhan itu tidak penting. Ia berkata letakkan itu di urutan kedua, bukan pertama — bukan karena tidak penting, melainkan karena mengejar penyediaan secara langsung, sebagai tujuan utama hidupmu, cenderung menghasilkan kecemasan, bukan damai. Mencari Kerajaan Allah lebih dulu berarti mengarahkan seluruh hidupmu — keputusanmu, kepercayaanmu, sikap harianmu — di sekitar Allah dan tujuan-Nya, dan mempercayai bahwa kebutuhan praktis akan terpenuhi sebagai hasil sampingan dari pengejaran itu, bukan sebagai proyek utama.

Ini lebih mudah didengar daripada dijalani, terutama di jalan yang tak jelas di mana kebutuhan praktis terasa mendesak dan Kerajaan Allah bisa terasa abstrak jika dibandingkan. Namun ajaran ini tidak memintamu berhenti bersikap praktis. Ini memintamu meletakkan kepercayaanmu yang paling dalam di tempat yang lebih kokoh daripada kemampuanmu sendiri untuk mengamankan masa depanmu — pada Allah yang Kerajaan-Nya tidak pernah habis, yang kebenaran-Nya tidak pernah gagal, dan yang telah berjanji, berulang kali sepanjang minggu ini, dengan berbagai cara, bahwa Ia memperhatikan dan menyediakan bagi mereka yang mencari-Nya lebih dulu.

Saat perjalanan tujuh hari ini berakhir, bawalah ini bersamamu: kau tidak perlu melihat seluruh jalan yang tak diketahui itu hari ini. Kau membutuhkan roti yang cukup untuk hari ini, seorang Gembala yang tidak pernah sekalipun membiarkan kawanan-Nya benar-benar kekurangan, dan hati yang tertuju untuk mencari-Nya lebih dulu. Sisanya — waktunya, hasilnya, caranya — selalu menjadi milik-Nya, dan tetap demikian.',
    'What would change today if you sought God first and trusted Him with the order of everything else?', 'Apa yang akan berubah hari ini jika engkau mencari Allah lebih dahulu dan mempercayakan urutan segala sesuatu yang lain kepada-Nya?',
    'Lord, teach me to seek You first, not as one priority among many, but as the center everything else orbits around. I release my grip on figuring out the unknown road on my own. Provide for me as You always have, and let my heart rest in seeking You. Amen.', 'Tuhan, ajarlah aku mencari-Mu lebih dahulu, bukan sekadar salah satu prioritas di antara banyak hal, melainkan pusat yang mengelilingi segala yang lain. Aku melepaskan genggamanku untuk memecahkan sendiri jalan yang tak diketahui ini. Sediakanlah bagiku sebagaimana selalu Kau lakukan, dan biarlah hatiku beristirahat dalam mencari-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:33', 'WEB', 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:33', 'TB', 'Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.');

  -- Sub-category: Faith in Trials --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Faith in Trials' AND parent_id = v_family_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Faith in Trials', 'Iman dalam Pencobaan', v_family_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Iman dalam Pencobaan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Faith When the Paycheck Doesn't Stretch
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Faith When the Paycheck Doesn''t Stretch',
    'Iman Ketika Gaji Tak Cukup',
    'Trusting God''s provision through job loss and lean seasons',
    'Percaya pada Penyertaan Tuhan di Masa Kehilangan Pekerjaan dan Serba Kekurangan',
    4,
    'A short four-day plan for anyone lying awake doing math that doesn''t add up — a lost job, a shrinking account, bills that outrun the paycheck. Each day turns to a well-loved promise of God''s provision, not as a formula for instant riches, but as an invitation to trust the Provider even when the numbers still look frightening.',
    'Rencana renungan empat hari yang singkat bagi siapa saja yang terjaga di malam hari menghitung angka yang tidak pernah cukup — pekerjaan yang hilang, tabungan yang menipis, tagihan yang lebih cepat datang daripada gaji. Setiap hari kita kembali kepada janji Tuhan yang sudah lama kita kenal, bukan sebagai rumus kekayaan instan, melainkan sebagai undangan untuk tetap percaya kepada Sang Penyedia, sekalipun angka-angka di depan kita masih terasa menakutkan.',
    '/images/devotions/faith-when-the-paycheck-doesn-t-stretch.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The God Who Sees the Empty Column', 'Allah yang Melihat Kolom yang Kosong',
    'There is a particular kind of tired that comes from doing math at midnight — moving numbers from one column to another, hoping that somehow they will add up differently this time. If you have opened a banking app more times in one week than you can count, or stared at a stack of bills wondering which one can wait another month, you already know this tiredness. It is not only about money. It is about the fear underneath the money: am I going to be okay?

Scripture never pretends that financial hardship is imaginary or that faith makes bills disappear. What it does insist on, again and again, is that God is not distant from the empty column in your ledger. He is not embarrassed by your circumstances, and He has not lost track of your address. The same God who fed a nation of former slaves in a wilderness with no grocery store in sight is the God who sees your particular shortfall today.

Paul wrote to the church at Philippi from a prison cell, and yet it is in that letter — not from a place of comfort, but from real hardship — that we get one of the most quoted promises about provision in all of Scripture. That matters. This is not a promise written by someone who never worried about resources. It was written by a man who had learned, the hard way, what it meant to depend on God when his own circumstances offered no security at all.

So today, if you are the one doing the midnight math, let this be less about arriving at a solution and more about naming who you are bringing your need to. You are not shouting into an empty sky. You are speaking to a Father who already knows the number you are afraid to say out loud.', 'Ada satu jenis lelah yang datang dari menghitung angka di tengah malam — memindahkan nominal dari satu kolom ke kolom lain, berharap kali ini hasilnya berbeda. Jika minggu ini kamu sudah membuka aplikasi rekening lebih sering daripada yang bisa kamu hitung, atau menatap tumpukan tagihan sambil bertanya-tanya mana yang bisa ditunda sebulan lagi, kamu sudah mengenal kelelahan ini. Ini bukan sekadar soal uang. Ini soal ketakutan yang tersembunyi di baliknya: akankah aku baik-baik saja?

Alkitab tidak pernah berpura-pura bahwa kesulitan keuangan itu hanya khayalan, atau bahwa iman membuat tagihan lenyap begitu saja. Tetapi yang terus ditegaskan berulang kali adalah bahwa Allah tidak jauh dari kolom kosong dalam catatan keuanganmu. Ia tidak malu dengan keadaanmu, dan Ia tidak lupa alamatmu. Allah yang sama yang memberi makan satu bangsa mantan budak di padang gurun tanpa satu pun toko kelontong di sekitarnya, adalah Allah yang melihat kekuranganmu hari ini.

Paulus menulis surat kepada jemaat di Filipi dari dalam penjara, dan justru dari surat itu — bukan dari tempat yang nyaman, melainkan dari kesulitan yang nyata — kita menerima salah satu janji tentang penyediaan yang paling sering dikutip dalam seluruh Alkitab. Ini penting. Janji ini bukan ditulis oleh seseorang yang tidak pernah mengkhawatirkan sumber daya. Ia ditulis oleh seseorang yang telah belajar, dengan cara yang sulit, apa artinya bergantung kepada Allah ketika keadaannya sendiri sama sekali tidak menawarkan rasa aman.

Jadi hari ini, jika kamulah yang sedang menghitung angka di tengah malam, biarlah ini bukan tentang segera menemukan solusi, melainkan tentang mengenali kepada siapa kamu membawa kebutuhanmu. Kamu tidak sedang berteriak ke langit yang kosong. Kamu sedang berbicara kepada Bapa yang sudah mengetahui angka yang bahkan takut kamu ucapkan.',
    'Name one specific need out loud today, and hand it to God as plainly as you would tell a trusted friend.', 'Sebutkan satu kebutuhan yang konkret hari ini, dan serahkanlah kepada Tuhan sesederhana ketika kamu bercerita kepada sahabat yang kau percaya.',
    'Father, You see the numbers I am afraid to say out loud. Thank You that my situation does not embarrass You and does not exceed Your care. Meet me in this shortfall, steady my heart while I wait, and help me trust You even before I see the answer. In Jesus'' name, Amen.', 'Bapa, Engkau melihat angka-angka yang bahkan aku takut ucapkan. Terima kasih karena keadaanku tidak membuat-Mu malu dan tidak melampaui kepedulian-Mu. Jumpai aku dalam kekurangan ini, teguhkan hatiku selagi aku menanti, dan tolong aku tetap percaya kepada-Mu bahkan sebelum aku melihat jawabannya. Dalam nama Yesus, Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 4:19', 'WEB', 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 4:19', 'TB', 'Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Fed Without a Storehouse', 'Diberi Makan Tanpa Lumbung',
    'Jesus once pointed to birds in the middle of a sermon about worry. It seems like an odd illustration until you remember His audience — people who understood scarcity firsthand, farmers and fishermen and day laborers who knew exactly how thin the margin between enough and not enough could be. He was not being naive about hardship. He was redirecting their eyes toward something they had stopped noticing: birds with no storehouse, no harvest of their own, no salary, and yet they are fed.

It can feel almost insulting to hear this verse when you are unemployed and the birds seem to be doing better than you are. But look again at what Jesus is actually arguing. He is not saying work doesn''t matter, or that planning is pointless — He worked with His hands for years. He is making a comparison of value: if the Father tends to a creature with no capacity to plan, save, or apply for another position, how much more attentive is He to a son or daughter made in His image, capable of prayer, worry, and hope?

This is not a promise that you will never have a hungry season. Scripture is full of people who fasted, who ran low, who genuinely wondered where the next provision would come from — Elijah among them, fed by ravens in a drought he did not create and could not end on his own. What the birds teach us is not the absence of need, but the presence of a Father who notices need and responds to it, even through unlikely means we would never have planned for ourselves.

If today is a day of scanning job listings, refreshing an inbox, or wondering if the interview will call back, let this be underneath all of it: you are not forgotten. The same attentiveness that keeps sparrows fed has not lifted off of your life.', 'Suatu kali Yesus menunjuk ke arah burung-burung di tengah khotbah tentang kekhawatiran. Ilustrasi ini terasa aneh sampai kita ingat siapa pendengar-Nya — orang-orang yang memahami kekurangan secara langsung, para petani, nelayan, dan buruh harian yang tahu persis betapa tipisnya jarak antara cukup dan tidak cukup. Yesus tidak sedang naif soal kesulitan hidup. Ia sedang mengarahkan pandangan mereka pada sesuatu yang sudah berhenti mereka perhatikan: burung tanpa lumbung, tanpa panen sendiri, tanpa gaji, namun tetap diberi makan.

Rasanya hampir menyakitkan mendengar ayat ini ketika kamu sedang menganggur dan burung-burung tampak lebih baik keadaannya darimu. Tetapi perhatikan kembali apa yang sesungguhnya Yesus katakan. Ia tidak berkata bahwa bekerja tidak penting, atau bahwa merencanakan itu sia-sia — Ia sendiri bekerja dengan tangan-Nya selama bertahun-tahun. Ia sedang membuat perbandingan nilai: jika Bapa memelihara makhluk yang bahkan tidak mampu merencanakan, menabung, atau melamar pekerjaan lain, betapa lebih Ia memperhatikan anak-anak-Nya yang diciptakan menurut gambar-Nya, yang mampu berdoa, khawatir, dan berharap?

Ini bukan janji bahwa kamu tidak akan pernah mengalami masa lapar. Alkitab penuh dengan orang-orang yang berpuasa, yang kehabisan, yang benar-benar bertanya-tanya dari mana penyediaan berikutnya akan datang — termasuk Elia, yang diberi makan oleh burung gagak di tengah masa kekeringan yang bukan ia ciptakan dan tidak bisa ia akhiri sendiri. Yang burung-burung ajarkan bukanlah ketiadaan kebutuhan, melainkan kehadiran seorang Bapa yang memperhatikan kebutuhan itu dan menjawabnya, bahkan lewat cara yang tak pernah kita rencanakan sendiri.

Jika hari ini adalah hari mencari lowongan pekerjaan, memeriksa kotak masuk berulang kali, atau menunggu kabar dari wawancara, biarlah ini menjadi dasar di bawah semuanya: kamu tidak dilupakan. Perhatian yang sama yang memberi makan burung pipit belum pernah lepas dari hidupmu.',
    'Where have you been quietly measuring your worth by your income? Let the Father''s attentiveness say something truer about your value today.', 'Di mana selama ini kamu diam-diam mengukur nilai dirimu dari penghasilanmu? Biarkan perhatian Bapa berbicara sesuatu yang lebih benar tentang nilaimu hari ini.',
    'Lord, forgive me for measuring my worth by my paycheck. Thank You for watching over me the way You watch over the smallest bird. Give me eyes to notice the ways You are already providing, even before this season ends. Amen.', 'Tuhan, ampuni aku karena mengukur nilai diriku dari gajiku. Terima kasih karena Engkau menjaga aku sebagaimana Engkau menjaga burung yang paling kecil sekalipun. Berikan aku mata untuk melihat cara-cara Engkau sudah menyediakan, bahkan sebelum masa sulit ini berakhir. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:26', 'WEB', 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:26', 'TB', 'Pandanglah burung-burung di langit, yang tidak menabur dan tidak menuai dan tidak mengumpulkan bekal dalam lumbung, namun diberi makan oleh Bapamu yang di sorga; bukankah kamu jauh melebihi burung-burung itu?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'When You Can''t See the Whole Path', 'Ketika Kamu Tak Bisa Melihat Seluruh Jalan',
    'One of the hardest parts of financial hardship is not the lack itself but the uncertainty around it. If you knew exactly when the job would come, exactly when the debt would clear, exactly how the next six months would unfold, you could brace yourself and push through. What wears people down is not knowing — applying for the tenth position with no reply, watching a due date approach with no clear way to meet it, making a decision about which bill to pay first without knowing if it''s the right call.

Proverbs 3 was written into exactly that kind of uncertainty. "Lean not on your own understanding" is not an instruction to stop thinking, planning, or being wise with what you have. It is an honest acknowledgment that your own understanding has limits — you cannot see around the corner, you cannot control an employer''s decision, you cannot force a market to recover on your timeline. Trusting God with all your heart means bringing Him into the parts of the plan you cannot see, not just the parts you can.

There is real freedom in this. It means you do not have to have it all figured out today. You do not need a five-year plan to take one faithful step this afternoon — sending one more application, having one honest conversation about a payment plan, asking for help without shame. The promise is not that the path will be visible all at once, but that it will be made straight as you walk it with Him, one step revealed at a time.

If you have been carrying the weight of needing to know how this all resolves, consider setting that weight down today. You are allowed to take the next right step without seeing the last one.', 'Salah satu bagian tersulit dari kesulitan keuangan bukanlah kekurangan itu sendiri, melainkan ketidakpastian di sekitarnya. Jika kamu tahu persis kapan pekerjaan itu akan datang, kapan utang akan lunas, bagaimana enam bulan ke depan akan berjalan, kamu bisa bersiap dan terus melangkah. Yang membuat orang lelah adalah ketidaktahuan — melamar untuk kesepuluh kalinya tanpa balasan, melihat tanggal jatuh tempo semakin dekat tanpa cara yang jelas untuk memenuhinya, memutuskan tagihan mana yang harus dibayar lebih dulu tanpa tahu apakah itu pilihan yang tepat.

Amsal pasal 3 ditulis tepat ke dalam ketidakpastian semacam itu. "Janganlah bersandar kepada pengertianmu sendiri" bukanlah perintah untuk berhenti berpikir, merencanakan, atau bijaksana dengan apa yang kamu miliki. Ini adalah pengakuan jujur bahwa pengertianmu sendiri ada batasnya — kamu tidak bisa melihat apa yang ada di balik tikungan, kamu tidak bisa mengendalikan keputusan seorang atasan, kamu tidak bisa memaksa pasar pulih sesuai jadwalmu. Percaya kepada TUHAN dengan segenap hati berarti melibatkan Dia dalam bagian-bagian rencana yang tak bisa kamu lihat, bukan hanya bagian yang bisa.

Ada kebebasan yang nyata dalam hal ini. Artinya kamu tidak harus sudah tahu semuanya hari ini. Kamu tidak butuh rencana lima tahun untuk mengambil satu langkah setia sore ini — mengirim satu lamaran lagi, melakukan satu percakapan jujur tentang cicilan pembayaran, meminta bantuan tanpa rasa malu. Janji itu bukan bahwa seluruh jalan akan langsung terlihat, melainkan bahwa jalan itu akan diluruskan selagi kamu berjalan bersama-Nya, satu langkah demi satu langkah dinyatakan.

Jika selama ini kamu memikul beban harus tahu bagaimana semua ini akan berakhir, pertimbangkan untuk meletakkan beban itu hari ini. Kamu diizinkan mengambil langkah benar berikutnya tanpa harus melihat langkah terakhir.',
    'What is one faithful next step you can take today, even without knowing the whole outcome?', 'Apa satu langkah setia berikutnya yang bisa kamu ambil hari ini, sekalipun kamu belum tahu hasil akhirnya?',
    'Lord, I don''t need to see the whole path today — I just need to trust the One walking it with me. Straighten what I cannot see, and give me courage for the next honest step. Amen.', 'Tuhan, aku tidak perlu melihat seluruh jalan hari ini — aku hanya perlu percaya kepada Pribadi yang berjalan bersamaku. Luruskanlah apa yang tak bisa kulihat, dan berikan aku keberanian untuk langkah jujur berikutnya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Proverbs 3:5-6', 'WEB', 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Amsal 3:5-6', 'TB', 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'The Presence That Doesn''t Get Repossessed', 'Penyertaan yang Tak Pernah Bisa Disita',
    'There is a specific fear that financial hardship stirs up that has nothing to do with math: the fear of being alone in it. Of watching people quietly step back because your situation makes them uncomfortable. Of feeling like a burden to family, a disappointment to yourself, someone other people politely avoid asking too much about. Scarcity does not just threaten your bank account — it can threaten your sense of belonging.

The writer of Hebrews places a promise about God''s presence right alongside a warning about the love of money, and that placement is not an accident. It''s as if he is saying: whatever this season costs you, whatever it takes from your accounts, there is one thing hardship cannot repossess — the nearness of God to you. Job loss can end an employment contract. It cannot end this one.

This promise, quoting words originally spoken to Joshua as he faced an intimidating, uncertain future, has carried God''s people through wilderness wandering, exile, and every kind of scarcity since. It was never a promise that circumstances would be easy. It was a promise that they would not be walked through alone. That is not a small thing when hardship makes you feel invisible.

As this short plan closes, let this be what stays with you: your bank balance may rise and fall, your job status may change more than once before this season is over, but the presence of God over your life is not contingent on any of it. He has not left, and He will not leave. Whatever this week holds, you walk into it accompanied.', 'Ada ketakutan tertentu yang muncul akibat kesulitan keuangan yang sama sekali tidak berkaitan dengan angka: ketakutan akan sendirian menghadapinya. Melihat orang-orang diam-diam menjauh karena keadaanmu membuat mereka tidak nyaman. Merasa menjadi beban bagi keluarga, kekecewaan bagi diri sendiri, seseorang yang orang lain sungkan tanyakan lebih jauh. Kekurangan tidak hanya mengancam rekening bankmu — ia bisa mengancam rasa memilikimu.

Penulis Ibrani menempatkan janji tentang kehadiran Allah tepat di sebelah peringatan tentang cinta akan uang, dan penempatan itu bukan kebetulan. Seolah-olah ia berkata: apa pun yang direnggut oleh musim ini darimu, apa pun yang diambil dari rekeningmu, ada satu hal yang tidak bisa disita oleh kesulitan — kedekatan Allah denganmu. Kehilangan pekerjaan bisa mengakhiri sebuah kontrak kerja. Ia tidak bisa mengakhiri kedekatan yang satu ini.

Janji ini, yang mengutip kata-kata yang mula-mula diucapkan kepada Yosua saat ia menghadapi masa depan yang menakutkan dan tidak pasti, telah menopang umat Allah melewati pengembaraan di padang gurun, pembuangan, dan segala jenis kekurangan sejak itu. Janji ini tidak pernah berarti bahwa keadaan akan menjadi mudah. Ia adalah janji bahwa mereka tidak akan menjalaninya sendirian. Itu bukan hal kecil ketika kesulitan membuatmu merasa tak terlihat.

Saat rencana singkat ini berakhir, biarlah inilah yang tetap tinggal bersamamu: saldo rekeningmu mungkin naik turun, status pekerjaanmu mungkin berubah lebih dari sekali sebelum musim ini berlalu, tetapi penyertaan Allah atas hidupmu tidak bergantung pada semua itu. Ia belum pergi, dan Ia tidak akan pergi. Apa pun yang dibawa minggu ini, kamu akan menjalaninya dengan ditemani.',
    'Who is one person you could let in on this hardship this week, instead of carrying it alone?', 'Siapa satu orang yang bisa kamu libatkan dalam kesulitan ini minggu ini, alih-alih memikulnya sendirian?',
    'Father, thank You that Your presence is not something this season can take from me. When I feel forgotten, remind me that You have not left. Give me courage to let others walk with me too. Amen.', 'Bapa, terima kasih karena kehadiran-Mu bukanlah sesuatu yang bisa direnggut oleh musim ini. Saat aku merasa dilupakan, ingatkan aku bahwa Engkau belum pergi. Berikan aku keberanian untuk membiarkan orang lain juga berjalan bersamaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Hebrews 13:5', 'WEB', 'Keep your lives free from the love of money and be content with what you have, because God has said, "Never will I leave you; never will I forsake you."');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ibrani 13:5', 'TB', 'Janganlah kamu menjadi hamba uang dan cukupkanlah dirimu dengan apa yang ada padamu, sebab Allah telah berfirman: "Aku sekali-kali tidak akan membiarkan engkau dan Aku sekali-kali tidak akan meninggalkan engkau."');

  -- Plan: Strength for the Weary Body
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Strength for the Weary Body',
    'Kekuatan bagi Tubuh yang Letih',
    'Holding on to faith through illness, fatigue, and long recovery',
    'Tetap Berpegang pada Iman di Tengah Sakit, Kelelahan, dan Masa Pemulihan yang Panjang',
    7,
    'A seven-day companion for anyone whose body has become the site of their hardest waiting — a diagnosis, a chronic condition, an exhaustion that sleep no longer fixes. Each day sits with a familiar promise about God''s nearness to the weak and weary, not to rush anyone toward healing, but to keep faith breathing through the slow, uncertain middle of sickness and recovery.',
    'Rencana pendamping tujuh hari bagi siapa saja yang tubuhnya telah menjadi tempat penantian tersulit — sebuah diagnosis, kondisi kronis, kelelahan yang bahkan tidur pun tak lagi bisa memulihkan. Setiap hari kita berdiam bersama janji Allah yang sudah dikenal tentang kedekatan-Nya dengan yang lemah dan letih, bukan untuk terburu-buru menuju kesembuhan, melainkan untuk menjaga iman tetap bernapas melalui masa tengah yang lambat dan tidak pasti dari sakit dan pemulihan.',
    '/images/devotions/strength-for-the-weary-body.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'When the Body Won''t Cooperate', 'Ketika Tubuh Tak Lagi Mau Bekerja Sama',
    'There is a particular grief in a body that no longer does what you ask of it. Maybe it''s a diagnosis that rearranged your calendar overnight, a chronic condition that has quietly redefined what a good day looks like, or an exhaustion so deep that even rest doesn''t seem to touch it. Illness has a way of shrinking the world down to symptoms and appointments, and faith can feel like one more thing you don''t have the energy to hold onto.

Isaiah wrote these familiar words about renewed strength to a weary, exiled people who had every reason to feel forgotten. He does not promise that the waiting will be short or that the eagle''s flight comes without effort. What he promises is a source of strength that does not originate in the body''s own reserves — a strength that comes from hoping in the Lord rather than from having enough left in the tank on your own.

There''s a progression tucked into this verse that many overlook: soaring like eagles, running without growing weary, walking without fainting. Sometimes faith during illness looks like soaring days, full of clarity and hope. More often, especially in a long recovery, it looks like the slower posture — simply walking, one unremarkable step following another, without collapsing. That, too, is the strength being described here. It does not always look dramatic. It often looks like getting up again tomorrow.

If today all you can manage is the walking kind of faith, that is not a lesser faith. Hoping in the Lord does not require energy you don''t have — it requires only a willingness to keep turning your face toward Him, even from a hospital bed, even from the couch, even from wherever this illness has confined you today.', 'Ada duka tersendiri dalam sebuah tubuh yang tidak lagi mau melakukan apa yang kamu minta. Mungkin itu diagnosis yang mengubah seluruh jadwalmu dalam semalam, kondisi kronis yang diam-diam mendefinisikan ulang seperti apa hari yang baik itu, atau kelelahan yang begitu dalam sehingga istirahat pun tampaknya tidak menyentuhnya. Sakit punya cara mempersempit dunia menjadi sekadar gejala dan jadwal kontrol dokter, dan iman bisa terasa seperti satu hal lagi yang tak lagi punya energi untuk dipegang.

Yesaya menuliskan kata-kata yang dikenal ini tentang kekuatan yang diperbarui kepada umat yang letih dan terbuang, yang punya segala alasan untuk merasa dilupakan. Ia tidak menjanjikan bahwa penantian akan singkat atau bahwa terbang seperti rajawali datang tanpa usaha. Yang ia janjikan adalah sumber kekuatan yang bukan berasal dari cadangan tubuh sendiri — kekuatan yang datang dari menanti-nantikan TUHAN, bukan dari cukup tidaknya tenaga yang tersisa dalam dirimu sendiri.

Ada tahapan tersembunyi dalam ayat ini yang sering terlewat: terbang tinggi seperti rajawali, berlari tanpa menjadi lesu, berjalan tanpa menjadi lelah. Kadang iman di tengah sakit tampak seperti hari-hari yang terbang tinggi, penuh kejernihan dan harapan. Namun lebih sering, terutama dalam pemulihan yang panjang, ia tampak seperti sikap yang lebih lambat — sekadar berjalan, satu langkah biasa mengikuti langkah lain, tanpa roboh. Itu juga kekuatan yang digambarkan di sini. Ia tidak selalu tampak dramatis. Ia sering kali hanya tampak seperti bangun lagi besok.

Jika hari ini yang bisa kamu lakukan hanyalah iman yang seperti berjalan, itu bukan iman yang lebih rendah. Menanti-nantikan TUHAN tidak menuntut energi yang tak kamu miliki — ia hanya menuntut kesediaan untuk terus mengarahkan wajahmu kepada-Nya, bahkan dari ranjang rumah sakit, bahkan dari sofa, bahkan dari mana pun sakit ini mengurungmu hari ini.',
    'What does faithfulness look like for you today — soaring, running, or simply walking? Give yourself permission for whichever it is.', 'Seperti apa kesetiaan bagimu hari ini — terbang tinggi, berlari, atau sekadar berjalan? Izinkan dirimu menerima yang mana pun itu.',
    'Lord, my body is tired in ways I cannot always explain. Renew my strength according to Your promise, not according to what I have left on my own. Meet me in the walking days as much as the soaring ones. Amen.', 'Tuhan, tubuhku lelah dengan cara yang tidak selalu bisa kujelaskan. Perbaruilah kekuatanku menurut janji-Mu, bukan menurut apa yang tersisa dari diriku sendiri. Jumpai aku di hari-hari yang hanya berjalan, sama seperti di hari-hari yang terbang tinggi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 40:31', 'WEB', 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 40:31', 'TB', 'tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayap seperti burung rajawali; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'A Shepherd in the Waiting Room', 'Gembala di Ruang Tunggu',
    'Waiting rooms have a particular kind of silence — the low hum of fluorescent lights, the sound of a name being called, the strange mixture of hope and dread that comes before test results. Illness does not just take a toll on the body; it takes a toll on the imagination, filling it with scenarios both possible and unlikely. In that silence, it can be hard to picture God as anything other than distant, occupied with bigger concerns than your particular scan or your particular pain.

Psalm 23 was written by someone who knew what it meant to be hunted, hungry, and afraid — a shepherd himself before he was a king, familiar with the real dangers sheep faced in rocky, shadowed terrain. When David writes about green pastures and quiet waters, he is not describing an easy life free of threat. He is describing a shepherd''s active care in the middle of a life that included real valleys, real darkness, real reason to fear.

Notice what the psalm does not say: it does not say the valley is avoided. It says, ''even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.'' The comfort is not the absence of the valley. It is the presence of the Shepherd inside it. That is precisely the kind of comfort illness calls for — not a promise that hard seasons will bypass you, but a promise that you do not walk through them followed at a distance. You are led through them, staff and rod both, protection and guidance close at hand.

If today feels like a valley — a hard appointment, a diagnosis you''re still absorbing, a body that keeps surprising you in ways you didn''t ask for — let the ancient shepherd''s words be true again: He is with you. Not watching from far off, but walking the terrain beside you, restoring your soul even when your body cannot yet be restored.', 'Ruang tunggu punya kesunyian tersendiri — dengungan lampu neon yang samar, suara nama dipanggil, campuran aneh antara harapan dan kecemasan sebelum hasil tes keluar. Sakit tidak hanya membebani tubuh; ia membebani imajinasi, mengisinya dengan berbagai kemungkinan, baik yang masuk akal maupun yang tidak. Dalam kesunyian itu, sulit membayangkan Allah sebagai apa pun selain jauh, sibuk dengan urusan yang lebih besar daripada hasil pindaimu atau rasa sakitmu yang khusus itu.

Mazmur 23 ditulis oleh seseorang yang tahu betul artinya diburu, lapar, dan takut — seorang gembala sebelum ia menjadi raja, akrab dengan bahaya nyata yang dihadapi domba di medan berbatu dan gelap. Ketika Daud menulis tentang padang rumput hijau dan air yang tenang, ia tidak sedang menggambarkan hidup yang mudah dan bebas ancaman. Ia sedang menggambarkan perhatian aktif seorang gembala di tengah kehidupan yang mencakup lembah nyata, kegelapan nyata, alasan nyata untuk takut.

Perhatikan apa yang tidak dikatakan mazmur ini: ia tidak berkata lembah itu dihindari. Ia berkata, ''sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku.'' Penghiburan itu bukanlah ketiadaan lembah. Penghiburan itu adalah kehadiran Sang Gembala di dalamnya. Itulah tepatnya jenis penghiburan yang dibutuhkan sakit — bukan janji bahwa masa-masa sulit akan melewatimu, melainkan janji bahwa kamu tidak menjalaninya diikuti dari kejauhan. Kamu dituntun melewatinya, gada dan tongkat sekaligus, perlindungan dan bimbingan dekat di tanganmu.

Jika hari ini terasa seperti lembah — janji temu yang berat, diagnosis yang masih kamu cerna, tubuh yang terus mengejutkanmu dengan cara yang tak kamu minta — biarlah kata-kata gembala kuno itu kembali menjadi nyata: Ia besertamu. Bukan mengawasi dari jauh, melainkan berjalan di medan itu di sampingmu, menyegarkan jiwamu bahkan ketika tubuhmu belum bisa dipulihkan.',
    'In your current ''valley,'' where have you felt God''s presence, even faintly — through a person, a moment of peace, an answered small prayer?', 'Dalam ''lembah'' yang sedang kamu jalani, di mana kamu merasakan kehadiran Allah, sekalipun samar — lewat seseorang, momen damai, atau doa kecil yang terjawab?',
    'Good Shepherd, this valley feels long and I cannot see the other side yet. Thank You for walking it with me rather than watching from far away. Refresh my soul today, even where my body cannot yet be refreshed. Amen.', 'Gembala yang baik, lembah ini terasa panjang dan aku belum bisa melihat ujungnya. Terima kasih karena Engkau berjalan bersamaku, bukan sekadar mengawasi dari kejauhan. Segarkanlah jiwaku hari ini, sekalipun tubuhku belum bisa disegarkan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 23:1-4', 'WEB', 'The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. Even though I walk through the darkest valley, I will fear no evil, for you are with me.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 23:1-4', 'TB', 'TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang; Ia menyegarkan jiwaku. Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Grace That Meets Weakness', 'Kasih Karunia yang Menjumpai Kelemahan',
    'Chronic illness has a way of teaching you your own limits in a merciless kind of detail. You learn exactly how far you can push before your body pushes back, exactly which activities cost more than they''re worth, exactly what it feels like to cancel plans again because today simply isn''t a good day. There is grief in that learning, and there is often shame tangled up in it too — a quiet sense that you should be able to do more, be more, keep up more.

Paul understood this kind of limitation intimately. He describes a persistent, painful affliction he calls a ''thorn in the flesh,'' something he pleaded with God three times to remove. We don''t know exactly what it was — chronic pain, a vision problem, a recurring illness — but we know God''s answer, and it isn''t the one Paul asked for. Instead of removing the weakness, God gave Paul something else: the assurance that His grace was enough to carry Paul through it.

This is one of the more countercultural claims in all of Scripture: that weakness is not simply tolerated by God but can become the very place where His power is most clearly seen. Not because suffering is good in itself, but because weakness strips away the illusion that we are sustaining ourselves. When you are too tired to fake strength, grace has room to be visibly, undeniably present.

If your body has taught you your limits this week, you are in good company with the apostle who wrote some of the New Testament''s most hope-filled letters from a place of real physical limitation. His weakness did not disqualify him from being used by God. In many ways, it became the very context in which God''s power was displayed most clearly. The same can be true in your story, even if you cannot yet see how.', 'Sakit kronis punya cara mengajarkanmu batasanmu sendiri dengan detail yang tanpa ampun. Kamu belajar persis seberapa jauh kamu bisa mendorong diri sebelum tubuhmu melawan balik, persis aktivitas mana yang lebih mahal daripada manfaatnya, persis bagaimana rasanya membatalkan rencana lagi karena hari ini bukan hari yang baik. Ada duka dalam pembelajaran itu, dan sering kali ada rasa malu yang terjalin di dalamnya juga — perasaan diam-diam bahwa seharusnya kamu bisa melakukan lebih, menjadi lebih, mengikuti lebih.

Paulus memahami betul jenis keterbatasan ini. Ia menggambarkan sebuah penderitaan yang terus-menerus dan menyakitkan yang ia sebut ''duri dalam daging,'' sesuatu yang ia mohonkan kepada Allah sebanyak tiga kali agar diangkat. Kita tidak tahu persis apa itu — rasa sakit kronis, masalah penglihatan, penyakit yang berulang — tetapi kita tahu jawaban Allah, dan itu bukan jawaban yang Paulus minta. Alih-alih mengangkat kelemahan itu, Allah memberi Paulus sesuatu yang lain: jaminan bahwa kasih karunia-Nya cukup untuk menopang Paulus melaluinya.

Ini adalah salah satu pernyataan yang paling melawan arus dalam seluruh Alkitab: bahwa kelemahan bukan sekadar ditoleransi oleh Allah, melainkan bisa menjadi tempat di mana kuasa-Nya paling jelas terlihat. Bukan karena penderitaan itu baik dengan sendirinya, melainkan karena kelemahan menyingkirkan ilusi bahwa kita menopang diri sendiri. Ketika kamu terlalu lelah untuk berpura-pura kuat, kasih karunia mendapat ruang untuk hadir secara nyata dan tak terbantahkan.

Jika tubuhmu telah mengajarkanmu batasanmu minggu ini, kamu berada dalam kebersamaan yang baik dengan rasul yang menulis beberapa surat Perjanjian Baru yang paling penuh harapan justru dari tempat keterbatasan fisik yang nyata. Kelemahannya tidak mendiskualifikasi dia untuk dipakai Allah. Dalam banyak hal, itu justru menjadi konteks di mana kuasa Allah dinyatakan paling jelas. Hal yang sama bisa terjadi dalam kisahmu, sekalipun kamu belum bisa melihat bagaimana caranya.',
    'Where has shame crept into your limitations? Try replacing it today with Paul''s honesty: this is a weakness, and grace is meeting me in it.', 'Di mana rasa malu telah menyusup ke dalam keterbatasanmu? Cobalah gantikan hari ini dengan kejujuran Paulus: ini adalah kelemahan, dan kasih karunia sedang menjumpaiku di dalamnya.',
    'Lord, I am tired of my own limits, and sometimes ashamed of them. Thank You that Your grace does not require my strength to be enough. Let Your power be seen in me, especially in the places I feel weakest. Amen.', 'Tuhan, aku lelah dengan batasanku sendiri, dan kadang malu karenanya. Terima kasih karena kasih karunia-Mu tidak menuntut kekuatanku harus cukup. Biarlah kuasa-Mu terlihat dalam diriku, terutama di tempat-tempat aku merasa paling lemah. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Corinthians 12:9', 'WEB', 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ''s power may rest on me.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Korintus 12:9', 'TB', 'Tetapi jawab Tuhan kepadaku: "Cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna." Sebab itu terlebih suka aku bermegah atas kelemahanku, supaya kuasa Kristus turun menaungi aku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Near to the Broken', 'Dekat dengan yang Patah Hati',
    'Long illness has a way of wearing down more than the body. It wears down the spirit too — the discouragement of a treatment that isn''t working as hoped, the loneliness of friends who don''t know what to say anymore, the quiet grief over a version of life you thought you''d be living by now. It is entirely possible to be a person of real faith and still find yourself brokenhearted in the middle of a health crisis. Those two things are not contradictions.

The psalmist doesn''t shy away from naming that brokenness plainly. Psalm 34 was written by David during one of the more humiliating episodes of his life, and yet it turns, verse after verse, toward praise and toward a promise: that the Lord is close to the brokenhearted. Not close to those who have it together. Not close to those who have moved past their pain into tidy resolution. Close to the brokenhearted — meaning close to exactly where you might be standing today.

This closeness is not sentimental language. The Hebrew word behind ''crushed in spirit'' describes something genuinely shattered, not merely disappointed. God is not distant from that kind of pain, waiting for you to pull yourself together before He''ll draw near. The nearness comes first. It meets you in the collapse, not only after the recovery.

If illness has left your spirit as tired as your body, you do not have to perform wellness to be near to God today. He is already near to you — not because you''ve earned it through resilience, but because brokenheartedness is precisely the condition this promise was written for.', 'Sakit yang berkepanjangan punya cara mengikis lebih dari sekadar tubuh. Ia mengikis jiwa juga — kekecewaan karena pengobatan yang tidak berjalan seperti diharapkan, kesepian karena teman-teman yang tak lagi tahu harus berkata apa, duka yang tersembunyi atas versi kehidupan yang kau kira sudah kau jalani sekarang. Sangat mungkin menjadi orang yang benar-benar beriman dan tetap mendapati dirimu patah hati di tengah krisis kesehatan. Kedua hal itu bukanlah pertentangan.

Sang pemazmur tidak segan menyebut kepatahan itu secara jelas. Mazmur 34 ditulis Daud pada salah satu episode paling memalukan dalam hidupnya, namun ia berbalik, ayat demi ayat, menuju pujian dan menuju sebuah janji: bahwa TUHAN dekat kepada orang-orang yang patah hati. Bukan dekat kepada mereka yang sudah baik-baik saja. Bukan dekat kepada mereka yang sudah melewati rasa sakitnya menuju penyelesaian yang rapi. Dekat kepada yang patah hati — artinya dekat tepat di tempat kamu mungkin sedang berdiri hari ini.

Kedekatan ini bukanlah bahasa sentimental belaka. Kata Ibrani di balik ''remuk jiwanya'' menggambarkan sesuatu yang benar-benar hancur, bukan sekadar kecewa. Allah tidak jauh dari jenis rasa sakit itu, menunggu kamu memulihkan diri lebih dulu sebelum Ia mendekat. Kedekatan itu datang lebih dulu. Ia menjumpaimu dalam keruntuhan, bukan hanya setelah pemulihan.

Jika sakit telah membuat jiwamu selelah tubuhmu, kamu tidak perlu berpura-pura sehat untuk dekat dengan Allah hari ini. Ia sudah dekat denganmu — bukan karena kamu telah mendapatkannya lewat ketangguhan, melainkan karena patah hati justru adalah kondisi yang untuknya janji ini ditulis.',
    'You do not have to feel strong to be close to God today. What would it look like to bring Him your discouragement honestly, exactly as it is?', 'Kamu tidak perlu merasa kuat untuk dekat dengan Allah hari ini. Seperti apa jadinya jika kamu membawa kekecewaanmu kepada-Nya dengan jujur, persis seperti adanya?',
    'Lord, my spirit is tired along with my body. Thank You that You are close to me exactly as broken as I feel right now, with no performance required. Meet my discouragement with Your nearness today. Amen.', 'Tuhan, jiwaku lelah bersama tubuhku. Terima kasih karena Engkau dekat denganku persis dalam kepatahan yang kurasakan sekarang, tanpa perlu pura-pura kuat. Jumpai kekecewaanku dengan kedekatan-Mu hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 34:18', 'WEB', 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 34:19', 'TB', 'TUHAN dekat kepada orang-orang yang patah hati, dan menyelamatkan orang-orang yang remuk jiwanya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'An Invitation, Not a Demand', 'Sebuah Undangan, Bukan Tuntutan',
    'Illness often arrives with a long list of demands: appointments to keep, medications to remember, forms to fill out, questions from well-meaning people that require energy you don''t have to answer. In the middle of all that, it can be easy to assume God has demands too — that faith means one more obligation to meet, one more thing to get right while you''re already running on empty.

Jesus'' words in Matthew 11 read very differently. He does not say, ''Come to me, all who have proven themselves strong enough.'' He says, ''Come to me, all you who are weary and burdened.'' The weariness itself is the qualification. He is not asking the tired to first become less tired before approaching Him. He is inviting the exhausted exactly as they are, mid-exhaustion, to come find rest in Him.

The rest Jesus offers is not necessarily the removal of the illness or the burden itself — many who came to Him carried their conditions with them into His presence and found something there beyond physical relief. It is a rest for the soul, a place where you don''t have to hold everything together, where the posture is not performance but simply coming. That kind of rest is available in a hospital bed as much as anywhere else.

If today has felt like one more demand on a body and spirit that have little left to give, hear this invitation freshly: you are not being asked to arrive strong. You are being invited to arrive tired, and to let that be enough.', 'Sakit sering datang dengan daftar tuntutan yang panjang: janji temu yang harus dipenuhi, obat yang harus diingat, formulir yang harus diisi, pertanyaan dari orang-orang yang bermaksud baik namun membutuhkan energi yang tak kamu miliki untuk menjawabnya. Di tengah semua itu, mudah untuk mengira Allah pun punya tuntutan — bahwa iman berarti satu kewajiban lagi yang harus dipenuhi, satu hal lagi yang harus dilakukan dengan benar sementara kamu sudah kehabisan tenaga.

Kata-kata Yesus dalam Matius 11 terdengar sangat berbeda. Ia tidak berkata, ''Marilah kepada-Ku, semua yang telah membuktikan diri cukup kuat.'' Ia berkata, ''Marilah kepada-Ku, semua yang letih lesu dan berbeban berat.'' Kelelahan itu sendiri adalah syaratnya. Ia tidak meminta yang lelah untuk lebih dulu menjadi kurang lelah sebelum mendekat kepada-Nya. Ia mengundang yang kelelahan persis seperti adanya, di tengah kelelahan itu, untuk datang menemukan kelegaan di dalam Dia.

Kelegaan yang Yesus tawarkan tidak selalu berarti hilangnya sakit atau beban itu sendiri — banyak yang datang kepada-Nya membawa kondisi mereka ke dalam hadirat-Nya dan menemukan sesuatu di sana yang melampaui kelegaan fisik. Ini adalah kelegaan bagi jiwa, sebuah tempat di mana kamu tidak harus menahan semuanya sendiri, di mana sikap yang dibutuhkan bukanlah unjuk kekuatan, melainkan sekadar datang. Kelegaan semacam itu tersedia di ranjang rumah sakit sama seperti di tempat mana pun.

Jika hari ini terasa seperti satu tuntutan lagi bagi tubuh dan jiwa yang sudah tak banyak tersisa untuk diberikan, dengarkanlah undangan ini kembali dengan segar: kamu tidak diminta untuk datang dengan kuat. Kamu diundang untuk datang dengan lelah, dan biarkan itu menjadi cukup.',
    'What would it look like to bring your exhaustion to Jesus today without first trying to fix it yourself?', 'Seperti apa jadinya jika kamu membawa kelelahanmu kepada Yesus hari ini tanpa lebih dulu mencoba memperbaikinya sendiri?',
    'Jesus, I am weary and I don''t have to pretend otherwise with You. Thank You for inviting me exactly as tired as I am. Give my soul the rest my body still needs to find. Amen.', 'Yesus, aku letih dan aku tidak perlu berpura-pura lain di hadapan-Mu. Terima kasih karena Engkau mengundangku persis selelah apa adanya diriku. Berikan jiwaku kelegaan yang tubuhku masih perlu temukan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 11:28', 'WEB', 'Come to me, all you who are weary and burdened, and I will give you rest.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 11:28', 'TB', 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'Working Even Here', 'Tetap Bekerja Bahkan di Sini',
    'Romans 8:28 is one of those verses that can be misused if it''s handed to someone too quickly, too casually, as though it explains away real suffering. It doesn''t say that illness is good. It doesn''t say that pain has an obvious silver lining you''re supposed to go find. Read carefully, it says something more careful and more durable than that: that God works in all things — not that all things are good in themselves, but that God is actively working within them toward good, for those who love Him.

This is a promise about God''s ongoing activity, not a promise about your circumstances'' inherent value. A diagnosis is not a blessing in disguise to be thanked for. But even inside a diagnosis, even inside a long recovery with no guaranteed timeline, this verse insists God has not stepped back to watch from a distance. He remains at work, weaving purpose through even the hardest chapters, in ways that are not always visible from inside the chapter itself.

Paul wrote this letter as someone well acquainted with hardship — imprisonment, physical suffering, uncertainty about his own future. He was not offering easy comfort from a position of safety. He had tested this promise against real affliction and found it durable enough to build a theology on. That should give the promise more weight, not less, when you''re the one testing it now.

You may not see the good yet. You may not see it for years, or ever fully in this life. But this verse asks you to trust the direction of God''s work rather than the visibility of its results — to believe that even this current chapter, as hard as it is, is not outside the reach of His purposes for you.', 'Roma 8:28 adalah salah satu ayat yang bisa disalahgunakan jika disampaikan terlalu cepat, terlalu ringan, seakan-akan ia menjelaskan habis penderitaan yang nyata. Ayat ini tidak berkata bahwa sakit itu baik. Ia tidak berkata bahwa rasa sakit punya sisi terang yang jelas dan harus kau temukan. Dibaca dengan saksama, ayat ini mengatakan sesuatu yang lebih hati-hati dan lebih tahan lama daripada itu: bahwa Allah bekerja dalam segala sesuatu — bukan berarti segala sesuatu itu baik dengan sendirinya, melainkan bahwa Allah secara aktif bekerja di dalamnya menuju kebaikan, bagi mereka yang mengasihi-Nya.

Ini adalah janji tentang aktivitas Allah yang terus berlangsung, bukan janji tentang nilai bawaan dari keadaanmu. Diagnosis bukanlah berkat terselubung yang harus disyukuri begitu saja. Tetapi bahkan di dalam sebuah diagnosis, bahkan di dalam pemulihan panjang tanpa jadwal yang pasti, ayat ini menegaskan bahwa Allah tidak mundur untuk sekadar mengawasi dari kejauhan. Ia tetap bekerja, menenun tujuan bahkan melalui pasal-pasal tersulit, dengan cara yang tidak selalu terlihat dari dalam pasal itu sendiri.

Paulus menulis surat ini sebagai seseorang yang sangat akrab dengan kesulitan — pemenjaraan, penderitaan fisik, ketidakpastian tentang masa depannya sendiri. Ia tidak menawarkan penghiburan mudah dari posisi yang aman. Ia telah menguji janji ini melawan penderitaan yang nyata dan mendapatinya cukup kokoh untuk membangun teologi di atasnya. Itu seharusnya memberi bobot lebih pada janji ini, bukan lebih sedikit, ketika kamulah yang sedang mengujinya sekarang.

Kamu mungkin belum melihat kebaikan itu. Kamu mungkin tidak melihatnya selama bertahun-tahun, atau bahkan tidak sepenuhnya dalam hidup ini. Tetapi ayat ini memintamu untuk percaya pada arah pekerjaan Allah, bukan pada keterlihatan hasilnya — untuk percaya bahwa bahkan pasal yang sedang kau jalani sekarang, sesulit apa pun itu, tidak berada di luar jangkauan rencana-Nya bagimu.',
    'Where might you be waiting to see ''the good'' before you trust that God is working? What would it mean to trust the work even before you see the result?', 'Di manakah selama ini kamu menunggu melihat ''kebaikan'' itu sebelum percaya bahwa Allah sedang bekerja? Apa artinya mempercayai pekerjaan-Nya bahkan sebelum kamu melihat hasilnya?',
    'Lord, I don''t ask You to explain this illness to me today — I ask You to keep working within it, even where I cannot see. Help me trust Your ongoing work more than I trust visible results. Amen.', 'Tuhan, aku tidak meminta-Mu menjelaskan sakit ini kepadaku hari ini — aku memohon Engkau tetap bekerja di dalamnya, bahkan di tempat yang tak bisa kulihat. Tolong aku mempercayai pekerjaan-Mu yang terus berlangsung lebih daripada aku mempercayai hasil yang terlihat. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 8:28', 'WEB', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 8:28', 'TB', 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'A Hope Bigger Than This Body', 'Harapan yang Lebih Besar dari Tubuh Ini',
    'Seven days into sitting with a weary body is enough time to feel the weight of a simple question: how long? Illness, especially chronic or long-term illness, has a way of making the future feel foggy, uncertain, sometimes frightening to even imagine. It''s tempting, in that fog, to let hope shrink down to the size of the next test result, the next treatment, the next okay day.

Revelation 21 offers something bigger than the next appointment. Written to a persecuted, suffering church, it does not describe an escape from hardship achieved through cleverness or willpower — it describes God Himself doing the healing, personally, tenderly: ''He will wipe every tear from their eyes.'' Not a distant decree from a throne room, but an intimate, close gesture, the kind a parent makes for a crying child.

This is not a promise meant to minimize what your body is carrying right now, as though the pain doesn''t matter because eternity is coming. It matters enormously, and God is not indifferent to it in the meantime — as the earlier days of this plan have shown, He is near, He is working, His grace is present in the weakness. But this final promise widens the horizon. Death, mourning, crying, and pain are described as part of ''the old order of things'' — real, but not final. Your body''s story does not end where illness currently has it.

As this plan closes, let your hope stretch beyond this diagnosis, this treatment plan, this weary season, without dismissing how hard it is to live inside right now. You are held by a God who is present in today''s fatigue and who has already secured a day when fatigue itself will be undone. Both are true. Hold onto both.', 'Tujuh hari berdiam bersama tubuh yang letih sudah cukup untuk merasakan beratnya satu pertanyaan sederhana: sampai kapan? Sakit, terutama yang kronis atau berkepanjangan, punya cara membuat masa depan terasa kabur, tidak pasti, kadang menakutkan untuk sekadar dibayangkan. Dalam kabut itu, ada godaan untuk membiarkan harapan menyusut sebesar hasil tes berikutnya, pengobatan berikutnya, satu hari baik berikutnya.

Wahyu pasal 21 menawarkan sesuatu yang lebih besar daripada janji temu berikutnya. Ditulis kepada jemaat yang dianiaya dan menderita, pasal ini tidak menggambarkan pelarian dari kesulitan yang dicapai lewat kecerdikan atau kemauan keras — ia menggambarkan Allah sendiri yang menyembuhkan, secara pribadi, dengan lembut: ''Ia akan menghapus segala air mata dari mata mereka.'' Bukan keputusan jauh dari singgasana, melainkan gestur yang intim dan dekat, seperti yang dilakukan orang tua bagi anaknya yang menangis.

Ini bukan janji yang dimaksudkan untuk meremehkan apa yang sedang dipikul tubuhmu sekarang, seolah-olah rasa sakit itu tidak penting karena kekekalan sedang datang. Rasa sakit itu sangat penting, dan Allah tidak acuh terhadapnya sementara ini berlangsung — sebagaimana hari-hari sebelumnya dalam rencana ini telah menunjukkan, Ia dekat, Ia bekerja, kasih karunia-Nya hadir dalam kelemahan itu. Tetapi janji terakhir ini melebarkan cakrawala. Maut, perkabungan, ratap tangis, dan dukacita digambarkan sebagai bagian dari ''segala sesuatu yang lama'' — nyata, tetapi bukan akhir. Kisah tubuhmu tidak berakhir di tempat sakit ini sekarang berada.

Saat rencana ini berakhir, biarlah harapanmu terentang melampaui diagnosis ini, rencana pengobatan ini, musim lelah ini, tanpa mengabaikan betapa sulitnya menjalaninya sekarang. Kamu dipegang oleh Allah yang hadir dalam kelelahan hari ini dan yang telah menyediakan hari ketika kelelahan itu sendiri akan ditiadakan. Keduanya benar. Peganglah keduanya.',
    'How might holding this bigger hope change how you carry today''s smaller, harder moments — not by dismissing them, but by placing them inside a larger story?', 'Bagaimana memegang harapan yang lebih besar ini bisa mengubah cara kamu menjalani momen-momen kecil dan sulit hari ini — bukan dengan mengabaikannya, melainkan dengan menempatkannya dalam kisah yang lebih besar?',
    'Lord, thank You for the hope that reaches beyond this body and this season. Hold me in today''s weariness, and let me trust the day You have promised when every tear will finally be wiped away. Amen.', 'Tuhan, terima kasih untuk harapan yang menjangkau melampaui tubuh dan musim ini. Peganglah aku dalam kelelahan hari ini, dan biarkan aku percaya pada hari yang telah Engkau janjikan, ketika setiap air mata akhirnya akan dihapuskan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Revelation 21:4', 'WEB', 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Wahyu 21:4', 'TB', 'Dan Ia akan menghapus segala air mata dari mata mereka, dan maut tidak akan ada lagi; tidak akan ada lagi perkabungan, atau ratap tangis, atau dukacita, sebab segala sesuatu yang lama itu telah berlalu.');

  -- Plan: When Heaven Feels Silent
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'When Heaven Feels Silent',
    'Ketika Langit Terasa Diam',
    'Holding on to faith when your prayers seem unanswered',
    'Tetap Berpegang pada Iman Ketika Doa Terasa Tak Terjawab',
    5,
    'A five-day plan for the honest ache of praying the same prayer for weeks, months, or years without a clear answer. Rather than offering easy explanations for God''s silence, this plan sits in the tension of real biblical prayers of complaint and confusion, and points toward a faith sturdy enough to keep speaking even when heaven feels quiet.',
    'Rencana renungan lima hari untuk pergumulan jujur karena menaikkan doa yang sama selama berminggu-minggu, berbulan-bulan, atau bertahun-tahun tanpa jawaban yang jelas. Alih-alih menawarkan penjelasan mudah atas kesunyian Allah, rencana ini berdiam dalam ketegangan doa-doa keluh kesah dan kebingungan yang nyata dalam Alkitab, serta mengarahkan pada iman yang cukup kokoh untuk terus berbicara bahkan ketika langit terasa diam.',
    '/images/devotions/when-heaven-feels-silent.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Joy Before the Answer Arrives', 'Sukacita Sebelum Jawaban Tiba',
    'There is a specific weariness that comes from praying for something and watching the situation stay exactly the same, week after week. Maybe it''s a job that still hasn''t come, a relationship that hasn''t healed, a health report that hasn''t changed, a wayward loved one who hasn''t turned around. You have prayed sincerely, you have believed genuinely, and the silence on the other end can start to feel less like mystery and more like rejection.

The prophet Habakkuk knew this particular ache. His book opens with him confronting God directly, almost accusingly, about injustice he sees going unanswered around him. By the time we reach the closing verses, quoted below, nothing about his outward circumstances has changed. The fig tree still doesn''t bud. The fields still fail. The flocks are still gone. He is not writing from a place where God finally fixed everything. He is writing from the middle of ongoing loss.

And yet Habakkuk chooses something remarkable in that unchanged landscape: he chooses to rejoice in the Lord, not in his circumstances. This distinction matters enormously. He is not manufacturing false cheerfulness or denying that the harvest failed. He is locating his joy in a different place than his outcomes — in the character and presence of God, which remains constant even when the fig tree does not bud on schedule.

This is not a call to pretend your unanswered prayer doesn''t hurt. Habakkuk names the loss specifically before he ever gets to rejoicing. But it is an invitation to notice that your joy does not have to wait for your circumstances to change. It can be planted in God Himself, today, even in a season where nothing outward has shifted yet.', 'Ada kelelahan tersendiri yang muncul karena mendoakan sesuatu dan menyaksikan keadaan tetap sama persis, minggu demi minggu. Mungkin itu pekerjaan yang belum juga datang, hubungan yang belum pulih, hasil pemeriksaan kesehatan yang belum berubah, orang terkasih yang menyimpang dan belum kembali. Kamu sudah berdoa dengan sungguh-sungguh, kamu sudah percaya dengan tulus, dan kesunyian di seberang sana bisa mulai terasa bukan lagi misteri, melainkan penolakan.

Nabi Habakuk mengenal betul kepedihan semacam ini. Kitabnya dibuka dengan ia berhadapan langsung dengan Allah, hampir menuduh, tentang ketidakadilan yang ia lihat berlangsung tanpa jawaban di sekelilingnya. Ketika kita sampai pada ayat-ayat penutup yang dikutip di bawah, tidak ada yang berubah dari keadaan luarnya. Pohon ara masih tidak berbunga. Ladang masih gagal. Kawanan ternak masih hilang. Ia tidak menulis dari tempat di mana Allah akhirnya membereskan segalanya. Ia menulis dari tengah kehilangan yang masih berlangsung.

Namun Habakuk memilih sesuatu yang luar biasa di tengah lanskap yang tak berubah itu: ia memilih bersorak-sorak di dalam TUHAN, bukan di dalam keadaannya. Perbedaan ini sangat penting. Ia tidak sedang menciptakan keceriaan palsu atau menyangkal bahwa panen telah gagal. Ia sedang menempatkan sukacitanya di tempat yang berbeda dari hasil yang ia harapkan — pada karakter dan kehadiran Allah, yang tetap sama bahkan ketika pohon ara tidak berbunga pada waktunya.

Ini bukan ajakan untuk berpura-pura bahwa doamu yang belum terjawab tidak menyakitkan. Habakuk menyebut kehilangan itu secara spesifik sebelum ia sampai pada sukacita. Tetapi ini adalah undangan untuk menyadari bahwa sukacitamu tidak harus menunggu keadaanmu berubah. Ia bisa ditanam di dalam Allah sendiri, hari ini, bahkan di musim ketika belum ada apa pun yang bergeser secara lahiriah.',
    'Name honestly what hasn''t changed yet in your life. Then, without pretending it doesn''t hurt, name one thing about God''s character you can still rejoice in today.', 'Sebutkan dengan jujur apa yang belum berubah dalam hidupmu. Lalu, tanpa berpura-pura itu tidak sakit, sebutkan satu hal tentang karakter Allah yang masih bisa kamu syukuri hari ini.',
    'Lord, my circumstances haven''t changed and I won''t pretend they have. But You have not changed either. Let my joy today be rooted in who You are, not only in what You''ve done for me yet. Amen.', 'Tuhan, keadaanku belum berubah dan aku tidak akan berpura-pura sudah berubah. Tetapi Engkau pun tidak berubah. Biarlah sukacitaku hari ini berakar pada siapa Engkau, bukan hanya pada apa yang telah Engkau lakukan bagiku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakkuk 3:17-18', 'WEB', 'Though the fig tree does not bud and there are no grapes on the vines, though the olive crop fails and the fields produce no food, though there are no sheep in the pen and no cattle in the stalls, yet I will rejoice in the LORD, I will be joyful in God my Savior.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakuk 3:17-18', 'TB', 'Sekalipun pohon ara tidak berbunga, pohon anggur tidak berbuah, hasil pohon zaitun mengecewakan, sekalipun ladang tidak menghasilkan bahan makanan, sekalipun kambing domba terhalau dari kurungan dan tidak ada lembu sapi dalam kandang, namun aku akan bersorak-sorak di dalam TUHAN, beria-ria di dalam Allah yang menyelamatkan aku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'What Testing Is Actually Doing', 'Apa yang Sesungguhnya Sedang Dikerjakan Ujian Ini',
    'It''s an odd instruction, on the surface: consider it pure joy whenever you face trials. Most of us do not experience unanswered prayer, delay, or hardship as anything close to joy while we''re inside it. James is not asking his readers to feel a happy emotion about their pain. He is asking them to hold a settled conviction underneath the pain — a trust in what the trial is producing, even while the trial itself remains genuinely hard.

The word James uses for testing carries the image of metal being refined, impurities being separated out under heat that the metal itself did not choose and cannot escape. Nobody enjoys the furnace. But a refiner does not apply heat randomly or cruelly — the heat has a purpose, and that purpose is to produce something purer than what went in. James applies this image to faith itself: the testing of your faith, he says, produces perseverance, and perseverance, allowed to finish its work, produces a maturity and completeness that shortcuts around the trial could never produce.

This reframes what an unanswered prayer might actually be doing, even when it feels like nothing is happening. The absence of the answer you''re praying for is not necessarily the absence of God''s activity. Something may genuinely be forming in you during this waiting — a depth of trust, a resilience, a knowledge of God gained only through persistence — that a quick yes to your prayer might never have produced.

This is not a tidy explanation for every hardship, and James never claims it is. Some suffering remains mysterious this side of eternity. But for the specific ache of praying and waiting, it offers something sturdier than false comfort: the testing itself may be working, even now, toward a version of your faith not yet finished.', 'Ini instruksi yang terdengar aneh pada awalnya: anggaplah sebagai kebahagiaan penuh setiap kali kamu menghadapi berbagai pencobaan. Kebanyakan dari kita tidak mengalami doa yang tak terjawab, penundaan, atau kesulitan sebagai sesuatu yang mendekati sukacita selagi kita berada di dalamnya. Yakobus tidak meminta pembacanya merasakan emosi bahagia atas rasa sakit mereka. Ia meminta mereka memegang keyakinan yang mantap di bawah rasa sakit itu — kepercayaan pada apa yang sedang dihasilkan oleh ujian tersebut, sekalipun ujian itu sendiri tetap benar-benar sulit.

Kata yang dipakai Yakobus untuk ujian membawa gambaran logam yang sedang dimurnikan, kotoran yang dipisahkan di bawah panas yang tidak dipilih oleh logam itu sendiri dan tidak bisa dihindarinya. Tidak ada yang menikmati tungku pembakaran. Tetapi seorang pemurni tidak menerapkan panas secara sembarangan atau kejam — panas itu punya tujuan, dan tujuannya adalah menghasilkan sesuatu yang lebih murni daripada apa yang masuk. Yakobus menerapkan gambaran ini pada iman itu sendiri: ujian terhadap imanmu, katanya, menghasilkan ketekunan, dan ketekunan, jika dibiarkan menyelesaikan pekerjaannya, menghasilkan kedewasaan dan kelengkapan yang tak akan pernah dihasilkan oleh jalan pintas yang menghindari ujian.

Ini membingkai ulang apa yang sesungguhnya sedang dikerjakan oleh doa yang belum terjawab, bahkan ketika terasa seolah tidak ada yang terjadi. Ketiadaan jawaban yang kamu doakan bukan berarti ketiadaan aktivitas Allah. Sesuatu mungkin benar-benar sedang dibentuk dalam dirimu selama masa penantian ini — kedalaman kepercayaan, ketangguhan, pengenalan akan Allah yang hanya bisa diperoleh melalui ketekunan — yang tak akan pernah dihasilkan oleh jawaban ''ya'' yang cepat atas doamu.

Ini bukan penjelasan yang rapi untuk setiap kesulitan, dan Yakobus tidak pernah mengklaim demikian. Sebagian penderitaan tetap menjadi misteri di sisi kekekalan ini. Tetapi untuk kepedihan khusus karena berdoa dan menanti, ini menawarkan sesuatu yang lebih kokoh daripada penghiburan palsu: ujian itu sendiri mungkin sedang bekerja, bahkan sekarang, menuju versi imanmu yang belum selesai dibentuk.',
    'What might be forming in you during this waiting that a quick answer could not have produced?', 'Apa yang mungkin sedang dibentuk dalam dirimu selama masa penantian ini, yang tak akan bisa dihasilkan oleh jawaban yang cepat?',
    'Lord, this waiting doesn''t feel like joy, but I trust it is not wasted. Let perseverance finish its work in me. Shape something in this season that a fast answer never could have shaped. Amen.', 'Tuhan, penantian ini tidak terasa seperti sukacita, tetapi aku percaya ini tidak sia-sia. Biarlah ketekunan menyelesaikan pekerjaannya dalam diriku. Bentuklah sesuatu dalam musim ini yang tak akan pernah bisa dibentuk oleh jawaban yang cepat. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'James 1:2-4', 'WEB', 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yakobus 1:2-4', 'TB', 'Saudara-saudaraku, anggaplah sebagai suatu kebahagiaan, apabila kamu jatuh ke dalam berbagai-bagai pencobaan, sebab kamu tahu, bahwa ujian terhadap imanmu itu menghasilkan ketekunan. Dan biarkanlah ketekunan itu memperoleh buah yang matang, supaya kamu menjadi sempurna dan utuh dan tak kekurangan suatu apa pun.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Permission to Ask How Long', 'Izin untuk Bertanya Sampai Kapan',
    'Some devotional writing skips over the psalms of complaint, preferring to land quickly on the ones full of resolved praise. But the Bible itself does not skip them. Psalm 13 opens with a question repeated four times in two verses: how long, LORD? How long will you forget me? How long will you hide your face? How long must I wrestle with my thoughts? This is not a psalm of quiet trust dressed up in polite language. It is a raw, repeated demand for God to explain His silence.

What is striking is that this psalm made it into Scripture at all — inspired, preserved, sung by generations of God''s people, without an editor softening David''s frustration into something more comfortable. This tells us something important: honest questioning of God''s timing is not the opposite of faith. It can be an expression of it. David is not walking away from God in these verses. He is walking toward Him, loudly, with real complaint, because he still believes God is listening even in the silence.

If you have prayed the same prayer so many times you''ve started to feel embarrassed repeating it, or if ''how long'' has become a question you''re almost afraid to ask out loud, this psalm gives you permission and even language. You do not have to pretend the delay doesn''t confuse or hurt you. The delay is real. The confusion is allowed. God has made room in His own Scripture for exactly this kind of prayer.

What''s worth noticing is where the psalm goes next, in the verses that follow what''s quoted here — David does not stay only in the complaint. He moves, without denying the pain, toward trust again. But that movement was made possible by first being fully honest about the how long. Faith in trials does not require skipping the hard question. It can begin with asking it.', 'Sebagian tulisan renungan melewati begitu saja mazmur-mazmur keluh kesah, lebih memilih segera sampai pada mazmur yang penuh pujian yang sudah terselesaikan. Tetapi Alkitab sendiri tidak melewatinya. Mazmur 13 dibuka dengan sebuah pertanyaan yang diulang empat kali dalam dua ayat: berapa lama lagi, TUHAN? Berapa lama lagi Engkau melupakan aku? Berapa lama lagi Engkau menyembunyikan wajah-Mu? Berapa lama lagi aku harus bergumul dengan pikiranku? Ini bukan mazmur kepercayaan yang tenang, dibalut dengan bahasa yang sopan. Ini adalah tuntutan yang mentah dan berulang agar Allah menjelaskan kesunyian-Nya.

Yang mencolok adalah mazmur ini sungguh masuk ke dalam Alkitab — diilhamkan, dipelihara, dinyanyikan oleh generasi umat Allah, tanpa ada penyunting yang melunakkan kefrustrasian Daud menjadi sesuatu yang lebih nyaman. Ini memberi tahu kita sesuatu yang penting: mempertanyakan waktu Allah secara jujur bukanlah lawan dari iman. Itu bisa menjadi ungkapan dari iman itu sendiri. Daud tidak sedang menjauh dari Allah dalam ayat-ayat ini. Ia sedang berjalan menuju Dia, dengan suara keras, dengan keluh kesah yang nyata, karena ia masih percaya Allah mendengarkan bahkan di tengah kesunyian.

Jika kamu telah menaikkan doa yang sama begitu sering hingga mulai merasa malu mengulanginya, atau jika ''sampai kapan'' telah menjadi pertanyaan yang bahkan hampir tak berani kamu ucapkan keras-keras, mazmur ini memberimu izin dan bahkan kata-kata untuk itu. Kamu tidak perlu berpura-pura bahwa penundaan itu tidak membingungkan atau menyakitkanmu. Penundaan itu nyata. Kebingungan itu diperbolehkan. Allah telah menyediakan ruang dalam firman-Nya sendiri untuk doa semacam ini.

Yang patut diperhatikan adalah ke mana mazmur ini melangkah selanjutnya, dalam ayat-ayat setelah yang dikutip di sini — Daud tidak berhenti hanya pada keluh kesah. Ia bergerak, tanpa menyangkal rasa sakitnya, menuju kepercayaan kembali. Tetapi pergerakan itu dimungkinkan karena lebih dulu benar-benar jujur tentang sampai kapan itu. Iman dalam pencobaan tidak menuntut kita melewati pertanyaan sulit begitu saja. Iman itu bisa dimulai dengan mengajukannya.',
    'What is the ''how long'' question you''ve been afraid to say out loud to God? Try praying it honestly today, exactly as David did.', 'Apa pertanyaan ''sampai kapan'' yang selama ini takut kamu ucapkan kepada Allah? Cobalah doakan itu dengan jujur hari ini, persis seperti yang dilakukan Daud.',
    'Lord, how long? I ask it honestly, the way David did, believing You can hold my frustration without turning away from me. Meet my complaint with Your patience, and lead me back toward trust in Your timing. Amen.', 'Tuhan, sampai kapan? Aku bertanya ini dengan jujur, seperti yang Daud lakukan, percaya bahwa Engkau bisa menampung kekecewaanku tanpa berpaling dariku. Jumpai keluh kesahku dengan kesabaran-Mu, dan tuntunlah aku kembali menuju kepercayaan pada waktu-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 13:1-2', 'WEB', 'How long, LORD? Will you forget me forever? How long will you hide your face from me? How long must I wrestle with my thoughts and day after day have sorrow in my heart?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 13:2-3', 'TB', 'Berapa lama lagi, TUHAN, Kaulupakan aku terus-menerus? Berapa lama lagi Engkau menyembunyikan wajah-Mu terhadap aku? Berapa lama lagi aku akan menaruh rancangan dalam jiwaku, dan pergumulan dalam hatiku sepanjang hari?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Casting, Not Carrying Alone', 'Menyerahkan, Bukan Memikul Sendirian',
    'Unanswered prayer has a particular way of turning into a private weight. You might mention it in passing to a friend or in a small group once or twice, but as the months stretch on, it becomes tempting to stop bringing it up at all — not because you''ve stopped caring, but because you''re tired of watching people''s faces when you admit the prayer still hasn''t been answered. So it becomes something you carry quietly, alone, revisited mostly in the middle of sleepless nights.

Peter''s instruction to ''cast'' anxiety onto God uses a vivid image — the same word used elsewhere in Greek literature for throwing a burden decisively off one''s own shoulders and onto someone else''s. It is not a gentle suggestion to think positive thoughts. It is an active, repeated motion: taking the specific weight of this unanswered prayer and physically, deliberately, handing it over, rather than continuing to sling it back onto your own back the moment you finish praying.

The reason Peter gives is not that anxiety is unspiritual or a sign of weak faith. The reason is relational: because he cares for you. This is not a transaction where you earn relief by performing enough trust. It is an invitation rooted in God''s genuine care for you personally — not for prayer requests in the abstract, but for you, the specific person still waiting, still hoping, still tired of holding this alone.

If you have been quietly carrying an unanswered prayer without telling anyone how heavy it has become, consider two things today: telling God plainly, again, in whatever words come honestly, and telling one trusted person too. Casting a burden does not always mean it disappears immediately. But it does mean you were never meant to carry it entirely by yourself.', 'Doa yang tak terjawab punya cara khusus untuk berubah menjadi beban pribadi. Mungkin kamu pernah menyinggungnya sekilas kepada teman atau dalam kelompok kecil satu dua kali, tetapi seiring berjalannya bulan, muncul godaan untuk berhenti membicarakannya sama sekali — bukan karena kamu berhenti peduli, melainkan karena kamu lelah melihat raut wajah orang saat kamu mengaku doa itu masih belum terjawab. Maka ia menjadi sesuatu yang kamu pikul diam-diam, sendirian, dikunjungi kembali kebanyakan di tengah malam-malam yang tak bisa tidur.

Instruksi Petrus untuk ''menyerahkan'' kekhawatiran kepada Allah memakai gambaran yang hidup — kata yang sama yang dipakai di tempat lain dalam kesusastraan Yunani untuk melemparkan beban secara tegas dari pundak sendiri ke pundak orang lain. Ini bukan sekadar saran lembut untuk berpikir positif. Ini adalah gerakan aktif dan berulang: mengambil beban khusus dari doa yang belum terjawab ini dan secara fisik, dengan sengaja, menyerahkannya, alih-alih terus melemparkannya kembali ke pundak sendiri begitu selesai berdoa.

Alasan yang Petrus berikan bukanlah bahwa kekhawatiran itu tidak rohani atau tanda iman yang lemah. Alasannya bersifat relasional: sebab Ia memelihara kamu. Ini bukan transaksi di mana kamu memperoleh kelegaan dengan menunjukkan cukup kepercayaan. Ini adalah undangan yang berakar pada kepedulian Allah yang sungguh-sungguh bagimu secara pribadi — bukan bagi permohonan doa secara abstrak, melainkan bagimu, orang tertentu yang masih menanti, masih berharap, masih lelah memikul ini sendirian.

Jika selama ini kamu diam-diam memikul sebuah doa yang tak terjawab tanpa memberi tahu siapa pun betapa beratnya itu, pertimbangkan dua hal hari ini: mengatakannya kepada Allah dengan jelas, sekali lagi, dengan kata-kata apa pun yang keluar dengan jujur, dan mengatakannya kepada satu orang yang kamu percaya juga. Menyerahkan beban tidak selalu berarti ia langsung lenyap. Tetapi itu berarti kamu memang tidak pernah dimaksudkan untuk memikulnya seluruhnya sendirian.',
    'Is there an unanswered prayer you have started carrying quietly and alone? Who is one person you could bring it to this week?', 'Adakah doa yang belum terjawab yang mulai kamu pikul diam-diam dan sendirian? Siapa satu orang yang bisa kamu ajak bicara tentang hal ini minggu ini?',
    'Father, I have been carrying this alone longer than I should have. I cast this specific weight onto You now, not because I''ve earned relief, but because You care for me. Help me let others help carry it too. Amen.', 'Bapa, aku telah memikul ini sendirian lebih lama daripada seharusnya. Aku menyerahkan beban khusus ini kepada-Mu sekarang, bukan karena aku telah pantas mendapat kelegaan, melainkan karena Engkau memelihara aku. Tolong aku membiarkan orang lain turut membantu memikulnya juga. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Peter 5:7', 'WEB', 'Cast all your anxiety on him because he cares for you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Petrus 5:7', 'TB', 'Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'When You Don''t Even Know What to Pray', 'Ketika Kamu Bahkan Tak Tahu Harus Berdoa Apa',
    'After days of praying the same request and watching it go seemingly unanswered, a strange kind of exhaustion can set in — not just tiredness of the situation, but tiredness of the praying itself. The words start to feel repetitive, hollow, like you''re saying the same sentence to a closed door. Some people describe reaching a point where they genuinely do not know what to pray anymore, or how to pray it in a way that hasn''t already been said a hundred times without visible effect.

Paul addresses this exact condition directly in Romans 8, and what he offers is not a better technique for prayer, not a formula that finally gets through. He offers something more surprising: the admission that ''we do not know what we ought to pray for,'' paired with the promise that the Holy Spirit intercedes for us in groans too deep for words. In other words, the moment your own prayers run dry is not the moment prayer stops. It''s the moment the Spirit''s own intercession becomes most necessary.

This should be a relief to anyone who has felt guilty for running out of words. Your prayer life was never meant to depend solely on your own articulate faith. When you kneel in confused silence, unsure what to even ask for anymore, the Spirit is not waiting for you to find better words. He is already praying on your behalf, translating your wordless groaning into something the Father fully understands, even when you cannot.

As this plan on unanswered prayer closes, let this be the truest thing you carry forward: heaven''s silence toward your specific request is not the same as heaven''s absence. Even in seasons where you cannot find words, even in seasons where the answer still has not come, the Spirit is interceding, the Son is interceding, and the Father who sees in secret has not stopped listening. Keep praying — even the groaning kind. It still counts.', 'Setelah berhari-hari menaikkan permintaan yang sama dan menyaksikannya tampak tak terjawab, sejenis kelelahan yang aneh bisa muncul — bukan sekadar lelah dengan keadaannya, melainkan lelah dengan doa itu sendiri. Kata-kata mulai terasa berulang, hampa, seperti mengucapkan kalimat yang sama kepada pintu yang tertutup. Sebagian orang menggambarkan sampai pada titik ketika mereka benar-benar tidak tahu lagi harus berdoa apa, atau bagaimana mendoakannya dengan cara yang belum pernah diucapkan ratusan kali tanpa hasil yang terlihat.

Paulus membahas kondisi ini secara langsung dalam Roma 8, dan apa yang ia tawarkan bukanlah teknik berdoa yang lebih baik, bukan rumus yang akhirnya berhasil menembus. Ia menawarkan sesuatu yang lebih mengejutkan: pengakuan bahwa ''kita tidak tahu bagaimana sebenarnya harus berdoa,'' dipadukan dengan janji bahwa Roh Kudus sendiri berdoa untuk kita dengan keluhan-keluhan yang tidak terucapkan. Dengan kata lain, saat doamu sendiri mulai kering bukanlah saat doa berhenti. Itu justru saat syafaat Roh sendiri menjadi paling dibutuhkan.

Ini seharusnya menjadi kelegaan bagi siapa pun yang merasa bersalah karena kehabisan kata-kata. Kehidupan doamu tidak pernah dimaksudkan untuk bergantung semata pada iman verbalmu sendiri. Ketika kamu berlutut dalam kesunyian yang membingungkan, tidak yakin lagi harus meminta apa, Roh tidak sedang menunggumu menemukan kata-kata yang lebih baik. Ia sudah berdoa untukmu, menerjemahkan keluhanmu yang tanpa kata menjadi sesuatu yang sepenuhnya dipahami Bapa, bahkan ketika kamu sendiri tidak bisa.

Saat rencana renungan tentang doa yang tak terjawab ini berakhir, biarlah ini menjadi kebenaran yang paling kamu bawa: kesunyian langit terhadap permohonanmu yang khusus bukanlah sama dengan ketiadaan langit. Bahkan di musim ketika kamu tak bisa menemukan kata-kata, bahkan di musim ketika jawaban itu masih belum datang, Roh sedang berdoa syafaat, Sang Anak sedang berdoa syafaat, dan Bapa yang melihat yang tersembunyi belum berhenti mendengarkan. Teruslah berdoa — bahkan doa yang berupa keluhan sekalipun. Itu tetap berarti.',
    'If you have run out of words for this prayer, what would it look like to simply bring your wordless groaning to God today and trust the Spirit to carry the rest?', 'Jika kamu sudah kehabisan kata-kata untuk doa ini, seperti apa jadinya jika hari ini kamu sekadar membawa keluhanmu yang tanpa kata kepada Allah dan mempercayai Roh untuk memikul sisanya?',
    'Spirit of God, I don''t always know what to pray anymore, and I''m tired of repeating the same words. Thank You for interceding for me even in my silence. Carry what I cannot put into words, and keep me close to the Father while I wait. Amen.', 'Roh Allah, aku tidak selalu tahu lagi harus berdoa apa, dan aku lelah mengulang kata-kata yang sama. Terima kasih karena Engkau berdoa syafaat bagiku bahkan dalam kesunyianku. Pikullah apa yang tak bisa kuungkapkan dengan kata-kata, dan jagalah aku tetap dekat dengan Bapa selagi aku menanti. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 8:26', 'WEB', 'In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 8:26', 'TB', 'Demikian juga Roh membantu kita dalam kelemahan kita; sebab kita tidak tahu, bagaimana sebenarnya harus berdoa; tetapi Roh sendiri berdoa untuk kita kepada Allah dengan keluhan-keluhan yang tidak terucapkan.');

  -- Sub-category: Growing in Faith --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Growing in Faith' AND parent_id = v_family_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Growing in Faith', 'Bertumbuh dalam Iman', v_family_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Bertumbuh dalam Iman'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Small Beginnings: A Daily Prayer Habit
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Small Beginnings: A Daily Prayer Habit',
    'Awal yang Kecil: Kebiasaan Doa Harian',
    'Three days to open a conversation with God that never has to close',
    'Tiga hari membuka percakapan dengan Tuhan yang tak pernah harus berhenti',
    3,
    'For anyone who has ever wanted to pray more but never known where to start, this short plan is a gentle on-ramp. Over three days we look at showing up honestly before God, finding a quiet place to meet Him, and letting prayer become less an event on a schedule and more the air we breathe. There is no pressure to get it right — only an invitation to begin.',
    'Bagi siapa saja yang ingin lebih banyak berdoa tetapi tidak tahu harus mulai dari mana, rencana singkat ini adalah jalan masuk yang lembut. Selama tiga hari kita belajar untuk datang dengan jujur di hadapan Tuhan, menemukan tempat sunyi untuk berjumpa dengan-Nya, dan membiarkan doa berubah bukan sekadar agenda dalam jadwal, melainkan udara yang kita hirup. Tidak ada tekanan untuk melakukannya dengan sempurna — hanya undangan untuk memulai.',
    '/images/devotions/small-beginnings-a-daily-prayer-habit.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Showing Up As You Are', 'Datang Apa Adanya',
    'Most of us imagine that prayer requires the right words, the right posture, the right amount of quiet in our hearts before we''re allowed to begin. But Scripture never asks us to arrive polished. It only asks us to arrive. The psalmist writes about laying his requests before God ''in the morning'' and waiting expectantly, not because his heart was already sorted out, but because that was simply the habit he kept — showing up, day after day, exactly as he was.

Many of us find that the hardest part of building a prayer habit isn''t theological, it''s logistical and emotional. We don''t know what to say, we feel awkward in the silence, we worry our minds will wander. All of that is normal, and none of it disqualifies us. A relationship doesn''t grow because every conversation is eloquent; it grows because the two people keep choosing to talk. God is not grading our vocabulary. He is delighting in our presence.

It helps to remember that the God we''re speaking to already knows everything we''re about to say before we say it. That should take the pressure off entirely. We are not informing Him of anything — we are simply choosing, on purpose, to include Him in our day rather than carry it alone. That small shift, from performing prayer to simply showing up for it, is often where a lasting habit is actually born.

So today, the goal isn''t eloquence. It''s arrival. Whatever your morning looks like — coffee in hand, kids stirring in the next room, an alarm you''re tempted to snooze — the invitation is the same one the psalmist knew: bring your unfinished, unpolished self to God, and let Him meet you there.', 'Banyak dari kita membayangkan bahwa doa membutuhkan kata-kata yang tepat, sikap tubuh yang benar, dan hati yang sudah tenang sebelum kita boleh mulai. Namun Alkitab tidak pernah meminta kita datang dalam keadaan sempurna. Ia hanya meminta kita datang. Sang pemazmur menulis tentang membawa permohonannya kepada Tuhan ''pada waktu pagi'' dan menantikan jawaban dengan penuh harap, bukan karena hatinya sudah tertata rapi, melainkan karena itulah kebiasaan yang ia jaga — datang, hari demi hari, apa adanya.

Banyak dari kita merasa bahwa bagian tersulit membangun kebiasaan doa bukanlah soal teologi, melainkan soal praktis dan perasaan. Kita tidak tahu harus berkata apa, kita merasa canggung dalam keheningan, kita khawatir pikiran kita akan mengembara. Semua itu wajar, dan tidak satu pun mendiskualifikasi kita. Sebuah hubungan tidak bertumbuh karena setiap percakapan berjalan fasih; ia bertumbuh karena kedua pihak terus memilih untuk berbicara. Tuhan tidak sedang menilai kosakata kita. Ia bersukacita atas kehadiran kita.

Ada baiknya kita ingat bahwa Tuhan yang sedang kita ajak bicara sudah tahu segala yang akan kita katakan, bahkan sebelum kita mengucapkannya. Itu semestinya melepaskan segala tekanan. Kita bukan sedang memberi tahu-Nya sesuatu — kita hanya memilih, dengan sengaja, untuk melibatkan-Nya dalam hari kita, alih-alih memikulnya sendirian. Pergeseran kecil itu, dari doa sebagai pertunjukan menjadi doa sebagai kehadiran, sering kali adalah tempat kebiasaan yang bertahan lama sungguh dimulai.

Jadi hari ini, tujuannya bukan kefasihan. Tujuannya adalah kehadiran. Apa pun rupa pagimu — secangkir kopi di tangan, anak-anak yang mulai bangun di kamar sebelah, alarm yang ingin sekali kau tunda — undangannya sama seperti yang diketahui sang pemazmur: bawalah dirimu yang belum selesai dan belum rapi kepada Tuhan, dan biarkan Ia menjumpaimu di sana.',
    'You don''t need the right words to begin — you only need to show up. What would it look like to bring your actual, unedited self to God tomorrow morning?', 'Kau tidak butuh kata-kata yang tepat untuk memulai — kau hanya perlu datang. Seperti apa rasanya membawa dirimu yang sesungguhnya, tanpa disunting, kepada Tuhan besok pagi?',
    'Lord, I don''t always know what to say, and I don''t always feel ready. Thank You that You don''t require me to be ready — only willing. Teach me to show up honestly before You today, trusting that You delight in my presence far more than my performance. Amen.', 'Tuhan, aku tidak selalu tahu harus berkata apa, dan aku tidak selalu merasa siap. Terima kasih karena Engkau tidak menuntutku untuk siap — hanya untuk bersedia. Ajarku untuk datang dengan jujur di hadapan-Mu hari ini, percaya bahwa Engkau lebih bersukacita atas kehadiranku daripada penampilanku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 5:3', 'WEB', 'In the morning, LORD, you hear my voice; in the morning I lay my requests before you and wait expectantly.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 5:4', 'TB', 'TUHAN, pada waktu pagi Engkau mendengar suaraku, pada waktu pagi aku mengatur persembahanku bagi-Mu dan aku menunggu-nunggu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'A Room, a Door, a Father', 'Sebuah Kamar, Sebuah Pintu, Seorang Bapa',
    'Jesus gave surprisingly practical instructions about prayer. He didn''t tell His followers to wait for a mystical feeling or a perfect moment. He told them to go somewhere specific: into a room, and shut the door. There is something almost startlingly ordinary about that advice, and that''s exactly the point. A daily prayer habit doesn''t need a mountaintop. It needs a chair, a corner, a closed door — a small, unremarkable space set apart on purpose.

Many of us live lives so full of noise — notifications, obligations, other people''s voices — that we rarely experience true quiet at all. The ''shut door'' Jesus describes isn''t only about a physical room; it''s about creating a boundary, a pocket of time that belongs to nobody but you and God. That boundary might be five minutes before the household wakes, or a few minutes in the car before walking into work. What matters is that it''s set apart, protected, returned to.

What makes this practice bearable, even desirable, over the long run is what Jesus says next: your Father, who sees what is done in secret, will reward you. This isn''t a transaction so much as a promise of intimacy. Nobody else has to know about your closed door. Nobody applauds it. But the Father who sees it meets you there, and that meeting is the actual reward — not a performance for an audience, but a relationship nurtured in private.

Over time, that private, unglamorous room becomes sacred simply because of who you keep meeting there. The habit isn''t about willpower alone; it''s about return. Go back to your room, your five minutes, your closed door, again tomorrow — and trust that the Father who sees in secret is already waiting.', 'Yesus memberikan petunjuk yang sangat praktis tentang doa. Ia tidak menyuruh murid-murid-Nya menunggu perasaan mistis atau momen yang sempurna. Ia menyuruh mereka pergi ke tempat tertentu: masuk ke dalam kamar, dan menutup pintu. Ada sesuatu yang hampir mengejutkan sederhananya dari nasihat itu, dan justru di situlah intinya. Kebiasaan doa harian tidak membutuhkan puncak gunung. Ia membutuhkan sebuah kursi, sebuah sudut, sebuah pintu tertutup — ruang kecil yang biasa saja namun sengaja disisihkan.

Banyak dari kita menjalani hidup yang begitu penuh kebisingan — notifikasi, kewajiban, suara orang lain — sehingga kita jarang benar-benar mengalami keheningan sejati. ''Pintu tertutup'' yang digambarkan Yesus bukan hanya soal ruang fisik; ini soal menciptakan batas, sekantong waktu yang bukan milik siapa pun kecuali dirimu dan Tuhan. Batas itu bisa berupa lima menit sebelum rumah bangun, atau beberapa menit di dalam mobil sebelum masuk kerja. Yang penting, waktu itu disisihkan, dijaga, dan didatangi kembali.

Yang membuat kebiasaan ini terasa ringan, bahkan dirindukan, dalam jangka panjang adalah kata-kata Yesus selanjutnya: Bapamu yang melihat yang tersembunyi akan membalasnya. Ini bukan sekadar transaksi, melainkan janji keintiman. Tidak ada orang lain yang perlu tahu tentang pintu tertutupmu. Tidak ada yang bertepuk tangan untuk itu. Tetapi Bapa yang melihat menjumpaimu di sana, dan perjumpaan itulah upah yang sesungguhnya — bukan pertunjukan bagi penonton, melainkan hubungan yang dipupuk dalam kesunyian.

Seiring waktu, ruang pribadi yang sederhana itu menjadi kudus semata-mata karena siapa yang terus kau temui di sana. Kebiasaan ini bukan hanya soal kemauan keras; ini soal kembali. Kembalilah ke kamarmu, ke lima menitmu, ke pintu tertutupmu, lagi besok — dan percayalah bahwa Bapa yang melihat yang tersembunyi sudah menantimu.',
    'You don''t need a perfect setting to pray — just a small, set-apart space you return to. Where could your ''closed door'' be this week?', 'Kau tidak butuh tempat yang sempurna untuk berdoa — hanya ruang kecil yang disisihkan dan didatangi kembali. Di manakah ''pintu tertutup''-mu minggu ini?',
    'Father, thank You that I don''t need an audience or a perfect setting to meet with You. Help me find and protect a small space set apart for prayer, trusting that You are already there, seeing what is unseen, waiting to meet me. Amen.', 'Bapa, terima kasih karena aku tidak butuh penonton atau tempat yang sempurna untuk berjumpa dengan-Mu. Tolonglah aku menemukan dan menjaga ruang kecil yang disisihkan untuk berdoa, percaya bahwa Engkau sudah ada di sana, melihat yang tersembunyi, menantikan perjumpaan denganku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:6', 'WEB', 'But when you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father, who sees what is done in secret, will reward you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:6', 'TB', 'Tetapi jika engkau berdoa, masuklah ke dalam kamarmu, tutuplah pintu dan berdoalah kepada Bapamu yang ada di tempat tersembunyi. Maka Bapamu yang melihat yang tersembunyi akan membalasnya kepadamu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Praying Without Ceasing', 'Berdoa Tanpa Henti',
    'By the third day of any new habit, the initial enthusiasm often starts to fade, and the question quietly arrives: can I actually keep this up? It''s worth noticing that Paul''s instruction to ''pray continually'' was never meant to describe an unbroken stream of formal words. It describes an orientation of the heart — a life lived with one ear always turned toward God, ready to whisper a thank-you, a plea, a confession, at any moment, in any place.

This reframes the whole project. A daily prayer habit isn''t primarily about protecting an unbreakable streak or hitting a certain number of minutes. It''s about becoming the kind of person who talks to God while waiting in line, while driving, while doing dishes — not instead of a set time of prayer, but woven around it, so that the set time and the scattered moments start to feel like one continuous conversation rather than separate appointments.

Many of us find that once a small anchor habit is in place — even just a few minutes each morning — those scattered moments of prayer throughout the day become far more natural. The morning time isn''t the whole relationship; it''s the doorway into it. It reminds us, before the noise of the day begins, that we belong to Someone who is already listening, which makes it easier to keep talking to Him as the hours unfold.

So as you finish these three days, don''t measure success by whether you felt something extraordinary. Measure it by whether you showed up. And then trust that showing up, day after ordinary day, is exactly how a habit becomes a home — a place where prayer stops being a task on a list and starts being simply how you live.', 'Pada hari ketiga dari kebiasaan baru apa pun, semangat awal sering kali mulai memudar, dan pertanyaan pun diam-diam muncul: benarkah aku bisa terus melakukannya? Perlu diperhatikan bahwa perintah Paulus untuk ''tetap berdoa'' tidak pernah dimaksudkan sebagai aliran kata-kata formal yang tak terputus. Itu menggambarkan arah hati — sebuah hidup yang dijalani dengan satu telinga selalu menghadap Tuhan, siap membisikkan ucapan syukur, permohonan, atau pengakuan, kapan saja, di mana saja.

Ini mengubah cara kita memandang seluruh proyek ini. Kebiasaan doa harian bukan terutama soal menjaga rentetan yang tak terputus atau mencapai jumlah menit tertentu. Ini soal menjadi orang yang berbicara kepada Tuhan sambil mengantre, sambil menyetir, sambil mencuci piring — bukan sebagai pengganti waktu doa yang tetap, melainkan terjalin di sekelilingnya, sehingga waktu tetap itu dan momen-momen yang tersebar terasa seperti satu percakapan yang berkesinambungan, bukan janji temu yang terpisah-pisah.

Banyak dari kita menemukan bahwa begitu satu kebiasaan jangkar kecil sudah tertanam — bahkan hanya beberapa menit setiap pagi — momen-momen doa yang tersebar sepanjang hari menjadi jauh lebih alami. Waktu pagi itu bukan seluruh hubungan; ia adalah pintu masuk menuju hubungan itu. Ia mengingatkan kita, sebelum kebisingan hari dimulai, bahwa kita milik Seseorang yang sudah mendengarkan, yang membuat kita lebih mudah terus berbicara kepada-Nya seiring berjalannya jam-jam berikutnya.

Maka saat kau menyelesaikan tiga hari ini, jangan ukur keberhasilan dari apakah kau merasakan sesuatu yang luar biasa. Ukurlah dari apakah kau datang. Dan percayalah bahwa datang, hari demi hari yang biasa saja, adalah justru cara sebuah kebiasaan berubah menjadi rumah — tempat di mana doa berhenti menjadi tugas dalam daftar dan mulai menjadi sekadar cara kau hidup.',
    'A prayer habit isn''t an unbroken streak of perfect focus — it''s a life oriented toward God. What small moment today could become a whispered prayer?', 'Kebiasaan doa bukanlah rentetan fokus sempurna yang tak terputus — melainkan hidup yang mengarah kepada Tuhan. Momen kecil apa hari ini yang bisa menjadi doa bisikan?',
    'Lord, teach me to carry You with me through the ordinary moments of today — the waiting, the driving, the dishes — so that my whole day becomes one long, unhurried conversation with You. Thank You for meeting me in the small and the constant. Amen.', 'Tuhan, ajarku untuk membawa-Mu bersamaku melalui momen-momen biasa hari ini — saat menunggu, menyetir, mencuci piring — sehingga seluruh hariku menjadi satu percakapan panjang yang tak tergesa-gesa dengan-Mu. Terima kasih telah menjumpaiku dalam hal-hal kecil dan tetap. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Thessalonians 5:16-17', 'WEB', 'Rejoice always, pray continually,');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Tesalonika 5:16-17', 'TB', 'Bersukacitalah senantiasa. Tetaplah berdoa.');

  -- Plan: Bread for the Journey: Growing Through Scripture
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Bread for the Journey: Growing Through Scripture',
    'Roti untuk Perjalanan: Bertumbuh Melalui Firman',
    'Five days to fall in love with the Word of God',
    'Lima hari untuk jatuh cinta pada Firman Tuhan',
    5,
    'Scripture can feel like a book we know we should read more but never quite know how to approach. This five-day plan walks through why the Bible is worth returning to daily: as a lamp for our next step, as food that nourishes rather than merely informs, as a living word that reaches into the heart, as God-breathed truth that shapes us, and as the very thing that plants and deepens faith itself. It''s an invitation to move from duty to delight.',
    'Alkitab kadang terasa seperti buku yang kita tahu seharusnya lebih sering kita baca, tetapi tidak pernah benar-benar tahu bagaimana mendekatinya. Rencana lima hari ini menelusuri mengapa Alkitab layak untuk terus kita kunjungi setiap hari: sebagai pelita bagi langkah berikutnya, sebagai makanan yang menyehatkan bukan sekadar memberi informasi, sebagai firman yang hidup dan menembus hati, sebagai kebenaran yang dinapaskan Allah dan membentuk kita, serta sebagai hal yang menanam dan memperdalam iman itu sendiri. Ini adalah undangan untuk berpindah dari kewajiban menuju kerinduan.',
    '/images/devotions/bread-for-the-journey-growing-through-scripture.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'A Lamp for the Next Step', 'Pelita untuk Langkah Berikutnya',
    'The psalmist doesn''t describe God''s word as a floodlight illuminating the whole horizon. He calls it a lamp for his feet and a light for his path — enough to see the next step clearly, even when the destination stays hazy in the distance. That image matters, because so many of us hesitate to open Scripture unless we expect it to answer every question about our future at once. It rarely works that way. More often, it simply shows us where to place our foot right now.

Many of us find that the seasons we grow the most in faith are not the seasons where everything is clear, but the seasons where we''ve learned to trust the small circle of light we''ve been given. We don''t need to see the whole road to walk faithfully. We need only enough illumination for the step in front of us, and Scripture, read patiently and returned to often, provides exactly that.

There is also something deeply personal in the psalmist''s language — ''a lamp for my feet,'' not for feet in general. The Word of God is not only a set of truths about the universe; it is truth applied, personally, to the actual walking, wandering, uncertain life each of us is living. That is why the same verse can strike one person one way on a hard Tuesday and another way entirely on a hopeful Friday. It meets us where our feet actually are.

As you begin this five-day journey through Scripture, don''t come looking for the whole map. Come looking for enough light for today. Trust that the God who gave this lamp to the psalmist is just as willing to hold it steady for you, one faithful step at a time.', 'Pemazmur tidak menggambarkan firman Tuhan sebagai lampu sorot yang menerangi seluruh cakrawala. Ia menyebutnya pelita bagi kakinya dan terang bagi jalannya — cukup untuk melihat langkah berikutnya dengan jelas, meski tujuan akhirnya masih samar di kejauhan. Gambaran itu penting, sebab banyak dari kita ragu membuka Alkitab kecuali kita mengharapkan jawaban atas semua pertanyaan tentang masa depan sekaligus. Jarang sekali itu terjadi. Lebih sering, Firman hanya menunjukkan di mana kita harus melangkahkan kaki sekarang.

Banyak dari kita menemukan bahwa musim-musim ketika iman kita paling bertumbuh bukanlah musim ketika segalanya jelas, melainkan musim ketika kita belajar mempercayai lingkaran cahaya kecil yang telah diberikan kepada kita. Kita tidak perlu melihat seluruh jalan untuk melangkah dengan setia. Kita hanya butuh cukup terang untuk langkah di depan kita, dan Alkitab, jika dibaca dengan sabar dan terus dikunjungi, memberikan tepat itu.

Ada juga sesuatu yang sangat pribadi dalam bahasa sang pemazmur — ''pelita bagi kakiku,'' bukan bagi kaki pada umumnya. Firman Tuhan bukan hanya sekumpulan kebenaran tentang alam semesta; ia adalah kebenaran yang diterapkan secara pribadi, pada hidup yang benar-benar sedang berjalan, mengembara, dan tidak pasti dari setiap kita. Itulah sebabnya ayat yang sama bisa menyentuh seseorang dengan satu cara pada Selasa yang berat, dan dengan cara yang sama sekali berbeda pada Jumat yang penuh harap. Ia menjumpai kita tepat di tempat kaki kita berpijak.

Saat kau memulai perjalanan lima hari melalui Alkitab ini, jangan datang mencari seluruh peta. Datanglah mencari cukup terang untuk hari ini. Percayalah bahwa Tuhan yang memberikan pelita ini kepada sang pemazmur sama bersedianya untuk memegangnya tetap bagimu, satu langkah setia demi satu langkah.',
    'You don''t need the whole map to walk faithfully — just enough light for the next step. What step is God''s Word illuminating for you today?', 'Kau tidak perlu seluruh peta untuk melangkah dengan setia — hanya cukup terang untuk langkah berikutnya. Langkah apa yang sedang diterangi Firman Tuhan bagimu hari ini?',
    'Lord, thank You that Your word doesn''t demand I see the whole road ahead. Give me eyes to see just the next faithful step, and a heart willing to take it. Let Your Word be a steady lamp in my hand today. Amen.', 'Tuhan, terima kasih karena Firman-Mu tidak menuntutku melihat seluruh jalan di depan. Berilah aku mata untuk melihat langkah setia berikutnya saja, dan hati yang bersedia mengambilnya. Biarlah Firman-Mu menjadi pelita yang tetap di tanganku hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 119:105', 'WEB', 'Your word is a lamp for my feet, a light on my path.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 119:105', 'TB', 'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Meditate Day and Night', 'Merenungkannya Siang dan Malam',
    'When God commissions Joshua for the enormous task ahead of him, He doesn''t tell him to muster more courage from within himself. He points him to a book. ''Keep this Book of the Law always on your lips; meditate on it day and night.'' The instruction is almost surprising in its simplicity — not a strategy session, not a pep talk, but a call to stay close to the written word, to let it be the constant companion of both his mouth and his mind.

The word translated ''meditate'' here carries the sense of a low murmur, a rumination — the kind of thing a person does almost without noticing, turning a phrase over and over the way one might hum a familiar tune. This isn''t a single intense study session and then moving on. It''s a slow, repeated return to the same truths until they become part of how we think, not just something we once read.

Many of us find that faith grows less through occasional dramatic insight and more through this kind of unglamorous repetition — reading a familiar passage again, letting a verse sit with us through an ordinary afternoon, coming back to words we''ve read a hundred times before and finding, somehow, that they still have something new to say. That is meditation: not novelty, but faithfulness to the same well, drawn from again and again.

God''s promise to Joshua was tied directly to this practice: ''then you will be prosperous and successful.'' Not because the words were magic, but because a life saturated in truth tends to make wiser choices, walk steadier paths, and endure harder seasons. The same offer stands for us. Let the Word be on your lips today — not once, but again and again.', 'Ketika Tuhan menugaskan Yosua untuk tugas besar yang ada di hadapannya, Ia tidak menyuruhnya mengumpulkan lebih banyak keberanian dari dalam dirinya sendiri. Ia mengarahkannya kepada sebuah kitab. ''Janganlah engkau lupa memperkatakan Kitab Taurat ini, tetapi renungkanlah itu siang dan malam.'' Perintah itu hampir mengejutkan karena kesederhanaannya — bukan sesi strategi, bukan pidato penyemangat, melainkan panggilan untuk tetap dekat dengan firman tertulis, membiarkannya menjadi sahabat tetap bagi mulut dan pikirannya.

Kata yang diterjemahkan ''merenungkan'' di sini membawa makna gumaman pelan, sebuah pengulangan yang dilakukan hampir tanpa disadari — seperti seseorang menggumamkan lagu yang sudah dikenalnya berulang-ulang. Ini bukan satu sesi belajar yang intens lalu berlalu. Ini adalah kembali secara perlahan dan berulang kepada kebenaran yang sama, sampai kebenaran itu menjadi bagian dari cara kita berpikir, bukan sekadar sesuatu yang pernah kita baca.

Banyak dari kita menemukan bahwa iman bertumbuh bukan terutama melalui wawasan dramatis sesekali, melainkan melalui pengulangan sederhana semacam ini — membaca kembali bagian yang sudah dikenal, membiarkan sebuah ayat menetap bersama kita sepanjang sore yang biasa, kembali kepada kata-kata yang sudah kita baca beratus kali dan menemukan, entah bagaimana, bahwa kata-kata itu masih punya sesuatu yang baru untuk dikatakan. Itulah perenungan: bukan kebaruan, melainkan kesetiaan pada sumur yang sama, yang terus ditimba lagi dan lagi.

Janji Tuhan kepada Yosua terikat langsung pada praktik ini: ''maka engkau akan beruntung dan akan berhasil dalam segala usahamu.'' Bukan karena kata-kata itu bersifat magis, melainkan karena hidup yang direndam dalam kebenaran cenderung membuat pilihan yang lebih bijak, melangkah di jalan yang lebih mantap, dan bertahan melalui musim yang lebih sulit. Tawaran yang sama berlaku bagi kita. Biarlah Firman ada di bibirmu hari ini — bukan sekali, melainkan berulang kali.',
    'Growth in faith often comes not from novelty but from returning again and again to the same truths. What familiar verse could you sit with today rather than rush past?', 'Pertumbuhan iman sering datang bukan dari hal baru, melainkan dari kembali berulang kali kepada kebenaran yang sama. Ayat familiar mana yang bisa kau renungkan hari ini, bukan sekadar kau lewati?',
    'Lord, teach me the slow, repeated rhythm of meditating on Your word rather than always chasing something new. Let Your truth settle into my mind and mouth until it shapes how I think and choose. Amen.', 'Tuhan, ajarku irama yang perlahan dan berulang dalam merenungkan Firman-Mu, alih-alih selalu mengejar hal baru. Biarlah kebenaran-Mu meresap ke dalam pikiran dan mulutku sampai membentuk cara aku berpikir dan memilih. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Joshua 1:8', 'WEB', 'Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yosua 1:8', 'TB', 'Janganlah engkau lupa memperkatakan kitab Taurat ini, tetapi renungkanlah itu siang dan malam, supaya engkau bertindak hati-hati sesuai dengan segala yang tertulis di dalamnya, sebab dengan demikian perjalananmu akan berhasil dan engkau akan beruntung.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Living and Active', 'Hidup dan Kuat Bekerja',
    'It would be easy to think of the Bible as a historical document — words spoken long ago, preserved carefully, but essentially finished and static. The letter to the Hebrews insists on something far more startling: that the word of God is living and active. Not was living once. Is living, now, today, in whatever page you happen to open.

This changes how we can expect Scripture to work on us. A living word doesn''t just sit on the page waiting to be studied like a fossil; it moves, it presses, it searches. The writer describes it as sharper than any double-edged sword, able to penetrate all the way to the place where soul and spirit meet, joints and marrow — the deepest, most hidden parts of who we are. That''s not language, that''s surgery.

Many of us have had the experience of reading a passage we''d read a dozen times before, only to have it suddenly land differently — convicting us of something we''d been avoiding, or comforting us in exactly the way we needed that day, as though the words had been written specifically for that moment. That is what a living word does. It doesn''t merely inform us about God; it meets us, uncomfortably and tenderly, exactly where we are.

So when Scripture feels sharp today — when a verse convicts more than comforts — take that as evidence it''s doing precisely what it was always meant to do. Let it search. A word that is truly alive doesn''t leave us unchanged, and that discomfort is often the very shape that growth takes.', 'Akan mudah untuk menganggap Alkitab sebagai dokumen sejarah — kata-kata yang diucapkan lama berselang, dijaga dengan hati-hati, tetapi pada dasarnya sudah selesai dan diam. Surat Ibrani menegaskan sesuatu yang jauh lebih mengejutkan: bahwa firman Allah itu hidup dan kuat. Bukan pernah hidup dahulu. Ia hidup, sekarang, hari ini, pada halaman apa pun yang kebetulan kau buka.

Ini mengubah cara kita menantikan Alkitab bekerja pada diri kita. Firman yang hidup tidak hanya diam di atas kertas menunggu dipelajari seperti fosil; ia bergerak, ia menekan, ia menyelidiki. Penulis surat itu menggambarkannya lebih tajam dari pedang bermata dua mana pun, sanggup menembus sampai memisahkan jiwa dan roh, sendi-sendi dan sumsum — bagian-bagian yang paling dalam dan tersembunyi dari diri kita. Itu bukan sekadar bahasa, itu adalah pembedahan.

Banyak dari kita pernah mengalami membaca bagian yang sudah puluhan kali kita baca, namun tiba-tiba menyentuh dengan cara yang berbeda — menegur kita atas sesuatu yang selama ini kita hindari, atau menghibur kita dengan tepat cara yang kita butuhkan hari itu, seolah kata-kata itu ditulis khusus untuk momen tersebut. Itulah yang dilakukan firman yang hidup. Ia tidak sekadar memberi kita informasi tentang Allah; ia menjumpai kita, dengan cara yang tidak nyaman sekaligus lembut, tepat di tempat kita berada.

Jadi ketika Alkitab terasa tajam hari ini — ketika sebuah ayat lebih menegur daripada menghibur — anggaplah itu bukti bahwa firman itu sedang melakukan tepat apa yang selalu dimaksudkan untuk dilakukannya. Biarkan ia menyelidiki. Firman yang benar-benar hidup tidak membiarkan kita tetap sama, dan ketidaknyamanan itu sering kali adalah bentuk nyata dari pertumbuhan.',
    'A living word doesn''t leave us unchanged. Where might Scripture be pressing on something you''ve been avoiding lately?', 'Firman yang hidup tidak membiarkan kita tetap sama. Di manakah mungkin Alkitab sedang menekan sesuatu yang belakangan ini kau hindari?',
    'Father, Your word is alive, and I open myself to let it work in me today — to convict where I need conviction and comfort where I need comfort. Search my heart, Lord, and don''t let me stay unchanged. Amen.', 'Bapa, Firman-Mu hidup, dan aku membuka diriku agar ia bekerja dalam diriku hari ini — menegur di mana aku perlu ditegur dan menghibur di mana aku perlu dihibur. Selidikilah hatiku, Tuhan, dan jangan biarkan aku tetap sama. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Hebrews 4:12', 'WEB', 'For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ibrani 4:12', 'TB', 'Sebab firman Allah hidup dan kuat dan lebih tajam dari pada pedang bermata dua manapun; ia menusuk amat dalam sampai memisahkan jiwa dan roh, sendi-sendi dan sumsum; ia sanggup membedakan pertimbangan dan pikiran hati kita.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'God-Breathed and Useful', 'Dinapaskan Allah dan Bermanfaat',
    'Paul''s words to Timothy give us one of the most complete pictures in Scripture of what the Bible is actually for. He calls it God-breathed — a striking image, suggesting these words carry the very breath of God within them, not merely human wisdom about God. And then, almost immediately, he turns practical: this breathed-out word is useful for teaching, rebuking, correcting, and training in righteousness.

Notice the range of that list. Scripture isn''t only for teaching us new information, though it does that. It''s also for rebuking — naming what''s wrong plainly. And for correcting — showing us a better way. And for training — the slow, repeated discipline that shapes character over time, the way an athlete trains a muscle. God''s word is meant to touch every part of how we think and live, not just the parts we''re comfortable examining.

Many of us prefer the teaching and skip the rebuking, welcome the encouragement and resist the correction. But a faith that only wants the comfortable parts of Scripture will stay shallow. Real growth asks us to sit with the verses that challenge us just as readily as the ones that console us, trusting that both come from the same good and breathed-out source.

Paul''s purpose statement at the end is worth holding onto: all of this is ''so that the servant of God may be thoroughly equipped for every good work.'' Scripture isn''t an end in itself — it equips us for something. It shapes us so we''re ready for whatever act of love, service, or courage God calls us to next. That is what it means to let the Word form us, not just inform us.', 'Kata-kata Paulus kepada Timotius memberi kita salah satu gambaran paling lengkap dalam Alkitab tentang untuk apa Alkitab itu sebenarnya. Ia menyebutnya dinapaskan Allah — sebuah gambaran yang mencolok, menunjukkan bahwa kata-kata itu membawa napas Allah sendiri di dalamnya, bukan sekadar hikmat manusia tentang Allah. Dan kemudian, hampir seketika, ia beralih ke hal praktis: firman yang dinapaskan ini bermanfaat untuk mengajar, menyatakan kesalahan, memperbaiki kelakuan, dan mendidik orang dalam kebenaran.

Perhatikan luasnya daftar itu. Alkitab bukan hanya untuk mengajarkan kita informasi baru, meski itu juga dilakukannya. Ia juga untuk menyatakan kesalahan — menyebut dengan jelas apa yang salah. Dan untuk memperbaiki — menunjukkan jalan yang lebih baik. Dan untuk mendidik — disiplin yang perlahan dan berulang yang membentuk karakter dari waktu ke waktu, seperti seorang atlet melatih ototnya. Firman Allah dimaksudkan untuk menyentuh setiap bagian dari cara kita berpikir dan hidup, bukan hanya bagian-bagian yang nyaman kita periksa.

Banyak dari kita lebih suka pengajaran dan menghindari teguran, menyambut hiburan dan menolak perbaikan. Tetapi iman yang hanya menginginkan bagian-bagian nyaman dari Alkitab akan tetap dangkal. Pertumbuhan yang sesungguhnya meminta kita untuk duduk bersama ayat-ayat yang menantang kita sama siapnya dengan ayat-ayat yang menghibur kita, percaya bahwa keduanya berasal dari sumber yang sama, baik dan dinapaskan Allah.

Pernyataan tujuan Paulus di akhir patut kita pegang: semua ini ''supaya manusia kepunyaan Allah diperlengkapi untuk setiap perbuatan baik.'' Alkitab bukan tujuan akhir itu sendiri — ia memperlengkapi kita untuk sesuatu. Ia membentuk kita agar siap untuk perbuatan kasih, pelayanan, atau keberanian apa pun yang selanjutnya dipanggil Allah dari kita. Itulah arti membiarkan Firman membentuk kita, bukan sekadar memberi kita informasi.',
    'Scripture forms us, not just informs us. Is there a hard verse you''ve been avoiding that might be exactly what you need right now?', 'Alkitab membentuk kita, bukan sekadar memberi kita informasi. Adakah ayat yang sulit yang selama ini kau hindari, yang justru mungkin tepat kau butuhkan sekarang?',
    'Lord, I welcome all of Your word today — not just the parts that comfort me, but the parts that correct and train me too. Equip me through Scripture for whatever good work You have for me. Amen.', 'Tuhan, aku menyambut seluruh Firman-Mu hari ini — bukan hanya bagian yang menghiburku, tetapi juga bagian yang memperbaiki dan mendidikku. Perlengkapilah aku melalui Alkitab untuk perbuatan baik apa pun yang Engkau sediakan bagiku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Timothy 3:16-17', 'WEB', 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Timotius 3:16-17', 'TB', 'Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran. Dengan demikian tiap-tiap manusia kepunyaan Allah diperlengkapi untuk setiap perbuatan baik.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Faith Comes by Hearing', 'Iman Timbul dari Pendengaran',
    'By the end of a week spent turning our attention toward Scripture, it''s worth asking the deeper question: why does any of this matter for faith itself? Paul answers plainly in his letter to the Romans — faith comes from hearing the message, and the message is heard through the word about Christ. Faith isn''t primarily something we manufacture through willpower or emotion. It''s something that grows in us as we keep listening to the truth about who God is and what He has done.

That means the times we feel our faith weakest are often exactly the times we''ve drifted furthest from the Word — not because God has moved, but because we''ve stopped listening as closely. And it means the remedy isn''t to try harder to feel more faithful. The remedy is to return to hearing: to open Scripture again, to let the message about Christ reach our ears and hearts once more, and to trust that faith will rise the way it always has — not from striving, but from listening.

Many of us find this deeply freeing. We don''t have to conjure belief out of nothing. We simply have to keep showing up to hear, and let God do what only He can do with that hearing — planting, watering, and growing faith in us over time, the way He always has for every believer who came before us.

As you close this five-day journey, consider what it might look like to keep hearing well beyond today — a regular return to Scripture not as an obligation to check off, but as the very place where your faith is fed, strengthened, and renewed. Bread for the journey isn''t eaten once. It''s eaten daily, for as long as the road continues.', 'Menjelang akhir sepekan mengarahkan perhatian kita kepada Alkitab, ada baiknya kita bertanya lebih dalam: mengapa semua ini penting bagi iman itu sendiri? Paulus menjawab dengan jelas dalam suratnya kepada jemaat di Roma — iman timbul dari pendengaran, dan pendengaran itu oleh firman Kristus. Iman bukan terutama sesuatu yang kita ciptakan melalui kemauan keras atau perasaan. Ia adalah sesuatu yang bertumbuh dalam diri kita seiring kita terus mendengarkan kebenaran tentang siapa Allah dan apa yang telah Ia lakukan.

Itu berarti saat-saat kita merasa iman kita paling lemah sering kali justru adalah saat-saat kita paling jauh menyimpang dari Firman — bukan karena Allah yang berpindah, melainkan karena kita berhenti mendengarkan dengan saksama. Dan itu berarti solusinya bukanlah berusaha lebih keras untuk merasa lebih beriman. Solusinya adalah kembali mendengar: membuka Alkitab lagi, membiarkan firman tentang Kristus mencapai telinga dan hati kita sekali lagi, dan percaya bahwa iman akan bangkit seperti biasanya — bukan dari usaha keras, melainkan dari pendengaran.

Banyak dari kita menemukan ini sangat melegakan. Kita tidak harus menciptakan kepercayaan dari kekosongan. Kita hanya perlu terus datang untuk mendengar, dan membiarkan Allah melakukan apa yang hanya Dia bisa lakukan dengan pendengaran itu — menanam, menyiram, dan menumbuhkan iman dalam diri kita seiring waktu, sebagaimana selalu Ia lakukan bagi setiap orang percaya sebelum kita.

Saat kau menutup perjalanan lima hari ini, pertimbangkan seperti apa rasanya terus mendengar jauh melampaui hari ini — kembali secara teratur kepada Alkitab bukan sebagai kewajiban yang harus dicentang, melainkan sebagai tempat sesungguhnya di mana imanmu diberi makan, dikuatkan, dan diperbarui. Roti untuk perjalanan tidak dimakan sekali. Ia dimakan setiap hari, selama jalan itu masih berlanjut.',
    'Faith grows through listening, not striving. What would it look like to make hearing God''s word a lasting, daily rhythm rather than a five-day experiment?', 'Iman bertumbuh melalui mendengar, bukan berusaha keras. Seperti apa rasanya menjadikan mendengar Firman Tuhan sebagai irama harian yang bertahan lama, bukan sekadar eksperimen lima hari?',
    'Lord, thank You for the reminder that my faith grows as I keep listening to You. Give me a lasting hunger for Your word long after these five days end, and let Scripture continue to be bread for my journey. Amen.', 'Tuhan, terima kasih atas pengingat bahwa imanku bertumbuh seiring aku terus mendengarkan-Mu. Berilah aku kerinduan yang bertahan lama akan Firman-Mu jauh setelah lima hari ini berakhir, dan biarlah Alkitab terus menjadi roti bagi perjalananku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 10:17', 'WEB', 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 10:17', 'TB', 'Jadi, iman timbul dari pendengaran, dan pendengaran oleh firman Kristus.');

  -- Plan: Roots in Dry Ground: Faith That Matures
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Roots in Dry Ground: Faith That Matures',
    'Akar di Tanah Kering: Iman yang Bertumbuh Dewasa',
    'Seven days for the ordinary seasons and the dry ones',
    'Tujuh hari untuk musim yang biasa dan musim yang kering',
    7,
    'Faith doesn''t mature in the dramatic moments alone — it deepens in the long, quiet stretches when feelings run dry and life stays ordinary. Over seven days, this plan walks through the honest terrain of belief that endures: trusting God even when we don''t feel Him, finding joy hidden inside trials, refusing to give up in the monotony, waiting on renewed strength, thirsting honestly for more of God, resting in His unfailing mercy, and trusting the slow work He is still finishing in us.',
    'Iman tidak hanya bertumbuh dewasa pada momen-momen dramatis — ia semakin dalam dalam rentang waktu yang panjang dan sunyi, ketika perasaan mengering dan hidup tetap biasa saja. Selama tujuh hari, rencana ini menelusuri medan kepercayaan yang jujur dan bertahan: memercayai Tuhan bahkan ketika kita tidak merasakan-Nya, menemukan sukacita yang tersembunyi di dalam pencobaan, menolak untuk menyerah dalam kemonotonan, menantikan kekuatan yang diperbarui, merindukan Tuhan dengan jujur, beristirahat dalam kasih setia-Nya yang tak pernah berkesudahan, dan memercayai karya perlahan yang masih Ia selesaikan dalam diri kita.',
    '/images/devotions/roots-in-dry-ground-faith-that-matures.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Even If Not', 'Sekalipun Tidak',
    'The prophet Habakkuk writes one of the most honest passages in all of Scripture — a description of total agricultural and economic collapse, fig trees barren, fields producing no food, flocks and herds gone. And then, astonishingly, in the very next breath: yet I will rejoice in the LORD, I will be joyful in God my Savior. Not because circumstances changed. They hadn''t. But because his joy had quietly relocated from his circumstances to his God.

Many of us assume that mature faith means circumstances eventually stop shaking us — that enough spiritual growth should produce a kind of immunity to hardship. Habakkuk suggests something different. Mature faith doesn''t deny the empty field. It names it plainly, without pretending. And then it makes a decision, apart from feeling, to rejoice anyway, because the object of our joy was never meant to be our circumstances in the first place.

This is sometimes called an ''even if not'' faith, echoing the three young men in Daniel who declared that God was able to save them from the fire, but even if He did not, they would still not bow. That posture — trusting God''s character even when His action in our specific situation remains unclear or unwelcome — is not a lesser faith than the kind that only trusts when everything is going well. It may in fact be the deeper one.

Wherever your fields feel empty this week — a relationship, a finance, a health concern, a hope deferred — Habakkuk doesn''t ask you to pretend it''s fine. He simply invites you to relocate your joy, on purpose, to the God who remains faithful even when the field does not.', 'Nabi Habakuk menuliskan salah satu bagian paling jujur dalam seluruh Alkitab — gambaran keruntuhan pertanian dan ekonomi total, pohon ara yang tidak berbuah, ladang yang tidak menghasilkan bahan makanan, kawanan domba dan ternak yang lenyap. Dan kemudian, secara mengejutkan, tepat setelahnya: namun aku akan bersorak-sorak di dalam TUHAN, beria-ria di dalam Allah yang menyelamatkan aku. Bukan karena keadaan berubah. Keadaan itu tidak berubah. Melainkan karena sukacitanya secara diam-diam telah berpindah dari keadaannya kepada Allahnya.

Banyak dari kita mengira bahwa iman yang dewasa berarti keadaan akhirnya berhenti mengguncang kita — bahwa cukup banyak pertumbuhan rohani seharusnya menghasilkan semacam kekebalan terhadap kesulitan. Habakuk menyarankan sesuatu yang berbeda. Iman yang dewasa tidak menyangkal ladang yang kosong. Ia menyebutnya dengan terus terang, tanpa berpura-pura. Dan kemudian ia membuat keputusan, terlepas dari perasaan, untuk tetap bersukacita, sebab objek sukacita kita memang tidak pernah dimaksudkan untuk menjadi keadaan kita.

Ini kadang disebut iman ''sekalipun tidak'', bergema dari tiga pemuda dalam kitab Daniel yang menyatakan bahwa Allah sanggup menyelamatkan mereka dari api, tetapi sekalipun Ia tidak melakukannya, mereka tetap tidak akan sujud menyembah. Sikap itu — memercayai karakter Allah bahkan ketika tindakan-Nya dalam situasi khusus kita masih belum jelas atau tidak kita sukai — bukanlah iman yang lebih rendah daripada iman yang hanya percaya ketika segalanya berjalan baik. Bahkan mungkin justru itulah iman yang lebih dalam.

Di mana pun ladangmu terasa kosong minggu ini — sebuah hubungan, keuangan, kesehatan, harapan yang tertunda — Habakuk tidak memintamu berpura-pura semua baik-baik saja. Ia hanya mengundangmu untuk memindahkan sukacitamu, dengan sengaja, kepada Allah yang tetap setia bahkan ketika ladang itu tidak.',
    'Mature faith doesn''t deny the empty field — it relocates joy to God rather than circumstances. Where is your ''even if not'' being tested this week?', 'Iman yang dewasa tidak menyangkal ladang yang kosong — ia memindahkan sukacita kepada Allah, bukan pada keadaan. Di manakah ''sekalipun tidak''-mu sedang diuji minggu ini?',
    'Lord, my circumstances aren''t what I hoped for, and I won''t pretend otherwise. But I choose today to rejoice in You rather than in what I can see. Be my joy when the field is empty. Amen.', 'Tuhan, keadaanku tidak seperti yang kuharapkan, dan aku tidak akan berpura-pura sebaliknya. Namun hari ini aku memilih bersukacita di dalam Engkau, bukan di dalam apa yang bisa kulihat. Jadilah sukacitaku ketika ladang ini kosong. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakkuk 3:17-18', 'WEB', 'Though the fig tree does not bud and there are no grapes on the vines, though the olive crop fails and the fields produce no food... yet I will rejoice in the LORD, I will be joyful in God my Savior.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakuk 3:17-18', 'TB', 'Sekalipun pohon ara tidak berbunga, pohon anggur tidak berbuah, hasil pohon zaitun mengecewakan, sawah ladang tidak menghasilkan bahan makanan... namun aku akan bersorak-sorak di dalam TUHAN, beria-ria di dalam Allah yang menyelamatkan aku.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Joy Hidden Inside Trials', 'Sukacita yang Tersembunyi di Dalam Pencobaan',
    'James doesn''t tell his readers to feel joy despite trials, but to consider it pure joy whenever they face trials of many kinds — a subtle but important difference. It''s not that the trial itself is pleasant. It''s that something valuable is being produced inside it, and James wants us trained to look for that produce rather than only feel the pain of the process.

He names what that produce is: the testing of faith produces perseverance, and perseverance, allowed to finish its work, produces maturity — a faith that is complete, lacking nothing. That sequence only happens over time, and it only happens through resistance. Muscle doesn''t grow without the strain of a weight it must push against. Faith doesn''t mature without the strain of a circumstance it must trust God through.

Many of us wish for spiritual maturity without the process that actually produces it — we want the strength without the strain. But James is clear that perseverance needs to ''finish its work.'' That means some trials in our lives are not detours from our growth in faith; they are, painfully, the very curriculum of it. Rushing past them, or numbing ourselves to them, may rob us of exactly what God intended to build in us.

So today, if you''re in the middle of something hard, you''re allowed to name it as hard. But try also, gently, to consider what perseverance might be quietly forming in you even now — a patience, a trust, a depth of character that could not have grown any other way. That is not a small thing. That is maturity being built, one difficult day at a time.', 'Yakobus tidak menyuruh para pembacanya merasa sukacita di tengah pencobaan, melainkan menganggapnya sebagai suatu kebahagiaan setiap kali mereka jatuh ke dalam berbagai-bagai pencobaan — perbedaan yang halus namun penting. Bukan berarti pencobaan itu sendiri menyenangkan. Melainkan ada sesuatu yang berharga sedang dihasilkan di dalamnya, dan Yakobus ingin kita dilatih untuk mencari hasil itu, bukan hanya merasakan sakitnya proses.

Ia menyebutkan apa hasil itu: ujian terhadap imanmu menghasilkan ketekunan, dan ketekunan, jika dibiarkan menyelesaikan pekerjaannya, menghasilkan kedewasaan — iman yang sempurna, tidak kekurangan suatu apa pun. Urutan itu hanya terjadi seiring waktu, dan hanya terjadi melalui perlawanan. Otot tidak bertumbuh tanpa tekanan beban yang harus didorongnya. Iman tidak menjadi dewasa tanpa tekanan keadaan yang harus dilaluinya sambil memercayai Tuhan.

Banyak dari kita menginginkan kedewasaan rohani tanpa proses yang sesungguhnya menghasilkannya — kita menginginkan kekuatan tanpa tekanan. Tetapi Yakobus jelas bahwa ketekunan perlu ''menyelesaikan pekerjaannya.'' Itu berarti beberapa pencobaan dalam hidup kita bukanlah jalan memutar dari pertumbuhan iman kita; melainkan, dengan menyakitkan, justru kurikulum sesungguhnya darinya. Terburu-buru melewatinya, atau membuat diri kita mati rasa terhadapnya, mungkin merampas justru apa yang Tuhan maksudkan untuk dibangun dalam diri kita.

Jadi hari ini, jika kau sedang berada di tengah sesuatu yang sulit, kau diizinkan menyebutnya sulit. Tetapi cobalah juga, dengan lembut, mempertimbangkan ketekunan apa yang sedang diam-diam dibentuk dalam dirimu bahkan sekarang — kesabaran, kepercayaan, kedalaman karakter yang tidak mungkin bertumbuh dengan cara lain. Itu bukan hal kecil. Itu adalah kedewasaan yang sedang dibangun, satu hari sulit demi satu hari sulit.',
    'Trials aren''t detours from faith''s growth — they''re often the curriculum. What perseverance might God be quietly forming in you right now?', 'Pencobaan bukanlah jalan memutar dari pertumbuhan iman — sering kali itulah kurikulumnya. Ketekunan apa yang mungkin sedang diam-diam dibentuk Tuhan dalam dirimu sekarang?',
    'Lord, this trial is hard, and I won''t pretend it isn''t. But I ask You to finish the work of perseverance in me, so that what feels like loss now becomes maturity later. Help me trust the process even when I can''t see the outcome. Amen.', 'Tuhan, pencobaan ini sulit, dan aku tidak akan berpura-pura sebaliknya. Namun aku memohon Engkau menyelesaikan pekerjaan ketekunan dalam diriku, sehingga apa yang terasa seperti kerugian sekarang menjadi kedewasaan kelak. Tolonglah aku memercayai proses ini bahkan ketika aku tidak bisa melihat hasilnya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'James 1:2-4', 'WEB', 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yakobus 1:2-4', 'TB', 'Saudara-saudaraku, anggaplah sebagai suatu kebahagiaan, apabila kamu jatuh ke dalam berbagai-bagai pencobaan, sebab kamu tahu, bahwa ujian terhadap imanmu itu menghasilkan ketekunan. Dan biarkanlah ketekunan itu memperoleh buah yang matang, supaya kamu menjadi sempurna dan utuh dan tak kekurangan suatu apapun.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Do Not Grow Weary', 'Janganlah Kita Jemu-Jemu',
    'Paul''s exhortation to the Galatians is aimed less at dramatic failure and more at a quieter danger: growing weary in doing good. It''s not usually the big collapses of faith that end a person''s walk with God — it''s the slow erosion of a thousand small days where showing up for prayer, for kindness, for faithfulness, simply feels too tiring to keep doing.

This is one of the most honest realities of a maturing faith: the ordinary rhythms of belief — prayer, service, patience with difficult people, small acts of goodness that no one notices — can start to feel monotonous. Nobody applauds the fortieth act of quiet kindness the way they applauded the first. And yet Paul insists that it is precisely in these unremarkable, repeated acts that a harvest is being prepared, even if we cannot yet see it.

''At the proper time we will reap a harvest if we do not give up.'' That phrase, ''if we do not give up,'' names the real battlefield of maturing faith. It''s not usually a single dramatic temptation that derails us. It''s the slow accumulation of tiredness that convinces us the good we''re doing doesn''t matter, isn''t seen, isn''t worth continuing. Paul''s counsel is simple and stubborn: keep going anyway. The harvest is coming, even when the field looks unchanged.

Many of us find encouragement in remembering that faithfulness is rarely glamorous in the moment it''s happening. It becomes meaningful in hindsight, when the harvest finally shows itself. So if today feels like one more ordinary day of doing good with no visible reward, take heart — you are exactly where a maturing faith is meant to be: still planting, still trusting, not yet grown weary.', 'Nasihat Paulus kepada jemaat di Galatia diarahkan bukan terutama pada kegagalan dramatis, melainkan pada bahaya yang lebih diam-diam: menjadi jemu berbuat baik. Biasanya bukan keruntuhan besar iman yang mengakhiri perjalanan seseorang dengan Tuhan — melainkan erosi perlahan dari seribu hari kecil ketika datang untuk berdoa, untuk berbuat baik, untuk setia, terasa terlalu melelahkan untuk terus dilakukan.

Ini adalah salah satu kenyataan paling jujur dari iman yang sedang bertumbuh dewasa: irama biasa dari kepercayaan — doa, pelayanan, kesabaran terhadap orang-orang yang sulit, perbuatan baik kecil yang tidak diperhatikan siapa pun — dapat mulai terasa monoton. Tidak ada yang bertepuk tangan untuk perbuatan baik yang keempat puluh sebagaimana mereka bertepuk tangan untuk yang pertama. Namun Paulus menegaskan bahwa justru dalam perbuatan-perbuatan yang biasa dan berulang inilah panen sedang dipersiapkan, meski kita belum bisa melihatnya.

''Kita akan menuai pada waktunya, jika kita tidak menjadi lemah.'' Frasa itu, ''jika kita tidak menjadi lemah,'' menyebutkan medan pertempuran sesungguhnya dari iman yang sedang dewasa. Biasanya bukan satu godaan dramatis yang menggagalkan kita. Melainkan akumulasi perlahan dari rasa lelah yang meyakinkan kita bahwa kebaikan yang kita lakukan tidak penting, tidak dilihat, tidak layak dilanjutkan. Nasihat Paulus sederhana dan tegas: teruslah maju meski begitu. Panen itu akan datang, bahkan ketika ladang tampak tidak berubah.

Banyak dari kita menemukan penghiburan dengan mengingat bahwa kesetiaan jarang terasa megah pada saat sedang dijalani. Ia menjadi bermakna dalam kilas balik, ketika panen akhirnya menampakkan diri. Jadi jika hari ini terasa seperti satu hari biasa lagi berbuat baik tanpa imbalan yang tampak, kuatkanlah hatimu — kau berada tepat di tempat iman yang sedang dewasa seharusnya berada: masih menanam, masih percaya, belum menjadi jemu.',
    'It''s rarely a single failure that ends faithfulness — it''s slow weariness. What small act of good are you tempted to quit that''s worth continuing today?', 'Jarang sekali satu kegagalan yang mengakhiri kesetiaan — biasanya kelelahan yang perlahan. Perbuatan baik kecil apa yang tergoda ingin kau hentikan, padahal layak dilanjutkan hari ini?',
    'Lord, the ordinary faithfulness of daily life feels tiring sometimes, and I confess I''m tempted to give up on things no one seems to notice. Renew my strength today. Help me trust that the harvest is coming, even when I can''t see it yet. Amen.', 'Tuhan, kesetiaan yang biasa dalam hidup sehari-hari kadang terasa melelahkan, dan aku mengakui aku tergoda untuk menyerah pada hal-hal yang tampaknya tidak diperhatikan siapa pun. Perbaruilah kekuatanku hari ini. Tolonglah aku percaya bahwa panen itu akan datang, meski aku belum bisa melihatnya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Galatians 6:9', 'WEB', 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Galatia 6:9', 'TB', 'Janganlah kita jemu-jemu berbuat baik, karena apabila kita tidak menjadi lemah, kita akan menuai pada waktunya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Renewed Strength', 'Kekuatan yang Baru',
    'Isaiah writes to a weary people who have every reason to feel forgotten, and his answer isn''t a call to try harder. It''s a promise: those who hope in the LORD will renew their strength. The image that follows is deliberately layered — soaring on wings like eagles, running without growing weary, walking without fainting. Notice the order isn''t accidental. Soaring is dramatic and rare. Running is strenuous but common. Walking is the most ordinary act of all, and yet it is named too, because most of a maturing faith is not soaring, it''s simply walking without fainting, day after day.

This matters for anyone in a season that feels less like flight and more like a long, plain road. We sometimes measure our spiritual health by whether we feel dramatic, soaring faith, and when we don''t, we assume something has gone wrong. But Isaiah''s promise covers the walking too. Renewed strength doesn''t always look spectacular. Sometimes it looks like simply not fainting — showing up again tomorrow, in the same ordinary way, sustained by a hope that isn''t loud but is real.

The key word is ''hope in the LORD'' — not hope in our own reserves, not hope that circumstances will improve on our timeline, but a settled trust that God Himself is the source of the strength we need. Our own strength runs out; even young people, Isaiah says elsewhere in this passage, grow tired and weary. But God''s strength is not like ours. It renews. It replenishes what we cannot replenish ourselves.

So in whatever dry season you find yourself this week, take Isaiah''s promise as an honest invitation, not a magic formula: keep hoping in the Lord, even in the plain, unremarkable walking, and trust that renewed strength — whether it comes as soaring or simply as one more faithful step — is exactly what He has promised to those who wait on Him.', 'Yesaya menulis kepada umat yang lelah dan memiliki segala alasan untuk merasa terlupakan, dan jawabannya bukanlah panggilan untuk berusaha lebih keras. Itu adalah janji: orang-orang yang menanti-nantikan TUHAN akan mendapat kekuatan baru. Gambaran yang mengikutinya disengaja bertingkat — naik terbang dengan kekuatan seperti rajawali, berlari dan tidak menjadi lesu, berjalan dan tidak menjadi lelah. Perhatikan urutan itu bukan kebetulan. Terbang itu dramatis dan langka. Berlari itu berat namun umum. Berjalan adalah tindakan paling biasa dari semuanya, namun itu juga disebutkan, sebab sebagian besar dari iman yang sedang dewasa bukanlah terbang, melainkan sekadar berjalan tanpa menjadi lelah, hari demi hari.

Ini penting bagi siapa saja yang berada dalam musim yang terasa kurang seperti terbang dan lebih seperti jalan yang panjang dan biasa. Kita kadang mengukur kesehatan rohani kita dari apakah kita merasakan iman yang dramatis, iman yang terbang, dan ketika kita tidak merasakannya, kita mengira ada yang salah. Namun janji Yesaya juga mencakup berjalan. Kekuatan yang baru tidak selalu tampak spektakuler. Kadang ia tampak seperti sekadar tidak menjadi lelah — datang lagi besok, dengan cara yang sama biasanya, disokong oleh harapan yang tidak nyaring namun nyata.

Kata kuncinya adalah ''menanti-nantikan TUHAN'' — bukan berharap pada cadangan kekuatan kita sendiri, bukan berharap keadaan akan membaik sesuai jadwal kita, melainkan kepercayaan yang mantap bahwa Allah sendirilah sumber kekuatan yang kita butuhkan. Kekuatan kita sendiri habis; bahkan orang muda, kata Yesaya di bagian lain nas ini, menjadi lelah dan lesu. Tetapi kekuatan Allah tidak seperti kekuatan kita. Ia diperbarui. Ia mengisi kembali apa yang tidak bisa kita isi sendiri.

Jadi dalam musim kering apa pun yang sedang kau alami minggu ini, terimalah janji Yesaya sebagai undangan yang jujur, bukan rumus ajaib: teruslah menanti-nantikan TUHAN, bahkan dalam berjalan yang biasa dan tak mencolok, dan percayalah bahwa kekuatan yang baru — entah datang sebagai terbang atau sekadar satu langkah setia lagi — adalah tepat apa yang telah Ia janjikan kepada mereka yang menanti-nantikan-Nya.',
    'Most of faith isn''t soaring, it''s simply walking without fainting. Where do you need renewed strength for the ordinary walk today, not a dramatic flight?', 'Sebagian besar iman bukanlah terbang, melainkan sekadar berjalan tanpa menjadi lelah. Di manakah kau butuh kekuatan baru untuk berjalan biasa hari ini, bukan terbang yang dramatis?',
    'Lord, I don''t need a dramatic breakthrough today — I need strength to keep walking faithfully. Renew what has run dry in me, and let my hope rest in You, not in how I feel. Amen.', 'Tuhan, aku tidak butuh terobosan dramatis hari ini — aku butuh kekuatan untuk terus berjalan dengan setia. Perbaruilah apa yang telah mengering dalam diriku, dan biarlah harapanku bersandar pada-Mu, bukan pada apa yang kurasakan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 40:31', 'WEB', 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 40:31', 'TB', 'Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Thirsting for God', 'Merindukan Allah',
    'The psalmist doesn''t hide his longing behind polite language. As the deer pants for streams of water, so my soul pants for you, my God. It''s a raw, physical image — the desperate thirst of an animal that has traveled far without water, driven by pure need rather than duty. That image gives us permission for something many of us rarely allow ourselves in our faith: honest, uncomfortable longing.

So often we imagine spiritual maturity as a kind of calm satisfaction — arriving, finally, at a place where we no longer feel the ache. But this psalm suggests otherwise. The psalmist, clearly a person deep in relationship with God, is still panting, still thirsting, still asking, ''When can I go and meet with God?'' Longing itself is not evidence of immaturity. It may be one of the clearest signs that our faith is alive.

Many of us go through seasons where God feels distant, where prayer feels dry, where the presence we once sensed so clearly seems to have quieted. This psalm was likely written in exactly such a season — the psalmist recalls, almost wistfully, how he used to lead the procession to the house of God with shouts of joy and praise, and now finds himself instead remembering those days with tears. That contrast is honest, not shameful. Dry seasons are part of the terrain of a maturing faith, not a detour from it.

What matters is what we do with the thirst. The psalmist doesn''t numb it or deny it — he brings it directly to God, panting, honest, unresolved. That is itself an act of faith: to keep bringing our thirst to the only source that can actually satisfy it, trusting that even our longing is a form of worship.', 'Pemazmur tidak menyembunyikan kerinduannya di balik bahasa yang sopan. Seperti rusa merindukan sungai yang berair, demikianlah jiwaku merindukan Engkau, ya Allah. Ini gambaran yang mentah dan jasmani — dahaga putus asa dari seekor binatang yang telah menempuh jarak jauh tanpa air, didorong oleh kebutuhan murni, bukan kewajiban. Gambaran itu memberi kita izin untuk sesuatu yang jarang kita perbolehkan bagi diri kita dalam iman: kerinduan yang jujur dan tidak nyaman.

Begitu sering kita membayangkan kedewasaan rohani sebagai semacam kepuasan yang tenang — akhirnya tiba di tempat di mana kita tidak lagi merasakan kerinduan itu. Tetapi mazmur ini menyarankan hal yang berbeda. Sang pemazmur, yang jelas adalah orang yang dalam hubungannya dengan Allah, masih terengah-engah, masih dahaga, masih bertanya, ''Bilakah aku akan datang melihat Allah?'' Kerinduan itu sendiri bukanlah bukti ketidakdewasaan. Bahkan mungkin justru salah satu tanda paling jelas bahwa iman kita hidup.

Banyak dari kita melewati musim ketika Allah terasa jauh, ketika doa terasa kering, ketika kehadiran yang dulu begitu jelas kita rasakan tampak telah menyunyi. Mazmur ini kemungkinan besar ditulis tepat dalam musim semacam itu — sang pemazmur mengenang, hampir dengan rindu, bagaimana dahulu ia memimpin arak-arakan ke rumah Allah dengan sorak-sorai dan syukur, dan kini justru mendapati dirinya mengenang hari-hari itu dengan air mata. Kontras itu jujur, bukan memalukan. Musim kering adalah bagian dari medan iman yang sedang dewasa, bukan jalan memutar darinya.

Yang penting adalah apa yang kita lakukan dengan dahaga itu. Sang pemazmur tidak membuatnya mati rasa atau menyangkalnya — ia membawanya langsung kepada Allah, terengah-engah, jujur, belum terselesaikan. Itu sendiri adalah tindakan iman: terus membawa dahaga kita kepada satu-satunya sumber yang benar-benar dapat memuaskannya, percaya bahwa bahkan kerinduan kita adalah bentuk penyembahan.',
    'Longing for God is not a sign of weak faith — it may be a sign of a heart still alive to Him. What honest thirst can you bring to God today rather than hide?', 'Rindu akan Allah bukanlah tanda iman yang lemah — bisa jadi itu tanda hati yang masih hidup bagi-Nya. Dahaga jujur apa yang bisa kau bawa kepada Allah hari ini, alih-alih kau sembunyikan?',
    'God, I bring You my honest longing today — the ache, the dryness, the questions I don''t have answers to. I don''t need to hide my thirst from You. Meet me in it, as You have always met those who seek You. Amen.', 'Ya Allah, aku membawa kerinduanku yang jujur kepada-Mu hari ini — dahaga, kekeringan, pertanyaan-pertanyaan yang belum kutemukan jawabannya. Aku tidak perlu menyembunyikan dahagaku dari-Mu. Jumpailah aku di dalamnya, sebagaimana Engkau selalu menjumpai mereka yang mencari-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 42:1-2', 'WEB', 'As the deer pants for streams of water, so my soul pants for you, my God. My soul thirsts for God, for the living God. When can I go and meet with God?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 42:2-3', 'TB', 'Seperti rusa merindukan sungai yang berair, demikianlah jiwaku merindukan Engkau, ya Allah. Jiwaku haus kepada Allah, kepada Allah yang hidup. Bilakah aku akan datang melihat Allah?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'New Every Morning', 'Baru Setiap Pagi',
    'It is worth remembering that the book of Lamentations, of all places, contains one of Scripture''s most tender declarations of hope. Written amid grief and ruin, in the middle of describing genuine devastation, the writer suddenly turns: yet this I call to mind and therefore I have hope — the LORD''s mercies never come to an end, they are new every morning. Hope, here, doesn''t come from circumstances improving. It comes from remembering something true about God even while circumstances remain bleak.

That phrase ''new every morning'' matters especially for a maturing faith, because it resists a common but exhausting misunderstanding — the idea that we need enough stored-up faithfulness or emotional reserve to carry us through every future difficulty in advance. We don''t. God''s mercy isn''t a single deposit we draw down until it''s gone. It is renewed, freshly, each morning, sized exactly for that day''s need, no more hoarded ahead of time than the manna the Israelites gathered daily in the wilderness.

Many of us find this a relief precisely because we tend to worry in advance — bracing for a hardship that hasn''t arrived yet, wondering if we''ll have enough faith, enough strength, enough patience when it comes. But mercy doesn''t work that way. It meets us on the day it''s needed, not before. We are never asked to face tomorrow''s trouble with today''s grace; tomorrow will have its own fresh portion waiting.

So whatever ache or disappointment marked yesterday, this promise doesn''t erase it, but it does interrupt it: this morning carries mercy that has never been used before, entirely new, entirely sufficient for today. That is not a small thing to hold onto in a long or dry season. It''s actually everything.', 'Ada baiknya kita ingat bahwa kitab Ratapan, dari semua tempat, justru memuat salah satu pernyataan harapan yang paling lembut dalam Alkitab. Ditulis di tengah dukacita dan reruntuhan, di tengah menggambarkan kehancuran yang nyata, sang penulis tiba-tiba berbalik: tetapi hal-hal ini kuperhatikan, oleh karena itu aku ada harapan — kasih setia TUHAN tak pernah berhenti, rahmat-Nya tak pernah habis, selalu baru tiap pagi. Harapan, di sini, tidak datang dari keadaan yang membaik. Ia datang dari mengingat sesuatu yang benar tentang Allah bahkan ketika keadaan masih suram.

Ungkapan ''baru tiap pagi'' itu penting terutama bagi iman yang sedang dewasa, sebab ia melawan kesalahpahaman yang umum namun melelahkan — gagasan bahwa kita membutuhkan cukup banyak kesetiaan tersimpan atau cadangan emosi untuk membawa kita melewati setiap kesulitan di masa depan sekaligus. Kita tidak membutuhkannya. Kasih setia Allah bukanlah satu simpanan tunggal yang kita ambil terus sampai habis. Ia diperbarui, dengan segar, setiap pagi, tepat sesuai kebutuhan hari itu, tidak lebih ditimbun lebih dahulu daripada manna yang dikumpulkan bangsa Israel setiap hari di padang gurun.

Banyak dari kita menemukan ini melegakan justru karena kita cenderung mencemaskan hal-hal di muka — bersiap-siap untuk kesulitan yang belum datang, bertanya-tanya apakah kita akan punya cukup iman, cukup kekuatan, cukup kesabaran ketika itu tiba. Tetapi kasih setia tidak bekerja seperti itu. Ia menjumpai kita pada hari ia dibutuhkan, bukan sebelumnya. Kita tidak pernah diminta menghadapi kesulitan besok dengan anugerah hari ini; besok akan memiliki bagiannya sendiri yang segar yang sudah menanti.

Jadi apa pun kepedihan atau kekecewaan yang mewarnai kemarin, janji ini tidak menghapusnya, tetapi ia menyelanya: pagi ini membawa kasih setia yang belum pernah dipakai sebelumnya, sepenuhnya baru, sepenuhnya cukup untuk hari ini. Itu bukan hal kecil untuk dipegang dalam musim yang panjang atau kering. Itu sesungguhnya adalah segalanya.',
    'God''s mercy is renewed daily, not stockpiled in advance. What would it look like to face today with today''s mercy, instead of worrying about tomorrow''s?', 'Kasih setia Allah diperbarui setiap hari, bukan ditimbun terlebih dahulu. Seperti apa rasanya menghadapi hari ini dengan kasih setia hari ini, alih-alih mencemaskan hari esok?',
    'Lord, thank You that Your mercy is new this morning, sized exactly for today. I release my worry about tomorrow''s troubles and receive Your faithfulness for right now. Great is Your faithfulness to me. Amen.', 'Tuhan, terima kasih karena kasih setia-Mu baru pagi ini, tepat sesuai ukuran hari ini. Aku melepaskan kekhawatiranku tentang kesulitan besok dan menerima kesetiaan-Mu untuk saat ini. Besar kesetiaan-Mu bagiku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 'Because of the LORD''s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ratapan 3:22-23', 'TB', 'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'He Who Began a Good Work', 'Dia yang Telah Memulai Pekerjaan yang Baik',
    'As this week closes, it''s worth returning to a promise Paul makes almost in passing, as if it were simply obvious: he who began a good work in you will carry it on to completion. Notice the tenses. Began — past. Will carry on — ongoing. To completion — future. Paul is describing a single unbroken project spanning our entire life, one that God started and God alone will finish.

This matters enormously for anyone who has spent a week, or a season, or years, feeling like their faith is stuck, slow, or unimpressive compared to the dramatic stories others seem to tell. Maturity in faith is rarely a straight line of visible triumphs. It''s closer to a construction project seen only in fragments — a foundation poured here, a wall raised there, long stretches where nothing seems to be happening at all, even though work continues beneath the surface.

Many of us are tempted to judge our spiritual progress by how we feel on a given day, forgetting that the person doing the actual building was never us alone. It is God who began this work, and it is God''s faithfulness, not our consistency, that guarantees its completion. That should relieve an enormous amount of pressure. We are not responsible for finishing what only God can finish. We are only asked to keep showing up to the process, trusting the Builder.

So as you finish this seven-day journey through the dry seasons and the ordinary ones, hold onto this: nothing about your faith this week — the doubts, the dry prayers, the small faithful steps, the moments of surprising joy — has gone unnoticed or unused. God, who began this good work in you, is not finished. He is still building, still carrying it forward, and He will bring it to completion. That is a promise mature enough to rest your whole life on.', 'Saat minggu ini berakhir, ada baiknya kita kembali kepada sebuah janji yang diucapkan Paulus hampir sekilas, seolah itu sesuatu yang sudah jelas: Dia, yang memulai pekerjaan yang baik di antara kamu, akan meneruskannya sampai pada akhirnya. Perhatikan bentuk waktunya. Memulai — masa lampau. Akan meneruskan — sedang berlangsung. Sampai akhirnya — masa depan. Paulus sedang menggambarkan satu proyek tak terputus yang membentang sepanjang seluruh hidup kita, yang Allah mulai dan hanya Allah yang akan menyelesaikannya.

Ini sangat penting bagi siapa saja yang telah menghabiskan satu minggu, atau satu musim, atau bertahun-tahun, merasa imannya macet, lambat, atau tidak semengesankan dibandingkan cerita-cerita dramatis yang tampaknya diceritakan orang lain. Kedewasaan dalam iman jarang berupa garis lurus kemenangan yang tampak. Ia lebih mirip proyek pembangunan yang hanya terlihat dalam potongan-potongan — sebuah fondasi dituang di sini, sebuah dinding didirikan di sana, rentang waktu panjang di mana tampaknya tidak terjadi apa-apa sama sekali, meski pekerjaan terus berlangsung di bawah permukaan.

Banyak dari kita tergoda menilai kemajuan rohani kita dari bagaimana perasaan kita pada hari tertentu, lupa bahwa yang sesungguhnya membangun tidak pernah hanya diri kita sendiri. Allahlah yang memulai pekerjaan ini, dan kesetiaan Allah, bukan konsistensi kita, yang menjamin penyelesaiannya. Itu seharusnya melepaskan tekanan yang sangat besar. Kita tidak bertanggung jawab menyelesaikan apa yang hanya bisa diselesaikan Allah. Kita hanya diminta terus datang kepada proses itu, percaya kepada Sang Pembangun.

Jadi saat kau menyelesaikan perjalanan tujuh hari melalui musim kering dan musim biasa ini, peganglah ini: tidak ada satu pun dari imanmu minggu ini — keraguan, doa yang kering, langkah-langkah setia yang kecil, momen-momen sukacita yang mengejutkan — yang luput diperhatikan atau sia-sia digunakan. Allah, yang telah memulai pekerjaan baik ini dalam dirimu, belum selesai. Ia masih membangun, masih meneruskannya, dan Ia akan menuntaskannya. Itu adalah janji yang cukup dewasa untuk menopang seluruh hidupmu.',
    'You are not responsible for finishing what only God can finish. Where do you need to trust the Builder rather than measure your own progress this week?', 'Kau tidak bertanggung jawab menyelesaikan apa yang hanya bisa diselesaikan Allah. Di manakah kau perlu memercayai Sang Pembangun, alih-alih mengukur kemajuanmu sendiri minggu ini?',
    'Lord, thank You for beginning a good work in me and for promising to finish it. When I feel stuck or slow, remind me that You are still building, still faithful, still carrying this forward. I trust You with what I cannot finish myself. Amen.', 'Tuhan, terima kasih telah memulai pekerjaan yang baik dalam diriku dan telah berjanji untuk menyelesaikannya. Ketika aku merasa macet atau lambat, ingatkan aku bahwa Engkau masih membangun, masih setia, masih meneruskannya. Aku memercayakan kepada-Mu apa yang tidak bisa kuselesaikan sendiri. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 1:6', 'WEB', 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 1:6', 'TB', 'Aku yakin sepenuhnya, bahwa Ia, yang memulai pekerjaan yang baik di antara kamu, akan meneruskannya sampai pada akhirnya pada hari Kristus Yesus.');

  -- Sub-category: Faith and Doubt --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Faith and Doubt' AND parent_id = v_family_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Faith and Doubt', 'Iman dan Keraguan', v_family_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Iman dan Keraguan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: When God Feels Silent
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'When God Feels Silent',
    'Ketika Allah Terasa Diam',
    'Finding God in the dry seasons of faith',
    'Menemukan Allah di musim kering iman',
    5,
    'For anyone whose prayers seem to hit the ceiling and whose faith feels flat rather than fiery, this five-day plan sits honestly inside the dry, quiet seasons of belief. Drawing on the psalms of lament and the prophets who also waited in silence, it gently insists that spiritual dryness is not spiritual failure, and that God is often nearest exactly when He feels farthest away.',
    'Bagi siapa saja yang doanya terasa membentur langit-langit dan imannya terasa datar, bukan menyala-nyala, rencana lima hari ini masuk dengan jujur ke dalam musim-musim kering dan sunyi dalam kepercayaan. Dengan bersandar pada mazmur-mazmur ratapan dan para nabi yang juga menanti dalam diam, rencana ini dengan lembut menegaskan bahwa kekeringan rohani bukanlah kegagalan rohani, dan bahwa Allah sering kali paling dekat justru saat Ia terasa paling jauh.',
    '/images/devotions/when-god-feels-silent.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Permission to Say It''s Hard', 'Izin untuk Berkata Ini Berat',
    'There is a particular kind of tiredness that comes from pretending everything is fine when it isn''t — and many of us have carried that tiredness into our faith without even realizing it. We show up, we sing the songs, we say the right words in prayer, but somewhere underneath, our hearts are asking a much quieter, much harder question: where are You? It can feel almost forbidden to admit that faith has gone flat, that the Bible reads like ordinary paper, that prayer feels like talking into an empty room. But the first honest step in a dry season is simply admitting that it is dry.

Scripture never asks us to fake our way through this. Long before we were born, the psalmists were already crying out with the same raw honesty we''re often afraid to bring to God. ''How long, LORD? Will you forget me forever?'' is not a whisper from someone who has given up on God — it is the cry of someone who is still, against all appearances, addressing Him directly. That distinction matters enormously. A person who has truly walked away from God doesn''t bother complaining to Him anymore. The very act of crying out, even in frustration, is itself a form of faith clinging on.

So today, give yourself permission to name what is actually true for you, without editing it into something more spiritually presentable. Maybe it''s boredom in prayer, maybe it''s resentment over unanswered requests, maybe it''s simply numbness after a long, ordinary stretch of life. None of that disqualifies you from God''s presence. In fact, the honest naming of it is often the very doorway back into relationship, because it stops us from performing faith and starts us actually living it, mess and all.

Many who have walked this road testify that the turning point wasn''t a dramatic breakthrough but a small, deliberate decision to keep showing up even while feeling nothing — to keep praying honest, unpolished prayers instead of polished, distant ones. That decision doesn''t erase the dryness overnight, but it keeps the door open. And a door held open, even by trembling hands, is enough for God to keep walking through.', 'Ada satu jenis kelelahan yang muncul karena berpura-pura semuanya baik-baik saja padahal tidak — dan banyak dari kita membawa kelelahan itu ke dalam hidup iman tanpa benar-benar menyadarinya. Kita hadir di gereja, kita menyanyikan pujian, kita mengucapkan kata-kata yang tepat dalam doa, tetapi jauh di dalam, hati kita sedang bertanya sesuatu yang jauh lebih pelan dan lebih sulit: di manakah Engkau? Rasanya hampir seperti terlarang untuk mengakui bahwa iman terasa datar, bahwa Alkitab terasa seperti kertas biasa, bahwa doa terasa seperti berbicara ke ruangan kosong. Namun langkah jujur pertama dalam musim kering adalah sekadar mengakui bahwa memang sedang kering.

Alkitab tidak pernah meminta kita berpura-pura melewati ini. Jauh sebelum kita lahir, pemazmur sudah berseru dengan kejujuran mentah yang sering kita takut bawa kepada Allah. ''Berapa lama lagi, TUHAN? Apakah Engkau melupakan aku untuk selama-lamanya?'' bukanlah bisikan orang yang sudah menyerah pada Allah — itu adalah teriakan orang yang, meski segala sesuatunya tampak sebaliknya, masih berbicara langsung kepada-Nya. Perbedaan ini sangat penting. Orang yang benar-benar meninggalkan Allah tidak lagi repot-repot mengeluh kepada-Nya. Tindakan berseru itu sendiri, bahkan dalam kekecewaan, adalah bentuk iman yang masih berpegang teguh.

Jadi hari ini, berikan dirimu izin untuk menamai apa yang sesungguhnya kamu rasakan, tanpa menyuntingnya menjadi sesuatu yang terdengar lebih rohani. Mungkin itu kebosanan dalam doa, mungkin kekecewaan atas permohonan yang belum terjawab, mungkin sekadar mati rasa setelah masa yang panjang dan biasa-biasa saja. Tak satu pun dari itu mendiskualifikasi dirimu dari hadirat Allah. Justru, pengakuan jujur itu sering kali menjadi pintu masuk kembali ke dalam relasi, karena hal itu menghentikan kita dari sekadar berpura-pura beriman dan mulai benar-benar menjalaninya, dengan segala kekacauannya.

Banyak orang yang telah melewati jalan ini bersaksi bahwa titik baliknya bukanlah terobosan dramatis, melainkan keputusan kecil yang disengaja untuk tetap hadir sekalipun tidak merasakan apa-apa — untuk tetap berdoa dengan jujur dan apa adanya, bukan doa yang rapi namun berjarak. Keputusan itu tidak langsung menghapus kekeringan, tetapi membuat pintu tetap terbuka. Dan pintu yang tetap terbuka, sekalipun oleh tangan yang gemetar, sudah cukup bagi Allah untuk terus melangkah masuk.',
    'Naming your dryness honestly to God is not a lack of faith — it is faith still speaking.', 'Menamai kekeringanmu dengan jujur di hadapan Allah bukanlah kurangnya iman — itu adalah iman yang masih berbicara.',
    'Lord, I don''t want to pretend with You anymore. You already see the flatness in my heart, so I bring it to You honestly instead of hiding it. Thank You that my honest cry is still a form of trust. Stay near me even in my numbness, and teach me to keep showing up. Amen.', 'Tuhan, aku tidak ingin lagi berpura-pura di hadapan-Mu. Engkau sudah melihat kedatangan hatiku, jadi aku membawanya kepada-Mu dengan jujur, bukan menyembunyikannya. Terima kasih karena seruan jujurku tetap menjadi bentuk kepercayaan. Tetaplah dekat denganku bahkan dalam kebasanku, dan ajar aku untuk terus hadir. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 13:1-2', 'WEB', 'How long, LORD? Will you forget me forever? How long will you hide your face from me? How long must I wrestle with my thoughts and day after day have sorrow in my heart?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 13:2-3', 'TB', 'Berapa lama lagi, TUHAN, Kaulupakan aku terus-menerus? Berapa lama lagi Engkau menyembunyikan wajah-Mu terhadap aku? Berapa lama lagi aku harus menaruh rancangan dalam jiwaku, kedukaan dalam hatiku sepanjang hari?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'The Soul That Talks to Itself', 'Jiwa yang Berbicara kepada Dirinya Sendiri',
    'One of the most quietly powerful habits modeled in the Psalms is the practice of a person literally speaking to their own soul. ''Why, my soul, are you downcast? Why so disturbed within me?'' is not rhetorical decoration — it''s a spiritual technique. The psalmist notices that his feelings and his faith are not the same thing, and instead of simply obeying whatever his emotions tell him in the moment, he turns and addresses them directly, almost like a shepherd calling a wandering sheep back toward the flock.

This matters because dry seasons often convince us that our feelings are the final truth about our situation. If I feel distant from God, then I must be distant from God. If prayer feels empty, then God must not be listening. But feelings, however real and worth taking seriously, are not always accurate messengers. They are shaped by exhaustion, by circumstance, by chemistry, by a hundred things that have nothing to do with whether God is actually present and at work. Learning to notice a feeling without immediately believing everything it says is one of the quiet disciplines of a mature faith.

So the psalmist doesn''t deny what he feels — downcast, disturbed, these are real words for real pain. But he refuses to let those feelings have the last word. Instead he preaches truth back to his own heart: ''Put your hope in God, for I will yet praise him, my Savior and my God.'' Notice the tense — not ''I feel like praising him now,'' but ''I will yet praise him.'' That''s hope reaching forward past the current moment into a future he trusts is coming, even though he cannot feel it yet.

Try this today: when the heaviness rises, don''t just sit passively under it. Speak to your own soul the way the psalmist did. Say out loud, if you can, ''Why are you downcast, my soul? Put your hope in God.'' It will feel strange, even artificial, at first. But over time this small act of talking back to your feelings, rather than simply obeying them, becomes one of the sturdiest habits a dry season can teach you.', 'Salah satu kebiasaan yang paling diam-diam berkuasa dalam Mazmur adalah praktik seseorang benar-benar berbicara kepada jiwanya sendiri. ''Mengapa engkau tertekan, hai jiwaku, dan mengapa engkau gelisah di dalam diriku?'' bukanlah hiasan retoris — itu adalah teknik rohani. Sang pemazmur menyadari bahwa perasaannya dan imannya bukanlah hal yang sama, dan alih-alih sekadar menuruti apa pun yang dikatakan emosinya saat itu, ia berbalik dan berbicara langsung kepadanya, hampir seperti seorang gembala memanggil domba yang tersesat kembali ke kawanan.

Ini penting karena musim kering sering meyakinkan kita bahwa perasaan kita adalah kebenaran akhir tentang keadaan kita. Jika aku merasa jauh dari Allah, maka pastilah aku memang jauh dari Allah. Jika doa terasa hampa, maka pastilah Allah tidak mendengarkan. Tetapi perasaan, betapapun nyata dan patut diperhatikan, tidak selalu menjadi pembawa pesan yang akurat. Perasaan dibentuk oleh kelelahan, oleh keadaan, oleh kimia tubuh, oleh seratus hal lain yang tidak ada hubungannya dengan apakah Allah sungguh hadir dan bekerja. Belajar memperhatikan perasaan tanpa langsung memercayai segala sesuatu yang dikatakannya adalah salah satu disiplin diam dari iman yang dewasa.

Jadi sang pemazmur tidak menyangkal apa yang ia rasakan — tertekan, gelisah, itu adalah kata-kata nyata untuk penderitaan nyata. Tetapi ia menolak membiarkan perasaan itu menjadi kata terakhir. Sebaliknya, ia memberitakan kebenaran kembali kepada hatinya sendiri: ''Berharaplah kepada Allah! Sebab aku akan bersyukur lagi kepada-Nya, penolongku dan Allahku!'' Perhatikan bentuk waktunya — bukan ''aku merasa ingin memuji Dia sekarang,'' melainkan ''aku akan bersyukur lagi.'' Itulah pengharapan yang menjangkau melampaui saat ini ke masa depan yang ia percayai akan datang, sekalipun ia belum bisa merasakannya.

Cobalah ini hari ini: ketika kebebanan itu muncul, jangan hanya duduk pasif di bawahnya. Berbicaralah kepada jiwamu sendiri seperti yang dilakukan pemazmur. Ucapkanlah, jika kamu bisa, ''Mengapa engkau tertekan, hai jiwaku? Berharaplah kepada Allah.'' Rasanya akan aneh, bahkan dibuat-buat, pada awalnya. Tetapi seiring waktu, tindakan kecil membalas perasaanmu ini, alih-alih sekadar menaatinya, menjadi salah satu kebiasaan paling kokoh yang dapat diajarkan oleh musim kering.',
    'Your feelings are real, but they are not the final word — you are allowed to preach hope back to your own heart.', 'Perasaanmu itu nyata, tetapi bukan kata terakhir — kamu diperbolehkan memberitakan pengharapan kembali kepada hatimu sendiri.',
    'God, my heart feels heavy today, and I don''t want to pretend otherwise. But like the psalmist, I choose to speak hope to my own soul. Help me trust that I will yet praise You, even before I feel like it. Be my Savior in this dry moment. Amen.', 'Allah, hatiku terasa berat hari ini, dan aku tidak ingin berpura-pura sebaliknya. Tetapi seperti pemazmur, aku memilih untuk berbicara pengharapan kepada jiwaku sendiri. Tolong aku percaya bahwa aku akan bersyukur lagi kepada-Mu, bahkan sebelum aku merasakannya. Jadilah Juruselamatku dalam saat kering ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 42:5', 'WEB', 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 42:6', 'TB', 'Mengapa engkau tertekan, hai jiwaku, dan mengapa engkau gelisah di dalam diriku? Berharaplah kepada Allah! Sebab aku akan bersyukur lagi kepada-Nya, penolongku dan Allahku!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'When Even Lament Goes Unanswered', 'Ketika Ratapan pun Tak Terjawab',
    'Most of the psalms of complaint eventually swing around to praise — the writer cries out, and by the final verses, hope has returned. But not all of them. Psalm 88 is unusual, almost startling, because it ends in darkness. The psalmist has cried day and night, and the very last line of the poem is essentially, ''the darkness is my closest friend.'' No triumphant turn. No resolved chord. Just honest, unresolved grief laid before God and left there.

It would be easy to skip past a psalm like this, assuming it doesn''t belong in Scripture, or that it represents some kind of spiritual failure on the writer''s part. But its presence in the Bible is itself a quiet, profound statement: God made room in His holy book for a prayer that never gets a happy ending on the page. He didn''t need the psalmist to tie it up neatly before it counted as real prayer. Sometimes lament is the whole prayer, start to finish, and that is enough.

This matters enormously for anyone in a season where their own cries seem to disappear into silence. If your prayers haven''t resolved into praise yet, if the darkness still feels like the nearest thing to you, you are in good company — the company of a psalmist whose unanswered lament made it into sacred Scripture and has comforted honest hearts for three thousand years. Unresolved pain, brought honestly to God, is not a failed prayer. It is still, fully, prayer.

What Psalm 88 quietly teaches is that God is present even in the psalms that don''t resolve, even in the seasons that don''t wrap up on schedule. He was listening on the day this psalm was written, even though the writer couldn''t yet see or feel it. The same is true for you today. Your unresolved lament is heard, even when the answer, or the relief, hasn''t arrived yet.', 'Sebagian besar mazmur ratapan pada akhirnya berbalik kepada pujian — sang penulis berseru, dan pada ayat-ayat terakhir, pengharapan kembali muncul. Tetapi tidak semuanya begitu. Mazmur 88 tidak biasa, bahkan mengejutkan, karena berakhir dalam kegelapan. Sang pemazmur telah berseru siang dan malam, dan baris terakhir puisi itu pada dasarnya berkata, ''kegelapanlah sahabatku yang paling karib.'' Tidak ada perubahan kemenangan. Tidak ada akor yang terselesaikan. Hanya kedukaan jujur yang belum terselesaikan, diletakkan di hadapan Allah dan dibiarkan di sana.

Akan mudah untuk melewati mazmur semacam ini, menganggap ia tidak layak ada dalam Alkitab, atau mewakili semacam kegagalan rohani dari sang penulis. Tetapi kehadirannya dalam Alkitab sendiri adalah pernyataan yang diam-diam mendalam: Allah memberi tempat dalam kitab suci-Nya bagi sebuah doa yang tidak pernah berakhir bahagia di halaman itu. Ia tidak membutuhkan pemazmur untuk merapikannya sebelum itu dianggap sebagai doa yang sungguh. Terkadang ratapan adalah keseluruhan doa itu sendiri, dari awal sampai akhir, dan itu sudah cukup.

Ini sangat penting bagi siapa saja yang berada dalam musim di mana seruan mereka sendiri seolah lenyap ke dalam kesunyian. Jika doamu belum berubah menjadi pujian, jika kegelapan masih terasa sebagai hal yang paling dekat denganmu, kamu berada dalam kebersamaan yang baik — kebersamaan dengan seorang pemazmur yang ratapannya yang tak terjawab masuk ke dalam Kitab Suci yang kudus dan telah menghibur hati-hati jujur selama tiga ribu tahun. Penderitaan yang belum terselesaikan, dibawa dengan jujur kepada Allah, bukanlah doa yang gagal. Itu tetap, sepenuhnya, doa.

Apa yang diam-diam diajarkan Mazmur 88 adalah bahwa Allah hadir bahkan dalam mazmur-mazmur yang tidak terselesaikan, bahkan dalam musim-musim yang tidak berakhir sesuai jadwal. Ia mendengarkan pada hari mazmur ini ditulis, meskipun sang penulis belum bisa melihat atau merasakannya. Hal yang sama berlaku bagimu hari ini. Ratapanmu yang belum terselesaikan itu didengar, bahkan ketika jawabannya, atau kelegaannya, belum tiba.',
    'An unresolved cry brought honestly to God is still, fully, a prayer that is heard.', 'Seruan yang belum terselesaikan namun dibawa dengan jujur kepada Allah tetaplah, sepenuhnya, doa yang didengar.',
    'Lord, some of my prayers don''t have a tidy ending, and I''ve felt ashamed of that. Thank You for making room in Your Word for cries that don''t resolve. I bring You my unfinished grief today, trusting that You hear it even without a neat conclusion. Amen.', 'Tuhan, sebagian doaku tidak memiliki akhir yang rapi, dan aku merasa malu karenanya. Terima kasih karena Engkau memberi tempat dalam Firman-Mu bagi seruan yang tak terselesaikan. Aku membawa kepada-Mu kedukaanku yang belum selesai hari ini, percaya bahwa Engkau mendengarnya sekalipun tanpa kesimpulan yang rapi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 88:1', 'WEB', 'LORD, you are the God who saves me; day and night I cry out to you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 88:2', 'TB', 'Ya TUHAN, Allah yang menyelamatkan aku, siang hari aku berseru-seru, pada waktu malam aku menghadap Engkau.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Not in the Wind, Not in the Fire', 'Bukan dalam Angin, Bukan dalam Api',
    'Elijah''s story right before this moment is one of spectacular spiritual highs — fire falling from heaven, false prophets defeated, a nation watching in awe. And yet almost immediately afterward, we find him exhausted, afraid, and asking God to let him die. It''s a striking reminder that even the most dramatic encounters with God''s power don''t inoculate us against dryness and despair. Elijah had seen fire fall from the sky, and he still ended up alone in a cave, spiritually and physically spent.

God''s response to Elijah is worth lingering over. He doesn''t scold him for his exhaustion or demand he snap back into confident faith. Instead, He tells him to stand on the mountain, because the LORD is about to pass by. A great and powerful wind tears the mountains apart — but the LORD is not in the wind. Then an earthquake — but the LORD is not in the earthquake. Then a fire — but the LORD is not in the fire. And finally, after all that spectacle, comes a gentle whisper. And it is there, in the whisper, that Elijah finally wraps his face and steps out to meet God.

Many of us, in our dry seasons, are quietly waiting for the wind, the earthquake, or the fire — a dramatic sign, a thunderous confirmation, something unmistakable to break through our numbness and prove God is real again. And when it doesn''t come, we assume He is absent. But Elijah''s story suggests something gentler and, honestly, more realistic: God is often found not in the spectacle we''re straining to hear, but in the quiet whisper we almost miss because we''re listening too loudly.

If your season feels quiet rather than thunderous, that quietness may not be absence at all — it may be exactly where God has chosen to meet you. Today, instead of demanding a dramatic sign, try turning down the noise and listening for the gentle whisper. It rarely announces itself the way we expect, but it is no less real, and no less God.', 'Kisah Elia tepat sebelum momen ini adalah salah satu puncak rohani yang spektakuler — api turun dari langit, nabi-nabi palsu dikalahkan, seluruh bangsa menyaksikan dengan takjub. Namun hampir seketika sesudahnya, kita mendapatinya kelelahan, ketakutan, dan meminta Allah mengizinkannya mati. Ini adalah pengingat yang mencolok bahwa bahkan perjumpaan paling dramatis dengan kuasa Allah pun tidak membuat kita kebal terhadap kekeringan dan keputusasaan. Elia telah menyaksikan api turun dari langit, dan ia tetap berakhir sendirian di dalam gua, letih secara rohani maupun jasmani.

Jawaban Allah kepada Elia layak untuk direnungkan lebih lama. Ia tidak menegur kelelahannya atau menuntutnya untuk segera kembali menjadi orang beriman yang penuh percaya diri. Sebaliknya, Ia menyuruhnya berdiri di gunung, sebab TUHAN akan lewat. Angin besar dan kuat mengoyak gunung-gunung — tetapi TUHAN tidak ada dalam angin itu. Kemudian datang gempa — tetapi TUHAN tidak ada dalam gempa itu. Kemudian api — tetapi TUHAN tidak ada dalam api itu. Dan akhirnya, setelah semua tontonan itu, datanglah bunyi angin sepoi-sepoi basah. Dan di sanalah, dalam angin sepoi-sepoi itu, Elia akhirnya menyelubungi wajahnya dan melangkah keluar menemui Allah.

Banyak dari kita, dalam musim kering kita, diam-diam menantikan angin, gempa, atau api — tanda yang dramatis, konfirmasi yang menggelegar, sesuatu yang tak terbantahkan untuk menerobos kebasan kita dan membuktikan bahwa Allah sungguh nyata lagi. Dan ketika itu tidak datang, kita mengira Ia tidak hadir. Tetapi kisah Elia menunjukkan sesuatu yang lebih lembut dan, sejujurnya, lebih realistis: Allah sering ditemukan bukan dalam tontonan yang kita paksakan diri untuk dengar, melainkan dalam bisikan lembut yang hampir kita lewatkan karena kita terlalu keras mendengarkan.

Jika musimmu terasa sunyi dan bukan menggelegar, kesunyian itu mungkin sama sekali bukan ketidakhadiran — mungkin justru itulah tempat yang dipilih Allah untuk menjumpaimu. Hari ini, alih-alih menuntut tanda dramatis, cobalah mengecilkan kebisingan dan mendengarkan bisikan lembut itu. Ia jarang mengumumkan dirinya seperti yang kita harapkan, tetapi ia tidak kalah nyata, dan tidak kalah Allah.',
    'God is not always in the spectacle you''re straining to hear — sometimes He is in the whisper you almost miss.', 'Allah tidak selalu ada dalam tontonan yang kau paksakan diri untuk dengar — kadang Ia ada dalam bisikan yang hampir kau lewatkan.',
    'Lord, I''ve been listening for thunder when You may have been whispering all along. Quiet the noise in my heart and my expectations. Help me recognize Your gentle presence even when it doesn''t announce itself dramatically. Amen.', 'Tuhan, aku telah menantikan guntur padahal mungkin Engkau sudah berbisik sepanjang waktu. Tenangkan kebisingan dalam hatiku dan harapanku. Tolong aku mengenali kehadiran-Mu yang lembut sekalipun tidak mengumumkan dirinya secara dramatis. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Kings 19:11-12', 'WEB', 'The LORD said, ''Go out and stand on the mountain in the presence of the LORD, for the LORD is about to pass by.'' ... After the earthquake came a fire, but the LORD was not in the fire. And after the fire came a gentle whisper.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Raja-raja 19:11-12', 'TB', 'Firman-Nya: ''Keluarlah dan berdirilah di atas gunung itu di hadapan TUHAN.'' ... Dan sesudah gempa itu datang api, tetapi TUHAN tidak ada dalam api itu. Dan sesudah api itu datang bunyi angin sepoi-sepoi basah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'New Every Morning', 'Baru Setiap Pagi',
    'The book of Lamentations is, true to its name, a book of grief — it was written in the aftermath of catastrophic loss, and it does not rush past the devastation to get to a tidy conclusion. And yet, right in the middle of this book of sorrow, there is a hinge, a small pocket of extraordinary hope: ''Because of the LORD''s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.'' It is not a denial of the grief around it. It is hope spoken from inside the grief, not after it.

This is an important pattern for anyone walking through a long, dry season: hope doesn''t require the difficulty to end first. The writer of Lamentations is still surrounded by ruins when he says this. His circumstances haven''t changed. What has shifted is where he has chosen to fix his gaze — from the wreckage around him to the character of God, which does not depend on how the day is going. God''s compassions are ''new every morning,'' which means yesterday''s dryness does not have to define today, and today''s dryness does not have to define tomorrow.

There is something quietly freeing in that phrase ''new every morning.'' It means we are never required to have enough faith, enough hope, or enough spiritual energy to last a lifetime in a single reserve. We are only asked to receive what is given today — a fresh, daily portion of God''s compassion, sufficient for this day''s need, whatever this day happens to hold. That takes enormous pressure off a tired soul. You don''t have to solve your whole dry season today. You only have to receive today''s mercy.

As this five-day journey through dryness comes to a close, let this be the phrase you carry: new every morning. Whatever this season has held — the honest complaints, the talking to your own soul, the unresolved laments, the quiet whisper you strained to hear — none of it disqualifies you from tomorrow''s fresh mercy. Great is His faithfulness, not because your circumstances have resolved, but because His character never wavers, morning after ordinary morning.', 'Kitab Ratapan, sesuai namanya, adalah kitab kedukaan — ditulis setelah kehancuran yang dahsyat, dan ia tidak buru-buru melewati kehancuran itu untuk sampai pada kesimpulan yang rapi. Namun, tepat di tengah kitab kesedihan ini, ada sebuah engsel, sekantong kecil pengharapan yang luar biasa: ''Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!'' Ini bukan penyangkalan atas kedukaan di sekelilingnya. Ini adalah pengharapan yang diucapkan dari dalam kedukaan itu, bukan sesudahnya.

Ini adalah pola penting bagi siapa saja yang melewati musim kering yang panjang: pengharapan tidak menuntut kesulitan berakhir terlebih dahulu. Penulis Ratapan masih dikelilingi reruntuhan ketika ia mengatakan ini. Keadaannya belum berubah. Yang bergeser adalah ke mana ia memilih menatapkan pandangannya — dari puing-puing di sekelilingnya kepada karakter Allah, yang tidak bergantung pada bagaimana harinya berjalan. Rahmat Allah ''selalu baru tiap pagi,'' yang berarti kekeringan kemarin tidak harus menentukan hari ini, dan kekeringan hari ini tidak harus menentukan besok.

Ada sesuatu yang diam-diam membebaskan dalam frasa ''selalu baru tiap pagi'' itu. Artinya kita tidak pernah dituntut untuk memiliki cukup iman, cukup harapan, atau cukup energi rohani untuk bertahan seumur hidup dalam satu cadangan. Kita hanya diminta menerima apa yang diberikan hari ini — sebuah porsi rahmat Allah yang segar setiap hari, cukup untuk kebutuhan hari ini, apa pun yang dibawa hari ini. Itu mengangkat tekanan yang besar dari jiwa yang lelah. Kamu tidak perlu menyelesaikan seluruh musim keringmu hari ini. Kamu hanya perlu menerima rahmat hari ini.

Ketika perjalanan lima hari melewati kekeringan ini mendekati akhirnya, biarlah ini menjadi frasa yang kamu bawa: selalu baru tiap pagi. Apa pun yang telah dibawa musim ini — keluhan-keluhan jujur, berbicara kepada jiwamu sendiri, ratapan-ratapan yang belum terselesaikan, bisikan lembut yang kamu paksakan diri untuk dengar — tidak satu pun darinya mendiskualifikasi dirimu dari rahmat segar esok hari. Besar kesetiaan-Nya, bukan karena keadaanmu telah terselesaikan, melainkan karena karakter-Nya tidak pernah goyah, pagi demi pagi yang biasa.',
    'You don''t need enough faith to last a lifetime today — only enough to receive this morning''s fresh mercy.', 'Kamu tidak butuh iman yang cukup untuk seumur hidup hari ini — hanya cukup untuk menerima rahmat yang baru pagi ini.',
    'Faithful God, thank You that Your compassion doesn''t run out, even in my longest dry seasons. I release the pressure to have it all figured out today, and I simply receive Your mercy for this morning. Great is Your faithfulness, whether I feel it or not. Amen.', 'Allah yang setia, terima kasih karena rahmat-Mu tidak pernah habis, bahkan dalam musim keringku yang paling panjang. Aku melepaskan tekanan untuk menyelesaikan semuanya hari ini, dan aku sekadar menerima rahmat-Mu untuk pagi ini. Besar kesetiaan-Mu, baik aku merasakannya maupun tidak. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 'Because of the LORD''s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ratapan 3:22-23', 'TB', 'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!');

  -- Plan: Honest Questions, Held Faith
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Honest Questions, Held Faith',
    'Pertanyaan Jujur, Iman yang Tetap Dipegang',
    'A 7-day journey through doubt, unanswered questions, and a faith big enough to hold them',
    'Perjalanan 7 hari melewati keraguan, pertanyaan tak terjawab, dan iman yang cukup besar untuk menampungnya',
    7,
    'Some of the most faithful people in Scripture were also the most persistent questioners — Job demanding answers, Habakkuk arguing with God, Thomas refusing to believe secondhand, John the Baptist wondering from prison if he''d gotten it all wrong. This seven-day plan walks through their questions to show that doubt and faith are not opposites; questioning God, done honestly, can be one of the most faithful things we ever do.',
    'Sebagian dari tokoh Alkitab yang paling beriman justru adalah para penanya yang paling gigih — Ayub yang menuntut jawaban, Habakuk yang berdebat dengan Allah, Tomas yang menolak percaya begitu saja, Yohanes Pembaptis yang dari penjara bertanya-tanya apakah ia telah salah selama ini. Rencana tujuh hari ini menelusuri pertanyaan-pertanyaan mereka untuk menunjukkan bahwa keraguan dan iman bukanlah lawan; mempertanyakan Allah, dilakukan dengan jujur, bisa menjadi salah satu hal paling beriman yang pernah kita lakukan.',
    '/images/devotions/honest-questions-held-faith.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Unless I See', 'Sebelum Aku Melihat',
    'Thomas gets an unfair reputation as the disciple who lacked faith, but read his story closely and a different picture emerges: he was a man who refused to settle for someone else''s experience of God when his own heart still had questions. The other disciples told him plainly, ''We have seen the Lord!'' That should have been enough. It wasn''t. Thomas needed to encounter the risen Christ himself, on his own terms, before he could say the words ''my Lord and my God.''

It''s worth noticing what Thomas didn''t do. He didn''t quietly slip away from the group. He didn''t pretend to believe what he didn''t yet believe. He stayed in the room with the other disciples, doubts and all, for eight more days, waiting. There is something important in that: doubt, honestly held, doesn''t have to mean leaving the community of faith. Thomas kept showing up even before his questions were resolved, and it was precisely there, among the believers, that Jesus met him.

When Jesus does appear, He doesn''t rebuke Thomas for his skepticism or shame him in front of the others. He simply says, ''Put your finger here; see my hands. Reach out your hand and put it into my side.'' Jesus meets Thomas''s specific doubt with specific, tender evidence. He doesn''t demand blind acceptance; He offers exactly what Thomas said he needed. This tells us something enormous about how God responds to honest questions — not with irritation, but with patient, personal engagement.

If you are carrying your own version of ''unless I see, I will not believe,'' you are in the company of a disciple whose honest doubt is recorded, unedited, in Scripture — and who ended up making one of the most complete declarations of faith in the entire Gospel of John. Doubt didn''t disqualify Thomas from a deep encounter with the risen Christ. It became the very doorway to it.', 'Tomas mendapat reputasi yang tidak adil sebagai murid yang kurang beriman, tetapi jika membaca kisahnya dengan saksama, muncul gambaran yang berbeda: ia adalah orang yang menolak puas dengan pengalaman orang lain tentang Allah selagi hatinya sendiri masih memiliki pertanyaan. Murid-murid lain berkata terus terang kepadanya, ''Kami telah melihat Tuhan!'' Itu seharusnya sudah cukup. Ternyata tidak. Tomas perlu menjumpai Kristus yang bangkit itu sendiri, dengan caranya sendiri, sebelum ia bisa mengucapkan kata-kata ''ya Tuhanku dan Allahku.''

Ada hal penting yang perlu diperhatikan: apa yang tidak dilakukan Tomas. Ia tidak diam-diam pergi meninggalkan kelompok itu. Ia tidak berpura-pura percaya apa yang belum ia percayai. Ia tetap tinggal di ruangan bersama murid-murid lain, dengan segala keraguannya, selama delapan hari lagi, menunggu. Ada sesuatu yang penting di situ: keraguan, yang dipegang dengan jujur, tidak harus berarti meninggalkan komunitas iman. Tomas tetap hadir bahkan sebelum pertanyaannya terjawab, dan justru di sanalah, di antara orang-orang percaya, Yesus menjumpainya.

Ketika Yesus akhirnya muncul, Ia tidak menegur skeptisisme Tomas atau mempermalukannya di depan yang lain. Ia hanya berkata, ''Taruhlah jarimu di sini dan lihatlah tangan-Ku, ulurkanlah tanganmu dan cucukkan ke dalam lambung-Ku.'' Yesus menjawab keraguan spesifik Tomas dengan bukti yang spesifik dan lembut. Ia tidak menuntut penerimaan buta; Ia menawarkan justru apa yang Tomas katakan ia butuhkan. Ini memberi tahu kita sesuatu yang besar tentang bagaimana Allah menanggapi pertanyaan jujur — bukan dengan kejengkelan, melainkan dengan keterlibatan yang sabar dan pribadi.

Jika kamu membawa versi ''sebelum aku melihat, aku tidak akan percaya'' milikmu sendiri, kamu berada dalam kebersamaan dengan seorang murid yang keraguan jujurnya dicatat, tanpa disunting, dalam Alkitab — dan yang akhirnya mengucapkan salah satu pengakuan iman paling lengkap dalam seluruh Injil Yohanes. Keraguan tidak mendiskualifikasi Tomas dari perjumpaan mendalam dengan Kristus yang bangkit. Itu justru menjadi pintu masuk menuju perjumpaan itu.',
    'Honest doubt that keeps showing up in community is exactly the kind of doubt Jesus meets with tender, personal evidence.', 'Keraguan jujur yang tetap hadir di tengah komunitas adalah justru jenis keraguan yang dijumpai Yesus dengan bukti yang lembut dan pribadi.',
    'Lord, like Thomas, I have things I need to see and feel for myself, not just borrow from someone else''s faith. Thank You for meeting doubt with patience rather than shame. Meet me where I am, and help me keep showing up even before my questions are answered. Amen.', 'Tuhan, seperti Tomas, ada hal-hal yang perlu kulihat dan kurasakan sendiri, bukan sekadar meminjam iman orang lain. Terima kasih karena Engkau menjawab keraguan dengan kesabaran, bukan rasa malu. Jumpailah aku di tempat aku berada, dan tolong aku tetap hadir sekalipun pertanyaanku belum terjawab. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'John 20:25', 'WEB', 'So the other disciples told him, ''We have seen the Lord!'' But he said to them, ''Unless I see the nail marks in his hands and put my finger where the nails were, and put my hand into his side, I will not believe.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yohanes 20:25', 'TB', 'Kata murid-murid yang lain kepadanya: ''Kami telah melihat Tuhan!'' Tetapi Tomas berkata kepada mereka: ''Sebelum aku melihat bekas paku pada tangan-Nya dan mencucukkan jariku pada bekas paku itu dan mencucukkan tanganku ke dalam lambung-Nya, sekali-kali aku tidak akan percaya.''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'I Believe; Help My Unbelief', 'Aku Percaya; Tolonglah Aku yang Tidak Percaya',
    'A desperate father brings his suffering son to Jesus, having already been let down by the disciples, who couldn''t heal the boy. When Jesus tells him that everything is possible for one who believes, the father doesn''t respond with a tidy statement of confident faith. He cries out something far more honest, and far more useful to the rest of us: ''I do believe; help me overcome my unbelief!'' Belief and doubt, tangled together in a single breath, offered to Jesus exactly as they were.

This one sentence may be one of the most relatable prayers in all of Scripture, because it refuses the false choice we often impose on ourselves — that we must be either a believer or a doubter, fully convinced or fully skeptical, with no room in between. The father models something truer to real spiritual life: faith and doubt can coexist in the very same heart, at the very same moment, and both can be honestly brought to Jesus at once.

Notice, too, that Jesus doesn''t wait for the man''s faith to become pure and unmixed before He acts. He doesn''t say, ''Come back once you''ve sorted out your unbelief.'' He heals the boy right there, in response to a prayer that was still partly doubt. This tells us something freeing: God does not require a flawless, doubt-free faith as the entry fee for His help. A mixed prayer — sincere belief tangled with honest unbelief — is still a prayer He receives and answers.

If your own faith often feels like this father''s — genuinely wanting to believe, and genuinely struggling to — you are not behind, and you are not disqualified. You are simply praying one of the most honest prayers a person can pray. Try praying it today, in your own words: I believe; help my unbelief. Bring both halves to Jesus and let Him work with what''s actually there, rather than waiting until you feel like you have it all figured out.', 'Seorang ayah yang putus asa membawa anaknya yang menderita kepada Yesus, setelah sebelumnya dikecewakan oleh murid-murid yang tidak bisa menyembuhkan anak itu. Ketika Yesus berkata bahwa segala sesuatu mungkin bagi orang yang percaya, sang ayah tidak menjawab dengan pernyataan iman yang rapi dan penuh percaya diri. Ia berseru sesuatu yang jauh lebih jujur, dan jauh lebih berguna bagi kita semua: ''Aku percaya, tolonglah aku yang tidak percaya ini!'' Kepercayaan dan keraguan, terjalin bersama dalam satu tarikan napas, dipersembahkan kepada Yesus persis apa adanya.

Satu kalimat ini mungkin salah satu doa yang paling relevan dalam seluruh Alkitab, karena ia menolak pilihan palsu yang sering kita paksakan pada diri sendiri — bahwa kita harus menjadi entah orang percaya atau peragu, sepenuhnya yakin atau sepenuhnya skeptis, tanpa ruang di antaranya. Sang ayah mencontohkan sesuatu yang lebih benar tentang kehidupan rohani yang nyata: iman dan keraguan bisa hidup berdampingan dalam hati yang sama, pada saat yang sama, dan keduanya bisa dibawa dengan jujur kepada Yesus sekaligus.

Perhatikan juga bahwa Yesus tidak menunggu iman orang itu menjadi murni dan tak bercampur sebelum Ia bertindak. Ia tidak berkata, ''Kembalilah setelah kamu menyelesaikan ketidakpercayaanmu.'' Ia menyembuhkan anak itu saat itu juga, sebagai jawaban atas doa yang masih sebagian keraguan. Ini memberi tahu kita sesuatu yang membebaskan: Allah tidak menuntut iman yang sempurna dan bebas keraguan sebagai syarat masuk untuk pertolongan-Nya. Doa yang bercampur — kepercayaan yang tulus terjalin dengan ketidakpercayaan yang jujur — tetap merupakan doa yang Ia terima dan jawab.

Jika imanmu sendiri sering terasa seperti ayah ini — benar-benar ingin percaya, dan benar-benar bergumul untuk percaya — kamu tidak tertinggal, dan kamu tidak didiskualifikasi. Kamu hanya sedang mendoakan salah satu doa paling jujur yang bisa didoakan seseorang. Cobalah mendoakannya hari ini, dengan katamu sendiri: aku percaya, tolonglah aku yang tidak percaya. Bawalah kedua bagian itu kepada Yesus dan biarkan Ia bekerja dengan apa yang sungguh-sungguh ada, alih-alih menunggu sampai kamu merasa sudah menyelesaikan semuanya.',
    'You don''t need pure, unmixed faith to bring your need to Jesus — belief and doubt can travel to Him together.', 'Kamu tidak butuh iman yang murni dan tak bercampur untuk membawa kebutuhanmu kepada Yesus — kepercayaan dan keraguan bisa datang kepada-Nya bersama-sama.',
    'Jesus, I believe, and I also struggle to believe, sometimes in the very same breath. Thank You for receiving prayers like this father''s, unfinished and honest. Help my unbelief today, and meet me in the mixture of my heart rather than waiting for it to be sorted out. Amen.', 'Yesus, aku percaya, dan aku juga bergumul untuk percaya, kadang dalam tarikan napas yang sama. Terima kasih karena Engkau menerima doa seperti doa sang ayah ini, yang belum selesai dan jujur. Tolonglah ketidakpercayaanku hari ini, dan jumpailah aku dalam campuran hatiku, bukan menunggu sampai semuanya rapi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mark 9:24', 'WEB', 'Immediately the boy''s father exclaimed, ''I do believe; help me overcome my unbelief!''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Markus 9:24', 'TB', 'Segera ayah anak itu berteriak: ''Aku percaya, tolonglah aku yang tidak percaya ini!''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'How Long, and Why?', 'Berapa Lama Lagi, dan Mengapa?',
    'Habakkuk opens his short prophetic book not with a proclamation but with a complaint, aimed directly at God: ''How long, LORD, must I call for help, but you do not listen? Or cry out to you, "Violence!" but you do not save?'' This is not the language of a distant observer commenting on injustice from a safe theoretical distance. This is the language of someone who has been praying, watching, waiting — and is frustrated that the waiting has gone on so long without visible answer.

What''s remarkable is what happens next: God actually answers him. Not with a rebuke for asking, but with a real response, even if it''s not the response Habakkuk expected or entirely wanted. The prophet''s honest, pointed question opens up an actual conversation with God — one that continues through the rest of the book, as Habakkuk keeps pressing, keeps listening, and eventually arrives at one of the most beautiful declarations of trust in all of Scripture, even while his circumstances remain hard.

This is instructive for anyone sitting with their own version of ''how long'' and ''why.'' Habakkuk shows us that bringing sharp, unresolved questions to God is not the opposite of relationship with Him — it can be the very mechanism by which the relationship deepens. God is not fragile. He does not need us to soften our questions before we bring them. He can hold ''why have You let this go on so long'' just as easily as He can hold our praise.

Consider writing your own honest question to God today, in Habakkuk''s spirit — not polished, not diplomatic, just true. You may not get an immediate answer, and that''s alright; Habakkuk didn''t get one instantly either. But the asking itself is not a betrayal of faith. It is, quite often, faith in its most active and engaged form — the kind that stays in the conversation rather than walking away from it.', 'Habakuk membuka kitab kenabiannya yang singkat bukan dengan pernyataan, melainkan dengan keluhan, ditujukan langsung kepada Allah: ''Berapa lama lagi, ya TUHAN, aku berteriak minta tolong, tetapi tidak Kaudengar, aku berseru kepada-Mu: Ada kekerasan! tetapi tidak Kautolong?'' Ini bukan bahasa seorang pengamat jauh yang mengomentari ketidakadilan dari jarak teoretis yang aman. Ini adalah bahasa seseorang yang telah berdoa, mengamati, menanti — dan frustrasi karena penantian itu berlangsung begitu lama tanpa jawaban yang tampak.

Yang luar biasa adalah apa yang terjadi selanjutnya: Allah sungguh menjawabnya. Bukan dengan teguran karena bertanya, melainkan dengan tanggapan yang sungguh nyata, sekalipun bukan tanggapan yang diharapkan atau sepenuhnya diinginkan Habakuk. Pertanyaan sang nabi yang jujur dan tajam membuka sebuah percakapan sungguhan dengan Allah — yang berlanjut sepanjang sisa kitab itu, saat Habakuk terus mendesak, terus mendengarkan, dan akhirnya sampai pada salah satu pernyataan kepercayaan paling indah dalam seluruh Alkitab, sekalipun keadaannya tetap sulit.

Ini menjadi pelajaran bagi siapa saja yang sedang duduk dengan versi ''berapa lama lagi'' dan ''mengapa'' miliknya sendiri. Habakuk menunjukkan kepada kita bahwa membawa pertanyaan yang tajam dan belum terselesaikan kepada Allah bukanlah lawan dari relasi dengan-Nya — itu justru bisa menjadi mekanisme di mana relasi itu semakin dalam. Allah tidak rapuh. Ia tidak membutuhkan kita untuk melunakkan pertanyaan kita sebelum kita membawanya. Ia bisa menampung ''mengapa Engkau membiarkan ini berlangsung begitu lama'' sama mudahnya seperti Ia menampung pujian kita.

Pertimbangkan untuk menuliskan pertanyaan jujurmu sendiri kepada Allah hari ini, dalam semangat Habakuk — tidak dipoles, tidak diplomatis, hanya benar. Kamu mungkin tidak mendapat jawaban segera, dan itu tidak apa-apa; Habakuk pun tidak langsung mendapatkannya. Tetapi tindakan bertanya itu sendiri bukanlah pengkhianatan terhadap iman. Itu, cukup sering, adalah iman dalam bentuknya yang paling aktif dan terlibat — jenis iman yang tetap berada dalam percakapan, bukan berjalan pergi meninggalkannya.',
    'A sharp, unresolved question honestly brought to God can deepen relationship rather than damage it.', 'Pertanyaan yang tajam dan belum terselesaikan, yang dibawa dengan jujur kepada Allah, dapat memperdalam relasi, bukan merusaknya.',
    'God, how long? Why does this keep going on? I bring You my sharpest, least polished questions today, trusting that You are not fragile and You are not offended. Stay in this conversation with me even when I don''t understand Your timing. Amen.', 'Allah, berapa lama lagi? Mengapa ini terus berlangsung? Aku membawa kepada-Mu pertanyaan-pertanyaanku yang paling tajam dan paling tidak dipoles hari ini, percaya bahwa Engkau tidak rapuh dan tidak tersinggung. Tetaplah berada dalam percakapan ini bersamaku sekalipun aku tidak mengerti waktu-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakkuk 1:2', 'WEB', 'How long, LORD, must I call for help, but you do not listen? Or cry out to you, ''Violence!'' but you do not save?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Habakuk 1:2', 'TB', 'Berapa lama lagi, ya TUHAN, aku berteriak minta tolong, tetapi tidak Kaudengar, aku berseru kepada-Mu: ''Ada kekerasan!'' tetapi tidak Kautolong?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'If Only I Knew Where to Find Him', 'Sekiranya Aku Tahu Bagaimana Menemui Dia',
    'Job has lost nearly everything — children, wealth, health — and his friends offer explanations that don''t fit his experience, insisting his suffering must be punishment for some hidden sin. Job knows better; he knows his own integrity, and he refuses to accept easy answers that don''t match reality. What he wants instead is not a theory about God but God Himself: ''If only I knew where to find him; if only I could go to his dwelling!'' He wants to state his case directly, to be heard, to understand.

This longing — to find God, to actually locate Him and speak face to face — is one of the most human impulses in all of Scripture, and Job gives us permission to feel it without shame. He isn''t trying to escape God or argue Him out of existence. He is trying to get closer, even in his confusion and pain, even while accusing God of hiddenness. The seeking itself, urgent and unresolved as it is, is itself an act of faith, because you don''t go looking for someone you''ve stopped believing is real.

What makes Job''s story so remarkable is what eventually happens: after chapters of unanswered questions, God does show up and speak. The answer Job receives isn''t a tidy explanation of why he suffered — it''s an overwhelming encounter with God''s greatness and presence that reframes everything. Job doesn''t get every question answered. He gets something else: God Himself, present, speaking, no longer hidden. And it''s enough.

If you find yourself longing, like Job, to simply locate God — to feel His nearness rather than just believe facts about Him — that longing is not a sign of weak faith. It is faith reaching for the real thing rather than settling for a substitute. Keep seeking. Job''s dwelling place felt impossibly distant right up until it didn''t, and the God he sought eventually spoke directly into his story.', 'Ayub telah kehilangan hampir segalanya — anak-anak, kekayaan, kesehatan — dan teman-temannya menawarkan penjelasan yang tidak cocok dengan pengalamannya, bersikeras bahwa penderitaannya pasti hukuman atas dosa tersembunyi. Ayub tahu lebih baik; ia tahu integritasnya sendiri, dan ia menolak menerima jawaban mudah yang tidak sesuai dengan kenyataan. Yang ia inginkan bukanlah teori tentang Allah, melainkan Allah sendiri: ''Sekiranya aku tahu bagaimana mendapatkan Dia, sekiranya aku boleh sampai ke tempat kediaman-Nya!'' Ia ingin menyampaikan perkaranya secara langsung, didengar, dipahami.

Kerinduan ini — untuk menemukan Allah, benar-benar menemukan lokasi-Nya dan berbicara berhadapan muka — adalah salah satu dorongan paling manusiawi dalam seluruh Alkitab, dan Ayub memberi kita izin untuk merasakannya tanpa malu. Ia tidak sedang berusaha melarikan diri dari Allah atau berargumen bahwa Ia tidak ada. Ia sedang berusaha mendekat, bahkan dalam kebingungan dan penderitaannya, bahkan sambil menuduh Allah bersembunyi. Pencarian itu sendiri, sekalipun mendesak dan belum terselesaikan, adalah tindakan iman itu sendiri, karena kamu tidak pergi mencari seseorang yang sudah kamu berhenti percayai keberadaannya.

Yang membuat kisah Ayub begitu luar biasa adalah apa yang akhirnya terjadi: setelah pasal-pasal pertanyaan yang tak terjawab, Allah sungguh datang dan berbicara. Jawaban yang diterima Ayub bukanlah penjelasan rapi tentang mengapa ia menderita — melainkan perjumpaan yang menggetarkan dengan kebesaran dan kehadiran Allah yang membingkai ulang segalanya. Ayub tidak mendapatkan setiap pertanyaannya terjawab. Ia mendapatkan sesuatu yang lain: Allah sendiri, hadir, berbicara, tidak lagi tersembunyi. Dan itu sudah cukup.

Jika kamu mendapati dirimu merindukan, seperti Ayub, sekadar menemukan lokasi Allah — merasakan kedekatan-Nya, bukan hanya percaya fakta tentang-Nya — kerinduan itu bukanlah tanda iman yang lemah. Itu adalah iman yang menjangkau hal yang sesungguhnya, bukan puas dengan penggantinya. Teruslah mencari. Tempat kediaman Ayub terasa tak mungkin dijangkau sampai akhirnya tidak lagi demikian, dan Allah yang ia cari akhirnya berbicara langsung ke dalam kisahnya.',
    'Longing to find God, even in confusion and pain, is itself evidence you still believe He is real.', 'Kerinduan untuk menemukan Allah, bahkan dalam kebingungan dan penderitaan, adalah bukti bahwa kamu masih percaya Ia sungguh ada.',
    'God, some days I just want to find You — not another explanation, but Your actual presence. Thank You that this longing is itself a form of faith. Come near, the way You eventually came near to Job, even before every question is answered. Amen.', 'Allah, ada hari-hari aku hanya ingin menemukan-Mu — bukan penjelasan lain, melainkan kehadiran-Mu yang sesungguhnya. Terima kasih karena kerinduan ini sendiri adalah bentuk iman. Datanglah mendekat, seperti Engkau akhirnya mendekat kepada Ayub, bahkan sebelum setiap pertanyaan terjawab. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Job 23:3', 'WEB', 'If only I knew where to find him; if only I could go to his dwelling!');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ayub 23:3', 'TB', 'Sekiranya aku tahu bagaimana mendapatkan Dia, sekiranya aku boleh sampai ke tempat kediaman-Nya!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Has God Forgotten to Be Gracious?', 'Sudah Lupakah Allah Menaruh Kasihan?',
    'The writer of Psalm 77 begins in genuine distress, unable to sleep, too troubled even to speak. And then he does something many of us do in hard seasons: he starts questioning God''s very character based on his current experience. ''Will the Lord reject forever? Will he never show his favor again? Has his unfailing love vanished forever? Has God forgotten to be merciful?'' These aren''t abstract theological questions — they''re personal, wounded, and completely understandable given what he''s going through.

It would be easy to read these questions as a crisis of faith, and in a sense they are. But look at what the psalmist does with them: he doesn''t stop at the questions. He goes on to say, ''Then I thought, To this I will appeal: the years when the Most High stretched out his right hand. I will remember the deeds of the LORD; yes, I will remember your miracles of long ago.'' When his present feelings couldn''t give him a reliable answer, he deliberately turned to memory — to what God had actually done before — as a more trustworthy witness than his current emotional state.

This is a genuinely useful pattern for anyone whose current circumstances are shouting louder than their memory of God''s past faithfulness. Feelings in the moment are real, but they are not the only evidence available to us. We also have a history — our own, and the wider story of Scripture — full of times God showed up, provided, rescued, and stayed faithful even when it looked doubtful. Remembering deliberately, on purpose, is not denial. It''s evidence-gathering for a case our current emotions can''t make alone.

Today, try the psalmist''s move: when the question ''has God forgotten me?'' rises up, don''t just sit with the question — go looking for the answer in memory. Recall a specific time, in your own life or in Scripture, when God''s faithfulness was undeniable. Let that memory stand alongside your current doubt, not to erase it, but to keep it good company.', 'Penulis Mazmur 77 memulai dalam kesusahan yang nyata, tidak dapat tidur, terlalu gelisah bahkan untuk berbicara. Dan kemudian ia melakukan sesuatu yang banyak dari kita lakukan dalam musim-musim sulit: ia mulai mempertanyakan karakter Allah sendiri berdasarkan pengalamannya saat itu. ''Akan menolakkah Tuhan untuk selama-lamanya, dan tidak berkenankah Ia lagi? Sudah lenyapkah untuk seterusnya kasih setia-Nya, sudah berakhirkah janji-Nya sepanjang masa? Sudah lupakah Allah menaruh kasihan?'' Ini bukan pertanyaan teologis yang abstrak — ini pribadi, terluka, dan sepenuhnya bisa dimengerti mengingat apa yang sedang ia alami.

Akan mudah membaca pertanyaan-pertanyaan ini sebagai krisis iman, dan dalam artian tertentu memang begitu. Tetapi lihat apa yang dilakukan pemazmur dengan pertanyaan itu: ia tidak berhenti pada pertanyaan-pertanyaan itu. Ia melanjutkan dengan berkata, ''Lalu aku berkata: Inilah yang menyedihkan hatiku, bahwa tangan kanan Yang Mahatinggi berubah. Aku hendak mengingat perbuatan-perbuatan TUHAN, ya, aku hendak mengingat keajaiban-keajaiban-Mu dari zaman purbakala.'' Ketika perasaannya saat itu tidak dapat memberinya jawaban yang bisa dipercaya, ia dengan sengaja beralih kepada ingatan — kepada apa yang benar-benar telah Allah lakukan sebelumnya — sebagai saksi yang lebih dapat dipercaya daripada keadaan emosinya saat itu.

Ini adalah pola yang sungguh berguna bagi siapa saja yang keadaannya saat ini berteriak lebih keras daripada ingatannya akan kesetiaan Allah di masa lalu. Perasaan saat ini itu nyata, tetapi bukan satu-satunya bukti yang tersedia bagi kita. Kita juga memiliki sejarah — sejarah kita sendiri, dan kisah Alkitab yang lebih luas — penuh dengan saat-saat Allah hadir, menyediakan, menyelamatkan, dan tetap setia bahkan ketika keadaannya tampak meragukan. Mengingat dengan sengaja, dengan sadar, bukanlah penyangkalan. Itu adalah pengumpulan bukti untuk perkara yang tidak bisa dibuktikan sendiri oleh emosi kita saat ini.

Hari ini, cobalah langkah pemazmur: ketika pertanyaan ''apakah Allah telah melupakan aku?'' muncul, jangan hanya duduk dengan pertanyaan itu — pergilah mencari jawabannya dalam ingatan. Ingatlah satu waktu tertentu, dalam hidupmu sendiri atau dalam Alkitab, ketika kesetiaan Allah tidak dapat disangkal. Biarkan ingatan itu berdiri berdampingan dengan keraguanmu saat ini, bukan untuk menghapusnya, melainkan untuk menemaninya dengan baik.',
    'When feelings can''t give a reliable answer, deliberately remembering God''s past faithfulness is trustworthy evidence.', 'Ketika perasaan tidak bisa memberi jawaban yang dapat dipercaya, mengingat dengan sengaja kesetiaan Allah di masa lalu adalah bukti yang dapat diandalkan.',
    'Lord, in this moment my feelings tell me You''ve forgotten me, but I choose to remember what You''ve actually done before. Bring to mind Your faithfulness in my own story, and let that memory stand beside my doubt today. Amen.', 'Tuhan, saat ini perasaanku mengatakan Engkau telah melupakan aku, tetapi aku memilih untuk mengingat apa yang sesungguhnya telah Engkau lakukan sebelumnya. Ingatkan aku akan kesetiaan-Mu dalam kisah hidupku sendiri, dan biarkan ingatan itu berdiri di samping keraguanku hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 77:9', 'WEB', 'Has God forgotten to be merciful? Has he in anger withheld his compassion?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 77:10', 'TB', 'Sudah lupakah Allah menaruh kasihan, atau ditutup-Nyakah rahmat-Nya karena murka?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'Even the Prophet Wondered', 'Bahkan Sang Nabi pun Bertanya-tanya',
    'John the Baptist is one of the most unshakeable figures in the New Testament — the one who leapt in the womb at Mary''s greeting, who baptized Jesus, who boldly called out sin without flinching. And yet, sitting in prison, awaiting execution, even he sends messengers to ask Jesus a startling question: ''Are you the one who is to come, or should we expect someone else?'' The man who once pointed at Jesus and declared ''Behold the Lamb of God'' is now, from a dark cell, quietly wondering if he got it wrong.

This detail is easy to skip past, but it shouldn''t be, because it tells us that doubt in hard circumstances isn''t reserved for the spiritually weak or the newly converted. It can visit even a prophet whose calling was confirmed before birth, whose certainty once seemed unshakeable. Suffering and confinement have a way of shaking loose questions we thought were long settled. That doesn''t mean John''s earlier conviction was fake. It means faith, even strong faith, can wobble under enough pressure — and that this is simply part of being human.

Notice how Jesus responds. He doesn''t scold John for asking, and He doesn''t demand John simply take His word for it. Instead, He points to the evidence: the blind receive sight, the lame walk, the deaf hear, the good news is preached to the poor. He answers the doubt with visible, tangible proof of who He is, gently inviting John to reason his way back to trust rather than shaming him for wondering in the first place.

If prison, illness, disappointment, or simply prolonged hardship has shaken loose questions in you that you thought were long settled, you''re in the company of John the Baptist — a man Jesus Himself called the greatest ''among those born of women.'' Doubt visiting a strong faith doesn''t erase what came before it. And like Jesus with John, God is often willing to answer our honest ''are You really the one?'' with fresh evidence, gently offered.', 'Yohanes Pembaptis adalah salah satu tokoh paling tak tergoyahkan dalam Perjanjian Baru — orang yang melonjak dalam rahim saat mendengar salam Maria, yang membaptis Yesus, yang dengan berani menyerukan dosa tanpa gentar. Namun, saat duduk di penjara, menantikan hukuman mati, bahkan ia mengirim utusan untuk bertanya kepada Yesus sebuah pertanyaan yang mengejutkan: ''Engkaukah yang akan datang itu, atau haruskah kami menantikan orang lain?'' Orang yang dahulu menunjuk kepada Yesus dan menyatakan ''Lihatlah Anak Domba Allah,'' kini, dari sel yang gelap, diam-diam bertanya-tanya apakah ia telah salah.

Detail ini mudah dilewatkan, tetapi seharusnya tidak, karena hal ini memberi tahu kita bahwa keraguan dalam keadaan sulit bukan hanya milik orang yang lemah rohani atau yang baru bertobat. Ia dapat mengunjungi bahkan seorang nabi yang panggilannya sudah dikonfirmasi sebelum lahir, yang kepastiannya dahulu tampak tak tergoyahkan. Penderitaan dan pengurungan memiliki cara untuk mengguncang lepas pertanyaan-pertanyaan yang kita kira sudah lama terselesaikan. Itu tidak berarti keyakinan awal Yohanes itu palsu. Itu berarti iman, bahkan iman yang kuat, dapat goyah di bawah tekanan yang cukup besar — dan itu sekadar bagian dari menjadi manusia.

Perhatikan bagaimana Yesus menanggapinya. Ia tidak menegur Yohanes karena bertanya, dan Ia tidak menuntut Yohanes sekadar percaya begitu saja pada kata-kata-Nya. Sebaliknya, Ia menunjuk pada bukti: orang buta melihat, orang lumpuh berjalan, orang tuli mendengar, kabar baik diberitakan kepada orang miskin. Ia menjawab keraguan itu dengan bukti yang nyata dan dapat dilihat tentang siapa diri-Nya, dengan lembut mengundang Yohanes untuk berpikir kembali menuju kepercayaan, bukan mempermalukannya karena bertanya-tanya sejak awal.

Jika penjara, sakit, kekecewaan, atau sekadar kesulitan yang berkepanjangan telah mengguncang lepas pertanyaan-pertanyaan dalam dirimu yang kau kira sudah lama terselesaikan, kamu berada dalam kebersamaan dengan Yohanes Pembaptis — orang yang oleh Yesus sendiri disebut yang terbesar ''di antara mereka yang dilahirkan dari perempuan.'' Keraguan yang mengunjungi iman yang kuat tidak menghapus apa yang datang sebelumnya. Dan seperti Yesus kepada Yohanes, Allah sering kali bersedia menjawab ''apakah Engkau benar-benar Dia yang dinantikan?'' yang jujur dengan bukti segar, ditawarkan dengan lembut.',
    'Doubt can visit even the strongest, most established faith under enough pressure — and it doesn''t erase what came before it.', 'Keraguan dapat mengunjungi bahkan iman yang paling kuat dan mapan di bawah tekanan yang cukup besar — dan itu tidak menghapus apa yang datang sebelumnya.',
    'Jesus, like John, some of my old certainties feel shaken by present hardship. I ask my honest question today: are You really who I''ve believed You to be? Answer me gently, with evidence, the way You answered John. Amen.', 'Yesus, seperti Yohanes, sebagian kepastianku yang lama terasa goyah oleh kesulitan yang kualami sekarang. Aku mengajukan pertanyaan jujurku hari ini: apakah Engkau sungguh Dia yang selama ini kupercayai? Jawablah aku dengan lembut, dengan bukti, seperti Engkau menjawab Yohanes. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 11:2-3', 'WEB', 'When John, who was in prison, heard about the deeds of the Messiah, he sent his disciples to ask him, ''Are you the one who is to come, or should we expect someone else?''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 11:2-3', 'TB', 'Di dalam penjara Yohanes mendengar tentang pekerjaan Kristus, lalu ia menyuruh murid-muridnya bertanya kepada-Nya: ''Engkaukah yang akan datang itu, atau haruskah kami menantikan orang lain?''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'Blessed Are Those Who Have Not Seen', 'Berbahagialah Mereka yang Tidak Melihat',
    'We return, on this final day, to Thomas — but now to the moment after his doubt was met. Having touched the risen Christ''s wounds, Thomas makes his declaration: ''My Lord and my God!'' And Jesus responds with a blessing that reaches far beyond that room, straight through history to every person who would ever come to faith without the benefit of physically seeing the risen Jesus: ''Blessed are those who have not seen and yet have believed.''

This is worth sitting with as we close this journey through honest questions. Jesus doesn''t say this to shame Thomas retroactively, as though seeing was somehow a lesser, more childish form of faith. He speaks it forward, as a blessing over everyone who would come after — everyone who has never touched the nail marks, never heard the voice audibly, and yet believes anyway. That includes every single one of us. We are the blessed ones this verse was spoken over.

It''s tempting to think a life without dramatic proof, without wind or fire or an audible voice, is a lesser kind of faith than what the first disciples experienced. But Jesus reframes it as blessed — not despite the absence of seeing, but almost because of it. Believing without seeing requires a different, and in some ways deeper, kind of trust: trusting the testimony of others, trusting the record of Scripture, trusting the quiet inner conviction that grows over time rather than the dramatic encounter that resolves everything in an instant.

As you close this week of honest questions — Thomas''s, the father''s, Habakkuk''s, Job''s, the psalmist''s, John''s — carry this blessing with you. You have not seen the nail marks with your physical eyes, and yet here you are, still asking, still seeking, still bringing your honest questions to God rather than walking away. That persistence, that refusal to fake it and refusal to quit, is itself the blessed faith Jesus spoke of. Not because your questions are gone, but because you keep bringing them to Him.', 'Kita kembali, pada hari terakhir ini, kepada Tomas — tetapi kini pada momen setelah keraguannya dijawab. Setelah menyentuh luka-luka Kristus yang bangkit, Tomas mengucapkan pernyataannya: ''Ya Tuhanku dan Allahku!'' Dan Yesus menjawab dengan sebuah berkat yang menjangkau jauh melampaui ruangan itu, langsung menembus sejarah kepada setiap orang yang kelak akan datang kepada iman tanpa keuntungan melihat secara fisik Yesus yang bangkit: ''Berbahagialah mereka yang tidak melihat, namun percaya.''

Ini layak untuk direnungkan saat kita menutup perjalanan ini melewati pertanyaan-pertanyaan jujur. Yesus tidak mengatakan ini untuk mempermalukan Tomas secara retroaktif, seolah-olah melihat adalah bentuk iman yang lebih rendah dan kekanak-kanakan. Ia mengucapkannya ke depan, sebagai berkat atas semua orang yang akan datang sesudahnya — semua orang yang tidak pernah menyentuh bekas paku, tidak pernah mendengar suara-Nya secara terdengar, namun tetap percaya. Itu termasuk kita semua. Kitalah orang-orang yang diberkati yang dimaksud dalam ayat ini.

Menggoda untuk berpikir bahwa hidup tanpa bukti dramatis, tanpa angin atau api atau suara yang terdengar, adalah jenis iman yang lebih rendah dibandingkan yang dialami murid-murid pertama. Tetapi Yesus membingkai ulang itu sebagai berbahagia — bukan meskipun tanpa melihat, melainkan hampir karena tanpa melihat itu. Percaya tanpa melihat membutuhkan jenis kepercayaan yang berbeda, dan dalam beberapa hal lebih dalam: memercayai kesaksian orang lain, memercayai catatan Alkitab, memercayai keyakinan batin yang tenang yang bertumbuh seiring waktu, bukan perjumpaan dramatis yang menyelesaikan segalanya dalam sekejap.

Saat kamu menutup minggu pertanyaan-pertanyaan jujur ini — milik Tomas, sang ayah, Habakuk, Ayub, sang pemazmur, Yohanes — bawalah berkat ini bersamamu. Kamu belum melihat bekas paku dengan mata jasmanimu, namun di sinilah kamu, masih bertanya, masih mencari, masih membawa pertanyaan jujurmu kepada Allah alih-alih berjalan pergi. Ketekunan itu, penolakan untuk berpura-pura dan penolakan untuk menyerah, itulah sesungguhnya iman yang diberkati yang Yesus maksudkan. Bukan karena pertanyaanmu telah hilang, melainkan karena kamu terus membawanya kepada-Nya.',
    'Still bringing your honest questions to God, rather than walking away, is itself the blessed faith Jesus spoke of.', 'Tetap membawa pertanyaan jujurmu kepada Allah, alih-alih berjalan pergi, adalah sesungguhnya iman yang diberkati yang dimaksud Yesus.',
    'Jesus, I have not seen the way Thomas saw, yet here I am, still seeking, still asking. Thank You for calling this blessed rather than lesser. Keep growing in me a trust that doesn''t need every question answered to keep believing. Amen.', 'Yesus, aku belum melihat seperti Tomas melihat, namun di sinilah aku, masih mencari, masih bertanya. Terima kasih karena Engkau menyebut ini berbahagia, bukan lebih rendah. Terus tumbuhkanlah dalam diriku kepercayaan yang tidak membutuhkan setiap pertanyaan terjawab untuk terus percaya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'John 20:29', 'WEB', 'Then Jesus told him, ''Because you have seen me, you have believed; blessed are those who have not seen and yet have believed.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yohanes 20:29', 'TB', 'Kata Yesus kepadanya: ''Karena engkau telah melihat Aku, maka engkau percaya. Berbahagialah mereka yang tidak melihat, namun percaya.''');

  -- Plan: Finding My Way Back
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Finding My Way Back',
    'Menemukan Jalan Kembali',
    'A short 3-day path for coming home to God after a season of doubt',
    'Jalan singkat 3 hari untuk kembali pulang kepada Allah setelah musim keraguan',
    3,
    'For those who have walked through doubt and are ready, even tentatively, to find their footing again, this short three-day plan offers a gentle path homeward. Through the psalmist''s near-stumble in Psalm 73, the promise of a future still held by God in Jeremiah, and the overflowing hope of Romans, it welcomes you back without demanding you pretend the doubt never happened.',
    'Bagi mereka yang telah melewati keraguan dan kini siap, sekalipun dengan ragu-ragu, untuk menemukan pijakan mereka kembali, rencana singkat tiga hari ini menawarkan jalan pulang yang lembut. Melalui hampir tergelincirnya pemazmur dalam Mazmur 73, janji tentang masa depan yang masih dipegang Allah dalam Yeremia, dan pengharapan yang melimpah dalam surat Roma, rencana ini menyambutmu kembali tanpa menuntutmu berpura-pura keraguan itu tidak pernah terjadi.',
    '/images/devotions/finding-my-way-back.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Near-Stumble', 'Hampir Tergelincir',
    'The psalmist behind Psalm 73 opens with a confident statement — ''Surely God is good to Israel, to those who are pure in heart'' — and then immediately admits that he almost didn''t believe it. ''But as for me, my feet had almost slipped; I had nearly lost my foothold.'' What shook him wasn''t a single crisis but an accumulated frustration: watching the arrogant and the wicked prosper while he, trying to live faithfully, seemed to gain nothing but trouble. It nearly toppled his whole understanding of God.

There is something quietly reassuring in a psalm that begins by admitting the writer''s faith nearly failed. This isn''t a testimony that skips past the hard middle to get quickly to the happy ending. It sits, for many verses, in genuine near-collapse, describing exactly how close he came to giving up on trusting God altogether. If you are returning to faith after your own season of doubt, you don''t have to pretend your feet never slipped. This psalm gives you permission to say plainly: I almost lost my footing too.

What turns the psalmist around isn''t a sudden argument that wins the debate in his head. It''s an encounter: ''till I entered the sanctuary of God; then I understood their final destiny.'' Something about stepping back into the presence of God — worship, community, the practices of faith — reoriented his perspective in a way that private reasoning alone hadn''t been able to do. Sometimes finding your way back isn''t about resolving every intellectual doubt first. It''s about re-entering the sanctuary, and letting perspective shift there.

If you are at the beginning of this short journey back, know that a near-slip doesn''t disqualify you from where this psalm eventually lands: ''Whom have I in heaven but you? And earth has nothing I desire besides you... God is the strength of my heart and my portion forever.'' That destination is still ahead of you too, even after a season of nearly losing your footing. The way back often begins simply by showing up again.', 'Pemazmur di balik Mazmur 73 memulai dengan pernyataan yang penuh keyakinan — ''Sesungguhnya Allah itu baik bagi Israel, bagi orang-orang yang bersih hatinya'' — dan kemudian segera mengakui bahwa ia hampir saja tidak memercayainya. ''Tetapi aku, sedikit lagi maka kakiku terpeleset, hampir aku tergelincir.'' Yang mengguncangnya bukanlah satu krisis tunggal melainkan frustrasi yang terkumpul: menyaksikan orang-orang congkak dan fasik makmur sementara ia, yang berusaha hidup dengan setia, seolah-olah tidak mendapat apa-apa selain kesulitan. Ini hampir merobohkan seluruh pemahamannya tentang Allah.

Ada sesuatu yang diam-diam menenangkan dalam sebuah mazmur yang dibuka dengan mengakui bahwa iman penulisnya hampir gagal. Ini bukan kesaksian yang melompati bagian tengah yang sulit untuk cepat sampai pada akhir yang bahagia. Ia berdiam, selama banyak ayat, dalam keruntuhan yang hampir nyata, menggambarkan persis seberapa dekat ia berada dengan menyerah sepenuhnya untuk memercayai Allah. Jika kamu sedang kembali kepada iman setelah musim keraguanmu sendiri, kamu tidak perlu berpura-pura kakimu tidak pernah terpeleset. Mazmur ini memberimu izin untuk berkata terus terang: aku juga hampir kehilangan pijakan.

Yang membalikkan sang pemazmur bukanlah argumen tiba-tiba yang memenangkan perdebatan dalam kepalanya. Itu adalah sebuah perjumpaan: ''sampai aku masuk ke tempat kudus Allah, dan memperhatikan kesudahan mereka.'' Sesuatu tentang melangkah kembali ke hadirat Allah — ibadah, komunitas, praktik-praktik iman — mengarahkan ulang perspektifnya dengan cara yang tidak dapat dicapai oleh penalaran pribadi saja. Terkadang menemukan jalan kembali bukanlah tentang menyelesaikan setiap keraguan intelektual terlebih dahulu. Itu tentang memasuki kembali tempat kudus, dan membiarkan perspektif berubah di sana.

Jika kamu berada di awal perjalanan pulang yang singkat ini, ketahuilah bahwa hampir tergelincir tidak mendiskualifikasi dirimu dari tempat mazmur ini akhirnya berlabuh: ''Siapa gerangan ada padaku di sorga selain Engkau? Selain Engkau tidak ada yang kuingini di bumi... Allah adalah kekuatan hatiku dan bagianku untuk selama-lamanya.'' Tujuan itu masih ada di depanmu juga, bahkan setelah musim hampir kehilangan pijakan. Jalan kembali sering dimulai sesederhana dengan hadir kembali.',
    'Admitting your feet nearly slipped is not a disqualification from faith — it''s exactly where this psalm, and often our own story, begins to turn.', 'Mengakui bahwa kakimu hampir terpeleset bukanlah diskualifikasi dari iman — justru di situlah mazmur ini, dan sering kali kisah kita sendiri, mulai berbalik.',
    'God, I nearly lost my footing, and I''m not going to pretend otherwise. Thank You for making room for that honesty in Your Word. As I take these first steps back toward You, meet me the way You met the psalmist — and reorient my heart in Your presence. Amen.', 'Allah, aku hampir kehilangan pijakanku, dan aku tidak akan berpura-pura sebaliknya. Terima kasih karena Engkau memberi tempat bagi kejujuran itu dalam Firman-Mu. Saat aku mengambil langkah-langkah pertama kembali kepada-Mu, jumpailah aku seperti Engkau menjumpai pemazmur — dan arahkan ulang hatiku dalam hadirat-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 73:2-3', 'WEB', 'But as for me, my feet had almost slipped; I had nearly lost my foothold. For I envied the arrogant when I saw the prosperity of the wicked.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 73:2-3', 'TB', 'Tetapi aku, sedikit lagi maka kakiku terpeleset, hampir aku tergelincir. Sebab aku cemburu kepada pembual-pembual, kalau aku melihat kemujuran orang-orang fasik.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'A Future Still Held', 'Masa Depan yang Masih Dipegang',
    'This well-known promise from Jeremiah was written into a genuinely hard situation — not a greeting card, but a letter to people living in exile, far from home, wondering if God had abandoned His plans for them entirely. Into that uncertainty, God speaks plainly: ''For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.'' It is a promise given precisely to people who had reason to doubt it.

Coming back to faith after a season of doubt can feel like standing in your own kind of exile — distant from where you once were, unsure whether the ground you''re standing on will hold. This verse doesn''t ask you to deny that distance or rush past it. It simply insists that even from exile, even amid real uncertainty, God''s plans for you have not evaporated. He is still holding a future for you, even during the very seasons when you couldn''t feel it or see it.

It''s worth noticing what this promise doesn''t say. It doesn''t say the road home will be immediate or easy — in fact, the exile Jeremiah wrote to would last decades before the return God promised. Finding your way back to trust is rarely instantaneous either; it can take real time to feel steady again. But the promise stands regardless of pace: the plans were never contingent on how quickly you found your way back, or how certain your faith feels on any given day.

As you continue this short journey homeward, let this verse anchor you: whatever your doubt cost you, however long the distance felt, God''s plans for your hope and your future were never actually withdrawn. They were waiting for you, the way they waited for a whole exiled people, for exactly as long as it took you to come looking for them again.', 'Janji yang terkenal dari Yeremia ini ditulis ke dalam situasi yang sungguh sulit — bukan kartu ucapan, melainkan surat kepada orang-orang yang hidup dalam pembuangan, jauh dari rumah, bertanya-tanya apakah Allah telah sepenuhnya meninggalkan rencana-Nya bagi mereka. Ke dalam ketidakpastian itu, Allah berbicara dengan jelas: ''Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.'' Ini adalah janji yang diberikan tepat kepada orang-orang yang punya alasan untuk meragukannya.

Kembali kepada iman setelah musim keraguan bisa terasa seperti berdiri dalam pembuangan versimu sendiri — jauh dari tempat kamu dahulu berada, tidak yakin apakah tanah yang kau injak akan menopangmu. Ayat ini tidak memintamu menyangkal jarak itu atau buru-buru melewatinya. Ia hanya menegaskan bahwa bahkan dari pembuangan, bahkan di tengah ketidakpastian nyata, rencana Allah bagimu belum menguap. Ia masih memegang masa depan bagimu, bahkan selama musim-musim ketika kamu tidak dapat merasakan atau melihatnya.

Perlu diperhatikan apa yang tidak dikatakan janji ini. Ia tidak mengatakan jalan pulang akan segera atau mudah — bahkan, pembuangan yang menjadi tujuan surat Yeremia ini akan berlangsung puluhan tahun sebelum pemulangan yang Allah janjikan. Menemukan jalan kembali kepada kepercayaan juga jarang terjadi seketika; bisa memakan waktu yang sungguh nyata untuk kembali merasa mantap. Tetapi janji itu tetap berlaku terlepas dari kecepatannya: rencana itu tidak pernah bergantung pada seberapa cepat kamu menemukan jalan kembali, atau seberapa yakin imanmu terasa pada hari tertentu.

Saat kamu melanjutkan perjalanan pulang yang singkat ini, biarlah ayat ini menjadi jangkarmu: apa pun yang telah direnggut oleh keraguanmu, betapapun jauh jarak itu terasa, rencana Allah bagi pengharapan dan masa depanmu tidak pernah benar-benar ditarik kembali. Rencana itu menantimu, sebagaimana ia menanti seluruh bangsa yang dibuang itu, selama apa pun yang dibutuhkan sampai kamu kembali mencarinya.',
    'God''s plans for your hope and future were never withdrawn during your season of doubt — they were simply waiting for you to come looking again.', 'Rencana Allah bagi pengharapan dan masa depanmu tidak pernah ditarik selama musim keraguanmu — rencana itu hanya menantimu untuk kembali mencarinya.',
    'Lord, thank You that my season of doubt did not cancel Your plans for me. I don''t need the whole road home mapped out today — I just need to trust that You are still holding a future for me. Walk with me as I find my way back, one step at a time. Amen.', 'Tuhan, terima kasih karena musim keraguanku tidak membatalkan rencana-Mu bagiku. Aku tidak perlu memetakan seluruh jalan pulang hari ini — aku hanya perlu percaya bahwa Engkau masih memegang masa depan bagiku. Berjalanlah bersamaku saat aku menemukan jalan kembali, selangkah demi selangkah. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Jeremiah 29:11', 'WEB', 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yeremia 29:11', 'TB', 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Overflowing With Hope Again', 'Melimpah dengan Pengharapan Kembali',
    'Paul''s benediction to the Romans is short, but it is dense with everything a heart returning from doubt actually needs: ''May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.'' Notice that hope isn''t described here as something you have to manufacture out of sheer willpower. It''s something God fills you with — a gift given, not a mood forced.

There''s a beautiful order to this verse worth slowing down over. Joy and peace come first, described as flowing from trust — even a small, tentative, still-rebuilding trust. And it''s from that joy and peace, not before it, that overflowing hope eventually follows. You don''t have to arrive at your final destination of confident, overflowing hope before you''re allowed to start trusting again. The trust comes first, small as it may be, and the overflow follows in its own time, by the Spirit''s power rather than your own effort.

This is a fitting place to land after a journey through honest doubt and a gentle path back. You are not required to feel entirely certain, entirely joyful, or entirely at peace today in order for this promise to apply to you. You are only asked to keep trusting, even in the tentative, rebuilding way that faith after doubt so often looks like. The God of hope Himself does the filling; your part is simply to keep leaning toward Him.

As you close this short return journey, let this be your sending word: whatever brought you here — dryness, unanswered questions, a near-slip like the psalmist''s — you are not asked to arrive fully restored today. You are only asked to keep trusting, one day at a time, and to let the God of hope do what only He can do: fill you, in His timing, until hope overflows again.', 'Berkat Paulus kepada jemaat Roma ini singkat, tetapi padat dengan segala sesuatu yang sungguh dibutuhkan hati yang sedang kembali dari keraguan: ''Semoga Allah, sumber pengharapan, memenuhi kamu dengan segala sukacita dan damai sejahtera dalam iman kamu, supaya oleh kekuatan Roh Kudus kamu berlimpah-limpah dalam pengharapan.'' Perhatikan bahwa pengharapan di sini tidak digambarkan sebagai sesuatu yang harus kamu ciptakan sendiri dengan kemauan keras. Itu adalah sesuatu yang Allah penuhkan dalam dirimu — sebuah pemberian, bukan suasana hati yang dipaksakan.

Ada urutan yang indah dalam ayat ini yang layak direnungkan pelan-pelan. Sukacita dan damai sejahtera datang lebih dahulu, digambarkan mengalir dari kepercayaan — bahkan kepercayaan yang kecil, ragu-ragu, masih dalam proses dibangun kembali. Dan dari sukacita dan damai sejahtera itulah, bukan sebelumnya, pengharapan yang melimpah akhirnya mengikuti. Kamu tidak perlu sampai lebih dahulu di tujuan akhir berupa pengharapan yang penuh keyakinan dan melimpah sebelum diizinkan mulai percaya lagi. Kepercayaan itu datang lebih dulu, sekecil apa pun, dan luapannya mengikuti pada waktunya sendiri, oleh kuasa Roh Kudus, bukan oleh usahamu sendiri.

Ini adalah tempat yang tepat untuk berlabuh setelah perjalanan melewati keraguan yang jujur dan jalan pulang yang lembut. Kamu tidak dituntut untuk merasa sepenuhnya yakin, sepenuhnya bersukacita, atau sepenuhnya damai hari ini agar janji ini berlaku bagimu. Kamu hanya diminta untuk terus percaya, bahkan dengan cara yang ragu-ragu dan masih dibangun kembali, sebagaimana iman setelah keraguan sering kali terlihat. Allah sumber pengharapan sendirilah yang melakukan pemenuhan itu; bagianmu hanyalah terus condong kepada-Nya.

Saat kamu menutup perjalanan kembali yang singkat ini, biarlah ini menjadi kata pengutusanmu: apa pun yang membawamu ke sini — kekeringan, pertanyaan tak terjawab, hampir tergelincir seperti pemazmur — kamu tidak diminta untuk tiba dalam keadaan sepenuhnya pulih hari ini. Kamu hanya diminta untuk terus percaya, sehari demi sehari, dan membiarkan Allah sumber pengharapan melakukan apa yang hanya Dia bisa lakukan: memenuhimu, pada waktu-Nya, sampai pengharapan melimpah kembali.',
    'You don''t need to feel fully restored today — only keep trusting, and let God do the filling in His own time.', 'Kamu tidak perlu merasa sepenuhnya pulih hari ini — cukup teruslah percaya, dan biarkan Allah melakukan pemenuhan itu pada waktu-Nya sendiri.',
    'God of hope, I don''t arrive today with everything resolved, but I arrive still trusting You, even in a small way. Fill me with joy and peace as I do, and let hope overflow in Your timing, by Your Spirit''s power, not my own effort. Thank You for walking me home. Amen.', 'Allah sumber pengharapan, aku datang hari ini bukan dengan segalanya sudah terselesaikan, tetapi aku datang dengan tetap percaya kepada-Mu, sekalipun dengan cara yang kecil. Penuhilah aku dengan sukacita dan damai sejahtera seiring aku melakukannya, dan biarkan pengharapan melimpah pada waktu-Mu, oleh kuasa Roh-Mu, bukan oleh usahaku sendiri. Terima kasih telah menuntunku pulang. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 15:13', 'WEB', 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 15:13', 'TB', 'Semoga Allah, sumber pengharapan, memenuhi kamu dengan segala sukacita dan damai sejahtera dalam iman kamu, supaya oleh kekuatan Roh Kudus kamu berlimpah-limpah dalam pengharapan.');

END $$;
