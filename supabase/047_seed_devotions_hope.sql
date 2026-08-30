
-- 047_seed_devotions_hope.sql
-- Seeds the "Hope" devotion category tree and plans
-- from Gallery/Devotional/hope_devotions.csv.

DO $$
DECLARE
  v_category_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Top-level category ------------------------------------------------------
  SELECT id INTO v_category_id FROM public.devotion_categories
    WHERE name = 'Hope' AND parent_id IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_category_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Hope', 'Pengharapan', NULL)
      RETURNING id INTO v_category_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengharapan'
      WHERE id = v_category_id;
  END IF;

  DELETE FROM public.devotion_plans WHERE title = 'While the Answer Is On Its Way';
  DELETE FROM public.devotion_plans WHERE title = 'No Clear Timeline, Still Held';
  DELETE FROM public.devotion_plans WHERE title = 'Still Believing for the Breakthrough';
  DELETE FROM public.devotion_plans WHERE title = 'Hope on Empty';
  DELETE FROM public.devotion_plans WHERE title = 'When the Road Seems Closed';
  DELETE FROM public.devotion_plans WHERE title = 'Joy in the Meantime';
  DELETE FROM public.devotion_plans WHERE title = 'Not Yet, But Not Forgotten';
  DELETE FROM public.devotion_plans WHERE title = 'Held Before You Get There';
  DELETE FROM public.devotion_plans WHERE title = 'A Hope Beyond the Horizon';
  DELETE FROM public.devotion_plans WHERE title = 'After the Fall';
  DELETE FROM public.devotion_plans WHERE title = 'Waters in the Wilderness';
  DELETE FROM public.devotion_plans WHERE title = 'One More Step';


  -- Sub-category: Hope in Waiting --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Hope in Waiting' AND parent_id = v_category_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Hope in Waiting', 'Pengharapan dalam Penantian', v_category_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengharapan dalam Penantian'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: While the Answer Is On Its Way
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'While the Answer Is On Its Way',
    'Selagi Jawaban Sedang Dalam Perjalanan',
    'Five days for anyone still waiting on a specific prayer',
    'Lima hari bagi siapa saja yang masih menantikan satu doa dijawab',
    5,
    'For the prayer you keep bringing back to God — the one you have prayed so many times you''ve lost count — this five-day plan sits with the ache of unanswered prayer and the quiet confidence that God is not silent, only working on a timeline of His own. Drawing on Hannah''s years of prayer, the persistence of the widow in Luke, and the steady patience of Scripture''s waiting saints, it offers company for the in-between.',
    'Untuk doa yang terus kamu bawa kembali kepada Tuhan — doa yang sudah kamu naikkan begitu sering hingga kamu kehilangan hitungan — rencana lima hari ini menemani kegelisahan doa yang belum terjawab, sekaligus keyakinan tenang bahwa Tuhan tidak diam, Ia hanya sedang bekerja menurut waktu-Nya sendiri. Berpijak pada tahun-tahun doa Hana, kegigihan janda dalam Injil Lukas, dan kesabaran teguh orang-orang percaya yang menanti dalam Alkitab, rencana ini menjadi teman selama masa penantian.',
    '/images/devotions/while-the-answer-is-on-its-way.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Prayer You Keep Bringing Back', 'Doa yang Terus Kamu Bawa Kembali',
    'There is a particular kind of tiredness that comes from praying the same prayer over and over. Not the tiredness of giving up, exactly, but the tiredness of hoping out loud again when the circumstances haven''t changed since the last time you asked. Many of us know this feeling well — the job that hasn''t opened up, the relationship that hasn''t healed, the diagnosis that hasn''t shifted, the child who hasn''t come home. We bring the same request to God so many times that we start to wonder if He''s tired of hearing it, or worse, if He''s simply not going to answer.

Scripture never pretends this kind of waiting is easy. It doesn''t rush past it or skip to the resolution. Instead, it gives us psalm after psalm of people crying out, waiting, crying out again. ''Wait for the LORD; be strong and take heart and wait for the LORD,'' the psalmist writes — and notice that he says it twice in one breath, as if he knows how easily we forget between the beginning of a sentence and the end of it. This isn''t a psalm written by someone who found waiting effortless. It''s written by someone who needed the reminder doubled.

What''s worth noticing is that the verse doesn''t say ''wait for the answer.'' It says ''wait for the LORD.'' That''s a small shift with a large difference. Waiting for an answer keeps our eyes locked on the outcome, checking constantly for movement, measuring each day by whether anything has changed. Waiting for the Lord keeps our eyes on a Person — one who is present in the waiting itself, not just at the end of it. The answer may still be delayed. The Lord is not.

So today, if you''re carrying a prayer you''ve prayed more times than you can count, you''re not doing anything wrong by praying it again. You''re in good company — with the psalmists, with Hannah, with every believer who has ever stood in the gap between asking and receiving. Bring it back to Him once more. He has not stopped listening.', 'Ada semacam kelelahan khusus yang muncul karena menaikkan doa yang sama berulang-ulang. Bukan kelelahan karena menyerah, melainkan kelelahan karena harus berharap dengan suara nyaring lagi, padahal keadaan belum berubah sejak terakhir kali kita memintanya. Banyak dari kita mengenal perasaan ini dengan baik — pekerjaan yang belum juga terbuka, hubungan yang belum pulih, diagnosis yang belum berubah, anak yang belum kembali pulang. Kita membawa permohonan yang sama kepada Tuhan begitu sering, hingga kita mulai bertanya-tanya apakah Ia sudah bosan mendengarnya, atau lebih buruk lagi, apakah Ia memang tidak akan menjawabnya.

Alkitab tidak pernah berpura-pura bahwa penantian semacam ini itu mudah. Ia tidak terburu-buru melewatinya atau langsung melompat ke penyelesaiannya. Sebaliknya, ia memberi kita mazmur demi mazmur tentang orang-orang yang berseru, menanti, lalu berseru lagi. ''Nantikanlah TUHAN! Kuatkan dan teguhkanlah hatimu! Ya, nantikanlah TUHAN!'' tulis sang pemazmur — dan perhatikan bahwa ia mengucapkannya dua kali dalam satu tarikan napas, seakan ia tahu betapa mudahnya kita lupa di antara awal kalimat dan akhirnya. Mazmur ini bukan ditulis oleh seseorang yang merasa menanti itu ringan. Ia ditulis oleh seseorang yang membutuhkan pengingat itu diulang.

Yang patut diperhatikan, ayat ini tidak berkata ''nantikanlah jawabannya.'' Ia berkata ''nantikanlah TUHAN.'' Itu pergeseran kecil dengan perbedaan yang besar. Menantikan jawaban membuat mata kita terus terpaku pada hasil, terus-menerus memeriksa apakah ada pergerakan, mengukur setiap hari dari ada tidaknya perubahan. Menantikan TUHAN membuat mata kita tertuju kepada Pribadi — yang hadir dalam penantian itu sendiri, bukan hanya di ujungnya. Jawabannya mungkin masih tertunda. Tuhan tidak.

Jadi hari ini, jika kamu sedang membawa satu doa yang sudah kamu naikkan lebih sering dari yang bisa kamu hitung, kamu tidak melakukan kesalahan apa pun dengan menaikkannya lagi. Kamu berada dalam kebersamaan yang baik — bersama para pemazmur, bersama Hana, bersama setiap orang percaya yang pernah berdiri di antara meminta dan menerima. Bawalah doa itu kembali kepada-Nya sekali lagi. Ia belum berhenti mendengarkan.',
    'What would change today if you aimed your waiting at the Lord Himself, not just at the answer you''re hoping for?', 'Apa yang akan berubah hari ini jika penantianmu kamu arahkan kepada Tuhan sendiri, bukan hanya kepada jawaban yang kamu harapkan?',
    'Lord, You already know the prayer I keep bringing back to You. I bring it again today, not because I think You''ve forgotten, but because I need to remember that You haven''t. Strengthen my heart while I wait. Amen.', 'Tuhan, Engkau sudah tahu doa yang terus kubawa kembali kepada-Mu. Aku membawanya lagi hari ini, bukan karena aku pikir Engkau lupa, tetapi karena aku perlu diingatkan bahwa Engkau tidak lupa. Kuatkanlah hatiku selagi aku menanti. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 27:14', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 27:14', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Waiting Quietly, Not Passively', 'Menanti dengan Diam, Bukan Berpangku Tangan',
    'The book of Lamentations was written in the aftermath of devastating loss, from a place of genuine grief. It''s not the book we''d expect to find comfort in when we''re waiting on a prayer, and yet tucked into its third chapter is one of the gentlest verses in Scripture about hope: ''The LORD is good to those whose hope is in him, to the one who seeks him; it is good to wait quietly for the salvation of the LORD.'' Whoever wrote this had every reason to despair, and still landed on the word ''good.''

Notice the phrase ''wait quietly.'' In a season of unanswered prayer, quiet waiting can feel like the hardest kind. It''s tempting to fill the silence — with striving, with anxious plans B and C, with constantly rehearsing our case to God as if He needs more convincing. But quiet waiting isn''t passive resignation. It''s a settled trust that lets God be God, that stops trying to manufacture the outcome and instead rests in the character of the One we''re waiting on. It''s active in the way stillness before a wise parent is active — full of attention, not indifference.

Many of us find that the loudest, most anxious seasons of prayer are often the ones where we''ve quietly started to believe the answer depends on our effort — on saying the right words, praying with enough intensity, doing enough to earn what we''re asking for. Lamentations pushes back on that. The goodness described here isn''t earned through frantic effort; it''s simply available to ''the one who seeks him.'' Seeking isn''t striving. It''s turning toward.

If today feels loud inside — if your mind keeps racing toward what you could do to speed things along — try, just for a few minutes, the quieter posture this verse describes. Not passivity, but peaceful trust. Let your prayer today be less about persuading God and more about resting in who He already is.', 'Kitab Ratapan ditulis setelah kehancuran yang dahsyat, dari tempat dukacita yang sungguh nyata. Ini bukan kitab yang kita duga akan memberi penghiburan ketika kita sedang menantikan jawaban doa, namun di pasal ketiganya tersimpan salah satu ayat paling lembut dalam Alkitab tentang pengharapan: ''TUHAN itu baik bagi orang yang berharap kepada-Nya, bagi jiwa yang mencari Dia. Adalah baik menanti dengan diam pertolongan TUHAN.'' Siapa pun yang menulis ini memiliki segala alasan untuk berputus asa, namun tetap sampai pada kata ''baik.''

Perhatikan frasa ''menanti dengan diam.'' Dalam musim doa yang belum terjawab, menanti dengan diam bisa terasa sebagai jenis penantian yang paling berat. Kita tergoda untuk mengisi keheningan itu — dengan usaha keras, dengan rencana cadangan yang cemas, dengan terus-menerus mengulangi alasan kita kepada Tuhan seolah Ia butuh lebih banyak bukti. Tetapi menanti dengan diam bukanlah kepasrahan yang pasif. Itu adalah kepercayaan yang mantap, yang membiarkan Tuhan menjadi Tuhan, yang berhenti berusaha mengatur hasilnya dan sebaliknya beristirahat dalam karakter Pribadi yang kita nantikan. Ia aktif seperti keheningan di hadapan orang tua yang bijaksana itu aktif — penuh perhatian, bukan ketidakpedulian.

Banyak dari kita mendapati bahwa musim doa yang paling ribut dan cemas seringkali adalah musim di mana kita diam-diam mulai percaya bahwa jawabannya bergantung pada usaha kita — pada mengucapkan kata-kata yang tepat, berdoa dengan cukup sungguh-sungguh, melakukan cukup banyak hal untuk pantas menerima apa yang kita minta. Kitab Ratapan menolak gagasan itu. Kebaikan yang digambarkan di sini tidak diperoleh lewat usaha yang gelisah; ia tersedia begitu saja bagi ''jiwa yang mencari Dia.'' Mencari bukan berarti berjuang keras. Itu berarti berpaling kepada-Nya.

Jika hari ini terasa ribut di dalam dirimu — jika pikiranmu terus berlari kepada apa yang bisa kamu lakukan untuk mempercepat semuanya — cobalah, hanya untuk beberapa menit, sikap yang lebih tenang seperti yang digambarkan ayat ini. Bukan kepasifan, melainkan kepercayaan yang damai. Biarlah doamu hari ini bukan tentang meyakinkan Tuhan, melainkan tentang beristirahat dalam siapa Dia sesungguhnya.',
    'Where in your waiting have you slipped from trusting God into trying to earn His answer?', 'Di bagian mana dalam penantianmu kamu telah bergeser dari mempercayai Tuhan menjadi berusaha memperoleh jawaban-Nya dengan usahamu sendiri?',
    'Lord, quiet the striving in me. Teach me what it looks like to wait without trying to force what only You can bring. I trust that You are good, even in this silence. Amen.', 'Tuhan, tenangkanlah kegelisahan dalam diriku. Ajari aku bagaimana menanti tanpa berusaha memaksakan apa yang hanya Engkau yang bisa berikan. Aku percaya Engkau baik, bahkan dalam keheningan ini. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lamentations 3:25-26', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Ratapan 3:25-26', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Hannah''s Years', 'Tahun-Tahun Hana',
    'Before there was an answer, there was Hannah — praying in the temple, year after year, weeping so hard that a priest mistook her for drunk. Her story doesn''t begin with a miracle. It begins with prolonged, painful longing, prayed out in a season that had no promised end date. She wasn''t given a timeline. She was only given the ache of wanting something God hadn''t yet provided, and the discipline of bringing that ache back to Him instead of somewhere else.

What''s striking about Hannah''s prayer life is its honesty. She doesn''t perform composure in front of God. She pours out her soul — the text actually uses that phrase — bitter, weeping, specific in her request. There''s a lesson here for anyone who has learned to pray politely instead of honestly. God is not asking for our tidiest words. He can hold our bitterness, our specificity, our years of asking the same thing. Hannah shows us that raw honesty in prayer isn''t a lack of faith; it can be one of the clearest expressions of it.

When the answer finally came — when Hannah held her son Samuel — her response wasn''t relief mixed with quiet resentment for the wait. It was worship. ''I prayed for this child, and the LORD has granted me what I asked of him,'' she said, and then she gave the boy back to the Lord''s service. Her years of waiting hadn''t hardened her; somehow they had deepened her trust to the point that when the answer came, she could hold it open-handed.

We don''t know how long your waiting will last. Hannah didn''t know either. But her story tells us something true: the years of asking are not wasted years. They are not evidence that God has forgotten. They are, often, the very years in which our hearts are being shaped to receive the answer well when it finally comes.', 'Sebelum ada jawaban, ada Hana — berdoa di bait Allah, tahun demi tahun, menangis begitu keras hingga seorang imam mengiranya mabuk. Kisahnya tidak dimulai dengan mukjizat. Ia dimulai dengan kerinduan yang panjang dan menyakitkan, dinaikkan dalam musim yang tidak memiliki batas waktu yang dijanjikan. Ia tidak diberi kepastian waktu. Ia hanya diberi kepedihan menginginkan sesuatu yang belum Tuhan sediakan, dan disiplin untuk terus membawa kepedihan itu kembali kepada-Nya, bukan ke tempat lain.

Yang mengesankan dari kehidupan doa Hana adalah kejujurannya. Ia tidak berpura-pura tenang di hadapan Tuhan. Ia mencurahkan isi hatinya — teks Alkitab sendiri memakai ungkapan itu — pahit, menangis, spesifik dalam permohonannya. Ada pelajaran di sini bagi siapa pun yang terbiasa berdoa dengan sopan alih-alih dengan jujur. Tuhan tidak meminta kata-kata kita yang paling rapi. Ia sanggup menampung kepahitan kita, kekhususan permintaan kita, tahun-tahun kita meminta hal yang sama. Hana menunjukkan bahwa kejujuran mentah dalam doa bukanlah kurangnya iman; itu bisa menjadi salah satu ungkapan iman yang paling jelas.

Ketika jawaban akhirnya datang — ketika Hana menggendong anaknya, Samuel — responsnya bukanlah kelegaan yang bercampur kepahitan diam-diam atas penantian itu. Itu adalah penyembahan. ''Untuk mendapatkan anak inilah aku berdoa, dan TUHAN telah memberikan kepadaku apa yang kuminta dari pada-Nya,'' katanya, lalu ia menyerahkan anak itu kembali untuk melayani Tuhan. Tahun-tahun penantiannya tidak mengeraskan hatinya; entah bagaimana, tahun-tahun itu justru memperdalam kepercayaannya, sehingga ketika jawaban itu datang, ia dapat menerimanya dengan tangan terbuka.

Kita tidak tahu berapa lama penantianmu akan berlangsung. Hana pun tidak tahu. Tetapi kisahnya memberi tahu kita sesuatu yang benar: tahun-tahun meminta itu bukanlah tahun-tahun yang sia-sia. Itu bukan bukti bahwa Tuhan telah melupakan. Itu seringkali justru tahun-tahun di mana hati kita sedang dibentuk untuk menerima jawaban itu dengan baik ketika akhirnya datang.',
    'What would it look like for you to pray with Hannah''s honesty today, instead of your usual polished words?', 'Seperti apa jadinya jika hari ini kamu berdoa dengan kejujuran seperti Hana, bukan dengan kata-kata rapimu yang biasa?',
    'Lord, like Hannah, I pour out my heart to You today — not polished, but honest. Shape me in this waiting so that whenever the answer comes, I can receive it with open hands. Amen.', 'Tuhan, seperti Hana, aku mencurahkan hatiku kepada-Mu hari ini — tidak rapi, tetapi jujur. Bentuklah aku dalam masa penantian ini, sehingga kapan pun jawaban itu datang, aku dapat menerimanya dengan tangan terbuka. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '1 Samuel 1:27', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '1 Samuel 1:27', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'The Persistence That Doesn''t Give Up', 'Kegigihan yang Tidak Menyerah',
    'Jesus told a story about a widow who kept coming back to an unjust judge, asking again and again for justice, until he finally gave in — not because he cared, but because her persistence wore him down. Jesus tells this parable, Luke tells us plainly, ''to show them that they should always pray and not give up.'' It''s a strange comfort at first: if even an uncaring judge responds to persistence, how much more will a loving Father respond to His children who keep asking?

This parable isn''t suggesting that God is reluctant and needs to be worn down like the judge was. It''s making the opposite point by contrast — if persistence works even on someone who doesn''t care, imagine what it means to bring that same persistence to Someone who does. The widow''s continual coming isn''t nagging; it''s faith in action. She believed justice was possible, and she kept showing up as if she believed it.

Many of us stop praying a specific prayer not because we''ve made peace with the outcome, but because we''ve quietly given up hope that it will change anything. We start saying ''I''ve already prayed about that'' as a way of politely retiring the request rather than continuing to bring it. James adds a companion image here, of the farmer patiently waiting for rain — not passive, but not frantic either, simply continuing faithfully season after season because he knows the harvest is real, even if it isn''t visible yet.

Today, consider bringing your prayer back one more time — not because you doubt God heard you the first hundred times, but because persistent prayer is itself an act of faith. It says: I still believe this matters to You. I haven''t retired this request to the shelf. I''m still standing here, like the widow, like the farmer, like Hannah, believing that showing up again is not wasted.', 'Yesus menceritakan sebuah perumpamaan tentang seorang janda yang terus-menerus datang kepada seorang hakim yang tidak adil, meminta keadilan berulang-ulang, sampai akhirnya hakim itu menyerah — bukan karena ia peduli, tetapi karena kegigihan janda itu membuatnya lelah. Yesus menceritakan perumpamaan ini, kata Lukas dengan jelas, ''untuk menegaskan bahwa mereka harus selalu berdoa dengan tidak jemu-jemu.'' Ini penghiburan yang aneh pada awalnya: jika bahkan seorang hakim yang tidak peduli pun menanggapi kegigihan, betapa lebih lagi Bapa yang penuh kasih akan menanggapi anak-anak-Nya yang terus meminta?

Perumpamaan ini bukan menyiratkan bahwa Tuhan enggan dan perlu dilelahkan seperti hakim itu. Ia justru membuat pernyataan sebaliknya lewat perbandingan — jika kegigihan berhasil bahkan pada seseorang yang tidak peduli, bayangkan apa artinya membawa kegigihan yang sama kepada Pribadi yang benar-benar peduli. Kedatangan janda itu yang terus-menerus bukanlah cerewet; itu adalah iman dalam tindakan. Ia percaya keadilan itu mungkin terjadi, dan ia terus datang seolah-olah ia mempercayainya.

Banyak dari kita berhenti menaikkan satu doa tertentu bukan karena kita sudah berdamai dengan hasilnya, tetapi karena diam-diam kita sudah berhenti berharap bahwa itu akan mengubah apa pun. Kita mulai berkata ''aku sudah pernah mendoakan itu'' sebagai cara untuk sopan-sopan mengistirahatkan permintaan itu daripada terus membawanya. Yakobus menambahkan gambaran pendamping di sini, tentang petani yang sabar menantikan hujan — bukan pasif, tetapi juga tidak gelisah, hanya terus setia musim demi musim karena ia tahu panennya nyata, meskipun belum terlihat.

Hari ini, pertimbangkanlah untuk membawa doamu kembali sekali lagi — bukan karena kamu meragukan Tuhan sudah mendengarnya seratus kali sebelumnya, melainkan karena doa yang gigih itu sendiri adalah tindakan iman. Itu berkata: aku masih percaya ini penting bagi-Mu. Aku belum mengistirahatkan permintaan ini di rak. Aku masih berdiri di sini, seperti janda itu, seperti petani itu, seperti Hana, percaya bahwa datang lagi bukanlah hal yang sia-sia.',
    'Is there a prayer you''ve quietly retired that God might be inviting you to bring back?', 'Adakah satu doa yang diam-diam sudah kamu istirahatkan, yang mungkin sedang Tuhan undang untuk kamu bawa kembali?',
    'Father, like the farmer and the widow, I choose to keep showing up. I bring my prayer back to You again today, believing it still matters. Give me patient, persistent faith. Amen.', 'Bapa, seperti petani dan janda itu, aku memilih untuk terus datang. Aku membawa doaku kembali kepada-Mu hari ini, percaya bahwa itu masih penting. Berilah aku iman yang sabar dan gigih. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'James 5:7-8', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yakobus 5:7-8', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Peace Before the Answer Arrives', 'Damai Sejahtera Sebelum Jawaban Tiba',
    'There''s a temptation, when we''re waiting on a specific prayer, to believe peace can only come after the answer does. We tell ourselves: I''ll feel okay once this resolves. I''ll rest once I know. But Paul, writing from a prison cell with plenty of unanswered questions of his own, offers a different order entirely. He doesn''t say bring your requests to God and then peace will come once He answers. He says the peace comes in the presenting — ''the peace of God, which transcends all understanding, will guard your hearts and your minds'' simply through prayer and thanksgiving, before the outcome is settled.

This is a peace that doesn''t make sense by ordinary logic, which is exactly what Paul says — it ''transcends all understanding.'' It isn''t peace because the circumstances have resolved. It''s peace despite the circumstances remaining exactly as unresolved as they were yesterday. That kind of peace can only come from outside our situation, which is precisely where Paul says it comes from: not from us figuring things out, but from God guarding our hearts directly.

Notice, too, the instruction to bring thanksgiving into a prayer for something we don''t yet have. That can feel almost contradictory — how do we give thanks for an answer that hasn''t come? But thanksgiving in the waiting isn''t thanksgiving for the outcome; it''s thanksgiving for who God already is and what He has already done. It shifts our posture from a transaction (''I''ll trust You once You deliver'') to a relationship (''I trust You already, because of who You''ve always been'').

As this five-day plan closes, the prayer you started with may still be unanswered. That''s alright. The goal was never to manufacture an answer by the end of five days — it was to change how you carry the waiting. Let this be the posture you take forward: bringing the request, adding thanksgiving, and receiving the guard of a peace that doesn''t wait for the outcome to arrive first.', 'Ada godaan, ketika kita menantikan jawaban atas doa tertentu, untuk percaya bahwa damai sejahtera hanya bisa datang setelah jawaban itu tiba. Kita berkata pada diri sendiri: aku akan merasa baik-baik saja begitu ini terselesaikan. Aku akan beristirahat begitu aku tahu hasilnya. Tetapi Paulus, menulis dari dalam penjara dengan banyak pertanyaannya sendiri yang belum terjawab, menawarkan urutan yang sama sekali berbeda. Ia tidak berkata bawalah permintaanmu kepada Tuhan lalu damai sejahtera akan datang setelah Ia menjawab. Ia berkata damai itu datang justru saat kita menyatakannya — ''damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu'' hanya lewat doa dan ucapan syukur, sebelum hasilnya ditetapkan.

Ini adalah damai sejahtera yang tidak masuk akal secara logika biasa, dan itu memang persis apa yang dikatakan Paulus — damai itu ''melampaui segala akal.'' Ia bukan damai karena keadaan sudah terselesaikan. Ia damai meski keadaan tetap sama tidak jelasnya seperti kemarin. Damai seperti itu hanya bisa datang dari luar situasi kita, yang justru merupakan asalnya menurut Paulus: bukan dari kita yang berhasil memecahkan masalah, melainkan dari Tuhan yang secara langsung menjaga hati kita.

Perhatikan juga perintah untuk membawa ucapan syukur ke dalam doa untuk sesuatu yang belum kita miliki. Itu bisa terasa hampir kontradiktif — bagaimana kita bersyukur atas jawaban yang belum datang? Tetapi ucapan syukur dalam penantian bukanlah ucapan syukur atas hasilnya; itu adalah ucapan syukur atas siapa Tuhan sudah adanya dan apa yang telah Ia lakukan. Itu mengubah sikap kita dari transaksi (''aku akan percaya kepada-Mu setelah Engkau memberikannya'') menjadi relasi (''aku sudah percaya kepada-Mu, karena siapa Engkau selalu adanya'').

Saat rencana lima hari ini berakhir, doa yang kamu mulai mungkin masih belum terjawab. Tidak apa-apa. Tujuannya bukanlah untuk menghasilkan jawaban pada akhir lima hari — melainkan untuk mengubah bagaimana kamu menjalani penantian itu. Biarlah ini menjadi sikap yang kamu bawa ke depan: membawa permintaanmu, menambahkan ucapan syukur, dan menerima penjagaan damai sejahtera yang tidak menunggu hasilnya tiba lebih dulu.',
    'What would it look like to add thanksgiving to your prayer today, before the answer has arrived?', 'Seperti apa jadinya jika hari ini kamu menambahkan ucapan syukur ke dalam doamu, sebelum jawabannya tiba?',
    'Lord, I present my request to You again, with thanksgiving for who You are. Guard my heart and mind with Your peace, even while I wait. I trust You with the timing. Amen.', 'Tuhan, aku menyatakan permintaanku lagi kepada-Mu, dengan ucapan syukur atas siapa Engkau. Jagalah hati dan pikiranku dengan damai sejahtera-Mu, bahkan selagi aku menanti. Aku mempercayakan waktunya kepada-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Philippians 4:6-7', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Filipi 4:6-7', 'TB', 1);

  -- Plan: No Clear Timeline, Still Held
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'No Clear Timeline, Still Held',
    'Tanpa Kepastian Waktu, Tetap Dipegang',
    'Three days for the season with no end date in sight',
    'Tiga hari untuk musim yang belum terlihat ujungnya',
    3,
    'Some seasons of waiting come with a rough estimate — a due date, a court date, a semester''s end. Others come with nothing at all: no timeline, no clear next step, just an open horizon. This short three-day plan is for that second kind of waiting, drawing on Isaiah''s promise of renewed strength, Paul''s teaching on patient hope, and the long-delayed promise kept to Abraham and Sarah, to steady the heart when there is no date circled on the calendar.',
    'Sebagian musim penantian datang dengan perkiraan kasar — tanggal jatuh tempo, tanggal sidang, akhir semester. Sebagian lain datang tanpa apa pun: tanpa kepastian waktu, tanpa langkah berikutnya yang jelas, hanya cakrawala yang terbuka lebar. Rencana singkat tiga hari ini untuk jenis penantian yang kedua itu, berpijak pada janji Yesaya tentang kekuatan yang diperbarui, ajaran Paulus tentang pengharapan yang sabar, dan janji yang lama tertunda namun ditepati bagi Abraham dan Sara, untuk meneguhkan hati ketika tidak ada tanggal yang dilingkari di kalender.',
    '/images/devotions/no-clear-timeline-still-held.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Strength for a Road With No Marked End', 'Kekuatan untuk Jalan Tanpa Tanda Akhir',
    'Some of the hardest seasons to wait through are the ones without a shape. A pregnancy has nine months. A semester has a final exam. But a job search with no leads, a healing that isn''t on any doctor''s calendar, a relationship status that simply is what it is for now — these have no marked end. We can''t count down to anything, because there''s nothing on the calendar to count down to. That particular kind of uncertainty has its own exhausting weight, separate from the waiting itself.

Isaiah wrote to a people in exactly this position — waiting for restoration with no announced date, watching their own strength run out as the wait dragged on with no clear finish line. And into that uncertainty, he doesn''t offer a date. He offers a promise about strength: ''those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.'' Notice what''s missing — there''s no ''and then it will be over.'' There''s only a promise that we will be sustained for however long the road runs.

This is worth sitting with, because many of us have quietly been waiting to feel strong until we know how long we''ll need to hold on. We ration our hope like it''s a limited resource, afraid to spend it on a season that might last longer than we can bear. But Isaiah''s promise doesn''t work that way. It isn''t a fixed store of strength doled out based on a known distance. It''s renewed strength — meaning it replenishes as we need it, even when we can''t see how far the road goes.

So if you''re in a season with no clear timeline today, you don''t need to know the distance before you take the next step. The eagle doesn''t need to see the whole sky before it lifts off the ground. Ask God for renewed strength for today — not for the whole unmarked road, just for today — and trust Him for tomorrow''s portion when tomorrow comes.', 'Sebagian musim penantian yang paling berat adalah musim yang tidak memiliki bentuk. Kehamilan berlangsung sembilan bulan. Satu semester punya ujian akhir. Tetapi pencarian kerja tanpa peluang yang jelas, pemulihan yang tidak tercantum di jadwal dokter mana pun, status hubungan yang begitu saja apa adanya untuk saat ini — semua ini tidak memiliki akhir yang jelas. Kita tidak bisa menghitung mundur menuju apa pun, karena tidak ada apa pun di kalender untuk dihitung mundur. Ketidakpastian jenis itu memiliki bebannya sendiri yang melelahkan, terpisah dari penantian itu sendiri.

Yesaya menulis kepada umat yang berada tepat dalam posisi ini — menantikan pemulihan tanpa tanggal yang diumumkan, menyaksikan kekuatan mereka sendiri habis seiring penantian yang berlarut-larut tanpa garis akhir yang jelas. Dan ke dalam ketidakpastian itu, ia tidak menawarkan sebuah tanggal. Ia menawarkan janji tentang kekuatan: ''orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.'' Perhatikan apa yang tidak ada — tidak ada ''dan kemudian semuanya akan berakhir.'' Hanya ada janji bahwa kita akan dikuatkan selama apa pun jalan itu berlangsung.

Ini patut direnungkan, karena banyak dari kita diam-diam telah menunggu untuk merasa kuat sampai kita tahu berapa lama kita perlu bertahan. Kita menjatah pengharapan kita seolah itu sumber daya yang terbatas, takut menghabiskannya untuk musim yang mungkin berlangsung lebih lama dari yang bisa kita tanggung. Tetapi janji Yesaya tidak bekerja seperti itu. Ia bukanlah persediaan kekuatan tetap yang dibagikan berdasarkan jarak yang diketahui. Ia adalah kekuatan yang diperbarui — artinya ia dipulihkan sesuai kebutuhan kita, bahkan ketika kita tidak bisa melihat sejauh mana jalan itu terbentang.

Jadi jika hari ini kamu berada dalam musim tanpa kepastian waktu, kamu tidak perlu tahu jaraknya sebelum mengambil langkah berikutnya. Rajawali tidak perlu melihat seluruh langit sebelum ia terbang dari tanah. Mintalah kepada Tuhan kekuatan yang diperbarui untuk hari ini — bukan untuk seluruh jalan yang belum bertanda, hanya untuk hari ini — dan percayalah kepada-Nya untuk bagian esok ketika esok tiba.',
    'What would it look like to ask God for strength just for today, instead of for the whole unknown length of the road?', 'Seperti apa jadinya jika kamu meminta kekuatan kepada Tuhan hanya untuk hari ini, bukan untuk seluruh panjang jalan yang belum diketahui?',
    'Lord, I don''t know how long this road is. I only ask for today''s strength — renew it in me now, and I''ll trust You for tomorrow when tomorrow comes. Amen.', 'Tuhan, aku tidak tahu seberapa panjang jalan ini. Aku hanya meminta kekuatan untuk hari ini — perbaruilah itu dalam diriku sekarang, dan aku akan mempercayai-Mu untuk esok ketika esok tiba. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 40:31', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 40:31', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Hoping for What We Cannot See', 'Berharap akan Apa yang Tidak Kita Lihat',
    'Paul, writing to the church in Rome, describes hope with a curious definition: it''s hope precisely because we don''t yet have or see the thing we''re hoping for. ''But if we hope for what we do not yet have, we wait for it patiently.'' That word ''patiently'' in the original language carries the sense of remaining under something — bearing up under a weight, not just tolerating an inconvenience. It''s a hope built for load-bearing, not for quick resolution.

This matters especially in seasons without a clear timeline, because those seasons ask more of our patience than seasons with a known end. It''s one thing to endure a hard month when you know it''s exactly one month. It''s another to endure a season with no visible edges. Paul doesn''t promise the edges will appear. He describes a way of waiting that can hold up even when they don''t — hope stretched over the unknown, not hope that requires knowing.

Many of us find that not knowing is actually the harder part of waiting — harder, sometimes, than the waiting itself. We could handle almost anything if we just knew how long. But Paul''s letter was written to people who genuinely didn''t know how long their suffering and waiting would last, and he doesn''t try to give them a date. He gives them a posture: patient waiting rooted in a hope that isn''t dependent on visibility. We''re not waiting because we can see the outcome coming. We''re waiting because we trust the One who can.

Today, notice if you''ve been withholding your patience until you get more certainty. Try instead to let your hope be, as Paul describes it, for what you cannot yet see — trusting not the timeline, but the God who holds it.', 'Paulus, menulis kepada jemaat di Roma, menggambarkan pengharapan dengan definisi yang menarik: ia disebut pengharapan justru karena kita belum memiliki atau melihat hal yang kita harapkan itu. ''Tetapi jika kita mengharapkan apa yang tidak kita lihat, kita menantikannya dengan tekun.'' Kata ''tekun'' dalam bahasa aslinya membawa makna bertahan di bawah sesuatu — menanggung beban, bukan sekadar mentolerir ketidaknyamanan. Ini adalah pengharapan yang dibangun untuk menanggung beban, bukan untuk penyelesaian cepat.

Ini penting terutama dalam musim tanpa kepastian waktu yang jelas, karena musim-musim itu menuntut lebih banyak kesabaran kita daripada musim dengan akhir yang diketahui. Bertahan sebulan yang berat itu satu hal ketika kamu tahu itu pasti hanya sebulan. Lain lagi bertahan dalam musim yang tidak terlihat batasnya. Paulus tidak menjanjikan batas-batas itu akan muncul. Ia menggambarkan cara menanti yang bisa tetap bertahan bahkan ketika batas itu tidak muncul — pengharapan yang direntangkan atas hal yang tidak diketahui, bukan pengharapan yang membutuhkan kepastian.

Banyak dari kita mendapati bahwa ketidaktahuan itu sebenarnya bagian yang lebih sulit dari penantian — kadang lebih sulit dari penantian itu sendiri. Kita bisa menghadapi hampir apa saja jika kita tahu berapa lama. Tetapi surat Paulus ditulis kepada orang-orang yang benar-benar tidak tahu berapa lama penderitaan dan penantian mereka akan berlangsung, dan ia tidak berusaha memberi mereka sebuah tanggal. Ia memberi mereka sebuah sikap: penantian yang tekun, berakar pada pengharapan yang tidak bergantung pada keterlihatan. Kita tidak menanti karena kita bisa melihat hasilnya akan datang. Kita menanti karena kita mempercayai Pribadi yang bisa melihatnya.

Hari ini, perhatikan apakah kamu selama ini menahan kesabaranmu sampai kamu mendapat lebih banyak kepastian. Cobalah sebaliknya membiarkan pengharapanmu, seperti yang digambarkan Paulus, tertuju kepada apa yang belum kamu lihat — mempercayai bukan kepastian waktunya, melainkan Tuhan yang memegangnya.',
    'Have you been withholding patience or peace until you get more certainty about the timeline? What would it look like to release that today?', 'Selama ini apakah kamu menahan kesabaran atau damai sejahteramu sampai mendapat lebih banyak kepastian tentang waktunya? Seperti apa jadinya jika hari ini kamu melepaskannya?',
    'Lord, I don''t need to see the whole picture to trust You. Teach me to wait patiently for what I cannot yet see, resting in who You are rather than in what I know. Amen.', 'Tuhan, aku tidak perlu melihat seluruh gambarannya untuk mempercayai-Mu. Ajari aku untuk menanti dengan tekun akan apa yang belum bisa kulihat, beristirahat dalam siapa Engkau, bukan dalam apa yang aku ketahui. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 8:25', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 8:25', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'The Promise Kept in Its Own Time', 'Janji yang Ditepati Menurut Waktu-Nya Sendiri',
    'Abraham and Sarah waited twenty-five years between the promise of a son and his birth. Twenty-five years is not a season; it''s most of a lifetime. There was no due date given, no countdown, just a promise spoken once and then decades of ordinary days in which nothing visibly moved. Sarah grew old. Abraham grew older. By any human timeline, the promise should have expired long before it was kept.

And yet Genesis records the quiet, almost understated ending: ''Now the LORD was gracious to Sarah as he had said, and the LORD did for Sarah what he had promised... at the very time God had promised him.'' Notice that last phrase — ''the very time God had promised.'' Not a time Abraham and Sarah could have calculated. Not a time that matched any reasonable human expectation. A time that existed only in God''s own reckoning, invisible to them for twenty-five years, and exactly on schedule the whole time.

This is, perhaps, the deepest comfort available to anyone waiting without a clear timeline: the absence of a date on our calendar doesn''t mean there''s no date on God''s. Our not knowing doesn''t mean God is improvising. Abraham and Sarah''s decades of waiting weren''t a sign the promise had failed; they were simply decades in which the appointed time hadn''t yet arrived. It was coming the entire time, even on the days it looked, from the outside, like nothing was happening at all.

As this short plan closes, let this be what you carry: your waiting, however long and however unmarked, is not outside of God''s timing. It may feel like it''s outside of any timing at all. But the God who kept His word to Abraham and Sarah at the very time He had promised is the same God holding your unmarked road. He is not late. He is not improvising. He is working, even now, toward the time He has already set.', 'Abraham dan Sara menunggu dua puluh lima tahun antara janji seorang anak laki-laki dan kelahirannya. Dua puluh lima tahun bukanlah sebuah musim; itu hampir seumur hidup. Tidak ada tanggal jatuh tempo yang diberikan, tidak ada hitungan mundur, hanya sebuah janji yang diucapkan sekali lalu berpuluh-puluh tahun hari-hari biasa di mana tidak ada apa pun yang tampak bergerak. Sara semakin tua. Abraham semakin tua. Menurut garis waktu manusia mana pun, janji itu seharusnya sudah kedaluwarsa jauh sebelum ditepati.

Namun Kitab Kejadian mencatat akhir yang tenang, hampir sederhana: ''TUHAN memperhatikan Sara, seperti yang difirmankan-Nya, dan TUHAN melakukan kepada Sara seperti yang dijanjikan-Nya... pada waktu yang telah ditetapkan Allah.'' Perhatikan frasa terakhir itu — ''waktu yang telah ditetapkan Allah.'' Bukan waktu yang bisa dihitung oleh Abraham dan Sara. Bukan waktu yang sesuai ekspektasi manusia yang masuk akal mana pun. Sebuah waktu yang hanya ada dalam perhitungan Allah sendiri, tidak terlihat oleh mereka selama dua puluh lima tahun, dan tepat sesuai jadwal sepanjang waktu itu.

Inilah, barangkali, penghiburan paling dalam yang tersedia bagi siapa pun yang menanti tanpa kepastian waktu yang jelas: tidak adanya tanggal di kalender kita bukan berarti tidak ada tanggal di kalender Allah. Ketidaktahuan kita bukan berarti Allah sedang berimprovisasi. Puluhan tahun penantian Abraham dan Sara bukanlah tanda bahwa janji itu gagal; itu hanyalah puluhan tahun di mana waktu yang ditetapkan belum tiba. Waktu itu sedang datang sepanjang waktu itu, bahkan di hari-hari yang dari luar terlihat seolah tidak terjadi apa pun sama sekali.

Saat rencana singkat ini berakhir, biarlah ini yang kamu bawa: penantianmu, betapapun panjang dan betapapun tidak bertandanya, tidak berada di luar waktu Allah. Mungkin terasa seperti berada di luar segala jenis waktu. Tetapi Allah yang menepati firman-Nya kepada Abraham dan Sara pada waktu yang telah ditetapkan-Nya, adalah Allah yang sama yang memegang jalanmu yang belum bertanda itu. Ia tidak terlambat. Ia tidak sedang berimprovisasi. Ia sedang bekerja, bahkan sekarang, menuju waktu yang telah Ia tetapkan.',
    'Can you believe today that an unmarked calendar for you is not an unmarked calendar for God?', 'Bisakah kamu percaya hari ini bahwa kalender yang belum bertanda bagimu bukanlah kalender yang belum bertanda bagi Allah?',
    'Lord, You kept Your word to Abraham and Sarah at the exact time You promised. I trust You are working the same way in my unmarked waiting. Bring it to pass in Your perfect time. Amen.', 'Tuhan, Engkau menepati firman-Mu kepada Abraham dan Sara pada waktu yang tepat seperti yang Engkau janjikan. Aku percaya Engkau sedang bekerja dengan cara yang sama dalam penantianku yang belum bertanda ini. Genapilah itu pada waktu-Mu yang sempurna. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Genesis 21:1-2', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Kejadian 21:1-2', 'TB', 1);

  -- Plan: Still Believing for the Breakthrough
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Still Believing for the Breakthrough',
    'Tetap Percaya Menanti Terobosan',
    'Seven days to keep hope alive while nothing seems to be moving',
    'Tujuh hari untuk menjaga pengharapan tetap hidup ketika tidak ada yang tampak bergerak',
    7,
    'There''s a particular exhaustion in believing for a breakthrough that hasn''t come — praying for the door to open, the healing to arrive, the situation to finally turn, while month after month passes with no visible movement. This seven-day plan walks through Abraham''s long wait for a promised nation, the psalmist''s cry from the pit, and the raising of Lazarus, to rebuild hope one day at a time for anyone tempted to stop believing right before the turn.',
    'Ada kelelahan tersendiri dalam terus percaya akan terobosan yang belum juga datang — mendoakan pintu yang terbuka, kesembuhan yang tiba, keadaan yang akhirnya berbalik, sementara bulan demi bulan berlalu tanpa pergerakan yang terlihat. Rencana tujuh hari ini menelusuri penantian panjang Abraham akan bangsa yang dijanjikan, seruan pemazmur dari lubang yang dalam, dan kebangkitan Lazarus, untuk membangun kembali pengharapan selangkah demi selangkah bagi siapa saja yang tergoda berhenti percaya tepat sebelum titik balik itu tiba.',
    '/images/devotions/still-believing-for-the-breakthrough.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Though It Lingers, It Will Come', 'Sekalipun Berlambat-Lambat, Itu Akan Datang',
    'The prophet Habakkuk begins his short book with a complaint many of us would recognize: how long, Lord, must I call for help and You do not listen? He''s not asking politely. He''s asking with the raw frustration of someone who has been believing for change and has watched things stay the same, or get worse, for long enough that his patience has worn thin. It''s a rare thing in Scripture to see a prophet speak this bluntly to God, and it''s a comfort to know the book made it into the Bible anyway.

God''s answer doesn''t come with an apology for the delay or a rushed timeline to make Habakkuk feel better faster. Instead, He says: ''For the revelation awaits an appointed time; it speaks of the end and will not prove false. Though it linger, wait for it; it will certainly come and will not delay.'' Read that carefully — God acknowledges the lingering. He doesn''t deny that the wait is long or that it feels like delay. He simply promises that lingering is not the same as failing to come.

This is often exactly the tension anyone waiting for a breakthrough lives inside: it feels like delay, and in a sense it is delay by our clock, but it is not delay by God''s. The appointed time is real, even when it''s invisible to us. Believing for a breakthrough doesn''t mean pretending the wait doesn''t feel long. It means holding onto the appointed time even while acknowledging the lingering — both things can be true at once.

As you begin this seven-day plan, bring your honest ''how long'' to God, the way Habakkuk did. He can hold your frustration. And hold onto His answer too: though it lingers, it is coming. It will not delay past its appointed time.', 'Nabi Habakuk memulai kitabnya yang singkat dengan keluhan yang mungkin dikenali banyak dari kita: berapa lama lagi, Tuhan, aku harus berseru minta tolong dan Engkau tidak mendengarkan? Ia tidak bertanya dengan sopan. Ia bertanya dengan frustrasi yang mentah dari seseorang yang telah percaya akan perubahan namun menyaksikan keadaan tetap sama, atau bahkan memburuk, cukup lama hingga kesabarannya menipis. Jarang sekali kita melihat seorang nabi berbicara sejujur ini kepada Allah, dan menjadi penghiburan tersendiri mengetahui kitab ini tetap masuk ke dalam Alkitab.

Jawaban Allah tidak datang dengan permintaan maaf atas keterlambatan atau jadwal yang dipercepat untuk membuat Habakuk merasa lebih baik dengan segera. Sebaliknya, Ia berkata: ''Sebab penglihatan itu masih menanti saatnya, tetapi ia bersegera menuju kesudahannya dengan tidak menipu; apabila berlambat-lambat, nantikanlah itu, sebab itu sungguh-sungguh akan datang dan tidak akan bertangguh.'' Bacalah dengan saksama — Allah mengakui keterlambatan itu. Ia tidak menyangkal bahwa penantian itu panjang atau terasa seperti penundaan. Ia hanya berjanji bahwa berlambat-lambat bukan berarti tidak akan datang.

Inilah seringkali persis ketegangan yang dihidupi oleh siapa pun yang menanti terobosan: terasa seperti penundaan, dan dalam artian tertentu memang penundaan menurut jam kita, tetapi bukan penundaan menurut jam Allah. Waktu yang ditetapkan itu nyata, sekalipun tidak terlihat oleh kita. Percaya akan terobosan bukan berarti berpura-pura penantian itu tidak terasa panjang. Itu berarti berpegang pada waktu yang ditetapkan itu sambil tetap mengakui keterlambatannya — kedua hal itu bisa sama-sama benar sekaligus.

Saat kamu memulai rencana tujuh hari ini, bawalah ''berapa lama lagi'' yang jujur itu kepada Allah, seperti yang dilakukan Habakuk. Ia sanggup menampung frustrasimu. Dan berpeganglah juga pada jawaban-Nya: sekalipun berlambat-lambat, itu akan datang. Itu tidak akan tertunda melewati waktu yang telah ditetapkan.',
    'What honest ''how long, Lord'' have you been afraid to voice? Bring it to Him today.', 'Apa ''berapa lama lagi, Tuhan'' yang jujur yang selama ini kamu takut ucapkan? Bawalah itu kepada-Nya hari ini.',
    'Lord, like Habakkuk, I bring You my honest ''how long.'' I believe You hear me even in my frustration. Help me hold onto the appointed time, even while I feel the lingering. Amen.', 'Tuhan, seperti Habakuk, aku membawa kepada-Mu ''berapa lama lagi''-ku yang jujur. Aku percaya Engkau mendengarku bahkan dalam frustrasiku. Tolonglah aku berpegang pada waktu yang telah ditetapkan, sekalipun aku merasakan keterlambatannya. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Habakkuk 2:3', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Habakuk 2:3', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Stars You Cannot Count', 'Bintang-Bintang yang Tidak Bisa Kamu Hitung',
    'Abraham''s breakthrough — a son, and through him a whole nation — was promised long before there was any visible sign of it coming true. He was old. His wife was barren. By every measurable standard, the promise looked impossible, and it stayed looking impossible for years. God didn''t wait until circumstances made the promise plausible before He spoke it. He spoke it while it still looked entirely out of reach.

One night, God took Abraham outside his tent and gave him a picture instead of a timeline: ''Look up at the sky and count the stars — if indeed you can count them... So shall your offspring be.'' It''s a striking way to reassure someone — not with a date, but with an image too vast to fully grasp. Abraham couldn''t count the stars. He wasn''t meant to. He was meant to look at something bigger than his current circumstances and let it recalibrate what he believed was possible.

And Scripture records his response simply: ''Abram believed the LORD, and he credited it to him as righteousness.'' Not because the child had arrived. Not because the circumstances had changed. He believed while the sky was still just stars, and the promise still just words. This is the shape belief often takes while we''re waiting for a breakthrough — not certainty because we can see the outcome, but trust because we''ve looked at something bigger than our current evidence and chosen to let it shape our expectation.

If your circumstances today look as unlikely as an elderly couple having a child, you''re in good company. Try, today, looking up at something bigger than your current evidence — God''s past faithfulness, His character, His promises in Scripture — and let that recalibrate what you believe is still possible.', 'Terobosan bagi Abraham — seorang anak laki-laki, dan melaluinya satu bangsa penuh — dijanjikan jauh sebelum ada tanda yang terlihat bahwa itu akan menjadi kenyataan. Ia sudah tua. Istrinya mandul. Menurut ukuran apa pun, janji itu tampak mustahil, dan tetap tampak mustahil selama bertahun-tahun. Allah tidak menunggu sampai keadaan membuat janji itu masuk akal sebelum Ia mengucapkannya. Ia mengucapkannya justru ketika itu masih tampak sepenuhnya di luar jangkauan.

Pada suatu malam, Allah membawa Abraham keluar dari kemahnya dan memberinya sebuah gambaran, bukan kepastian waktu: ''Coba lihat ke langit, hitunglah bintang-bintang, jika engkau dapat menghitungnya... Demikianlah banyaknya nanti keturunanmu.'' Ini cara yang mencolok untuk meyakinkan seseorang — bukan dengan tanggal, melainkan dengan gambaran yang terlalu luas untuk sepenuhnya dipahami. Abraham tidak bisa menghitung bintang-bintang. Ia memang tidak dimaksudkan untuk itu. Ia dimaksudkan untuk melihat sesuatu yang lebih besar dari keadaannya saat itu, dan membiarkan itu mengubah apa yang ia percaya mungkin terjadi.

Dan Alkitab mencatat responsnya dengan sederhana: ''Abram percaya kepada TUHAN, maka TUHAN memperhitungkan hal itu kepadanya sebagai kebenaran.'' Bukan karena anak itu sudah lahir. Bukan karena keadaan sudah berubah. Ia percaya ketika langit masih sekadar bintang-bintang, dan janji itu masih sekadar kata-kata. Inilah bentuk yang sering diambil oleh kepercayaan selagi kita menantikan terobosan — bukan kepastian karena kita bisa melihat hasilnya, melainkan kepercayaan karena kita telah melihat sesuatu yang lebih besar dari bukti kita saat ini dan memilih membiarkannya membentuk pengharapan kita.

Jika keadaanmu hari ini tampak semustahil pasangan lanjut usia yang memiliki anak, kamu berada dalam kebersamaan yang baik. Cobalah, hari ini, melihat kepada sesuatu yang lebih besar dari bukti yang kamu miliki saat ini — kesetiaan Allah di masa lalu, karakter-Nya, janji-janji-Nya dalam Alkitab — dan biarkan itu mengubah apa yang kamu percaya masih mungkin terjadi.',
    'What is the ''stars'' moment God might be inviting you to look at today — evidence of His character bigger than your current circumstances?', 'Apa momen ''bintang-bintang'' yang mungkin sedang Allah undang kamu untuk lihat hari ini — bukti karakter-Nya yang lebih besar dari keadaanmu saat ini?',
    'Lord, when my circumstances look impossible, help me look up instead of down. I choose to believe You, even before I can count how it will happen. Amen.', 'Tuhan, ketika keadaanku tampak mustahil, tolonglah aku menengadah ke atas, bukan menunduk ke bawah. Aku memilih untuk percaya kepada-Mu, bahkan sebelum aku bisa menghitung bagaimana itu akan terjadi. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Genesis 15:5-6', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Kejadian 15:5-6', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Lifted Out of the Pit', 'Diangkat dari Lubang Kebinasaan',
    'Psalm 40 opens with a testimony many of us long to say about our own breakthrough someday: ''I waited patiently for the LORD; he turned to me and heard my cry.'' But what comes before those words matters as much as what comes after — this psalm was written by someone who had been stuck, the text says, in ''the slimy pit... the mud and mire.'' Not a brief inconvenience. A place where you sink further the longer you struggle, where solid ground feels like a memory.

It''s worth noticing the phrase ''waited patiently.'' In Hebrew, the structure repeats the idea of waiting — literally something closer to ''waiting, I waited.'' It''s the language of someone who kept returning to the posture of waiting on God again and again while stuck in the pit, not someone who waited once and was immediately rescued. The breakthrough, when it came, came after a process of continually re-choosing to wait rather than despair.

And when God did answer, the psalmist describes it in vivid, physical terms: lifted out, feet set on rock, steps made firm. This is the language of an actual breakthrough — not a slight improvement, but a complete change of ground beneath his feet. And notably, the psalm doesn''t end there. It continues: ''He put a new song in my mouth, a hymn of praise to our God.'' The breakthrough didn''t just change his circumstances; it gave him a new song, a permanent shift in how he related to God.

If you feel stuck today — in the mud, in the mire, in a pit that seems to have no bottom or exit — this psalm was written for you. It doesn''t promise instant rescue. It promises that patient, repeated waiting on God is not wasted, even from the pit, and that when the breakthrough comes, it comes complete: firm footing, and a new song.', 'Mazmur 40 dibuka dengan kesaksian yang banyak dari kita rindu ucapkan tentang terobosan kita sendiri suatu hari nanti: ''Aku sangat menanti-nantikan TUHAN; Ia condong kepadaku dan mendengar teriakku minta tolong.'' Tetapi apa yang mendahului kata-kata itu sama pentingnya dengan apa yang mengikutinya — mazmur ini ditulis oleh seseorang yang terjebak, kata teksnya, di ''lobang kebinasaan... lumpur rawa.'' Bukan ketidaknyamanan sesaat. Sebuah tempat di mana kamu semakin tenggelam semakin lama kamu berjuang, di mana tanah yang kokoh terasa hanya seperti kenangan.

Patut diperhatikan frasa ''menanti-nantikan.'' Dalam bahasa Ibrani, susunannya mengulang gagasan menanti — secara harfiah lebih dekat pada ''menanti, aku menanti.'' Ini adalah bahasa dari seseorang yang terus kembali pada sikap menanti kepada Allah berulang-ulang selagi terjebak di dalam lubang, bukan seseorang yang menanti sekali lalu langsung diselamatkan. Terobosan itu, ketika datang, datang setelah proses terus-menerus memilih kembali untuk menanti alih-alih berputus asa.

Dan ketika Allah memang menjawab, sang pemazmur menggambarkannya dengan istilah yang hidup dan nyata: diangkat, kaki ditempatkan di atas bukit batu, langkah dimantapkan. Ini adalah bahasa dari terobosan yang sesungguhnya — bukan perbaikan kecil, melainkan perubahan total dari tanah yang dipijak. Dan yang patut dicatat, mazmur ini tidak berhenti di situ. Ia berlanjut: ''Ia memberi nyanyian baru dalam mulutku, nyanyian pujian bagi Allah kita.'' Terobosan itu tidak hanya mengubah keadaannya; ia memberinya nyanyian baru, sebuah pergeseran permanen dalam cara ia berelasi dengan Allah.

Jika hari ini kamu merasa terjebak — dalam lumpur, dalam rawa, dalam lubang yang seakan tidak memiliki dasar atau jalan keluar — mazmur ini ditulis untukmu. Ia tidak menjanjikan penyelamatan instan. Ia menjanjikan bahwa penantian yang sabar dan berulang kepada Allah tidak sia-sia, bahkan dari dalam lubang, dan bahwa ketika terobosan itu datang, ia datang secara utuh: pijakan yang kokoh, dan nyanyian yang baru.',
    'What would it mean for you to keep ''re-choosing'' to wait on God today, rather than waiting once and giving up?', 'Apa artinya bagimu untuk terus ''memilih kembali'' menanti kepada Allah hari ini, bukan hanya menanti sekali lalu menyerah?',
    'Lord, I feel stuck in the mud today. I choose again to wait for You, believing You will lift me out and set my feet on solid ground. Give me a new song in time. Amen.', 'Tuhan, hari ini aku merasa terjebak dalam lumpur. Aku memilih lagi untuk menanti kepada-Mu, percaya Engkau akan mengangkatku dan menempatkan kakiku di atas tanah yang kokoh. Berilah aku nyanyian baru pada waktunya. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 40:1-3', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 40:1-3', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Watching in Hope When Others Have Given Up', 'Menujukan Pengharapan Ketika yang Lain Sudah Menyerah',
    'The prophet Micah wrote during a time of deep social collapse — betrayal, corruption, broken trust everywhere he looked. Reading the chapter that precedes his declaration of hope, you''d expect him to end in despair. Instead, in the middle of describing how bad things had gotten, he writes: ''But as for me, I watch in hope for the LORD, I wait for God my Savior; my God will hear me.'' The ''but as for me'' is doing a lot of work in that sentence — everyone else may have given up, but he chooses differently.

This is an important distinction for anyone believing for a breakthrough while surrounded by people who have stopped believing with them. Maybe others around you have moved on, stopped asking, stopped expecting anything to change. Micah shows us that hope doesn''t have to be a group activity to be valid. ''But as for me'' is a personal declaration, made in the middle of general discouragement, that doesn''t require anyone else''s agreement to be real.

Notice also the word ''watch.'' Micah isn''t just passively waiting; he''s actively watching, like a person on a night watch who keeps their eyes trained on the horizon precisely because they expect something to appear. Watching in hope is a discipline — it takes more energy than assuming nothing will happen. It''s the posture of someone who has decided the breakthrough is worth staying alert for, even when everyone else has stopped looking.

Today, even if the people around you have stopped expecting your breakthrough, you don''t need their agreement to keep watching. Say it as your own personal declaration, the way Micah did: but as for me, I watch in hope for the Lord. My God will hear me.', 'Nabi Mikha menulis pada masa keruntuhan sosial yang dalam — pengkhianatan, korupsi, kepercayaan yang hancur di mana pun ia memandang. Membaca pasal yang mendahului pernyataan pengharapannya, kamu akan menduga ia akan berakhir dalam keputusasaan. Sebaliknya, di tengah menggambarkan betapa buruknya keadaan, ia menulis: ''Tetapi aku ini akan menujukan pengharapanku kepada TUHAN, aku akan menanti-nantikan Allah yang menyelamatkan aku; Allahku akan mendengarkan aku.'' Frasa ''tetapi aku ini'' melakukan banyak hal dalam kalimat itu — semua orang lain mungkin sudah menyerah, tetapi ia memilih dengan cara yang berbeda.

Ini adalah perbedaan penting bagi siapa pun yang percaya akan terobosan sementara dikelilingi orang-orang yang telah berhenti percaya bersama mereka. Mungkin orang-orang di sekitarmu sudah melangkah maju, berhenti meminta, berhenti mengharapkan sesuatu berubah. Mikha menunjukkan kepada kita bahwa pengharapan tidak harus menjadi kegiatan kelompok agar valid. ''Tetapi aku ini'' adalah deklarasi pribadi, dibuat di tengah keputusasaan umum, yang tidak membutuhkan persetujuan siapa pun untuk menjadi nyata.

Perhatikan juga kata ''menujukan pengharapanku'' atau ''mengawasi.'' Mikha tidak sekadar menanti secara pasif; ia secara aktif mengawasi, seperti orang yang berjaga malam yang terus mengarahkan matanya ke cakrawala justru karena ia mengharapkan sesuatu akan muncul. Mengawasi dengan pengharapan adalah sebuah disiplin — ia membutuhkan lebih banyak energi daripada mengasumsikan tidak akan ada apa-apa yang terjadi. Ini adalah sikap seseorang yang telah memutuskan bahwa terobosan itu layak untuk terus diwaspadai, bahkan ketika semua orang lain telah berhenti mencari.

Hari ini, bahkan jika orang-orang di sekitarmu sudah berhenti mengharapkan terobosanmu, kamu tidak membutuhkan persetujuan mereka untuk terus mengawasi. Ucapkanlah sebagai deklarasi pribadimu sendiri, seperti yang dilakukan Mikha: tetapi aku ini, aku akan menujukan pengharapanku kepada TUHAN. Allahku akan mendengarkan aku.',
    'Where do you need to make your own ''but as for me'' declaration today, regardless of whether others around you are still hoping?', 'Di bagian mana kamu perlu membuat deklarasi ''tetapi aku ini'' milikmu sendiri hari ini, terlepas dari apakah orang-orang di sekitarmu masih berharap atau tidak?',
    'Lord, even if others around me have stopped expecting, I choose to keep watching in hope. I trust that You hear me. Keep my eyes trained on You. Amen.', 'Tuhan, bahkan jika orang-orang di sekitarku sudah berhenti mengharapkan, aku memilih untuk terus mengawasi dengan pengharapan. Aku percaya Engkau mendengarku. Jagalah mataku tetap tertuju kepada-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Micah 7:7', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mikha 7:7', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Believing Against All Hope', 'Berharap Sekalipun Tidak Ada Dasar untuk Berharap',
    'Paul, reflecting back on Abraham''s story generations later, coins a phrase that captures something many of us have felt but never had words for: ''Against all hope, Abraham in hope believed.'' Read that again slowly — against all hope, in hope. It sounds almost like a contradiction, and in a sense it is. It describes believing when every external, reasonable indicator says not to. Not blind optimism, not denial of the facts, but a decision to hope anyway, against what all the visible hope-indicators were saying.

This distinction matters for anyone waiting on a long-delayed breakthrough, because at some point the ''reasonable hope'' — the hope based on visible momentum, on things trending in the right direction — often runs out. The job hasn''t called back in months. The scan results haven''t changed. The relationship shows no signs of softening. Ordinary, circumstantial hope has legitimate reasons to fade at that point. Paul''s phrase describes something that operates on a different fuel entirely.

Abraham''s hope ''against all hope'' wasn''t naive. He knew his own body was as good as dead, Paul says elsewhere in the same passage — he wasn''t in denial about the facts. He simply refused to let the facts be the final word on what was possible, because he had chosen to anchor his hope in God''s promise rather than in his own circumstances. That''s not delusion. That''s a deliberate redirection of where hope gets its evidence from.

If your circumstantial hope has run dry today — if you''ve run out of reasonable indicators pointing toward your breakthrough — you''re not required to manufacture more evidence. You''re invited, like Abraham, to hope against all hope: to keep believing not because the circumstances suggest it, but because the God who promised is still trustworthy, regardless of what the circumstances currently say.', 'Paulus, merenungkan kembali kisah Abraham beberapa generasi kemudian, menciptakan sebuah ungkapan yang menangkap sesuatu yang banyak dari kita pernah rasakan namun tidak pernah punya kata-kata untuknya: ''Sebab sekalipun tidak ada dasar untuk berharap, namun Abraham berharap juga dan percaya.'' Bacalah itu sekali lagi pelan-pelan — sekalipun tidak ada dasar untuk berharap, namun berharap juga. Terdengar hampir seperti kontradiksi, dan dalam artian tertentu memang begitu. Ini menggambarkan kepercayaan ketika setiap indikator eksternal yang masuk akal berkata jangan. Bukan optimisme buta, bukan penyangkalan atas fakta, melainkan keputusan untuk tetap berharap, bertentangan dengan apa yang dikatakan semua indikator pengharapan yang terlihat.

Perbedaan ini penting bagi siapa pun yang menantikan terobosan yang sudah lama tertunda, karena pada suatu titik, ''pengharapan yang masuk akal'' — pengharapan berdasarkan momentum yang terlihat, hal-hal yang bergerak ke arah yang benar — seringkali habis. Pekerjaan itu belum juga dihubungi kembali selama berbulan-bulan. Hasil pemindaian belum berubah. Hubungan itu tidak menunjukkan tanda-tanda melunak. Pengharapan biasa yang berdasarkan keadaan punya alasan yang sah untuk memudar pada titik itu. Ungkapan Paulus menggambarkan sesuatu yang beroperasi dengan bahan bakar yang sama sekali berbeda.

Pengharapan Abraham ''sekalipun tidak ada dasar untuk berharap'' bukanlah kenaifan. Ia tahu tubuhnya sendiri sudah seperti mati, kata Paulus di bagian lain dalam ayat yang sama — ia tidak menyangkal fakta-fakta itu. Ia hanya menolak membiarkan fakta-fakta itu menjadi kata akhir tentang apa yang mungkin terjadi, karena ia telah memilih menambatkan pengharapannya pada janji Allah, bukan pada keadaannya sendiri. Itu bukan delusi. Itu adalah pengalihan yang disengaja tentang dari mana pengharapan mendapatkan buktinya.

Jika pengharapan berdasarkan keadaanmu telah kering hari ini — jika kamu telah kehabisan indikator masuk akal yang menunjuk ke arah terobosanmu — kamu tidak diwajibkan untuk membuat lebih banyak bukti. Kamu diundang, seperti Abraham, untuk berharap sekalipun tidak ada dasar untuk berharap: untuk terus percaya bukan karena keadaan menyarankannya, melainkan karena Allah yang berjanji itu masih dapat dipercaya, terlepas dari apa yang dikatakan keadaan saat ini.',
    'Where have you let circumstantial evidence become the final word on what''s possible, instead of anchoring hope in God''s character?', 'Di bagian mana kamu telah membiarkan bukti berdasarkan keadaan menjadi kata akhir tentang apa yang mungkin terjadi, alih-alih menambatkan pengharapan pada karakter Allah?',
    'Lord, my circumstances offer little reason to hope today. Help me hope against all hope, the way Abraham did — anchored in Your promise, not my evidence. Amen.', 'Tuhan, keadaanku hari ini hampir tidak memberi alasan untuk berharap. Tolonglah aku berharap sekalipun tidak ada dasar untuk berharap, seperti Abraham — bertambat pada janji-Mu, bukan pada buktiku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 4:18', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 4:18', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'Not Growing Weary in Doing Good', 'Tidak Jemu-Jemu Berbuat Baik',
    'Sometimes the hardest part of believing for a breakthrough isn''t the believing itself — it''s continuing to show up, to do the next faithful thing, in a season where none of it seems to be producing results. Paul''s instruction to the Galatians is short and practical: ''Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.'' It''s written for exactly this fatigue — the specific tiredness of sowing in a field that hasn''t shown a single sprout yet.

Farming imagery runs throughout Scripture''s teaching on waiting, and it''s worth understanding why. A farmer who plants seed doesn''t get to see the harvest the next morning. There''s a long, invisible period underground where nothing appears to be happening, even though root systems are quietly forming. If the farmer gave up during that invisible period — stopped watering, stopped tending, assumed nothing was working because nothing was visible — the harvest that was actually coming would never arrive.

This is a sobering thought for anyone tempted to quit right in the middle of an invisible season. The temptation to give up rarely arrives at the start of waiting, when hope is fresh. It arrives in the middle, in the exact stretch where the seed is underground and nothing visible confirms that anything is happening. Paul''s warning is precisely aimed at that stretch: don''t grow weary here, in the part where it looks like nothing is working.

Whatever ''doing good'' looks like in your season — continuing to pray, continuing to show up, continuing the small faithful actions connected to your breakthrough — Paul''s promise is that the proper time for harvest is real, even if it''s currently invisible. Don''t give up in the underground season. The harvest is forming.', 'Kadang bagian tersulit dari percaya akan terobosan bukanlah kepercayaan itu sendiri — melainkan terus melakukan hal yang benar berikutnya, dalam musim di mana tidak satu pun tampaknya menghasilkan sesuatu. Instruksi Paulus kepada jemaat Galatia singkat dan praktis: ''Janganlah kita jemu-jemu berbuat baik, karena apabila sudah datang waktunya, kita akan menuai, jika kita tidak menjadi lemah.'' Ini ditulis persis untuk kelelahan semacam ini — kelelahan khusus dari menabur di ladang yang belum menunjukkan satu pun tunas.

Gambaran pertanian muncul berulang kali dalam ajaran Alkitab tentang penantian, dan penting untuk memahami mengapa. Petani yang menanam benih tidak bisa melihat panennya keesokan paginya. Ada periode panjang dan tak terlihat di dalam tanah di mana tampaknya tidak ada apa pun yang terjadi, padahal sistem akar sedang diam-diam terbentuk. Jika petani itu menyerah selama periode tak terlihat itu — berhenti menyiram, berhenti merawat, mengira tidak ada yang berhasil karena tidak ada yang terlihat — panen yang sesungguhnya sedang datang itu tidak akan pernah tiba.

Ini pemikiran yang menyadarkan bagi siapa pun yang tergoda untuk berhenti tepat di tengah musim yang tak terlihat. Godaan untuk menyerah jarang datang di awal penantian, ketika pengharapan masih segar. Godaan itu datang di tengah, tepat di rentang di mana benih masih di dalam tanah dan tidak ada yang terlihat memastikan bahwa sesuatu sedang terjadi. Peringatan Paulus tepat ditujukan pada rentang itu: jangan menjadi jemu di sini, di bagian yang tampaknya tidak ada yang berhasil.

Apa pun bentuk ''berbuat baik'' dalam musimmu — terus berdoa, terus hadir, terus melakukan tindakan setia kecil yang terhubung dengan terobosanmu — janji Paulus adalah bahwa waktu yang tepat untuk panen itu nyata, sekalipun saat ini tak terlihat. Jangan menyerah di musim bawah tanah ini. Panen itu sedang terbentuk.',
    'What small, faithful action connected to your breakthrough have you been tempted to stop doing because you can''t see results yet?', 'Tindakan setia kecil apa yang terhubung dengan terobosanmu yang belakangan ini tergoda kamu hentikan karena kamu belum melihat hasilnya?',
    'Lord, I don''t want to give up in the invisible season. Strengthen me to keep doing good, trusting that the harvest is forming even when I can''t see it. Amen.', 'Tuhan, aku tidak ingin menyerah di musim yang tak terlihat ini. Kuatkanlah aku untuk terus berbuat baik, percaya bahwa panen itu sedang terbentuk bahkan ketika aku tidak bisa melihatnya. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Galatians 6:9', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Galatia 6:9', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'You Will See the Glory of God', 'Engkau Akan Melihat Kemuliaan Allah',
    'By the time Jesus arrived at Lazarus''s tomb, the situation had moved well past ''delayed'' into what everyone around Him considered final. Lazarus had been dead four days. Martha, meeting Jesus on the road, doesn''t hide her grief or her confusion about the timing: ''Lord, if you had been here, my brother would not have died.'' It''s the voice of someone who believed in Jesus''s power but couldn''t understand why He hadn''t arrived in time to use it — a feeling many of us know intimately from our own long-delayed breakthroughs.

What''s remarkable is that Jesus had, in fact, delayed on purpose. Earlier in the chapter, we''re told He deliberately stayed two extra days after hearing Lazarus was sick — not out of neglect, but because He was working toward something larger than a quick fix. He tells His disciples plainly that the delay was for a purpose: ''so that you may believe.'' The waiting itself was part of the breakthrough, not an obstacle to it.

At the tomb, Jesus says something that applies far beyond this one story: ''Did I not tell you that if you believe, you will see the glory of God?'' Notice the order — believe first, see second. Not the reverse. Martha, and everyone standing at that graveside, was being asked to keep believing in a situation that looked completely, permanently over, on the promise that belief would precede the sight of glory, not follow it.

As this seven-day plan closes, the stone in front of your own situation may still look sealed. That''s alright. Jesus specializes in situations everyone else has already called final. Whatever your breakthrough looks like — and whatever four-days-dead thing you''re standing in front of — keep believing before you see. That''s the order it comes in. You will see the glory of God.', 'Pada saat Yesus tiba di kubur Lazarus, keadaan telah jauh melewati ''tertunda'' menuju apa yang dianggap semua orang di sekitar-Nya sebagai final. Lazarus sudah mati empat hari. Marta, bertemu Yesus di jalan, tidak menyembunyikan dukacita atau kebingungannya tentang waktu itu: ''Tuhan, sekiranya Engkau ada di sini, saudaraku pasti tidak mati.'' Itu adalah suara seseorang yang percaya akan kuasa Yesus tetapi tidak bisa memahami mengapa Ia tidak tiba tepat waktu untuk menggunakannya — perasaan yang banyak dari kita kenal secara dekat dari terobosan kita sendiri yang sudah lama tertunda.

Yang luar biasa adalah Yesus sesungguhnya menunda dengan sengaja. Lebih awal dalam pasal itu, kita diberitahu Ia dengan sengaja tinggal dua hari lebih lama setelah mendengar Lazarus sakit — bukan karena kelalaian, tetapi karena Ia sedang bekerja menuju sesuatu yang lebih besar daripada solusi cepat. Ia berkata dengan jelas kepada murid-murid-Nya bahwa penundaan itu memiliki tujuan: ''supaya kamu percaya.'' Penantian itu sendiri adalah bagian dari terobosan, bukan penghalang bagi terobosan itu.

Di kubur itu, Yesus berkata sesuatu yang berlaku jauh melampaui kisah ini saja: ''Bukankah telah Kukatakan kepadamu: Jikalau engkau percaya engkau akan melihat kemuliaan Allah?'' Perhatikan urutannya — percaya dahulu, melihat kemudian. Bukan sebaliknya. Marta, dan semua orang yang berdiri di kubur itu, diminta untuk terus percaya dalam keadaan yang tampak sepenuhnya, secara permanen, berakhir, dengan janji bahwa kepercayaan akan mendahului penglihatan kemuliaan, bukan mengikutinya.

Saat rencana tujuh hari ini berakhir, batu di depan keadaanmu sendiri mungkin masih tampak tertutup rapat. Tidak apa-apa. Yesus mengkhususkan diri dalam keadaan yang sudah dianggap final oleh semua orang lain. Apa pun rupa terobosanmu — dan apa pun hal yang sudah ''mati empat hari'' yang sedang kamu hadapi — teruslah percaya sebelum kamu melihat. Begitulah urutannya. Engkau akan melihat kemuliaan Allah.',
    'What ''four-days-dead'' situation in your life is Jesus inviting you to keep believing over, before you see any change?', 'Keadaan ''mati empat hari'' apa dalam hidupmu yang sedang Yesus undang kamu untuk terus percayai, sebelum kamu melihat perubahan apa pun?',
    'Lord Jesus, I choose to believe before I see. Even in what looks completely over, I trust You are working toward something greater. Let me see Your glory in Your time. Amen.', 'Tuhan Yesus, aku memilih untuk percaya sebelum aku melihat. Bahkan dalam apa yang tampak sepenuhnya berakhir, aku percaya Engkau sedang bekerja menuju sesuatu yang lebih besar. Biarlah aku melihat kemuliaan-Mu pada waktu-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'John 11:40', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yohanes 11:40', 'TB', 1);

  -- Sub-category: Hope Beyond Circumstances --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Hope Beyond Circumstances' AND parent_id = v_category_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Hope Beyond Circumstances', 'Pengharapan di Atas Keadaan', v_category_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengharapan di Atas Keadaan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Hope on Empty
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Hope on Empty',
    'Harapan di Tengah Kekurangan',
    'Trusting God''s provision when the numbers don''t add up',
    'Percaya pada Penyediaan Tuhan Saat Hitungan Tak Cukup',
    5,
    'A five-day devotional for anyone staring at a bank account, a stack of bills, or an uncertain paycheck and wondering if God has forgotten them. Through familiar Scripture — from the widow''s jar of oil to the birds of the air — this plan gently retrains our eyes to see provision as a pattern of God''s character, not a coincidence, and offers practical, honest encouragement for walking through financial hardship without losing hope.',
    'Renungan lima hari bagi siapa saja yang menatap rekening bank, tumpukan tagihan, atau gaji yang tidak menentu, dan bertanya-tanya apakah Tuhan telah melupakan mereka. Melalui ayat-ayat Alkitab yang akrab — dari minyak janda hingga burung-burung di udara — renungan ini melatih ulang mata kita untuk melihat penyediaan sebagai pola karakter Tuhan, bukan kebetulan, serta memberi penghiburan yang jujur dan praktis untuk melewati kesulitan keuangan tanpa kehilangan harapan.',
    '/images/devotions/hope-on-empty.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The God Who Sees the Shortfall', 'Allah yang Melihat Kekurangan Kita',
    'There is a particular kind of tiredness that comes from doing the math over and over, hoping the numbers will somehow rearrange themselves into something more forgiving. Many of us know that late-night calculator glow, that quiet dread before checking a balance. Financial hardship has a way of narrowing our vision until all we can see is the shortfall — the bill that''s due, the job that fell through, the plan that unraveled. It is exhausting, and it is lonely, even when other people are walking through it too.

Scripture never pretends that God''s people are exempt from lean seasons. The Bible is full of famines, empty storehouses, and people who genuinely did not know where the next meal would come from. And yet, again and again, it also insists that scarcity is never the last word about who God is. Paul writes to the Philippians — a church that had actually sacrificed to support him — with a promise that reads almost too simply for how heavy our worries feel: ''And my God will meet all your needs according to the riches of his glory in Christ Jesus.'' Not according to our income. According to His riches.

That distinction matters more than it might first appear. Our hope in hardship is not pinned to circumstances improving on our timeline. It is pinned to the character of a God whose resources were never limited by our budget in the first place. This does not erase the real, practical pressure of unpaid bills or a shrinking savings account. But it does reframe the question we are really asking in the dark: not ''will things work out the way I planned,'' but ''is God still who He says He is, even now?''

This week is not a formula for financial breakthrough. It is an invitation to notice God''s provision as a pattern across Scripture and across our own lives — sometimes dramatic, more often quiet and easy to miss. Before we look at the how, we start with the who: a God who sees the shortfall clearly, and has never once been overwhelmed by it.', 'Ada kelelahan tertentu yang muncul dari menghitung berulang-ulang, berharap angka-angka itu entah bagaimana akan tersusun ulang menjadi sesuatu yang lebih ringan. Banyak dari kita mengenal cahaya kalkulator di tengah malam itu, kecemasan sunyi sebelum memeriksa saldo rekening. Kesulitan keuangan punya cara mempersempit pandangan kita sampai yang terlihat hanyalah kekurangan — tagihan yang jatuh tempo, pekerjaan yang gagal, rencana yang berantakan. Itu melelahkan, dan itu terasa sepi, bahkan ketika orang lain juga sedang mengalaminya.

Alkitab tidak pernah berpura-pura bahwa umat Tuhan kebal dari musim paceklik. Alkitab penuh dengan kisah kelaparan, lumbung yang kosong, dan orang-orang yang benar-benar tidak tahu dari mana makanan berikutnya akan datang. Namun berulang kali, Alkitab juga menegaskan bahwa kekurangan bukanlah kata terakhir tentang siapa Allah itu. Paulus menulis kepada jemaat Filipi — jemaat yang benar-benar berkorban untuk mendukungnya — dengan janji yang terasa terlalu sederhana dibanding beratnya kekhawatiran kita: ''Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.'' Bukan menurut penghasilan kita. Menurut kekayaan-Nya.

Perbedaan itu lebih penting dari yang terlihat sekilas. Harapan kita di tengah kesulitan bukan digantungkan pada membaiknya keadaan sesuai jadwal kita. Harapan itu digantungkan pada karakter Allah yang sumber dayanya sejak awal tidak pernah dibatasi oleh anggaran kita. Ini tidak menghapus tekanan nyata dari tagihan yang belum terbayar atau tabungan yang menipis. Tetapi ini membingkai ulang pertanyaan yang sebenarnya kita ajukan dalam kegelapan: bukan ''apakah semuanya akan berjalan sesuai rencanaku,'' melainkan ''apakah Allah masih menjadi seperti yang Dia katakan, bahkan sekarang?''

Minggu ini bukanlah rumus untuk terobosan keuangan. Ini adalah undangan untuk memperhatikan penyediaan Tuhan sebagai pola sepanjang Alkitab dan sepanjang hidup kita sendiri — kadang dramatis, tapi lebih sering tenang dan mudah terlewat. Sebelum kita melihat caranya, kita mulai dengan siapa-Nya: Allah yang melihat kekurangan kita dengan jelas, dan tidak pernah sekalipun kewalahan olehnya.',
    'Where have you quietly assumed God''s provision is limited by your own resources?', 'Di mana kamu diam-diam menganggap penyediaan Tuhan dibatasi oleh sumber dayamu sendiri?',
    'Lord, You see the numbers I keep running through my mind. Thank You that Your supply has never depended on my balance. Steady my heart today with the truth of who You are, not just what my account shows. Amen.', 'Tuhan, Engkau melihat angka-angka yang terus kuhitung dalam pikiranku. Terima kasih karena penyediaan-Mu tidak pernah bergantung pada saldoku. Teguhkanlah hatiku hari ini dengan kebenaran tentang siapa Engkau, bukan hanya apa yang ditunjukkan rekeningku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Philippians 4:19', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Filipi 4:19', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'The Jar That Didn''t Run Dry', 'Buli-buli yang Tidak Kunjung Habis',
    'In 2 Kings 4, a widow comes to the prophet Elisha in real distress. Her husband — a man who had feared the Lord — has died, and now a creditor is coming to take her two sons as slaves to pay off the debt. It is hard to imagine a more desperate financial situation: no husband, no income, a debt she cannot pay, and children about to be taken from her. Elisha''s response is strangely practical. He doesn''t offer a lump sum. He asks what she already has in the house. All she can find is a small jar of olive oil.

What happens next is one of Scripture''s quieter miracles. Elisha tells her to borrow empty jars from her neighbors — not just a few, but as many as she can gather — and to start pouring her little bit of oil into them, behind closed doors. And the oil simply does not stop flowing until every single jar is full. Only when there are no more empty containers left does the oil finally stop. She sells the oil, pays her debt, and lives on what remains with her sons. God''s provision met her exactly at the edge of her need — no more, no less.

There is something worth sitting with in the detail that the miracle was proportional to her willingness to bring empty jars. God did not multiply oil into an empty room; He multiplied it to fill the containers she prepared. Financial hardship can tempt us to shrink our expectations, to stop asking, to assume there''s no point in bringing our need before God because the need is too large and our resources too small. This story quietly argues the opposite: bring what little you have, and bring every empty vessel you can find. Let God decide where the oil stops.

Most of us will never see a jar of oil physically multiply. But we may notice, in hindsight, how a small amount of money stretched further than it should have, how an unexpected check arrived the same week a bill was due, how a friend offered help before we even asked. These are not always dramatic. They are often the modern equivalent of oil quietly filling jar after jar in a closed room — provision that becomes obvious only when we look back and count how many containers actually got filled.', 'Dalam 2 Raja-raja 4, seorang janda datang kepada nabi Elisa dalam kesesakan yang nyata. Suaminya — seorang yang takut akan Tuhan — telah meninggal, dan sekarang seorang penagih hutang datang untuk mengambil kedua anak lelakinya sebagai budak guna melunasi hutang. Sulit membayangkan situasi keuangan yang lebih putus asa: tanpa suami, tanpa penghasilan, hutang yang tak sanggup dibayar, dan anak-anak yang akan direnggut darinya. Jawaban Elisa terasa aneh karena begitu praktis. Ia tidak menawarkan sejumlah uang. Ia bertanya apa yang sudah dimiliki janda itu di rumahnya. Yang bisa ditemukan hanyalah sebuli-buli kecil minyak zaitun.

Apa yang terjadi selanjutnya adalah salah satu mukjizat Alkitab yang paling tenang. Elisa menyuruhnya meminjam buli-buli kosong dari tetangga-tetangganya — bukan hanya beberapa, tetapi sebanyak mungkin yang bisa dikumpulkan — lalu mulai menuangkan sedikit minyaknya ke dalam buli-buli itu, di balik pintu tertutup. Minyak itu tidak berhenti mengalir sampai setiap buli-buli penuh. Baru ketika tidak ada lagi wadah kosong yang tersisa, minyak itu akhirnya berhenti. Janda itu menjual minyaknya, melunasi hutangnya, dan hidup dari sisanya bersama anak-anaknya. Penyediaan Tuhan menjumpainya tepat di batas kebutuhannya — tidak lebih, tidak kurang.

Ada hal yang layak direnungkan dalam detail bahwa mukjizat itu sebanding dengan kesediaannya membawa buli-buli kosong. Tuhan tidak melipatgandakan minyak ke ruangan kosong; Ia melipatgandakannya untuk mengisi wadah-wadah yang telah disiapkan janda itu. Kesulitan keuangan dapat menggoda kita untuk mengecilkan harapan, berhenti meminta, menganggap tidak ada gunanya membawa kebutuhan kita kepada Tuhan karena kebutuhan itu terlalu besar dan sumber daya kita terlalu kecil. Kisah ini diam-diam membantah hal itu: bawalah sedikit yang kau punya, dan bawalah setiap wadah kosong yang bisa kau temukan. Biarkan Tuhan yang menentukan di mana minyak itu berhenti.

Kebanyakan dari kita mungkin tidak akan pernah melihat minyak berlipat ganda secara fisik. Tetapi kita mungkin menyadari, saat menoleh ke belakang, bagaimana sedikit uang bisa mencukupi lebih jauh dari yang seharusnya, bagaimana cek yang tak terduga datang pada minggu yang sama saat tagihan jatuh tempo, bagaimana seorang teman menawarkan bantuan sebelum kita sempat memintanya. Ini tidak selalu dramatis. Sering kali ini adalah versi modern dari minyak yang diam-diam mengisi buli-buli demi buli-buli dalam ruangan tertutup — penyediaan yang baru terlihat jelas ketika kita menoleh ke belakang dan menghitung berapa banyak wadah yang sesungguhnya telah terisi.',
    'What is the ''small jar'' you already have that God might want you to bring to Him, instead of waiting until you feel you have more?', 'Apa ''buli-buli kecil'' yang sudah kamu miliki, yang mungkin ingin Tuhan minta kamu bawa kepada-Nya, alih-alih menunggu sampai merasa memiliki lebih?',
    'Father, like the widow, I bring what little I have and lay it before You. Multiply it as You see fit, and help me trust Your timing even when the jars still look empty. Amen.', 'Bapa, seperti janda itu, aku membawa sedikit yang kupunya dan meletakkannya di hadapan-Mu. Lipatgandakanlah sesuai kehendak-Mu, dan tolong aku percaya pada waktu-Mu meski buli-buli itu masih terlihat kosong. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '2 Kings 4:6-7', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '2 Raja-raja 4:6-7', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Fed Without a Barn', 'Diberi Makan Tanpa Lumbung',
    'Jesus'' words about the birds of the air are so familiar they can slide right past us, especially when what we actually need is money for rent. ''Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?'' It sounds gentle almost to the point of being unhelpful — birds don''t have mortgages. But the point Jesus is making is not that worry is unnecessary because problems are small. It''s that our worth to the Father is not measured by our net worth.

Notice what the birds don''t have: no barns, no storage, no savings account, no financial planning. And yet they are fed, day after day, by a Father who notices even a sparrow''s fall. Jesus is not suggesting we should be careless with money or stop looking for work. In the same passage He assumes people will indeed ''seek first the kingdom of God'' with active, ongoing effort. What He is dismantling is the anxious belief that our security ultimately rests on our own storage systems rather than on His attentive care.

For many of us in financial hardship, this hits a nerve precisely because we do feel like birds without barns — we have nothing stored away, no cushion, no backup plan. And yet that is exactly the condition Jesus describes as already, currently, being provided for. The absence of a safety net is not evidence that God has stopped watching. It may simply be the season in which His care is more visible precisely because we have nothing else to credit it to.

This is not a promise that every bill gets paid exactly on time or that hardship magically disappears. It is a reorientation: value is not something we earn through savings, and being fed does not require a barn. Today, try noticing the small, unremarkable ways you were fed — a meal, an unexpected kindness, a bill that came in lower than feared. These are not proof that hardship is over. They are proof that the Father who feeds the birds has not looked away from you.', 'Perkataan Yesus tentang burung-burung di udara begitu akrab sehingga bisa lewat begitu saja tanpa kita sadari, terutama ketika yang benar-benar kita butuhkan adalah uang untuk membayar sewa. ''Pandanglah burung-burung di langit, yang tidak menabur dan tidak menuai dan tidak mengumpulkan bekal dalam lumbung, namun diberi makan oleh Bapamu yang di sorga. Bukankah kamu jauh lebih berharga dari pada burung-burung itu?'' Terdengar begitu lembut hingga hampir terasa kurang membantu — burung tidak punya cicilan rumah. Tetapi maksud Yesus bukanlah bahwa kekhawatiran tidak perlu karena masalahnya kecil. Maksud-Nya adalah bahwa nilai kita di mata Bapa tidak diukur dari kekayaan bersih kita.

Perhatikan apa yang tidak dimiliki burung-burung itu: tidak ada lumbung, tidak ada penyimpanan, tidak ada tabungan, tidak ada perencanaan keuangan. Namun mereka diberi makan, hari demi hari, oleh Bapa yang bahkan memperhatikan seekor burung pipit yang jatuh. Yesus tidak menyarankan kita untuk sembarangan dengan uang atau berhenti mencari pekerjaan. Dalam bagian yang sama Ia mengandaikan orang akan tetap ''mencari dahulu Kerajaan Allah'' dengan usaha yang aktif dan terus-menerus. Yang Ia bongkar adalah keyakinan yang cemas bahwa keamanan kita pada akhirnya bertumpu pada sistem penyimpanan kita sendiri, bukan pada perhatian-Nya yang penuh kasih.

Bagi banyak dari kita yang mengalami kesulitan keuangan, ini terasa menyentuh karena kita memang merasa seperti burung tanpa lumbung — tidak ada yang tersimpan, tidak ada cadangan, tidak ada rencana cadangan. Namun itu justru kondisi yang digambarkan Yesus sedang, saat ini juga, tercukupi. Tidak adanya jaring pengaman bukan bukti bahwa Tuhan berhenti memperhatikan. Itu mungkin justru musim ketika perhatian-Nya lebih terlihat jelas, tepatnya karena kita tidak punya hal lain untuk dikreditkan atasnya.

Ini bukan janji bahwa setiap tagihan akan terbayar tepat waktu atau bahwa kesulitan akan lenyap secara ajaib. Ini adalah penyesuaian arah pandang: nilai bukanlah sesuatu yang kita peroleh lewat tabungan, dan diberi makan tidak memerlukan lumbung. Hari ini, cobalah perhatikan cara-cara kecil dan biasa saat kamu diberi makan — sebuah hidangan, kebaikan yang tak terduga, tagihan yang ternyata lebih rendah dari yang dikhawatirkan. Ini bukan bukti bahwa kesulitan telah berakhir. Ini adalah bukti bahwa Bapa yang memberi makan burung-burung belum berpaling darimu.',
    'What is one small, unremarkable way you were ''fed'' this week that you might have overlooked?', 'Apa satu cara kecil dan biasa kamu ''diberi makan'' minggu ini yang mungkin terlewat dari perhatianmu?',
    'Father, You feed the birds without barns, and You have not forgotten me. Forgive my anxious counting, and help me see the quiet ways You are providing today. Amen.', 'Bapa, Engkau memberi makan burung-burung tanpa lumbung, dan Engkau tidak melupakan aku. Ampuni aku yang cemas menghitung-hitung, dan tolong aku melihat cara-cara tenang Engkau menyediakan hari ini. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Matthew 6:26', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Matius 6:26', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Not Once Forsaken', 'Tidak Pernah Ditinggalkan',
    'David, looking back over a long life full of both triumph and real trouble, writes something startling in Psalm 37: ''I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread.'' This is not a naive claim from someone who never struggled — David spent years running from Saul in wilderness caves, and later watched his own kingdom nearly collapse. He is not saying hardship never touched him. He is saying that across a lifetime, he never saw God''s fundamental faithfulness fail.

This verse is best read as testimony, not as a guarantee with no exceptions — Scripture elsewhere is honest about righteous people who suffered deeply, including financially. But testimony matters. David is offering the accumulated evidence of a long life: a pattern he watched hold, season after season, even when any single day might have looked bleak. Hope in hardship is often built less on a single dramatic rescue and more on this kind of long-view pattern-noticing — the willingness to say, ''looking back, I can see God did not actually abandon me, even in the seasons it felt like He had.''

Many of us are still in the middle of our story, unable yet to say with David''s confidence, ''I have never seen it.'' That is honest, and it is okay. But it is worth borrowing his eyes for a moment — not to deny the present difficulty, but to trust that we are somewhere in the middle of a pattern that, viewed from far enough ahead, tends to look like faithfulness rather than abandonment.

If you have older believers in your life — a grandmother, a mentor, a pastor who has walked through decades of both plenty and want — ask them what they have seen. Their answer is often some version of David''s: hardship, yes, plenty of it, but not forsakenness. Not the end of the story being ruin. Let their long view lend you courage for your shorter one.', 'Daud, menoleh ke belakang atas hidup yang panjang penuh kemenangan sekaligus kesulitan nyata, menulis sesuatu yang mengejutkan dalam Mazmur 37: ''Dahulu aku muda, sekarang telah menjadi tua, tetapi tidak pernah kulihat orang benar ditinggalkan, atau anak cucunya meminta-minta roti.'' Ini bukan pernyataan naif dari seseorang yang tidak pernah bergumul — Daud bertahun-tahun melarikan diri dari Saul di gua-gua padang gurun, dan kemudian menyaksikan kerajaannya sendiri hampir runtuh. Ia tidak mengatakan kesulitan tidak pernah menyentuhnya. Ia mengatakan bahwa sepanjang hidupnya, ia tidak pernah melihat kesetiaan dasar Tuhan gagal.

Ayat ini paling baik dibaca sebagai kesaksian, bukan jaminan tanpa pengecualian — bagian lain Alkitab jujur tentang orang benar yang menderita dalam-dalam, termasuk secara finansial. Namun kesaksian itu penting. Daud menawarkan bukti terkumpul dari hidup yang panjang: sebuah pola yang ia saksikan bertahan, musim demi musim, bahkan ketika satu hari tertentu mungkin terlihat suram. Harapan di tengah kesulitan sering kali dibangun bukan dari satu pertolongan dramatis, melainkan dari cara memandang jauh ke belakang semacam ini — kesediaan untuk berkata, ''menoleh ke belakang, aku bisa melihat Tuhan sebenarnya tidak meninggalkanku, bahkan di musim yang terasa seperti itu.''

Banyak dari kita masih berada di tengah kisah kita sendiri, belum bisa berkata dengan keyakinan Daud, ''aku tidak pernah melihatnya.'' Itu jujur, dan tidak apa-apa. Tetapi ada baiknya kita meminjam sudut pandangnya sejenak — bukan untuk menyangkal kesulitan yang sedang dihadapi, melainkan untuk percaya bahwa kita berada di suatu titik tengah dari sebuah pola yang, dilihat dari jauh cukup ke depan, cenderung terlihat seperti kesetiaan, bukan pengabaian.

Jika kamu memiliki orang percaya yang lebih tua dalam hidupmu — seorang nenek, mentor, atau gembala yang telah melewati puluhan tahun baik dalam kelimpahan maupun kekurangan — tanyakan apa yang telah mereka saksikan. Jawaban mereka sering kali adalah versi dari kata-kata Daud: kesulitan, ya, banyak, tetapi bukan pengabaian. Bukan akhir kisah yang berupa kehancuran. Biarkan pandangan panjang mereka meminjamkan keberanian bagi pandanganmu yang lebih pendek.',
    'Who in your life has walked a long road and can testify to God''s faithfulness across seasons of both plenty and want?', 'Siapa dalam hidupmu yang telah menempuh jalan panjang dan dapat bersaksi tentang kesetiaan Tuhan melintasi musim kelimpahan maupun kekurangan?',
    'Lord, I am still in the middle of my story, and today it is hard to see the pattern. Lend me the long view. Remind me that You have not forsaken those who trust You, and I am not the exception. Amen.', 'Tuhan, aku masih berada di tengah kisahku, dan hari ini sulit untuk melihat polanya. Pinjamkan aku pandangan yang jauh. Ingatkan aku bahwa Engkau tidak meninggalkan orang yang percaya kepada-Mu, dan aku bukanlah pengecualian. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 37:25', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 37:25', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Leaning, Not Leaping', 'Bersandar, Bukan Melompat',
    'We end this week with words many of us learned as children and have leaned on as adults precisely because they hold up under real pressure: ''Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'' Financial hardship has a way of making us feel we should be able to think our way out — if we could just find the right budget, the right side job, the right decision, the pressure would lift. Sometimes practical wisdom does help. But Proverbs is pointing at something underneath our strategies: where our deepest trust actually rests.

Notice the word ''lean.'' Not ''ignore'' your own understanding — leaning implies weight is still there, still real, still worth engaging with wisdom and effort. But leaning also implies that our understanding is not meant to hold the full weight of our security on its own. When we lean entirely on our own grasp of the situation — our calculations of what''s possible, our read on how bad things might get — we end up carrying weight we were never designed to carry alone.

''In all your ways submit to him'' is not a passive phrase. It''s an active, ongoing posture: bringing our financial decisions, our fears, our budget spreadsheets, our job applications, into conversation with God rather than working them out in isolation and only praying about the outcome afterward. Hope beyond circumstances is not hope that ignores the circumstances. It is hope that keeps bringing the circumstances back to God, again and tomorrow and the day after, rather than trying to white-knuckle a solution alone.

As this week closes, the invitation is simple and hard at once: trust with all your heart, not half of it held back in case God doesn''t come through. Lean, don''t carry alone. Submit your ways — the practical ones, the anxious ones, the ones you haven''t figured out yet — and trust that the God who fed a widow''s household, who feeds birds without barns, and who has never truly forsaken the righteous, is still straightening a path you cannot yet fully see.', 'Kita mengakhiri minggu ini dengan kata-kata yang banyak dari kita pelajari sejak kecil dan sandari sebagai orang dewasa, justru karena kata-kata ini teruji di bawah tekanan yang nyata: ''Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.'' Kesulitan keuangan punya cara membuat kita merasa harus bisa berpikir untuk keluar darinya — jika saja kita menemukan anggaran yang tepat, pekerjaan sampingan yang tepat, keputusan yang tepat, tekanan itu akan hilang. Kadang kebijaksanaan praktis memang membantu. Tetapi Amsal menunjuk sesuatu di balik strategi kita: di mana sebenarnya kepercayaan terdalam kita bertumpu.

Perhatikan kata ''bersandar.'' Bukan ''abaikan'' pengertianmu sendiri — bersandar menyiratkan beban itu masih ada, masih nyata, masih layak dihadapi dengan kebijaksanaan dan usaha. Tetapi bersandar juga menyiratkan bahwa pengertian kita tidak dimaksudkan untuk menanggung seluruh beban keamanan kita sendirian. Ketika kita sepenuhnya bersandar pada pemahaman kita sendiri tentang keadaan — perhitungan kita tentang apa yang mungkin, perkiraan kita tentang seberapa buruk keadaan bisa jadi — kita akhirnya memikul beban yang sebenarnya tidak dirancang untuk kita pikul sendirian.

''Akuilah Dia dalam segala lakumu'' bukanlah ungkapan yang pasif. Ini adalah sikap yang aktif dan terus-menerus: membawa keputusan keuangan kita, ketakutan kita, lembar anggaran kita, lamaran pekerjaan kita, ke dalam percakapan dengan Tuhan, alih-alih mengerjakannya sendirian dan baru berdoa tentang hasilnya belakangan. Harapan di atas keadaan bukanlah harapan yang mengabaikan keadaan. Itu adalah harapan yang terus membawa kembali keadaan itu kepada Tuhan, lagi dan besok dan lusa, alih-alih berusaha keras mencari solusi sendirian.

Saat minggu ini berakhir, undangannya sederhana sekaligus sulit: percaya dengan segenap hatimu, bukan separuh yang ditahan berjaga-jaga andai Tuhan tidak menepati. Bersandarlah, jangan memikul sendirian. Akuilah jalan-jalanmu — yang praktis, yang cemas, yang belum kamu temukan jawabannya — dan percayalah bahwa Allah yang memberi makan keluarga seorang janda, yang memberi makan burung tanpa lumbung, dan yang tidak pernah benar-benar meninggalkan orang benar, masih meluruskan jalan yang belum sepenuhnya bisa kamu lihat.',
    'In what specific financial decision this week could you ''lean less'' on your own calculations and bring it more openly to God?', 'Dalam keputusan keuangan spesifik apa minggu ini kamu bisa ''lebih sedikit bersandar'' pada perhitunganmu sendiri dan membawanya lebih terbuka kepada Tuhan?',
    'Lord, I bring You my budget, my worries, and my unfinished plans. I don''t want to carry this weight alone anymore. Straighten the path I cannot yet see, and help me trust You with all my heart, not just the calm parts. Amen.', 'Tuhan, aku membawa kepada-Mu anggaranku, kekhawatiranku, dan rencana-rencanaku yang belum selesai. Aku tidak mau lagi memikul beban ini sendirian. Luruskanlah jalan yang belum bisa kulihat, dan tolong aku mempercayai-Mu dengan segenap hatiku, bukan hanya bagian yang tenang. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Proverbs 3:5-6', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Amsal 3:5-6', 'TB', 1);

  -- Plan: When the Road Seems Closed
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'When the Road Seems Closed',
    'Ketika Jalan Tampak Tertutup',
    'Seven days of hope for situations that look genuinely impossible',
    'Tujuh Hari Berpengharapan untuk Keadaan yang Tampak Mustahil',
    7,
    'For the seasons when every door seems shut, every option exhausted, and the situation looks, by any honest measure, impossible — this seven-day plan walks through Scripture''s most direct promises about God''s power to work where human strength has run out. It does not offer easy answers, but it offers a steady companion for the waiting: a God who specializes in roads that did not exist until He made them.',
    'Untuk musim ketika setiap pintu tampak tertutup, setiap pilihan telah habis, dan keadaan tampak, dengan penilaian yang jujur, mustahil — renungan tujuh hari ini menelusuri janji-janji Alkitab yang paling langsung tentang kuasa Tuhan untuk bekerja di tempat kekuatan manusia telah habis. Renungan ini tidak menawarkan jawaban instan, tetapi menawarkan pendamping yang teguh bagi masa penantian: Allah yang ahli membuka jalan yang belum ada sebelum Ia menciptakannya.',
    '/images/devotions/when-the-road-seems-closed.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'A Future You Cannot Yet See', 'Masa Depan yang Belum Bisa Kamu Lihat',
    'Jeremiah 29:11 is quoted so often it risks becoming wallpaper, but its original context makes it far more startling than a greeting-card verse. God speaks these words to the Israelites in exile in Babylon — a people who had lost their homeland, their temple, and any realistic hope of return within their own lifetimes. ''For I know the plans I have for you,'' declares the Lord, ''plans to prosper you and not to harm you, plans to give you hope and a future.'' This was not spoken into comfort. It was spoken into exile.

That context matters enormously for anyone facing a situation that looks genuinely impossible. The people receiving this promise were not told their captivity would end tomorrow — in fact, the same letter tells them to settle in, build houses, and plant gardens, because the exile would last seventy years. God''s promise of a future and a hope was not a promise of an immediate exit. It was an assurance that even inside a season with no visible way out, God''s intentions toward them remained good.

When a road looks closed — a diagnosis, a legal situation, a relationship, a calling that seems permanently blocked — it is tempting to read the silence as absence. Jeremiah''s audience could easily have concluded that God had lost interest in them once the temple fell. Instead, God specifically identifies Himself as the one holding a plan they cannot yet see, for a future they cannot yet picture. Not knowing the plan is not the same as there being no plan.

This week, we are not asking God to show us the whole road at once. We are asking for the courage to trust that He knows it, even from inside a stretch of the path that looks, honestly, like a dead end. That trust does not require pretending the difficulty isn''t real. It requires believing that the same God who spoke hope into Babylon has not run out of ways to bring a future out of what currently looks closed.', 'Yeremia 29:11 begitu sering dikutip sehingga berisiko menjadi hiasan dinding belaka, tetapi konteks aslinya membuatnya jauh lebih mengejutkan daripada sekadar ayat kartu ucapan. Tuhan mengucapkan kata-kata ini kepada orang Israel yang dibuang di Babel — umat yang telah kehilangan tanah air, bait suci, dan harapan realistis untuk kembali dalam hidup mereka sendiri. ''Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.'' Ini tidak diucapkan ke dalam kenyamanan. Ini diucapkan ke dalam pembuangan.

Konteks itu sangat penting bagi siapa pun yang menghadapi keadaan yang tampak benar-benar mustahil. Umat yang menerima janji ini tidak diberitahu bahwa penawanan mereka akan berakhir esok hari — bahkan, surat yang sama menyuruh mereka untuk menetap, membangun rumah, dan menanam kebun, karena pembuangan itu akan berlangsung tujuh puluh tahun. Janji Tuhan tentang hari depan dan harapan bukanlah janji jalan keluar yang segera. Itu adalah jaminan bahwa bahkan di dalam musim tanpa jalan keluar yang terlihat, maksud Tuhan terhadap mereka tetap baik.

Ketika sebuah jalan tampak tertutup — sebuah diagnosis, situasi hukum, sebuah hubungan, atau panggilan yang tampak terhalang permanen — kita tergoda untuk membaca kesunyian sebagai ketiadaan. Pendengar Yeremia bisa saja dengan mudah menyimpulkan bahwa Tuhan kehilangan minat pada mereka setelah bait suci runtuh. Sebaliknya, Tuhan secara khusus mengidentifikasi diri-Nya sebagai yang memegang rencana yang belum bisa mereka lihat, bagi hari depan yang belum bisa mereka bayangkan. Tidak mengetahui rencananya bukan berarti tidak ada rencana.

Minggu ini, kita tidak meminta Tuhan menunjukkan seluruh jalan sekaligus. Kita meminta keberanian untuk percaya bahwa Dia mengetahuinya, bahkan dari dalam bentangan jalan yang, sejujurnya, tampak seperti jalan buntu. Kepercayaan itu tidak menuntut kita berpura-pura kesulitan itu tidak nyata. Kepercayaan itu menuntut kita percaya bahwa Allah yang sama, yang berbicara tentang harapan ke dalam Babel, belum kehabisan cara untuk mendatangkan hari depan dari apa yang saat ini tampak tertutup.',
    'Where have you mistaken God''s silence for His absence?', 'Di mana kamu keliru mengira kesunyian Tuhan sebagai ketidakhadiran-Nya?',
    'Lord, my road looks closed and I cannot see past this stretch of it. Help me trust that You hold a plan I cannot yet picture, even from here. Amen.', 'Tuhan, jalanku tampak tertutup dan aku tidak bisa melihat melampaui bentangan ini. Tolong aku percaya bahwa Engkau memegang rencana yang belum bisa kubayangkan, bahkan dari sini. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Jeremiah 29:11', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yeremia 29:11', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Rejoicing Before the Fig Tree Blooms', 'Bersukacita Sebelum Pohon Ara Berbunga',
    'Habakkuk was a prophet living through the slow, sickening approach of a national disaster — the coming Babylonian invasion. He does not pretend otherwise. In the closing verses of his short book, he catalogs total agricultural failure: no blossom on the fig trees, no grapes on the vines, no olives, no food in the fields, no cattle in the stalls. This is not metaphorical hardship. This is every ordinary source of security and survival failing at once, all at the same time, with no exceptions listed.

And then, in the very next breath, Habakkuk writes one of the most defiant sentences in all of Scripture: ''yet I will rejoice in the Lord, I will be joyful in God my Savior.'' Not ''I will rejoice once the harvest recovers.'' Not ''I will trust once I understand why this is happening.'' The rejoicing is placed deliberately before any change in circumstance — in fact, immediately after describing circumstances with nothing left to be grateful for on the surface.

This is not denial. Habakkuk spends the rest of his book wrestling honestly with God about injustice and suffering; his hope was hard-won, not naive. What he demonstrates here is that joy in God does not have to wait for evidence in the field. It can be rooted in who God is — ''God my Savior'' — rather than in what the current season provides. That distinction is the whole difference between hope that depends on circumstances and hope that survives them.

If your own fig tree is not blossoming right now — your finances, your health, your family situation, your sense of direction — Habakkuk gives permission to name that honestly, in the same breath as choosing to rejoice anyway. Not because the failure doesn''t matter, but because the Savior it''s aimed at is bigger than any single harvest.', 'Habakuk adalah nabi yang hidup di tengah mendekatnya bencana nasional secara perlahan dan menakutkan — invasi Babel yang akan datang. Ia tidak berpura-pura sebaliknya. Dalam ayat-ayat penutup kitabnya yang singkat, ia mencatat kegagalan pertanian total: tidak ada bunga pada pohon ara, tidak ada buah pada pohon anggur, tidak ada zaitun, tidak ada makanan di ladang, tidak ada ternak di kandang. Ini bukan kesulitan kiasan. Ini adalah setiap sumber keamanan dan kelangsungan hidup yang biasa, gagal secara bersamaan, tanpa pengecualian yang disebutkan.

Dan kemudian, dalam napas berikutnya, Habakuk menulis salah satu kalimat paling gagah berani dalam seluruh Alkitab: ''namun aku akan bersorak-sorak di dalam TUHAN, beria-ria di dalam Allah yang menyelamatkan aku.'' Bukan ''aku akan bersukacita setelah panen pulih.'' Bukan ''aku akan percaya setelah aku memahami mengapa ini terjadi.'' Sukacita itu diletakkan dengan sengaja sebelum ada perubahan keadaan — bahkan, tepat setelah menggambarkan keadaan yang secara lahiriah tidak menyisakan apa pun untuk disyukuri.

Ini bukan penyangkalan. Habakuk menghabiskan sisa kitabnya bergumul dengan jujur bersama Tuhan tentang ketidakadilan dan penderitaan; harapannya diperoleh dengan susah payah, bukan naif. Yang ia tunjukkan di sini adalah bahwa sukacita di dalam Tuhan tidak harus menunggu bukti di ladang. Sukacita itu bisa berakar pada siapa Tuhan itu — ''Allah yang menyelamatkan aku'' — bukan pada apa yang disediakan musim saat ini. Perbedaan itulah seluruh perbedaan antara harapan yang bergantung pada keadaan dan harapan yang bertahan melampauinya.

Jika pohon aramu sendiri tidak sedang berbunga sekarang — keuanganmu, kesehatanmu, keadaan keluargamu, arah hidupmu — Habakuk memberi izin untuk menyebutkan itu dengan jujur, dalam napas yang sama dengan memilih untuk tetap bersukacita. Bukan karena kegagalan itu tidak penting, tetapi karena Juru Selamat yang dituju jauh lebih besar dari satu musim panen mana pun.',
    'What is your ''fig tree'' right now — the thing that hasn''t blossomed — and can you name it honestly while still choosing to rejoice?', 'Apa ''pohon ara''-mu saat ini — hal yang belum berbunga — dan bisakah kamu menyebutnya dengan jujur sambil tetap memilih bersukacita?',
    'God my Savior, my fields look empty right now. Teach me Habakkuk''s defiant joy — not denial, but rejoicing in who You are even before my circumstances change. Amen.', 'Allah, Juru Selamatku, ladangku terasa kosong sekarang. Ajari aku sukacita Habakuk yang gagah berani — bukan penyangkalan, melainkan bersukacita di dalam siapa Engkau, bahkan sebelum keadaanku berubah. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Habakkuk 3:17-18', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Habakuk 3:17-18', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Working Even Here', 'Bekerja Bahkan di Sini',
    'Romans 8:28 is another verse familiar enough to be misread. Paul does not write that all things are good, or that all things feel good, or that suffering doesn''t count as real loss. He writes something more precise: ''And we know that in all things God works for the good of those who love him, who have been called according to his purpose.'' The claim is about God''s active work within circumstances, not a claim that the circumstances themselves are secretly fine.

This distinction protects the verse from becoming a way of minimizing real pain. A job loss is a real loss. A broken relationship is a real fracture. An illness is a real illness. Paul is not asking us to relabel these as blessings in disguise. He is saying that God is present and working inside them — weaving purpose through loss rather than erasing the loss itself. The ''good'' in view is often not the reversal of the hardship, but something being formed in us, or through us, that we could not see clearly from outside the hardship.

It is worth noting who this promise is for: ''those who love him, who have been called according to his purpose.'' This is not a universal law that guarantees every situation resolves neatly for everyone. It is a relational promise — an assurance that for those walking with God, nothing that happens to them falls outside His ability to weave it toward something purposeful, even when the immediate event is genuinely bad.

If your road looks closed today, this verse does not ask you to pretend it isn''t. It asks you to trust that God is not standing outside this closed road watching helplessly. He is working within it — in ways you may only be able to name looking back, the way Joseph, sold into slavery by his own brothers, could only later say to them, ''you intended to harm me, but God intended it for good.'' The hardship was real. So was the God working inside it.', 'Roma 8:28 adalah ayat lain yang cukup akrab hingga sering disalahpahami. Paulus tidak menulis bahwa segala sesuatu itu baik, atau bahwa segala sesuatu terasa baik, atau bahwa penderitaan bukanlah kehilangan yang nyata. Ia menulis sesuatu yang lebih tepat: ''Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.'' Pernyataan itu tentang karya aktif Tuhan di dalam keadaan, bukan pernyataan bahwa keadaan itu sendiri diam-diam baik-baik saja.

Perbedaan ini melindungi ayat ini agar tidak menjadi cara meremehkan penderitaan yang nyata. Kehilangan pekerjaan adalah kehilangan yang nyata. Hubungan yang rusak adalah keretakan yang nyata. Penyakit adalah penyakit yang nyata. Paulus tidak meminta kita melabeli ulang hal-hal ini sebagai berkat yang tersamar. Ia berkata bahwa Tuhan hadir dan bekerja di dalamnya — menenun maksud melalui kehilangan itu, bukan menghapus kehilangan itu sendiri. ''Kebaikan'' yang dimaksud sering kali bukan pembalikan kesulitan, melainkan sesuatu yang sedang dibentuk dalam diri kita, atau melalui kita, yang tidak bisa kita lihat jelas dari luar kesulitan itu.

Penting dicatat untuk siapa janji ini berlaku: ''bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.'' Ini bukan hukum universal yang menjamin setiap keadaan terselesaikan rapi bagi semua orang. Ini adalah janji relasional — jaminan bahwa bagi mereka yang berjalan bersama Tuhan, tidak ada yang terjadi pada mereka yang berada di luar kemampuan-Nya untuk menenunnya menjadi sesuatu yang bermaksud, bahkan ketika peristiwa yang langsung dialami benar-benar buruk.

Jika jalanmu tampak tertutup hari ini, ayat ini tidak memintamu berpura-pura tidak demikian. Ayat ini memintamu percaya bahwa Tuhan tidak berdiri di luar jalan yang tertutup ini sambil menonton tanpa daya. Ia sedang bekerja di dalamnya — dengan cara yang mungkin baru bisa kamu sebutkan saat menoleh ke belakang, seperti Yusuf, yang dijual sebagai budak oleh saudara-saudaranya sendiri, baru kemudian bisa berkata kepada mereka, ''kamu telah mereka-rekakan kejahatan terhadap aku, tetapi Allah telah mereka-rekakannya untuk kebaikan.'' Kesulitan itu nyata. Begitu pula Tuhan yang bekerja di dalamnya.',
    'Can you name a past hardship where, only in hindsight, you can see God was working something purposeful inside it?', 'Bisakah kamu menyebutkan kesulitan masa lalu di mana, hanya dengan menoleh ke belakang, kamu bisa melihat Tuhan sedang mengerjakan sesuatu yang bermaksud di dalamnya?',
    'Father, I don''t ask You to make this hardship feel good. I ask You to keep working within it, weaving purpose through what feels broken. Help me trust Your presence here, even before I can see the good. Amen.', 'Bapa, aku tidak meminta-Mu membuat kesulitan ini terasa baik. Aku meminta-Mu untuk terus bekerja di dalamnya, menenun maksud melalui apa yang terasa rusak. Tolong aku mempercayai kehadiran-Mu di sini, bahkan sebelum aku bisa melihat kebaikannya. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 8:28', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 8:28', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Nothing Is Impossible', 'Tidak Ada yang Mustahil',
    'The angel Gabriel speaks these words to Mary at the most improbable moment of her young life: she has just been told, as an unmarried virgin, that she will conceive and bear the Son of God. Her honest question — ''how will this be, since I am a virgin?'' — is met not with an explanation that resolves the biology, but with a statement about God''s nature: ''For no word from God will ever fail,'' or as it is often rendered, ''nothing is impossible with God.''

It''s worth sitting with the fact that Mary''s question was not faithless. It was reasonable. She was pointing at a real, physical impossibility. The angel''s answer does not deny that impossibility on human terms — it simply asserts that human terms are not the only terms in play. This is the pattern all through Scripture with situations that look closed: the closedness is real by every ordinary measure, and God''s ability to act is not limited by ordinary measures.

Mary''s response afterward is instructive too: ''I am the Lord''s servant... may your word to me be fulfilled.'' She does not receive a full explanation of how the impossibility will be resolved. She receives the character of the One promising it, and she consents to trust Him with the mechanics she cannot see. That posture — not needing to understand the how before trusting the who — is often exactly what a closed road requires of us.

If your own situation involves a word from God, a promise, a sense of calling that seems to require something impossible to actually happen — a reconciliation that seems out of reach, a healing, a provision, a door that by every visible measure is shut — Gabriel''s answer to Mary still stands for you. Not a denial of the difficulty. A declaration that difficulty and impossibility are not the final authority over what God can do.', 'Malaikat Gabriel mengucapkan kata-kata ini kepada Maria pada saat yang paling tidak mungkin dalam hidup mudanya: ia baru saja diberitahu, sebagai seorang perawan yang belum menikah, bahwa ia akan mengandung dan melahirkan Anak Allah. Pertanyaannya yang jujur — ''bagaimana hal itu mungkin terjadi, karena aku belum bersuami?'' — dijawab bukan dengan penjelasan yang menyelesaikan persoalan biologis, melainkan dengan pernyataan tentang sifat Allah: ''Sebab bagi Allah tidak ada yang mustahil.''

Penting direnungkan bahwa pertanyaan Maria bukanlah pertanyaan yang tidak percaya. Itu pertanyaan yang masuk akal. Ia menunjuk pada kemustahilan fisik yang nyata. Jawaban malaikat itu tidak menyangkal kemustahilan itu menurut ukuran manusia — ia hanya menegaskan bahwa ukuran manusia bukan satu-satunya ukuran yang berlaku. Inilah pola di sepanjang Alkitab dengan keadaan yang tampak tertutup: ketertutupan itu nyata menurut segala ukuran biasa, dan kemampuan Tuhan untuk bertindak tidak dibatasi oleh ukuran-ukuran biasa itu.

Tanggapan Maria sesudahnya juga mengajarkan sesuatu: ''Sesungguhnya aku ini hamba Tuhan; jadilah padaku menurut perkataanmu itu.'' Ia tidak menerima penjelasan lengkap tentang bagaimana kemustahilan itu akan diselesaikan. Ia menerima karakter Dia yang menjanjikannya, dan ia setuju mempercayakan mekanismenya yang tak terlihat kepada-Nya. Sikap itu — tidak perlu memahami bagaimananya sebelum mempercayai siapanya — sering kali justru itulah yang dituntut oleh jalan yang tertutup dari kita.

Jika keadaanmu sendiri melibatkan sebuah firman dari Tuhan, sebuah janji, rasa panggilan yang tampaknya membutuhkan sesuatu yang mustahil untuk benar-benar terjadi — pemulihan hubungan yang tampak di luar jangkauan, kesembuhan, penyediaan, pintu yang menurut segala ukuran yang terlihat tertutup — jawaban Gabriel kepada Maria tetap berlaku bagimu. Bukan penyangkalan atas kesulitan itu. Sebuah pernyataan bahwa kesulitan dan kemustahilan bukanlah otoritas terakhir atas apa yang bisa Tuhan lakukan.',
    'What impossibility are you being asked to trust God with, without needing to see the mechanics first?', 'Kemustahilan apa yang sedang diminta darimu untuk kamu percayakan kepada Tuhan, tanpa perlu melihat mekanismenya terlebih dahulu?',
    'Lord, like Mary, I bring You an honest ''how can this be'' alongside my willingness to trust You anyway. You are not limited by what looks impossible to me. Let it be to me according to Your word. Amen.', 'Tuhan, seperti Maria, aku membawa kepada-Mu pertanyaan jujur ''bagaimana ini mungkin terjadi'' sekaligus kesediaanku untuk tetap mempercayai-Mu. Engkau tidak dibatasi oleh apa yang tampak mustahil bagiku. Jadilah padaku menurut firman-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Luke 1:37', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lukas 1:37', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'A Way in the Wilderness', 'Jalan di Padang Gurun',
    'Isaiah speaks to a people about to be delivered from exile, and he chooses a striking image for what God is about to do: ''See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.'' The image is deliberately impossible — wilderness, by definition, has no road, and wasteland, by definition, has no water. God is not describing improvement to an existing path. He is describing a path where there was categorically none.

This matters for situations that feel not just hard but structurally impossible — not a difficult road, but no road at all. A relationship with no visible path to repair. A grief with no visible path through it. A financial hole with no visible path out. Isaiah''s language does not pretend the wilderness isn''t a wilderness. It insists that God''s specialty is precisely making ways where human maps show none.

Notice the invitation embedded in the question ''do you not perceive it?'' This suggests God''s new thing can begin quietly, springing up before it is fully visible or provable. We are not always shown the whole finished road in advance — sometimes we are asked to notice the first green shoot of something new emerging even while the wilderness around it still looks, in every other direction, like wilderness.

If you are currently standing in a wasteland — a situation with no obvious next step, no visible resource, no clear path forward — this verse does not promise the wilderness will vanish overnight. It promises that wilderness is exactly the terrain God specializes in. Streams in the wasteland are not a metaphor for things being easy. They are a metaphor for God supplying what the landscape itself cannot.', 'Yesaya berbicara kepada umat yang akan segera dibebaskan dari pembuangan, dan ia memilih gambaran yang mencolok untuk apa yang akan Tuhan lakukan: ''Lihat, hal-hal yang dahulu telah terjadi, dan hal-hal yang baru Kuberitahukan; sebelum hal-hal itu muncul, Aku mengabarkannya kepadamu... Sesungguhnya Aku hendak membuat suatu hal yang baru... Aku hendak membuat jalan di padang gurun dan sungai-sungai di padang belantara.'' Gambaran ini sengaja dibuat mustahil — padang gurun, menurut definisinya, tidak memiliki jalan, dan padang belantara, menurut definisinya, tidak memiliki air. Tuhan tidak menggambarkan perbaikan pada jalan yang sudah ada. Ia menggambarkan sebuah jalan di tempat yang sama sekali tidak ada jalan.

Ini penting bagi keadaan yang terasa bukan hanya sulit tetapi mustahil secara struktural — bukan jalan yang sulit, melainkan sama sekali tidak ada jalan. Sebuah hubungan tanpa jalan pemulihan yang terlihat. Sebuah kedukaan tanpa jalan yang terlihat untuk melaluinya. Lubang keuangan tanpa jalan keluar yang terlihat. Bahasa Yesaya tidak berpura-pura padang gurun itu bukan padang gurun. Ia menegaskan bahwa keahlian Tuhan justru membuat jalan di tempat peta manusia tidak menunjukkan apa-apa.

Perhatikan undangan yang tersirat dalam pertanyaan ''tidakkah kamu menyadarinya?'' Ini menunjukkan bahwa hal baru dari Tuhan bisa mulai secara diam-diam, muncul sebelum sepenuhnya terlihat atau terbukti. Kita tidak selalu diperlihatkan seluruh jalan yang sudah jadi sebelumnya — kadang kita diminta memperhatikan tunas hijau pertama dari sesuatu yang baru muncul, bahkan ketika padang gurun di sekelilingnya masih tampak, dari segala arah lain, seperti padang gurun.

Jika kamu saat ini sedang berdiri di padang belantara — keadaan tanpa langkah berikutnya yang jelas, tanpa sumber daya yang terlihat, tanpa jalan ke depan yang jelas — ayat ini tidak menjanjikan padang gurun itu akan lenyap dalam semalam. Ayat ini menjanjikan bahwa padang gurun justru medan yang menjadi keahlian Tuhan. Sungai-sungai di padang belantara bukanlah kiasan bahwa segalanya menjadi mudah. Itu adalah kiasan bahwa Tuhan menyediakan apa yang tidak bisa disediakan oleh lanskap itu sendiri.',
    'Is there a small, easy-to-miss sign of a ''new thing springing up'' in your wilderness that you haven''t yet named?', 'Adakah tanda kecil, yang mudah terlewat, dari ''hal baru yang bertumbuh'' di padang gurunmu, yang belum kamu sadari?',
    'Lord, this feels like a wilderness with no road. Thank You that You specialize in exactly this terrain. Open my eyes to the first small signs of the new thing You are already doing. Amen.', 'Tuhan, ini terasa seperti padang gurun tanpa jalan. Terima kasih karena Engkau ahli justru dalam medan seperti ini. Bukalah mataku untuk melihat tanda-tanda kecil pertama dari hal baru yang sedang Engkau kerjakan. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 43:19', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 43:19', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'With God, All Things', 'Bagi Allah, Segala Perkara Mungkin',
    'The disciples'' question after Jesus tells the rich young ruler to sell his possessions is a very human one: ''Who then can be saved?'' They have just watched a genuinely good, wealthy, sincere man walk away sad, unable to let go of what stood between him and following Jesus. If that man couldn''t do it, what hope did anyone have? Jesus looks at them and gives an answer that reframes the whole question: ''With man this is impossible, but not with God; all things are possible with God.''

It is worth noticing that Jesus doesn''t argue the disciples'' assessment was wrong. He agrees it''s impossible — ''with man this is impossible.'' He does not soften the difficulty or claim it was actually manageable all along. What He changes is the subject doing the acting. The question was never really ''can a person accomplish this,'' but ''can God.'' And the answer to that question is categorically different.

This has direct bearing on any road that looks closed because of something in us as much as something outside us — an addiction that feels unbreakable, a pattern we cannot seem to change, a reconciliation that requires more forgiveness or humility than we feel capable of. Jesus does not deny these things are, humanly speaking, impossible. He relocates the hope: not in our capacity, but in God''s.

''All things are possible with God'' is not a magic formula that guarantees any specific outcome we want. It is a statement about the category God operates in — a category that includes camels through needle''s eyes, rich men freed from possessions, and roads that looked, by every human measure, permanently shut. Today, name honestly what feels impossible about your situation, and then hand the acting verb to God rather than yourself.', 'Pertanyaan para murid setelah Yesus menyuruh orang muda yang kaya untuk menjual harta miliknya adalah pertanyaan yang sangat manusiawi: ''Jika demikian, siapakah yang dapat diselamatkan?'' Mereka baru saja menyaksikan seorang yang benar-benar baik, kaya, dan tulus, pergi dengan sedih, tidak sanggup melepaskan apa yang menghalanginya mengikut Yesus. Jika orang itu tidak sanggup melakukannya, harapan apa yang dimiliki siapa pun? Yesus memandang mereka dan memberi jawaban yang membingkai ulang seluruh pertanyaan itu: ''Bagi manusia hal itu tidak mungkin, tetapi bukan demikian bagi Allah. Sebab segala sesuatu adalah mungkin bagi Allah.''

Perlu diperhatikan bahwa Yesus tidak membantah penilaian para murid itu salah. Ia setuju hal itu mustahil — ''bagi manusia hal itu tidak mungkin.'' Ia tidak melunakkan kesulitan itu atau mengklaim sebenarnya hal itu bisa ditangani sejak awal. Yang Ia ubah adalah subjek yang bertindak. Pertanyaannya sebenarnya bukan ''bisakah seseorang mencapai hal ini,'' melainkan ''bisakah Allah.'' Dan jawaban atas pertanyaan itu sama sekali berbeda.

Ini berkaitan langsung dengan jalan mana pun yang tampak tertutup karena sesuatu dalam diri kita sama seperti sesuatu di luar kita — kecanduan yang terasa tak terputuskan, pola yang tampaknya tidak bisa kita ubah, pemulihan hubungan yang membutuhkan lebih banyak pengampunan atau kerendahan hati dari yang kita rasa sanggup. Yesus tidak menyangkal bahwa hal-hal ini, secara manusiawi, mustahil. Ia memindahkan harapan itu: bukan pada kemampuan kita, melainkan pada Allah.

''Segala sesuatu adalah mungkin bagi Allah'' bukanlah rumus ajaib yang menjamin hasil tertentu yang kita inginkan. Ini adalah pernyataan tentang kategori tempat Allah bekerja — kategori yang mencakup unta melewati lubang jarum, orang kaya yang dibebaskan dari hartanya, dan jalan-jalan yang tampak, menurut segala ukuran manusiawi, tertutup permanen. Hari ini, sebutkanlah dengan jujur apa yang terasa mustahil dari keadaanmu, lalu serahkan kata kerja ''bertindak'' itu kepada Allah, bukan kepada dirimu sendiri.',
    'What feels humanly impossible in your situation, and what would it look like to hand that specific piece over to God today?', 'Apa yang terasa mustahil secara manusiawi dalam keadaanmu, dan seperti apa rasanya menyerahkan bagian spesifik itu kepada Allah hari ini?',
    'Jesus, I agree with the disciples — this looks impossible to me. But You are not limited by my limits. I hand this over to You today, trusting that with God, all things are possible. Amen.', 'Yesus, aku setuju dengan para murid — ini tampak mustahil bagiku. Tetapi Engkau tidak dibatasi oleh keterbatasanku. Aku menyerahkan hal ini kepada-Mu hari ini, percaya bahwa bagi Allah, segala sesuatu mungkin. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mark 10:27', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Markus 10:27', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'Overflowing Hope', 'Harapan yang Berlimpah-limpah',
    'We close this week with a benediction Paul writes over the Roman church, a prayer that doubles as a promise: ''May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.'' Notice the title Paul gives God here — not simply a God who provides hope occasionally, but ''the God of hope,'' as if hope is part of His essential character, His native territory, the thing He is made of.

The mechanism Paul describes is worth slowing down for. Joy and peace are given ''as you trust in him'' — not as circumstances change, but as trust is actively extended, moment by moment, toward God. And the result is not a modest, careful hope, rationed to match how likely things seem to work out. It is overflow — hope that exceeds what the visible situation would justify, because its source is not the situation but the Holy Spirit''s power working within us.

This is the note we want to end the week on, because it names something we have circled all seven days: hope beyond circumstances is not hope that denies how closed the road looks. It is hope with a different source entirely — supplied, sustained, and even overflowing, by the Spirit of the God of hope, regardless of what the road currently shows.

Wherever your road stands today — genuinely blocked, still winding through wilderness, or just beginning to show the first green shoot of something new — this benediction is prayed over you as much as it was over the Roman church. May the God of hope fill you, not according to how the circumstances look, but according to His own overflowing character. Not because the road is easy. Because He is the God of hope, and He has not stopped being that, even here.', 'Kita mengakhiri minggu ini dengan berkat yang dituliskan Paulus atas jemaat di Roma, sebuah doa yang sekaligus menjadi janji: ''Semoga Allah, sumber pengharapan, memenuhi kamu dengan segala sukacita dan damai sejahtera dalam iman kamu, supaya oleh kekuatan Roh Kudus kamu berlimpah-limpah dalam pengharapan.'' Perhatikan sebutan yang diberikan Paulus kepada Allah di sini — bukan sekadar Allah yang sesekali memberi harapan, melainkan ''sumber pengharapan,'' seolah harapan adalah bagian dari karakter dasar-Nya, wilayah asli-Nya, bahan dasar diri-Nya.

Mekanisme yang digambarkan Paulus layak direnungkan perlahan. Sukacita dan damai sejahtera diberikan ''dalam iman kamu'' — bukan seiring keadaan berubah, melainkan seiring kepercayaan yang secara aktif diulurkan, saat demi saat, kepada Allah. Dan hasilnya bukanlah harapan yang sederhana dan berhati-hati, dijatah sesuai seberapa besar kemungkinan segalanya akan berjalan baik. Itu adalah keberlimpahan — harapan yang melampaui apa yang dibenarkan oleh keadaan yang terlihat, karena sumbernya bukan keadaan itu, melainkan kuasa Roh Kudus yang bekerja dalam diri kita.

Inilah nada yang ingin kita jadikan penutup minggu ini, karena ini menyebutkan sesuatu yang telah kita kelilingi selama tujuh hari: harapan di atas keadaan bukanlah harapan yang menyangkal betapa tertutupnya jalan itu tampak. Itu adalah harapan dengan sumber yang sama sekali berbeda — disediakan, dipelihara, bahkan berlimpah-limpah, oleh Roh dari Allah sumber pengharapan, terlepas dari apa yang saat ini ditunjukkan oleh jalan itu.

Di mana pun jalanmu berada hari ini — benar-benar terhalang, masih berkelok melalui padang gurun, atau baru mulai menunjukkan tunas hijau pertama dari sesuatu yang baru — berkat ini didoakan atasmu sama seperti atas jemaat Roma. Semoga Allah sumber pengharapan memenuhimu, bukan menurut bagaimana keadaan tampak, melainkan menurut karakter-Nya sendiri yang berlimpah-limpah. Bukan karena jalannya mudah. Karena Dia adalah Allah sumber pengharapan, dan Dia belum berhenti menjadi itu, bahkan di sini.',
    'What would it look like this week to let your hope ''overflow'' beyond what your current circumstances would justify?', 'Seperti apa rasanya minggu ini membiarkan harapanmu ''berlimpah-limpah'' melampaui apa yang dibenarkan oleh keadaanmu saat ini?',
    'God of hope, fill me with joy and peace as I trust in You, not as my circumstances change. Let hope overflow in me by the power of Your Spirit, even here, even now. Amen.', 'Allah sumber pengharapan, penuhilah aku dengan sukacita dan damai sejahtera saat aku percaya kepada-Mu, bukan seiring keadaanku berubah. Biarkan harapan berlimpah-limpah dalam diriku oleh kuasa Roh-Mu, bahkan di sini, bahkan sekarang. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 15:13', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 15:13', 'TB', 1);

  -- Plan: Joy in the Meantime
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Joy in the Meantime',
    'Sukacita di Masa Penantian',
    'Choosing gladness today, before your situation resolves',
    'Memilih Sukacita Hari Ini, Sebelum Keadaanmu Berubah',
    3,
    'A short three-day plan for the in-between — the waiting room, the unresolved chapter, the season that hasn''t yet turned. Rather than treating joy as a reward for circumstances finally improving, these three days explore joy as a present-tense choice rooted in God''s strength and presence, available today, in the meantime, exactly as things are.',
    'Renungan singkat tiga hari untuk masa antara — ruang tunggu, babak yang belum terselesaikan, musim yang belum berganti. Alih-alih memperlakukan sukacita sebagai hadiah setelah keadaan akhirnya membaik, tiga hari ini menelusuri sukacita sebagai pilihan masa kini yang berakar pada kekuatan dan kehadiran Tuhan, tersedia hari ini, di masa penantian, persis seperti apa adanya keadaan sekarang.',
    '/images/devotions/joy-in-the-meantime.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Joy of the Lord Is Your Strength', 'Sukacita karena TUHAN Itu Kekuatanmu',
    'Nehemiah 8 records a strange scene. The exiles have returned to Jerusalem, the walls are being rebuilt, and Ezra reads the Law aloud to the assembled people for the first time in a generation. As they hear it, they begin to weep — grief, perhaps, over how far they and their ancestors had drifted, or simply the overwhelming weight of the moment. It would make sense for this to be a somber occasion. Instead, Nehemiah and Ezra tell the people something unexpected: ''Do not grieve, for the joy of the Lord is your strength.''

This is not a dismissal of their grief, and it is not toxic positivity. The city is still half-rebuilt. Their circumstances have not been resolved — they are still a small, vulnerable community surrounded by hostile neighbors, still rebuilding from ruins. The instruction to find joy is given precisely in the middle of an unfinished, still-difficult situation, not after everything was set right. And the reasoning given is striking: joy is not merely a feeling to chase for its own sake. It is a source of strength — something that fortifies people for the work still ahead of them.

Many of us treat joy as something we''ll get to once the hard part is over — once the diagnosis clears, once the finances stabilize, once the relationship heals. Nehemiah offers a different order: the joy of the Lord can be the strength that carries us through the unfinished middle, not just the reward waiting at the end. It is available now, in the meantime, precisely because its source is the Lord rather than the completion of our circumstances.

Today, in whatever unfinished chapter you are living, consider Nehemiah''s strange instruction. Not ''don''t feel your grief'' — the text doesn''t say that. But alongside it: let the joy that comes from the Lord''s presence and character be a strength you draw on today, exactly as things stand, walls half-built and all.', 'Nehemia 8 mencatat sebuah adegan yang aneh. Orang-orang buangan telah kembali ke Yerusalem, tembok sedang dibangun kembali, dan Ezra membacakan Kitab Taurat dengan suara nyaring kepada umat yang berkumpul, untuk pertama kalinya dalam satu generasi. Saat mendengarnya, mereka mulai menangis — mungkin karena kesedihan atas seberapa jauh mereka dan nenek moyang mereka telah menyimpang, atau sekadar beratnya bobot momen itu. Masuk akal jika ini menjadi peristiwa yang muram. Sebaliknya, Nehemia dan Ezra mengatakan sesuatu yang tak terduga kepada umat: ''Janganlah kamu berdukacita, karena sukacita karena TUHAN itu adalah kekuatanmu.''

Ini bukan penyangkalan atas kesedihan mereka, dan ini bukan sikap positif yang dipaksakan. Kota itu masih setengah dibangun. Keadaan mereka belum terselesaikan — mereka masih komunitas kecil dan rentan yang dikelilingi tetangga yang bermusuhan, masih membangun kembali dari reruntuhan. Perintah untuk menemukan sukacita diberikan justru di tengah keadaan yang belum selesai dan masih sulit, bukan setelah segalanya dibereskan. Dan alasan yang diberikan sangat mencolok: sukacita bukan sekadar perasaan yang dikejar demi dirinya sendiri. Itu adalah sumber kekuatan — sesuatu yang meneguhkan orang untuk pekerjaan yang masih ada di hadapan mereka.

Banyak dari kita memperlakukan sukacita sebagai sesuatu yang baru akan kita dapatkan setelah bagian sulitnya berakhir — setelah diagnosis membaik, setelah keuangan stabil, setelah hubungan pulih. Nehemia menawarkan urutan yang berbeda: sukacita karena TUHAN bisa menjadi kekuatan yang membawa kita melewati pertengahan yang belum selesai, bukan hanya hadiah yang menunggu di ujung. Sukacita itu tersedia sekarang, di masa penantian, justru karena sumbernya adalah TUHAN, bukan selesainya keadaan kita.

Hari ini, dalam babak yang belum selesai apa pun yang sedang kamu jalani, pertimbangkan perintah Nehemia yang aneh ini. Bukan ''jangan rasakan dukamu'' — teks itu tidak mengatakan demikian. Tetapi bersamaan dengannya: biarkan sukacita yang datang dari kehadiran dan karakter TUHAN menjadi kekuatan yang kamu andalkan hari ini, persis seperti apa adanya keadaan sekarang, dengan tembok yang masih setengah dibangun sekalipun.',
    'What unfinished part of your life are you waiting to feel joyful about, that you could instead draw strength from today?', 'Bagian belum selesai apa dalam hidupmu yang kamu tunggu untuk bisa merasa bersukacita atasnya, padahal bisa kamu jadikan sumber kekuatan hari ini?',
    'Lord, my walls are still half-built and my situation is still unfinished. Let Your joy be my strength today, not a reward I''m waiting for once everything is resolved. Amen.', 'Tuhan, tembok-tembokku masih setengah dibangun dan keadaanku masih belum selesai. Biarkan sukacita-Mu menjadi kekuatanku hari ini, bukan hadiah yang kutunggu setelah segalanya terselesaikan. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Nehemiah 8:10', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Nehemia 8:10', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'This Is the Day', 'Inilah Hari yang Dijadikan TUHAN',
    'Psalm 118:24 is short enough to memorize in a moment and deep enough to spend a lifetime learning: ''This is the day the Lord has made; let us rejoice and be glad in it.'' What makes this verse quietly radical is what it does not say. It does not say ''this is the day the Lord has made easy'' or ''this is the day everything finally works out.'' It simply names the day as belonging to the Lord — made by Him, given by Him — and calls for rejoicing on that basis alone.

The psalm this verse sits within is not written from a place of comfort. It describes being surrounded by enemies, pushed hard and nearly falling, in real distress calling out to God. The declaration about ''this day'' comes in the middle of that struggle, not after deliverance is complete. Rejoicing, here, is not a response to circumstances resolving. It is a response to whose day this is — a claim about ownership and meaning that doesn''t wait for outcomes to be settled first.

It is easy to treat gladness as something we owe to good days and withhold from hard ones, as if joy were a fair transaction, matched to how well things are currently going. Psalm 118 suggests something less transactional: today — this specific, possibly difficult, possibly unresolved today — is a day the Lord made, and that fact alone is enough grounds for gladness, independent of whether the day brought good news.

Try, today, saying the verse slowly and specifically: not ''the day I hope things get better,'' but this day — with its actual meetings, its actual waiting, its actual weather — the day the Lord has made. Let rejoicing be a response to that ownership, not a prize withheld until the day looks the way you''d choose.', 'Mazmur 118:24 cukup singkat untuk dihafal dalam sekejap dan cukup dalam untuk dipelajari seumur hidup: ''Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak dan bersukacita di dalamnya.'' Yang membuat ayat ini diam-diam radikal adalah apa yang tidak dikatakannya. Ayat ini tidak mengatakan ''inilah hari yang dibuat TUHAN mudah'' atau ''inilah hari segalanya akhirnya berjalan baik.'' Ayat ini hanya menyebut hari itu sebagai milik TUHAN — dibuat oleh-Nya, diberikan oleh-Nya — dan menyerukan sukacita atas dasar itu saja.

Mazmur yang memuat ayat ini tidak ditulis dari tempat yang nyaman. Mazmur ini menggambarkan dikepung musuh, didesak keras dan hampir jatuh, dalam kesesakan nyata berseru kepada Tuhan. Pernyataan tentang ''hari ini'' muncul di tengah pergumulan itu, bukan setelah pembebasan selesai. Sukacita, di sini, bukanlah tanggapan atas keadaan yang terselesaikan. Ini adalah tanggapan atas milik siapa hari ini — sebuah klaim tentang kepemilikan dan makna yang tidak menunggu hasil terlebih dahulu diselesaikan.

Mudah bagi kita memperlakukan sukacita sebagai sesuatu yang kita berikan pada hari-hari baik dan tahan pada hari-hari sulit, seolah sukacita adalah transaksi yang adil, disesuaikan dengan seberapa baik keadaan saat ini. Mazmur 118 menawarkan sesuatu yang kurang transaksional: hari ini — hari yang spesifik ini, mungkin sulit, mungkin belum terselesaikan — adalah hari yang dijadikan TUHAN, dan fakta itu saja sudah cukup menjadi dasar untuk bersukacita, terlepas dari apakah hari itu membawa kabar baik.

Cobalah, hari ini, mengucapkan ayat itu perlahan dan secara spesifik: bukan ''hari yang kuharap keadaannya membaik,'' melainkan hari ini — dengan pertemuan-pertemuannya yang sebenarnya, penantiannya yang sebenarnya, cuacanya yang sebenarnya — hari yang dijadikan TUHAN. Biarkan sukacita menjadi tanggapan atas kepemilikan itu, bukan hadiah yang ditahan sampai hari itu terlihat seperti yang kamu inginkan.',
    'What would change if you approached today as belonging to the Lord, regardless of how it turns out?', 'Apa yang akan berubah jika kamu menjalani hari ini sebagai hari yang menjadi milik TUHAN, terlepas dari bagaimana hasilnya nanti?',
    'Lord, this is the day You have made, with all its unfinished business. Teach me to rejoice in it as it is, not as I wish it were, trusting that it belongs to You. Amen.', 'Tuhan, inilah hari yang Engkau jadikan, dengan segala urusannya yang belum selesai. Ajari aku bersukacita di dalamnya seperti apa adanya, bukan seperti yang kuinginkan, percaya bahwa hari ini adalah milik-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 118:24', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 118:24', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Perseverance Has Its Work', 'Ketekunan Mempunyai Buah yang Matang',
    'James writes to scattered, struggling believers with a line that can sound, on first read, almost strange: ''Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.'' James is not telling them to feel happy that hardship is happening. He is inviting them to locate joy somewhere specific — not in the trial itself, but in what the trial, endured with faith, is quietly producing.

This is a very different kind of joy than simple good cheer. It''s closer to the joy of someone in the middle of hard training, who can genuinely value the process even while it hurts, because they trust something real is being built by it. James goes on: ''Let perseverance finish its work so that you may be mature and complete, not lacking anything.'' The trial is not wasted time to be merely endured until it''s over. It is, mysteriously, part of the process by which something whole is being formed in us.

This does not mean every difficulty has an obvious silver lining, or that we should manufacture gratitude for genuine suffering. James''s audience faced real persecution and real loss. But he offers a reframe available to anyone in an unresolved, ongoing hardship: joy can be found not by pretending the trial is good, but by trusting that perseverance — the muscle being built by staying faithful through it — is itself valuable, is itself heading somewhere, is itself evidence of maturity forming in real time.

As we close this short plan, the invitation is not to force a smile at hardship. It is to notice that the very act of persevering today — showing up, trusting, choosing hope again in the meantime — is not incidental to your story. It is, according to James, exactly how maturity and completeness get built. Joy in the meantime is not denial. It is trusting the process while still inside it.', 'Yakobus menulis kepada orang-orang percaya yang tersebar dan bergumul dengan kalimat yang, pada bacaan pertama, bisa terdengar agak aneh: ''Saudara-saudaraku, anggaplah sebagai suatu kebahagiaan, apabila kamu jatuh ke dalam berbagai-bagai pencobaan, sebab kamu tahu, bahwa ujian terhadap imanmu itu menghasilkan ketekunan.'' Yakobus tidak menyuruh mereka merasa bahagia karena kesulitan sedang terjadi. Ia mengundang mereka menemukan sukacita di tempat yang spesifik — bukan pada pencobaan itu sendiri, melainkan pada apa yang secara diam-diam sedang dihasilkan oleh pencobaan itu, ketika dijalani dengan iman.

Ini adalah jenis sukacita yang sangat berbeda dari sekadar kegembiraan sederhana. Ini lebih dekat dengan sukacita seseorang yang sedang berada di tengah latihan berat, yang bisa benar-benar menghargai prosesnya bahkan saat itu terasa sakit, karena ia percaya sesuatu yang nyata sedang dibangun olehnya. Yakobus melanjutkan: ''Biarkanlah ketekunan itu memperoleh buah yang matang, supaya kamu menjadi sempurna dan utuh dan tak kekurangan suatu apapun.'' Pencobaan itu bukan waktu yang terbuang begitu saja untuk sekadar dijalani sampai berakhir. Ini, secara misterius, adalah bagian dari proses di mana sesuatu yang utuh sedang dibentuk dalam diri kita.

Ini tidak berarti setiap kesulitan memiliki sisi baik yang jelas, atau bahwa kita harus memaksakan rasa syukur untuk penderitaan yang sungguh nyata. Pendengar Yakobus menghadapi penganiayaan nyata dan kehilangan nyata. Tetapi ia menawarkan pembingkaian ulang yang tersedia bagi siapa pun dalam kesulitan yang belum terselesaikan dan masih berlangsung: sukacita bisa ditemukan bukan dengan berpura-pura pencobaan itu baik, melainkan dengan percaya bahwa ketekunan — otot yang sedang dibangun karena tetap setia melaluinya — itu sendiri berharga, itu sendiri sedang menuju ke suatu tempat, itu sendiri adalah bukti kedewasaan yang terbentuk secara nyata saat ini.

Saat kita mengakhiri renungan singkat ini, undangannya bukanlah memaksakan senyum pada kesulitan. Ini adalah untuk menyadari bahwa tindakan bertekun hari ini — tetap hadir, tetap percaya, kembali memilih harapan di masa penantian ini — bukanlah hal sepele dalam kisahmu. Menurut Yakobus, justru itulah cara kedewasaan dan keutuhan dibangun. Sukacita di masa penantian bukanlah penyangkalan. Itu adalah kepercayaan pada proses saat kamu masih berada di dalamnya.',
    'What quality of perseverance or maturity might currently be forming in you through this unresolved season?', 'Kualitas ketekunan atau kedewasaan apa yang mungkin sedang terbentuk dalam dirimu melalui musim yang belum terselesaikan ini?',
    'Lord, I don''t need to pretend this trial is good to trust that You are producing something good through it. Let perseverance finish its work in me, and let me find joy in the process, even here in the meantime. Amen.', 'Tuhan, aku tidak perlu berpura-pura bahwa pencobaan ini baik untuk percaya bahwa Engkau sedang menghasilkan sesuatu yang baik melaluinya. Biarkan ketekunan memperoleh buah yang matang dalam diriku, dan biarkan aku menemukan sukacita dalam prosesnya, bahkan di masa penantian ini. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'James 1:2-4', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yakobus 1:2-4', 'TB', 1);

  -- Sub-category: Hope for the Future --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Hope for the Future' AND parent_id = v_category_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Hope for the Future', 'Pengharapan untuk Masa Depan', v_category_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengharapan untuk Masa Depan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Not Yet, But Not Forgotten
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Not Yet, But Not Forgotten',
    'Belum Terjawab, Tapi Tak Terlupakan',
    'Trusting God with your career and next steps',
    'Mempercayakan Karier dan Langkahmu Berikutnya kepada Tuhan',
    5,
    'A five-day devotional for young adults standing at a crossroads — waiting for a job offer, wondering which path to choose, or feeling behind everyone else. Each day pairs a well-loved promise of Scripture with an honest, reassuring reflection on what it means to walk forward without knowing the whole map.',
    'Renungan lima hari untuk anak muda yang berada di persimpangan jalan — menunggu panggilan kerja, bimbang memilih jalan, atau merasa tertinggal dari orang lain. Setiap hari memadukan janji Alkitab yang dikenal luas dengan refleksi yang jujur dan menguatkan tentang melangkah maju tanpa mengetahui seluruh peta jalan.',
    '/images/devotions/not-yet-but-not-forgotten.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'A Future You Cannot Yet See', 'Masa Depan yang Belum Bisa Kaulihat',
    'There is a particular kind of restlessness that comes with standing at the start of adult life — applications sent and unanswered, a major chosen but a career unclear, a question mark hovering over the next five years. Many of us know this feeling well: the sense that everyone else seems to have a plan while we are still figuring out the first step. It can feel like being handed a map with half the roads erased.

Jeremiah wrote his famous words to people in exile, far from home, with no clear timeline for when things would get better. God did not promise them an easy fast-forward button. He promised something steadier — that His plans for them were good, that they had a future, and that hope was not naive but grounded in His character. That word was spoken into genuine uncertainty, not comfort, which is exactly why it still lands for us today.

It helps to remember that not knowing your five-year plan is not the same as being lost. A seed underground looks like it is going nowhere, yet everything necessary for growth is already happening beneath the surface. Seasons of waiting on a decision, an offer, or a sense of direction are rarely wasted seasons in God''s hands, even when they feel that way from the inside.

So today, if you are staring at an unclear future, let this be permission to exhale. You do not need the whole plan today. You need enough light for the next step, and a God who has already seen the whole road ahead of you and called it good.', 'Ada semacam kegelisahan khas yang muncul saat berdiri di awal kehidupan dewasa — lamaran kerja yang terkirim tanpa balasan, jurusan yang sudah dipilih tapi karier yang masih kabur, tanda tanya besar menggantung di atas lima tahun ke depan. Banyak dari kita mengenal perasaan ini dengan baik: rasa bahwa orang lain sudah punya rencana sementara kita masih mencari langkah pertama. Rasanya seperti diberi peta yang separuh jalannya sudah terhapus.

Yeremia menuliskan kata-kata terkenal ini kepada umat yang sedang dalam pembuangan, jauh dari rumah, tanpa kepastian kapan keadaan akan membaik. Tuhan tidak menjanjikan tombol percepat yang mudah. Ia menjanjikan sesuatu yang lebih kokoh — bahwa rencana-Nya bagi mereka baik, bahwa mereka punya masa depan, dan bahwa pengharapan itu bukan sesuatu yang naif, melainkan berakar pada karakter-Nya. Firman itu diucapkan di tengah ketidakpastian yang nyata, bukan di tengah kenyamanan, dan itulah sebabnya firman ini masih terasa relevan bagi kita hari ini.

Perlu diingat bahwa belum mengetahui rencana lima tahun ke depan bukan berarti kita tersesat. Sebutir benih di dalam tanah tampak seolah tidak menuju ke mana-mana, padahal segala sesuatu yang dibutuhkan untuk bertumbuh sedang terjadi di bawah permukaan. Masa penantian akan keputusan, tawaran, atau arah hidup jarang menjadi masa yang sia-sia di tangan Tuhan, meski dari dalam terasa demikian.

Jadi hari ini, jika engkau sedang menatap masa depan yang belum jelas, biarlah ini menjadi izin untuk menarik napas lega. Engkau tidak perlu memiliki seluruh rencana hari ini. Engkau hanya butuh cukup terang untuk langkah berikutnya, dan Tuhan yang sudah melihat seluruh jalan di depanmu dan menyebutnya baik.',
    'What is one part of your future you have been carrying alone that you can hand back to God today?', 'Bagian mana dari masa depanmu yang selama ini kaupikul sendirian, yang bisa kaupasrahkan kepada Tuhan hari ini?',
    'Lord, I confess I want the whole map when You are only offering the next step. Thank You that Your plans for me are good, even in this waiting. Help me trust Your timing more than my timeline. Amen.', 'Tuhan, aku mengakui bahwa aku ingin melihat seluruh peta, padahal Engkau baru menawarkan langkah berikutnya. Terima kasih karena rancangan-Mu bagiku baik, bahkan di tengah penantian ini. Tolong aku lebih percaya waktu-Mu daripada jadwal yang kususun sendiri. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Jeremiah 29:11', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yeremia 29:11', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Leaning Instead of Leaping Alone', 'Bersandar, Bukan Melompat Sendirian',
    'Decision fatigue is real, especially in seasons of transition. Which job to take, which city to move to, which relationship to invest in, which offer to accept or decline — every choice feels weighted with permanence, as if one wrong turn will unravel everything. Under that pressure, it is easy to either freeze completely or to grip our own understanding so tightly that we forget we are not meant to navigate alone.

Proverbs 3 gives a strikingly simple instruction for a complicated feeling: trust God with all your heart, and do not lean on your own understanding. This is not a call to stop thinking or planning. It is an invitation to hold our plans with open hands, to do the research and ask the wise counsel and still leave room for God to redirect, close a door, or open one we never considered.

Many people looking back on a pivotal season of their twenties or thirties can point to a moment that felt like a detour at the time but turned out to be exactly the path they needed. That does not mean every closed door is secretly a blessing in disguise — some doors close and simply hurt. But it does mean our own understanding is limited, and a wiser, wider perspective is available to us if we ask for it.

Leaning on God does not mean disengaging from your own life. It means bringing your plans to Him honestly, staying humble about what you cannot see, and trusting that He is straightening paths you cannot yet trace.', 'Kelelahan mengambil keputusan itu nyata, terutama di masa-masa transisi. Pekerjaan mana yang harus diambil, kota mana yang harus dituju, hubungan mana yang layak diperjuangkan, tawaran mana yang harus diterima atau ditolak — setiap pilihan terasa berat seolah bersifat permanen, seakan satu langkah salah akan merusak segalanya. Di bawah tekanan itu, mudah sekali kita membeku total atau justru berpegang teguh pada pengertian kita sendiri hingga lupa bahwa kita tidak dipanggil untuk menjalani hidup sendirian.

Amsal 3 memberikan instruksi yang mengejutkan sederhananya untuk perasaan yang rumit: percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar pada pengertianmu sendiri. Ini bukan ajakan untuk berhenti berpikir atau merencanakan. Ini adalah undangan untuk memegang rencana kita dengan tangan terbuka, tetap melakukan riset dan meminta nasihat yang bijak, namun tetap memberi ruang bagi Tuhan untuk mengubah arah, menutup satu pintu, atau membuka pintu yang tidak pernah kita pertimbangkan.

Banyak orang yang menoleh ke belakang pada masa-masa penting di usia dua puluhan atau tiga puluhan bisa menunjuk pada satu momen yang saat itu terasa seperti jalan memutar, namun ternyata justru menjadi jalan yang tepat yang mereka butuhkan. Bukan berarti setiap pintu tertutup adalah berkat yang tersamar — ada pintu yang tertutup dan memang menyakitkan. Tetapi ini berarti pengertian kita sendiri terbatas, dan ada perspektif yang lebih bijak dan lebih luas yang tersedia bagi kita jika kita memintanya.

Bersandar kepada Tuhan bukan berarti melepaskan tangan dari hidup kita sendiri. Artinya membawa rencana kita kepada-Nya dengan jujur, tetap rendah hati atas apa yang tidak bisa kita lihat, dan percaya bahwa Ia sedang meluruskan jalan-jalan yang belum bisa kita telusuri.',
    'Where have you been leaning on your own understanding this week instead of bringing the decision honestly to God?', 'Di mana engkau selama minggu ini lebih bersandar pada pengertianmu sendiri, alih-alih membawa keputusan itu dengan jujur kepada Tuhan?',
    'Father, I bring You the decisions I''ve been carrying alone. I don''t want to grip my own plans so tightly that I miss what You''re doing. Straighten my path, and give me peace to trust You with the parts I cannot control. Amen.', 'Bapa, aku membawa kepada-Mu keputusan-keputusan yang selama ini kupikul sendirian. Aku tidak ingin memegang rencanaku sendiri begitu erat sampai melewatkan apa yang sedang Engkau kerjakan. Luruskanlah jalanku, dan berikanlah aku damai untuk mempercayai-Mu atas hal-hal yang tak bisa kukendalikan. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Proverbs 3:5-6', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Amsal 3:5-6', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Peace That Outlasts the Uncertainty', 'Damai Sejahtera yang Melampaui Ketidakpastian',
    'Anxiety about the future has a way of showing up in the body before we even name it in words — a tight chest before checking an inbox, a racing mind at 2 a.m. running through worst-case scenarios, a low hum of dread under an otherwise ordinary day. If that description feels familiar, you are far from alone. Many people carry this same quiet weight, especially in seasons when so much still feels unresolved.

Paul wrote to the Philippians not to suppress anxiety but to bring it somewhere: to God, specifically, through prayer and thanksgiving. There is something significant in that instruction. It does not say pretend you are not anxious. It says take the anxiety, name it honestly in prayer, and hand it over — and the promise attached is peace that goes beyond understanding, a peace that does not require the circumstances to resolve first.

That is an unusual kind of peace. Most peace we know is the result of a problem being solved — the offer finally arriving, the diagnosis clearing, the relationship stabilizing. But the peace Paul describes stands guard over our hearts and minds while the outcome is still unknown. It is peace in the waiting room, not just peace after the waiting ends.

If your future still feels unresolved tonight, that peace is still available to you. Not because everything is figured out, but because the God you are praying to already holds what you cannot yet see.', 'Kecemasan tentang masa depan punya cara muncul dalam tubuh sebelum sempat kita ungkapkan dengan kata-kata — dada yang sesak sebelum membuka kotak masuk, pikiran yang berpacu pukul dua pagi memikirkan skenario terburuk, rasa gelisah samar di balik hari yang tampak biasa saja. Jika gambaran ini terasa familiar, engkau sama sekali tidak sendirian. Banyak orang memikul beban yang sama, terutama di masa-masa ketika begitu banyak hal masih terasa belum selesai.

Paulus menulis kepada jemaat di Filipi bukan untuk menekan kecemasan, melainkan untuk membawanya ke suatu tempat: kepada Tuhan, secara khusus lewat doa dan ucapan syukur. Ada sesuatu yang penting dalam instruksi ini. Ia tidak berkata, berpura-puralah tidak cemas. Ia berkata, ambillah kecemasan itu, sebutkan dengan jujur dalam doa, dan serahkanlah — dan janji yang menyertainya adalah damai sejahtera yang melampaui akal, damai yang tidak menuntut keadaan diselesaikan terlebih dahulu.

Itu adalah jenis damai yang tidak biasa. Kebanyakan damai yang kita kenal adalah hasil dari masalah yang terpecahkan — tawaran kerja akhirnya datang, hasil diagnosis membaik, hubungan mulai stabil. Tetapi damai yang digambarkan Paulus berjaga atas hati dan pikiran kita justru ketika hasilnya masih belum diketahui. Itu adalah damai di ruang tunggu, bukan hanya damai setelah penantian berakhir.

Jika malam ini masa depanmu masih terasa belum jelas, damai itu tetap tersedia bagimu. Bukan karena segalanya sudah terselesaikan, melainkan karena Tuhan yang kepada-Nya engkau berdoa sudah memegang apa yang belum bisa kaulihat.',
    'What specific worry about your future do you need to name honestly in prayer today, instead of carrying silently?', 'Kekhawatiran spesifik apa tentang masa depanmu yang perlu kausebutkan dengan jujur dalam doa hari ini, alih-alih kaupendam sendirian?',
    'Lord, I bring You what I have been carrying silently. I don''t ask You to erase every uncertainty tonight — I ask for the peace that guards my heart even while I wait. Thank You for hearing me. Amen.', 'Tuhan, aku membawa kepada-Mu apa yang selama ini kupendam sendirian. Aku tidak meminta Engkau menghapus setiap ketidakpastian malam ini — aku memohon damai sejahtera yang menjaga hatiku bahkan ketika aku menanti. Terima kasih karena Engkau mendengarku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Philippians 4:6-7', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Filipi 4:6-7', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'The One Who Goes Before You', 'Dia yang Berjalan Mendahuluimu',
    'There is a specific fear that shows up in job interviews, first days at a new role, and pivotal conversations about the future: the fear of being found out, of not measuring up, of walking into a room unprepared. It is the fear that says everyone else knows what they''re doing and you''re the only one guessing. If you''ve felt this, you are in good company — nearly everyone carrying ambition also carries this quiet self-doubt somewhere underneath it.

Isaiah 41:10 was spoken as reassurance to people facing real threats, not imaginary ones, yet the promise is not that the threats will vanish. It is that God will be present in the middle of them — strengthening, helping, upholding. The word ''uphold'' is worth sitting with. It suggests being held steady, not carried away from difficulty but supported through it.

This matters for career and life decisions because so much of our fear is really the fear of facing the unknown alone. We imagine ourselves walking into the interview, the new city, the hard conversation by ourselves, and that image is what makes our knees weak. But the promise here reframes the picture entirely: you were never meant to walk in alone. The same God who called you is the one steadying your hand as you go.

Whatever step you''re dreading this week — the application, the interview, the announcement of a decision — you can walk toward it with a straighter back today, not because the outcome is guaranteed, but because you are not facing it by yourself.', 'Ada ketakutan khusus yang muncul saat wawancara kerja, hari pertama di posisi baru, dan percakapan penting tentang masa depan: ketakutan akan ketahuan tidak becus, tidak cukup layak, memasuki ruangan tanpa persiapan. Ketakutan yang berkata bahwa semua orang lain tahu apa yang mereka lakukan, dan hanya kita yang sedang menebak-nebak. Jika engkau pernah merasakan ini, engkau berada dalam kelompok yang baik — hampir semua orang yang membawa ambisi juga membawa keraguan diri yang sama diam-diam di baliknya.

Yesaya 41:10 diucapkan sebagai penghiburan kepada umat yang menghadapi ancaman nyata, bukan yang khayalan, namun janji itu bukan bahwa ancaman itu akan lenyap. Janjinya adalah bahwa Tuhan akan hadir di tengah-tengahnya — menguatkan, menolong, memegang. Kata ''memegang'' patut direnungkan lebih dalam. Kata itu menunjukkan dipegang teguh, bukan dibawa menjauh dari kesulitan, melainkan disokong untuk melewatinya.

Ini penting untuk keputusan karier dan hidup karena sebagian besar ketakutan kita sebenarnya adalah ketakutan menghadapi yang tidak diketahui seorang diri. Kita membayangkan diri kita memasuki wawancara, kota baru, percakapan sulit itu sendirian, dan bayangan itulah yang membuat lutut kita gemetar. Tetapi janji ini mengubah seluruh gambaran itu: kita tidak pernah dimaksudkan untuk berjalan sendirian. Tuhan yang sama yang memanggilmu adalah Dia yang menopang tanganmu saat engkau melangkah.

Apa pun langkah yang kautakuti minggu ini — lamaran itu, wawancara itu, pengumuman keputusan itu — engkau bisa melangkah menghadapinya dengan punggung yang lebih tegak hari ini, bukan karena hasilnya sudah pasti, melainkan karena engkau tidak menghadapinya sendirian.',
    'What step are you dreading this week, and how does it change things to know you are not facing it alone?', 'Langkah apa yang kautakuti minggu ini, dan apa yang berubah ketika engkau tahu bahwa engkau tidak menghadapinya sendirian?',
    'God, thank You that You go before me and stand beside me. Steady my hands and quiet my fear for what''s ahead. Help me remember I was never meant to walk into this alone. Amen.', 'Tuhan, terima kasih karena Engkau berjalan mendahuluiku dan berdiri di sisiku. Teguhkanlah tanganku dan tenangkanlah ketakutanku akan apa yang ada di depan. Tolong aku mengingat bahwa aku tidak pernah dimaksudkan untuk menghadapi ini sendirian. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 41:10', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 41:10', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Guided, Step by Step', 'Dituntun, Selangkah Demi Selangkah',
    'By the last day of a week like this, it is worth asking honestly: has anything actually changed about my circumstances? Maybe the job is still pending. Maybe the decision is still unmade. And yet something can shift even when the external facts have not — a posture of the heart, a willingness to keep walking without demanding to see the whole road first.

Psalm 32:8 is written as a direct promise from God''s own voice: instruction, teaching, and counsel, with His watchful eye on us the whole time. Notice it does not promise a blueprint delivered all at once. It promises ongoing guidance — instruction for today''s step, and presence to keep offering the next one when the time comes.

This is, in many ways, how most of us actually experience God''s leading over a lifetime: not as a single dramatic download of the entire future, but as faithfulness that shows up again in the next season, and the one after that. People who look back on ten or twenty years of following God rarely describe having known the whole plan in advance. They describe being led, one step, one door, one confirmation at a time.

So as you close this week, let go of the pressure to have it all figured out. You are not behind. You are being led — watched over, instructed, and counseled by a God who is not in a hurry and has not lost sight of you for a single moment of this unfolding future.', 'Pada hari terakhir minggu seperti ini, ada baiknya bertanya dengan jujur: apakah keadaanku sungguh sudah berubah? Mungkin pekerjaan itu masih menunggu kepastian. Mungkin keputusan itu masih belum diambil. Namun ada sesuatu yang bisa berubah bahkan ketika fakta-fakta luar belum berubah — sikap hati, kesediaan untuk terus melangkah tanpa menuntut melihat seluruh jalan terlebih dahulu.

Mazmur 32:8 ditulis sebagai janji langsung dari suara Tuhan sendiri: pengajaran, petunjuk, dan nasihat, dengan mata-Nya yang mengawasi kita sepanjang waktu. Perhatikan bahwa ayat ini tidak menjanjikan cetak biru yang diberikan sekaligus. Ayat ini menjanjikan tuntunan yang berkelanjutan — pengajaran untuk langkah hari ini, dan kehadiran yang terus menawarkan langkah berikutnya ketika waktunya tiba.

Inilah, dalam banyak hal, cara sebagian besar dari kita sungguh mengalami tuntunan Tuhan sepanjang hidup: bukan sebagai satu unduhan dramatis tentang seluruh masa depan sekaligus, melainkan sebagai kesetiaan yang terus muncul lagi di musim berikutnya, dan musim sesudahnya. Orang-orang yang menoleh ke belakang pada sepuluh atau dua puluh tahun mengikuti Tuhan jarang menceritakan bahwa mereka telah mengetahui seluruh rencana itu sejak awal. Mereka menceritakan bagaimana mereka dituntun, satu langkah, satu pintu, satu peneguhan pada satu waktu.

Jadi saat engkau mengakhiri minggu ini, lepaskanlah tekanan untuk memahami segalanya sekaligus. Engkau tidak tertinggal. Engkau sedang dituntun — diawasi, diajar, dan dinasihati oleh Tuhan yang tidak tergesa-gesa dan tidak pernah kehilangan pandangan atas dirimu, bahkan untuk satu momen pun dalam masa depan yang sedang terbentang ini.',
    'What would it look like this week to take just the next faithful step, instead of waiting for the whole plan?', 'Seperti apa jadinya jika minggu ini engkau mengambil satu langkah setia berikutnya saja, alih-alih menunggu seluruh rencana?',
    'Lord, thank You for guiding me one step at a time, even when I want the whole plan now. Keep Your loving eye on me as I move forward. Teach me to trust the next step, and the one after that. Amen.', 'Tuhan, terima kasih karena Engkau menuntunku selangkah demi selangkah, bahkan ketika aku ingin seluruh rencana itu sekarang juga. Tetaplah mengarahkan mata-Mu yang penuh kasih kepadaku saat aku melangkah maju. Ajari aku mempercayai langkah berikutnya, dan langkah sesudahnya. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 32:8', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 32:8', 'TB', 1);

  -- Plan: Held Before You Get There
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Held Before You Get There',
    'Sudah Dipegang Sebelum Engkau Tiba',
    'Seven days of trusting God with what you cannot yet see',
    'Tujuh Hari Mempercayakan yang Belum Terlihat kepada Tuhan',
    7,
    'A seven-day devotional for anyone facing an unknown future — a move, a diagnosis, a relationship, a season with no clear end date. Drawing on well-loved promises from across Scripture, each day offers a steady reminder that God is already present in the tomorrow you cannot yet see.',
    'Renungan tujuh hari untuk siapa saja yang menghadapi masa depan yang belum diketahui — perpindahan, diagnosis, hubungan, atau musim tanpa kepastian kapan berakhir. Bersandar pada janji-janji Alkitab yang dikenal luas, setiap hari menawarkan pengingat yang kokoh bahwa Tuhan sudah hadir di hari esok yang belum bisa kaulihat.',
    '/images/devotions/held-before-you-get-there.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Today Has Enough', 'Hari Ini Sudah Cukup',
    'One of the quiet exhausting habits of an anxious mind is time-traveling into futures that have not happened yet — rehearsing conversations that may never occur, imagining outcomes that may never arrive, spending today''s energy on tomorrow''s imagined crisis. It is a habit almost everyone knows, whether the worry is about health, finances, relationships, or simply what comes next.

Jesus addressed this directly in the Sermon on the Mount, in words that sound almost startlingly practical for something so ancient: do not worry about tomorrow, because tomorrow will worry about itself, and today has enough trouble of its own. This is not a dismissal of real concerns. It is an invitation to live inside the day we are actually given, rather than the day we are imagining.

There is a kind of mercy hidden in this instruction. We are not required to have the strength today for every hardship tomorrow might bring, because that strength has not been given yet — it will be given when the day arrives, if it arrives at all in the shape we fear. Trying to carry tomorrow''s weight with today''s strength is exactly what leaves so many of us depleted.

So this first day of the week, try setting down anything that belongs to a day that has not yet come. What is actually in front of you today? Start there. That is where God meets you.', 'Salah satu kebiasaan diam-diam yang melelahkan pada pikiran yang cemas adalah berpindah waktu ke masa depan yang belum terjadi — melatih percakapan yang mungkin tidak pernah berlangsung, membayangkan hasil yang mungkin tidak pernah datang, menghabiskan energi hari ini untuk krisis khayalan hari esok. Ini kebiasaan yang hampir semua orang kenal, entah kekhawatiran itu tentang kesehatan, keuangan, hubungan, atau sekadar apa yang akan terjadi selanjutnya.

Yesus membahas hal ini secara langsung dalam Khotbah di Bukit, dengan kata-kata yang terdengar sangat praktis untuk sesuatu yang begitu kuno: janganlah kuatir akan hari esok, karena hari esok mempunyai kesusahannya sendiri, dan kesusahan sehari cukuplah untuk sehari. Ini bukan pengabaian terhadap kekhawatiran yang nyata. Ini adalah undangan untuk hidup di dalam hari yang sungguh diberikan kepada kita, bukan hari yang sedang kita bayangkan.

Ada semacam kemurahan hati yang tersembunyi dalam instruksi ini. Kita tidak dituntut memiliki kekuatan hari ini untuk setiap kesulitan yang mungkin dibawa hari esok, karena kekuatan itu belum diberikan — kekuatan itu akan diberikan ketika harinya tiba, jika memang tiba dalam bentuk yang kita takutkan. Mencoba memikul beban hari esok dengan kekuatan hari ini adalah persis yang membuat begitu banyak dari kita kehabisan tenaga.

Jadi pada hari pertama minggu ini, cobalah meletakkan apa pun yang menjadi milik hari yang belum tiba. Apa yang sungguh ada di hadapanmu hari ini? Mulailah dari situ. Di situlah Tuhan menjumpaimu.',
    'What worry about tomorrow are you carrying today that you can set down until it actually arrives?', 'Kekhawatiran tentang hari esok apa yang kaupikul hari ini, yang bisa kauletakkan sampai hari itu benar-benar tiba?',
    'Lord, I hand You the tomorrows I keep rehearsing. Help me live fully in today, trusting You already hold what is still to come. Amen.', 'Tuhan, aku menyerahkan kepada-Mu hari-hari esok yang terus kubayangkan. Tolong aku hidup sepenuhnya di hari ini, percaya bahwa Engkau sudah memegang apa yang masih akan datang. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Matthew 6:34', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Matius 6:34', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Already Known', 'Sudah Dikenal Sejak Semula',
    'There is something disorienting about an unwritten future — a blank page where we expected a plan. But Psalm 139 offers a striking counter-image: before a single day of your life was lived, all of them were already written in God''s book. Your future is not blank to Him. It has never been blank to Him.

This does not mean every detail is predetermined in a way that erases our choices or the real unpredictability of life. It means something gentler and just as powerful: nothing that unfolds in your future will catch God off guard. He is not discovering your story as it happens, scrambling to respond. He has already seen it, and He is already present in it.

For someone facing a genuinely unknown season — a health scare, a career change, a relationship in flux — this truth does not erase the uncertainty, but it changes its texture. The unknown-to-you is not unknown-to-Him. You are not walking into a void; you are walking into a day He already knows.

Let that settle over you today, not as an answer to every specific question, but as a floor beneath your feet. Whatever this week holds, it was never a surprise to the One who holds you.', 'Ada sesuatu yang membingungkan tentang masa depan yang belum tertulis — halaman kosong di tempat kita mengharapkan sebuah rencana. Tetapi Mazmur 139 menawarkan gambaran sebaliknya yang mencolok: sebelum satu hari pun dari hidupmu dijalani, semuanya sudah tertulis dalam kitab Tuhan. Masa depanmu tidak kosong bagi-Nya. Tidak pernah kosong bagi-Nya.

Ini bukan berarti setiap detail sudah ditentukan sedemikian rupa hingga menghapus pilihan kita atau ketidakpastian hidup yang nyata. Ini berarti sesuatu yang lebih lembut namun sama kuatnya: tidak ada yang terjadi di masa depanmu yang akan mengejutkan Tuhan. Ia tidak sedang menemukan kisahmu saat itu terjadi, tergesa-gesa menanggapinya. Ia sudah melihatnya, dan Ia sudah hadir di dalamnya.

Bagi seseorang yang menghadapi musim yang sungguh belum diketahui — kekhawatiran kesehatan, perubahan karier, hubungan yang belum menentu — kebenaran ini tidak menghapus ketidakpastian, tetapi mengubah nuansanya. Yang belum diketahui olehmu bukanlah yang belum diketahui oleh-Nya. Engkau tidak sedang melangkah ke dalam kehampaan; engkau sedang melangkah ke dalam hari yang sudah Ia kenal.

Biarkan kebenaran ini meresap hari ini, bukan sebagai jawaban atas setiap pertanyaan spesifik, melainkan sebagai pijakan di bawah kakimu. Apa pun yang dibawa minggu ini, itu tidak pernah menjadi kejutan bagi Dia yang memegangmu.',
    'How does it change your worry to know that your unknown future is already fully known to God?', 'Bagaimana kekhawatiranmu berubah ketika mengetahui bahwa masa depanmu yang belum diketahui itu sudah sepenuhnya diketahui oleh Tuhan?',
    'Father, thank You that nothing ahead of me is a surprise to You. Steady my heart with the truth that You already hold every day I have yet to live. Amen.', 'Bapa, terima kasih karena tidak ada apa pun di depanku yang mengejutkan bagi-Mu. Teguhkanlah hatiku dengan kebenaran bahwa Engkau sudah memegang setiap hari yang belum kujalani. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 139:16', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 139:16', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Something New in the Wilderness', 'Sesuatu yang Baru di Padang Belantara',
    'Endings are hard, even good ones. A season closing, a chapter finishing, a version of life we had grown used to giving way to something unfamiliar — all of it can feel like grief, even when we know change is coming for a reason. Isaiah spoke to a people who had lost nearly everything familiar, and even in that loss, he did not point them backward. He pointed them forward, toward something new that God was already doing.

''Do you not perceive it?'' is a striking question. It suggests that the new thing is not hidden from us out of cruelty, but that we are often too fixed on the wilderness, the wasteland, the loss, to notice the stream already beginning to break through. Hope for the future sometimes requires a shift in where we are looking, not just what we are looking at.

This does not minimize real loss. The wilderness in this passage is real; the wasteland is real. But God''s declared pattern throughout Scripture is that He is a God who makes ways where there were none, who brings water to dry, forgotten places. If He has done this before — and Scripture insists He has, again and again — there is reason to expect He can do it again in your own unknown season.

Wherever you feel like you are standing in a wasteland today, ask God to open your eyes to what He may already be doing there, springing up quietly beneath the surface of what looks, from where you stand, like nothing at all.', 'Akhir dari sesuatu itu sulit, bahkan yang baik sekalipun. Sebuah musim yang berakhir, bab yang selesai, versi kehidupan yang sudah kita kenal berganti dengan sesuatu yang asing — semuanya bisa terasa seperti dukacita, bahkan ketika kita tahu perubahan itu datang karena suatu alasan. Yesaya berbicara kepada umat yang telah kehilangan hampir semua yang familiar, dan bahkan dalam kehilangan itu, ia tidak menunjuk mereka ke belakang. Ia menunjuk mereka ke depan, menuju sesuatu yang baru yang sedang Tuhan kerjakan.

''Tidakkah kamu menyadarinya?'' adalah pertanyaan yang mencolok. Pertanyaan itu menunjukkan bahwa yang baru itu tidak disembunyikan dari kita karena kekejaman, tetapi bahwa kita sering kali terlalu terpaku pada padang belantara, tanah tandus, kehilangan itu, sampai tidak menyadari aliran air yang sudah mulai muncul. Pengharapan untuk masa depan kadang membutuhkan pergeseran ke arah mana kita memandang, bukan hanya apa yang kita pandang.

Ini tidak meremehkan kehilangan yang nyata. Padang belantara dalam nas ini nyata; tanah tandus itu nyata. Tetapi pola yang dinyatakan Tuhan sepanjang Alkitab adalah bahwa Ia adalah Tuhan yang membuat jalan di tempat yang tidak ada jalan, yang mendatangkan air ke tempat kering yang terlupakan. Jika Ia pernah melakukan ini sebelumnya — dan Alkitab menegaskan Ia melakukannya berulang-ulang — ada alasan untuk berharap Ia bisa melakukannya lagi dalam musimmu yang belum diketahui.

Di mana pun engkau merasa sedang berdiri di padang tandus hari ini, mintalah Tuhan membukakan matamu untuk melihat apa yang mungkin sedang Ia kerjakan di sana, bertunas diam-diam di bawah permukaan sesuatu yang, dari tempatmu berdiri, tampak seperti tidak ada apa-apa.',
    'Where in your life might God already be doing something new that you have been too focused on the loss to notice?', 'Di bagian mana dalam hidupmu Tuhan mungkin sedang mengerjakan sesuatu yang baru, yang belum kausadari karena terlalu terpaku pada kehilangan?',
    'God, open my eyes to what You are already doing in this wilderness season. Where I only see loss, help me perceive the new thing springing up. Amen.', 'Tuhan, bukalah mataku untuk melihat apa yang sedang Engkau kerjakan di musim padang belantara ini. Di tempat aku hanya melihat kehilangan, tolong aku menyadari sesuatu yang baru sedang bertunas. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 43:19', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 43:19', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'He Will Not Leave You', 'Ia Tidak Akan Meninggalkanmu',
    'Moses spoke these words to Joshua just before Israel entered a land they had never seen, led by a man who had never led before. It is hard to imagine a more fitting moment for a promise about the future — an entirely new chapter, an untested leader, and territory that held both promise and real danger.

What strikes many readers about this verse is its directness. It does not soften the unknown or pretend the road ahead is simple. It simply insists on a presence that will not waver: God himself goes before you, and he will be with you; he will never leave you nor forsake you. The uncertainty of the land ahead is met with the certainty of who is walking into it alongside you.

Most of our fear about the future is, underneath everything else, a fear of facing it unaccompanied — of walking into the new job, the empty house, the diagnosis, the goodbye, entirely alone. This promise speaks directly into that fear, not by predicting outcomes, but by guaranteeing companionship through whatever the outcome turns out to be.

You may be standing at your own edge of a new land today. Take courage, not because you know what is in it, but because you know who is already walking ahead of you into it, and who has promised never to turn back.', 'Musa mengucapkan kata-kata ini kepada Yosua tepat sebelum bangsa Israel memasuki tanah yang belum pernah mereka lihat, dipimpin oleh seorang yang belum pernah memimpin sebelumnya. Sulit membayangkan momen yang lebih tepat untuk sebuah janji tentang masa depan — sebuah bab yang sama sekali baru, seorang pemimpin yang belum teruji, dan wilayah yang menyimpan baik janji maupun bahaya yang nyata.

Yang menarik perhatian banyak pembaca dari ayat ini adalah kelugasannya. Ayat ini tidak melunakkan hal yang belum diketahui atau berpura-pura bahwa jalan di depan itu sederhana. Ayat ini hanya menegaskan sebuah kehadiran yang tidak akan goyah: TUHAN sendiri berjalan mendahuluimu, dan Ia akan menyertaimu; Ia tidak akan membiarkan engkau dan tidak akan meninggalkan engkau. Ketidakpastian tanah di depan dihadapi dengan kepastian tentang siapa yang berjalan bersamamu memasukinya.

Sebagian besar ketakutan kita tentang masa depan, jika ditelusuri, adalah ketakutan menghadapinya tanpa ditemani — memasuki pekerjaan baru, rumah yang kosong, diagnosis itu, perpisahan itu, sepenuhnya sendirian. Janji ini berbicara langsung ke dalam ketakutan itu, bukan dengan meramalkan hasilnya, melainkan dengan menjamin kebersamaan melalui apa pun hasil yang akan terjadi.

Mungkin hari ini engkau sedang berdiri di batas tanah barumu sendiri. Kuatkanlah hatimu, bukan karena engkau tahu apa yang ada di dalamnya, melainkan karena engkau tahu siapa yang sudah berjalan mendahuluimu memasukinya, dan yang telah berjanji tidak akan pernah berbalik.',
    'What ''new land'' are you facing right now, and what changes when you remember God has already gone ahead of you into it?', '''Tanah baru'' apa yang sedang kauhadapi sekarang, dan apa yang berubah ketika kauingat bahwa Tuhan sudah berjalan mendahuluimu memasukinya?',
    'Lord, thank You for going before me into what I cannot yet see. I don''t have to face this alone. Give me courage today, rooted in Your presence, not in my certainty. Amen.', 'Tuhan, terima kasih karena Engkau berjalan mendahuluiku memasuki apa yang belum bisa kulihat. Aku tidak harus menghadapi ini sendirian. Berikanlah aku keberanian hari ini, yang berakar pada kehadiran-Mu, bukan pada kepastianku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Deuteronomy 31:8', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Ulangan 31:8', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Strong and Courageous', 'Kuat dan Teguh Hati',
    'God''s command to Joshua is repeated so many times across just a few chapters that it is easy to miss how remarkable the repetition is: be strong and courageous. Not once, but again and again, as if God knew Joshua would need to hear it more than once to actually believe it under pressure.

It is worth noticing that this is a command, not a suggestion or a wish. Courage, in Scripture, is often treated less like a feeling that arrives and more like a choice that is made, sometimes daily, sometimes hour by hour. We do not wait to feel brave before stepping forward into an uncertain future; we choose to step forward, and courage often catches up to us along the way.

The reason given for this courage is not Joshua''s own competence or preparation — Scripture does not pretend he had it all figured out. The reason given is God''s presence: ''for the Lord your God will be with you wherever you go.'' The courage is borrowed courage, sourced entirely outside of ourselves.

If you need to hear this command more than once today, that is all right — Joshua did too. Be strong and courageous about whatever tomorrow holds, not because you have mastered it, but because the same God who was with Joshua wherever he went is with you wherever you are headed.', 'Perintah Tuhan kepada Yosua diulang begitu banyak kali hanya dalam beberapa pasal sehingga mudah untuk melewatkan betapa luar biasanya pengulangan itu: kuatkan dan teguhkanlah hatimu. Bukan hanya sekali, tetapi berulang-ulang, seolah Tuhan tahu Yosua perlu mendengarnya lebih dari sekali agar sungguh mempercayainya di bawah tekanan.

Perlu diperhatikan bahwa ini adalah sebuah perintah, bukan saran atau harapan. Keberanian, dalam Alkitab, sering diperlakukan bukan sebagai perasaan yang datang begitu saja, melainkan sebagai pilihan yang diambil, kadang setiap hari, kadang setiap jam. Kita tidak menunggu merasa berani sebelum melangkah maju ke dalam masa depan yang tidak pasti; kita memilih untuk melangkah maju, dan keberanian sering menyusul di sepanjang jalan.

Alasan yang diberikan untuk keberanian ini bukanlah kemampuan atau persiapan Yosua sendiri — Alkitab tidak berpura-pura bahwa ia sudah memahami segalanya. Alasan yang diberikan adalah kehadiran Tuhan: ''sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.'' Keberanian ini adalah keberanian pinjaman, bersumber sepenuhnya dari luar diri kita.

Jika hari ini engkau perlu mendengar perintah ini lebih dari sekali, tidak apa-apa — Yosua pun demikian. Kuatkan dan teguhkanlah hatimu tentang apa pun yang dibawa hari esok, bukan karena engkau telah menguasainya, melainkan karena Tuhan yang sama yang menyertai Yosua ke mana pun ia pergi, menyertaimu ke mana pun engkau menuju.',
    'Where do you need to choose courage today, even before the feeling of courage arrives?', 'Di mana engkau perlu memilih keberanian hari ini, bahkan sebelum perasaan berani itu datang?',
    'God, I choose courage today, not because I feel ready, but because You promise to go wherever I go. Strengthen my heart against fear and discouragement. Amen.', 'Tuhan, aku memilih keberanian hari ini, bukan karena aku merasa siap, melainkan karena Engkau berjanji akan pergi ke mana pun aku pergi. Kuatkanlah hatiku melawan rasa takut dan patah semangat. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Joshua 1:9', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yosua 1:9', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'A Very Present Help', 'Penolong yang Sangat Dekat',
    'Psalm 46 opens with one of the most quoted lines in all of Scripture, and part of why it endures is its refusal to promise the absence of trouble. It does not say God is a refuge from a world without earthquakes, floods, or upheaval. The psalm goes on to describe mountains falling into the sea and waters roaring — real, dramatic, frightening imagery. And still, in the middle of it, it declares: we will not fear.

That is the honest posture Scripture invites us into regarding the future — not a promise that nothing hard will happen, but a confidence that whatever happens, God is our refuge and strength, an ever-present help. Present, not distant. Available now, not merely someday.

This is especially good news for the parts of an unknown future that feel genuinely frightening — the health results still pending, the relationship still uncertain, the finances still unresolved. The psalm does not ask us to pretend those fears are small. It offers something to stand on in the middle of them: a very present help, close enough to reach for today.

Whatever mountain in your life feels like it is shaking today, you are invited to say what this psalm says — not because the ground has stopped moving, but because your help does not depend on the ground standing still.', 'Mazmur 46 dibuka dengan salah satu baris yang paling sering dikutip dalam seluruh Alkitab, dan sebagian alasan mengapa itu bertahan adalah karena penolakannya untuk menjanjikan ketiadaan kesulitan. Mazmur ini tidak berkata bahwa Tuhan adalah tempat perlindungan dari dunia tanpa gempa bumi, banjir, atau gejolak. Mazmur ini melanjutkan dengan menggambarkan gunung-gunung jatuh ke dalam laut dan air yang menderu — gambaran yang nyata, dramatis, dan menakutkan. Dan tetap, di tengah-tengahnya, mazmur ini menyatakan: kita tidak akan takut.

Itulah sikap jujur yang diundangkan Alkitab kepada kita tentang masa depan — bukan janji bahwa tidak akan ada hal sulit yang terjadi, melainkan keyakinan bahwa apa pun yang terjadi, Tuhan adalah tempat perlindungan dan kekuatan kita, penolong yang sangat dekat dalam kesesakan. Dekat, bukan jauh. Tersedia sekarang, bukan hanya kelak.

Ini menjadi kabar baik terutama bagi bagian-bagian dari masa depan yang belum diketahui yang sungguh terasa menakutkan — hasil pemeriksaan kesehatan yang masih menunggu, hubungan yang masih belum pasti, keuangan yang masih belum terselesaikan. Mazmur ini tidak meminta kita berpura-pura bahwa ketakutan itu kecil. Mazmur ini menawarkan sesuatu untuk dipijak di tengah-tengahnya: penolong yang sangat dekat, cukup dekat untuk diraih hari ini.

Gunung apa pun dalam hidupmu yang terasa sedang bergoncang hari ini, engkau diundang untuk mengatakan apa yang dikatakan mazmur ini — bukan karena tanah telah berhenti bergerak, melainkan karena pertolonganmu tidak bergantung pada tanah yang diam.',
    'What is currently shaking in your life, and what would it mean to declare ''we will not fear'' in the middle of it?', 'Apa yang saat ini sedang bergoncang dalam hidupmu, dan apa artinya menyatakan ''kita tidak akan takut'' di tengah-tengahnya?',
    'Lord, You are my refuge even when the ground beneath me shakes. Thank You for being an ever-present help, close enough to reach today. I choose not to fear. Amen.', 'Tuhan, Engkau adalah tempat perlindunganku bahkan ketika tanah di bawahku bergoncang. Terima kasih menjadi penolong yang sangat dekat, cukup dekat untuk kuraih hari ini. Aku memilih untuk tidak takut. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 46:1', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 46:2', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'New Every Morning', 'Baru Setiap Pagi',
    'It fits well to end a week about the unknown future with words that were themselves written in the middle of devastating loss. Lamentations is a book of grief, written after the fall of Jerusalem, and yet nestled inside its sorrow is one of the most hopeful declarations in all of Scripture: His mercies are new every morning; great is His faithfulness.

This is significant for how we hold the future. Faithfulness that is ''new every morning'' is not a single guarantee handed to us once, meant to last a lifetime on its own strength. It is a promise renewed daily, which means we are never asked to have enough faith or strength to cover every future morning at once. We are only asked to receive what is new today, trusting that tomorrow''s mercy will be waiting when tomorrow comes.

This is deeply freeing for anyone exhausted by trying to hold an entire uncertain future in their hands at once. You do not need tomorrow''s mercy today. You need today''s, and it has already been given. Tomorrow, when it arrives, will bring its own fresh supply.

As this week closes, whatever remains unresolved about your future, let this be your resting place: God''s faithfulness has never once failed to show up new each morning, and there is no reason to believe tomorrow will be the first exception. Great is His faithfulness — yesterday, today, and every morning still to come.', 'Sungguh tepat mengakhiri minggu tentang masa depan yang belum diketahui dengan kata-kata yang sendiri ditulis di tengah kehilangan yang mengerikan. Ratapan adalah kitab dukacita, ditulis setelah kejatuhan Yerusalem, namun tersemat di dalam kesedihannya adalah salah satu pernyataan paling penuh harapan dalam seluruh Alkitab: kasih setia-Nya tidak berkesudahan, rahmat-Nya tidak habis-habisnya, selalu baru tiap pagi; besar kesetiaan-Mu.

Ini penting untuk cara kita memandang masa depan. Kesetiaan yang ''baru setiap pagi'' bukanlah satu jaminan yang diberikan sekali, dimaksudkan bertahan seumur hidup dengan kekuatannya sendiri. Ini adalah janji yang diperbarui setiap hari, yang berarti kita tidak pernah dituntut memiliki cukup iman atau kekuatan untuk menutupi setiap pagi di masa depan sekaligus. Kita hanya diminta menerima apa yang baru hari ini, percaya bahwa rahmat hari esok akan menanti ketika hari esok tiba.

Ini sangat melegakan bagi siapa saja yang lelah mencoba menggenggam seluruh masa depan yang belum pasti sekaligus di tangan mereka. Engkau tidak membutuhkan rahmat hari esok hari ini. Engkau membutuhkan rahmat hari ini, dan itu sudah diberikan. Hari esok, ketika tiba, akan membawa pasokannya sendiri yang segar.

Saat minggu ini ditutup, apa pun yang masih belum terselesaikan tentang masa depanmu, biarlah ini menjadi tempatmu beristirahat: kesetiaan Tuhan belum pernah sekali pun gagal hadir baru setiap pagi, dan tidak ada alasan untuk percaya bahwa hari esok akan menjadi pengecualian yang pertama. Besar kesetiaan-Mu — kemarin, hari ini, dan setiap pagi yang masih akan datang.',
    'What would change if you only asked God for today''s mercy, trusting tomorrow''s will be there when tomorrow comes?', 'Apa yang akan berubah jika engkau hanya meminta rahmat Tuhan untuk hari ini, percaya bahwa rahmat hari esok akan ada saat hari esok tiba?',
    'Lord, thank You for mercy that is new every morning. I release my grip on tomorrow''s uncertainty and receive what You have for me today. Great is Your faithfulness. Amen.', 'Tuhan, terima kasih atas rahmat yang baru setiap pagi. Aku melepaskan genggamanku atas ketidakpastian hari esok dan menerima apa yang Kausediakan bagiku hari ini. Besar kesetiaan-Mu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Ratapan 3:22-23', 'TB', 1);

  -- Plan: A Hope Beyond the Horizon
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'A Hope Beyond the Horizon',
    'Pengharapan yang Melampaui Cakrawala',
    'Three days resting in the promise of what is to come',
    'Tiga Hari Beristirahat dalam Janji tentang yang Akan Datang',
    3,
    'A short three-day devotional for anyone whose hope has grown tired of resting on shifting circumstances. Instead of looking only at what might happen next year, these three days lift our eyes toward the eternal promises of Scripture — a hope anchored not in outcomes, but in the certainty of what God has already promised to make new.',
    'Renungan singkat tiga hari untuk siapa saja yang pengharapannya sudah lelah bersandar pada keadaan yang terus berubah. Alih-alih hanya menatap apa yang mungkin terjadi tahun depan, tiga hari ini mengangkat pandangan kita kepada janji-janji kekal dalam Alkitab — pengharapan yang berlabuh bukan pada hasil, melainkan pada kepastian tentang apa yang sudah Tuhan janjikan untuk dibarui.',
    '/images/devotions/a-hope-beyond-the-horizon.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Glory Still to Be Revealed', 'Kemuliaan yang Belum Dinyatakan',
    'There are seasons when our hope has been leaning on the wrong support for too long — hoping the diagnosis will clear, hoping the relationship will mend, hoping the job will finally stabilize things. These hopes are not wrong to have, but when they alone carry the full weight of our peace, they eventually buckle, because circumstances were never built to hold that much weight.

Paul, writing to the Romans, was no stranger to suffering — imprisonment, hardship, uncertainty about his own future were constant companions in his ministry. And yet he makes an extraordinary claim: our present sufferings are not worth comparing with the glory that will be revealed in us. Not because the suffering is small or unreal, but because what is coming is so much larger.

This is a different kind of hope than hoping things will work out this year. It is hope rooted in something that does not depend on this year, this decade, or even this life going the way we planned. It is hope in a glory already promised, already secured, waiting to be revealed regardless of how our present circumstances resolve.

If your hope feels tired today from carrying too much weight on temporary outcomes, let it rest instead on this eternal promise. Whatever this present season holds, it is not the whole story, and it is not the final word.', 'Ada musim-musim ketika pengharapan kita telah bersandar pada penopang yang salah terlalu lama — berharap hasil diagnosis akan membaik, berharap hubungan akan pulih, berharap pekerjaan akhirnya akan menstabilkan segalanya. Harapan-harapan ini tidak salah untuk dimiliki, tetapi ketika hanya harapan-harapan itu yang memikul seluruh beban kedamaian kita, pada akhirnya ia akan roboh, karena keadaan tidak pernah dirancang untuk menopang beban sebesar itu.

Paulus, yang menulis kepada jemaat di Roma, bukan orang asing terhadap penderitaan — pemenjaraan, kesulitan, ketidakpastian tentang masa depannya sendiri adalah teman tetap dalam pelayanannya. Namun ia membuat pernyataan yang luar biasa: penderitaan zaman sekarang tidak dapat dibandingkan dengan kemuliaan yang akan dinyatakan kepada kita. Bukan karena penderitaan itu kecil atau tidak nyata, melainkan karena yang akan datang jauh lebih besar.

Ini adalah jenis pengharapan yang berbeda dari sekadar berharap keadaan akan membaik tahun ini. Ini pengharapan yang berakar pada sesuatu yang tidak bergantung pada tahun ini, dekade ini, atau bahkan hidup ini berjalan sesuai rencana kita. Ini adalah pengharapan pada kemuliaan yang sudah dijanjikan, sudah dijamin, menanti untuk dinyatakan, terlepas dari bagaimana keadaan kita saat ini akan terselesaikan.

Jika pengharapanmu terasa lelah hari ini karena memikul terlalu banyak beban pada hasil-hasil yang sementara, biarlah ia beristirahat pada janji kekal ini sebaliknya. Apa pun yang dibawa musim sekarang ini, itu bukanlah keseluruhan kisah, dan itu bukanlah kata terakhir.',
    'What outcome have you been asking to carry the full weight of your hope, that really belongs on something more eternal?', 'Hasil apa yang selama ini kaumintai untuk memikul seluruh beban pengharapanmu, yang sebenarnya seharusnya bersandar pada sesuatu yang lebih kekal?',
    'Lord, my hope has grown tired from leaning on outcomes I cannot control. Anchor it instead in the glory You have promised. Help me trust that this present season is not the whole story. Amen.', 'Tuhan, pengharapanku telah lelah karena bersandar pada hasil-hasil yang tidak bisa kukendalikan. Berlabuhkanlah ia sebaliknya pada kemuliaan yang telah Kaujanjikan. Tolong aku percaya bahwa musim sekarang ini bukanlah keseluruhan kisah. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 8:18', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 8:18', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'He Will Wipe Every Tear', 'Ia Akan Menghapus Segala Air Mata',
    'Revelation is often read as a book of mystery and difficulty, but tucked near its close is one of the most tender images in all of Scripture: a new heaven and a new earth, God himself dwelling with His people, and His own hand wiping every tear from every eye. Death, mourning, crying, and pain are named specifically, and named as things that will pass away entirely.

It is worth sitting with the intimacy of that image rather than rushing past it. Not a distant deity observing sorrow from far off, but God himself, close enough to wipe tears personally, one by one. Whatever grief you are carrying about how your life or the world has unfolded, this passage promises it is not the final chapter of the story you are living.

This is the deepest well from which Christian hope for the future draws — not optimism that circumstances will improve, but certainty that the order of things itself will one day be made new. The old order of pain, loss, and death is described as passing away, replaced by something Scripture calls, simply, new.

You may not know what next year holds. But you can know this: there is a day coming when every tear you have ever cried will be personally wiped away by the hand of the One who promised it, and everything that has ever grieved you will have no place in what comes after.', 'Wahyu sering dibaca sebagai kitab yang misterius dan sulit, tetapi tersemat menjelang akhirnya adalah salah satu gambaran paling lembut dalam seluruh Alkitab: langit yang baru dan bumi yang baru, Allah sendiri diam bersama umat-Nya, dan tangan-Nya sendiri menghapus segala air mata dari setiap mata. Maut, perkabungan, ratap tangis, dan dukacita disebutkan secara khusus, dan disebutkan sebagai hal-hal yang akan lenyap sepenuhnya.

Layak untuk merenungkan keintiman gambaran itu, bukan sekadar melewatinya. Bukan sosok ilahi yang jauh mengamati kesedihan dari kejauhan, melainkan Allah sendiri, cukup dekat untuk menghapus air mata secara pribadi, satu per satu. Apa pun dukacita yang kaupikul tentang bagaimana hidupmu atau dunia ini berjalan, nas ini menjanjikan bahwa itu bukanlah bab terakhir dari kisah yang sedang kaujalani.

Inilah sumber terdalam dari mana pengharapan Kristen akan masa depan mengalir — bukan optimisme bahwa keadaan akan membaik, melainkan kepastian bahwa tatanan segala sesuatu itu sendiri suatu hari akan dibarui. Tatanan lama tentang dukacita, kehilangan, dan maut digambarkan berlalu, digantikan oleh sesuatu yang Alkitab sebut, sederhana saja, baru.

Engkau mungkin tidak tahu apa yang akan dibawa tahun depan. Tetapi engkau bisa tahu ini: ada hari yang akan datang ketika setiap air mata yang pernah kautangiskan akan dihapus secara pribadi oleh tangan Dia yang menjanjikannya, dan segala sesuatu yang pernah membuatmu berduka tidak akan memiliki tempat dalam apa yang datang sesudahnya.',
    'What grief or loss can you hold today knowing it will one day be personally wiped away by God?', 'Dukacita atau kehilangan apa yang bisa kaupikul hari ini, dengan mengetahui bahwa suatu hari itu akan dihapus secara pribadi oleh Tuhan?',
    'Lord, I long for the day You describe, when every tear is wiped away and pain has no more place. Until then, hold my grief gently, and let this promise steady my hope. Amen.', 'Tuhan, aku merindukan hari yang Kaugambarkan itu, ketika setiap air mata dihapus dan dukacita tidak lagi punya tempat. Sampai saat itu tiba, peganglah dukacitaku dengan lembut, dan biarlah janji ini meneguhkan pengharapanku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Revelation 21:1-4', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Wahyu 21:1-4', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'A Place Prepared for You', 'Tempat yang Telah Disediakan Bagimu',
    'Jesus spoke these words to His disciples on the night before His crucifixion, in the middle of their confusion and fear about what was about to happen. He did not offer them a detailed itinerary of the difficult hours ahead. He offered them something else entirely: the assurance of a prepared place, and a promise that He himself would come back for them.

''Let not your hearts be troubled,'' He begins, before He even explains why. That order matters. Peace is offered first, as an invitation, before the full picture is given — because full pictures were never the foundation of Christian hope. A trustworthy person''s word has always been enough.

There is something deeply personal in the phrase ''I go to prepare a place for you.'' Not a generic promise about an afterlife, but a specific act of preparation, undertaken by name, for people He loved. And the promise does not end at preparation — it ends with return: ''I will come back and take you to be with me.'' The hope offered here is not simply a place, but a person, one who has promised not to leave the story unfinished.

As this short devotional closes, let this be the resting place for whatever remains unknown in your future: a Savior who has already gone ahead to prepare, and who has promised to come back for you. Whatever is still uncertain about tomorrow, this much is settled — you are expected, and you are wanted, in the place already being prepared.', 'Yesus mengucapkan kata-kata ini kepada murid-murid-Nya pada malam sebelum penyaliban-Nya, di tengah kebingungan dan ketakutan mereka tentang apa yang akan segera terjadi. Ia tidak menawarkan kepada mereka rincian perjalanan tentang jam-jam sulit di depan. Ia menawarkan sesuatu yang sama sekali berbeda: jaminan tentang tempat yang telah disiapkan, dan janji bahwa Ia sendiri akan datang kembali untuk menjemput mereka.

"Janganlah gelisah hatimu," demikian Ia memulai, bahkan sebelum Ia menjelaskan alasannya. Urutan ini penting. Damai ditawarkan lebih dahulu, sebagai undangan, sebelum gambaran lengkap diberikan — karena gambaran lengkap tidak pernah menjadi dasar pengharapan Kristen. Perkataan seseorang yang layak dipercaya selalu sudah cukup.

Ada sesuatu yang sangat pribadi dalam frasa "Aku pergi ke situ untuk menyediakan tempat bagimu." Bukan janji umum tentang kehidupan setelah kematian, melainkan tindakan persiapan yang spesifik, dilakukan atas nama, untuk orang-orang yang Ia kasihi. Dan janji itu tidak berakhir pada persiapan saja — janji itu berakhir dengan kedatangan kembali: "Aku datang kembali dan membawa kamu ke tempat-Ku." Pengharapan yang ditawarkan di sini bukan sekadar sebuah tempat, melainkan seorang pribadi, yang telah berjanji tidak akan membiarkan kisah itu tak berkesudahan.

Saat renungan singkat ini ditutup, biarlah ini menjadi tempat peristirahatan bagi apa pun yang masih belum diketahui tentang masa depanmu: seorang Juruselamat yang telah pergi lebih dahulu untuk menyediakan tempat, dan yang telah berjanji akan datang kembali untuk menjemputmu. Apa pun yang masih belum pasti tentang hari esok, satu hal ini sudah pasti — engkau dinantikan, dan engkau diinginkan, di tempat yang sedang disediakan.',
    'How does knowing a specific place has been prepared for you change the weight of your uncertainty about tomorrow?', 'Bagaimana mengetahui bahwa sebuah tempat khusus telah disediakan bagimu mengubah beratnya ketidakpastianmu tentang hari esok?',
    'Jesus, thank You for going ahead to prepare a place for me and for promising to come back. Let not my heart be troubled by what I cannot yet see. I trust the One who has already gone before me. Amen.', 'Tuhan Yesus, terima kasih telah pergi lebih dahulu untuk menyediakan tempat bagiku dan telah berjanji akan datang kembali. Janganlah hatiku gelisah oleh apa yang belum bisa kulihat. Aku percaya kepada Dia yang telah berjalan mendahuluiku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'John 14:2-3', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yohanes 14:2-3', 'TB', 1);

  -- Sub-category: Renewed Hope After Despair --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Renewed Hope After Despair' AND parent_id = v_category_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Renewed Hope After Despair', 'Pengharapan yang Dipulihkan', v_category_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengharapan yang Dipulihkan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: After the Fall
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'After the Fall',
    'Setelah Jatuh',
    'Finding hope again when a dream falls apart',
    'Menemukan pengharapan kembali ketika impian runtuh',
    5,
    'A five-day devotion for anyone standing in the rubble of a plan that didn''t work out — a job lost, a relationship ended, a door that slammed shut. Through Job, Lamentations, and the early church, we walk the honest path from grief to renewed hope, learning that God specializes in second chapters.',
    'Renungan lima hari bagi siapa saja yang berdiri di antara puing-puing rencana yang tidak berhasil — pekerjaan yang hilang, hubungan yang berakhir, pintu yang tertutup rapat. Melalui kisah Ayub, Ratapan, dan gereja mula-mula, kita menapaki jalan yang jujur dari duka menuju pengharapan yang dipulihkan, dan belajar bahwa Allah ahli dalam menulis bab kedua.',
    '/images/devotions/after-the-fall.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Honesty of Ashes', 'Kejujuran di Antara Abu',
    'There is a particular kind of silence that follows a dream falling apart. It is not the peaceful silence of rest, but the hollow silence of a room after the furniture has been carried out. Job knew that silence. In one day he lost his children, his wealth, and his health, and Scripture tells us that he tore his robe, shaved his head, and fell to the ground. What is striking is not that he grieved, but how honestly he grieved — no performance, no forced smile, just a man on the ground telling the truth about his pain.

So many of us were taught, even with good intentions, that faith means skipping past the ashes as quickly as possible. We rush to say ''God is good'' before we have let ourselves say ''this hurts.'' But Job''s story teaches us that worship and grief are not enemies. He fell to the ground and worshiped — the two happened together, not one after the other. Hope that is renewed does not begin by pretending the fall never happened. It begins by sitting in the ashes long enough to tell God the truth.

When a job disappears, a marriage ends, or a long-held plan collapses, there is pressure — from ourselves and sometimes from others — to move on quickly, to have the redemptive lesson ready before the wound has even closed. But real restoration is slower and more honest than that. It asks us to name what we lost without minimizing it, and to bring that loss to God rather than manage it alone. This is not weak faith. It is the beginning of strong faith, because it refuses to build hope on a foundation of denial.

If you are in the ashes today, you are in good company. Job did not receive an explanation for his suffering — he received the presence of God, and eventually, a future he could not have written for himself. That is where this week begins: not with answers, but with permission to be honest. Before hope can be rebuilt, the ground has to be cleared, and clearing the ground starts with telling the truth about what fell.', 'Ada semacam kesunyian tertentu yang muncul setelah sebuah impian runtuh. Ini bukan kesunyian yang menenangkan seperti saat beristirahat, melainkan kesunyian yang hampa, seperti ruangan setelah semua perabotnya diangkut keluar. Ayub mengenal kesunyian itu. Dalam satu hari ia kehilangan anak-anaknya, hartanya, dan kesehatannya, dan Alkitab mencatat bahwa ia mengoyakkan jubahnya, mencukur kepalanya, lalu rebah ke tanah. Yang menakjubkan bukanlah bahwa ia berduka, melainkan betapa jujurnya ia berduka — tanpa berpura-pura, tanpa senyum yang dipaksakan, hanya seorang laki-laki yang rebah di tanah dan berkata jujur tentang rasa sakitnya.

Banyak dari kita diajar, meski dengan niat baik, bahwa iman berarti segera melewati abu itu secepat mungkin. Kita buru-buru berkata ''Allah itu baik'' sebelum kita membiarkan diri berkata ''ini menyakitkan.'' Namun kisah Ayub mengajarkan bahwa penyembahan dan dukacita bukanlah dua hal yang bertentangan. Ia rebah ke tanah dan menyembah — keduanya terjadi bersamaan, bukan yang satu sesudah yang lain. Pengharapan yang dipulihkan tidak dimulai dengan berpura-pura bahwa keruntuhan itu tidak pernah terjadi. Ia dimulai dengan duduk cukup lama di antara abu untuk berkata jujur kepada Allah.

Ketika pekerjaan hilang, pernikahan berakhir, atau rencana yang lama dipegang runtuh, ada tekanan — dari diri sendiri maupun kadang dari orang lain — untuk segera melangkah maju, untuk sudah punya pelajaran rohani yang siap diucapkan sebelum lukanya sempat menutup. Namun pemulihan yang sesungguhnya lebih lambat dan lebih jujur daripada itu. Ia menuntut kita menyebut apa yang hilang tanpa mengecilkannya, lalu membawa kehilangan itu kepada Allah, bukan mengelolanya sendirian. Ini bukan iman yang lemah. Ini justru awal dari iman yang kuat, karena ia menolak membangun pengharapan di atas fondasi penyangkalan.

Jika hari ini engkau sedang berada di antara abu, engkau sedang berada dalam kebersamaan yang baik. Ayub tidak menerima penjelasan atas penderitaannya — ia menerima kehadiran Allah, dan pada akhirnya, masa depan yang tidak pernah bisa ia rancang sendiri. Di situlah minggu ini dimulai: bukan dengan jawaban, melainkan dengan izin untuk jujur. Sebelum pengharapan dapat dibangun kembali, tanahnya perlu dibersihkan terlebih dahulu, dan membersihkan tanah dimulai dengan berkata jujur tentang apa yang telah runtuh.',
    'Naming a loss honestly before God is not a lack of faith — it is where rebuilt hope begins.', 'Menyebut kehilangan dengan jujur di hadapan Allah bukanlah kekurangan iman — di situlah pengharapan yang dipulihkan dimulai.',
    'Lord, I bring You the ashes I have been trying to hide. You already see what has fallen apart in my life, so I don''t have to protect You from my honesty. Sit with me here, and when I am ready, help me stand. Amen.', 'Tuhan, aku membawa kepada-Mu abu yang selama ini kucoba sembunyikan. Engkau sudah melihat apa yang runtuh dalam hidupku, jadi aku tidak perlu melindungi-Mu dari kejujuranku. Duduklah bersamaku di sini, dan saat aku siap, tolonglah aku untuk bangkit. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Job 1:20-21', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Ayub 1:20-21', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Mercies New Every Morning', 'Kasih Setia yang Baru Setiap Pagi',
    'The book of Lamentations is exactly what its name suggests — a raw, unfiltered cry over a city in ruins. The writer describes bitterness, affliction, and a soul bowed down within him. And then, right in the middle of that darkness, without warning or transition, he writes some of the most hope-filled words in all of Scripture: ''The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.'' Hope did not arrive because the ruins disappeared. It arrived because he remembered something true in the middle of something painful.

This is such an important pattern for anyone recovering from a major disappointment. We often think hope has to wait until circumstances improve — until the new job comes, until the relationship heals, until the door reopens. But biblical hope is not a reaction to good circumstances; it is a decision to remember God''s character even while the circumstances are still bad. The writer of Lamentations did not wait for Jerusalem to be rebuilt before he found something to hope in. He found it in the unchanging faithfulness of God, available to him that very morning.

There is real comfort in the word ''new.'' It means that yesterday''s failure does not have to define today. If you made a mistake, if a door closed because of something you did or didn''t do, if the disappointment still stings when you wake up — this verse says mercy is not rationed out once and then gone. It is renewed, freshly, every single morning, like manna in the wilderness that could not be stored up but was always sufficient for the day it was given.

So today, instead of trying to summon hope for the whole future at once, try something smaller and more honest: ask God for today''s mercy. Not a five-year plan, not a full explanation of why the setback happened — just enough light for this one morning. That is usually how hope gets rebuilt: not in a single leap, but morning by morning, mercy by mercy, until one day you look back and realize you are standing again.', 'Kitab Ratapan benar-benar seperti namanya — sebuah tangisan yang mentah dan tak tersaring atas sebuah kota yang telah menjadi reruntuhan. Penulisnya menggambarkan kepahitan, penderitaan, dan jiwa yang tertunduk di dalam dirinya. Namun tepat di tengah kegelapan itu, tanpa peringatan atau transisi, ia menuliskan salah satu kata-kata paling penuh pengharapan dalam seluruh Alkitab: ''Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi.'' Pengharapan itu datang bukan karena reruntuhan itu lenyap. Ia datang karena penulis mengingat sesuatu yang benar di tengah sesuatu yang menyakitkan.

Ini adalah pola yang sangat penting bagi siapa saja yang sedang pulih dari kekecewaan besar. Kita sering berpikir pengharapan harus menunggu sampai keadaan membaik — sampai pekerjaan baru datang, sampai hubungan pulih, sampai pintu terbuka kembali. Namun pengharapan yang alkitabiah bukanlah reaksi terhadap keadaan yang baik; ia adalah keputusan untuk mengingat karakter Allah bahkan ketika keadaan masih buruk. Penulis Ratapan tidak menunggu Yerusalem dibangun kembali sebelum ia menemukan sesuatu untuk diharapkan. Ia menemukannya dalam kesetiaan Allah yang tidak berubah, yang tersedia baginya pada pagi itu juga.

Ada penghiburan sejati dalam kata ''baru.'' Artinya, kegagalan kemarin tidak harus menentukan hari ini. Jika engkau membuat kesalahan, jika sebuah pintu tertutup karena sesuatu yang kaulakukan atau tidak kaulakukan, jika kekecewaan itu masih terasa perih saat engkau bangun — ayat ini berkata bahwa rahmat tidak dijatah sekali lalu habis. Rahmat itu diperbarui, dengan segar, setiap pagi, seperti manna di padang gurun yang tidak bisa disimpan namun selalu cukup untuk hari itu diberikan.

Jadi hari ini, alih-alih mencoba mengumpulkan pengharapan untuk seluruh masa depan sekaligus, cobalah sesuatu yang lebih kecil dan lebih jujur: mintalah rahmat hari ini kepada Allah. Bukan rencana lima tahun, bukan penjelasan lengkap mengapa kemunduran itu terjadi — cukup terang untuk pagi ini saja. Begitulah biasanya pengharapan dibangun kembali: bukan dalam satu lompatan, tetapi pagi demi pagi, rahmat demi rahmat, sampai suatu hari engkau menoleh ke belakang dan menyadari bahwa engkau sudah berdiri lagi.',
    'You don''t need hope for the whole future today — just enough mercy for this one morning.', 'Engkau tidak perlu pengharapan untuk seluruh masa depan hari ini — cukup rahmat yang secukupnya untuk pagi ini.',
    'Father, thank You that Your mercy does not run out, even after my worst days. I don''t ask You for the whole picture today — just enough grace to take one honest step forward. Renew my hope, morning by morning. Amen.', 'Bapa, terima kasih karena rahmat-Mu tidak pernah habis, bahkan setelah hari-hariku yang terburuk. Aku tidak meminta gambaran lengkap hari ini — cukup anugerah yang cukup untuk melangkah satu langkah dengan jujur. Perbaruilah pengharapanku, pagi demi pagi. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Ratapan 3:22-23', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'The Long Middle', 'Masa Peralihan yang Panjang',
    'One of the hardest parts of a major setback is not the moment it happens, but everything that comes after — the long middle where the old plan is gone and the new one hasn''t arrived yet. Job''s suffering did not resolve in a single dramatic scene. Between the disaster and the restoration lies most of the book: chapter after chapter of questions, arguments with well-meaning friends, and long silences from heaven. If you are in that long middle right now, Scripture does not shame you for still being there.

Paul writes something remarkable about this in-between space: that suffering produces perseverance, perseverance produces character, and character produces hope. Notice the order. Hope is not the first thing that appears after a disappointment — it is the last thing, built slowly through the very process we wish we could skip. This does not mean God causes our pain in order to teach us a lesson; it means that God is present and working even in the unglamorous middle, shaping something in us that a quick fix never could.

It''s tempting, in the middle, to believe that because the outcome hasn''t changed yet, nothing is happening. But perseverance is not passive waiting — it is active trust exercised one ordinary day at a time. Getting out of bed on a hard morning, showing up to a job search after another rejection, choosing to pray even when the prayer feels one-sided — these are not small things. They are the character being formed that Paul describes, and they are the very soil hope grows in.

So if today feels like the middle of the story rather than the resolution, take heart. The middle is not the absence of God''s work; it is often the location of it. Job''s friends thought his suffering meant God had abandoned him. They were wrong. And the hope that eventually met Job did not erase what he had endured — it stood on top of it, built by a God who was never absent, even in the silence.', 'Salah satu bagian tersulit dari sebuah kemunduran besar bukanlah saat kejadiannya, melainkan segala sesuatu yang datang sesudahnya — masa peralihan yang panjang, saat rencana lama sudah hilang namun rencana baru belum juga datang. Penderitaan Ayub tidak terselesaikan dalam satu adegan dramatis. Di antara bencana dan pemulihan terletak sebagian besar isi kitab itu: pasal demi pasal berisi pertanyaan, perdebatan dengan sahabat-sahabat yang bermaksud baik, dan kesunyian panjang dari langit. Jika engkau sedang berada di masa peralihan panjang itu sekarang, Alkitab tidak mempermalukanmu karena masih berada di sana.

Paulus menuliskan sesuatu yang luar biasa tentang ruang di antara ini: bahwa kesengsaraan menimbulkan ketekunan, ketekunan menimbulkan tahan uji, dan tahan uji menimbulkan pengharapan. Perhatikan urutannya. Pengharapan bukanlah hal pertama yang muncul setelah kekecewaan — ia adalah hal terakhir, dibangun secara perlahan melalui proses yang justru ingin kita lewati saja. Ini bukan berarti Allah menyebabkan penderitaan kita demi mengajarkan sebuah pelajaran; ini berarti Allah hadir dan bekerja bahkan di tengah masa peralihan yang tidak menarik itu, membentuk sesuatu dalam diri kita yang tidak bisa dihasilkan oleh solusi instan.

Sangat menggoda, di tengah masa peralihan itu, untuk percaya bahwa karena hasilnya belum berubah, tidak ada yang sedang terjadi. Namun ketekunan bukanlah menunggu secara pasif — ia adalah kepercayaan yang aktif dijalankan satu hari biasa demi satu hari biasa. Bangun dari tempat tidur pada pagi yang berat, tetap hadir dalam pencarian kerja setelah penolakan berikutnya, memilih untuk berdoa bahkan ketika doa itu terasa sepihak — ini semua bukan hal kecil. Inilah tahan uji yang dibentuk, yang digambarkan Paulus, dan inilah tanah tempat pengharapan bertumbuh.

Jadi jika hari ini terasa seperti bagian tengah cerita dan bukan penyelesaiannya, kuatkanlah hatimu. Bagian tengah bukanlah ketiadaan karya Allah; seringkali justru di situlah letak karya-Nya. Sahabat-sahabat Ayub mengira penderitaannya berarti Allah telah meninggalkannya. Mereka keliru. Dan pengharapan yang akhirnya menghampiri Ayub tidak menghapus apa yang telah ia alami — ia dibangun di atasnya, oleh Allah yang tidak pernah absen, bahkan dalam kesunyian.',
    'Feeling stuck in the middle doesn''t mean God has stopped working — it may mean He''s building something in you a quick fix never could.', 'Merasa terjebak di tengah bukan berarti Allah berhenti bekerja — bisa jadi Dia sedang membangun sesuatu dalam dirimu yang tidak akan pernah dihasilkan oleh solusi instan.',
    'Lord, this middle place is hard, and I don''t always see You working in it. Give me the strength to persevere in ordinary, unremarkable ways today, and trust that You are building something in me that I cannot yet see. Amen.', 'Tuhan, masa peralihan ini terasa berat, dan aku tidak selalu melihat Engkau bekerja di dalamnya. Berilah aku kekuatan untuk bertekun dalam hal-hal kecil dan biasa hari ini, dan aku percaya Engkau sedang membangun sesuatu dalam diriku yang belum bisa kulihat. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 5:3-4', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 5:3-4', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'A Future You Didn''t Plan', 'Masa Depan yang Tidak Kaurencanakan',
    'The promise in Jeremiah 29:11 is often quoted in isolation, framed on a wall, printed on a graduation card — and it is beautiful, but it means even more in its actual context. God spoke these words through Jeremiah to a people living in exile, far from home, grieving a life that had been taken from them by forces outside their control. This was not a promise given to people whose plans were on track. It was a promise given to people whose entire world had fallen apart.

That context matters for anyone whose own plans have collapsed. God''s declaration of a future and a hope was not conditional on Israel first fixing their situation, returning home, or figuring things out. It was spoken into the middle of their displacement, as an anchor to hold onto precisely because everything else felt uncertain. When your own plan falls apart — the career path, the relationship, the timeline you had mapped out — it can feel as though your future has been cancelled. This verse insists otherwise: God''s plans for you were never limited to the plan you lost.

This does not mean the new future will look like the old one. The exiles'' hope was not a return to life exactly as it had been before; it was a genuinely new chapter, with its own shape, written by God''s hand rather than theirs. Often the very insistence that our future has to look a certain way is what keeps us stuck grieving what didn''t happen instead of open to what could. Letting go of the blueprint we drew ourselves is painful, but it is also what makes room for the one God is drawing.

If you are wondering whether you still have a future worth hoping for, take this verse as it was originally given — not as a guarantee that things will go back to how they were, but as a promise that the God who spoke to the exiles is still writing futures out of ruins. Your setback is not the end of the story. It may simply be the page where the story turns.', 'Janji dalam Yeremia 29:11 sering dikutip secara terpisah, dibingkai di dinding, dicetak di kartu wisuda — dan itu memang indah, tetapi ayat ini memiliki makna yang lebih dalam lagi dalam konteks aslinya. Allah mengucapkan kata-kata ini melalui Yeremia kepada umat yang hidup di pembuangan, jauh dari rumah, berduka atas kehidupan yang telah direnggut oleh kekuatan-kekuatan di luar kendali mereka. Ini bukan janji yang diberikan kepada orang-orang yang rencananya berjalan lancar. Ini adalah janji yang diberikan kepada orang-orang yang seluruh dunianya telah runtuh.

Konteks itu penting bagi siapa saja yang rencananya sendiri telah runtuh. Pernyataan Allah tentang masa depan dan pengharapan itu bukan bersyarat pada Israel yang terlebih dahulu memperbaiki keadaan mereka, kembali ke rumah, atau menyelesaikan segalanya. Firman itu diucapkan di tengah pengungsian mereka, sebagai jangkar untuk dipegang justru karena segala sesuatu yang lain terasa tidak pasti. Ketika rencanamu sendiri runtuh — jalur karier, hubungan, garis waktu yang telah kaususun — rasanya seolah masa depanmu telah dibatalkan. Ayat ini menegaskan sebaliknya: rencana Allah bagimu tidak pernah terbatas pada rencana yang telah kauhilangkan.

Ini tidak berarti masa depan yang baru akan terlihat seperti masa lalu. Pengharapan orang-orang buangan itu bukanlah kembali ke kehidupan persis seperti sebelumnya; itu adalah bab yang benar-benar baru, dengan bentuknya sendiri, ditulis oleh tangan Allah, bukan tangan mereka. Seringkali justru pendirian kita bahwa masa depan harus terlihat dengan cara tertentu itulah yang membuat kita terjebak berduka atas apa yang tidak terjadi, alih-alih terbuka terhadap apa yang bisa terjadi. Melepaskan cetak biru yang kita gambar sendiri memang menyakitkan, tetapi itu juga yang memberi ruang bagi cetak biru yang sedang digambar Allah.

Jika engkau bertanya-tanya apakah engkau masih memiliki masa depan yang layak diharapkan, terimalah ayat ini sebagaimana awalnya diberikan — bukan sebagai jaminan bahwa segala sesuatu akan kembali seperti semula, melainkan sebagai janji bahwa Allah yang berbicara kepada orang-orang buangan itu masih menulis masa depan dari reruntuhan. Kemunduranmu bukanlah akhir dari cerita. Bisa jadi itu hanyalah halaman tempat cerita itu berbalik arah.',
    'God''s plans for you were never limited to the plan you lost.', 'Rencana Allah bagimu tidak pernah terbatas pada rencana yang telah kauhilangkan.',
    'Father, I release the blueprint I drew for my own life and ask You to show me the future You are writing instead. I don''t need it to look like what I lost — I just need to trust that You are still planning good for me. Amen.', 'Bapa, aku melepaskan cetak biru yang kubuat sendiri untuk hidupku dan memohon Engkau menunjukkan masa depan yang sedang Kaususun sebagai gantinya. Aku tidak perlu masa depan itu terlihat seperti apa yang kuhilangkan — aku hanya perlu percaya bahwa Engkau masih merancang kebaikan bagiku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Jeremiah 29:11', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yeremia 29:11', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Joy Comes With the Morning', 'Sukacita Datang Bersama Pagi',
    'We end this week where hope always seems to land — not with an explanation, but with a testimony. The psalmist writes, ''weeping may stay for the night, but rejoicing comes in the morning.'' It is a simple sentence, but it carries enormous compassion, because it does not deny the night. It names it. There is a night. There is weeping. The verse does not rush past that reality — it simply refuses to let the night have the final word.

If you have walked through this week honestly — sitting in the ashes, receiving new mercy each morning, persevering through the long middle, and daring to imagine a future you didn''t plan — you have been doing exactly what this verse describes. You have not skipped the weeping. You have let it be real. And that is precisely what makes the morning, when it comes, so trustworthy. It isn''t hope built on pretending the fall never happened. It''s hope built by someone who stayed present through the whole night and is still standing when the sun comes up.

It is worth saying plainly: the morning the psalmist describes rarely arrives all at once. More often it comes the way morning actually comes — gradually, with the sky lightening long before the sun is visible, so slowly you almost miss the moment the night officially ended. Renewed hope tends to work the same way. One day you notice you laughed without forcing it. One day you make a plan again without bracing for disappointment. One day the ache is still there, but it no longer runs the whole show. That is morning arriving.

Wherever you are on that spectrum today — deep in the night or watching the first gray light — you are not alone, and you have not been abandoned. The same God who let Job''s story include real devastation also let it include real restoration. He does both. He is present in your night, and He is the reason morning always, eventually, comes.', 'Kita mengakhiri minggu ini di tempat pengharapan selalu tampak berlabuh — bukan dengan penjelasan, melainkan dengan kesaksian. Pemazmur menulis, ''sebab sesaat saja Ia murka, tetapi seumur hidup Ia murah hati; sepanjang malam ada tangisan, menjelang pagi terdengar sorak-sorai.'' Ini kalimat yang sederhana, tetapi mengandung belas kasih yang luar biasa besar, karena ia tidak menyangkal adanya malam. Ia menyebutkan malam itu. Ada malam. Ada tangisan. Ayat ini tidak buru-buru melewati kenyataan itu — ia hanya menolak membiarkan malam memiliki kata akhir.

Jika engkau telah menjalani minggu ini dengan jujur — duduk di antara abu, menerima rahmat baru setiap pagi, bertekun melalui masa peralihan yang panjang, dan berani membayangkan masa depan yang tidak kaurencanakan — engkau sedang melakukan persis apa yang digambarkan ayat ini. Engkau tidak melompati tangisan itu. Engkau membiarkannya nyata. Dan justru itulah yang membuat pagi, ketika ia tiba, begitu dapat dipercaya. Ini bukan pengharapan yang dibangun dengan berpura-pura keruntuhan tidak pernah terjadi. Ini adalah pengharapan yang dibangun oleh seseorang yang tetap hadir sepanjang malam dan masih berdiri saat matahari terbit.

Perlu dikatakan dengan jelas: pagi yang digambarkan pemazmur jarang datang sekaligus. Lebih sering ia datang seperti pagi yang sesungguhnya datang — perlahan-lahan, dengan langit yang mulai terang jauh sebelum matahari terlihat, begitu lambat sehingga engkau hampir tidak menyadari saat malam itu resmi berakhir. Pengharapan yang dipulihkan biasanya bekerja dengan cara yang sama. Suatu hari engkau menyadari bahwa engkau tertawa tanpa dipaksakan. Suatu hari engkau membuat rencana lagi tanpa bersiap menghadapi kekecewaan. Suatu hari rasa sakit itu masih ada, tetapi ia tidak lagi mengendalikan segalanya. Itulah pagi yang tiba.

Di mana pun engkau berada pada rentang itu hari ini — jauh di dalam malam atau sedang memandang cahaya kelabu pertama — engkau tidak sendirian, dan engkau tidak ditinggalkan. Allah yang sama, yang membiarkan kisah Ayub mencakup kehancuran yang sungguh nyata, juga membiarkannya mencakup pemulihan yang sungguh nyata. Dia melakukan keduanya. Dia hadir dalam malammu, dan Dialah alasan mengapa pagi selalu, pada akhirnya, tiba.',
    'Morning rarely arrives all at once — but if you look closely, you may already see the first gray light.', 'Pagi jarang datang sekaligus — namun jika kaulihat baik-baik, mungkin engkau sudah bisa melihat cahaya kelabu yang pertama.',
    'Lord, thank You for staying with me through the night. I trust that You are the God of the morning too, and that the joy You promise is already on its way, even if I can''t see it yet. Restore my hope, one gray dawn at a time. Amen.', 'Tuhan, terima kasih karena Engkau tinggal bersamaku sepanjang malam. Aku percaya Engkau juga Allah yang empunya pagi, dan sukacita yang Kaujanjikan sedang dalam perjalanan, meski aku belum bisa melihatnya. Pulihkanlah pengharapanku, satu fajar kelabu demi satu fajar kelabu. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 30:5', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 30:6', 'TB', 1);

  -- Plan: Waters in the Wilderness
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Waters in the Wilderness',
    'Air di Padang Belantara',
    'Rekindling hope after a long, dry season of the soul',
    'Menyalakan kembali pengharapan setelah masa kering yang panjang bagi jiwa',
    7,
    'A seven-day devotion for those who have not experienced one dramatic loss, but a slow fading — months or years where faith has felt flat, prayer has felt empty, and hope has quietly gone dry. Moving through the Psalms, Isaiah, and the Gospel of John, this plan gently reawakens the soul one day at a time, trusting that God makes rivers appear in deserts that seemed permanent.',
    'Renungan tujuh hari bagi mereka yang tidak mengalami satu kehilangan besar yang dramatis, melainkan pudar yang perlahan — berbulan-bulan atau bertahun-tahun ketika iman terasa datar, doa terasa hampa, dan pengharapan diam-diam mengering. Melalui Mazmur, Kitab Yesaya, dan Injil Yohanes, renungan ini dengan lembut membangkitkan kembali jiwa satu hari demi satu hari, dengan keyakinan bahwa Allah dapat membuat sungai muncul di padang gurun yang tampak abadi.',
    '/images/devotions/waters-in-the-wilderness.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Naming the Drought', 'Menyebut Musim Kering Itu',
    'There is a kind of despair that doesn''t arrive with a single crashing event. It seeps in slowly, the way a well runs dry — not because someone poured it out all at once, but because, drop by drop over a long season, less and less came up from the ground. Many of us know this dryness well: prayer that once felt alive now feels like talking to a ceiling, worship that used to move us now passes by unnoticed, faith that used to feel like a relationship now feels like a routine we''re going through out of habit.

The psalmist gives words to exactly this experience: ''Why, my soul, are you downcast? Why so disturbed within me?'' What is remarkable is that he asks his own soul the question, as though observing it from the outside, puzzled by his own heaviness. He doesn''t have a single crisis to point to. He simply notices that something in him has gone quiet and low, and rather than ignoring it, he speaks directly to it.

This is the first, necessary step of a long dry season: naming it. It is tempting to either dramatize a slow fade into something more acute than it is, or to dismiss it entirely because ''nothing is technically wrong.'' Both responses skip the honest middle ground the psalmist models — simply noticing, without shame, that your soul has gone dry, and asking it, gently, what''s going on.

If you have been going through the motions for a while now — showing up to church, saying the prayers, doing what a person of faith does, but feeling very little as you do it — you are not alone, and you have not failed. You are in a dry season, not a dead one. And dry seasons, however long they last, are not the final word on a life. This week begins with simply telling the truth about the drought, so that later in the week we can talk honestly about the water.', 'Ada satu jenis keputusasaan yang tidak datang lewat satu peristiwa yang meruntuhkan. Ia meresap perlahan, seperti sebuah sumur yang mengering — bukan karena seseorang menumpahkannya sekaligus, melainkan karena, setetes demi setetes selama musim yang panjang, semakin sedikit air yang naik dari dalam tanah. Banyak dari kita mengenal kekeringan ini dengan baik: doa yang dulu terasa hidup kini terasa seperti bicara pada langit-langit, penyembahan yang dulu menggerakkan hati kini berlalu tanpa disadari, iman yang dulu terasa seperti sebuah hubungan kini terasa seperti rutinitas yang dijalani karena kebiasaan.

Pemazmur memberi kata-kata yang tepat untuk pengalaman ini: ''Mengapa engkau tertekan, hai jiwaku, dan gelisah dalam diriku?'' Yang luar biasa adalah bahwa ia bertanya kepada jiwanya sendiri, seolah mengamatinya dari luar, bingung dengan kemuramannya sendiri. Ia tidak memiliki satu krisis tertentu untuk ditunjuk. Ia hanya menyadari bahwa ada sesuatu di dalam dirinya yang telah menjadi sunyi dan rendah, dan alih-alih mengabaikannya, ia berbicara langsung kepadanya.

Inilah langkah pertama yang perlu diambil dalam musim kering yang panjang: menyebutnya dengan jelas. Sangat menggoda untuk mendramatisasi pudar yang perlahan menjadi sesuatu yang lebih parah daripada kenyataannya, atau justru mengabaikannya sepenuhnya karena ''sebenarnya tidak ada yang salah.'' Kedua respons itu melewati jalan tengah yang jujur yang dicontohkan pemazmur — yaitu sekadar menyadari, tanpa rasa malu, bahwa jiwamu telah mengering, dan bertanya kepadanya, dengan lembut, apa yang sedang terjadi.

Jika selama ini engkau menjalani hari-hari secara mekanis — hadir ke gereja, mengucapkan doa, melakukan apa yang dilakukan orang beriman, tetapi hampir tidak merasakan apa-apa saat melakukannya — engkau tidak sendirian, dan engkau tidak gagal. Engkau sedang berada di musim kering, bukan musim mati. Dan musim kering, betapa pun lamanya, bukanlah kata akhir dari sebuah kehidupan. Minggu ini dimulai dengan sekadar berkata jujur tentang kekeringan itu, supaya nanti di hari-hari berikutnya kita dapat berbicara dengan jujur tentang air.',
    'A dry season is not a dead one — naming the drought honestly is the first step toward water.', 'Musim kering bukanlah musim mati — menyebut kekeringan itu dengan jujur adalah langkah pertama menuju air.',
    'Lord, my soul feels dry and I''m not even sure why. I bring You this quiet heaviness instead of hiding it. Meet me in this dry season, and remind me that You have not gone anywhere, even when I feel very little. Amen.', 'Tuhan, jiwaku terasa kering dan aku bahkan tidak yakin mengapa. Aku membawa kepada-Mu kemuraman yang sunyi ini alih-alih menyembunyikannya. Jumpai aku dalam musim kering ini, dan ingatkanlah aku bahwa Engkau tidak pergi ke mana pun, bahkan ketika aku hampir tidak merasakan apa-apa. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 42:11', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 42:12', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'A Way in the Wasteland', 'Jalan di Padang Belantara',
    'Isaiah spoke to a people who had grown weary of waiting — exiles who had watched year after year pass with no sign that anything would change. Into that fatigue, God says something startling: ''See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.'' Notice that God doesn''t ask them to manufacture hope out of nothing. He points to something He is already doing, and simply asks them to notice it.

This is often exactly what a long dry season needs — not more effort from us, but better attention. When hope has worn thin over months or years, we tend to assume that because we can''t feel anything happening, nothing is. But Isaiah''s message suggests the opposite may be true: God may already be making a way in your wilderness, quietly, in ways that are easy to miss precisely because we''ve stopped expecting to see anything at all.

There''s something important, too, in the phrase ''streams in the wasteland.'' A wasteland, by definition, is not supposed to have water. That''s what makes it a wasteland. When God promises streams there, He isn''t promising to move you out of the dry place immediately — He''s promising that even in the dry place, He can make water appear where water has no business being. This is exactly the kind of hope a long dry season needs: not necessarily an escape from the season, but evidence of life within it.

So today, try something small: look for the new thing rather than assuming there isn''t one. It might be a person who reached out at the right moment, a verse that suddenly felt different than it has in years, an unexpected quiet moment of peace in an otherwise difficult week. These are not proof that the dry season is over. They are proof that God is still making streams, even here.', 'Yesaya berbicara kepada umat yang telah lelah menunggu — orang-orang buangan yang telah menyaksikan tahun demi tahun berlalu tanpa tanda bahwa apa pun akan berubah. Di tengah keletihan itu, Allah berkata sesuatu yang mengejutkan: ''Lihat, Aku hendak membuat sesuatu yang baru, yang sekarang sudah tumbuh, belum kamu ketahui? Aku hendak membuat jalan di padang gurun dan sungai-sungai di padang belantara.'' Perhatikan bahwa Allah tidak meminta mereka untuk memaksakan pengharapan dari kekosongan. Dia menunjuk pada sesuatu yang sudah Dia kerjakan, dan hanya meminta mereka untuk menyadarinya.

Inilah yang sering benar-benar dibutuhkan oleh musim kering yang panjang — bukan lebih banyak usaha dari kita, melainkan perhatian yang lebih baik. Ketika pengharapan telah aus selama berbulan-bulan atau bertahun-tahun, kita cenderung berasumsi bahwa karena kita tidak bisa merasakan apa pun sedang terjadi, maka memang tidak ada yang terjadi. Namun pesan Yesaya menunjukkan bahwa kebalikannya mungkin benar: Allah mungkin sedang membuat jalan di padang gurunmu, dengan diam-diam, dengan cara-cara yang mudah terlewat justru karena kita sudah berhenti berharap melihat apa pun.

Ada sesuatu yang penting pula dalam frasa ''sungai-sungai di padang belantara.'' Padang belantara, menurut definisinya, seharusnya tidak memiliki air. Itulah yang membuatnya menjadi padang belantara. Ketika Allah menjanjikan sungai di sana, Dia tidak sedang berjanji untuk segera mengeluarkanmu dari tempat kering itu — Dia berjanji bahwa bahkan di tempat kering itu, Dia dapat membuat air muncul di tempat yang seharusnya tidak ada air. Inilah tepatnya jenis pengharapan yang dibutuhkan musim kering yang panjang: bukan selalu pelarian dari musim itu, melainkan bukti kehidupan di dalamnya.

Jadi hari ini, cobalah sesuatu yang kecil: carilah hal baru itu alih-alih berasumsi bahwa tidak ada. Bisa jadi itu seseorang yang menghubungimu pada saat yang tepat, sebuah ayat yang tiba-tiba terasa berbeda dari yang pernah kaurasakan selama bertahun-tahun, sebuah momen damai yang tak terduga di tengah minggu yang sulit. Ini bukan bukti bahwa musim kering telah berakhir. Ini adalah bukti bahwa Allah masih membuat sungai-sungai, bahkan di sini.',
    'God may already be making a way in your wilderness — try looking for it instead of assuming it isn''t there.', 'Bisa jadi Allah sedang membuat jalan di padang gurunmu — cobalah mencarinya alih-alih berasumsi itu tidak ada.',
    'Lord, open my eyes to the new thing You may already be doing in this dry season. I don''t ask for a dramatic sign — just enough attention to notice the small streams You are making, even here. Amen.', 'Tuhan, bukalah mataku terhadap hal baru yang mungkin sedang Kaukerjakan dalam musim kering ini. Aku tidak meminta tanda yang dramatis — cukup perhatian yang cukup untuk menyadari sungai-sungai kecil yang sedang Kaubuat, bahkan di sini. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 43:19', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 43:19', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Waiting Without Weariness', 'Menantikan Tanpa Lelah',
    'Long dry seasons have a particular way of exhausting us that sudden crises don''t. A crisis mobilizes adrenaline; a slow drought mobilizes nothing except fatigue. Isaiah names this too, promising that ''those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.'' It''s worth noticing the order of that promise — soaring, then running, then walking. Even the strongest image comes last as walking, because walking, not soaring, is what most of a long season actually requires.

This matters because we sometimes measure our spiritual health by the soaring moments — the mountaintop worship experience, the answered prayer, the vivid sense of God''s presence — and quietly despair when a season only offers walking. But Isaiah puts walking in the very same promise as soaring. Persisting through an ordinary day without growing faint is not a lesser form of hope. It is hope, fully present, simply wearing its work clothes instead of its Sunday best.

The word ''renew'' is doing important work in this verse too. It doesn''t say those who hope in the Lord will avoid weariness altogether — it says their strength will be renewed, which assumes it will run out first. This is not a promise for people who never get tired. It''s a promise for people who do get tired, regularly, and need somewhere reliable to keep bringing that tiredness. Hoping in the Lord, in this verse, isn''t a single decision made once. It''s a posture returned to again and again, every time strength runs low.

If today all you can manage is walking — showing up, staying faithful in small things, not giving up even without a burst of inspiration — that is not a failure to hope. According to Isaiah, that is exactly what renewed strength looks like most days. Keep walking. The renewing is happening even when it doesn''t feel like it.', 'Musim kering yang panjang memiliki cara tersendiri untuk melelahkan kita yang berbeda dari krisis mendadak. Sebuah krisis menggerakkan adrenalin; kekeringan yang perlahan hanya menggerakkan keletihan. Yesaya juga menyebut hal ini, menjanjikan bahwa ''orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.'' Perlu diperhatikan urutan janji itu — terbang, lalu berlari, lalu berjalan. Bahkan gambaran paling kuat itu diletakkan terakhir sebagai berjalan, karena berjalan, bukan terbang, adalah apa yang sesungguhnya dibutuhkan oleh sebagian besar musim yang panjang.

Ini penting karena kita kadang mengukur kesehatan rohani kita dari momen-momen terbang — pengalaman penyembahan di puncak gunung, doa yang terjawab, kesadaran yang jelas akan kehadiran Allah — dan diam-diam putus asa ketika sebuah musim hanya menawarkan berjalan. Namun Yesaya menempatkan berjalan dalam janji yang sama persis dengan terbang. Bertahan melalui hari yang biasa tanpa menjadi lesu bukanlah bentuk pengharapan yang lebih rendah. Itu adalah pengharapan, hadir sepenuhnya, hanya mengenakan pakaian kerjanya, bukan pakaian terbaiknya.

Kata ''baru'' juga melakukan pekerjaan penting dalam ayat ini. Ayat itu tidak mengatakan bahwa orang yang menanti-nantikan TUHAN akan sepenuhnya terhindar dari kelelahan — ayat itu mengatakan bahwa kekuatan mereka akan diperbarui, yang mengandaikan bahwa kekuatan itu akan habis terlebih dahulu. Ini bukan janji bagi orang yang tidak pernah lelah. Ini adalah janji bagi orang yang memang lelah, secara berkala, dan membutuhkan tempat yang bisa diandalkan untuk terus membawa kelelahan itu. Menanti-nantikan TUHAN, dalam ayat ini, bukanlah satu keputusan yang dibuat sekali saja. Ini adalah sikap yang diulangi kembali, setiap kali kekuatan menipis.

Jika hari ini yang bisa kaulakukan hanyalah berjalan — tetap hadir, tetap setia dalam hal-hal kecil, tidak menyerah meski tanpa lonjakan inspirasi — itu bukan kegagalan untuk berharap. Menurut Yesaya, itulah tepatnya wujud kekuatan yang diperbarui pada kebanyakan hari. Teruslah berjalan. Pembaruan itu sedang terjadi bahkan ketika rasanya tidak demikian.',
    'Walking without fainting is still the promise fulfilled — most days of a long season look like walking, not soaring.', 'Berjalan tanpa menjadi lelah tetaplah janji yang digenapi — kebanyakan hari dalam musim yang panjang terlihat seperti berjalan, bukan terbang.',
    'Lord, I don''t have soaring energy today, and that''s alright. Renew whatever strength I need just to keep walking faithfully. Thank You that You meet me in ordinary perseverance, not only in mountaintop moments. Amen.', 'Tuhan, aku tidak memiliki energi untuk terbang hari ini, dan itu tidak apa-apa. Perbaruilah kekuatan apa pun yang kubutuhkan hanya untuk terus berjalan dengan setia. Terima kasih karena Engkau menjumpaiku dalam ketekunan yang biasa, bukan hanya dalam momen-momen puncak gunung. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Isaiah 40:31', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yesaya 40:31', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Waiting Souls, Watching for Dawn', 'Jiwa yang Menanti, Menantikan Fajar',
    'Psalm 130 gives us one of the most tender images of waiting in all of Scripture: ''I wait for the Lord, my whole being waits, and in his word I put my hope. I wait for the Lord more than watchmen wait for the morning, more than watchmen wait for the morning.'' The repetition is not an accident — the psalmist says it twice, as if trying to make sure we feel just how intensely a person can long for dawn after a long night on watch.

A night watchman''s waiting is a useful picture for a long dry season, because it is not passive. A watchman doesn''t fall asleep hoping morning arrives on its own; he stays alert, present, scanning the horizon, even when hours pass with no change. This is a very different posture than despair, even though from the outside they can look similar. Despair gives up looking. The watchman keeps watching, precisely because he trusts the morning is coming even though he cannot yet see it.

If your season of dryness has stretched on longer than you expected, this psalm doesn''t rush you past the waiting. It doesn''t offer you the dawn early just because you''re tired. Instead, it gives you good company — a psalmist who knew exactly what it felt like to strain toward a morning that hadn''t arrived yet, and who chose, in that in-between space, to keep hoping in God''s word rather than in his own feelings.

Today, consider adopting the watchman''s posture rather than either extreme — neither pretending the night isn''t long, nor giving up the watch altogether. Stay present. Keep your eyes toward the horizon. The psalmist''s confidence was not that the night would be short, but that morning, eventually, always comes for those who keep watching for it.', 'Mazmur 130 memberi kita salah satu gambaran penantian paling lembut dalam seluruh Alkitab: ''Aku menanti-nantikan TUHAN, jiwaku menanti-nantikan Dia, dan aku mengharapkan firman-Nya. Jiwaku mengharapkan Tuhan lebih dari pada pengawal mengharapkan pagi, lebih dari pada pengawal mengharapkan pagi.'' Pengulangan itu bukan kebetulan — pemazmur mengatakannya dua kali, seolah ingin memastikan kita benar-benar merasakan betapa dalamnya seseorang dapat merindukan fajar setelah semalaman berjaga.

Penantian seorang pengawal malam adalah gambaran yang berguna untuk musim kering yang panjang, karena itu bukanlah penantian yang pasif. Seorang pengawal tidak tertidur sambil berharap pagi datang dengan sendirinya; ia tetap waspada, hadir, mengamati cakrawala, bahkan ketika berjam-jam berlalu tanpa perubahan. Ini adalah sikap yang sangat berbeda dari keputusasaan, meski dari luar keduanya bisa tampak serupa. Keputusasaan berhenti mengamati. Sang pengawal terus mengamati, justru karena ia percaya pagi akan datang meski ia belum bisa melihatnya.

Jika musim kekeringanmu telah berlangsung lebih lama dari yang kauduga, mazmur ini tidak terburu-buru melewatkanmu dari penantian. Ia tidak menawarkan fajar lebih awal hanya karena engkau lelah. Sebaliknya, ia memberimu kebersamaan yang baik — seorang pemazmur yang tahu betul bagaimana rasanya berusaha keras menantikan pagi yang belum juga tiba, dan yang memilih, dalam ruang di antara itu, untuk terus berharap pada firman Allah, bukan pada perasaannya sendiri.

Hari ini, pertimbangkanlah mengambil sikap sang pengawal, bukan salah satu dari dua sikap ekstrem — tidak berpura-pura bahwa malam itu tidak panjang, juga tidak berhenti berjaga sepenuhnya. Tetaplah hadir. Arahkan matamu ke cakrawala. Keyakinan pemazmur bukanlah bahwa malam itu akan singkat, melainkan bahwa pagi, pada akhirnya, selalu datang bagi mereka yang terus menantikannya.',
    'The watchman doesn''t fall asleep waiting for morning — he stays present, trusting the dawn is coming even before he can see it.', 'Sang pengawal tidak tertidur menantikan pagi — ia tetap hadir, percaya fajar sedang datang bahkan sebelum ia bisa melihatnya.',
    'Lord, my whole being waits for You, even after this long night. Help me watch for the morning with patience instead of despair, trusting Your word more than my tired feelings. Amen.', 'Tuhan, seluruh diriku menanti-nantikan Engkau, bahkan setelah malam yang panjang ini. Tolonglah aku menantikan pagi dengan sabar, bukan dengan putus asa, dan percaya pada firman-Mu lebih daripada perasaanku yang lelah. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 130:5-6', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 130:5-6', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'A Spring Welling Up', 'Mata Air yang Memancar',
    'In John 4, Jesus meets a woman at a well in the heat of the day — an unusual hour to draw water, likely chosen because it meant avoiding the crowds and their judgment. Her life, as the conversation reveals, had been marked by disappointment after disappointment. And yet Jesus doesn''t lead with correction. He offers her water: ''whoever drinks the water I give them will never thirst. Indeed, the water I give them will become in them a spring of water welling up to eternal life.''

There is something significant in the shift from well to spring. A well requires you to keep coming back, lowering a bucket, drawing up what you need, day after day, always dependent on outside effort. A spring is different — it wells up from within, continuously, without you having to manually draw anything. Jesus is not describing a bigger bucket. He is describing a completely different source, one that doesn''t run dry the way our own efforts eventually do.

This matters enormously for a long dry season, because so much of our spiritual fatigue comes from treating faith like a well we have to keep drawing from through sheer discipline — more prayer, more effort, more trying to feel something. Jesus offers this woman, and offers us, something we don''t have to manufacture: a spring that He places within us, that works even when we are too tired to keep drawing water ourselves.

If you have been running on empty, exhausted from trying to keep your own well full, today''s invitation is simple: come to Jesus honestly, the way this woman did, in the middle of the day, without pretense. You don''t need a fuller bucket. You need what only He can give — a spring welling up from within, sustaining you not because you worked hard enough, but because He put it there.', 'Dalam Yohanes 4, Yesus bertemu seorang perempuan di sebuah sumur pada siang hari yang terik — waktu yang tidak biasa untuk mengambil air, kemungkinan dipilih agar ia bisa menghindari orang banyak dan penghakiman mereka. Hidupnya, seperti yang terungkap dalam percakapan itu, ditandai oleh kekecewaan demi kekecewaan. Namun Yesus tidak memulai dengan teguran. Ia menawarkan air kepadanya: ''barangsiapa minum air yang akan Kuberikan kepadanya, ia tidak akan haus untuk selama-lamanya. Sebaliknya air yang akan Kuberikan kepadanya, akan menjadi mata air di dalam dirinya, yang terus-menerus memancar sampai kepada hidup yang kekal.''

Ada sesuatu yang penting dalam pergeseran dari sumur menjadi mata air. Sebuah sumur menuntutmu untuk terus kembali, menurunkan timba, mengambil apa yang kaubutuhkan, hari demi hari, selalu bergantung pada usaha dari luar. Mata air berbeda — ia memancar dari dalam, secara terus-menerus, tanpa perlu kauambil secara manual. Yesus tidak sedang menggambarkan timba yang lebih besar. Ia sedang menggambarkan sumber yang sama sekali berbeda, yang tidak mengering seperti usaha kita sendiri pada akhirnya mengering.

Ini sangat penting bagi musim kering yang panjang, karena sebagian besar kelelahan rohani kita berasal dari memperlakukan iman seperti sumur yang harus terus kita timba melalui disiplin semata — lebih banyak doa, lebih banyak usaha, lebih banyak mencoba merasakan sesuatu. Yesus menawarkan kepada perempuan ini, dan menawarkan kepada kita, sesuatu yang tidak perlu kita ciptakan sendiri: mata air yang Dia tempatkan di dalam diri kita, yang bekerja bahkan ketika kita terlalu lelah untuk terus menimba air sendiri.

Jika selama ini engkau berjalan dengan tangki yang kosong, lelah mencoba menjaga sumurmu sendiri tetap penuh, undangan hari ini sederhana: datanglah kepada Yesus dengan jujur, seperti perempuan ini, di tengah hari, tanpa berpura-pura. Engkau tidak membutuhkan timba yang lebih besar. Engkau membutuhkan apa yang hanya bisa Dia berikan — mata air yang memancar dari dalam, menopangmu bukan karena engkau bekerja cukup keras, melainkan karena Dia menempatkannya di sana.',
    'You don''t need a bigger bucket for your dry well — you need the spring Jesus places within you, one that doesn''t depend on your own effort.', 'Engkau tidak membutuhkan timba yang lebih besar untuk sumurmu yang kering — engkau membutuhkan mata air yang Yesus tempatkan di dalam dirimu, yang tidak bergantung pada usahamu sendiri.',
    'Jesus, I am tired of trying to keep my own well full. Give me the living water You promised — a spring within me that doesn''t run dry when my own strength does. I come to You honestly, in the middle of my ordinary day. Amen.', 'Yesus, aku lelah mencoba menjaga sumurku sendiri tetap penuh. Berikanlah aku air hidup yang Kaujanjikan — mata air di dalam diriku yang tidak kering ketika kekuatanku sendiri habis. Aku datang kepada-Mu dengan jujur, di tengah hariku yang biasa. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'John 4:14', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Yohanes 4:14', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'The Valley That Becomes a Spring', 'Lembah yang Berubah Menjadi Mata Air',
    'Psalm 84 contains a small phrase easy to skip past, but full of meaning for anyone in a long dry season: ''As they pass through the Valley of Baca, they make it a place of springs.'' Baca means weeping — this was a real, dry, difficult valley that pilgrims had to cross on their way to worship in Jerusalem. The psalmist doesn''t pretend the valley isn''t there, and he doesn''t reroute around it. He says something far more hopeful: the very people passing through the valley of weeping are the ones who turn it into a place of springs.

This is such a different picture than simply waiting to be rescued from a hard season. It suggests something active and almost countercultural: that our passing through — our continuing to walk, continuing to worship, continuing to trust even in the valley — is itself part of what transforms it. The spring doesn''t appear before the valley, removing the need to walk through it. It appears because of the walking, in the walking, through people who refused to let the valley have the last word.

If you have been in a valley of weeping for a long season, this verse doesn''t ask you to feel differently about the valley before it can become anything else. It simply invites you to keep walking through it toward worship, trusting that the walking itself is not wasted. Every small act of continuing — a prayer prayed without feeling, a hymn sung out of habit, a decision to trust one more day — may be, even now, quietly turning your own Baca into a place of springs.

You may not see the spring yet. Pilgrims walking through the middle of the valley rarely do. But the psalm''s promise stands: this valley, too, walked through with even the smallest faith, does not have to remain only dry.', 'Mazmur 84 memuat sebuah frasa kecil yang mudah terlewat, tetapi penuh makna bagi siapa saja yang berada dalam musim kering yang panjang: ''Apabila melintasi lembah Baka, mereka membuatnya menjadi tempat yang bermata air.'' Baka berarti tangisan — ini adalah lembah nyata, kering, dan sulit yang harus dilalui para peziarah dalam perjalanan menuju penyembahan di Yerusalem. Pemazmur tidak berpura-pura lembah itu tidak ada, dan ia tidak mencari jalan memutar untuk menghindarinya. Ia mengatakan sesuatu yang jauh lebih penuh pengharapan: orang-orang yang melintasi lembah tangisan itu sendirilah yang mengubahnya menjadi tempat yang bermata air.

Ini adalah gambaran yang sangat berbeda dari sekadar menunggu untuk diselamatkan dari musim yang sulit. Ini menunjukkan sesuatu yang aktif dan hampir melawan arus: bahwa perjalanan kita melintasinya — kita yang terus berjalan, terus menyembah, terus percaya bahkan di dalam lembah — itu sendiri adalah bagian dari apa yang mengubahnya. Mata air itu tidak muncul sebelum lembah, menghapus kebutuhan untuk melintasinya. Ia muncul karena perjalanan itu, di dalam perjalanan itu, melalui orang-orang yang menolak membiarkan lembah itu memiliki kata akhir.

Jika engkau telah berada di lembah tangisan untuk musim yang panjang, ayat ini tidak memintamu untuk merasa berbeda tentang lembah itu sebelum ia dapat berubah menjadi sesuatu yang lain. Ia hanya mengundangmu untuk terus berjalan melintasinya menuju penyembahan, percaya bahwa perjalanan itu sendiri tidak sia-sia. Setiap tindakan kecil untuk terus melangkah — doa yang dipanjatkan tanpa perasaan, pujian yang dinyanyikan karena kebiasaan, keputusan untuk percaya satu hari lagi — mungkin, bahkan sekarang, sedang diam-diam mengubah Bakamu sendiri menjadi tempat yang bermata air.

Mungkin engkau belum melihat mata air itu. Para peziarah yang melintasi tengah-tengah lembah jarang melihatnya. Namun janji mazmur ini tetap berlaku: lembah ini pun, dilintasi bahkan dengan iman yang paling kecil sekalipun, tidak harus tetap kering selamanya.',
    'Your continuing to walk through this valley — even without much feeling — may itself be turning it into a place of springs.', 'Perjalananmu terus melintasi lembah ini — bahkan tanpa banyak perasaan — mungkin justru sedang mengubahnya menjadi tempat yang bermata air.',
    'Lord, I am walking through my own valley of weeping, and I don''t always feel hope while I walk. Use even my small, faithful steps to turn this dry place into springs, in Your timing, not mine. Amen.', 'Tuhan, aku sedang melintasi lembah tangisanku sendiri, dan aku tidak selalu merasakan pengharapan saat berjalan. Pakailah bahkan langkah-langkahku yang kecil dan setia untuk mengubah tempat kering ini menjadi mata air, menurut waktu-Mu, bukan waktuku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Psalm 84:5-6', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Mazmur 84:6-7', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'Overflowing Again', 'Melimpah Kembali',
    'We close this week with a benediction Paul wrote near the end of his letter to the Romans: ''May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.'' It is worth noticing that Paul calls God ''the God of hope'' — not simply a God who occasionally gives hope, but one whose very character is the source of it. If your own hope has run dry, that does not mean the source has run dry. It never can.

This verse also names the process honestly: joy and peace come first, ''as you trust'' — an ongoing posture, not a one-time decision — and the overflow of hope follows, by the power of the Holy Spirit, not by the strength of our own willpower. This is deeply good news for anyone who has spent a long season trying to talk themselves back into hope through sheer determination. You were never meant to manufacture this on your own. It is a gift given, not a mood forced.

Think back over this week: naming the drought honestly, learning to notice the new thing God is already doing, discovering that walking without fainting is itself the promise fulfilled, keeping watch like a patient sentry, receiving living water instead of drawing from an empty well, and trusting that even your ordinary faithfulness through the valley is quietly becoming a spring. None of that was hope forced into existence. It was hope slowly being restored, the way a dry season always eventually gives way to rain — not because the ground worked hard enough, but because the rain was never withheld forever.

Wherever you are as this week ends — still mostly dry, or noticing the first small green shoots — trust that the God of hope is not finished with this season. He fills. He causes overflow. And a long dry season, walked through honestly with Him, is never wasted. It becomes, in His hands, the very ground where hope grows deepest roots.', 'Kita mengakhiri minggu ini dengan berkat yang dituliskan Paulus menjelang akhir suratnya kepada jemaat di Roma: ''Semoga Allah, sumber pengharapan, memenuhi kamu dengan segala sukacita dan damai sejahtera dalam iman kamu, supaya oleh kekuatan Roh Kudus kamu berlimpah-limpah dalam pengharapan.'' Perlu diperhatikan bahwa Paulus menyebut Allah sebagai ''sumber pengharapan'' — bukan sekadar Allah yang kadang-kadang memberi pengharapan, melainkan Allah yang karakter-Nya sendiri adalah sumber pengharapan itu. Jika pengharapanmu sendiri telah mengering, itu tidak berarti sumbernya telah mengering. Sumber itu tidak akan pernah bisa mengering.

Ayat ini juga menyebutkan prosesnya dengan jujur: sukacita dan damai sejahtera datang terlebih dahulu, ''dalam iman kamu'' — sebuah sikap yang berlanjut, bukan keputusan sekali jadi — dan limpahan pengharapan mengikutinya, oleh kekuatan Roh Kudus, bukan oleh kekuatan kemauan kita sendiri. Ini adalah kabar baik yang sangat mendalam bagi siapa saja yang telah menghabiskan musim yang panjang mencoba membujuk diri sendiri kembali ke dalam pengharapan melalui tekad semata. Engkau tidak pernah dimaksudkan untuk menciptakan ini sendirian. Ini adalah anugerah yang diberikan, bukan suasana hati yang dipaksakan.

Renungkan kembali minggu ini: menyebut kekeringan dengan jujur, belajar menyadari hal baru yang sudah dikerjakan Allah, menemukan bahwa berjalan tanpa menjadi lelah itu sendiri adalah janji yang digenapi, tetap berjaga seperti seorang penjaga yang sabar, menerima air hidup alih-alih menimba dari sumur yang kosong, dan percaya bahwa bahkan kesetiaanmu yang biasa dalam melintasi lembah itu diam-diam sedang menjadi mata air. Tidak satu pun dari itu adalah pengharapan yang dipaksakan untuk ada. Itu adalah pengharapan yang perlahan-lahan dipulihkan, seperti musim kering yang pada akhirnya selalu memberi jalan bagi hujan — bukan karena tanah bekerja cukup keras, melainkan karena hujan itu tidak pernah ditahan selamanya.

Di mana pun engkau berada saat minggu ini berakhir — masih sebagian besar kering, atau mulai menyadari tunas-tunas hijau pertama — percayalah bahwa Allah sumber pengharapan belum selesai dengan musim ini. Dia memenuhi. Dia menyebabkan limpahan. Dan musim kering yang panjang, dilalui dengan jujur bersama-Nya, tidak pernah sia-sia. Di tangan-Nya, musim itu menjadi tanah tempat pengharapan menumbuhkan akar yang paling dalam.',
    'Hope is not something you manufacture through willpower — it is a gift that overflows from the God of hope by His Spirit.', 'Pengharapan bukanlah sesuatu yang kauciptakan melalui kemauan — ia adalah anugerah yang melimpah dari Allah sumber pengharapan oleh Roh-Nya.',
    'God of hope, thank You for staying faithful through this whole dry season, even when I couldn''t feel You near. Fill me now with joy and peace as I trust You, and let hope overflow in me again, by Your Spirit and not by my own effort. Amen.', 'Allah sumber pengharapan, terima kasih karena Engkau tetap setia sepanjang musim kering ini, bahkan ketika aku tidak bisa merasakan-Mu dekat. Penuhilah aku sekarang dengan sukacita dan damai sejahtera saat aku percaya kepada-Mu, dan biarlah pengharapan melimpah lagi dalam diriku, oleh Roh-Mu dan bukan oleh usahaku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Romans 15:13', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Roma 15:13', 'TB', 1);

  -- Plan: One More Step
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'One More Step',
    'Satu Langkah Lagi',
    'A short, honest path back from the edge of giving up',
    'Jalan pendek dan jujur untuk kembali dari ambang menyerah',
    3,
    'A compact three-day devotion for the moment when hope feels not just faded but gone — when giving up seems like the only honest option left. Through the disciples on the road to Emmaus and the honest words of Paul, this short plan doesn''t rush toward easy answers; it simply offers a hand for one more step, and then another.',
    'Renungan tiga hari yang ringkas untuk saat ketika pengharapan terasa bukan hanya pudar, melainkan lenyap — ketika menyerah tampak seperti satu-satunya pilihan yang jujur. Melalui kisah dua murid dalam perjalanan ke Emaus dan kata-kata jujur Paulus, renungan singkat ini tidak terburu-buru menuju jawaban mudah; ia hanya mengulurkan tangan untuk satu langkah lagi, lalu satu langkah lagi.',
    '/images/devotions/one-more-step.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Walking Away, Not Alone', 'Berjalan Menjauh, Namun Tak Sendirian',
    'On the afternoon of that first Easter, two disciples were walking away from Jerusalem toward a village called Emmaus, and Scripture tells us plainly what filled the road beneath their feet: disappointment. They had hoped Jesus was the one who would redeem Israel, and now He was dead, and whatever they had hoped for seemed to have died with Him. They were not walking toward something. They were walking away — away from the place where their hope had been buried, quite literally, three days before.

If you have ever felt like giving up, this scene may be more familiar to you than any triumphant Bible story. These were not strangers to faith; they were people who had walked with Jesus, who had believed, who had built their lives around a hope that now seemed completely finished. And in their grief, they did what many of us do — they started walking away, rehearsing the disappointment out loud to each other, unable to see any way forward.

Here is the detail worth holding onto today: ''as they talked and discussed these things with each other, Jesus himself came up and walked along with them.'' He did not appear to stop them from walking. He joined them in the walking. Their eyes were kept from recognizing Him, so for a long stretch of that road, they had no idea that hope itself was walking beside them, matching their pace, listening to their disappointment without rushing to fix it.

If today you feel like you are walking away rather than toward anything — tired, discouraged, unsure hope is even real anymore — this story says something important before it says anything else: you may not be walking alone, even if it feels that way. Sometimes the very presence that will restore your hope is already beside you, on the road, before you have any idea it''s there.', 'Pada sore hari Paskah pertama itu, dua murid berjalan menjauh dari Yerusalem menuju sebuah desa bernama Emaus, dan Alkitab dengan jelas menceritakan apa yang memenuhi jalan di bawah kaki mereka: kekecewaan. Mereka telah berharap bahwa Yesuslah yang akan membebaskan Israel, dan sekarang Dia telah mati, dan apa pun yang mereka harapkan tampaknya telah mati bersama-Nya. Mereka tidak sedang berjalan menuju sesuatu. Mereka sedang berjalan menjauh — menjauh dari tempat pengharapan mereka telah dikuburkan, secara harfiah, tiga hari sebelumnya.

Jika engkau pernah merasa ingin menyerah, adegan ini mungkin lebih familier bagimu daripada kisah Alkitab yang penuh kemenangan mana pun. Mereka bukan orang asing bagi iman; mereka adalah orang-orang yang telah berjalan bersama Yesus, yang telah percaya, yang telah membangun hidup mereka di atas sebuah pengharapan yang kini tampak telah sepenuhnya berakhir. Dan dalam duka mereka, mereka melakukan apa yang sering kita lakukan — mereka mulai berjalan menjauh, saling mengulang kekecewaan itu satu sama lain, tidak melihat jalan ke depan.

Inilah detail yang patut dipegang hari ini: ''Sementara mereka bercakap-cakap dan bertukar pikiran, Yesus sendiri mendekati mereka, lalu berjalan bersama-sama dengan mereka.'' Dia tidak muncul untuk menghentikan mereka dari berjalan. Dia bergabung dengan mereka dalam perjalanan itu. Mata mereka tertutup sehingga mereka tidak mengenal-Nya, jadi untuk sebagian panjang jalan itu, mereka sama sekali tidak tahu bahwa pengharapan itu sendiri sedang berjalan di samping mereka, menyamai langkah mereka, mendengarkan kekecewaan mereka tanpa buru-buru memperbaikinya.

Jika hari ini engkau merasa sedang berjalan menjauh alih-alih menuju sesuatu — lelah, patah semangat, tidak yakin apakah pengharapan itu masih nyata — kisah ini mengatakan sesuatu yang penting sebelum mengatakan hal lain: mungkin engkau tidak berjalan sendirian, bahkan jika rasanya demikian. Kadang kehadiran yang justru akan memulihkan pengharapanmu sudah berada di sampingmu, di jalan itu, sebelum engkau menyadari bahwa Dia ada di sana.',
    'Even when you feel like you''re walking away from hope entirely, you may not be walking alone.', 'Bahkan ketika kaurasa dirimu berjalan menjauh sepenuhnya dari pengharapan, mungkin engkau tidak berjalan sendirian.',
    'Lord, right now I feel like I''m walking away rather than toward anything good. If You are near me on this road even though I can''t see You, make Yourself known in Your own time. Until then, thank You for walking beside me. Amen.', 'Tuhan, saat ini aku merasa sedang berjalan menjauh, bukan menuju sesuatu yang baik. Jika Engkau dekat denganku di jalan ini meski aku tidak bisa melihat-Mu, nyatakanlah diri-Mu pada waktu-Mu sendiri. Sampai saat itu, terima kasih karena Engkau berjalan di sampingku. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Luke 24:15', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lukas 24:15', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Hearts That Burned Before They Understood', 'Hati yang Berkobar Sebelum Mereka Mengerti',
    'As the two disciples walked, the stranger beside them began to speak — not offering quick comfort, but walking them slowly through Scripture, helping them see their own disappointment in a larger story they had not yet learned to read correctly. They didn''t recognize Him yet. They didn''t have their hope restored yet, not fully. But something in them started to shift before they understood anything at all: ''Were not our hearts burning within us while he talked with us on the road?''

This detail matters so much for anyone standing right at the edge of giving up. The disciples'' hearts began to warm before their eyes were opened — the feeling came before the full understanding did. This is often how renewed hope actually works. We tend to think we need the whole picture restored before we can feel anything again. But sometimes a small warmth returns first — a verse that lands differently than it used to, an unexpected moment of peace, a flicker of something that isn''t quite hope yet but also isn''t nothing — long before we can explain why.

If you cannot honestly say today that you have hope, but you notice even the smallest ember of warmth — willingness to keep reading this devotion, for instance, or a flicker of curiosity about whether things could be different — do not dismiss it as insignificant. The disciples'' burning hearts were the first sign that their walk away from hope was quietly turning into a walk back toward it, even while their minds were still catching up.

You don''t have to feel fully hopeful today for hope to be returning. Sometimes it starts as a small burning you can''t quite name, on an ordinary road, before you even realize who has been walking beside you the whole time.', 'Saat kedua murid itu berjalan, orang asing di samping mereka mulai berbicara — bukan menawarkan penghiburan instan, melainkan menuntun mereka pelan-pelan melalui Kitab Suci, membantu mereka melihat kekecewaan mereka sendiri dalam sebuah kisah yang lebih besar yang belum mereka pelajari untuk dibaca dengan benar. Mereka belum mengenali-Nya. Pengharapan mereka belum sepenuhnya dipulihkan. Namun sesuatu dalam diri mereka mulai bergeser sebelum mereka memahami apa pun sama sekali: ''Bukankah hati kita berkobar-kobar, ketika Ia berbicara dengan kita di tengah jalan?''

Detail ini sangat penting bagi siapa saja yang berdiri tepat di ambang menyerah. Hati kedua murid itu mulai menghangat sebelum mata mereka terbuka — perasaan itu datang sebelum pemahaman penuh datang. Begitulah seringkali pengharapan yang dipulihkan sesungguhnya bekerja. Kita cenderung berpikir kita membutuhkan gambaran utuh dipulihkan sebelum kita bisa merasakan apa pun lagi. Namun kadang kehangatan kecil kembali lebih dulu — sebuah ayat yang terasa berbeda dari sebelumnya, sebuah momen damai yang tak terduga, secercah sesuatu yang belum sepenuhnya pengharapan tetapi juga bukan kekosongan — jauh sebelum kita bisa menjelaskan mengapa.

Jika hari ini engkau tidak bisa berkata jujur bahwa engkau memiliki pengharapan, tetapi engkau menyadari bahkan bara sekecil apa pun dari kehangatan — kesediaan untuk terus membaca renungan ini, misalnya, atau secercah rasa penasaran apakah keadaan bisa berbeda — jangan menganggapnya remeh. Hati kedua murid yang berkobar itu adalah tanda pertama bahwa perjalanan mereka menjauh dari pengharapan diam-diam berbalik menjadi perjalanan kembali kepadanya, bahkan sementara pikiran mereka masih menyusul.

Engkau tidak perlu merasa sepenuhnya penuh pengharapan hari ini agar pengharapan itu sedang kembali. Kadang ia dimulai sebagai kobaran kecil yang belum bisa kausebut namanya, di jalan yang biasa, bahkan sebelum engkau menyadari siapa yang sejak tadi berjalan di sampingmu.',
    'You don''t need the full picture restored to notice a small warmth returning — that warmth may be hope, on its way back.', 'Engkau tidak butuh gambaran utuh dipulihkan untuk menyadari kehangatan kecil kembali — kehangatan itu mungkin pengharapan, dalam perjalanan kembali.',
    'Lord, I don''t have full hope back yet, but if there is even a small warmth in me today, I offer it to You honestly. Keep speaking to me on this road, even before I fully understand. Amen.', 'Tuhan, aku belum sepenuhnya memiliki pengharapan kembali, tetapi jika ada bahkan sedikit kehangatan dalam diriku hari ini, aku mempersembahkannya kepada-Mu dengan jujur. Teruslah berbicara kepadaku di jalan ini, bahkan sebelum aku sepenuhnya mengerti. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Luke 24:32', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, 'Lukas 24:32', 'TB', 1);

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Struck Down, Not Destroyed', 'Dihempaskan, Tetapi Tidak Binasa',
    'Paul was no stranger to feeling like giving up. Writing to the church in Corinth, he doesn''t offer polished, distant encouragement — he describes his own experience with startling honesty: ''hard pressed on every side, but not crushed; perplexed, but not in despair; persecuted, but not abandoned; struck down, but not destroyed.'' Notice that Paul does not deny the pressure, the confusion, or the very real feeling of being struck down. He simply insists that none of those things got the final word.

This is such an important distinction for anyone at the edge of giving up: hope is not the absence of despair-shaped feelings. Paul was perplexed. He felt struck down. If he could say that and still write of not being destroyed, then feeling close to giving up does not disqualify you from also being held. Both things were true for Paul at once, and both can be true for you — the honest weight of how hard this is, and the quiet, stubborn fact that you have not been abandoned.

Over these three short days, we have not tried to rush you into feeling hopeful. We walked beside your disappointment, the way Jesus walked beside two disciples who thought their hope had died. We noticed that a small ember of warmth can return before full understanding does. And today, we end with Paul''s own testimony that being pressed does not mean being crushed, and that even a giving-up kind of day is not the same as actually being destroyed.

If all you can manage today is one more step — one more prayer, one more page, one more decision not to walk away completely — that is enough. It was enough for two disciples on the Emmaus road, whose hearts burned before they understood, and it was enough for Paul, who kept writing hope-filled letters from prison cells. You are not required to feel strong today. You are only asked to take one more step, and trust that you are not carrying it alone.', 'Paulus bukanlah orang asing bagi perasaan ingin menyerah. Menulis kepada jemaat di Korintus, ia tidak menawarkan penghiburan yang dipoles dan berjarak — ia menggambarkan pengalamannya sendiri dengan kejujuran yang mengejutkan: ''kami ditindas dari segala pihak, namun tidak terjepit; kami habis akal, namun tidak putus asa; kami dianiaya, namun tidak ditinggalkan sendirian; kami dihempaskan, namun tidak binasa.'' Perhatikan bahwa Paulus tidak menyangkal tekanan, kebingungan, atau perasaan sungguh nyata dihempaskan. Ia hanya menegaskan bahwa tidak satu pun dari hal-hal itu memiliki kata akhir.

Ini adalah pembedaan yang sangat penting bagi siapa saja yang berada di ambang menyerah: pengharapan bukanlah ketiadaan perasaan seperti keputusasaan. Paulus habis akal. Ia merasa dihempaskan. Jika ia bisa mengatakan itu dan tetap menulis bahwa ia tidak binasa, maka merasa dekat dengan menyerah tidak mendiskualifikasimu dari juga sedang dipegang teguh. Kedua hal itu benar bagi Paulus sekaligus, dan keduanya bisa benar bagimu juga — beratnya keadaan ini yang sungguh jujur, dan fakta yang tenang namun teguh bahwa engkau tidak ditinggalkan.

Selama tiga hari singkat ini, kami tidak mencoba menggesa-gesamu untuk segera merasa penuh pengharapan. Kami berjalan di samping kekecewaanmu, seperti Yesus berjalan di samping dua murid yang mengira pengharapan mereka telah mati. Kami menyadari bahwa bara kecil kehangatan dapat kembali sebelum pemahaman penuh datang. Dan hari ini, kami mengakhirinya dengan kesaksian Paulus sendiri bahwa ditindas bukan berarti terjepit, dan bahkan hari yang penuh dorongan untuk menyerah pun tidak sama dengan benar-benar binasa.

Jika hari ini yang bisa kaulakukan hanyalah satu langkah lagi — satu doa lagi, satu halaman lagi, satu keputusan lagi untuk tidak sepenuhnya berjalan pergi — itu sudah cukup. Itu sudah cukup bagi dua murid di jalan Emaus, yang hatinya berkobar sebelum mereka mengerti, dan itu sudah cukup bagi Paulus, yang terus menulis surat-surat penuh pengharapan dari dalam penjara. Engkau tidak dituntut untuk merasa kuat hari ini. Engkau hanya diminta untuk mengambil satu langkah lagi, dan percaya bahwa engkau tidak memikulnya sendirian.',
    'Feeling struck down today does not mean you are destroyed — both can be honestly true, and you are still held.', 'Merasa dihempaskan hari ini tidak berarti engkau binasa — keduanya bisa benar dengan jujur, dan engkau masih dipegang teguh.',
    'Lord, today I may only manage one more step, and I ask You to accept that as enough. Thank You that being pressed is not the same as being crushed, and that I have not been abandoned, even on days when it feels that way. Walk with me into tomorrow. Amen.', 'Tuhan, hari ini mungkin aku hanya sanggup mengambil satu langkah lagi, dan aku memohon Engkau menerima itu sebagai cukup. Terima kasih karena ditindas tidak sama dengan terjepit, dan aku tidak ditinggalkan, bahkan pada hari-hari ketika rasanya demikian. Berjalanlah bersamaku menuju hari esok. Amin.'
  ) RETURNING id INTO v_day_id;
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '2 Corinthians 4:8-9', 'WEB', 0);
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, '2 Korintus 4:8-9', 'TB', 1);

END $$;
