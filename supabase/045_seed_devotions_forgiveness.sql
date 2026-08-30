
-- 045_seed_devotions_forgiveness.sql
-- Seeds the "Forgiveness" devotion category tree and plans
-- from Gallery/Devotional/forgiveness_devotions.csv.

DO $$
DECLARE
  v_forgiveness_id UUID;
  v_cat_id UUID;
  v_plan_id UUID;
  v_day_id UUID;
BEGIN
  -- Top-level category ------------------------------------------------------
  SELECT id INTO v_forgiveness_id FROM public.devotion_categories
    WHERE name = 'Forgiveness' AND parent_id IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_forgiveness_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Forgiveness', 'Pengampunan', NULL)
      RETURNING id INTO v_forgiveness_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Pengampunan'
      WHERE id = v_forgiveness_id;
  END IF;

  DELETE FROM public.devotion_plans WHERE title = 'Letting Go of the Grudge';
  DELETE FROM public.devotion_plans WHERE title = 'Forgiveness as a Daily Choice';
  DELETE FROM public.devotion_plans WHERE title = 'When They Never Say Sorry';
  DELETE FROM public.devotion_plans WHERE title = 'Beyond Shame';
  DELETE FROM public.devotion_plans WHERE title = 'The Open Door';
  DELETE FROM public.devotion_plans WHERE title = 'Truly Forgiven';
  DELETE FROM public.devotion_plans WHERE title = 'Letting Go of Yesterday';
  DELETE FROM public.devotion_plans WHERE title = 'Enough, Not Perfect';
  DELETE FROM public.devotion_plans WHERE title = 'No Condemnation';
  DELETE FROM public.devotion_plans WHERE title = 'Before It Hardens';
  DELETE FROM public.devotion_plans WHERE title = 'Letting the Anger Go';
  DELETE FROM public.devotion_plans WHERE title = 'Choosing Peace Over the Replay';


  -- Sub-category: Forgiving Others --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Forgiving Others' AND parent_id = v_forgiveness_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Forgiving Others', 'Mengampuni Orang Lain', v_forgiveness_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Mengampuni Orang Lain'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Letting Go of the Grudge
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Letting Go of the Grudge',
    'Melepaskan Dendam',
    'A short path back to peace with someone who hurt you',
    'Jalan singkat menuju damai dengan orang yang menyakitimu',
    3,
    'A three-day plan for anyone carrying the weight of a friend or family betrayal. Through the story of Joseph and the words of Christ, these readings walk gently toward the decision to set down a grudge and open your hands again.',
    'Rencana tiga hari bagi siapa saja yang menanggung beban pengkhianatan dari sahabat atau keluarga. Melalui kisah Yusuf dan perkataan Kristus, renungan ini menuntun perlahan menuju keputusan untuk meletakkan dendam dan membuka tangan kembali.',
    '/images/devotions/letting-go-of-the-grudge.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Weight We Carry', 'Beban yang Kita Pikul',
    'There is a particular kind of tired that comes from carrying an old hurt. It is not the tiredness of a long day of work, but the tiredness of replaying a conversation for the hundredth time, of flinching when a name comes up, of rehearsing what we wish we had said. Many of us know this weight well. It might be a friend who said something cutting and never took it back, a sibling who chose themselves over us at a moment we needed them, or a parent whose disappointment still echoes decades later. Whatever its shape, the weight is real, and pretending it isn''t there rarely makes it lighter.

Scripture does not shy away from this kind of pain. The story of Joseph is, at its heart, a story about betrayal by the people closest to him. His own brothers, driven by jealousy, sold him into slavery and let their father believe he was dead. Years later, when Joseph rose to power in Egypt and his brothers stood before him unaware of who he was, he had every worldly justification to make them suffer. He held the kind of leverage most of us only dream of having over the people who hurt us.

Instead, when Joseph finally reveals himself, he does something remarkable: he weeps so loudly the whole household hears him. Grief and forgiveness, it turns out, are not opposites. Joseph does not pretend the betrayal didn''t happen or that it didn''t cost him years of his life. He simply refuses to let it write the ending of his story. That refusal is where forgiveness begins for many of us too — not in forgetting, but in deciding the wound will not have the final word.

If you are carrying something today, let this be permission to name it honestly before God. You do not have to minimize what happened to begin healing from it. Joseph''s tears were not a sign of weakness; they were the doorway through which forgiveness walked in. The invitation over these three days is simply to start walking that same doorway, one honest step at a time.', 'Ada jenis lelah tertentu yang muncul karena memikul luka lama. Ini bukan lelah karena hari kerja yang panjang, melainkan lelah karena memutar ulang sebuah percakapan untuk yang keseratus kalinya, terkejut saat sebuah nama disebut, atau membayangkan apa yang seharusnya kita katakan. Banyak dari kita mengenal beban ini dengan baik. Bisa jadi itu seorang sahabat yang berkata menyakitkan dan tidak pernah menariknya kembali, saudara yang mementingkan diri sendiri saat kita membutuhkannya, atau orang tua yang kekecewaannya masih bergema puluhan tahun kemudian. Apa pun bentuknya, beban itu nyata, dan berpura-pura tidak ada jarang membuatnya lebih ringan.

Alkitab tidak menghindari jenis penderitaan ini. Kisah Yusuf, pada intinya, adalah kisah tentang pengkhianatan oleh orang-orang terdekatnya. Saudara-saudaranya sendiri, didorong oleh cemburu, menjualnya menjadi budak dan membiarkan ayah mereka percaya bahwa ia telah mati. Bertahun-tahun kemudian, ketika Yusuf naik menjadi penguasa di Mesir dan saudara-saudaranya berdiri di hadapannya tanpa menyadari siapa dia, ia memiliki setiap alasan duniawi untuk membuat mereka menderita. Ia memegang jenis kekuasaan yang hanya bisa diimpikan kebanyakan dari kita atas orang-orang yang menyakiti kita.

Namun, ketika Yusuf akhirnya menyatakan dirinya, ia melakukan sesuatu yang luar biasa: ia menangis begitu keras hingga seluruh rumah mendengarnya. Ternyata, kesedihan dan pengampunan bukanlah lawan. Yusuf tidak berpura-pura bahwa pengkhianatan itu tidak pernah terjadi atau tidak merenggut bertahun-tahun hidupnya. Ia hanya menolak membiarkan luka itu menulis akhir kisahnya. Penolakan itulah yang menjadi titik awal pengampunan bagi banyak dari kita juga — bukan dengan melupakan, tetapi dengan memutuskan bahwa luka itu tidak akan memiliki kata terakhir.

Jika hari ini engkau sedang memikul sesuatu, biarlah ini menjadi izin untuk menyebutkannya dengan jujur di hadapan Allah. Engkau tidak perlu mengecilkan apa yang terjadi untuk mulai sembuh darinya. Air mata Yusuf bukan tanda kelemahan; itu adalah pintu tempat pengampunan masuk. Ajakan selama tiga hari ini sederhana: mulai melangkah melalui pintu yang sama itu, satu langkah jujur setiap kalinya.',
    'Naming a hurt honestly is not the opposite of forgiveness — it is often the first step toward it.', 'Menyebut luka dengan jujur bukanlah lawan dari pengampunan — seringkali itu justru langkah pertama menuju ke sana.',
    'Lord, You see the weight I have been carrying. I bring it to You honestly today, without pretending it doesn''t hurt. Begin in me what You began in Joseph — a heart willing, in time, to let the wound stop writing the story. Amen.', 'Tuhan, Engkau melihat beban yang selama ini kupikul. Hari ini aku membawanya kepada-Mu dengan jujur, tanpa berpura-pura bahwa itu tidak menyakitkan. Mulailah dalam diriku apa yang Engkau mulai dalam Yusuf — hati yang mau, pada waktunya, membiarkan luka itu berhenti menulis kisahku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Genesis 50:20', 'WEB', 'You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Kejadian 50:20', 'TB', 'Memang kamu telah mereka-rekakan yang jahat terhadap aku, tetapi Allah telah mereka-rekakannya untuk kebaikan, dengan maksud melakukan seperti yang terjadi sekarang ini, yaitu memelihara hidup suatu bangsa yang besar.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Seventy-Seven Times', 'Tujuh Puluh Kali Tujuh',
    'Peter thought he was being generous. Come to Jesus and ask how many times he should forgive someone who wrongs him, he suggests seven — a number that already felt like a stretch, given that Jewish tradition of the time often taught forgiving three times was enough. Jesus'' answer must have landed like a splash of cold water: not seven, but seventy-seven times. He wasn''t handing Peter a math problem to track on his fingers. He was telling him, and us, that forgiveness isn''t a quota you fill and then close the book on. It''s a posture you keep choosing.

This can be discouraging news if we thought forgiveness was supposed to be a single decisive moment after which the pain simply vanishes. For a betrayal by someone close to us — a friend, a sibling, a parent — the hurt often resurfaces in waves. A memory triggers it at an unexpected moment. A family gathering brings the old tension back to the surface. We forgive, and then we find we need to forgive again, not because our first forgiveness failed, but because love toward someone who wounded us is rarely a one-time transaction.

Jesus'' seventy-seven is not a burden meant to exhaust us; it''s a mercy meant to free us from perfectionism about our own healing. You are allowed to forgive someone today and still feel a sting when you see them next week. That sting doesn''t undo your forgiveness — it simply means you''re human, walking a real road rather than performing a scripted reconciliation. What matters is which direction you keep facing when the sting comes: back toward the grudge, or forward toward the freedom Christ is offering.

Consider the person whose betrayal weighs on you now. You are not asked to have this fully resolved today. You are asked only to take one more of those seventy-seven steps — to choose, again, in this moment, to release rather than clench. That is enough for today. Tomorrow you may need to choose it again, and that will be enough for tomorrow too.', 'Petrus mengira dirinya sedang bermurah hati. Ia datang kepada Yesus dan bertanya berapa kali ia harus mengampuni orang yang bersalah kepadanya, lalu mengusulkan tujuh kali — angka yang sudah terasa berlebihan, mengingat tradisi Yahudi pada masa itu sering mengajarkan bahwa mengampuni tiga kali sudah cukup. Jawaban Yesus pasti terasa seperti siraman air dingin: bukan tujuh kali, melainkan tujuh puluh kali tujuh kali. Ia tidak sedang memberi Petrus soal hitungan untuk dihitung dengan jari. Ia sedang memberitahu Petrus, dan kita, bahwa pengampunan bukanlah kuota yang kita penuhi lalu kita tutup bukunya. Itu adalah sikap hati yang terus-menerus kita pilih.

Ini bisa terasa mengecewakan jika kita mengira pengampunan seharusnya menjadi satu momen keputusan setelah itu rasa sakit begitu saja lenyap. Untuk pengkhianatan oleh orang terdekat kita — sahabat, saudara, atau orang tua — luka itu sering muncul kembali dalam gelombang. Sebuah kenangan memicunya pada saat yang tak terduga. Sebuah kumpul keluarga membawa ketegangan lama kembali ke permukaan. Kita mengampuni, lalu kita mendapati diri perlu mengampuni lagi, bukan karena pengampunan pertama kita gagal, tetapi karena mengasihi orang yang pernah melukai kita jarang menjadi transaksi sekali jadi.

Angka tujuh puluh kali tujuh dari Yesus bukanlah beban yang dimaksudkan untuk melelahkan kita; itu adalah belas kasihan yang dimaksudkan untuk membebaskan kita dari tuntutan kesempurnaan atas pemulihan kita sendiri. Engkau boleh mengampuni seseorang hari ini dan tetap merasa perih saat bertemu dengannya minggu depan. Rasa perih itu tidak membatalkan pengampunanmu — itu hanya berarti engkau manusia, sedang menempuh jalan yang sungguh nyata, bukan memerankan rekonsiliasi yang sudah diskenariokan. Yang penting adalah ke arah mana engkau menghadap ketika rasa perih itu datang: kembali ke dendam, atau maju menuju kebebasan yang ditawarkan Kristus.

Pikirkanlah orang yang pengkhianatannya masih membebani engkau sekarang. Engkau tidak diminta untuk menyelesaikan semuanya hari ini. Engkau hanya diminta mengambil satu lagi dari tujuh puluh kali tujuh langkah itu — memilih, sekali lagi, saat ini, untuk melepaskan daripada mengepalkan tangan. Itu sudah cukup untuk hari ini. Besok mungkin engkau perlu memilihnya lagi, dan itu akan cukup untuk besok juga.',
    'Forgiveness is rarely one decision — it is many small ones, repeated for as long as the memory resurfaces.', 'Pengampunan jarang berupa satu keputusan — melainkan banyak keputusan kecil, diulang selama ingatan itu masih muncul kembali.',
    'Jesus, teach me that forgiving again is not failure but faithfulness. When the old hurt resurfaces, meet me there and give me strength to choose release one more time. Amen.', 'Yesus, ajarilah aku bahwa mengampuni lagi bukanlah kegagalan melainkan kesetiaan. Ketika luka lama muncul kembali, temuilah aku di sana dan berilah aku kekuatan untuk sekali lagi memilih melepaskan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 18:21-22', 'WEB', 'Then Peter came to Jesus and asked, "Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?" Jesus answered, "I tell you, not seven times, but seventy-seven times."');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 18:21-22', 'TB', 'Maka datanglah Petrus dan berkata kepada Yesus: "Tuhan, sampai berapa kali aku harus mengampuni saudaraku jika ia berbuat dosa terhadap aku? Sampai tujuh kali?" Yesus berkata kepadanya: "Bukan! Aku berkata kepadamu: Bukan sampai tujuh kali, melainkan sampai tujuh puluh kali tujuh kali."');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'As the Lord Forgave You', 'Sebagaimana Tuhan Telah Mengampuni Kamu',
    'There is a phrase in Paul''s letter to the Colossians that quietly reframes the whole conversation about forgiveness: "as the Lord forgave you." Not as they deserve. Not once they apologize adequately. Not once the relationship feels safe again. As the Lord forgave you. It is a high and, frankly, uncomfortable standard, because none of us deserved the forgiveness we received either. We were forgiven while we were still far off, still unaware, sometimes still repeating the very failures we were being forgiven for.

This doesn''t mean forgiving a friend or family member requires pretending the relationship is unchanged, or that reconciliation must happen immediately, or that healthy boundaries are somehow unspiritual. Forgiveness and trust are not the same thing; you can release someone from the debt they owe you in your heart while still taking time, or space, or wisdom, in how you relate to them going forward. What Paul is describing is an internal posture — bearing with one another, extending grace the way grace was extended to us — not a demand that every relationship snap back to what it was before.

Many of us have found that this kind of forgiveness changes us more than it changes the other person. The friend or family member who hurt you may never fully understand the weight of what they did. They may never say the words you needed to hear. But something shifts in you when you stop waiting for that apology to unlock your peace. You start walking lighter, not because the past is erased, but because you''ve stopped letting someone else''s silence or self-justification hold the keys to your freedom.

As these three days close, consider this a beginning rather than a finish line. You may not feel entirely free today, and that''s alright — freedom in Christ often grows the way a seed grows, quietly and over time. What matters is that you''ve turned toward it. Ask God to keep doing in you what He began in Joseph''s tears and Peter''s question: not a single dramatic release, but a steady, patient unclenching of the hands, day after day, until one day you notice the weight is gone.', 'Ada satu frasa dalam surat Paulus kepada jemaat di Kolose yang diam-diam mengubah seluruh percakapan tentang pengampunan: "sama seperti Tuhan telah mengampuni kamu." Bukan sebagaimana layaknya mereka. Bukan setelah mereka meminta maaf secara memadai. Bukan setelah hubungan itu terasa aman kembali. Sama seperti Tuhan telah mengampuni kamu. Ini standar yang tinggi dan, terus terang, tidak nyaman, sebab tak satu pun dari kita layak menerima pengampunan yang kita terima. Kita diampuni ketika kita masih jauh, masih tidak menyadarinya, kadang masih mengulangi kegagalan yang sama yang untuknya kita diampuni.

Ini bukan berarti mengampuni sahabat atau anggota keluarga mengharuskan kita berpura-pura hubungan itu tidak berubah, atau bahwa rekonsiliasi harus terjadi segera, atau bahwa batasan yang sehat entah bagaimana tidak rohani. Pengampunan dan kepercayaan bukanlah hal yang sama; engkau bisa melepaskan seseorang dari utang yang ia miliki terhadapmu di dalam hatimu, sambil tetap mengambil waktu, ruang, atau kebijaksanaan dalam cara engkau berhubungan dengannya ke depan. Apa yang Paulus gambarkan adalah sikap batin — saling bersabar satu sama lain, memberikan anugerah sebagaimana anugerah telah diberikan kepada kita — bukan tuntutan agar setiap hubungan langsung kembali seperti semula.

Banyak dari kita mendapati bahwa jenis pengampunan ini lebih mengubah diri kita sendiri daripada mengubah orang lain. Sahabat atau anggota keluarga yang menyakitimu mungkin tidak akan pernah sepenuhnya memahami beratnya apa yang telah ia lakukan. Ia mungkin tidak akan pernah mengucapkan kata-kata yang engkau butuhkan untuk didengar. Namun sesuatu bergeser dalam dirimu ketika engkau berhenti menunggu permintaan maaf itu untuk membuka kunci kedamaianmu. Engkau mulai melangkah lebih ringan, bukan karena masa lalu terhapus, tetapi karena engkau berhenti membiarkan diamnya atau pembelaan diri orang lain memegang kunci kebebasanmu.

Saat tiga hari ini berakhir, anggaplah ini sebagai permulaan, bukan garis akhir. Engkau mungkin belum merasa sepenuhnya bebas hari ini, dan itu tidak apa-apa — kebebasan dalam Kristus sering bertumbuh seperti benih bertumbuh, diam-diam dan perlahan seiring waktu. Yang penting adalah engkau telah berpaling ke arahnya. Mintalah Allah terus melakukan dalam dirimu apa yang telah Ia mulai dalam air mata Yusuf dan pertanyaan Petrus: bukan satu pelepasan dramatis, melainkan pembukaan tangan yang tenang dan sabar, hari demi hari, sampai suatu hari engkau menyadari bebannya telah hilang.',
    'Forgiving as the Lord forgave you does not mean pretending nothing happened — it means releasing the debt without waiting to be repaid.', 'Mengampuni sebagaimana Tuhan telah mengampuni bukan berarti berpura-pura tak ada yang terjadi — melainkan melepaskan utang tanpa menunggu dibayar kembali.',
    'Father, thank You for forgiving me long before I deserved it. Help me extend that same undeserved grace to the one who hurt me, not because they''ve earned it, but because You first gave it to me. Set my hands open, Lord. Amen.', 'Bapa, terima kasih karena telah mengampuniku jauh sebelum aku layak menerimanya. Tolonglah aku memberikan anugerah yang sama, yang tidak layak diterima, kepada orang yang menyakitiku, bukan karena ia pantas mendapatkannya, tetapi karena Engkau lebih dulu memberikannya kepadaku. Bukalah tanganku, Tuhan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Colossians 3:13', 'WEB', 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Kolose 3:13', 'TB', 'Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain apabila yang seorang menaruh dendam terhadap yang lain, sama seperti Tuhan telah mengampuni kamu, kamu perlu juga saling mengampuni.');

  -- Plan: Forgiveness as a Daily Choice
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Forgiveness as a Daily Choice',
    'Mengampuni sebagai Pilihan Setiap Hari',
    'A week of learning to release, again and again',
    'Seminggu belajar melepaskan, berulang kali',
    7,
    'A seven-day journey for anyone who has discovered that forgiveness isn''t a single feeling that arrives once and stays, but a practice renewed morning by morning. Drawing on the Sermon on the Mount, the parable of the unforgiving servant, and the patience of God Himself, this plan builds a rhythm of daily, deliberate release.',
    'Perjalanan tujuh hari bagi siapa saja yang menyadari bahwa pengampunan bukanlah satu perasaan yang datang sekali lalu menetap, melainkan sebuah praktik yang diperbarui setiap pagi. Berlandaskan Khotbah di Bukit, perumpamaan tentang hamba yang tidak mau mengampuni, dan kesabaran Allah sendiri, rencana ini membangun ritme pelepasan yang disengaja setiap hari.',
    '/images/devotions/forgiveness-as-a-daily-choice.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Not a Feeling, a Practice', 'Bukan Perasaan, Melainkan Praktik',
    'Somewhere along the way, many of us picked up the idea that forgiveness is supposed to feel like something — a warm rush of release, a moment where the anger just evaporates. And then, when that feeling doesn''t come, or comes and then leaves again the next time we see the person, we wonder if we ever really forgave them at all. This week starts from a different premise: forgiveness is less like a feeling you wait for and more like a discipline you practice, the same way patience or generosity are practiced rather than simply felt.

Jesus places forgiveness right inside the daily rhythm of prayer. In the Sermon on the Mount, immediately after teaching the disciples to pray for their daily bread, He teaches them to pray about forgiveness in the same breath — and then adds a sobering clarification: our willingness to forgive others is bound up with our experience of being forgiven. This isn''t a threat; it''s an observation about how the human heart works. A heart that refuses to release others tends to close itself off from receiving grace too. The two are connected, like two hands that either open together or stay clenched together.

Thinking of forgiveness as daily bread changes the pressure we put on ourselves. You don''t ask for bread once and expect it to sustain you for a lifetime. You ask again tomorrow, and the day after that. In the same way, you may need to forgive the same person, for the same wound, many mornings in a row — not because you''re failing at forgiveness, but because that''s simply what forgiveness looks like when it''s real and ongoing rather than a single tidy transaction.

This week, instead of asking "have I forgiven them yet?" try asking "will I forgive them today?" That small shift in the question can take enormous pressure off a wound that has been slow to heal. Today, whatever hurt comes to mind, bring it to God simply, honestly, and ask for the grace to release it — just for today.', 'Entah bagaimana, banyak dari kita menyerap gagasan bahwa pengampunan seharusnya terasa seperti sesuatu — desakan hangat pelepasan, momen ketika amarah begitu saja menguap. Lalu, ketika perasaan itu tidak kunjung datang, atau datang lalu pergi lagi saat kita bertemu orang itu lagi, kita bertanya-tanya apakah kita benar-benar pernah mengampuni mereka. Minggu ini dimulai dari premis yang berbeda: pengampunan lebih mirip disiplin yang dilatih daripada perasaan yang ditunggu, sebagaimana kesabaran atau kemurahan hati dilatih, bukan sekadar dirasakan.

Yesus menempatkan pengampunan tepat di dalam ritme doa sehari-hari. Dalam Khotbah di Bukit, tepat setelah mengajarkan murid-murid-Nya untuk berdoa memohon roti harian, Ia mengajarkan mereka berdoa tentang pengampunan dalam napas yang sama — lalu menambahkan penjelasan yang menggugah: kesediaan kita mengampuni orang lain terkait erat dengan pengalaman kita diampuni. Ini bukan ancaman; ini pengamatan tentang cara kerja hati manusia. Hati yang menolak melepaskan orang lain cenderung menutup diri juga dari menerima anugerah. Keduanya saling terhubung, seperti dua tangan yang terbuka bersama atau tetap terkepal bersama.

Memikirkan pengampunan seperti roti harian mengubah tekanan yang kita tempatkan pada diri sendiri. Engkau tidak meminta roti sekali lalu berharap itu mencukupimu seumur hidup. Engkau meminta lagi besok, dan lusa. Dengan cara yang sama, engkau mungkin perlu mengampuni orang yang sama, untuk luka yang sama, di banyak pagi berturut-turut — bukan karena engkau gagal dalam mengampuni, tetapi karena memang begitulah rupa pengampunan ketika itu nyata dan berkelanjutan, bukan satu transaksi yang rapi.

Minggu ini, alih-alih bertanya "apakah aku sudah mengampuninya?" cobalah bertanya "akankah aku mengampuninya hari ini?" Pergeseran kecil dalam pertanyaan itu dapat mengangkat tekanan besar dari luka yang lambat sembuh. Hari ini, apa pun luka yang terlintas di pikiranmu, bawalah kepada Allah dengan sederhana dan jujur, dan mintalah anugerah untuk melepaskannya — hanya untuk hari ini.',
    'Ask not whether you''ve fully forgiven, but whether you''re willing to choose forgiveness again today.', 'Jangan bertanya apakah engkau sudah sepenuhnya mengampuni, melainkan apakah engkau bersedia memilih pengampunan lagi hari ini.',
    'Father, give me my daily bread and my daily willingness to forgive. I don''t need to resolve everything today — just help me open my hands one more time. Amen.', 'Bapa, berikanlah aku roti harianku dan kesediaan harianku untuk mengampuni. Aku tidak perlu menyelesaikan semuanya hari ini — tolong bantu aku membuka tanganku sekali lagi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 6:14-15', 'WEB', 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you. But if you do not forgive others their sins, your Father will not forgive your sins.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 6:14-15', 'TB', 'Karena jikalau kamu mengampuni kesalahan orang, Bapamu yang di sorga akan mengampuni kamu juga. Tetapi jikalau kamu tidak mengampuni orang, Bapamu juga tidak akan mengampuni kesalahanmu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'The Debt We Forget We Owed', 'Utang yang Kita Lupa Pernah Kita Miliki',
    'Jesus tells a story about a servant who owed his king an amount so large it was practically fictional — a debt no ordinary person could repay in ten lifetimes. When the servant begs for mercy, the king, moved with compassion, cancels the whole thing. No repayment plan. No partial forgiveness. Gone. It''s one of the most generous images of grace in all of Scripture, and if the story ended there, it would already be remarkable enough to sit with for a week.

But the story keeps going, and this is where it gets uncomfortable. That same servant walks out and finds a fellow servant who owes him a comparatively small amount — pocket change next to what he''d just been forgiven — and has him thrown into prison until he can pay. When the king hears of it, his response is fierce. He calls the man wicked, not because forgiveness is optional, but because this man had just experienced the very thing he refused to extend to someone else. He''d been shown a mountain of mercy and turned around to demand a coin.

It''s easy to read this story and immediately picture the person who wronged us as the unforgiving servant. It''s harder, and more useful, to consider that we are the servant too. Every day we''re forgiven for impatience, for selfishness, for the small and large ways we fail the people around us and fail God. The daily practice of forgiving others isn''t really about them deserving it. It''s about remembering, every single day, the size of the debt that was already canceled in us.

Today, if there''s a comparatively small debt someone owes you — an unkind word, a broken promise, a moment of thoughtlessness — hold it up next to the debt you''ve already been forgiven. It doesn''t make the hurt disappear, but it often makes the grip on it loosen. Practice, today, remembering before you demand.', 'Yesus menceritakan sebuah perumpamaan tentang seorang hamba yang berutang kepada rajanya dalam jumlah yang begitu besar hingga hampir mustahil — utang yang tidak mungkin dilunasi orang biasa bahkan dalam sepuluh masa hidup. Ketika hamba itu memohon belas kasihan, sang raja, digerakkan oleh belas kasih, menghapuskan seluruh utangnya. Tidak ada rencana pembayaran. Tidak ada pengampunan sebagian. Lenyap begitu saja. Ini salah satu gambaran anugerah paling murah hati dalam seluruh Alkitab, dan seandainya kisah itu berhenti di sana, sudah cukup luar biasa untuk direnungkan seminggu penuh.

Namun kisah itu berlanjut, dan di sinilah letak bagian yang tidak nyaman. Hamba yang sama itu keluar dan menemukan sesama hamba yang berutang kepadanya dalam jumlah yang jauh lebih kecil — receh dibandingkan dengan apa yang baru saja diampunkan kepadanya — lalu melemparkannya ke penjara sampai ia bisa membayar. Ketika sang raja mendengarnya, responsnya keras. Ia menyebut orang itu jahat, bukan karena pengampunan itu opsional, melainkan karena orang ini baru saja mengalami sendiri hal yang ia tolak berikan kepada orang lain. Ia telah ditunjukkan gunung belas kasihan lalu berbalik menuntut sekeping uang logam.

Mudah sekali membaca kisah ini dan langsung membayangkan orang yang bersalah kepada kita sebagai hamba yang tidak mau mengampuni itu. Lebih sulit, dan lebih berguna, untuk mempertimbangkan bahwa kita juga adalah hamba itu. Setiap hari kita diampuni atas ketidaksabaran, atas keegoisan, atas cara-cara kecil dan besar kita mengecewakan orang-orang di sekitar kita dan mengecewakan Allah. Praktik harian mengampuni orang lain sebenarnya bukan soal apakah mereka layak menerimanya. Ini soal mengingat, setiap hari, besarnya utang yang telah dihapuskan dalam diri kita.

Hari ini, jika ada utang yang relatif kecil yang dimiliki seseorang kepadamu — kata yang tidak ramah, janji yang diingkari, momen kurang peka — angkatlah itu di samping utang yang telah diampunkan kepadamu. Ini tidak membuat luka lenyap, tetapi sering kali membuat genggaman padanya mengendur. Berlatihlah hari ini, mengingat sebelum menuntut.',
    'Before demanding what''s owed to you, remember what was already forgiven in you.', 'Sebelum menuntut apa yang menjadi hakmu, ingatlah apa yang telah diampunkan dalam dirimu.',
    'Lord, You have canceled debts in me I could never have repaid. Keep that mercy fresh in my memory today, so it softens the way I treat the smaller debts owed to me. Amen.', 'Tuhan, Engkau telah menghapuskan utang-utang dalam diriku yang tidak akan pernah bisa kulunasi. Jagalah belas kasihan itu tetap segar dalam ingatanku hari ini, agar itu melembutkan caraku memperlakukan utang-utang kecil yang dimiliki orang lain kepadaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 18:32-33', 'WEB', 'Then the master called the servant in. "You wicked servant," he said, "I canceled all that debt of yours because you begged me to. Shouldn''t you have had mercy on your fellow servant just as I had on you?"');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 18:32-33', 'TB', 'Lalu raja itu memanggil orang itu menghadap dan berkata kepadanya: Hai hamba yang jahat, seluruh utangmu telah kuhapuskan karena engkau memohonkannya kepadaku. Bukankah engkaupun harus mengasihani kawanmu seperti aku telah mengasihani engkau?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Slow to Anger', 'Panjang Sabar',
    'Psalm 103 offers a portrait of God that many of us wish more people modeled for us growing up: compassionate and gracious, slow to anger, abounding in steadfast love. Notice that word slow. Not instant. Not automatic. Slow implies a process, a patience that has to hold itself back from a quicker, harsher response. If even God''s mercy toward us involves this kind of deliberate slowness, it should reassure us that our own forgiveness doesn''t have to arrive instantly either.

The psalm goes on to say that God does not treat us as our sins deserve, nor repay us according to our iniquities. There''s a legal, almost accounting language here — a repayment that is owed but withheld by choice. This is worth sitting with, because so much of what makes forgiving others hard is the sense that letting go means letting them "get away with it." But withholding repayment isn''t the same as pretending no debt exists. God knows exactly what we deserve and chooses, slowly and deliberately, not to deliver it.

This gives us a model for our own daily practice. You don''t have to convince yourself that what happened was fine, or fair, or deserved. You simply follow the pattern of a God who sees clearly and still chooses mercy over repayment. That choice, made slowly, day by day, is not weakness. It is the same steadfast love that has been extended to every one of us more times than we could count.

Today, if anger flares up again about an old wound, don''t rush to condemn yourself for feeling it. Instead, borrow the posture of Psalm 103: let the anger be slow to boil, and choose, in your own timing, not to repay what you''ve calculated is owed. It is a daily discipline, not a single decision, and today is simply one more day to practice it.', 'Mazmur 103 menawarkan gambaran tentang Allah yang diharapkan banyak dari kita pernah dicontohkan oleh orang-orang di sekitar kita saat tumbuh dewasa: penyayang dan pengasih, panjang sabar, dan berlimpah kasih setia. Perhatikan kata panjang sabar itu. Bukan seketika. Bukan otomatis. Panjang sabar menyiratkan sebuah proses, kesabaran yang harus menahan diri dari respons yang lebih cepat dan lebih keras. Jika bahkan belas kasihan Allah terhadap kita melibatkan kelambatan yang disengaja seperti ini, itu seharusnya meyakinkan kita bahwa pengampunan kita sendiri pun tidak harus datang secara instan.

Mazmur itu melanjutkan bahwa Allah tidak memperlakukan kita setimpal dengan dosa kita, atau membalas kita setimpal dengan kesalahan kita. Ada bahasa hukum, hampir seperti pembukuan, di sini — pembayaran yang sebenarnya terutang namun ditahan karena pilihan. Ini layak direnungkan, sebab sebagian besar yang membuat mengampuni orang lain terasa sulit adalah perasaan bahwa melepaskan berarti membiarkan mereka "lolos begitu saja." Tetapi menahan pembalasan tidaklah sama dengan berpura-pura tidak ada utang. Allah tahu persis apa yang layak kita terima dan memilih, secara perlahan dan disengaja, untuk tidak menjatuhkannya.

Ini memberi kita teladan untuk praktik harian kita sendiri. Engkau tidak perlu meyakinkan dirimu bahwa apa yang terjadi itu baik-baik saja, adil, atau memang pantas. Engkau hanya mengikuti pola Allah yang melihat dengan jelas namun tetap memilih belas kasihan daripada pembalasan. Pilihan itu, yang dibuat secara perlahan, hari demi hari, bukanlah kelemahan. Itu adalah kasih setia yang sama yang telah diberikan kepada kita masing-masing lebih banyak kali daripada yang bisa kita hitung.

Hari ini, jika amarah kembali muncul tentang luka lama, jangan buru-buru menghakimi dirimu sendiri karena merasakannya. Sebaliknya, pinjamlah sikap Mazmur 103: biarkan amarah itu lambat mendidih, dan pilihlah, dengan waktumu sendiri, untuk tidak membalas apa yang kau hitung sebagai utang. Ini disiplin harian, bukan satu keputusan tunggal, dan hari ini hanyalah satu hari lagi untuk melatihnya.',
    'Withholding repayment isn''t pretending no wrong was done — it is choosing mercy the way God chooses it toward you.', 'Menahan pembalasan bukan berarti berpura-pura tak ada yang salah — itu adalah memilih belas kasihan sebagaimana Allah memilihnya bagi kita.',
    'Compassionate God, teach me Your slowness. When anger rises in me, let it not rush to repay, but soften, over time, into the same mercy You have shown me. Amen.', 'Allah yang penyayang, ajarilah aku kesabaran-Mu. Ketika amarah bangkit dalam diriku, biarlah itu tidak buru-buru membalas, melainkan melembut, seiring waktu, menjadi belas kasihan yang sama seperti yang telah Engkau tunjukkan kepadaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 103:8-10', 'WEB', 'The Lord is compassionate and gracious, slow to anger, abounding in love. He does not treat us as our sins deserve or repay us according to our iniquities.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 103:8-10', 'TB', 'TUHAN adalah penyayang dan pengasih, panjang sabar dan berlimpah kasih setia. Tidak selalu Ia menuntut, dan tidak untuk selama-lamanya Ia mendendam. Tidak dilakukan-Nya kepada kita setimpal dengan dosa kita, dan tidak dibalas-Nya kepada kita setimpal dengan kesalahan kita.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Overlooking an Offense', 'Melupakan Pelanggaran',
    'Not every hurt requires a formal, drawn-out process of releasing it. Sometimes wisdom looks like simply choosing not to take offense in the first place — letting a sharp word, a thoughtless comment, or a small slight pass by without letting it take root. Proverbs calls this good sense, and links it directly to patience: a person of understanding is slow to anger, and it is to their glory to overlook an offense. This is not the same as ignoring genuine harm or excusing a pattern of mistreatment. It''s a daily skill for the smaller frictions of ordinary life with ordinary, imperfect people.

Think about how many opportunities for offense present themselves in a single week. A friend forgets to check in. A family member makes an offhand comment that lands wrong. A coworker takes credit they didn''t quite earn. None of these may rise to the level of deep betrayal, but each one is an invitation to either build a small grievance or let it go. Multiply that by years of relationship, and you can see how a household or friendship either becomes a place of accumulated resentment or a place where grace has been practiced daily until it becomes second nature.

This daily overlooking is, in its own quiet way, forgiveness in miniature. It trains the same muscle needed for the larger, harder acts of forgiving a real betrayal. If we can''t release a friend''s forgotten text message, we will likely struggle even more to release a deeper wound when it comes. But if we practice this smaller discipline consistently, day by day, we build a kind of spiritual flexibility that makes the bigger forgiveness, when it''s needed, feel less foreign.

Today, notice the small offenses that come your way — and before reacting, ask whether this is one worth overlooking. Not every hurt needs to become a story you carry. Some are simply meant to be released before they even fully land, and that release, practiced daily, is its own quiet glory.', 'Tidak setiap luka membutuhkan proses pelepasan yang formal dan panjang. Kadang kebijaksanaan berwujud sederhana: memilih untuk tidak tersinggung sejak awal — membiarkan kata yang tajam, komentar yang kurang peka, atau penghinaan kecil berlalu tanpa membiarkannya berakar. Kitab Amsal menyebut ini akal budi, dan mengaitkannya langsung dengan kesabaran: orang yang berakal budi panjang sabar, dan menjadi kemuliaannya untuk melupakan pelanggaran. Ini tidak sama dengan mengabaikan kerugian yang sungguh nyata atau memaafkan pola perlakuan buruk yang berulang. Ini adalah keterampilan harian untuk gesekan-gesekan kecil dalam kehidupan sehari-hari bersama orang-orang biasa yang tidak sempurna.

Pikirkan berapa banyak kesempatan untuk tersinggung yang muncul dalam satu minggu saja. Seorang sahabat lupa menanyakan kabar. Anggota keluarga membuat komentar spontan yang terdengar salah. Rekan kerja mengambil pujian yang sebenarnya bukan sepenuhnya haknya. Tidak satu pun dari ini mungkin setara dengan pengkhianatan yang dalam, tetapi masing-masing adalah undangan untuk membangun kekesalan kecil atau melepaskannya. Kalikan itu dengan bertahun-tahun hubungan, dan engkau bisa melihat bagaimana sebuah rumah tangga atau persahabatan bisa menjadi tempat kebencian yang menumpuk, atau tempat anugerah dilatih setiap hari hingga menjadi kebiasaan.

Melupakan pelanggaran secara harian ini adalah, dengan caranya yang tenang, pengampunan dalam bentuk mini. Ini melatih otot yang sama yang dibutuhkan untuk tindakan pengampunan yang lebih besar dan lebih sulit terhadap pengkhianatan yang sungguh nyata. Jika kita tidak bisa melepaskan pesan sahabat yang terlupa dibalas, kita mungkin akan lebih sulit lagi melepaskan luka yang lebih dalam saat itu datang. Tetapi jika kita melatih disiplin kecil ini secara konsisten, hari demi hari, kita membangun semacam kelenturan rohani yang membuat pengampunan yang lebih besar, ketika dibutuhkan, terasa tidak begitu asing.

Hari ini, perhatikanlah pelanggaran-pelanggaran kecil yang datang kepadamu — dan sebelum bereaksi, tanyakan apakah ini layak dilupakan. Tidak setiap luka perlu menjadi kisah yang kau bawa terus. Sebagian memang dimaksudkan untuk dilepaskan bahkan sebelum benar-benar mendarat, dan pelepasan itu, yang dilatih setiap hari, adalah kemuliaannya yang tenang.',
    'Not every offense needs to become a story you carry — some are meant to be released before they even fully land.', 'Tidak setiap pelanggaran perlu menjadi kisah yang kau bawa terus — sebagian memang dimaksudkan untuk dilepaskan bahkan sebelum benar-benar mendarat.',
    'Lord, give me the wisdom to overlook the small offenses of daily life, so that patience becomes my habit rather than my exception. Amen.', 'Tuhan, berikanlah aku kebijaksanaan untuk melupakan pelanggaran-pelanggaran kecil dalam hidup sehari-hari, agar kesabaran menjadi kebiasaanku, bukan pengecualianku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Proverbs 19:11', 'WEB', 'A person''s wisdom yields patience; it is to one''s glory to overlook an offense.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Amsal 19:11', 'TB', 'Akal budi membuat seseorang panjang sabar, dan orang itu dipuji karena melupakan pelanggaran.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Not Growing Weary', 'Jangan Jemu-Jemu',
    'There is a particular exhaustion that comes from forgiving the same person for the same pattern more than once. You think you''ve dealt with it, and then it resurfaces — a similar comment, a familiar disappointment, the same old wound reopened by a new but similar cause. It would be easy, at that point, to conclude that forgiveness simply doesn''t work, or that you''re bad at it, or that the whole effort is pointless. Paul''s words to the Galatians speak directly into this exhaustion: do not grow weary in doing good, for at the proper time we will reap a harvest if we do not give up.

Paul wasn''t writing specifically about forgiveness in this verse, but the principle fits it precisely. Forgiving someone, especially someone still in your life, is a form of doing good that often produces no visible fruit for a long time. The person may not change. The relationship may not immediately improve. You may forgive faithfully for months and see no evidence that it mattered at all. This is exactly where weariness sets in, and exactly where Paul''s encouragement is aimed.

The harvest Paul describes comes at the proper time, not necessarily the time we''d choose. Sometimes the fruit of ongoing forgiveness is visible in the other person — softened hearts do happen. But often, the first and most reliable harvest is in us: a slow easing of bitterness, a growing capacity for peace that doesn''t depend on the other person''s cooperation, a freedom that arrives quietly rather than dramatically. That harvest is real even when it''s invisible to everyone but you and God.

If you are weary today from forgiving the same hurt again and again, you are not failing. You are in exactly the position Paul was writing to — the position right before the harvest, where giving up feels most tempting and continuing feels most costly. Don''t give up. The proper time is still coming, even if you can''t see it yet.', 'Ada jenis kelelahan tertentu yang muncul karena mengampuni orang yang sama untuk pola yang sama lebih dari sekali. Engkau mengira sudah menyelesaikannya, lalu itu muncul kembali — komentar yang serupa, kekecewaan yang familiar, luka lama yang sama terbuka kembali oleh sebab baru namun serupa. Pada titik itu, mudah sekali untuk menyimpulkan bahwa pengampunan sekadar tidak berhasil, atau bahwa engkau buruk dalam melakukannya, atau bahwa seluruh usaha itu sia-sia. Kata-kata Paulus kepada jemaat di Galatia berbicara langsung tentang kelelahan ini: janganlah jemu-jemu berbuat baik, karena kita akan menuai pada waktunya jika kita tidak menyerah.

Paulus tidak secara khusus menulis tentang pengampunan dalam ayat ini, tetapi prinsipnya cocok dengan tepat. Mengampuni seseorang, terutama seseorang yang masih ada dalam hidupmu, adalah bentuk perbuatan baik yang seringkali tidak menghasilkan buah yang terlihat dalam waktu lama. Orang itu mungkin tidak berubah. Hubungan mungkin tidak segera membaik. Engkau mungkin mengampuni dengan setia selama berbulan-bulan dan tidak melihat bukti bahwa itu berarti apa-apa. Di sinilah tepatnya kelelahan itu muncul, dan di sinilah tepatnya dorongan Paulus ditujukan.

Panen yang digambarkan Paulus datang pada waktunya, bukan selalu pada waktu yang kita pilih sendiri. Kadang buah dari pengampunan yang berkelanjutan terlihat pada diri orang lain — hati yang melunak memang terjadi. Namun sering kali, panen pertama dan paling pasti ada dalam diri kita: kepahitan yang perlahan mereda, kapasitas yang bertumbuh untuk damai yang tidak bergantung pada kerja sama orang lain, kebebasan yang datang dengan tenang, bukan dramatis. Panen itu nyata bahkan ketika tidak terlihat oleh siapa pun kecuali dirimu dan Allah.

Jika hari ini engkau lelah karena mengampuni luka yang sama berulang kali, engkau tidak sedang gagal. Engkau berada tepat di posisi yang dituju tulisan Paulus — posisi tepat sebelum panen, di mana menyerah terasa paling menggoda dan bertahan terasa paling mahal. Jangan menyerah. Waktunya masih akan tiba, meski engkau belum bisa melihatnya sekarang.',
    'The weariness of forgiving again and again is not failure — it is the exact place Paul promises a harvest is still coming.', 'Kelelahan karena mengampuni berulang kali bukanlah kegagalan — itu justru tepat di tempat Paulus menjanjikan panen yang masih akan datang.',
    'Lord, I am tired of forgiving the same hurt again and again. Renew my strength today and remind me that the harvest is still coming, even when I cannot see it. Amen.', 'Tuhan, aku lelah mengampuni luka yang sama berulang kali. Perbaruilah kekuatanku hari ini dan ingatkanlah aku bahwa panen itu masih akan datang, meski aku belum bisa melihatnya. Amin.'
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
    v_plan_id, 6,
    'Keeping No Record', 'Tidak Menyimpan Kesalahan',
    'Among the most quoted verses at weddings, 1 Corinthians 13 is easy to hear as sentimental rather than practical. But read closely, and it reads less like poetry about romance and more like a job description for the daily work of love: patient, kind, not easily angered, keeping no record of wrongs. That last phrase uses language borrowed from bookkeeping — a ledger where debts are tallied and totals kept. Love, Paul says, refuses to keep that ledger.

This is worth sitting with honestly, because many of us do keep the ledger, even unintentionally. We remember the exact words someone said three years ago. We can list, without much effort, every time a particular person has let us down. That mental ledger feels protective, like evidence we might need someday, but it quietly poisons the relationship in the meantime, coloring every new interaction with the residue of every old one.

Keeping no record of wrongs doesn''t mean having no memory or no discernment. It''s possible to remember a pattern for the sake of wisdom — knowing, for instance, that a particular relationship needs firmer boundaries — without keeping an emotional tally you replay to justify resentment. The difference is subtle but real: one is clear-eyed caution, the other is a grudge dressed up as memory.

Today, consider whether there''s a ledger you''ve been keeping on someone, tallying up their failures line by line. Ask God for the grace to close that ledger, not because the wrongs didn''t happen, but because love, as Paul describes it, simply refuses to run the accounts. This is daily, practical work — noticing the tally forming, and choosing, again, to set the pen down.', 'Di antara ayat yang paling sering dikutip dalam pernikahan, 1 Korintus 13 mudah didengar sebagai sentimental, bukan praktis. Namun jika dibaca dengan saksama, ini lebih terdengar bukan seperti puisi tentang romansa, melainkan deskripsi kerja untuk pekerjaan kasih sehari-hari: sabar, murah hati, tidak pemarah, tidak menyimpan kesalahan orang lain. Frasa terakhir itu menggunakan bahasa yang dipinjam dari pembukuan — sebuah buku besar tempat utang dihitung dan totalnya disimpan. Kasih, kata Paulus, menolak menyimpan buku besar itu.

Ini layak direnungkan dengan jujur, sebab banyak dari kita memang menyimpan buku besar itu, bahkan tanpa sengaja. Kita ingat persis kata-kata yang diucapkan seseorang tiga tahun lalu. Kita bisa mendaftar, tanpa usaha keras, setiap kali orang tertentu mengecewakan kita. Buku besar mental itu terasa melindungi, seperti bukti yang mungkin kita butuhkan suatu hari, tetapi diam-diam meracuni hubungan itu selagi itu tersimpan, mewarnai setiap interaksi baru dengan sisa-sisa setiap interaksi lama.

Tidak menyimpan kesalahan bukan berarti tidak memiliki ingatan atau kepekaan. Adalah mungkin mengingat sebuah pola demi kebijaksanaan — mengetahui, misalnya, bahwa suatu hubungan tertentu membutuhkan batasan yang lebih tegas — tanpa menyimpan hitungan emosional yang kau putar ulang untuk membenarkan kebencian. Perbedaannya halus tetapi nyata: yang satu adalah kehati-hatian yang jernih, yang lain adalah dendam yang berdandan sebagai ingatan.

Hari ini, pertimbangkanlah apakah ada buku besar yang selama ini kau simpan tentang seseorang, menghitung kegagalannya baris demi baris. Mintalah anugerah dari Allah untuk menutup buku besar itu, bukan karena kesalahan itu tidak pernah terjadi, tetapi karena kasih, sebagaimana digambarkan Paulus, sekadar menolak menjalankan pembukuan itu. Ini pekerjaan harian yang praktis — menyadari hitungan itu terbentuk, dan memilih, sekali lagi, untuk meletakkan penanya.',
    'Wisdom remembers a pattern for safety''s sake; a grudge replays it to justify resentment. Know the difference, and close the ledger.', 'Kebijaksanaan mengingat sebuah pola demi keselamatan; dendam memutarnya ulang untuk membenarkan kebencian. Kenalilah bedanya, dan tutuplah buku besarnya.',
    'Lord, show me the ledgers I''ve been keeping without realizing it. Give me a love that keeps no record of wrongs, the way Your love keeps none of mine. Amen.', 'Tuhan, tunjukkanlah kepadaku buku besar yang selama ini kusimpan tanpa kusadari. Berikanlah aku kasih yang tidak menyimpan kesalahan, sebagaimana kasih-Mu tidak menyimpan kesalahanku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Corinthians 13:4-5', 'WEB', 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Korintus 13:4-5', 'TB', 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong. Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri. Ia tidak pemarah dan tidak menyimpan kesalahan orang lain.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'Pressing Toward What''s Ahead', 'Mengarah kepada Apa yang di Hadapan',
    'Paul, writing to the Philippians near the end of his life, makes a striking admission: he has not yet arrived. Even this man — apostle, church planter, author of much of the New Testament — describes himself as still reaching, still in process. His method for moving forward is simple to state and hard to live: forgetting what is behind and straining toward what is ahead. Not because the past didn''t happen or didn''t matter, but because dwelling there indefinitely keeps us from the race still in front of us.

This is a fitting way to close a week about forgiveness as daily practice, because the temptation, after six days of intentional release, might be to feel like you should now have this fully mastered. Paul''s honesty is a relief here. He doesn''t claim to have finished forgetting; he describes it as something he does, actively, in the present tense, over and over. Forgiveness, like Paul''s own spiritual growth, is a straining forward rather than a finish line crossed once.

Practically, this means some days this week you may have released an old hurt with real freedom, and other days it may have felt heavier again. Both are part of the same race. What matters, as Paul describes it, is the direction you''re facing — toward what''s ahead, toward the call of Christ, rather than backward toward a wound replayed on a loop. The strain itself, the daily choosing to look forward, is the practice.

As this week ends, don''t measure your success by whether the hurt is completely gone. Measure it by whether you''re still straining forward — still choosing, today, to forgive rather than dwell, still facing the direction of the prize rather than the direction of the wound. That daily choice, repeated for as many days as it takes, is exactly what forgiveness as a practice looks like. And it is, in itself, enough for God to call good.', 'Paulus, menulis kepada jemaat di Filipi menjelang akhir hidupnya, membuat pengakuan yang mengejutkan: ia belum sampai. Bahkan orang ini — rasul, pendiri jemaat, penulis sebagian besar Perjanjian Baru — menggambarkan dirinya masih meraih, masih dalam proses. Metodenya untuk terus maju sederhana untuk diucapkan namun sulit untuk dijalani: melupakan apa yang di belakang dan mengarahkan diri kepada apa yang di hadapan. Bukan karena masa lalu tidak pernah terjadi atau tidak penting, tetapi karena terus-menerus berdiam di sana menghalangi kita dari perlombaan yang masih ada di hadapan kita.

Ini adalah cara yang tepat untuk mengakhiri minggu tentang pengampunan sebagai praktik harian, sebab godaan, setelah enam hari pelepasan yang disengaja, mungkin adalah merasa bahwa sekarang engkau seharusnya sudah sepenuhnya menguasainya. Kejujuran Paulus melegakan di sini. Ia tidak mengklaim telah selesai melupakan; ia menggambarkannya sebagai sesuatu yang ia lakukan, secara aktif, dalam bentuk masa kini, berulang kali. Pengampunan, seperti pertumbuhan rohani Paulus sendiri, adalah upaya meraih ke depan, bukan garis akhir yang dilewati sekali.

Secara praktis, ini berarti pada beberapa hari minggu ini engkau mungkin telah melepaskan luka lama dengan kebebasan yang nyata, dan pada hari-hari lain mungkin terasa berat kembali. Keduanya adalah bagian dari perlombaan yang sama. Yang penting, sebagaimana digambarkan Paulus, adalah arah mana yang kau hadapi — ke arah apa yang di hadapan, ke arah panggilan Kristus, bukan ke belakang menuju luka yang diputar ulang terus-menerus. Upaya itu sendiri, pilihan harian untuk menatap ke depan, adalah praktiknya.

Saat minggu ini berakhir, jangan ukur keberhasilanmu dari apakah luka itu telah sepenuhnya hilang. Ukurlah dari apakah engkau masih mengarahkan diri ke depan — masih memilih, hari ini, untuk mengampuni daripada berdiam pada masa lalu, masih menghadap ke arah hadiah, bukan ke arah luka. Pilihan harian itu, yang diulang selama berapa pun hari yang dibutuhkan, adalah persis seperti apa rupa pengampunan sebagai sebuah praktik. Dan itu, dengan sendirinya, sudah cukup untuk disebut baik oleh Allah.',
    'Success in forgiveness isn''t the wound''s disappearance — it''s still facing forward, choosing today, once again, to press on.', 'Keberhasilan dalam mengampuni bukanlah lenyapnya luka — melainkan tetap menghadap ke depan, memilih hari ini, sekali lagi, untuk terus maju.',
    'Lord, like Paul, I have not arrived. Keep me straining toward what''s ahead, choosing forgiveness daily, facing forward until the day this practice becomes freedom fully realized. Amen.', 'Tuhan, seperti Paulus, aku belum sampai. Jagalah aku tetap mengarahkan diri kepada apa yang di hadapan, memilih pengampunan setiap hari, menghadap ke depan hingga hari ketika praktik ini menjadi kebebasan yang sepenuhnya terwujud. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 3:13-14', 'WEB', 'Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 3:13-14', 'TB', 'Saudara-saudara, aku sendiri tidak menganggap, bahwa aku telah menangkapnya, tetapi ini yang kubuat: aku melupakan apa yang telah di belakangku dan mengarahkan diri kepada apa yang di hadapanku, dan berlari-lari kepada tujuan untuk memperoleh hadiah dari panggilan sorgawi Allah dalam Kristus Yesus.');

  -- Plan: When They Never Say Sorry
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'When They Never Say Sorry',
    'Ketika Mereka Tak Pernah Minta Maaf',
    'Finding freedom when the apology you needed never comes',
    'Menemukan kebebasan ketika permintaan maaf yang kau butuhkan tak kunjung datang',
    5,
    'A five-day plan for the particular ache of forgiving someone who has never acknowledged what they did — a friend, family member, or stranger who moved on without ever saying sorry. Rooted in Christ''s words from the cross and the promise that justice belongs to God, these readings help release what an apology never will.',
    'Rencana lima hari untuk pergumulan khusus mengampuni seseorang yang tak pernah mengakui apa yang telah ia lakukan — sahabat, anggota keluarga, atau orang asing yang melangkah maju tanpa pernah meminta maaf. Berakar pada perkataan Kristus dari kayu salib dan janji bahwa keadilan adalah milik Allah, renungan ini membantu melepaskan apa yang tak akan pernah diberikan oleh permintaan maaf.',
    '/images/devotions/when-they-never-say-sorry.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Apology That Never Came', 'Permintaan Maaf yang Tak Kunjung Datang',
    'There is a specific kind of loneliness in being hurt by someone who never acknowledges it. If they had apologized, even imperfectly, there would be something to work with — an admission, a shared understanding that something wrong occurred. But when the apology never comes, when the person moves on as though nothing happened, or worse, tells a version of the story where you were the problem, the hurt gets complicated by isolation. You''re left holding the full memory of what happened, alone, while the other person seems to walk away lighter.

Many of us have someone like this in our story — a friend who ghosted without explanation, a family member who caused real damage and simply never brought it up again, a coworker or acquaintance who wronged us and clearly felt no need to make it right. It''s tempting to think forgiveness requires their cooperation, that we need them to first admit wrongdoing before we''re allowed to let go. But if that were true, an entire category of wounds would never be able to heal, since some people never will apologize, no matter how long we wait.

Jesus, dying on a cross He did not deserve, at the hands of people who showed no remorse in the moment, prayed: "Father, forgive them, for they do not know what they are doing." Notice what''s absent from this prayer. There''s no confession from the soldiers. No apology from the crowd. No acknowledgment at all. Jesus forgives in the complete absence of any repentance, extending mercy to people who, as far as the text tells us, never asked for it and never expressed sorrow for what they''d done.

This doesn''t mean the wrong wasn''t wrong, or that what happened to you doesn''t matter. It means forgiveness was never actually contingent on the other person''s response — it was always something that could be offered from your side alone, a transaction that requires only one participant. Today, simply sit with that possibility. You do not need their apology to begin. You never did.', 'Ada jenis kesepian tertentu dalam disakiti oleh seseorang yang tidak pernah mengakuinya. Jika mereka meminta maaf, bahkan dengan tidak sempurna, akan ada sesuatu untuk dikerjakan — sebuah pengakuan, pemahaman bersama bahwa sesuatu yang salah telah terjadi. Namun ketika permintaan maaf itu tak kunjung datang, ketika orang itu melangkah maju seolah tidak terjadi apa-apa, atau lebih buruk lagi, menceritakan versi kisah di mana engkaulah masalahnya, luka itu menjadi rumit oleh keterasingan. Engkau tertinggal memikul seluruh ingatan tentang apa yang terjadi, sendirian, sementara orang lain itu tampak melangkah pergi dengan lebih ringan.

Banyak dari kita memiliki seseorang seperti ini dalam kisah kita — sahabat yang menghilang tanpa penjelasan, anggota keluarga yang menyebabkan kerugian nyata dan sekadar tidak pernah membahasnya lagi, rekan kerja atau kenalan yang bersalah kepada kita dan jelas tidak merasa perlu memperbaikinya. Menggoda untuk berpikir bahwa pengampunan membutuhkan kerja sama mereka, bahwa kita perlu mereka mengakui kesalahan terlebih dahulu sebelum kita diizinkan melepaskan. Namun jika itu benar, seluruh kategori luka tidak akan pernah bisa sembuh, sebab sebagian orang tidak akan pernah meminta maaf, tidak peduli berapa lama kita menunggu.

Yesus, sekarat di kayu salib yang tidak layak Ia terima, di tangan orang-orang yang tidak menunjukkan penyesalan pada saat itu, berdoa: "Ya Bapa, ampunilah mereka, sebab mereka tidak tahu apa yang mereka perbuat." Perhatikan apa yang tidak ada dalam doa ini. Tidak ada pengakuan dari para prajurit. Tidak ada permintaan maaf dari kerumunan. Tidak ada pengakuan sama sekali. Yesus mengampuni dalam ketiadaan pertobatan sama sekali, memberikan belas kasihan kepada orang-orang yang, sejauh yang diceritakan teks itu, tidak pernah memintanya dan tidak pernah menyatakan penyesalan atas apa yang telah mereka lakukan.

Ini tidak berarti kesalahan itu bukan kesalahan, atau bahwa apa yang terjadi kepadamu tidak penting. Ini berarti pengampunan sebenarnya tidak pernah bergantung pada respons orang lain — itu selalu menjadi sesuatu yang bisa ditawarkan dari pihakmu sendiri, sebuah transaksi yang hanya membutuhkan satu peserta. Hari ini, sekadar renungkanlah kemungkinan itu. Engkau tidak membutuhkan permintaan maaf mereka untuk memulai. Engkau tidak pernah membutuhkannya.',
    'Forgiveness was never contingent on the other person''s apology — it was always something you could offer alone.', 'Pengampunan tidak pernah bergantung pada permintaan maaf orang lain — itu selalu menjadi sesuatu yang bisa kau tawarkan sendirian.',
    'Lord Jesus, You forgave from the cross without waiting for remorse. Teach me that same freedom — that I do not need an apology I may never receive to begin letting go. Amen.', 'Tuhan Yesus, Engkau mengampuni dari kayu salib tanpa menunggu penyesalan. Ajarilah aku kebebasan yang sama — bahwa aku tidak membutuhkan permintaan maaf yang mungkin tidak akan pernah kuterima untuk mulai melepaskan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Luke 23:34', 'WEB', 'Jesus said, "Father, forgive them, for they do not know what they are doing." And they divided up his clothes by casting lots.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lukas 23:34', 'TB', 'Yesus berkata: "Ya Bapa, ampunilah mereka, sebab mereka tidak tahu apa yang mereka perbuat." Dan mereka membuang undi untuk membagi pakaian-Nya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Giving Room to God''s Justice', 'Memberi Tempat kepada Keadilan Allah',
    'One of the quiet fears behind unforgiveness, especially when the other person never apologizes, is the sense that if we let go, nobody will ever hold them accountable. It can feel like forgiveness means agreeing that what happened doesn''t matter, that justice simply evaporates along with our anger. Paul''s words to the Romans speak directly to this fear: do not take revenge, but leave room for God''s wrath, for it is written, "It is mine to avenge; I will repay."

This verse doesn''t ask us to pretend justice isn''t important. It relocates justice to where it actually belongs. We are not the ones equipped to weigh a human heart, to know every factor and motive, to determine a fitting consequence. God is. When we release someone who never apologized, we are not declaring their actions acceptable. We are simply admitting that we were never the right judge for this case, and handing the verdict to the only One who ever truly was.

This can be a genuine relief once we let it settle. Holding onto anger as a substitute for justice is exhausting work, and it''s work we were never equipped to do well in the first place. Our anger can burn for years without ever actually producing the accountability we''re hoping for. Meanwhile, God''s justice does not depend on our vigilance. He sees what happened as clearly as we do, if not more clearly, and He is not asking us to do His job for Him.

Today, consider what it would mean to hand this person''s account over to God fully — not because they don''t deserve consequences, but because you were never meant to carry the weight of delivering them. Leave room, as Paul says. That room, once you make it, is often where your own peace finally has space to grow.', 'Salah satu ketakutan diam-diam di balik sikap tidak mau mengampuni, terutama ketika orang lain tidak pernah meminta maaf, adalah perasaan bahwa jika kita melepaskan, tidak akan ada yang pernah meminta pertanggungjawaban dari mereka. Bisa terasa seolah pengampunan berarti menyetujui bahwa apa yang terjadi tidak penting, bahwa keadilan begitu saja menguap bersama amarah kita. Kata-kata Paulus kepada jemaat di Roma berbicara langsung tentang ketakutan ini: janganlah menuntut pembalasan, tetapi berilah tempat kepada murka Allah, sebab ada tertulis, "Pembalasan itu adalah hak-Ku. Akulah yang akan menuntut pembalasan."

Ayat ini tidak meminta kita berpura-pura keadilan tidak penting. Ia memindahkan keadilan ke tempat yang sebenarnya menjadi miliknya. Kita bukanlah yang diperlengkapi untuk menimbang hati manusia, untuk mengetahui setiap faktor dan motif, untuk menentukan konsekuensi yang setimpal. Allah yang bisa. Ketika kita melepaskan seseorang yang tidak pernah meminta maaf, kita tidak sedang menyatakan tindakan mereka bisa diterima. Kita hanya mengakui bahwa kita bukanlah hakim yang tepat untuk perkara ini, dan menyerahkan putusannya kepada satu-satunya yang benar-benar layak.

Ini bisa menjadi kelegaan sejati begitu kita membiarkannya meresap. Menyimpan amarah sebagai pengganti keadilan adalah pekerjaan yang melelahkan, dan itu pekerjaan yang sejak awal tidak pernah diperlengkapi untuk kita lakukan dengan baik. Amarah kita bisa membara selama bertahun-tahun tanpa pernah benar-benar menghasilkan pertanggungjawaban yang kita harapkan. Sementara itu, keadilan Allah tidak bergantung pada kewaspadaan kita. Ia melihat apa yang terjadi sejelas kita melihatnya, bahkan lebih jelas, dan Ia tidak meminta kita melakukan pekerjaan-Nya untuk-Nya.

Hari ini, pertimbangkanlah apa artinya menyerahkan sepenuhnya perkara orang ini kepada Allah — bukan karena mereka tidak pantas menerima konsekuensi, tetapi karena engkau tidak pernah dimaksudkan untuk memikul beban menjatuhkannya. Berilah tempat, seperti kata Paulus. Tempat itu, begitu engkau membuatnya, sering kali menjadi ruang tempat kedamaianmu sendiri akhirnya bisa bertumbuh.',
    'Releasing someone isn''t declaring their actions acceptable — it''s admitting you were never the right judge, and handing the verdict to the One who is.', 'Melepaskan seseorang bukan berarti menyatakan tindakannya bisa diterima — itu adalah mengakui bahwa engkau bukan hakim yang tepat, dan menyerahkan putusannya kepada Dia yang layak.',
    'Father, I hand over what I cannot fairly judge. Take this account off my shoulders and give me the freedom that comes from trusting Your justice instead of my own. Amen.', 'Bapa, aku menyerahkan apa yang tidak bisa kuhakimi dengan adil. Ambillah perkara ini dari pundakku dan berikan aku kebebasan yang datang dari mempercayai keadilan-Mu, bukan keadilanku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 12:19', 'WEB', 'Do not take revenge, my dear friends, but leave room for God''s wrath, for it is written: "It is mine to avenge; I will repay," says the Lord.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 12:19', 'TB', 'Saudara-saudaraku yang kekasih, janganlah kamu sendiri menuntut pembalasan, tetapi berilah tempat kepada murka Allah, sebab ada tertulis: Pembalasan itu adalah hak-Ku. Akulah yang akan menuntut pembalasan, firman Tuhan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Getting Rid of the Bitterness', 'Membuang Segala Kepahitan',
    'When someone never apologizes, bitterness has an easy foothold, because it feels justified. If they won''t acknowledge what happened, someone has to, and often that job falls silently to us — replaying the injustice, keeping it alive, making sure it isn''t simply forgotten. Paul''s instruction to the Ephesians names this exact tendency and asks us to do something that feels almost unnatural: get rid of all bitterness, rage, and anger, and instead be kind and compassionate, forgiving one another, just as in Christ God forgave you.

Notice that Paul doesn''t say bitterness is illegitimate or that our anger is unreasonable. He simply says it needs to go, the same way you''d get rid of something toxic sitting in your house. Bitterness, left unaddressed, doesn''t stay contained to the person who caused it. It leaks into other relationships, colors our view of people who remind us of the one who hurt us, and slowly narrows the kind of person we''re becoming. What began as a justified response to a real wrong can, over time, reshape our whole disposition if we let it settle in permanently.

The instruction to be kind and compassionate instead isn''t a denial of what happened. It''s a redirection of where our energy goes. Instead of spending it maintaining the case against someone who will likely never answer for it the way we want, we redirect that same energy toward becoming the kind of person who reflects the forgiveness we''ve received. This is genuinely hard when the other person hasn''t earned it, but Paul''s phrase "just as in Christ God forgave you" reminds us that none of us earned the forgiveness we were given either.

Today, ask honestly whether bitterness toward this person has started to color anything else in your life — your trust in others, your general mood, your sense of safety in relationships. If so, this is the moment Paul is speaking to. Getting rid of it doesn''t happen in one motion, but it can begin with one honest decision, made today, to stop letting it live rent-free in your heart.', 'Ketika seseorang tidak pernah meminta maaf, kepahitan mendapatkan pijakan yang mudah, sebab itu terasa dibenarkan. Jika mereka tidak mau mengakui apa yang terjadi, seseorang harus melakukannya, dan sering kali tugas itu jatuh secara diam-diam kepada kita — memutar ulang ketidakadilan itu, menjaganya tetap hidup, memastikan itu tidak begitu saja terlupakan. Instruksi Paulus kepada jemaat di Efesus menyebut kecenderungan ini secara tepat dan meminta kita melakukan sesuatu yang terasa hampir tidak wajar: buanglah segala kepahitan, kegeraman, dan kemarahan, dan sebaliknya hendaklah ramah dan penuh kasih mesra, saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu.

Perhatikan bahwa Paulus tidak mengatakan kepahitan itu tidak sah atau bahwa amarah kita tidak masuk akal. Ia hanya berkata itu harus dibuang, sama seperti engkau membuang sesuatu yang beracun yang berada di rumahmu. Kepahitan, jika dibiarkan tidak ditangani, tidak tetap terbatas pada orang yang menyebabkannya. Ia merembes ke hubungan lain, mewarnai pandangan kita terhadap orang-orang yang mengingatkan kita pada orang yang menyakiti kita, dan perlahan mempersempit jenis pribadi yang sedang kita jadi. Apa yang bermula sebagai respons yang dibenarkan terhadap kesalahan yang nyata, seiring waktu, bisa membentuk ulang seluruh watak kita jika kita membiarkannya menetap secara permanen.

Instruksi untuk sebaliknya bersikap ramah dan penuh kasih mesra bukanlah penyangkalan atas apa yang terjadi. Itu adalah pengalihan ke mana energi kita mengalir. Alih-alih menghabiskannya untuk mempertahankan tuntutan terhadap seseorang yang mungkin tidak akan pernah bertanggung jawab dengan cara yang kita inginkan, kita mengalihkan energi yang sama itu untuk menjadi pribadi yang mencerminkan pengampunan yang telah kita terima. Ini benar-benar sulit ketika orang lain belum mendapatkannya, tetapi frasa Paulus "sebagaimana Allah di dalam Kristus telah mengampuni kamu" mengingatkan kita bahwa tak satu pun dari kita pantas mendapatkan pengampunan yang diberikan kepada kita juga.

Hari ini, tanyakan dengan jujur apakah kepahitan terhadap orang ini telah mulai mewarnai hal lain dalam hidupmu — kepercayaanmu pada orang lain, suasana hatimu secara umum, rasa amanmu dalam hubungan. Jika ya, inilah momen yang sedang dibicarakan Paulus. Membuangnya tidak terjadi dalam satu gerakan, tetapi bisa dimulai dengan satu keputusan yang jujur, yang dibuat hari ini, untuk berhenti membiarkannya tinggal cuma-cuma di dalam hatimu.',
    'Left unaddressed, bitterness rarely stays contained to the person who caused it — it slowly colors everything else.', 'Jika dibiarkan, kepahitan jarang tetap terbatas pada orang yang menyebabkannya — perlahan ia mewarnai segala sesuatu yang lain.',
    'Lord, show me where bitterness has quietly settled in me. Help me get rid of it, not because the wrong didn''t matter, but because I was never meant to carry it forever. Amen.', 'Tuhan, tunjukkanlah kepadaku di mana kepahitan telah diam-diam menetap dalam diriku. Tolonglah aku membuangnya, bukan karena kesalahan itu tidak penting, tetapi karena aku tidak pernah dimaksudkan untuk memikulnya selamanya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ephesians 4:31-32', 'WEB', 'Get rid of all bitterness, rage and anger, brawling and slander, along with every form of malice. Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Efesus 4:31-32', 'TB', 'Segala kepahitan, kegeraman, kemarahan, pertikaian dan fitnah hendaklah dibuang dari antara kamu, demikian pula segala kejahatan. Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Standing to Pray with Empty Hands', 'Berdiri Berdoa dengan Tangan Kosong',
    'Jesus offers a striking picture in the Gospel of Mark: when you stand praying, forgive anyone you hold anything against, so that your Father in heaven may forgive you your sins. What''s notable here is the setting. This isn''t advice for a formal reconciliation meeting or a face-to-face conversation with the person who wronged you. It''s advice for prayer — a private moment between you and God, where the other person isn''t even present, let alone required to participate.

This matters enormously for the situation where an apology never comes. If forgiveness could only happen in the presence of the offender, in a mutual conversation where they acknowledge wrongdoing, then anyone whose offender has disappeared, died, refused contact, or simply denied everything would be permanently locked out of freedom. Jesus'' instruction here says otherwise. Forgiveness, at least in this picture, is something that can happen entirely in prayer, entirely in your own heart before God, with no other party needed at all.

This is freeing, but it also requires honesty. Standing to pray with something against someone means naming it, not glossing over it. You don''t have to soften what happened or minimize the wrong to bring it before God. You simply bring it, name what you''re holding, and release your grip on it in His presence — much the way you''d set down something heavy you''d been carrying, even if no one else is there to see you set it down.

Today, try this literally. The next time you pray, before asking for anything else, pause and consider whether you''re holding something against someone. Name it honestly to God. Then, as an act of the will rather than a feeling you''re waiting to arrive, say the words: I forgive them. You may need to say it again tomorrow. That''s alright. Each time you do, you''re standing in exactly the posture Jesus described — empty-handed before the Father, whether or not the other person ever knows.', 'Yesus menawarkan gambaran yang mengesankan dalam Injil Markus: jika kamu berdiri untuk berdoa, ampunilah dahulu sekiranya ada barang sesuatu dalam hatimu terhadap seseorang, supaya juga Bapamu yang di sorga mengampuni kesalahanmu. Yang patut diperhatikan di sini adalah latarnya. Ini bukan nasihat untuk pertemuan rekonsiliasi formal atau percakapan langsung dengan orang yang bersalah kepadamu. Ini nasihat untuk doa — momen pribadi antara engkau dan Allah, di mana orang lain itu bahkan tidak hadir, apalagi diharuskan berpartisipasi.

Ini sangat penting untuk situasi ketika permintaan maaf tak kunjung datang. Jika pengampunan hanya bisa terjadi di hadapan pihak yang bersalah, dalam percakapan timbal balik di mana mereka mengakui kesalahan, maka siapa pun yang pihak yang bersalah kepadanya telah menghilang, meninggal, menolak kontak, atau sekadar menyangkal segalanya akan terkunci secara permanen dari kebebasan. Instruksi Yesus di sini mengatakan sebaliknya. Pengampunan, setidaknya dalam gambaran ini, adalah sesuatu yang bisa terjadi sepenuhnya dalam doa, sepenuhnya di dalam hatimu sendiri di hadapan Allah, tanpa memerlukan pihak lain sama sekali.

Ini membebaskan, tetapi juga membutuhkan kejujuran. Berdiri berdoa dengan sesuatu terhadap seseorang berarti menyebutnya, bukan mengabaikannya. Engkau tidak perlu melunakkan apa yang terjadi atau mengecilkan kesalahan itu untuk membawanya di hadapan Allah. Engkau cukup membawanya, menyebutkan apa yang sedang kau pegang, dan melepaskan genggamanmu padanya di hadirat-Nya — sama seperti engkau meletakkan sesuatu yang berat yang selama ini kau bawa, bahkan jika tidak ada orang lain yang melihatmu meletakkannya.

Hari ini, cobalah ini secara harfiah. Lain kali engkau berdoa, sebelum meminta hal lain apa pun, berhentilah sejenak dan pertimbangkan apakah engkau sedang memegang sesuatu terhadap seseorang. Sebutkan itu dengan jujur kepada Allah. Lalu, sebagai tindakan kehendak, bukan perasaan yang kau tunggu datang, ucapkanlah kata-kata: aku mengampuni mereka. Engkau mungkin perlu mengucapkannya lagi besok. Itu tidak apa-apa. Setiap kali engkau melakukannya, engkau berdiri tepat pada sikap yang digambarkan Yesus — tangan kosong di hadapan Bapa, entah orang lain itu mengetahuinya atau tidak.',
    'Forgiveness can happen entirely in prayer, entirely in your own heart before God — no apology, and no other party, required.', 'Pengampunan bisa terjadi sepenuhnya dalam doa, sepenuhnya di dalam hatimu sendiri di hadapan Allah — tanpa perlu permintaan maaf, dan tanpa perlu pihak lain.',
    'Father, I stand before You now with what I''ve been holding against this person. I name it honestly, and I release my grip on it. Receive what I set down, and forgive me as I forgive. Amen.', 'Bapa, aku berdiri di hadapan-Mu sekarang dengan apa yang selama ini kupegang terhadap orang ini. Aku menyebutnya dengan jujur, dan aku melepaskan genggamanku padanya. Terimalah apa yang kuletakkan ini, dan ampunilah aku sebagaimana aku mengampuni. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mark 11:25', 'WEB', 'And when you stand praying, if you hold anything against anyone, forgive them, so that your Father in heaven may forgive you your sins.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Markus 11:25', 'TB', 'Dan jika kamu berdiri untuk berdoa, ampunilah dahulu sekiranya ada barang sesuatu dalam hatimu terhadap seseorang, supaya juga Bapamu yang di sorga mengampuni kesalahanmu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Blessing Instead of Repaying', 'Memberkati, Bukan Membalas',
    'Peter''s first letter offers instruction that can feel almost impossible when directed at someone who has never apologized: do not repay evil with evil or insult with insult, but with blessing, because to this you were called so that you may inherit a blessing. Not neutrality. Not simply refraining from retaliation. Blessing. Peter asks for an active good directed toward the very person who caused the harm, offered without any expectation that they''ll reciprocate or even notice.

This can sound like Peter is asking us to pretend everything is fine, but that''s not what blessing someone requires. You can hope for someone''s genuine good — their eventual repentance, their peace, even their salvation — while still maintaining distance, boundaries, or complete separation from ongoing contact with them. Blessing is not the same as reconciliation, and it certainly isn''t the same as trust. It''s simply a refusal to let their evil be the last word in how you relate to them, even from a distance, even only in your own heart and prayers.

Notice, too, what Peter says is at stake: an inheritance. This isn''t framed as a nice bonus for especially spiritual people. It''s connected to our very calling, the blessing we ourselves hope to inherit. There''s something at work here beyond the immediate relationship — a way of living that shapes who we become and what we''re able to receive from God, regardless of whether the other person ever changes or apologizes.

As this five-day journey closes, consider what it might look like, practically, to bless rather than repay the person who never said sorry. It might be as simple as praying for their genuine good the next time they cross your mind, rather than rehearsing what you wish you''d said. It might mean speaking of them without bitterness when their name comes up. Whatever shape it takes, this is the furthest reach of forgiveness without an apology — not just releasing the debt, but actively wishing them well, trusting that this posture, more than any words they might ever say, is what finally sets you free.', 'Surat pertama Petrus menawarkan instruksi yang bisa terasa hampir mustahil ketika ditujukan kepada seseorang yang tidak pernah meminta maaf: janganlah membalas kejahatan dengan kejahatan, atau caci maki dengan caci maki, tetapi sebaliknya, hendaklah memberkati, karena untuk itulah kamu dipanggil, yaitu untuk memperoleh berkat. Bukan netralitas. Bukan sekadar menahan diri dari pembalasan. Memberkati. Petrus meminta kebaikan yang aktif yang diarahkan kepada orang yang justru menyebabkan luka itu, diberikan tanpa harapan apa pun bahwa mereka akan membalas atau bahkan menyadarinya.

Ini bisa terdengar seolah Petrus meminta kita berpura-pura semuanya baik-baik saja, tetapi bukan itu yang dibutuhkan untuk memberkati seseorang. Engkau bisa berharap kebaikan sejati bagi seseorang — pertobatan mereka pada akhirnya, kedamaian mereka, bahkan keselamatan mereka — sambil tetap menjaga jarak, batasan, atau bahkan pemisahan total dari kontak yang berkelanjutan dengan mereka. Memberkati tidak sama dengan rekonsiliasi, dan tentu tidak sama dengan kepercayaan. Itu sekadar penolakan untuk membiarkan kejahatan mereka menjadi kata terakhir dalam cara engkau berhubungan dengan mereka, bahkan dari jauh, bahkan hanya dalam hatimu dan doamu sendiri.

Perhatikan juga apa yang dikatakan Petrus dipertaruhkan: sebuah warisan. Ini tidak digambarkan sebagai bonus baik untuk orang-orang yang sangat rohani. Itu terkait dengan panggilan kita sendiri, berkat yang kita sendiri harapkan untuk diwarisi. Ada sesuatu yang sedang bekerja di sini di luar hubungan langsung itu — cara hidup yang membentuk siapa kita menjadi dan apa yang bisa kita terima dari Allah, terlepas dari apakah orang lain itu pernah berubah atau meminta maaf.

Saat perjalanan lima hari ini berakhir, pertimbangkanlah seperti apa, secara praktis, memberkati alih-alih membalas orang yang tidak pernah meminta maaf itu. Bisa sesederhana mendoakan kebaikan sejati bagi mereka lain kali mereka terlintas di pikiranmu, alih-alih memikirkan ulang apa yang seharusnya kau katakan. Bisa berarti membicarakan mereka tanpa kepahitan ketika nama mereka disebut. Apa pun bentuknya, inilah jangkauan terjauh dari pengampunan tanpa permintaan maaf — bukan hanya melepaskan utang, tetapi secara aktif mengharapkan kebaikan bagi mereka, mempercayai bahwa sikap ini, lebih daripada kata-kata apa pun yang mungkin pernah mereka ucapkan, adalah yang akhirnya membebaskanmu.',
    'Blessing someone isn''t trust or reconciliation — it''s refusing to let their wrong be the last word in your heart.', 'Memberkati seseorang bukanlah kepercayaan atau rekonsiliasi — itu adalah penolakan untuk membiarkan kesalahan mereka menjadi kata terakhir dalam hatimu.',
    'Lord, I cannot always control whether they say sorry, but I can choose to bless rather than repay. Give me a heart that wishes them genuine good, and in that, set me fully free. Amen.', 'Tuhan, aku tidak selalu bisa mengendalikan apakah mereka akan meminta maaf, tetapi aku bisa memilih untuk memberkati alih-alih membalas. Berilah aku hati yang mengharapkan kebaikan sejati bagi mereka, dan dalam hal itu, bebaskanlah aku sepenuhnya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Peter 3:9', 'WEB', 'Do not repay evil with evil or insult with insult. On the contrary, repay evil with blessing, because to this you were called so that you may inherit a blessing.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Petrus 3:9', 'TB', 'Dan janganlah kamu membalas kejahatan dengan kejahatan, atau caci maki dengan caci maki, tetapi sebaliknya, hendaklah kamu memberkati, karena untuk itulah kamu dipanggil, yaitu untuk memperoleh berkat.');

  -- Sub-category: Receiving God's Mercy --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Receiving God''s Mercy' AND parent_id = v_forgiveness_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Receiving God''s Mercy', 'Menerima Belas Kasihan Allah', v_forgiveness_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Menerima Belas Kasihan Allah'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Beyond Shame
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Beyond Shame',
    'Melampaui Rasa Malu',
    'Letting grace reach the places guilt won''t leave',
    'Membiarkan anugerah menjangkau tempat yang tak mau ditinggalkan rasa bersalah',
    5,
    'A five-day path for anyone who believes in God''s forgiveness in theory but still feels disqualified in practice. Each day gently separates guilt (a signal) from shame (a lie), and points toward the God who runs to meet us before we even finish our excuses.',
    'Perjalanan lima hari bagi siapa saja yang percaya akan pengampunan Allah secara teori namun masih merasa tidak layak dalam kenyataan. Setiap hari dengan lembut memisahkan rasa bersalah (yang menjadi sinyal) dari rasa malu (yang menjadi dusta), dan menunjuk kepada Allah yang berlari menyambut kita bahkan sebelum kita selesai menyampaikan alasan.',
    '/images/devotions/beyond-shame.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Guilt Is a Signal, Not a Sentence', 'Rasa Bersalah Itu Sinyal, Bukan Vonis',
    'There is a difference between guilt and shame, even though they often arrive at the same time and feel like the same heavy weight. Guilt says, ''I did something wrong.'' Shame says, ''There is something wrong with me.'' Guilt points to an act; shame points to your identity. Guilt can be resolved. Shame just sits there, humming in the background of every good thing, whispering that you don''t quite deserve it.

Scripture is honest about this. David, after his failure, does not minimize what he has done. He names it plainly and asks for something specific: mercy, cleansing, a clean heart. He does not ask to feel better about himself in some vague way. He asks God to actually deal with the sin. That is the difference between wallowing and repenting. Wallowing keeps circling the wound. Repentance brings the wound to the One who can heal it.

Many of us learned somewhere along the way that feeling bad for a long time is proof we''re truly sorry, as if shame were the toll we have to keep paying. But nowhere does Scripture ask us to punish ourselves before God will forgive us. The punishment for sin was already carried at the cross. What is left for us is not more punishment, but response — turning, confessing, receiving. Shame keeps us circling. Grace moves us forward.

So today, try a small but honest exercise: name what actually happened, plainly, without the exaggerated self-condemnation and without the excuses either. Then bring that plain, honest thing to God the way David did — not to a courtroom, but to mercy. The goal isn''t to feel less; it''s to feel rightly, and then to let that feeling lead somewhere instead of just sitting in it.', 'Ada perbedaan antara rasa bersalah dan rasa malu, meskipun keduanya sering datang bersamaan dan terasa seperti beban yang sama. Rasa bersalah berkata, ''Aku melakukan sesuatu yang salah.'' Rasa malu berkata, ''Ada yang salah dengan diriku.'' Rasa bersalah menunjuk pada suatu perbuatan; rasa malu menunjuk pada jati diri. Rasa bersalah bisa diselesaikan. Rasa malu hanya diam di sana, berdengung di latar belakang setiap hal baik, membisikkan bahwa kita tidak pantas menerimanya.

Alkitab jujur soal ini. Daud, setelah kegagalannya, tidak mengecilkan apa yang telah ia lakukan. Ia menyebutnya dengan terus terang dan meminta sesuatu yang spesifik: belas kasihan, penyucian, hati yang tahir. Ia tidak meminta untuk sekadar merasa lebih baik tentang dirinya secara samar-samar. Ia meminta Allah benar-benar menangani dosanya. Itulah bedanya antara berkubang dan bertobat. Berkubang terus berputar di sekitar luka. Pertobatan membawa luka itu kepada Dia yang sanggup menyembuhkannya.

Banyak dari kita belajar di suatu titik dalam hidup bahwa merasa bersalah dalam waktu lama adalah bukti bahwa kita sungguh-sungguh menyesal, seolah rasa malu adalah harga yang harus terus kita bayar. Namun tidak ada satu pun bagian Alkitab yang meminta kita menghukum diri sendiri lebih dulu sebelum Allah mau mengampuni. Hukuman atas dosa sudah ditanggung di kayu salib. Yang tersisa bagi kita bukan hukuman tambahan, melainkan respons — berbalik, mengaku, menerima. Rasa malu membuat kita berputar di tempat. Anugerah menggerakkan kita maju.

Jadi hari ini, cobalah latihan kecil namun jujur: sebutkan dengan jelas apa yang sesungguhnya terjadi, tanpa berlebihan menghakimi diri sendiri, tetapi juga tanpa mencari-cari alasan. Lalu bawalah hal yang jujur dan sederhana itu kepada Allah, seperti yang dilakukan Daud — bukan ke ruang pengadilan, melainkan ke hadapan belas kasihan. Tujuannya bukan supaya kita merasa lebih ringan begitu saja, melainkan supaya kita merasa dengan benar, lalu membiarkan perasaan itu membawa kita melangkah, bukan hanya duduk diam di dalamnya.',
    'Name today what actually happened — plainly, without exaggeration or excuse — and bring only that to God.', 'Sebutkan dengan jelas apa yang sesungguhnya terjadi hari ini — tanpa berlebihan atau mencari alasan — dan bawalah hanya itu kepada Allah.',
    'Lord, I bring you what is actually true instead of the vague heaviness I''ve been carrying. Wash me, don''t just soothe me. Give me a clean heart, not just a quieter conscience. Amen.', 'Tuhan, aku membawa kepada-Mu apa yang sesungguhnya benar, bukan sekadar beban samar yang selama ini kupikul. Basuhlah aku, jangan hanya menenangkanku sesaat. Berikanlah hati yang tahir, bukan sekadar hati nurani yang lebih tenang. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 51:1-2', 'WEB', 'Have mercy on me, O God, according to your unfailing love; according to your great compassion blot out my transgressions. Wash away all my iniquity and cleanse me from my sin.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 51:3-4', 'TB', 'Kasihanilah aku, ya Allah, menurut kasih setia-Mu, hapuskanlah pelanggaranku menurut rahmat-Mu yang besar! Bersihkanlah aku seluruhnya dari kesalahanku, dan tahirkanlah aku dari dosaku!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'The Father Who Runs', 'Bapa yang Berlari',
    'In the story Jesus tells of the prodigal son, the younger son rehearses a whole speech on the long walk home. He plans to say he is no longer worthy to be called a son, that he''ll settle for being treated like a hired hand. It is a reasonable plan. It''s the kind of bargain shame teaches us to make: ''I''ll accept a smaller love than the one I actually threw away, because that''s more than I deserve.''

But the father doesn''t let him finish. While the son is still far off, the father sees him and is moved with compassion — and he runs. In a culture where a dignified older man walking briskly, let alone running, was considered undignified, the father runs anyway. He doesn''t wait at the doorway with arms crossed, ready to hear the apology and weigh whether it''s sufficient. He closes the distance himself.

This is worth sitting with, because many of us picture God waiting at the door, arms crossed, wanting to see if we grovel convincingly enough before he''ll consider letting us back in. But that is not the God this story describes. This father is scanning the horizon. This father runs. This father interrupts the son''s rehearsed speech of unworthiness with an embrace and a robe and a ring — restoring, not merely tolerating.

If you have been picturing God at a distance, arms folded, waiting for you to earn your way back — try, today, picturing the running instead. You don''t have to close the whole distance yourself. He has already been watching for you, and he moves first.', 'Dalam kisah yang diceritakan Yesus tentang anak yang hilang, anak bungsu itu berlatih pidato sepanjang perjalanan pulang. Ia berencana mengatakan bahwa ia tidak layak lagi disebut anak, dan bersedia diperlakukan seperti orang upahan saja. Itu rencana yang masuk akal. Itulah tawar-menawar yang diajarkan rasa malu kepada kita: ''Aku akan menerima kasih yang lebih kecil daripada yang sebenarnya kubuang, sebab itu sudah lebih dari yang kupantas terima.''

Namun sang bapa tidak membiarkannya menyelesaikan pidatonya. Ketika anak itu masih jauh, sang bapa melihatnya dan tergeraklah hatinya oleh belas kasihan — lalu ia berlari. Dalam budaya di mana seorang lelaki tua yang terhormat berjalan cepat saja dianggap tidak pantas, apalagi berlari, sang bapa tetap berlari. Ia tidak menunggu di depan pintu dengan tangan bersedekap, siap mendengar permintaan maaf dan menimbang apakah itu cukup meyakinkan. Ia sendiri yang memperpendek jarak itu.

Ini layak direnungkan, sebab banyak dari kita membayangkan Allah menunggu di depan pintu, tangan bersedekap, ingin melihat apakah kita cukup meyakinkan merendahkan diri sebelum Ia mempertimbangkan untuk menerima kita kembali. Namun bukan itu gambaran Allah dalam kisah ini. Sang bapa memandangi cakrawala. Sang bapa berlari. Sang bapa memotong pidato ketidaklayakan yang sudah dilatih anaknya dengan pelukan, jubah, dan cincin — memulihkan, bukan sekadar menoleransi.

Jika selama ini engkau membayangkan Allah berdiri jauh, tangan bersedekap, menunggu engkau berusaha mendapatkan jalan kembali — cobalah hari ini membayangkan Dia yang berlari itu. Engkau tidak perlu menempuh seluruh jarak itu sendirian. Ia sudah lama mengawasi dan menantikanmu, dan Dialah yang bergerak lebih dulu.',
    'Picture God running toward you today, rather than waiting with arms crossed at a distance.', 'Bayangkan Allah berlari menyongsongmu hari ini, bukan menunggu jauh di sana dengan tangan bersedekap.',
    'Father, thank you that you move first. Forgive me for the small, bargained love I''ve been rehearsing to ask for instead of receiving what you''re actually offering. Amen.', 'Bapa, terima kasih karena Engkau yang bergerak lebih dahulu. Ampuni aku karena selama ini hanya berani meminta kasih yang kecil dan bersyarat, alih-alih menerima apa yang sesungguhnya Kautawarkan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Luke 15:20', 'WEB', 'So he got up and went to his father. But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lukas 15:20', 'TB', 'Maka bangkitlah ia dan pergi kepada bapanya. Ketika ia masih jauh, ayahnya telah melihatnya, lalu tergeraklah hatinya oleh belas kasihan, ia berlari mendapatkan anaknya lalu merangkul dan menciumnya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'No Condemnation Left to Stand On', 'Tak Ada Lagi Penghukuman untuk Berpijak',
    'Shame is a strange kind of gravity. Even after we''ve confessed something, even after we believe — in our heads — that we''re forgiven, shame keeps tugging us back down, replaying the failure, rehearsing the worst version of the story. It can feel like there is a prosecutor permanently seated in our minds, ready to reopen the case whenever we start to feel light again.

Paul''s words to the Roman church land like a verdict, not a suggestion. He doesn''t say ''try not to feel condemned'' or ''work toward less condemnation over time.'' He states a fact: there is now no condemnation for those in Christ Jesus. Present tense. Settled. The case is not reopened tomorrow if you have a bad day. It stays closed, because it was never closed based on your performance to begin with.

This matters because many of us relate to God the way we relate to a strict teacher who grades on a curve that keeps shifting — good today, back in trouble tomorrow. But this verse describes something more like a legal reality than a mood. Being ''in Christ'' isn''t a feeling you have to maintain through flawless behavior; it''s a location you''ve been placed into by grace, and location doesn''t fluctuate with your worst afternoon.

If shame shows up today rehearsing an old case against you, you don''t have to argue with it point by point. You can simply say what is true: that case is closed. Not because the accusations were false, but because the verdict has already been rendered — mercy, not condemnation — and it isn''t up for appeal.', 'Rasa malu adalah semacam gravitasi yang aneh. Bahkan setelah kita mengaku, bahkan setelah kita percaya — secara pikiran — bahwa kita sudah diampuni, rasa malu terus menarik kita turun, memutar ulang kegagalan itu, melatih ulang versi terburuk dari cerita kita. Rasanya seperti ada jaksa yang selalu duduk di dalam pikiran kita, siap membuka kembali perkara itu setiap kali kita mulai merasa lega.

Perkataan Paulus kepada jemaat di Roma terasa seperti sebuah vonis, bukan sekadar saran. Ia tidak berkata, ''cobalah untuk tidak merasa terhukum'' atau ''berusahalah agar lambat laun rasa terhukum itu berkurang.'' Ia menyatakan sebuah fakta: sekarang tidak ada lagi penghukuman bagi mereka yang ada di dalam Kristus Yesus. Bentuk kini. Sudah diputuskan. Perkara itu tidak dibuka kembali besok hanya karena kita mengalami hari yang buruk. Perkara itu tetap tertutup, sebab dari awal pun ia tidak pernah tertutup berdasarkan prestasi kita.

Ini penting sebab banyak dari kita memperlakukan hubungan dengan Allah seperti hubungan dengan guru yang keras dengan standar penilaian yang terus berubah — baik hari ini, bermasalah lagi besok. Namun ayat ini menggambarkan sesuatu yang lebih seperti kenyataan hukum daripada sekadar suasana hati. Berada ''di dalam Kristus'' bukanlah perasaan yang harus kita jaga lewat kelakuan yang sempurna; itu adalah tempat yang telah ditempatkan bagi kita oleh anugerah, dan tempat itu tidak berubah-ubah hanya karena sore terburuk yang pernah kita alami.

Jika hari ini rasa malu muncul kembali membuka perkara lama melawanmu, engkau tidak perlu membantahnya poin demi poin. Engkau cukup mengatakan apa yang benar: perkara itu sudah ditutup. Bukan karena tuduhan itu palsu, melainkan karena putusannya sudah dijatuhkan — belas kasihan, bukan penghukuman — dan putusan itu tidak bisa diajukan banding.',
    'When the old case is reopened in your mind today, answer with a fact instead of an argument: it is already closed.', 'Ketika perkara lama itu dibuka kembali di pikiranmu hari ini, jawablah dengan fakta, bukan dengan perdebatan: perkara itu sudah ditutup.',
    'Jesus, I don''t want to keep reopening a case you already closed. Teach me to answer shame with your verdict instead of my feelings. Amen.', 'Yesus, aku tidak mau terus membuka kembali perkara yang sudah Kautup. Ajarku menjawab rasa malu dengan putusan-Mu, bukan dengan perasaanku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 8:1', 'WEB', 'Therefore, there is now no condemnation for those who are in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 8:1', 'TB', 'Demikianlah sekarang tidak ada penghukuman bagi mereka yang ada di dalam Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'As Far as the East Is from the West', 'Sejauh Timur dari Barat',
    'There''s a particular kind of anxiety in trying to forgive yourself, because you can never quite get far enough away from what you did. You live inside your own memory. You can move to a new city, change your habits, apologize a hundred times, and the memory is still right there, filed and searchable, the moment you go looking for it — or the moment it comes looking for you.

The psalmist reaches for an image that solves exactly this problem: as far as the east is from the west. North and south have a fixed point — the poles — where distance eventually turns around and starts closing again. But east and west never meet. Travel east forever, and you are always, endlessly, still traveling east. It''s a distance with no return trip. That is the image chosen to describe what God does with our sin once forgiven: not moved a manageable distance, but removed beyond any possibility of retracing.

We often treat our own memory as though it were God''s memory too — as if because we can still recall it in vivid detail, He must still be holding it against us somewhere in the back of His mind. But Scripture consistently describes God''s forgiveness as removal, not filing. Sin dealt with in Christ isn''t tucked away where it could resurface later. It''s gone in a way our memory simply isn''t built to fully imagine.

You may never stop being able to recall what happened — memory isn''t usually erased that neatly. But recalling it is not the same as God still holding it. Today, when the memory surfaces, let it be just that: a memory, not a fresh accusation. The distance between you and that sin, in God''s accounting, is already further than east from west.', 'Ada semacam kecemasan tersendiri dalam usaha mengampuni diri sendiri, sebab kita tidak pernah bisa benar-benar menjauh dari apa yang pernah kita lakukan. Kita hidup di dalam ingatan kita sendiri. Kita bisa pindah ke kota baru, mengubah kebiasaan, meminta maaf seratus kali, dan ingatan itu tetap ada di sana, tersimpan rapi dan mudah dicari, begitu kita mencarinya — atau begitu ia yang datang mencari kita.

Sang pemazmur memakai gambaran yang justru menjawab persoalan ini: sejauh timur dari barat. Utara dan selatan memiliki titik tetap — kutub-kutubnya — di mana jarak pada akhirnya berbalik dan mulai mendekat lagi. Namun timur dan barat tidak pernah bertemu. Berjalanlah ke timur selamanya, dan engkau akan terus-menerus, tanpa henti, tetap berjalan ke arah timur. Itulah jarak yang tidak ada jalan kembalinya. Itulah gambaran yang dipilih untuk menjelaskan apa yang Allah lakukan terhadap dosa kita setelah diampuni: bukan dipindahkan sejauh yang masih bisa dijangkau, melainkan disingkirkan melampaui segala kemungkinan untuk ditelusuri kembali.

Kita sering memperlakukan ingatan kita sendiri seolah-olah itu juga ingatan Allah — seakan karena kita masih bisa mengingatnya dengan jelas, pasti Dia pun masih menyimpannya di suatu sudut pikiran-Nya. Namun Alkitab secara konsisten menggambarkan pengampunan Allah sebagai penyingkiran, bukan penyimpanan arsip. Dosa yang telah diselesaikan di dalam Kristus tidak disimpan di suatu tempat untuk mungkin muncul lagi kelak. Itu telah lenyap dengan cara yang bahkan tidak sepenuhnya bisa dibayangkan oleh ingatan kita.

Mungkin engkau tidak akan pernah berhenti bisa mengingat apa yang terjadi — ingatan biasanya tidak terhapus serapi itu. Namun mengingatnya bukan berarti Allah masih menyimpannya. Hari ini, ketika ingatan itu muncul kembali, biarkan itu hanya sebuah ingatan, bukan tuduhan baru. Jarak antara dirimu dan dosa itu, dalam catatan Allah, sudah lebih jauh daripada timur dari barat.',
    'When memory resurfaces today, let it stay a memory — not a fresh accusation.', 'Ketika ingatan itu muncul lagi hari ini, biarkan ia tetap menjadi sekadar ingatan — bukan tuduhan baru.',
    'Lord, my memory can''t measure distance the way you do. Help me trust your removal of my sin even when I can still recall it clearly. Amen.', 'Tuhan, ingatanku tidak bisa mengukur jarak seperti yang Kaulakukan. Tolong aku memercayai penyingkiran dosaku oleh-Mu, bahkan ketika aku masih bisa mengingatnya dengan jelas. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 103:12', 'WEB', 'as far as the east is from the west, so far has he removed our transgressions from us.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 103:12', 'TB', 'sejauh timur dari barat, demikian dijauhkan-Nya dari kita pelanggaran kita.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Received, Not Just Believed', 'Diterima, Bukan Sekadar Dipercaya',
    'It''s possible to believe a fact and still not receive its comfort. You can believe, correctly, that a bridge is structurally sound, and still white-knuckle the steering wheel the whole way across. Many of us are like that with forgiveness: we affirm it as true doctrine, we could pass a quiz on it, and yet we still live like people who haven''t quite been let across.

God, through the prophet Isaiah, doesn''t just describe forgiveness as an abstract mercy — he describes himself as the active agent doing the blotting out, and he adds a reason that has nothing to do with our worthiness: ''for my own sake.'' Not because we finally proved ourselves, not because we groveled sufficiently, but because it is who God is to forgive. That takes the whole transaction out of our hands. We are not the ones making forgiveness happen through enough remorse. We are the ones receiving what God does for his own name''s sake.

Receiving is different from believing. Believing is agreeing with a fact. Receiving is letting the fact change how you actually stand today — walking differently, praying differently, letting yourself laugh again without the reflexive guilt tax. It''s the difference between reading that a debt was paid and actually stopping the anxious mental math of what you still owe.

So today, don''t just recite the truth that you''re forgiven — practice it. Let yourself do one ordinary, undramatic thing without the shadow tax of shame attached: pray without apologizing first for existing, accept a compliment, sit in worship without mentally rehearsing your disqualifications. That is what receiving looks like. Not a bigger feeling, necessarily — just less resistance to what was already true.', 'Sangat mungkin bagi seseorang untuk memercayai sebuah fakta namun tetap tidak menerima kenyamanannya. Engkau bisa saja percaya, dan benar, bahwa sebuah jembatan itu kokoh, namun tetap mencengkeram kemudi erat-erat sepanjang jalan menyeberang. Banyak dari kita seperti itu dengan pengampunan: kita mengakuinya sebagai ajaran yang benar, kita bahkan bisa lulus ujian tentangnya, namun tetap hidup seperti orang yang belum benar-benar diizinkan menyeberang.

Allah, melalui nabi Yesaya, tidak hanya menggambarkan pengampunan sebagai belas kasihan yang abstrak — Ia menggambarkan diri-Nya sendiri sebagai pelaku aktif yang menghapus dosa itu, dan Ia menambahkan alasan yang sama sekali tidak berkaitan dengan kelayakan kita: ''oleh karena Aku sendiri.'' Bukan karena kita akhirnya membuktikan diri, bukan karena kita cukup merendahkan diri, melainkan karena memang begitulah sifat Allah dalam mengampuni. Ini mengeluarkan seluruh urusan itu dari tangan kita. Bukan kita yang membuat pengampunan terjadi lewat penyesalan yang cukup. Kitalah yang menerima apa yang Allah kerjakan demi nama-Nya sendiri.

Menerima berbeda dari sekadar percaya. Percaya adalah menyetujui sebuah fakta. Menerima adalah membiarkan fakta itu mengubah bagaimana kita sungguh-sungguh berdiri hari ini — berjalan dengan cara berbeda, berdoa dengan cara berbeda, membiarkan diri tertawa lagi tanpa pajak rasa bersalah yang otomatis muncul. Itulah bedanya antara membaca bahwa sebuah utang telah dilunasi, dengan benar-benar berhenti menghitung cemas berapa lagi yang masih kita tanggung.

Jadi hari ini, jangan hanya mengucapkan kebenaran bahwa engkau telah diampuni — praktikkanlah. Biarkan dirimu melakukan satu hal biasa, tanpa drama, tanpa bayang-bayang pajak rasa malu yang menyertainya: berdoa tanpa lebih dulu meminta maaf karena eksis, menerima pujian, duduk dalam penyembahan tanpa diam-diam melatih ulang daftar ketidaklayakanmu. Itulah wujud dari menerima. Bukan sekadar perasaan yang lebih besar, melainkan lebih sedikit perlawanan terhadap apa yang sesungguhnya sudah benar sejak awal.',
    'Do one ordinary thing today without the shadow tax of shame attached — let receiving become practice, not just belief.', 'Lakukan satu hal biasa hari ini tanpa bayang-bayang pajak rasa malu — biarkan menerima menjadi praktik nyata, bukan sekadar keyakinan.',
    'Father, I believe I''m forgiven, but help me actually receive it — to walk lighter, pray freer, and let your grace change how I live today, not just what I know. Amen.', 'Bapa, aku percaya bahwa aku telah diampuni, tetapi tolong aku sungguh-sungguh menerimanya — untuk melangkah lebih ringan, berdoa lebih bebas, dan membiarkan anugerah-Mu mengubah caraku hidup hari ini, bukan hanya apa yang kuketahui. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 43:25', 'WEB', 'I, even I, am he who blots out your transgressions, for my own sake, and remembers your sins no more.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 43:25', 'TB', 'Akulah, Akulah yang menghapus dosa pemberontakanmu oleh karena Aku sendiri, dan Aku tidak mengingat-ingat dosamu.');

  -- Plan: The Open Door
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'The Open Door',
    'Pintu yang Terbuka',
    'Meeting mercy face to face in Reconciliation',
    'Bertatap muka dengan belas kasihan dalam Sakramen Rekonsiliasi',
    7,
    'A seven-day walk through the meaning and grace of the Sacrament of Reconciliation, for anyone who has come to see Confession as a checklist, a dreaded obligation, or a distant memory. Day by day, this plan reframes the confessional not as an interrogation room but as the place where the running father actually waits — moving from the fear of being known, through the mechanics and meaning of confessing aloud, to walking out with real, tangible peace.',
    'Perjalanan tujuh hari menyusuri makna dan anugerah Sakramen Rekonsiliasi, bagi siapa saja yang mulai memandang Pengakuan Dosa sekadar sebagai daftar tugas, kewajiban yang ditakuti, atau kenangan yang jauh. Hari demi hari, rencana ini menata ulang ruang pengakuan bukan sebagai ruang interogasi, melainkan sebagai tempat di mana sang bapa yang berlari itu sungguh-sungguh menanti — mulai dari rasa takut untuk dikenali, melalui makna dan tata cara mengaku dengan suara, hingga akhirnya melangkah keluar membawa damai yang nyata.',
    '/images/devotions/the-open-door.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Why We Avoid the Door We Need Most', 'Mengapa Kita Menghindari Pintu yang Paling Kita Butuhkan',
    'It''s a strange contradiction: the sacrament designed to relieve our heaviest burden is often the one we avoid the longest. We''ll confess our faults to a friend over coffee, half-joke about our flaws on social media, even complain about ourselves to a stranger — but sit across from a priest and say the actual words out loud, specifically, on purpose? That can feel like the hardest sentence we''ll ever speak.

Part of this is simple fear of exposure. Adam and Eve, the very first humans, respond to their own sin not by running toward God but by hiding among the trees. That instinct is ancient and it is ours too. We hide behind vague language, behind busyness, behind ''I''ll go next time,'' because hiding feels safer than being seen clearly, even by someone bound to secrecy and standing in persona Christi.

But notice what God does in that garden: he doesn''t wait for Adam to come find him. He walks through the garden calling, ''Where are you?'' — not because he doesn''t know, but because he wants Adam to step out of hiding and be found. Reconciliation works the same way. God is not lying in wait to catch us; he is already walking through the garden of our lives, calling us out of hiding, because being found by mercy is entirely different from being caught by judgment.

This week isn''t about guilt-tripping anyone into a confessional line. It''s an invitation to notice the difference between hiding and being found — and to consider that the door we''ve been avoiding might be the very place we''ve most needed to walk through.', 'Ini kontradiksi yang aneh: sakramen yang dirancang untuk meringankan beban terberat kita justru sering menjadi yang paling lama kita hindari. Kita bisa mengaku kesalahan pada teman sambil minum kopi, bercanda setengah serius tentang kekurangan diri di media sosial, bahkan mengeluh tentang diri sendiri kepada orang asing — tetapi duduk berhadapan dengan seorang imam dan mengucapkan kata-kata itu dengan suara, secara spesifik, dengan sengaja? Itu bisa terasa seperti kalimat paling berat yang pernah kita ucapkan.

Sebagian dari ini adalah rasa takut yang sederhana untuk terbuka. Adam dan Hawa, manusia pertama, menanggapi dosa mereka sendiri bukan dengan berlari kepada Allah, melainkan dengan bersembunyi di antara pepohonan. Naluri itu kuno dan itu juga naluri kita. Kita bersembunyi di balik bahasa yang samar, di balik kesibukan, di balik ''nanti lain kali saja,'' sebab bersembunyi terasa lebih aman daripada dilihat dengan jelas, bahkan oleh seseorang yang terikat kerahasiaan dan berdiri in persona Christi.

Namun perhatikan apa yang Allah lakukan di taman itu: Ia tidak menunggu Adam datang mencari-Nya. Ia berjalan di taman itu memanggil, ''Di manakah engkau?'' — bukan karena Ia tidak tahu, melainkan karena Ia ingin Adam melangkah keluar dari persembunyian dan ditemukan. Rekonsiliasi bekerja dengan cara yang sama. Allah tidak sedang mengintai untuk menangkap kita; Ia sudah berjalan di taman kehidupan kita, memanggil kita keluar dari persembunyian, sebab ditemukan oleh belas kasihan sama sekali berbeda dari tertangkap oleh penghakiman.

Minggu ini bukan tentang membuat siapa pun merasa bersalah agar mengantre di ruang pengakuan. Ini adalah undangan untuk memperhatikan perbedaan antara bersembunyi dan ditemukan — dan untuk mempertimbangkan bahwa pintu yang selama ini kita hindari mungkin justru tempat yang paling kita perlukan untuk kita lalui.',
    'Notice today where you''ve been hiding instead of being found, and ask what it would take to step out.', 'Perhatikan hari ini di mana engkau selama ini bersembunyi, bukan membiarkan diri ditemukan, dan tanyakan apa yang dibutuhkan untuk melangkah keluar.',
    'Lord, I''ve been hiding among the trees. Call my name today, and give me courage to step toward the door instead of further into the shadows. Amen.', 'Tuhan, aku telah bersembunyi di antara pepohonan. Panggillah namaku hari ini, dan berilah aku keberanian untuk melangkah menuju pintu, bukan semakin jauh ke dalam bayang-bayang. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 John 1:9', 'WEB', 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Yohanes 1:9', 'TB', 'Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'He Does Not Condemn You', 'Ia Tidak Menghukummu',
    'The scribes and Pharisees drag a woman caught in adultery into the middle of the temple courts, stones ready, using her as a trap to catch Jesus in a legal contradiction. It is a scene built entirely around public exposure and condemnation — everything the confessional is often, wrongly, imagined to be. And into that scene, Jesus does something unexpected: he bends down and writes in the dust, letting the accusers examine their own consciences instead of hers.

One by one, beginning with the oldest, the accusers leave. When only Jesus and the woman remain, he asks a simple question: has no one condemned you? She answers, ''No one, Lord.'' And Jesus, the only person in that courtyard actually qualified to condemn her, says instead: ''Neither do I condemn you.''

This is the posture the confessional was built to offer. A priest sitting there is not another accuser gathering stones. He stands as a witness to what Jesus already said in that courtyard: neither do I condemn you. The words spoken in absolution are not the priest''s personal opinion of your worthiness — they are Christ''s own verdict, delivered through his Church, echoing across two thousand years to that exact moment.

''Go now and leave your life of sin.'' Notice the order: mercy first, then transformation. Not the reverse. Jesus doesn''t make forgiveness conditional on her first proving she''s changed. He forgives, and the forgiveness itself becomes the ground she stands on to walk forward differently. That is not a technicality — it''s the entire logic of grace, and it''s exactly what waits on the other side of that door.', 'Para ahli Taurat dan orang Farisi menyeret seorang perempuan yang kedapatan berzina ke tengah pelataran Bait Allah, batu-batu sudah siap di tangan, menjadikannya jebakan untuk menjerat Yesus dalam kontradiksi hukum. Ini adegan yang seluruhnya dibangun di atas keterbukaan publik dan penghakiman — segala sesuatu yang sering, secara keliru, dibayangkan sebagai gambaran ruang pengakuan. Namun di tengah adegan itu, Yesus melakukan sesuatu yang tak terduga: Ia membungkuk dan menulis di tanah, membiarkan para penuduh memeriksa hati nurani mereka sendiri, bukan hati perempuan itu.

Satu per satu, dimulai dari yang tertua, para penuduh itu pergi. Ketika hanya Yesus dan perempuan itu yang tersisa, Ia bertanya sebuah pertanyaan sederhana: tidak adakah seorang pun yang menghukum engkau? Perempuan itu menjawab, ''Tidak ada, Tuhan.'' Dan Yesus, satu-satunya orang di pelataran itu yang sesungguhnya berhak menghukum, justru berkata: ''Aku pun tidak menghukum engkau.''

Inilah sikap yang hendak ditawarkan oleh ruang pengakuan. Seorang imam yang duduk di sana bukanlah penuduh lain yang mengumpulkan batu. Ia berdiri sebagai saksi atas apa yang telah Yesus katakan di pelataran itu: Aku pun tidak menghukum engkau. Kata-kata yang diucapkan dalam absolusi bukanlah pendapat pribadi sang imam tentang kelayakan kita — itu adalah putusan Kristus sendiri, disampaikan melalui Gereja-Nya, bergema melintasi dua ribu tahun hingga tepat pada momen itu.

''Pergilah, dan jangan berbuat dosa lagi.'' Perhatikan urutannya: belas kasihan lebih dulu, baru kemudian perubahan. Bukan sebaliknya. Yesus tidak menjadikan pengampunan bersyarat dengan lebih dulu membuktikan bahwa perempuan itu telah berubah. Ia mengampuni, dan pengampunan itu sendiri menjadi pijakan bagi perempuan itu untuk melangkah maju dengan cara yang berbeda. Itu bukan sekadar detail teknis — itu adalah keseluruhan logika anugerah, dan itulah tepatnya yang menanti di balik pintu itu.',
    'Remember today that mercy comes first and makes the change possible — it isn''t a reward for change already proven.', 'Ingatlah hari ini bahwa belas kasihan datang lebih dulu dan justru membuat perubahan itu mungkin — bukan sebagai hadiah atas perubahan yang sudah dibuktikan.',
    'Jesus, thank you for refusing to condemn me even when I''ve gathered my own stones against myself. Let your mercy go first, and let it be the ground I walk on. Amen.', 'Yesus, terima kasih karena Engkau menolak menghukumku bahkan ketika aku sendiri sudah mengumpulkan batu untuk diriku sendiri. Biarlah belas kasihan-Mu berjalan lebih dulu, dan menjadi pijakan yang kutapaki. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'John 8:11', 'WEB', '"No one, sir," she said. "Then neither do I condemn you," Jesus declared. "Go now and leave your life of sin."');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yohanes 8:11', 'TB', 'Jawab perempuan itu: ''Tidak ada, Tuhan.'' Lalu kata Yesus: ''Aku pun tidak menghukum engkau. Pergilah, dan jangan berbuat dosa lagi mulai dari sekarang.''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Cast Into the Depths of the Sea', 'Dilemparkan ke Dasar Lautan',
    'The prophet Micah, writing to a people well acquainted with their own repeated failures, doesn''t just say God forgives — he reaches for one of the most vivid images in Scripture: God will tread our sins underfoot and hurl them into the depths of the sea. Not set them gently on a shelf. Not tuck them into a drawer marked ''handle with care.'' Hurled. Into the deepest, most unreachable place available.

This matters for how we understand Confession, because many of us treat the sins we confess like items in storage — technically forgiven, but still filed somewhere retrievable, still something we could, in theory, dig back up and hold against ourselves later. Micah''s image refuses that. The sea in the ancient imagination wasn''t just deep; it was chaotic, uncharted, essentially bottomless. Something hurled there isn''t misplaced. It''s gone in the most absolute sense the language had available.

This is precisely what happens in sacramental confession, and it''s worth naming plainly: absolution is not a symbolic gesture or a comforting ritual layered over an unchanged reality. The Church has always taught that in this sacrament, sins confessed and absolved are genuinely forgiven — hurled into the depths, in Micah''s language. Not managed. Not merely tolerated going forward. Actually removed.

So when you leave the confessional, you are not leaving with your sins re-filed under ''forgiven, but still here.'' You are leaving with sins that have been thrown into the sea. If the thought of returning to dig through the water and retrieve them tomorrow feels tempting, that temptation is worth naming for what it is — not humility, but a refusal to let the water be deep enough.', 'Nabi Mikha, menulis kepada umat yang sangat mengenal kegagalan mereka sendiri yang berulang, tidak hanya berkata bahwa Allah mengampuni — ia memakai salah satu gambaran paling hidup dalam Alkitab: Allah akan menginjak-injak dosa kita dan melemparkannya ke dasar lautan. Bukan meletakkannya dengan lembut di rak. Bukan menyimpannya di laci berlabel ''tangani dengan hati-hati.'' Dilemparkan. Ke tempat terdalam dan paling tak terjangkau yang ada.

Ini penting bagi cara kita memahami Pengakuan Dosa, sebab banyak dari kita memperlakukan dosa yang telah kita akui seperti barang di gudang — secara teknis sudah diampuni, tetapi tetap tersimpan di suatu tempat yang bisa diambil kembali, sesuatu yang secara teori masih bisa kita gali lagi dan gunakan untuk menghakimi diri sendiri di kemudian hari. Gambaran Mikha menolak hal itu. Laut dalam benak masyarakat kuno bukan sekadar dalam; itu kacau, tak terpetakan, hampir tak berdasar. Sesuatu yang dilemparkan ke sana bukan sekadar salah tempat. Itu lenyap dalam arti yang paling mutlak yang mampu dijelaskan oleh bahasa saat itu.

Inilah tepatnya yang terjadi dalam pengakuan dosa sakramental, dan layak dikatakan dengan jelas: absolusi bukanlah gerakan simbolis atau ritual yang menenangkan yang dilapiskan di atas kenyataan yang tak berubah. Gereja selalu mengajarkan bahwa dalam sakramen ini, dosa yang diakui dan diabsolusi sungguh-sungguh diampuni — dilemparkan ke dasar laut, dalam bahasa Mikha. Bukan sekadar dikelola. Bukan sekadar ditoleransi ke depannya. Benar-benar disingkirkan.

Jadi ketika engkau keluar dari ruang pengakuan, engkau tidak keluar dengan dosa-dosamu yang hanya dipindah-arsipkan menjadi ''sudah diampuni, tapi masih di sini.'' Engkau keluar dengan dosa-dosa yang telah dilemparkan ke lautan. Jika muncul godaan untuk kembali menyelam mengais air itu dan mengambilnya lagi besok, godaan itu layak dikenali sebagaimana adanya — bukan kerendahan hati, melainkan penolakan untuk membiarkan air itu cukup dalam.',
    'Let your confessed sins stay in the depths today — resist the pull to dig them back up as evidence against yourself.', 'Biarkan dosa-dosa yang telah kauakui tetap berada di dasar laut hari ini — tolak dorongan untuk menggalinya kembali sebagai bukti melawan dirimu sendiri.',
    'Lord, I confess I sometimes go looking for what you''ve already hurled into the sea. Help me trust the depth of your mercy more than the reach of my memory. Amen.', 'Tuhan, aku mengaku kadang aku mencari-cari apa yang sudah Kaulemparkan ke lautan. Tolong aku memercayai kedalaman belas kasihan-Mu lebih daripada jangkauan ingatanku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Micah 7:19', 'WEB', 'You will again have compassion on us; you will tread our sins underfoot and hurl all our iniquities into the depths of the sea.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mikha 7:19', 'TB', 'Ia akan kembali menyayangi kita, akan menginjak-injak segala kesalahan kita ke dalam laut.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Approaching the Throne With Confidence', 'Menghampiri Takhta dengan Keberanian',
    'The word ''confession'' can carry courtroom weight in our minds — a defendant approaching a bench, bracing for sentencing. But the letter to the Hebrews describes something entirely different: approaching a throne of grace, and doing so with confidence, in order to receive mercy and find grace to help in time of need. Notice the destination isn''t punishment. It''s help.

This reframes what actually happens when we walk into that confessional. We are not approaching a judge''s bench hoping for leniency. We are approaching a throne specifically described as gracious, where the explicit purpose of the visit is to receive something we need — mercy for the past, grace for what''s ahead. The posture Hebrews invites isn''t cringing. It''s confidence, because of who sits on that throne and what he has already done to make the approach safe.

This confidence isn''t arrogance or presuming that our sin doesn''t matter. It''s the confidence of someone who has been told, reliably, by someone trustworthy, that they are welcome. A child doesn''t approach a loving parent''s desk with legal argumentation prepared; they approach because they''ve learned, through repetition, that the door is open. That same learned trust is available here, if we let ourselves practice it rather than defaulting to dread every time.

If you''ve been treating the confessional as a bench to be sentenced from, try shifting the image this week: a throne of grace, approached with confidence, for the specific purpose of receiving mercy and finding help. That is not wishful thinking. It is the description Scripture itself gives.', 'Kata ''pengakuan'' bisa membawa bobot ruang sidang di benak kita — seorang terdakwa mendekati meja hakim, bersiap menerima vonis. Namun surat Ibrani menggambarkan sesuatu yang sama sekali berbeda: menghampiri takhta kasih karunia, dan melakukannya dengan penuh keberanian, untuk menerima rahmat dan menemukan kasih karunia guna menolong pada waktu yang tepat. Perhatikan bahwa tujuannya bukan hukuman. Itu adalah pertolongan.

Ini menata ulang apa yang sesungguhnya terjadi ketika kita melangkah masuk ke ruang pengakuan itu. Kita tidak sedang menghampiri meja hakim berharap keringanan. Kita sedang menghampiri sebuah takhta yang secara eksplisit digambarkan penuh kasih karunia, di mana tujuan kunjungan itu adalah menerima sesuatu yang kita butuhkan — rahmat untuk masa lalu, kasih karunia untuk yang akan datang. Sikap yang diundang oleh surat Ibrani bukanlah menciut ketakutan. Itu adalah keberanian, karena siapa yang duduk di takhta itu dan apa yang telah Ia lakukan untuk membuat penghampiran itu aman.

Keberanian ini bukan kesombongan atau menganggap dosa kita tidak penting. Ini adalah keberanian seseorang yang telah diberitahu, secara dapat diandalkan, oleh seseorang yang dapat dipercaya, bahwa ia diterima. Seorang anak tidak menghampiri meja orang tua yang mengasihinya dengan argumen hukum yang sudah disiapkan; ia menghampiri karena telah belajar, lewat pengulangan, bahwa pintu itu terbuka. Kepercayaan yang dipelajari yang sama itu tersedia di sini, jika kita membiarkan diri mempraktikkannya alih-alih selalu jatuh pada rasa takut.

Jika selama ini engkau memperlakukan ruang pengakuan sebagai meja hakim tempat vonis dijatuhkan, cobalah mengubah gambarannya minggu ini: sebuah takhta kasih karunia, dihampiri dengan penuh keberanian, dengan tujuan khusus menerima rahmat dan menemukan pertolongan. Itu bukan angan-angan belaka. Itu adalah gambaran yang diberikan oleh Alkitab sendiri.',
    'Practice approaching God today the way Hebrews describes — with confidence, expecting mercy and help, not sentencing.', 'Latihlah hari ini menghampiri Allah sebagaimana digambarkan surat Ibrani — dengan keberanian, menantikan rahmat dan pertolongan, bukan vonis.',
    'Lord, teach me to approach your throne the way a child approaches a parent who loves them, not a defendant approaching a bench. Amen.', 'Tuhan, ajarlah aku menghampiri takhta-Mu seperti seorang anak menghampiri orang tua yang mengasihinya, bukan seperti terdakwa menghampiri meja hakim. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Hebrews 4:16', 'WEB', 'Let us then approach God''s throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ibrani 4:16', 'TB', 'Sebab itu marilah kita dengan penuh keberanian menghampiri takhta kasih karunia, supaya kita menerima rahmat dan menemukan kasih karunia untuk mendapat pertolongan kita pada waktunya.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Loved Much, Loving Much', 'Dikasihi Banyak, Mengasihi Banyak',
    'At a dinner in a Pharisee''s house, a woman known in the town for her sinful life comes in uninvited, weeping at Jesus''s feet, wiping them with her hair, pouring out perfume. It is an extravagant, undignified, public act — the kind of thing that made her host visibly uncomfortable, wondering aloud what sort of prophet would let such a woman touch him.

Jesus answers not by correcting her behavior but by explaining it. He tells a small story about two debtors, one forgiven a huge amount, one forgiven a little, and asks which will love the moneylender more. The obvious answer is the one forgiven more. Then Jesus makes the connection explicit: her extravagant love is the natural response of someone who has grasped, in her bones, how much she''s been forgiven.

This is worth sitting with honestly, because sometimes the people who seem most ''religious'' love the least demonstratively, not because their sin is smaller, but because they''ve never let themselves feel the size of what''s been forgiven. Meanwhile, someone who walks out of confession in tears, overwhelmed, isn''t being dramatic — she may simply be responding accurately to the actual size of the mercy she just received.

Confession done well isn''t meant to leave us neutral, quietly relieved the way we feel after finishing an unpleasant chore. It''s meant to leave us like this woman — loving extravagantly, because we''ve finally let ourselves feel how much was forgiven rather than managing it at arm''s length. If you''ve never cried in that room, that''s not a failure. But if you find yourself moved to something like this woman''s love afterward, don''t talk yourself out of it. That response fits the size of the gift.', 'Dalam sebuah jamuan di rumah seorang Farisi, seorang perempuan yang dikenal di kota itu karena hidupnya yang berdosa datang tanpa diundang, menangis di kaki Yesus, menyekanya dengan rambutnya, menuangkan minyak wangi. Itu adalah tindakan yang berlebihan, tidak terhormat menurut ukuran waktu itu, dan dilakukan di depan umum — hal yang membuat tuan rumahnya terlihat tidak nyaman, bertanya-tanya dalam hati nabi macam apa yang membiarkan perempuan seperti itu menyentuhnya.

Yesus menjawab bukan dengan menegur perilakunya, melainkan dengan menjelaskannya. Ia menceritakan kisah kecil tentang dua orang berutang, satu diampuni jumlah besar, satu diampuni jumlah kecil, lalu bertanya siapa yang akan lebih mengasihi si pemberi pinjaman. Jawaban yang jelas adalah yang diampuni lebih banyak. Lalu Yesus membuat hubungannya eksplisit: kasih perempuan itu yang berlebihan adalah respons alami dari seseorang yang benar-benar memahami, sampai ke lubuk hatinya, betapa besar ia telah diampuni.

Ini layak direnungkan dengan jujur, sebab kadang orang-orang yang tampak paling ''religius'' justru mengasihi dengan cara paling sedikit ditunjukkan, bukan karena dosa mereka lebih kecil, melainkan karena mereka belum pernah membiarkan diri merasakan besarnya apa yang telah diampuni. Sementara itu, seseorang yang keluar dari ruang pengakuan sambil menangis, terharu, bukan sedang berlebihan — ia mungkin hanya merespons secara akurat besarnya belas kasihan yang baru saja ia terima.

Pengakuan dosa yang dijalani dengan baik tidak dimaksudkan membuat kita netral, hanya lega diam-diam seperti setelah menyelesaikan tugas yang tidak menyenangkan. Itu dimaksudkan membuat kita seperti perempuan ini — mengasihi secara berlebihan, sebab kita akhirnya membiarkan diri merasakan betapa besar yang telah diampuni, bukan mengelolanya dari jarak aman. Jika engkau belum pernah menangis di ruangan itu, itu bukan kegagalan. Namun jika engkau tergerak seperti kasih perempuan ini sesudahnya, jangan membujuk diri untuk menahannya. Respons itu sepadan dengan besarnya karunia yang diterima.',
    'Let yourself actually feel the size of what''s been forgiven today, instead of managing it at arm''s length.', 'Biarkan dirimu benar-benar merasakan besarnya apa yang telah diampuni hari ini, bukan sekadar mengelolanya dari jarak aman.',
    'Jesus, don''t let me love little because I''ve managed my forgiveness at a safe distance. Let me feel the size of your mercy enough to respond extravagantly. Amen.', 'Yesus, jangan biarkan aku mengasihi sedikit karena selama ini mengelola pengampunan-Mu dari jarak yang aman. Biarkan aku merasakan besarnya belas kasihan-Mu cukup untuk meresponnya dengan berlebihan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Luke 7:47-48', 'WEB', 'Therefore, I tell you, her many sins have been forgiven—as her great love has shown. But whoever has been forgiven little loves little. Then Jesus said to her, "Your sins are forgiven."');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lukas 7:47-48', 'TB', 'Sebab itu Aku berkata kepadamu: Dosanya yang banyak itu telah diampuni, sebab ia telah banyak berbuat kasih. Tetapi orang yang sedikit diampuni, sedikit juga ia berbuat kasih. Lalu Ia berkata kepada perempuan itu: ''Dosamu telah diampuni.''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'Crimson Made White as Snow', 'Merah Kirmizi Menjadi Putih Seperti Salju',
    'God, through Isaiah, extends an invitation that reads almost like a legal negotiation: ''Come now, let us reason together.'' It''s a striking way to open, because it treats us not as helpless defendants but as participants in a real conversation, one where God himself lays out the terms plainly: though your sins are like scarlet, they shall be as white as snow; though they are red as crimson, they shall be like wool.

Scarlet and crimson dyes in the ancient world were notoriously difficult to remove — they were chosen for clothing precisely because they were so colorfast, so permanent. Isaiah reaches for the two most stubborn stains available in the ancient imagination specifically to make a point: even those, God says, can become white as snow. Not gray. Not a lighter shade of red that fades over time with effort. White. Completely changed in kind, not degree.

This matters for how we think about repeated confession of the same struggles. It can feel discouraging to keep bringing the same crimson stain back to God, session after session, wondering if it''s even really coming out or if we''re just having the same conversation on repeat. But Isaiah''s image doesn''t put an asterisk on stubborn stains. The whole point of choosing scarlet and crimson — the hardest colors to lift — is to say that God''s power to cleanse isn''t limited by how deep or repeated the stain is.

So bring the same struggle back if you need to. Bring it as many times as it takes. The invitation to ''reason together'' isn''t a one-time offer that expires after your first confession of a particular sin. It''s standing open, and the promise attached to it — scarlet becoming snow — was never rated for easy stains only.', 'Allah, melalui nabi Yesaya, mengulurkan undangan yang terdengar hampir seperti negosiasi hukum: ''Marilah, baiklah kita berperkara.'' Ini cara membuka percakapan yang mencolok, sebab memperlakukan kita bukan sebagai terdakwa yang tak berdaya, melainkan sebagai peserta dalam percakapan nyata, di mana Allah sendiri menyampaikan syaratnya dengan jelas: sekalipun dosamu merah seperti kirmizi, akan menjadi putih seperti salju; sekalipun berwarna merah seperti kain kesumba, akan menjadi putih seperti bulu domba.

Pewarna merah kirmizi dan kesumba pada zaman kuno terkenal sangat sulit dihilangkan — dipilih untuk pakaian justru karena begitu tahan luntur, begitu permanen. Yesaya memakai dua noda paling membandel yang bisa dibayangkan pada zaman itu justru untuk menegaskan sebuah pokok: bahkan noda seperti itu, kata Allah, bisa menjadi putih seperti salju. Bukan abu-abu. Bukan merah yang sedikit lebih pudar setelah usaha berkepanjangan. Putih. Berubah sepenuhnya dalam jenisnya, bukan hanya derajatnya.

Ini penting bagi cara kita memandang pengakuan yang berulang atas pergumulan yang sama. Bisa terasa mengecilkan hati untuk terus membawa noda kirmizi yang sama kepada Allah, kali demi kali, bertanya-tanya apakah itu benar-benar hilang atau kita hanya mengulang percakapan yang sama. Namun gambaran Yesaya tidak memberi tanda bintang pada noda yang membandel. Seluruh maksud dari memilih merah kirmizi dan kesumba — warna paling sulit dihilangkan — adalah untuk mengatakan bahwa kuasa Allah untuk menyucikan tidak dibatasi oleh seberapa dalam atau seberapa sering noda itu terjadi.

Jadi bawalah kembali pergumulan yang sama jika engkau perlu. Bawalah sebanyak yang diperlukan. Undangan untuk ''berperkara bersama'' bukanlah tawaran sekali pakai yang berakhir setelah pengakuan pertama atas dosa tertentu. Undangan itu tetap terbuka, dan janji yang menyertainya — kirmizi menjadi salju — tidak pernah dibatasi hanya untuk noda yang mudah dihilangkan.',
    'If there''s a repeated struggle you feel discouraged bringing back to Confession, bring it anyway — the invitation never expires.', 'Jika ada pergumulan berulang yang membuatmu enggan membawanya kembali ke Pengakuan Dosa, bawalah tetap — undangan itu tidak pernah kedaluwarsa.',
    'Lord, my stubborn stains don''t discourage you the way they discourage me. Give me the courage to keep bringing what''s crimson and let you make it white. Amen.', 'Tuhan, noda-noda membandelku tidak mengecilkan hati-Mu seperti mengecilkan hatiku. Berilah aku keberanian untuk terus membawa apa yang merah kirmizi dan membiarkan-Mu menjadikannya putih. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 1:18', 'WEB', '"Come now, let us settle the matter," says the LORD. "Though your sins are like scarlet, they shall be as white as snow; though they are red as crimson, they shall be like wool."');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 1:18', 'TB', 'Sekalipun dosamu merah seperti kirmizi, akan menjadi putih seperti salju; sekalipun berwarna merah seperti kain kesumba, akan menjadi putih seperti bulu domba.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'New Every Morning', 'Baru Setiap Pagi',
    'The book of Lamentations is, true to its name, a book of grief — written in the wreckage of a fallen city, in the middle of loss so total it''s hard to overstate. And it is precisely there, in the middle of that wreckage, that the writer stops and says something startling: ''Because of the LORD''s great love we are not consumed, for his compassions never fail. They are new every morning.''

This matters for how we leave the confessional and walk back into ordinary life. Mercy in Scripture is never described as a one-time transaction we draw on once and then manage carefully for the rest of our lives, rationing it like a limited resource. It''s described as morning bread — arriving fresh, daily, not because yesterday''s mercy ran out through overuse, but because that is simply the rhythm mercy keeps.

This is important on the ordinary Tuesday after Confession, when the same small irritations, the same quick temper, the same old patterns show up again by afternoon, and the temptation is to think, ''I just went, and already I need mercy again — what''s the point.'' The point is that mercy was never meant to be a single deposit you spend down over the following weeks. It''s new every morning. Today''s mercy doesn''t run out by tonight, and tomorrow''s mercy isn''t a loan against a shrinking supply.

So walk out of that confessional not carrying a fragile, limited grace you now have to protect and ration carefully, but stepping into a rhythm — new every morning, great is his faithfulness. The door isn''t a once-a-year event to survive. It''s one stop along a rhythm of mercy that renews daily, whether or not you ever walk back through it again this week.', 'Kitab Ratapan, sesuai namanya, adalah kitab duka — ditulis di reruntuhan sebuah kota yang telah jatuh, di tengah kehilangan yang begitu total sehingga sulit dilebih-lebihkan. Dan justru di situlah, di tengah reruntuhan itu, sang penulis berhenti sejenak dan mengatakan sesuatu yang mengejutkan: ''Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!''

Ini penting bagi cara kita meninggalkan ruang pengakuan dan kembali melangkah ke kehidupan sehari-hari. Belas kasihan dalam Alkitab tidak pernah digambarkan sebagai transaksi sekali pakai yang kita ambil sekali lalu kelola dengan hati-hati sepanjang sisa hidup, menjatahnya seperti sumber daya terbatas. Itu digambarkan seperti roti pagi hari — datang segar, setiap hari, bukan karena belas kasihan kemarin habis terpakai berlebihan, melainkan karena memang begitulah irama yang dijaga oleh belas kasihan.

Ini penting pada hari Selasa biasa setelah Pengakuan Dosa, ketika kejengkelan-kejengkelan kecil yang sama, amarah cepat yang sama, pola lama yang sama muncul lagi menjelang sore, dan godaan yang muncul adalah berpikir, ''Aku baru saja pergi mengaku, dan sudah butuh belas kasihan lagi — apa gunanya.'' Intinya adalah bahwa belas kasihan tidak pernah dimaksudkan sebagai satu simpanan tunggal yang kita habiskan sedikit demi sedikit selama minggu-minggu berikutnya. Itu baru setiap pagi. Belas kasihan hari ini tidak habis menjelang malam, dan belas kasihan esok bukanlah pinjaman dari persediaan yang semakin menipis.

Jadi keluarlah dari ruang pengakuan itu bukan dengan membawa anugerah yang rapuh dan terbatas yang kini harus kaujaga dan kaujatah dengan hati-hati, melainkan dengan melangkah masuk ke dalam sebuah irama — baru setiap pagi, besar kesetiaan-Nya. Pintu itu bukan peristiwa setahun sekali yang harus dilalui untuk bertahan hidup. Itu adalah satu perhentian di sepanjang irama belas kasihan yang diperbarui setiap hari, entah engkau melangkah kembali melalui pintu itu lagi minggu ini atau tidak.',
    'Rest today in mercy as a daily rhythm, not a fragile deposit you have to ration until your next Confession.', 'Beristirahatlah hari ini dalam belas kasihan sebagai irama harian, bukan simpanan rapuh yang harus kaujatah hingga Pengakuan Dosa berikutnya.',
    'Faithful God, thank you that your mercy doesn''t run out by evening. Meet me again tomorrow morning, and the morning after that, for as long as I need it. Amen.', 'Allah yang setia, terima kasih karena belas kasihan-Mu tidak habis menjelang malam. Jumpai aku lagi esok pagi, dan pagi berikutnya, selama aku membutuhkannya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 'Because of the LORD''s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ratapan 3:22-23', 'TB', 'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!');

  -- Plan: Truly Forgiven
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Truly Forgiven',
    'Sungguh Diampuni',
    'Believing what grace has already done, not just what you''ve been told',
    'Memercayai apa yang telah dikerjakan anugerah, bukan sekadar apa yang pernah dikatakan orang',
    3,
    'A short, focused three-day plan for the gap between knowing you''re forgiven and actually believing it. For anyone who has heard the words ''you are forgiven'' so many times they''ve gone flat, this plan is a slow, deliberate re-reading of what those words actually mean and why they can be trusted.',
    'Rencana tiga hari yang singkat dan terarah untuk menjembatani kesenjangan antara mengetahui bahwa kita diampuni dan benar-benar memercayainya. Bagi siapa saja yang sudah terlalu sering mendengar kata ''engkau diampuni'' hingga terasa hambar, rencana ini adalah pembacaan ulang yang perlahan dan sengaja tentang apa arti kata-kata itu sesungguhnya dan mengapa kata-kata itu dapat dipercaya.',
    '/images/devotions/truly-forgiven.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Blessed Is the One', 'Berbahagialah Orang',
    'There''s a specific kind of exhaustion that comes from believing forgiveness is real for other people but somehow always slightly out of reach for you — like a promise that''s technically true but never quite lands in your particular case. You can recite the doctrine correctly and still privately wonder if you''re the exception the rule forgot to mention.

The psalmist doesn''t describe forgiveness in abstract theological terms. He describes it in terms of blessedness — actual, felt happiness. ''Blessed is the one whose transgressions are forgiven, whose sins are covered.'' Not merely correct. Not merely off the hook technically. Blessed. Happy. The kind of relief that changes how a person actually walks through their day, not just what they''d answer on a doctrinal survey.

This matters because sometimes we treat believing we''re forgiven as an achievement we have to reach through enough faith or enough feeling, when really it''s meant to function more like waking up and noticing sunlight already in the room — not something you generate, just something you''re invited to actually see and let land. The psalmist isn''t instructing us to try harder to feel forgiven. He''s simply naming what is objectively true for anyone whose sin has been covered, and inviting us to recognize ourselves in that description.

So today, try reading it as if it were written specifically for you, because it was: blessed — happy, relieved, unburdened — is the one whose sin is covered. Not the one who has earned enough confidence to believe it. The one whose sin is, simply, covered. That''s the category grace puts you in the moment you turn toward it.', 'Ada semacam kelelahan tertentu yang muncul dari memercayai bahwa pengampunan itu nyata bagi orang lain, tetapi entah bagaimana selalu sedikit di luar jangkauan bagi diri kita — seperti janji yang secara teknis benar namun tidak pernah benar-benar berlaku untuk kasus kita. Kita bisa mengucapkan ajaran itu dengan benar namun diam-diam bertanya-tanya apakah kita adalah pengecualian yang lupa disebutkan dalam aturan itu.

Sang pemazmur tidak menggambarkan pengampunan dalam istilah teologis yang abstrak. Ia menggambarkannya dalam istilah kebahagiaan — kebahagiaan yang sungguh-sungguh dirasakan. ''Berbahagialah orang yang pelanggarannya diampuni, yang dosanya ditutupi.'' Bukan sekadar benar secara teknis. Bukan sekadar lolos dari hukuman secara teknis. Berbahagia. Senang. Jenis kelegaan yang mengubah cara seseorang benar-benar menjalani harinya, bukan hanya apa yang akan dijawabnya dalam survei doktrin.

Ini penting sebab kadang kita memperlakukan keyakinan bahwa kita diampuni sebagai pencapaian yang harus kita raih lewat iman yang cukup atau perasaan yang cukup, padahal sesungguhnya itu dimaksudkan berfungsi lebih seperti bangun tidur dan menyadari sinar matahari sudah ada di dalam ruangan — bukan sesuatu yang kita ciptakan, hanya sesuatu yang kita diundang untuk benar-benar melihat dan membiarkannya sampai kepada kita. Sang pemazmur tidak sedang menyuruh kita berusaha lebih keras untuk merasa diampuni. Ia hanya menyebutkan apa yang secara objektif benar bagi siapa pun yang dosanya telah ditutupi, dan mengundang kita mengenali diri kita sendiri dalam gambaran itu.

Jadi hari ini, cobalah membacanya seolah-olah ditulis khusus untukmu, sebab memang begitu: berbahagialah — senang, lega, tak terbebani — orang yang dosanya ditutupi. Bukan orang yang telah cukup meyakinkan diri untuk memercayainya. Orang yang dosanya, sesederhana itu, ditutupi. Itulah kategori tempat anugerah menempatkanmu pada saat engkau berpaling kepada-Nya.',
    'Read Psalm 32:1 today as though it were written specifically about you, because it was.', 'Bacalah Mazmur 32:1 hari ini seolah-olah ditulis khusus tentang dirimu, sebab memang demikian.',
    'Lord, I want to stop treating forgiveness as a technicality that applies to everyone but me. Let me actually feel the blessedness David describes. Amen.', 'Tuhan, aku ingin berhenti memperlakukan pengampunan sebagai hal teknis yang berlaku bagi semua orang kecuali aku. Biarkan aku sungguh-sungguh merasakan kebahagiaan yang digambarkan Daud. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 32:1', 'WEB', 'Blessed is the one whose transgressions are forgiven, whose sins are covered.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 32:1', 'TB', 'Berbahagialah orang yang diampuni pelanggarannya, yang dosanya ditutupi.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'While We Were Still Sinners', 'Ketika Kita Masih Berdosa',
    'One reason forgiveness can feel hard to actually believe is that we quietly assume it must have been earned somehow — that surely, behind the scenes, we did something to qualify for it: enough remorse, enough time spent feeling bad, enough good behavior afterward to balance the scale. If forgiveness feels unbelievable, it''s often because we''re still hunting for the part where we made ourselves worthy of it.

Paul removes that hunt entirely with a single, carefully timed sentence: God demonstrates his own love for us in this — while we were still sinners, Christ died for us. Not after we cleaned up. Not once we proved we''d really changed. While. The decisive act of love happened at the exact moment we were least qualified for it, which means our later qualification was never actually the mechanism. It never could have been the mechanism, because it happened first, before there was anything to qualify with.

This is worth sitting with slowly, because it rearranges where we place our confidence. If forgiveness depended on the quality of our repentance, we''d have real reason to doubt it — our repentance is often mixed, half-hearted, or arriving late. But if forgiveness depended on love demonstrated ''while we were still sinners,'' then its reliability isn''t tied to how convincingly sorry we''ve managed to feel. It was settled on a timeline that had nothing to do with our performance at all.

So if you find yourself doubting whether you''re really forgiven because you don''t feel sorry enough, or because you''re not sure your repentance was sincere enough, return to the timing in this verse. The love that forgives you was already demonstrated before you had anything to offer in exchange for it. That''s not a loophole. That''s the whole point.', 'Salah satu alasan mengapa pengampunan terasa sulit untuk sungguh-sungguh dipercaya adalah karena kita diam-diam menganggap pasti ada sesuatu yang telah kita lakukan untuk layak menerimanya — penyesalan yang cukup, waktu yang cukup lama merasa bersalah, kelakuan baik sesudahnya yang cukup untuk menyeimbangkan neraca. Jika pengampunan terasa sulit dipercaya, sering kali itu karena kita masih mencari-cari bagian di mana kita membuat diri kita layak menerimanya.

Paulus menghilangkan seluruh pencarian itu dengan satu kalimat yang waktunya diperhitungkan dengan cermat: Allah menunjukkan kasih-Nya kepada kita dengan cara ini — ketika kita masih berdosa, Kristus telah mati untuk kita. Bukan setelah kita membersihkan diri. Bukan setelah kita membuktikan bahwa kita sungguh-sungguh berubah. Ketika. Tindakan kasih yang menentukan itu terjadi tepat pada saat kita paling tidak layak menerimanya, yang berarti kelayakan kita yang kemudian bukanlah mekanisme sesungguhnya. Itu bahkan tidak mungkin menjadi mekanismenya, sebab peristiwa itu terjadi lebih dulu, sebelum ada apa pun yang bisa kita tawarkan untuk melayakkan diri.

Ini layak direnungkan dengan perlahan, sebab hal ini menata ulang di mana kita seharusnya menaruh keyakinan kita. Jika pengampunan bergantung pada kualitas pertobatan kita, kita punya alasan nyata untuk meragukannya — pertobatan kita sering kali campur aduk, setengah hati, atau datang terlambat. Namun jika pengampunan bergantung pada kasih yang ditunjukkan ''ketika kita masih berdosa,'' maka keandalannya tidak terikat pada seberapa meyakinkan rasa sesal yang berhasil kita rasakan. Itu sudah diputuskan pada garis waktu yang sama sekali tidak berkaitan dengan prestasi kita.

Jadi jika engkau meragukan apakah engkau sungguh diampuni karena merasa kurang menyesal, atau tidak yakin pertobatanmu cukup tulus, kembalilah pada waktu yang disebutkan dalam ayat ini. Kasih yang mengampunimu sudah ditunjukkan sebelum engkau punya apa pun untuk ditukarkan dengannya. Itu bukan celah. Itu memang intinya.',
    'If you''re doubting whether you''re forgiven because you don''t feel sorry enough, remember the timing: the love came first.', 'Jika engkau ragu apakah dirimu diampuni karena merasa kurang menyesal, ingatlah waktunya: kasih itu datang lebih dulu.',
    'God, thank you that your love was demonstrated before I had anything to offer for it. Let that settle my doubt more than my own feelings ever could. Amen.', 'Allah, terima kasih karena kasih-Mu telah ditunjukkan sebelum aku punya apa pun untuk ditawarkan. Biarlah itu menenangkan keraguanku lebih daripada perasaanku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 5:8', 'WEB', 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 5:8', 'TB', 'Akan tetapi Allah menunjukkan kasih-Nya kepada kita, oleh karena Kristus telah mati untuk kita, ketika kita masih berdosa.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'A New Creation, Already', 'Ciptaan Baru, Sudah Terjadi',
    'There''s a quiet trap in how we sometimes think about spiritual growth: we imagine forgiveness as the starting gun for a long process of slowly becoming acceptable, as if grace opens the door but we still have to walk the whole distance to actually belong inside. Under that picture, ''you are forgiven'' becomes something closer to ''you are on probation with good prospects,'' which is exhausting to live under and isn''t actually what Scripture says.

Paul writes something far more immediate: if anyone is in Christ, the new creation has already happened. Not ''is becoming.'' Not ''will eventually be, if the growth goes well.'' Is. The old has gone, the new is here. This is a statement about present reality, not a projection about future potential contingent on your progress. Something has already been done, completely, the moment you turned toward Christ — not something merely begun that you now have to finish proving.

This is the difference between believing you''re forgiven as a legal fact and believing you are, right now, a new creation — someone whose identity has actually shifted, not just someone whose old record has been quietly filed away while the same old self continues on unchanged. Forgiveness that stops at ''debt paid'' can still leave shame plenty of room to operate. Forgiveness understood as new creation removes the ground shame needs to stand on, because the person shame keeps accusing doesn''t exist in the same way anymore.

So on this last day, don''t just ask, ''do I believe I''m forgiven?'' Ask the fuller question: ''do I believe I am new?'' Not eventually. Not once you''ve proven it through enough good behavior. Already — the old gone, the new here — the moment you turned toward the One who makes all things new. That belief is what turns ''you are forgiven'' from information you hold into a truth you actually live inside of.', 'Ada jebakan yang halus dalam cara kita kadang berpikir tentang pertumbuhan rohani: kita membayangkan pengampunan sebagai tembakan awal dari sebuah proses panjang untuk perlahan-lahan menjadi layak diterima, seolah anugerah membuka pintu tetapi kita masih harus berjalan sepanjang jarak itu untuk benar-benar layak berada di dalamnya. Dalam gambaran itu, ''engkau diampuni'' menjadi lebih mirip ''engkau sedang dalam masa percobaan dengan prospek baik,'' yang melelahkan untuk dijalani dan sesungguhnya bukan itu yang dikatakan Alkitab.

Paulus menulis sesuatu yang jauh lebih langsung: jika seseorang ada di dalam Kristus, ciptaan baru itu sudah terjadi. Bukan ''sedang menjadi.'' Bukan ''pada akhirnya akan menjadi, jika pertumbuhannya berjalan baik.'' Sudah. Yang lama sudah berlalu, yang baru sudah datang. Ini adalah pernyataan tentang kenyataan masa kini, bukan proyeksi tentang potensi masa depan yang bergantung pada kemajuan kita. Sesuatu sudah dikerjakan, secara utuh, pada saat engkau berpaling kepada Kristus — bukan sesuatu yang baru dimulai dan kini harus kaubuktikan sampai selesai.

Inilah bedanya antara memercayai bahwa engkau diampuni sebagai fakta hukum, dengan memercayai bahwa engkau, saat ini juga, adalah ciptaan baru — seseorang yang jati dirinya sungguh telah berubah, bukan sekadar seseorang yang catatan lamanya diam-diam disimpan di arsip sementara diri yang lama tetap berjalan tanpa berubah. Pengampunan yang berhenti di ''utang telah lunas'' masih bisa memberi banyak ruang bagi rasa malu untuk beroperasi. Pengampunan yang dipahami sebagai ciptaan baru menghilangkan pijakan yang dibutuhkan rasa malu, sebab orang yang terus dituduh oleh rasa malu itu sudah tidak ada lagi dengan cara yang sama.

Jadi pada hari terakhir ini, jangan hanya bertanya, ''apakah aku percaya bahwa aku diampuni?'' Tanyakan pertanyaan yang lebih utuh: ''apakah aku percaya bahwa aku sudah baru?'' Bukan pada akhirnya. Bukan setelah kubuktikan lewat kelakuan baik yang cukup. Sudah — yang lama berlalu, yang baru datang — pada saat engkau berpaling kepada Dia yang membuat segala sesuatu menjadi baru. Keyakinan itulah yang mengubah ''engkau diampuni'' dari sekadar informasi yang kaupegang menjadi kebenaran yang benar-benar kaudiami.',
    'Ask the fuller question today: not just ''am I forgiven,'' but ''do I believe I am already new?''', 'Tanyakan pertanyaan yang lebih utuh hari ini: bukan hanya ''apakah aku diampuni,'' tetapi ''apakah aku percaya bahwa aku sudah baru?''',
    'Lord, let me live as the new creation you say I already am, not as someone still on probation trying to earn the title. Amen.', 'Tuhan, biarkan aku hidup sebagai ciptaan baru yang Kaukatakan sudah menjadi diriku, bukan sebagai seseorang yang masih dalam masa percobaan berusaha mendapatkan gelar itu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Corinthians 5:17', 'WEB', 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Korintus 5:17', 'TB', 'Jadi siapa yang ada di dalam Kristus, ia adalah ciptaan baru: yang lama sudah berlalu, sesungguhnya yang baru sudah datang.');

  -- Sub-category: Forgiving Yourself --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Forgiving Yourself' AND parent_id = v_forgiveness_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Forgiving Yourself', 'Mengampuni Diri Sendiri', v_forgiveness_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Mengampuni Diri Sendiri'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Letting Go of Yesterday
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Letting Go of Yesterday',
    'Melepaskan Hari Kemarin',
    'Freedom from the weight of a mistake you can''t undo',
    'Kebebasan dari beban kesalahan yang tak bisa diulang',
    5,
    'For anyone who still replays a moment they wish they could take back, this five-day plan walks through what it means to actually receive the freedom Christ already purchased. Regret can feel like loyalty to our own conscience, as if staying sad proves we understand how serious our mistake was. But Scripture invites us somewhere better: not forgetting that the past happened, but no longer letting it hold the pen on today. Each day builds toward a simple, hard-won truth — the same God who saw exactly what we did is the one who calls us forward anyway.',
    'Bagi siapa pun yang masih memutar ulang satu momen yang ingin diulang, rencana lima hari ini menelusuri apa artinya benar-benar menerima kebebasan yang sudah dibeli Kristus. Penyesalan bisa terasa seperti kesetiaan pada hati nurani kita sendiri, seolah tetap bersedih membuktikan kita paham betapa seriusnya kesalahan itu. Namun Alkitab mengundang kita pada sesuatu yang lebih baik: bukan melupakan bahwa masa lalu itu terjadi, tetapi tidak lagi membiarkannya memegang kendali atas hari ini. Setiap hari membangun satu kebenaran sederhana namun mahal harganya — Allah yang melihat persis apa yang kita lakukan adalah Allah yang tetap memanggil kita untuk melangkah maju.',
    '/images/devotions/letting-go-of-yesterday.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Weight We Keep Carrying', 'Beban yang Terus Kita Pikul',
    'There is a particular kind of tired that has nothing to do with sleep. It''s the tiredness of carrying something you were never meant to carry alone — a decision, a word said in anger, a chance you didn''t take, a person you let down. Long after the moment has passed, the weight stays. We rehearse it in quiet rooms, in traffic, in the seconds before sleep. And somewhere along the way, many of us start to believe that carrying it is the price of being a good person. As if putting it down would mean we didn''t take it seriously enough.

But that belief, however sincere, is not the same thing as conviction from God. Conviction leads somewhere — to confession, to repair where repair is possible, to change. Regret that never moves is something else: a low hum of self-punishment that produces nothing but exhaustion. It doesn''t make us more humble. It makes us smaller, quieter, more hidden. And a hidden heart is exactly what the enemy of our souls wants, because a person convinced they are unforgivable rarely reaches for the very grace that could set them free.

This is the strange mercy at the center of the Christian story: God never asked us to earn our way back to spotless before He would love us again. He moved first. While we were still far off, still tangled in the very thing we''re ashamed of, love came looking. That doesn''t erase what happened. It reframes what happens next. The mistake is real. The weight is optional.

Over these five days, we''re not going to pretend the past didn''t happen or rush past the seriousness of what hurt us or others. We''re going to bring it, honestly, into the light of a God who already knows the whole story and has not walked away. That''s where real freedom starts — not in forgetting, but in finally setting the weight down in front of the only One strong enough to hold it.', 'Ada satu jenis lelah yang tidak ada hubungannya dengan kurang tidur. Itu adalah lelah karena memikul sesuatu yang sebenarnya tidak pernah dirancang untuk kita pikul sendirian — sebuah keputusan, kata-kata yang terlontar dalam amarah, kesempatan yang tidak kita ambil, orang yang kita kecewakan. Lama setelah momennya berlalu, bebannya tetap tinggal. Kita memutarnya kembali dalam kesunyian, di jalan, di detik-detik sebelum tidur. Dan entah bagaimana, banyak dari kita mulai percaya bahwa memikul beban itu adalah harga untuk menjadi orang baik. Seolah meletakkannya berarti kita tidak cukup serius menganggapnya.

Namun keyakinan itu, sejujur apa pun, bukanlah keyakinan akan dosa dari Allah. Keyakinan akan dosa membawa kita ke suatu tempat — kepada pengakuan, kepada pemulihan jika masih memungkinkan, kepada perubahan. Penyesalan yang tidak pernah bergerak adalah hal lain: dengungan pelan penghukuman diri yang hanya menghasilkan keletihan. Itu tidak membuat kita lebih rendah hati. Itu membuat kita semakin kecil, semakin diam, semakin bersembunyi. Dan hati yang bersembunyi itulah yang diinginkan musuh jiwa kita, sebab orang yang yakin dirinya tak terampuni jarang mau meraih anugerah yang justru bisa membebaskannya.

Inilah belas kasihan yang aneh namun menjadi pusat kisah iman kita: Allah tidak pernah meminta kita untuk berjuang kembali menjadi tanpa cela dulu sebelum Dia mau mengasihi kita lagi. Dialah yang bergerak lebih dulu. Ketika kita masih jauh, masih terjerat dalam hal yang membuat kita malu, kasih itu sudah datang mencari. Itu tidak menghapus apa yang terjadi. Itu mengubah apa yang terjadi selanjutnya. Kesalahan itu nyata. Bebannya, itu pilihan.

Selama lima hari ke depan, kita tidak akan berpura-pura masa lalu tidak pernah terjadi atau buru-buru melewati betapa seriusnya luka yang ditimbulkan bagi diri sendiri atau orang lain. Kita akan membawanya, dengan jujur, ke dalam terang Allah yang sudah tahu seluruh kisahnya dan tidak pergi meninggalkan kita. Di situlah kebebasan yang sesungguhnya dimulai — bukan dengan melupakan, tetapi dengan akhirnya meletakkan beban itu di hadapan satu-satunya Pribadi yang cukup kuat untuk memikulnya.',
    'Name, honestly, the one thing you''ve been carrying the longest — and consider whether carrying it has actually changed anything, or only worn you down.', 'Sebutkan dengan jujur satu hal yang paling lama kau pikul — lalu renungkan apakah memikulnya benar-benar mengubah sesuatu, atau hanya membuatmu semakin lelah.',
    'Lord, I''ve been carrying something I was never meant to carry alone. Thank You for not waiting until I was clean to come near me. Teach me the difference between conviction that leads to You and regret that only leads back to myself. I bring this weight to You today. Amen.', 'Tuhan, aku telah memikul sesuatu yang sebenarnya tidak pernah dirancang untuk kupikul sendirian. Terima kasih karena Engkau tidak menunggu aku bersih dulu sebelum mendekat kepadaku. Ajari aku membedakan antara keyakinan akan dosa yang membawaku kepada-Mu, dan penyesalan yang hanya membawaku kembali kepada diriku sendiri. Hari ini aku membawa beban ini kepada-Mu. Amin.'
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
    v_plan_id, 2,
    'What Forgiveness Actually Covers', 'Apa yang Sebenarnya Dijangkau Pengampunan',
    'It''s easy to believe, in theory, that God forgives sin. Most of us grew up singing about it. The harder question is whether we believe it covers this — the specific thing, the one we know the details of, the one no one else fully understands. Somewhere in our hearts we quietly create an exception. Everyone else''s mistake, sure. But mine felt different. Mine was avoidable. Mine hurt someone I love. Surely mine sits outside the boundary of ordinary grace.

Scripture doesn''t leave room for that exception, no matter how personal it feels. Psalm 103 doesn''t measure sin by category or by how much it still stings. It uses geography that has no edges: as far as the east is from the west. East and west never meet, no matter how far you travel in either direction — unlike north and south, which eventually reach a pole and turn back. That''s a deliberate image. It''s not saying your sin is moved a great distance. It''s saying it is moved to a place with no boundary, no return trip, no possibility of circling back to where you started.

This matters because many of us don''t struggle to believe God forgives sin in general. We struggle to believe it applies specifically, personally, completely to the thing we are most ashamed of. But grace was never a general policy with private exceptions carved out for the cases that feel too close to home. If God''s forgiveness reaches sin at all, it reaches yours — not a diluted version of it, not a partial pardon waiting on your continued sorrow, but the same complete removal He offers anyone else.

So today, be specific. Don''t pray in vague terms about ''my mistakes.'' Name the actual thing, in your own mind, before God. And then let this verse do what it was written to do — not to minimize what happened, but to tell you exactly how far it has already been carried away from you, if you''ll let it stay there.', 'Mudah bagi kita untuk percaya, secara teori, bahwa Allah mengampuni dosa. Kebanyakan dari kita dibesarkan dengan menyanyikannya. Pertanyaan yang lebih sulit adalah, apakah kita percaya itu mencakup hal ini — hal yang spesifik, yang kita tahu detailnya, yang tidak sepenuhnya dipahami orang lain. Di suatu sudut hati, kita diam-diam membuat pengecualian. Kesalahan orang lain, boleh. Tapi milikku terasa berbeda. Milikku bisa dihindari. Milikku melukai orang yang kukasihi. Tentu milikku berada di luar batas anugerah biasa.

Alkitab tidak memberi ruang untuk pengecualian itu, sepersonal apa pun rasanya. Mazmur 103 tidak mengukur dosa berdasarkan kategori atau seberapa perih rasanya sampai sekarang. Ia memakai gambaran geografis yang tidak memiliki batas: sejauh timur dari barat. Timur dan barat tidak pernah bertemu, sejauh apa pun kau melangkah ke salah satu arah — berbeda dengan utara dan selatan, yang pada akhirnya mencapai kutub dan berbalik. Ini gambaran yang disengaja. Ini bukan berkata dosamu dipindahkan sejauh jarak tertentu. Ini berkata dosamu dipindahkan ke tempat tanpa batas, tanpa jalan kembali, tanpa kemungkinan berputar balik ke titik semula.

Ini penting karena banyak dari kita tidak sulit percaya bahwa Allah mengampuni dosa secara umum. Kita sulit percaya itu berlaku secara khusus, secara pribadi, secara penuh atas hal yang paling kita malukan. Namun anugerah tidak pernah menjadi kebijakan umum dengan pengecualian tersembunyi untuk kasus-kasus yang terasa terlalu dekat dengan kita. Jika pengampunan Allah menjangkau dosa sama sekali, itu menjangkau dosamu juga — bukan versi yang diencerkan, bukan pengampunan sebagian yang menunggu kesedihanmu terus berlanjut, tetapi penghapusan penuh yang sama seperti yang Dia tawarkan kepada siapa pun.

Jadi hari ini, jadilah spesifik. Jangan berdoa dengan istilah samar tentang ''kesalahan-kesalahanku.'' Sebutkan hal yang sebenarnya, dalam pikiranmu sendiri, di hadapan Allah. Lalu biarkan ayat ini melakukan apa yang memang dituliskan untuknya — bukan untuk meremehkan apa yang terjadi, tetapi untuk memberitahumu persis seberapa jauh itu sudah dibawa pergi darimu, jika kau mau membiarkannya tetap di sana.',
    'What is the ''exception'' you''ve quietly carved out — the sin you believe is too specific or too personal for this promise to fully cover?', 'Apa ''pengecualian'' yang diam-diam kau buat — dosa yang kau anggap terlalu spesifik atau terlalu pribadi untuk sepenuhnya dijangkau oleh janji ini?',
    'Father, I confess I have believed Your forgiveness reaches everyone but stops short of me, in this one place. Today I bring the specific thing I''ve been hiding, and I ask You to help me believe it has truly been carried as far as the east is from the west. Amen.', 'Bapa, aku mengaku bahwa aku percaya pengampunan-Mu menjangkau setiap orang tetapi berhenti sebelum mencapai aku, di satu tempat ini. Hari ini aku membawa hal spesifik yang selama ini kusembunyikan, dan aku memohon Engkau menolongku percaya bahwa itu sungguh telah dibawa sejauh timur dari barat. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 103:12', 'WEB', 'As far as the east is from the west, so far has he removed our transgressions from us.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 103:12', 'TB', 'Sejauh timur dari barat, demikian dijauhkan-Nya dari kita pelanggaran kita.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'A New Thing, Not the Old Story', 'Sesuatu yang Baru, Bukan Kisah Lama',
    'There''s a strange comfort in the old story, even the painful chapters. We know how it goes. We know our part, our failure, our lines. And so we keep returning to it — not because it''s healing, but because it''s familiar. Change, even good change, means stepping into territory we can''t fully predict. Staying stuck in yesterday, oddly, can feel safer than trusting that today could be genuinely different.

God speaks directly into that instinct through the prophet Isaiah. His people had a long, painful history — real failures, real consequences, real grief. And instead of asking them to forget it happened, He tells them plainly not to dwell there, because He is doing something new. Notice the tense: not ''I will someday do a new thing when you''ve proven yourself,'' but I am doing it, right now, already springing up. God''s restoration doesn''t wait for our record to improve. It starts while we''re still standing in the wreckage.

This is where regret quietly deceives us. It convinces us that reviewing the past protects us from repeating it, that staying in the old story is a form of vigilance. But Scripture suggests almost the opposite. Constantly perceiving the former things — replaying the failure on a loop — can actually blind us to what God is doing now, because all our attention stays fixed backward. We can become so busy grieving the old chapter that we miss the new one already being written around us.

This doesn''t mean the past didn''t matter or that lessons shouldn''t be learned. It means the past doesn''t get to be the whole story anymore. Somewhere in your life, right now, something new is springing up — a way forward you can''t yet fully see, because your eyes are still fixed on the wilderness behind you. Today, try lifting your gaze. Perceive it.', 'Ada semacam kenyamanan aneh dalam kisah lama, bahkan pada bab-bab yang menyakitkan. Kita tahu bagaimana jalan ceritanya. Kita tahu peran kita, kegagalan kita, baris-baris dialognya. Maka kita terus kembali ke sana — bukan karena itu menyembuhkan, tetapi karena itu terasa akrab. Perubahan, bahkan perubahan yang baik, berarti melangkah ke wilayah yang tidak sepenuhnya bisa kita perkirakan. Terjebak dalam masa kemarin, anehnya, bisa terasa lebih aman daripada mempercayai bahwa hari ini benar-benar bisa berbeda.

Allah berbicara langsung pada insting itu melalui nabi Yesaya. Umat-Nya memiliki sejarah panjang yang menyakitkan — kegagalan nyata, konsekuensi nyata, duka nyata. Dan alih-alih meminta mereka melupakan bahwa itu pernah terjadi, Dia berkata dengan jelas agar mereka tidak terus mengingat-ingatnya, sebab Dia sedang membuat sesuatu yang baru. Perhatikan kata kerjanya: bukan ''suatu hari nanti Aku akan membuat sesuatu yang baru setelah kau membuktikan dirimu,'' melainkan Aku sedang membuatnya, sekarang, bahkan sudah tumbuh. Pemulihan Allah tidak menunggu catatan kita membaik. Itu dimulai ketika kita masih berdiri di tengah reruntuhan.

Di sinilah penyesalan diam-diam menipu kita. Ia meyakinkan kita bahwa terus meninjau masa lalu melindungi kita dari mengulanginya, bahwa tetap tinggal dalam kisah lama adalah bentuk kewaspadaan. Namun Alkitab justru menyarankan hal yang hampir sebaliknya. Terus-menerus memperhatikan hal-hal yang dahulu — memutar ulang kegagalan tanpa henti — sebenarnya bisa membutakan kita dari apa yang sedang Allah kerjakan sekarang, karena seluruh perhatian kita tetap tertuju ke belakang. Kita bisa begitu sibuk berduka atas bab lama sehingga kita melewatkan bab baru yang sudah sedang ditulis di sekitar kita.

Ini bukan berarti masa lalu tidak penting atau pelajaran tidak perlu dipetik. Ini berarti masa lalu tidak lagi berhak menjadi keseluruhan kisah. Di suatu tempat dalam hidupmu, saat ini juga, sesuatu yang baru sedang tumbuh — sebuah jalan ke depan yang belum sepenuhnya bisa kau lihat, karena matamu masih tertuju pada padang belantara di belakangmu. Hari ini, cobalah mengangkat pandanganmu. Perhatikanlah itu.',
    'What ''new thing'' might God already be doing in your life that you''re too fixed on the past to notice?', 'Kemungkinan apa yang sedang Allah kerjakan sekarang dalam hidupmu, yang belum kau sadari karena matamu masih terpaku pada masa lalu?',
    'Lord, I''ve spent so much energy replaying the old story that I may have missed the new one You''re writing. Open my eyes to what You''re doing now. Help me hold the lessons of the past without living inside its wreckage. Amen.', 'Tuhan, aku sudah menghabiskan begitu banyak tenaga memutar ulang kisah lama, sampai mungkin aku melewatkan kisah baru yang sedang Kau tulis. Bukakan mataku pada apa yang sedang Kau kerjakan sekarang. Tolong aku memegang pelajaran dari masa lalu tanpa terus tinggal di reruntuhannya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 43:18-19', 'WEB', 'Forget the former things; do not dwell on the past. See, I am doing a new thing! Now it springs up; do you not perceive it?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 43:18-19', 'TB', 'Janganlah mengingat-ingat hal-hal yang dahulu, dan janganlah memperhatikan hal-hal yang zaman purbakala! Lihat, Aku hendak membuat sesuatu yang baru, yang sekarang sudah tumbuh, belumkah kamu mengetahuinya?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Straining Toward What Is Ahead', 'Mengarahkan Diri kepada Apa yang di Hadapan',
    'Paul is not a distant theorist when he writes about forgetting what lies behind. This is a man who once held the coats of those stoning a Christian to death, who hunted down believers, who by his own account was ''the worst of sinners.'' If anyone had grounds for permanent, well-earned regret, it was him. And yet, later in life, writing from prison, he says something almost startling: he does not consider himself to have taken hold of it all — but one thing he does. He forgets what is behind and strains toward what is ahead.

That word ''strains'' matters. This isn''t a passive shrug, a casual decision to stop thinking about the past. It''s the posture of a runner leaning into the final stretch of a race, every muscle oriented forward, eyes fixed past the finish line. Paul isn''t pretending his past didn''t happen — he references it often, even uses it as testimony of grace. But he refuses to let it be the direction he''s facing. There''s a difference between remembering where you came from and living there.

Many of us get this backwards. We treat forgetting as dishonesty and dwelling as humility. But Paul, who had more reason than most to stay lodged in guilt, models something else entirely: the same grace that interrupted his old life on the road to Damascus is the grace he now runs toward, not away from. His past became fuel for gratitude, not a cell he kept returning to. That reframing didn''t happen automatically. It was a daily choice — the same one he''s inviting us into.

You don''t have to have Paul''s résumé of failure to learn his posture. Whatever is behind you — the version of yourself you''re not proud of, the choice you''d take back — it doesn''t disqualify you from straining forward. It might be exactly the thing God intends to use, the way He used Paul''s, once you stop facing backward long enough to see where you''re being called.', 'Paulus bukanlah orang yang berteori dari kejauhan ketika ia menulis tentang melupakan apa yang di belakang. Ini adalah orang yang pernah memegang jubah orang-orang yang merajam seorang percaya sampai mati, yang memburu orang-orang percaya, yang menurut pengakuannya sendiri adalah ''orang berdosa yang paling berat.'' Jika ada orang yang punya alasan untuk penyesalan permanen dan wajar, dialah orangnya. Namun kemudian, dalam hidupnya, menulis dari penjara, ia mengatakan sesuatu yang hampir mengejutkan: ia tidak menganggap dirinya telah menangkapnya — tetapi satu hal ia lakukan. Ia melupakan apa yang di belakang dan mengarahkan diri kepada apa yang di hadapannya.

Kata ''mengarahkan diri'' itu penting. Ini bukan sikap pasif, bukan keputusan santai untuk berhenti memikirkan masa lalu. Ini adalah sikap seorang pelari yang mencondongkan tubuh ke arah putaran terakhir sebuah perlombaan, setiap otot terarah ke depan, mata tertuju melewati garis akhir. Paulus tidak berpura-pura masa lalunya tidak pernah terjadi — ia bahkan sering menyebutkannya, memakainya sebagai kesaksian anugerah. Tetapi ia menolak membiarkan itu menjadi arah yang dihadapinya. Ada perbedaan antara mengingat dari mana kau berasal dan terus tinggal di sana.

Banyak dari kita membalik hal ini. Kita menganggap melupakan sebagai ketidakjujuran dan terus mengenang sebagai kerendahan hati. Namun Paulus, yang punya lebih banyak alasan daripada kebanyakan orang untuk tetap terjebak dalam rasa bersalah, memberi teladan yang sama sekali berbeda: anugerah yang sama yang menyela hidup lamanya di jalan menuju Damsyik adalah anugerah yang sekarang ia lari menujunya, bukan menjauhinya. Masa lalunya menjadi bahan bakar syukur, bukan penjara yang terus ia kunjungi kembali. Perubahan cara pandang itu tidak terjadi begitu saja. Itu adalah pilihan harian — pilihan yang sama yang ia ajak kita ambil juga.

Kau tidak perlu memiliki rekam jejak kegagalan seperti Paulus untuk belajar sikapnya. Apa pun yang ada di belakangmu — versi dirimu yang tidak kau banggakan, pilihan yang ingin kau ulang — itu tidak mendiskualifikasimu untuk mengarahkan diri ke depan. Itu mungkin justru hal yang Allah bermaksud pakai, seperti Dia pakai masa lalu Paulus, begitu kau berhenti menghadap ke belakang cukup lama untuk melihat ke mana kau dipanggil.',
    'What would ''straining forward'' look like for you this week, practically, instead of staying lodged in the old story?', 'Seperti apa ''mengarahkan diri ke depan'' itu secara praktis bagimu minggu ini, dibandingkan tetap terjebak dalam kisah lama?',
    'Jesus, like Paul, I want my past to become testimony instead of a cell I keep returning to. Give me the strength to strain forward today, not because the past doesn''t matter, but because You have called me toward something ahead. Amen.', 'Yesus, seperti Paulus, aku ingin masa laluku menjadi kesaksian, bukan penjara yang terus kukunjungi kembali. Berikan aku kekuatan untuk mengarahkan diri ke depan hari ini, bukan karena masa lalu tidak penting, tetapi karena Engkau telah memanggilku kepada sesuatu di hadapanku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 3:13-14', 'WEB', 'But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 3:13-14', 'TB', 'Tetapi ini yang kulakukan: aku melupakan apa yang telah di belakangku dan mengarahkan diri kepada apa yang di hadapanku, dan berlari-lari kepada tujuan untuk memperoleh hadiah, yaitu panggilan sorgawi Allah dalam Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'The Years the Locusts Ate', 'Tahun-Tahun yang Dimakan Belalang',
    'There''s a particular grief in wasted time — years spent in a pattern we now regret, seasons we can''t get back, opportunities that closed while we were caught in something we now wish we''d left sooner. The prophet Joel speaks to a people who had lived through exactly that: a plague of locusts had stripped their fields bare, year after year, until the devastation felt total and permanent. And into that ruin, God makes an almost unbelievable promise: I will repay you for the years the locusts have eaten.

Not erase the fact that the locusts came. Not pretend the years weren''t lost. Repay. There''s an active, restorative quality to that word — as though God takes seriously not just the forgiveness of what happened, but the actual reclaiming of what it cost. This is bigger than pardon. It''s restoration. God doesn''t just forgive the mistake; He offers to meet us in what the mistake took from us, and give something back.

For many of us wrestling with self-forgiveness, this is the missing piece. We can accept, intellectually, that God forgives the sin. What feels harder to believe is that the years themselves — the confidence we lost, the relationships strained, the version of ourselves we might have become without the detour — could somehow still be redeemed. Joel says they can. Not necessarily returned exactly as they were, but repaid, in God''s own economy, in ways we may not have imagined yet.

This is the final step of this week: believing not just that you''re forgiven, but that your story isn''t over — that the very years you grieve most might become, in God''s hands, the place He does His clearest work. Locust years are real. So is the God who repays them. As you close this week, don''t just release the guilt. Open your hands to receive what He wants to give back.', 'Ada kesedihan tersendiri karena waktu yang terbuang — tahun-tahun yang dihabiskan dalam pola yang kini kita sesali, musim-musim yang tak bisa kembali, kesempatan yang tertutup ketika kita masih terjebak dalam sesuatu yang kini kita harap sudah kita tinggalkan lebih awal. Nabi Yoel berbicara kepada umat yang mengalami persis hal itu: wabah belalang telah menghabisi ladang mereka, tahun demi tahun, sampai kehancuran terasa total dan permanen. Dan ke dalam kehancuran itu, Allah membuat janji yang hampir tak terpercaya: Aku akan membayar kepadamu ganti tahun-tahun yang dimakan habis oleh belalang.

Bukan menghapus fakta bahwa belalang itu pernah datang. Bukan berpura-pura tahun-tahun itu tidak hilang. Membayar ganti. Ada sesuatu yang aktif dan memulihkan dalam kata itu — seolah Allah bukan hanya serius mengampuni apa yang terjadi, tetapi juga benar-benar merebut kembali apa yang telah dikorbankan karenanya. Ini lebih besar daripada sekadar pengampunan. Ini pemulihan. Allah tidak hanya mengampuni kesalahan; Dia menawarkan untuk menjumpai kita tepat di titik yang direnggut oleh kesalahan itu, dan memberikan sesuatu kembali.

Bagi banyak dari kita yang bergumul dengan pengampunan diri, inilah bagian yang sering hilang. Kita bisa menerima, secara pikiran, bahwa Allah mengampuni dosa itu. Yang terasa lebih sulit dipercaya adalah bahwa tahun-tahun itu sendiri — rasa percaya diri yang hilang, hubungan yang tegang, versi diri kita yang mungkin telah kita jadi tanpa penyimpangan itu — entah bagaimana masih bisa ditebus. Yoel berkata itu bisa. Tidak selalu dikembalikan persis seperti semula, tetapi dibayar ganti, dalam ekonomi Allah sendiri, dengan cara-cara yang mungkin belum pernah kita bayangkan.

Inilah langkah terakhir minggu ini: percaya bukan hanya bahwa kau diampuni, tetapi bahwa kisahmu belum berakhir — bahwa tahun-tahun yang paling kau sesali justru bisa menjadi, di tangan Allah, tempat Dia mengerjakan karya-Nya yang paling jelas. Tahun-tahun belalang itu nyata. Begitu pula Allah yang membayar gantinya. Saat kau menutup minggu ini, jangan hanya melepaskan rasa bersalah. Bukalah tanganmu untuk menerima apa yang ingin Dia kembalikan.',
    'What season or years do you feel you ''lost'' — and can you begin to believe God might repay, not just forgive, what that season cost you?', 'Musim atau tahun-tahun mana yang kau rasa ''hilang'' — dan dapatkah kau mulai percaya bahwa Allah mungkin membayar ganti, bukan hanya mengampuni, apa yang direnggut musim itu darimu?',
    'God who repays, I bring You not just my guilt but my grief over lost time. I believe You forgive me. Help me also believe You can restore what those years cost — in Your timing, in Your way. Thank You that my story isn''t over. Amen.', 'Allah yang membayar ganti, aku membawa kepada-Mu bukan hanya rasa bersalahku tetapi juga dukaku atas waktu yang hilang. Aku percaya Engkau mengampuniku. Tolong aku juga percaya bahwa Engkau dapat memulihkan apa yang direnggut tahun-tahun itu — pada waktu-Mu, dengan cara-Mu. Terima kasih karena kisahku belum berakhir. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Joel 2:25', 'WEB', 'I will repay you for the years the locusts have eaten.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yoel 2:25', 'TB', 'Aku akan membayar kepadamu ganti tahun-tahun yang telah dimakan habis oleh belalang.');

  -- Plan: Enough, Not Perfect
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Enough, Not Perfect',
    'Cukup, Bukan Sempurna',
    'A short reset for the voice in your head that''s never satisfied',
    'Jeda singkat untuk suara dalam dirimu yang tak pernah puas',
    3,
    'A brief three-day reset for the achiever, the fixer, the one who quietly grades every day and always finds it lacking. Perfectionism can disguise itself as diligence, but underneath it is often a fear that we are only as good as our last mistake. These three days trade that exhausting scorekeeping for something sturdier: grace that was never earned by flawless performance in the first place.',
    'Jeda singkat tiga hari bagi mereka yang gigih mencapai, yang selalu ingin memperbaiki, yang diam-diam menilai setiap hari dan selalu merasa itu belum cukup. Perfeksionisme bisa menyamar sebagai kerajinan, tetapi di baliknya sering tersembunyi ketakutan bahwa kita hanya sebaik kesalahan terakhir kita. Tiga hari ini menukar penilaian diri yang melelahkan itu dengan sesuatu yang lebih kokoh: anugerah yang sejak awal memang tidak pernah didapat lewat kesempurnaan.',
    '/images/devotions/enough-not-perfect.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Scorekeeper Inside', 'Sang Penilai di Dalam Diri',
    'There''s a voice many of us carry that never quite says ''well done.'' It notices the one typo in an otherwise good email, the slightly short answer we gave a friend, the workout we skipped, the meal that wasn''t quite healthy enough. It keeps a running tally, and the tally never lands on ''enough.'' We call this having high standards. Sometimes it''s simply self-judgment wearing a respectable disguise.

The Apostle Paul knew something about performance-based identity — he had, by his own account, kept the law as flawlessly as anyone could, and he called it all rubbish compared to what he found in Christ. That''s a striking word choice from a man who had genuinely accomplished a great deal. He isn''t saying effort doesn''t matter. He''s saying that trying to secure his own righteousness through flawless performance was a dead end, and that something else entirely — a righteousness that comes from God, not from getting it right — was what he actually needed.

Perfectionism tells a subtle lie: that our worth is still being decided, day by day, through our output. Grace tells a different story: that our worth was settled before we did anything at all, and now we''re free to work from rest instead of working for approval. Those look similar from the outside — both can produce a good email, a solid effort, a full calendar. But one is exhausting and the other isn''t, because one is trying to earn what the other has already received.

Today, notice the inner scorekeeper when it shows up. You don''t have to argue with it or silence it completely in one sitting. Just notice it, and quietly remind it that its tally was never the one that mattered.', 'Ada suara yang banyak dari kita bawa, yang tidak pernah benar-benar berkata ''sudah baik.'' Ia memperhatikan satu salah ketik di tengah surel yang sebenarnya bagus, jawaban yang agak singkat kepada seorang teman, olahraga yang terlewat, makanan yang kurang sehat. Ia terus menghitung, dan hitungannya tidak pernah sampai pada ''cukup.'' Kita menyebutnya standar yang tinggi. Kadang, itu hanyalah penghakiman diri yang memakai penyamaran yang terlihat terhormat.

Rasul Paulus tahu benar soal identitas berbasis prestasi — menurut pengakuannya sendiri, ia telah menaati hukum Taurat setaat mungkin, dan ia menyebut semua itu sampah dibandingkan dengan apa yang ia temukan dalam Kristus. Pilihan kata yang mencolok dari orang yang sungguh telah mencapai banyak hal. Ia bukan berkata usaha itu tidak penting. Ia berkata bahwa mencoba mengamankan kebenarannya sendiri lewat penampilan sempurna adalah jalan buntu, dan yang sebenarnya ia butuhkan adalah sesuatu yang sama sekali lain — kebenaran yang datang dari Allah, bukan dari berhasil melakukannya dengan benar.

Perfeksionisme membisikkan dusta yang halus: bahwa nilai diri kita masih sedang ditentukan, hari demi hari, lewat hasil kerja kita. Anugerah menceritakan kisah yang berbeda: bahwa nilai kita sudah ditetapkan sebelum kita melakukan apa pun, dan sekarang kita bebas bekerja dari tempat perhentian, bukan bekerja demi mendapatkan pengakuan. Keduanya bisa terlihat sama dari luar — surel yang bagus, usaha yang sungguh-sungguh, jadwal yang penuh. Namun yang satu melelahkan dan yang lain tidak, sebab yang satu berusaha mendapatkan apa yang sudah dimiliki oleh yang lain.

Hari ini, sadarilah ketika penilai batin itu muncul. Kau tidak perlu membantahnya atau membungkamnya sepenuhnya dalam sekali waktu. Cukup sadari kehadirannya, dan dengan tenang ingatkan dia bahwa hitungannya bukanlah hitungan yang menentukan.',
    'Where does your inner scorekeeper show up most — work, parenting, faith, appearance? Name it plainly today.', 'Di mana penilai batinmu paling sering muncul — pekerjaan, mengasuh anak, iman, penampilan? Sebutkan dengan jelas hari ini.',
    'Lord, I''m tired of a tally that never lands on enough. Remind me today that my worth was settled by You, not by my performance. Help me work from rest instead of for approval. Amen.', 'Tuhan, aku lelah dengan hitungan yang tidak pernah sampai pada cukup. Ingatkan aku hari ini bahwa nilaiku sudah ditetapkan oleh-Mu, bukan oleh hasil kerjaku. Tolong aku bekerja dari tempat perhentian, bukan demi mendapatkan pengakuan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 3:9', 'WEB', '...not having a righteousness of my own that comes from the law, but that which is through faith in Christ—the righteousness that comes from God on the basis of faith.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 3:9', 'TB', '...bukan lagi dengan kebenaranku sendiri karena mentaati hukum Taurat, melainkan dengan kebenaran karena kepercayaan kepada Kristus, yaitu kebenaran yang Allah anugerahkan berdasarkan kepercayaan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Grace for the Unfinished', 'Anugerah bagi yang Belum Selesai',
    'Perfectionism has a cruel arithmetic: it only counts the gap. The nine things that went right disappear the moment we notice the one thing that didn''t. We become fluent in our own shortfalls and strangely illiterate in our own progress. It''s exhausting to live inside a ledger that only records debits.

Paul offers a different accounting in his letter to the Philippians — a church he loved, writing about his own unfinished journey. He says plainly that he has not already attained this, has not already been made perfect. He was, by any honest measure, one of the most accomplished believers of his generation, and he still describes himself as in process. What frees him isn''t pretending he''s arrived. It''s trusting that Christ has already taken hold of him, so he doesn''t have to finish the work of securing his own worth before he''s allowed to keep going.

There''s real relief available here for anyone who feels like they should be further along by now — more disciplined, more patient, more healed, more finished. If Paul, writing under house arrest near the end of a remarkable life of ministry, could still say ''not yet, but I press on,'' then our own unfinished chapters aren''t evidence of failure. They''re simply evidence that we''re human, and being human was never disqualifying.

Perfectionism demands completion before peace. Grace offers peace in the middle of the process. Today, let yourself be someone still becoming, rather than someone who should already be done.', 'Perfeksionisme memiliki hitungan yang kejam: ia hanya menghitung kekurangannya. Sembilan hal yang berjalan baik hilang begitu saja begitu kita menyadari satu hal yang tidak. Kita menjadi sangat fasih pada kekurangan kita sendiri dan anehnya buta huruf pada kemajuan kita sendiri. Melelahkan hidup di dalam buku besar yang hanya mencatat utang.

Paulus menawarkan cara menghitung yang berbeda dalam suratnya kepada jemaat Filipi — jemaat yang ia kasihi, menulis tentang perjalanannya sendiri yang belum selesai. Ia berkata dengan jelas bahwa ia belum mencapainya, belum menjadi sempurna. Ia, menurut ukuran mana pun yang jujur, adalah salah satu orang percaya paling berprestasi pada zamannya, dan ia tetap menggambarkan dirinya sedang dalam proses. Yang membebaskannya bukanlah berpura-pura bahwa ia sudah sampai. Melainkan mempercayai bahwa Kristus sudah lebih dulu menangkapnya, sehingga ia tidak perlu menyelesaikan sendiri pekerjaan mengamankan nilai dirinya sebelum diizinkan untuk terus melangkah.

Ada kelegaan nyata di sini bagi siapa pun yang merasa seharusnya sudah lebih jauh sekarang — lebih disiplin, lebih sabar, lebih pulih, lebih selesai. Jika Paulus, menulis dalam tahanan rumah menjelang akhir hidup pelayanannya yang luar biasa, masih bisa berkata ''belum, tetapi aku terus berlari,'' maka bab-bab kita yang belum selesai bukanlah bukti kegagalan. Itu hanyalah bukti bahwa kita manusia, dan menjadi manusia tidak pernah mendiskualifikasi kita.

Perfeksionisme menuntut kesempurnaan sebelum memberi damai. Anugerah menawarkan damai di tengah-tengah proses. Hari ini, izinkan dirimu menjadi seseorang yang masih sedang menjadi, bukan seseorang yang seharusnya sudah selesai.',
    'Where have you demanded completion from yourself before you''d allow yourself any peace? What would it look like to accept peace now, mid-process?', 'Di bagian mana kau menuntut dirimu sendiri harus selesai dulu sebelum mengizinkan dirimu merasa damai? Seperti apa jadinya jika kau menerima damai itu sekarang, di tengah proses?',
    'Jesus, thank You that You took hold of me before I had anything finished. Help me stop demanding completion from myself as the price of peace. I press on today, not to earn Your grip on me, but because You already have it. Amen.', 'Yesus, terima kasih karena Engkau sudah menangkapku sebelum aku menyelesaikan apa pun. Tolong aku berhenti menuntut kesempurnaan dari diriku sendiri sebagai harga damai. Hari ini aku terus melangkah, bukan untuk mendapatkan genggaman-Mu atasku, tetapi karena aku sudah memilikinya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 3:12', 'WEB', 'Not that I have already obtained all this, or have already arrived at my goal, but I press on to take hold of that for which Christ Jesus took hold of me.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 3:12', 'TB', 'Bukan seolah-olah aku telah memperolehnya, atau telah sempurna, melainkan aku mengejarnya, kalau-kalau aku dapat juga menangkapnya, karena aku pun telah ditangkap oleh Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Power Made Perfect in Weakness', 'Kuasa yang Sempurna dalam Kelemahan',
    'Paul mentions a ''thorn in the flesh'' that he asked God three times to remove. We don''t know exactly what it was — and maybe that''s fitting, because it means his answer applies to whatever ours is. A limitation, a weakness, a flaw we cannot fix no matter how hard we try. Paul wanted it gone. God''s answer wasn''t the removal Paul asked for; it was something else entirely: my grace is sufficient for you, for my power is made perfect in weakness.

That sentence undoes the whole logic of perfectionism. Perfectionism assumes God''s power shows up most clearly when we perform flawlessly — when we''ve ironed out every flaw and present a finished, polished version of ourselves. But Paul is told the opposite: it is in the unresolved thorn, the ongoing weakness, the thing you couldn''t fix by trying harder, that God''s power is most visible. Not despite the weakness. Through it.

This reframes what perfectionism treats as an emergency. Your unfinished areas, your visible flaws, the thing about yourself you wish you could edit out — these aren''t obstacles to God using you. In Paul''s own words, they may be exactly where grace becomes most sufficient, most obviously not your own doing. A flawless person has less need to notice grace at all. A weak one, boasting gladly in weakness as Paul learned to do, has nowhere else to look.

As you close these three days, consider trading the goal of flawlessness for something sturdier: sufficiency. Not ''I did it perfectly,'' but ''His grace was enough, even here.'' That''s not a lower standard. It''s a truer one — and it''s the only standard that was ever actually going to hold you.', 'Paulus menyebut ''duri dalam daging'' yang ia minta tiga kali kepada Allah untuk disingkirkan. Kita tidak tahu persis apa itu — dan mungkin itu memang tepat, sebab itu berarti jawabannya berlaku untuk apa pun duri kita masing-masing. Sebuah keterbatasan, kelemahan, cacat yang tidak bisa kita perbaiki sekeras apa pun kita mencoba. Paulus ingin itu hilang. Jawaban Allah bukanlah penyingkiran yang diminta Paulus; itu adalah sesuatu yang sama sekali lain: cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.

Kalimat itu meruntuhkan seluruh logika perfeksionisme. Perfeksionisme mengira kuasa Allah paling jelas terlihat ketika kita tampil sempurna — ketika kita telah menghaluskan setiap kekurangan dan menyajikan versi diri yang selesai dan rapi. Namun Paulus justru diberitahu sebaliknya: justru dalam duri yang tak terselesaikan, kelemahan yang berlanjut, hal yang tak bisa kau perbaiki sekeras apa pun usahamu, kuasa Allah paling terlihat. Bukan meskipun ada kelemahan. Melainkan justru melalui kelemahan itu.

Ini mengubah cara pandang terhadap apa yang oleh perfeksionisme dianggap sebagai keadaan darurat. Bagian dirimu yang belum selesai, kekuranganmu yang terlihat, hal tentang dirimu yang kau harap bisa kau hapus — semua itu bukan penghalang bagi Allah untuk memakaimu. Menurut kata-kata Paulus sendiri, itu justru mungkin tempat di mana anugerah menjadi paling cukup, paling jelas bukan hasil usahamu sendiri. Orang yang sempurna kurang punya alasan untuk menyadari anugerah sama sekali. Orang yang lemah, yang dengan sukacita bermegah dalam kelemahannya seperti yang dipelajari Paulus, tidak punya tempat lain untuk memandang.

Saat kau menutup tiga hari ini, pertimbangkan untuk menukar tujuan kesempurnaan dengan sesuatu yang lebih kokoh: kecukupan. Bukan ''aku melakukannya dengan sempurna,'' melainkan ''anugerah-Nya cukup, bahkan di sini.'' Itu bukan standar yang lebih rendah. Itu standar yang lebih benar — dan itulah satu-satunya standar yang sejak awal memang mampu menopangmu.',
    'What is the ''thorn'' you keep asking God to remove — and could it be, instead, a place where His grace is meant to be visible?', 'Apa ''duri'' yang terus-menerus kau minta Allah singkirkan — dan bisakah itu justru menjadi tempat di mana anugerah-Nya dimaksudkan untuk terlihat?',
    'Father, I''ve been chasing flawlessness when You offered sufficiency. Teach me to see my weaknesses not as disqualifications but as the very places Your power is made perfect. Your grace is enough for me today. Amen.', 'Bapa, aku telah mengejar kesempurnaan padahal Engkau menawarkan kecukupan. Ajari aku melihat kelemahanku bukan sebagai diskualifikasi, melainkan sebagai tempat kuasa-Mu justru menjadi sempurna. Anugerah-Mu cukup bagiku hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Corinthians 12:9', 'WEB', 'But he said to me, ''My grace is sufficient for you, for my power is made perfect in weakness.'' Therefore I will boast all the more gladly about my weaknesses, so that Christ''s power may rest on me.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '2 Korintus 12:9', 'TB', 'Tetapi jawab Tuhan kepadaku: ''Cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.'' Sebab itu terlebih suka aku bermegah atas kelemahanku, supaya kuasa Kristus turun menaungi aku.');

  -- Plan: No Condemnation
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'No Condemnation',
    'Tidak Ada Penghukuman',
    'Trusting God''s verdict over your own accusing conscience',
    'Mempercayai putusan Allah melebihi hati nurani yang terus menuduh',
    7,
    'A seven-day journey for anyone whose conscience keeps handing down a harsher verdict than God ever did. Through Peter''s restoration on a Galilean beach, David''s honest psalms, and Paul''s theology of grace, this plan builds a settled case for why the accusing voice inside us is not always the voice of the Holy Spirit — and why God''s forgiveness, though it can feel too good to be true, is meant to actually be believed, not just admired from a safe distance.',
    'Perjalanan tujuh hari bagi siapa pun yang hati nuraninya terus menjatuhkan vonis yang lebih keras daripada yang pernah Allah jatuhkan. Melalui pemulihan Petrus di pantai Galilea, mazmur-mazmur Daud yang jujur, dan teologi anugerah Paulus, rencana ini membangun dasar yang kokoh mengapa suara yang menuduh di dalam diri kita tidak selalu suara Roh Kudus — dan mengapa pengampunan Allah, meskipun terasa terlalu baik untuk menjadi nyata, memang dimaksudkan untuk sungguh-sungguh dipercaya, bukan hanya dikagumi dari kejauhan yang aman.',
    '/images/devotions/no-condemnation.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'When Your Own Heart Condemns You', 'Ketika Hatimu Sendiri Menuduhmu',
    'There''s a particular kind of exhaustion that comes from being your own harshest judge — the internal courtroom that never adjourns, replaying the evidence long after the case should have been closed. Even believers who can recite the doctrine of forgiveness from memory often live like defendants still awaiting sentencing. We believe, technically, that God forgives. We just don''t believe He''s forgiven this. Us. Specifically.

John, writing to churches wrestling with exactly this ache, doesn''t dismiss the feeling as imaginary. He acknowledges it directly: our hearts do condemn us — that''s real, it happens, it isn''t fabricated. But then he says something remarkable: God is greater than our hearts, and he knows everything. That should terrify us if God''s greater knowledge worked against us. It doesn''t. John says it precisely to offer comfort, because God''s fuller knowledge of us — including the parts we''re most ashamed of — is exactly what makes His forgiveness trustworthy. He isn''t forgiving a version of us we''ve managed to hide the worst parts from. He''s forgiving the whole file, the parts we know and the parts we''ve buried so deep we''ve almost forgotten them ourselves.

This is the strange comfort at the center of the gospel: our conscience is not the final court. It''s a real court, and its evidence often deserves to be taken seriously — but it isn''t the supreme court. There''s a higher bench, and the Judge who sits there has already seen everything our conscience is presenting, and rendered His verdict anyway: mercy. Our hearts can accuse; they don''t get to overrule.

Over the next seven days, we''re going to build a case — not to silence the conscience through denial, but to let it be answered by something greater than itself. Today, simply notice: is the voice accusing you leading you toward God, or away from Him? Conviction leads toward. Condemnation leads away. Learning to tell them apart is where this week begins.', 'Ada semacam kelelahan tersendiri karena menjadi hakim paling keras bagi diri sendiri — ruang sidang batin yang tak pernah ditutup, memutar ulang bukti lama setelah perkaranya seharusnya sudah selesai. Bahkan orang percaya yang bisa mengucapkan ajaran tentang pengampunan di luar kepala pun sering hidup seperti terdakwa yang masih menunggu vonis. Kita percaya, secara teori, bahwa Allah mengampuni. Kita hanya belum percaya Dia telah mengampuni yang ini. Kita. Secara khusus.

Yohanes, menulis kepada jemaat-jemaat yang bergumul dengan luka yang sama, tidak menganggap perasaan itu hanya khayalan. Ia mengakuinya secara langsung: hati kita memang menuduh kita — itu nyata, itu terjadi, itu bukan rekaan. Namun kemudian ia berkata sesuatu yang luar biasa: Allah lebih besar daripada hati kita, dan Ia tahu segala sesuatu. Itu seharusnya menakutkan kita jika pengetahuan Allah yang lebih besar itu bekerja melawan kita. Tetapi tidak. Yohanes mengatakannya justru untuk memberi penghiburan, sebab pengetahuan Allah yang lebih penuh tentang kita — termasuk bagian yang paling kita malukan — justru itulah yang membuat pengampunan-Nya layak dipercaya. Ia tidak mengampuni versi diri kita yang berhasil kita sembunyikan bagian terburuknya. Ia mengampuni seluruh berkas, bagian yang kita tahu dan bagian yang kita kubur begitu dalam sampai kita sendiri hampir melupakannya.

Inilah penghiburan yang aneh namun menjadi pusat Injil: hati nurani kita bukanlah pengadilan terakhir. Itu pengadilan yang nyata, dan buktinya sering layak diperhatikan dengan serius — tetapi itu bukan mahkamah agung. Ada bangku pengadilan yang lebih tinggi, dan Hakim yang duduk di sana sudah melihat segala sesuatu yang disajikan hati nurani kita, dan tetap menjatuhkan putusan-Nya: belas kasihan. Hati kita boleh menuduh; ia tidak berhak membatalkan putusan itu.

Selama tujuh hari ke depan, kita akan membangun sebuah perkara — bukan untuk membungkam hati nurani lewat penyangkalan, tetapi untuk membiarkannya dijawab oleh sesuatu yang lebih besar dari dirinya sendiri. Hari ini, cukup sadari: apakah suara yang menuduhmu membawamu mendekat kepada Allah, atau menjauh dari-Nya? Keyakinan akan dosa membawa mendekat. Penghukuman membawa menjauh. Belajar membedakan keduanya adalah awal dari minggu ini.',
    'Ask honestly today: is the voice accusing you leading you toward God in confession, or away from Him in hiding?', 'Tanyakan dengan jujur hari ini: apakah suara yang menuduhmu membawamu mendekat kepada Allah dalam pengakuan, atau menjauh dari-Nya dalam persembunyian?',
    'Lord, my heart condemns me more often than You do. Thank You that You are greater than my heart and already know everything my conscience presents. Teach me this week to trust Your verdict over my own. Amen.', 'Tuhan, hatiku lebih sering menuduhku daripada Engkau. Terima kasih karena Engkau lebih besar dari hatiku dan sudah tahu segala sesuatu yang disajikan hati nuraniku. Ajari aku minggu ini untuk mempercayai putusan-Mu melebihi putusanku sendiri. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 John 3:20', 'WEB', 'If our hearts condemn us, we know that God is greater than our hearts, and he knows everything.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Yohanes 3:20', 'TB', 'Sebab jika hati kita menuduh kita, Allah adalah lebih besar dari pada hati kita serta mengetahui segala sesuatu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'The Case Is Already Closed', 'Perkara Itu Sudah Ditutup',
    'Paul''s letter to the Romans reads, in places, like a courtroom transcript — accusation, defense, verdict. And after several chapters spent establishing just how thoroughly every person falls short, he arrives at a sentence that functions like a gavel coming down: there is now no condemnation for those who are in Christ Jesus. Not ''there will eventually be less condemnation if you keep improving.'' Not ''condemnation is reduced, pending your continued good behavior.'' Now. No condemnation.

It''s worth noticing what this verse does not say. It doesn''t say there are no consequences for sin, or that conviction disappears, or that we stop caring about how we live. It specifically addresses condemnation — the legal sentence, the guilty verdict that determines our standing before God. That verdict, Paul says, has already been rendered, and it isn''t guilty. It was settled at the cross, applied the moment we trusted Christ, and it does not get reopened every time we have a bad day.

Many of us relate to God more like a parole officer than a Judge who has already ruled in our favor — checking in nervously, hoping our recent behavior has been good enough to keep the verdict from being reversed. But a verdict, by definition, isn''t provisional. It''s decided. If you are in Christ, the case titled ''you'' has already been tried, and the sentence handed down was mercy, not condemnation. There''s no ongoing probation to satisfy.

Today, when the old accusation rises — and it will, because that''s what accusation does — try answering it not with an argument, but with a fact, the way you''d correct someone quoting an outdated ruling: that case is closed. Not because nothing happened. Because the verdict was already given, and it wasn''t the one your conscience keeps predicting.', 'Surat Paulus kepada jemaat di Roma, di beberapa bagian, terasa seperti transkrip ruang sidang — tuduhan, pembelaan, putusan. Dan setelah beberapa pasal menjelaskan betapa dalamnya setiap orang jatuh dalam dosa, ia sampai pada satu kalimat yang bekerja seperti palu hakim yang diketukkan: sekarang tidak ada penghukuman bagi mereka yang ada di dalam Kristus Yesus. Bukan ''pada akhirnya penghukuman akan berkurang jika kau terus memperbaiki diri.'' Bukan ''penghukuman dikurangi, menunggu kelakuan baikmu berlanjut.'' Sekarang. Tidak ada penghukuman.

Perlu diperhatikan apa yang tidak dikatakan ayat ini. Ia tidak berkata tidak ada konsekuensi atas dosa, atau bahwa keyakinan akan dosa lenyap, atau bahwa kita berhenti peduli bagaimana kita hidup. Ia secara khusus membahas penghukuman — vonis hukum, putusan bersalah yang menentukan kedudukan kita di hadapan Allah. Putusan itu, kata Paulus, sudah dijatuhkan, dan itu bukan bersalah. Itu diselesaikan di kayu salib, diberlakukan pada saat kita percaya kepada Kristus, dan tidak dibuka kembali setiap kali kita mengalami hari yang buruk.

Banyak dari kita memperlakukan Allah lebih seperti petugas pembebasan bersyarat daripada Hakim yang sudah memutuskan memihak kita — melapor dengan gugup, berharap kelakuan kita akhir-akhir ini cukup baik agar putusan itu tidak dibatalkan. Namun sebuah putusan, menurut definisinya, tidak bersifat sementara. Itu sudah diputuskan. Jika engkau ada di dalam Kristus, perkara bernama ''dirimu'' sudah diadili, dan vonis yang dijatuhkan adalah belas kasihan, bukan penghukuman. Tidak ada masa percobaan yang masih harus dipenuhi.

Hari ini, ketika tuduhan lama itu muncul — dan itu akan muncul, sebab memang begitulah cara kerja tuduhan — cobalah menjawabnya bukan dengan perdebatan, melainkan dengan fakta, seperti mengoreksi seseorang yang mengutip putusan yang sudah kedaluwarsa: perkara itu sudah ditutup. Bukan karena tidak ada yang terjadi. Melainkan karena putusannya sudah diberikan, dan itu bukan putusan yang terus diramalkan hati nuranimu.',
    'When the old accusation rises today, practice answering it with the fact of the verdict, not an argument of your own.', 'Ketika tuduhan lama itu muncul hari ini, latihlah menjawabnya dengan fakta putusan itu, bukan dengan perdebatanmu sendiri.',
    'Jesus, I keep treating Your verdict as provisional. Help me receive it as settled: no condemnation, now, for me, because I am in You. Close the courtroom in my mind today. Amen.', 'Yesus, aku terus memperlakukan putusan-Mu seolah masih bersifat sementara. Tolong aku menerimanya sebagai sesuatu yang sudah tetap: tidak ada penghukuman, sekarang, bagiku, karena aku ada di dalam-Mu. Tutuplah ruang sidang dalam pikiranku hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 8:1', 'WEB', 'Therefore, there is now no condemnation for those who are in Christ Jesus.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 8:1', 'TB', 'Demikianlah sekarang tidak ada penghukuman bagi mereka yang ada di dalam Kristus Yesus.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'A Broken Spirit, Not a Punished One', 'Roh yang Hancur, Bukan Roh yang Dihukum',
    'David wrote Psalm 51 after one of the worst seasons of his life — a season involving betrayal, deceit, and consequences that would echo through his family for years. If anyone had reason to believe self-punishment was the appropriate response to serious sin, it was him. And yet, notice what he actually asks for: not permission to suffer longer, not a schedule for how much guilt is appropriate, but mercy, cleansing, restoration, and — strikingly — joy. ''Restore to me the joy of your salvation.''

David understood something many of us miss: God does not want a spirit crushed by ongoing self-punishment. He wants a spirit broken of its pride and self-sufficiency, yes — ''a broken and contrite heart, O God, you will not despise'' — but broken in the sense of surrendered, not broken in the sense of permanently damaged. There''s a world of difference between the humility that opens its hands to receive mercy and the self-flagellation that refuses to open its hands at all, believing that closed fists are somehow more honest about its guilt.

It''s worth sitting with David''s boldness here. He doesn''t just ask to be forgiven quietly and slink away chastened. He asks to be given back joy — to sing again, to teach transgressors God''s ways again, to have his lips opened again in praise. He treats restoration to gladness not as presumptuous but as the appropriate response to genuine mercy. If we truly believe we''re forgiven, staying miserable indefinitely isn''t proof of our sincerity. It may actually be a quiet refusal to believe the forgiveness was real.

Today, consider whether you''ve confused a crushed spirit with a broken one. God isn''t asking you to stay flattened by guilt forever as proof you understood your sin. He''s asking for a heart soft enough to receive mercy — and then, like David, bold enough to ask for joy back too.', 'Daud menulis Mazmur 51 setelah salah satu musim terburuk dalam hidupnya — musim yang melibatkan pengkhianatan, tipu daya, dan konsekuensi yang akan bergema dalam keluarganya selama bertahun-tahun. Jika ada orang yang punya alasan untuk percaya bahwa menghukum diri sendiri adalah respons yang pantas atas dosa yang serius, dialah orangnya. Namun perhatikan apa yang sebenarnya ia minta: bukan izin untuk terus menderita lebih lama, bukan jadwal berapa lama rasa bersalah itu pantas dirasakan, melainkan belas kasihan, penyucian, pemulihan, dan — yang mencolok — sukacita. ''Kembalikanlah kepadaku kegirangan karena selamat yang dari pada-Mu.''

Daud memahami sesuatu yang banyak dari kita lewatkan: Allah tidak menginginkan roh yang remuk oleh penghukuman diri yang terus-menerus. Ia menginginkan roh yang patah dari kesombongan dan kecukupan dirinya sendiri, ya — ''hati yang patah dan remuk tidak akan Kaupandang hina, ya Allah'' — tetapi patah dalam arti menyerah, bukan patah dalam arti rusak selamanya. Ada perbedaan besar antara kerendahan hati yang membuka tangan untuk menerima belas kasihan, dan penyiksaan diri yang menolak membuka tangan sama sekali, seolah kepalan tangan yang tertutup entah bagaimana lebih jujur tentang rasa bersalahnya.

Layak untuk merenungkan keberanian Daud di sini. Ia tidak hanya meminta diampuni diam-diam lalu menyelinap pergi dengan tertunduk. Ia meminta dikembalikan sukacita — untuk bernyanyi lagi, untuk mengajar orang-orang berdosa jalan-jalan Allah lagi, untuk bibirnya dibuka lagi dalam pujian. Ia memperlakukan pemulihan kepada kegirangan bukan sebagai kelancangan, melainkan sebagai respons yang pantas terhadap belas kasihan yang sejati. Jika kita sungguh percaya kita telah diampuni, tetap menderita tanpa batas waktu bukanlah bukti ketulusan kita. Itu justru bisa jadi penolakan diam-diam untuk percaya bahwa pengampunan itu nyata.

Hari ini, pertimbangkan apakah kau telah mengacaukan roh yang remuk dengan roh yang dihancurkan. Allah tidak memintamu tetap terhempas oleh rasa bersalah selamanya sebagai bukti kau memahami dosamu. Ia meminta hati yang cukup lembut untuk menerima belas kasihan — lalu, seperti Daud, cukup berani untuk meminta sukacita itu kembali juga.',
    'Have you confused a crushed spirit with a broken one? What would it look like to ask God for joy back, as David did?', 'Apakah kau telah mengacaukan roh yang remuk dengan roh yang dihancurkan? Seperti apa jadinya jika kau meminta sukacita itu kembali kepada Allah, seperti yang dilakukan Daud?',
    'God, like David, I bring You more than my guilt — I bring You my longing for joy again. Give me a broken and contrite heart, not a permanently crushed one. Restore to me the gladness of knowing I''m Yours. Amen.', 'Allah, seperti Daud, aku membawa kepada-Mu lebih dari sekadar rasa bersalahku — aku membawa kerinduanku akan sukacita lagi. Berikan aku hati yang patah dan remuk, bukan hati yang hancur selamanya. Kembalikanlah kepadaku kegirangan karena aku milik-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 51:12', 'WEB', 'Restore to me the joy of your salvation and grant me a willing spirit, to sustain me.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 51:14', 'TB', 'Kembalikanlah kepadaku kegirangan karena selamat yang dari pada-Mu, dan lengkapilah aku dengan roh yang rela!');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'Breakfast on the Beach', 'Sarapan di Tepi Pantai',
    'Peter''s failure was public and specific. Three times, in front of witnesses, he denied even knowing Jesus — after promising, hours earlier, that he would die before doing exactly that. And then the rooster crowed, and Luke tells us Jesus turned and looked straight at Peter. It''s hard to imagine a heavier moment of self-condemnation than that eye contact, followed by Peter going out and weeping bitterly.

If the story ended there, Peter''s shame might have been the final word. It doesn''t end there. After the resurrection, Jesus doesn''t send Peter a private message of quiet forgiveness to spare him the discomfort. He shows up in person, on the same kind of beach where He first called Peter, and makes him breakfast over a charcoal fire — deliberately echoing, most scholars note, the charcoal fire Peter warmed himself at the night he denied Christ. Then Jesus asks him, three times, ''Do you love me?'' — once for every denial, giving Peter a chance to answer differently than he had before.

This is restoration, not mere forgiveness from a distance. Jesus doesn''t just wipe the slate clean and move on without Peter; He rebuilds Peter''s identity and calling on the very spot the wound was reopened. ''Feed my sheep,'' He tells him — entrusting Peter, of all people, with shepherding others. The man who failed most publicly becomes the one Jesus commissions most directly. Grace here isn''t just pardon. It''s re-commissioning.

If you''ve ever believed your worst moment disqualifies you from the calling you once sensed on your life, sit with this charcoal fire today. Jesus didn''t avoid the memory of Peter''s failure — He walked straight back into it, and used it as the very place to hand Peter his future. Whatever your equivalent beach is, He may be waiting for you there too, not to relitigate your failure, but to ask if you''re ready to be trusted again.', 'Kegagalan Petrus bersifat publik dan spesifik. Tiga kali, di hadapan saksi-saksi, ia menyangkal bahkan mengenal Yesus — setelah beberapa jam sebelumnya berjanji ia akan mati sebelum melakukan hal itu. Lalu ayam berkokok, dan Lukas mencatat bahwa Yesus berpaling dan memandang Petrus. Sulit membayangkan momen penghukuman diri yang lebih berat daripada tatapan mata itu, diikuti Petrus pergi keluar dan menangis dengan sedihnya.

Jika kisah itu berhenti di situ, rasa malu Petrus mungkin menjadi kata terakhir. Tetapi tidak berhenti di situ. Setelah kebangkitan, Yesus tidak mengirim pesan pribadi berupa pengampunan diam-diam untuk menghindarkan Petrus dari rasa tidak nyaman. Ia datang secara langsung, di pantai yang serupa dengan tempat Ia pertama kali memanggil Petrus, dan membuatkannya sarapan di atas api bara — dengan sengaja menggemakan, menurut catatan banyak ahli, api bara yang dipakai Petrus menghangatkan diri pada malam ia menyangkal Kristus. Lalu Yesus bertanya kepadanya, tiga kali, ''Apakah engkau mengasihi Aku?'' — satu untuk setiap penyangkalan, memberi Petrus kesempatan menjawab berbeda dari sebelumnya.

Ini adalah pemulihan, bukan sekadar pengampunan dari kejauhan. Yesus tidak hanya menghapus catatan lalu melanjutkan tanpa Petrus; Ia membangun kembali jati diri dan panggilan Petrus tepat di titik luka itu dibuka kembali. ''Gembalakanlah domba-domba-Ku,'' kata-Nya kepadanya — mempercayakan kepada Petrus, dari semua orang, untuk menggembalakan orang lain. Orang yang gagal paling terbuka justru menjadi orang yang paling langsung ditugaskan Yesus. Anugerah di sini bukan hanya pengampunan. Itu penugasan ulang.

Jika kau pernah percaya bahwa momen terburukmu mendiskualifikasimu dari panggilan yang pernah kau rasakan dalam hidupmu, renungkan api bara ini hari ini. Yesus tidak menghindari kenangan kegagalan Petrus — Ia berjalan langsung kembali ke sana, dan memakainya sebagai tempat justru untuk menyerahkan masa depan kepada Petrus. Apa pun pantaimu, Ia mungkin sedang menantimu di sana juga, bukan untuk mengungkit kembali kegagalanmu, melainkan untuk bertanya apakah kau siap dipercaya lagi.',
    'What is your ''charcoal fire'' — the memory Jesus might want to walk back into with you, not to shame you, but to recommission you?', 'Apa ''api bara''-mu — kenangan yang mungkin ingin Yesus masuki kembali bersamamu, bukan untuk mempermalukanmu, melainkan untuk menugaskanmu kembali?',
    'Jesus, thank You for meeting Peter at the very place of his failure and trusting him again. Meet me at my own charcoal fire today. I don''t just want to be pardoned from a distance — I want to be restored, and trusted, and sent again. Amen.', 'Yesus, terima kasih karena Engkau menjumpai Petrus tepat di tempat kegagalannya dan mempercayainya kembali. Jumpailah aku di api baraku sendiri hari ini. Aku tidak hanya ingin diampuni dari kejauhan — aku ingin dipulihkan, dipercaya, dan diutus lagi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'John 21:17', 'WEB', 'The third time he said to him, ''Simon son of John, do you love me?'' ... Jesus said, ''Feed my sheep.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yohanes 21:17', 'TB', 'Untuk ketiga kalinya Yesus berkata kepadanya, ''Simon, anak Yohanes, apakah engkau mengasihi Aku?'' ... Kata Yesus kepadanya, ''Gembalakanlah domba-domba-Ku.''');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'As Far as We Can Imagine', 'Sejauh yang Bisa Kita Bayangkan',
    'The prophet Micah, near the end of his book, seems almost overwhelmed by the question he''s asking: ''Who is a God like you, who pardons sin?'' It reads less like a rhetorical flourish and more like genuine wonder — as if Micah himself can barely believe what he''s about to describe. He goes on to say that God will again have compassion on us, that He will tread our sins underfoot, and — in a striking image — hurl all our iniquities into the depths of the sea.

Hurl is a strong word. Not set aside gently, not tuck away for later reference — hurled, thrown with force, into the deepest part of the sea, a place ancient people associated with the unreachable and the unrecoverable. This isn''t a God reluctantly tolerating our sin from a safe distance. It''s a God actively, forcefully disposing of it, the way you''d throw something you never wanted to see resurface again.

Many of us picture God''s forgiveness as passive — He simply chooses not to bring it up, the way a hurt friend might silently decide to let something go while quietly still remembering it. But Micah''s image is active and complete. Something hurled into the depths of the sea doesn''t drift back to shore. It''s gone in a way that reflects not just God''s patience with us, but His genuine delight in showing mercy — Micah says elsewhere in this same passage that God ''delights to show mercy.'' Not merely permits it. Delights in it.

If your conscience keeps fishing sins back up out of the depths, presenting them to you again as though they were never truly disposed of, today''s invitation is to let Micah''s astonishment become your own. Who is a God like this? Not one who reluctantly forgives, but one who delights to, and who has already hurled what you''re still holding onto into water too deep for either of you to reach again.', 'Nabi Mikha, menjelang akhir kitabnya, tampak hampir kewalahan oleh pertanyaan yang ia ajukan sendiri: ''Siapakah Allah seperti Engkau, yang mengampuni kesalahan?'' Ini terasa bukan sekadar gaya bahasa retoris, melainkan keheranan yang tulus — seolah Mikha sendiri nyaris tidak percaya apa yang akan ia gambarkan selanjutnya. Ia melanjutkan bahwa Allah akan kembali menyayangi kita, akan menginjak-injak kesalahan-kesalahan kita, dan — dalam gambaran yang mencolok — melemparkan segala dosa kita ke dalam tubir laut.

Melemparkan adalah kata yang kuat. Bukan disingkirkan pelan-pelan, bukan disimpan untuk rujukan nanti — dilemparkan, dibuang dengan kekuatan, ke bagian terdalam laut, tempat yang oleh orang-orang zaman dahulu diasosiasikan dengan sesuatu yang tak terjangkau dan tak dapat dipulihkan. Ini bukan Allah yang dengan enggan menoleransi dosa kita dari kejauhan yang aman. Ini Allah yang secara aktif, dengan sengaja, membuang dosa itu, seperti kau melempar sesuatu yang tidak pernah kau inginkan muncul kembali.

Banyak dari kita membayangkan pengampunan Allah sebagai sesuatu yang pasif — Ia hanya memilih untuk tidak mengungkitnya, seperti seorang teman yang terluka mungkin diam-diam memutuskan untuk melepaskannya sambil diam-diam masih mengingatnya. Namun gambaran Mikha bersifat aktif dan tuntas. Sesuatu yang dilemparkan ke tubir laut tidak hanyut kembali ke pantai. Itu lenyap dengan cara yang mencerminkan bukan hanya kesabaran Allah terhadap kita, tetapi juga sukacita-Nya yang sejati dalam menunjukkan belas kasihan — Mikha berkata di bagian lain nas yang sama bahwa Allah ''berkenan menunjukkan belas kasihan.'' Bukan sekadar mengizinkannya. Berkenan padanya.

Jika hati nuranimu terus memancing dosa-dosa itu kembali dari tubir laut, menyajikannya lagi kepadamu seolah tak pernah benar-benar dibuang, undangan hari ini adalah membiarkan keheranan Mikha menjadi keherananmu sendiri. Siapakah Allah seperti ini? Bukan yang enggan mengampuni, melainkan yang berkenan mengampuni, dan yang sudah melemparkan apa yang masih kau pegang erat-erat itu ke air yang terlalu dalam untuk dijangkau kalian berdua lagi.',
    'What sin does your conscience keep ''fishing back up'' as if it were never truly hurled away? Let Micah''s astonishment become yours today.', 'Dosa apa yang terus dipancing kembali oleh hati nuranimu seolah tak pernah benar-benar dilemparkan pergi? Biarkan keheranan Mikha menjadi keherananmu hari ini.',
    'Who is a God like You, who delights to show mercy? Thank You for hurling my sin into the depths, not just setting it aside. Help me stop fishing back up what You''ve already thrown away for good. Amen.', 'Siapakah Allah seperti Engkau, yang berkenan menunjukkan belas kasihan? Terima kasih karena Engkau melemparkan dosaku ke tubir laut, bukan hanya menyingkirkannya sementara. Tolong aku berhenti memancing kembali apa yang sudah Kaubuang selamanya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Micah 7:19', 'WEB', 'You will again have compassion on us; you will tread our sins underfoot and hurl all our iniquities into the depths of the sea.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mikha 7:19', 'TB', 'Ia akan menyayangi kami pula, dan menginjak-injak kesalahan-kesalahan kami; segala dosa kami akan Kaulemparkan ke dalam tubir laut.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'New Every Morning', 'Baru Setiap Pagi',
    'The book of Lamentations is, true to its name, a book of grief — written in the wreckage of Jerusalem''s destruction, verse after verse cataloguing loss. It is one of the least likely places in Scripture to find hope. And yet, right in the middle of that devastation, the writer stops and says something that seems to defy the surrounding despair entirely: ''Because of the Lord''s great love we are not consumed, for his compassions never fail. They are new every morning.''

New every morning is a strange kind of promise for someone stuck in self-condemnation, because self-condemnation runs on yesterday''s evidence. It builds its case out of what already happened and treats today as merely an extension of that same unbroken record. But God''s compassion, according to this verse, doesn''t operate on a running tally either. It resets. Not because yesterday didn''t matter, but because His mercy isn''t a finite resource being slowly depleted by our repeated need for it.

This matters enormously for anyone whose self-forgiveness keeps collapsing under the weight of a pattern — not just one mistake, but a recurring one, the same struggle showing up again and again, each recurrence feeling like further proof that we''re simply the kind of person who fails at this. But mercy that is new every morning isn''t rationed based on how many mornings you''ve already needed it. It doesn''t run low. Today''s portion is full, regardless of how many days came before it.

If you woke up today already rehearsing an old failure, or bracing for a familiar struggle to repeat itself, receive this instead: today''s mercy has already been issued, untouched by yesterday''s account. Great is His faithfulness — not because we''ve finally earned a clean slate, but because a clean slate was never something we were meant to earn in the first place.', 'Kitab Ratapan, sesuai namanya, adalah kitab dukacita — ditulis di tengah reruntuhan kehancuran Yerusalem, ayat demi ayat mencatat kehilangan. Ini adalah salah satu tempat paling tak terduga dalam Alkitab untuk menemukan pengharapan. Namun tepat di tengah kehancuran itu, sang penulis berhenti dan mengatakan sesuatu yang seakan sama sekali menentang keputusasaan di sekelilingnya: ''Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!''

Baru setiap pagi adalah semacam janji yang aneh bagi seseorang yang terjebak dalam penghukuman diri, sebab penghukuman diri berjalan di atas bukti hari kemarin. Ia membangun perkaranya dari apa yang sudah terjadi dan memperlakukan hari ini hanya sebagai perpanjangan dari catatan yang sama dan tak terputus. Namun belas kasihan Allah, menurut ayat ini, tidak beroperasi dengan hitungan yang terus berjalan juga. Ia diperbarui. Bukan karena hari kemarin tidak penting, tetapi karena rahmat-Nya bukanlah sumber daya terbatas yang perlahan terkuras oleh kebutuhan kita yang berulang akan hal itu.

Ini sangat penting bagi siapa pun yang pengampunan dirinya terus runtuh di bawah beban sebuah pola — bukan hanya satu kesalahan, tetapi yang berulang, pergumulan yang sama muncul lagi dan lagi, setiap kali terasa seperti bukti tambahan bahwa kita memang orang yang selalu gagal dalam hal ini. Namun rahmat yang baru setiap pagi tidak dijatah berdasarkan berapa banyak pagi yang sudah kau butuhkan sebelumnya. Itu tidak menipis. Jatah hari ini penuh, terlepas dari berapa banyak hari yang datang sebelumnya.

Jika hari ini kau bangun sambil sudah memutar ulang kegagalan lama, atau bersiap menghadapi pergumulan lama yang mungkin terulang, terimalah ini sebagai gantinya: rahmat hari ini sudah diberikan, tak tersentuh oleh catatan hari kemarin. Besar kesetiaan-Nya — bukan karena kita akhirnya berhasil mendapatkan lembaran bersih, tetapi karena lembaran bersih itu sejak awal memang bukan sesuatu yang harus kita dapatkan sendiri.',
    'What recurring pattern makes you feel like a clean slate isn''t possible anymore? Receive today''s mercy as full, regardless of how many mornings came before it.', 'Pola berulang apa yang membuatmu merasa lembaran bersih sudah tidak mungkin lagi? Terimalah rahmat hari ini sebagai sesuatu yang penuh, terlepas dari berapa banyak pagi yang sudah berlalu sebelumnya.',
    'Lord, Your compassions are new this morning, untouched by yesterday''s record. I receive today''s mercy as full, not rationed by my past. Great is Your faithfulness, even to someone who needs it again and again. Amen.', 'Tuhan, rahmat-Mu baru pagi ini, tak tersentuh oleh catatan hari kemarin. Aku menerima rahmat hari ini sebagai sesuatu yang penuh, tidak dijatah oleh masa laluku. Besar kesetiaan-Mu, bahkan kepada orang yang membutuhkannya lagi dan lagi. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lamentations 3:22-23', 'WEB', 'Because of the Lord''s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.');

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
    'Cast Your Cares, Not Just Your Confession', 'Serahkan Kekhawatiranmu, Bukan Hanya Pengakuanmu',
    'We often think of confession as the finish line — say the honest words to God, receive the forgiveness, and the transaction is complete. But Peter, writing near the end of his own long journey from denial to restoration, adds something further: ''Cast all your anxiety on him because he cares for you.'' Confession deals with the sin. Casting deals with the aftermath — the anxious residue, the nagging fear that it could happen again, the low hum of self-doubt that can linger long after guilt itself has technically been resolved.

It''s worth noting who is writing this. Peter isn''t a theorist. He is a man who denied Christ three times and was restored over breakfast on a beach. If anyone had residual anxiety to cast — about his own reliability, his own capacity to fail the people he loved most — it was him. And yet here he is, later in life, urging others toward the very freedom he himself had clearly received: don''t just confess and carry the leftover worry alone. Cast it. Actively, deliberately, hand it over, the way you''d throw a heavy load off your own shoulders onto someone strong enough to bear it.

This is the piece self-forgiveness often misses. We can believe, correctly, that God has forgiven the sin, and still carry a low-grade anxiety about ourselves — a fear that we''re fundamentally unreliable, that the failure revealed something permanent about our character, that we need to stay vigilant against our own worst impulses forever. Peter''s word to us is that this residue, too, belongs in God''s hands. Not because vigilance and growth don''t matter, but because anxious self-monitoring was never meant to be the engine of our transformation. His care is.

As you close this seven-day journey, take stock of what you''ve actually released and what you''re still quietly holding onto. If confession has happened but the anxious aftertaste remains, today is the day to cast that too — not because it''s easy, but because the God who cares for you is genuinely strong enough to hold what your own hands were never meant to carry alone. You are not on probation. You are not still proving yourself. You are cared for, forgiven, and free — and that was true this morning before you did anything at all to earn it.', 'Kita sering menganggap pengakuan sebagai garis akhir — mengucapkan kata-kata jujur kepada Allah, menerima pengampunan, dan transaksi itu selesai. Namun Petrus, menulis menjelang akhir perjalanan panjangnya sendiri dari penyangkalan menuju pemulihan, menambahkan sesuatu lagi: ''Serahkanlah segala kekhawatiranmu kepada-Nya, sebab Ia yang memelihara kamu.'' Pengakuan menangani dosanya. Penyerahan menangani akibatnya — sisa kecemasan, ketakutan yang terus mengganggu bahwa itu bisa terjadi lagi, dengungan pelan keraguan diri yang bisa bertahan lama setelah rasa bersalah itu sendiri secara teknis sudah diselesaikan.

Layak diperhatikan siapa yang menulis ini. Petrus bukan seorang teoretisi. Ia adalah orang yang menyangkal Kristus tiga kali dan dipulihkan lewat sarapan di tepi pantai. Jika ada orang yang memiliki sisa kecemasan untuk diserahkan — tentang keandalan dirinya sendiri, kesanggupannya sendiri untuk gagal terhadap orang-orang yang paling ia kasihi — dialah orangnya. Namun di sinilah ia, kemudian dalam hidupnya, mendesak orang lain menuju kebebasan yang sama yang jelas telah ia terima sendiri: jangan hanya mengaku lalu memikul sisa kekhawatiran itu sendirian. Serahkanlah. Secara aktif, dengan sengaja, serahkan, seperti melemparkan beban berat dari pundakmu sendiri kepada seseorang yang cukup kuat untuk menanggungnya.

Inilah bagian yang sering terlewat dalam pengampunan diri. Kita bisa percaya, dengan benar, bahwa Allah telah mengampuni dosa itu, dan tetap memikul kecemasan tingkat rendah tentang diri kita sendiri — ketakutan bahwa kita pada dasarnya tidak bisa diandalkan, bahwa kegagalan itu mengungkapkan sesuatu yang permanen tentang karakter kita, bahwa kita harus terus waspada melawan dorongan terburuk kita selamanya. Kata Petrus kepada kita adalah bahwa sisa ini juga milik tangan Allah. Bukan karena kewaspadaan dan pertumbuhan tidak penting, tetapi karena pengawasan diri yang cemas tidak pernah dimaksudkan menjadi mesin penggerak perubahan kita. Pemeliharaan-Nyalah yang menjadi mesin itu.

Saat kau menutup perjalanan tujuh hari ini, lihatlah apa yang sudah benar-benar kau lepaskan dan apa yang diam-diam masih kau pegang. Jika pengakuan sudah terjadi namun sisa rasa cemas masih tertinggal, hari ini adalah hari untuk menyerahkan itu juga — bukan karena itu mudah, tetapi karena Allah yang memelihara kamu benar-benar cukup kuat untuk menanggung apa yang sejak awal tidak pernah dimaksudkan untuk kau pikul sendirian. Kau tidak sedang menjalani masa percobaan. Kau tidak sedang membuktikan dirimu lagi. Kau dipelihara, diampuni, dan bebas — dan itu sudah benar pagi ini sebelum kau melakukan apa pun untuk mendapatkannya.',
    'What have you confessed but not yet cast — the leftover anxiety, not the sin itself? Name it, and hand it over today.', 'Apa yang sudah kau akui tetapi belum kau serahkan — sisa kecemasan, bukan dosanya sendiri? Sebutkan itu, dan serahkanlah hari ini.',
    'Father, I''ve confessed the sin but kept the anxiety. Today I cast that too — my fear of failing again, my quiet self-doubt — into Your care. Thank You that I am not on probation, but truly, freely Yours. Amen.', 'Bapa, aku sudah mengaku dosanya tetapi masih menyimpan kecemasannya. Hari ini aku menyerahkan itu juga — ketakutanku akan gagal lagi, keraguan diriku yang diam-diam — ke dalam pemeliharaan-Mu. Terima kasih karena aku tidak sedang menjalani masa percobaan, tetapi benar-benar, dengan bebas, menjadi milik-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Peter 5:7', 'WEB', 'Cast all your anxiety on him because he cares for you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, '1 Petrus 5:7', 'TB', 'Serahkanlah segala kekhawatiranmu kepada-Nya, sebab Ia yang memelihara kamu.');

  -- Sub-category: Letting Go of Bitterness --------------------------------------------------------
  SELECT id INTO v_cat_id FROM public.devotion_categories
    WHERE name = 'Letting Go of Bitterness' AND parent_id = v_forgiveness_id
    ORDER BY created_at ASC
    LIMIT 1;
  IF v_cat_id IS NULL THEN
    INSERT INTO public.devotion_categories (name, name_id, parent_id)
      VALUES ('Letting Go of Bitterness', 'Melepaskan Kepahitan', v_forgiveness_id)
      RETURNING id INTO v_cat_id;
  ELSE
    UPDATE public.devotion_categories SET name_id = 'Melepaskan Kepahitan'
      WHERE id = v_cat_id;
  END IF;

  -- Plan: Before It Hardens
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Before It Hardens',
    'Sebelum Ia Mengeras',
    'Catching bitterness at the root, before it takes over',
    'Menangkap kepahitan sejak akarnya, sebelum ia menguasai',
    5,
    'A five-day plan for anyone who suspects that an old hurt has quietly settled into something harder than pain — resentment, guardedness, a low-grade coldness they can''t quite name. Drawing on Hebrews'' image of a bitter root, this plan is an invitation to notice what has taken hold before it hardens further, and to bring it, honestly and without shame, into the light of God''s presence.',
    'Rencana lima hari bagi siapa saja yang menduga luka lama diam-diam telah mengendap menjadi sesuatu yang lebih keras daripada sekadar rasa sakit — kebencian, kewaspadaan berlebih, kedinginan hati yang sulit dinamai. Berpijak pada gambaran akar pahit dalam Kitab Ibrani, rencana ini adalah ajakan untuk menyadari apa yang telah berakar sebelum ia semakin mengeras, dan membawanya, dengan jujur dan tanpa malu, ke dalam terang hadirat Allah.',
    '/images/devotions/before-it-hardens.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Root We Don''t See', 'Akar yang Tak Terlihat',
    'Bitterness rarely arrives all at once. It doesn''t knock on the door and announce itself; it seeps in quietly, through a comment that stung, a promise that was broken, a door that was closed when we needed it open. At first it feels like nothing more than a bruise — tender, but surely something that will fade with time. And then, months or years later, we notice that the bruise never actually healed. It hardened into something else entirely.

Scripture calls this a root, and the image is worth sitting with. A root is hidden. It works beneath the surface, out of sight, drawing up whatever nourishment is available and quietly shaping everything that grows above it. We can smile in a room, function at work, even show up faithfully at church, while underneath, a root of bitterness is drawing strength from every rehearsed memory of the wrong done to us. The danger is precisely that it is unseen — by the time its fruit is obvious, the root has already spread wide.

Many of us carry at least one relationship, one season, one memory that we have not looked at honestly in a long time. We''ve learned to route around it, to change the subject when it comes up, to keep ourselves busy enough that we don''t have to feel it. But avoidance is not the same as healing. A root left alone in the dark does not shrink; it grows toward whatever light it can find, and it will eventually break through the surface in ways we did not choose — in a short temper, a guarded heart, a quiet resentment toward people who remind us of the one who hurt us.

The invitation of this day is simply to notice. Not to fix everything at once, not to force forgiveness before we''re ready, but to have the courage to ask: is there a root growing in me that I have been too afraid to name? Naming it is not weakness. It is the first act of someone who wants to be free rather than someone who has quietly decided to live guarded for the rest of their life.', 'Kepahitan jarang datang sekaligus. Ia tidak mengetuk pintu dan memperkenalkan diri; ia menyusup pelan-pelan, lewat kata yang menyakitkan, janji yang diingkari, pintu yang tertutup saat kita justru membutuhkannya terbuka. Mulanya terasa seperti luka memar biasa — perih, tapi pasti akan pudar seiring waktu. Namun bertahun-tahun kemudian, kita sadar memar itu tak pernah benar-benar sembuh. Ia mengeras menjadi sesuatu yang lain.

Alkitab menyebutnya sebagai akar, dan gambaran ini layak direnungkan. Akar tersembunyi. Ia bekerja di bawah permukaan, tak terlihat, menyerap apa pun yang bisa memberinya kekuatan, dan diam-diam membentuk segala sesuatu yang tumbuh di atasnya. Kita bisa tersenyum di sebuah ruangan, bekerja seperti biasa, bahkan setia hadir di gereja, sementara di bawah permukaan, akar kepahitan sedang menyerap kekuatan dari setiap kenangan yang terus kita putar ulang tentang kesalahan yang dilakukan pada kita. Bahayanya justru karena ia tak terlihat — saat buahnya sudah tampak jelas, akarnya sudah menyebar luas.

Banyak dari kita menyimpan setidaknya satu hubungan, satu musim, satu kenangan yang sudah lama tidak kita hadapi dengan jujur. Kita belajar menghindarinya, mengalihkan topik ketika hal itu muncul, menyibukkan diri agar tak perlu merasakannya. Tapi menghindar bukanlah kesembuhan. Akar yang dibiarkan dalam gelap tidak akan mengecil; ia akan tumbuh mencari cahaya apa pun yang bisa ditemukannya, dan pada akhirnya akan menembus permukaan dengan cara yang tidak pernah kita pilih — lewat kemarahan yang cepat tersulut, hati yang tertutup, atau kebencian diam-diam kepada orang lain yang mengingatkan kita pada orang yang pernah melukai kita.

Ajakan hari ini sederhana: menyadari. Bukan untuk memperbaiki segalanya sekaligus, bukan untuk memaksakan pengampunan sebelum kita siap, tetapi memberanikan diri bertanya, adakah akar yang tumbuh dalam diriku yang selama ini terlalu kutakuti untuk kunamai? Menamainya bukan tanda kelemahan. Itu adalah langkah pertama seseorang yang ingin merdeka, bukan seseorang yang diam-diam memilih hidup dengan hati terkunci sepanjang hidupnya.',
    'A root left unnamed does not disappear; it only grows in the dark. Today, simply notice where yours might be.', 'Akar yang tak dinamai tidak akan hilang; ia hanya tumbuh dalam gelap. Hari ini, sekadar sadari di mana akarmu mungkin sedang tumbuh.',
    'Lord, You see what I have hidden even from myself. Give me the courage to look honestly at what has taken root in my heart, without shame and without rushing past it. I trust that Your grace reaches even the places I have kept in the dark. Amen.', 'Tuhan, Engkau melihat apa yang bahkan tersembunyi dariku sendiri. Berikan aku keberanian untuk melihat dengan jujur apa yang telah berakar di hatiku, tanpa rasa malu dan tanpa terburu-buru melewatinya. Aku percaya kasih karunia-Mu menjangkau bahkan tempat-tempat yang kusimpan dalam gelap. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Hebrews 12:15', 'WEB', 'See to it that no one falls short of the grace of God and that no bitter root grows up to cause trouble and defile many.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ibrani 12:15', 'TB', 'Jagalah supaya jangan ada seorang yang tidak menerima kasih karunia Allah, agar jangan tumbuh akar yang pahit, yang menimbulkan kerusuhan dan yang mentahirkan banyak orang.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Guarding the Heart', 'Menjaga Hati',
    'There is a difference between feeling a wound and guarding a heart, and it is a difference many of us blur without realizing it. To feel a wound is honest — pain deserves to be acknowledged, and pretending it doesn''t exist is its own kind of dishonesty. But guarding the heart is different; it is the ongoing, active work of paying attention to what we allow to take up residence inside us, because whatever we let settle there eventually shapes everything we do.

Scripture says to guard the heart above all else, because everything flows from it. Not just our words, though bitterness certainly shapes those. Not just our moods, though it shapes those too. Everything — how we love, how we trust, how we show up for the people who had nothing to do with our old wound but who quietly bear the weight of it anyway. When bitterness settles unguarded in the heart, it doesn''t stay contained to the person who hurt us. It leaks outward into marriages, friendships, and the way we raise our children.

Guarding the heart doesn''t mean numbing it or building walls so high that no one can reach us. Ironically, that kind of self-protection often becomes exactly the soil bitterness needs — isolation, suspicion, a quiet assumption that everyone will eventually disappoint us the way that one person did. Real guarding is more like tending a garden: noticing what''s growing, pulling what needs to be pulled, and being deliberate about what we water with our attention and our thoughts.

What are you watering today — the wound, or the healing? It is a question worth asking honestly, because the answer usually shows up not in what we say but in what we keep returning to when our mind is quiet.', 'Ada perbedaan antara merasakan luka dan menjaga hati, dan perbedaan ini sering kabur tanpa kita sadari. Merasakan luka itu jujur — rasa sakit layak diakui, dan berpura-pura seolah tak ada apa-apa adalah bentuk ketidakjujuran tersendiri. Tapi menjaga hati itu berbeda; itu adalah kerja yang terus-menerus dan aktif, memperhatikan apa yang kita izinkan menetap di dalam diri kita, karena apa pun yang kita biarkan menetap di sana pada akhirnya akan membentuk segala yang kita lakukan.

Alkitab berkata, jagalah hati melebihi segala sesuatu, karena dari situlah terpancar kehidupan. Bukan hanya perkataan kita, meski kepahitan pasti membentuk itu. Bukan hanya suasana hati kita, meski itu pun ikut terbentuk. Segalanya — cara kita mengasihi, cara kita percaya, cara kita hadir bagi orang-orang yang sama sekali tidak terlibat dalam luka lama kita tapi diam-diam menanggung bebannya juga. Ketika kepahitan menetap tanpa dijaga dalam hati, ia tidak berhenti hanya pada orang yang melukai kita. Ia merembes ke pernikahan, persahabatan, dan cara kita membesarkan anak-anak kita.

Menjaga hati bukan berarti membuatnya mati rasa atau membangun tembok setinggi mungkin agar tak seorang pun bisa menjangkau kita. Ironisnya, perlindungan diri semacam itu justru sering menjadi tanah subur bagi kepahitan — keterasingan, kecurigaan, anggapan diam-diam bahwa semua orang pada akhirnya akan mengecewakan kita seperti orang itu dulu. Menjaga yang sesungguhnya lebih mirip merawat taman: memperhatikan apa yang tumbuh, mencabut yang perlu dicabut, dan dengan sengaja memilih apa yang kita sirami dengan perhatian dan pikiran kita.

Apa yang sedang engkau sirami hari ini — luka itu, atau kesembuhan? Ini pertanyaan yang layak dijawab dengan jujur, karena jawabannya biasanya tampak bukan dari apa yang kita katakan, melainkan dari apa yang terus kita pikirkan saat pikiran kita sedang sunyi.',
    'What we water with our attention grows. Choose today to notice what you keep returning to in your quiet moments.', 'Apa yang kita sirami dengan perhatian akan tumbuh. Hari ini, sadarilah apa yang terus kau pikirkan saat sedang sendiri dan sunyi.',
    'Father, teach me to guard my heart not by shutting it, but by tending it. Show me what I have been watering without realizing it, and help me choose, again today, to water what leads to life. Amen.', 'Bapa, ajarlah aku menjaga hatiku bukan dengan menutupnya, tetapi dengan merawatnya. Tunjukkan apa yang selama ini kusirami tanpa kusadari, dan tolong aku memilih, sekali lagi hari ini, untuk menyirami apa yang membawa kepada kehidupan. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Proverbs 4:23', 'WEB', 'Above all else, guard your heart, for everything you do flows from it.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Amsal 4:23', 'TB', 'Jagalah hatimu dengan segala kewaspadaan, karena dari situlah terpancar kehidupan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Slow to Anger', 'Lambat untuk Marah',
    'Anger itself is not the enemy. It shows up, honestly and even righteously, when something wrong has actually been done to us. The Scriptures are full of a God who feels anger at injustice. The problem was never that we felt something when we were hurt. The problem is what happens when that anger is allowed to sit, unspoken and unprocessed, for years — when it stops being a response to a moment and becomes instead a permanent resident, quietly running the show.

There is real wisdom in being quick to listen and slow to speak and slow to become angry. Notice the order — it starts with listening. So much bitterness takes root not because we felt too much, but because we never let ourselves fully hear our own hurt, or the fuller story of what happened, or, eventually, even the humanity of the person who wronged us. We reacted once, and then we simply stopped listening — to ourselves, to God, to anyone who might have helped us process what we were carrying.

Slow does not mean suppressed. Slowing down with our anger means giving it room to be examined honestly instead of either exploding outward or freezing inward. It means asking God what this anger is actually protecting, what wound it''s guarding, what it''s afraid will happen if it lets go. Anger held prayerfully, brought honestly before God, can move through us instead of hardening inside us.

If you are still angry after all this time, that alone is not a failure of faith. What matters is what you do with it now — whether you keep feeding it in silence, or finally bring it, however messily, into the light of God''s presence.', 'Kemarahan itu sendiri bukanlah musuh. Ia muncul, dengan jujur bahkan dengan alasan yang benar, ketika sesuatu yang salah memang telah dilakukan terhadap kita. Alkitab penuh dengan gambaran Allah yang marah terhadap ketidakadilan. Masalahnya bukan karena kita merasakan sesuatu saat terluka. Masalahnya adalah apa yang terjadi ketika kemarahan itu dibiarkan mengendap, tak terucap dan tak terproses, bertahun-tahun lamanya — ketika ia berhenti menjadi respons sesaat dan menjadi penghuni tetap, diam-diam mengendalikan segalanya.

Ada hikmat yang sungguh dalam menjadi cepat untuk mendengar dan lambat untuk berkata-kata serta lambat untuk marah. Perhatikan urutannya — dimulai dengan mendengar. Begitu banyak kepahitan berakar bukan karena kita merasa terlalu banyak, tetapi karena kita tak pernah benar-benar membiarkan diri kita mendengar luka kita sendiri sepenuhnya, atau cerita utuh dari apa yang terjadi, atau, pada akhirnya, bahkan kemanusiaan dari orang yang menyalahi kita. Kita bereaksi sekali, lalu berhenti mendengar — pada diri sendiri, pada Tuhan, pada siapa pun yang mungkin bisa membantu kita mengolah apa yang kita pikul.

Lambat bukan berarti dipendam. Melambat dengan kemarahan kita berarti memberinya ruang untuk diperiksa dengan jujur, alih-alih meledak keluar atau membeku ke dalam. Itu berarti bertanya kepada Tuhan, sebenarnya apa yang sedang dilindungi oleh kemarahan ini, luka apa yang sedang dijaganya, apa yang ditakutkannya akan terjadi jika ia melepaskannya. Kemarahan yang dibawa dalam doa, dihadapkan dengan jujur di hadapan Tuhan, dapat mengalir melewati kita, bukan mengeras di dalam kita.

Jika engkau masih marah setelah sekian lama, itu bukanlah bukti kegagalan iman. Yang penting adalah apa yang kau lakukan dengan kemarahan itu sekarang — apakah engkau terus memberinya makan dalam diam, atau akhirnya membawanya, betapapun kacaunya, ke dalam terang hadirat Allah.',
    'Bring your anger honestly before God today instead of letting it sit in silence. Ask Him what it is really protecting.', 'Bawalah kemarahanmu dengan jujur ke hadapan Tuhan hari ini, jangan biarkan ia mengendap dalam diam. Tanyakan pada-Nya, sebenarnya apa yang sedang dilindunginya.',
    'Lord, I bring You my anger, even the parts of it I''m ashamed of. Teach me to listen before I speak, and to let You examine what I am still protecting. Slow me down enough to let You work. Amen.', 'Tuhan, aku membawa kemarahanku kepada-Mu, bahkan bagian-bagian yang membuatku malu. Ajarlah aku mendengar sebelum berkata-kata, dan biarkan Engkau memeriksa apa yang masih kulindungi. Perlambatlah aku secukupnya agar Engkau dapat bekerja. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'James 1:19-20', 'WEB', 'My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry, because human anger does not produce the righteousness that God desires.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yakobus 1:19-20', 'TB', 'Hai saudara-saudara yang kukasihi, ingatlah hal ini: setiap orang hendaklah cepat untuk mendengar, tetapi lambat untuk berkata-kata, dan juga lambat untuk marah; sebab amarah manusia tidak mengerjakan kebenaran di hadapan Allah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'The Peace That Rules', 'Damai Sejahtera yang Memerintah',
    'There''s a particular kind of exhaustion that comes from carrying an old grievance — a tiredness that has nothing to do with how busy our schedule is. It''s the fatigue of a heart on constant alert, replaying arguments that ended long ago, rehearsing what we should have said, bracing for a conversation that may never even happen. Bitterness is expensive. It charges rent on space in our mind that we could be using for almost anything else.

Scripture invites the peace of Christ to rule in our hearts. The word carries the sense of an umpire — something that gets the final say, that settles disputes, that decides what stays and what goes. When we let bitterness rule instead, it becomes the umpire of our reactions: deciding who we trust, how warmly we greet certain people, whether we assume the best or the worst about a new situation. We don''t always notice how much authority we''ve quietly handed it.

Choosing to let Christ''s peace rule instead is not pretending the wound never happened. It''s a daily, sometimes hourly, decision to hand the umpire''s whistle back to Him — to let Him have the final say over what gets to govern our heart today. Some days that decision has to be made again and again, and that repetition is not failure. It is simply what it looks like to keep choosing peace over the noise bitterness wants to keep making.

Thankfulness has a strange power here too. It''s hard for resentment and gratitude to occupy the same heart for long. Naming what is still good, still true, still worth thanking God for, even in the middle of an old hurt, slowly starves the grievance of the attention it needs to keep growing.', 'Ada semacam kelelahan khusus yang muncul dari memikul keluh kesah lama — kelelahan yang tak ada hubungannya dengan seberapa sibuk jadwal kita. Itu adalah keletihan hati yang terus-menerus waspada, memutar ulang perdebatan yang sudah lama usai, menyiapkan kata-kata yang seharusnya diucapkan, bersiap untuk percakapan yang mungkin tak akan pernah terjadi. Kepahitan itu mahal. Ia menyewa ruang dalam pikiran kita yang sebenarnya bisa kita pakai untuk hampir apa saja yang lain.

Alkitab mengajak damai sejahtera Kristus memerintah dalam hati kita. Kata itu membawa makna seperti seorang wasit — sesuatu yang memiliki keputusan akhir, yang menyelesaikan perselisihan, yang menentukan apa yang tinggal dan apa yang pergi. Ketika kita malah membiarkan kepahitan yang memerintah, ia menjadi wasit atas reaksi-reaksi kita: menentukan siapa yang kita percaya, seberapa hangat kita menyapa orang tertentu, apakah kita berprasangka baik atau buruk terhadap situasi baru. Kita tidak selalu sadar berapa banyak wewenang yang diam-diam telah kita serahkan padanya.

Memilih membiarkan damai sejahtera Kristus yang memerintah bukan berarti berpura-pura luka itu tak pernah terjadi. Itu adalah keputusan harian, kadang setiap jam, untuk mengembalikan peluit wasit itu kepada-Nya — membiarkan Dia memiliki keputusan akhir atas apa yang boleh memerintah hati kita hari ini. Ada hari-hari ketika keputusan itu harus diambil berulang-ulang, dan pengulangan itu bukan kegagalan. Itu sekadar wujud dari terus memilih damai di atas kebisingan yang terus ingin dibuat oleh kepahitan.

Rasa syukur juga punya kekuatan aneh di sini. Sulit bagi kebencian dan syukur untuk tinggal lama bersama dalam satu hati. Menyebutkan apa yang masih baik, masih benar, masih layak disyukuri kepada Allah, bahkan di tengah luka lama, perlahan-lahan melaparkan keluh kesah itu dari perhatian yang dibutuhkannya untuk terus tumbuh.',
    'Notice today what has quietly been given the authority to run your reactions. Consider handing that authority back to Christ''s peace.', 'Sadari hari ini apa yang diam-diam telah diberi wewenang untuk mengatur reaksimu. Pertimbangkan untuk mengembalikan wewenang itu kepada damai sejahtera Kristus.',
    'Christ, let Your peace rule in me today. I hand You the authority I have quietly given to my old grievances. Thank You for being patient with me as I learn, again and again, to let You have the final say. Amen.', 'Kristus, biarlah damai sejahtera-Mu memerintah dalam diriku hari ini. Aku menyerahkan kepada-Mu wewenang yang diam-diam telah kuberikan kepada keluh kesah lamaku. Terima kasih telah bersabar denganku saat aku belajar, lagi dan lagi, membiarkan Engkau yang memiliki keputusan akhir. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Colossians 3:15', 'WEB', 'Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Kolose 3:15', 'TB', 'Hendaklah damai sejahtera Kristus memerintah dalam hatimu, karena untuk itulah kamu telah dipanggil menjadi satu tubuh. Dan bersyukurlah.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Search Me and Know Me', 'Selidikilah Aku dan Kenallah Aku',
    'There is something both frightening and freeing about asking God to search us. Frightening because we half-suspect what He might find — the resentment we''ve dressed up as "just being realistic," the coldness toward someone we''ve justified as "healthy boundaries" when it''s really unforgiveness wearing a more respectable name. Freeing because, unlike our own self-examination, which tends to circle back to self-justification, God''s search is not looking for reasons to condemn us. It''s looking for what needs healing.

By this fifth day, if you''ve been honest with yourself, you may have noticed a root, a place your heart needs guarding, an anger you''ve kept unexamined, an old grievance quietly ruling more than it should. That noticing is not the finish line. It''s an invitation to go one layer deeper — to stop examining yourself and instead ask God to do the examining, because He sees what even our most honest self-reflection misses.

There is an old, sometimes surprising twist buried in this kind of prayer: asking to be searched often reveals that some of what we call "hurt" has hardened into something closer to pride — a quiet insistence on being the one who was wronged, on staying the victim in the story, because there is a strange safety in that role. God''s search doesn''t shame us for this. It simply, gently, brings it to light, so it can finally be released instead of managed.

This is not the end of the journey toward letting go of bitterness — real release is often a longer road than five days can walk. But it is a real beginning: a heart willing to be known completely, and led, wherever that road turns out to be, toward everlasting life instead of a well-guarded grave of old wounds.', 'Ada sesuatu yang menakutkan sekaligus membebaskan ketika kita meminta Allah menyelidiki kita. Menakutkan karena kita separuh menduga apa yang mungkin akan Ia temukan — kebencian yang kita bungkus sebagai "hanya realistis", sikap dingin pada seseorang yang kita bela sebagai "batasan yang sehat" padahal sebenarnya adalah ketidakmauan mengampuni yang memakai nama yang lebih terhormat. Membebaskan karena, tidak seperti introspeksi kita sendiri yang cenderung berputar kembali ke pembenaran diri, penyelidikan Allah tidak sedang mencari alasan untuk menghukum kita. Ia sedang mencari apa yang perlu disembuhkan.

Sampai hari kelima ini, jika engkau sudah jujur pada dirimu sendiri, mungkin engkau sudah menyadari sebuah akar, sebuah tempat di hatimu yang perlu dijaga, kemarahan yang belum pernah kau periksa, keluh kesah lama yang diam-diam memerintah lebih dari yang seharusnya. Kesadaran itu bukanlah garis akhir. Itu adalah undangan untuk melangkah satu lapis lebih dalam — berhenti memeriksa diri sendiri dan sebaliknya meminta Allah yang memeriksa, karena Dia melihat apa yang bahkan refleksi diri kita yang paling jujur pun terlewatkan.

Ada kejutan lama yang kadang mengejutkan, tersembunyi dalam doa semacam ini: meminta untuk diselidiki sering menyingkapkan bahwa sebagian dari apa yang kita sebut "luka" sebenarnya telah mengeras menjadi sesuatu yang lebih dekat pada kesombongan — sebuah keteguhan diam-diam untuk tetap menjadi pihak yang disalahi, tetap menjadi korban dalam cerita itu, karena ada semacam rasa aman yang aneh dalam peran itu. Penyelidikan Allah tidak mempermalukan kita karena hal ini. Ia hanya, dengan lembut, membawanya ke dalam terang, agar akhirnya bisa dilepaskan, bukan sekadar dikelola.

Ini bukan akhir dari perjalanan melepaskan kepahitan — pelepasan yang sesungguhnya sering kali adalah jalan yang lebih panjang daripada lima hari bisa tempuh. Tapi ini adalah permulaan yang nyata: hati yang bersedia dikenal sepenuhnya, dan dituntun, ke mana pun jalan itu berbelok, menuju hidup yang kekal, bukan menuju kubur luka lama yang terus dijaga dengan ketat.',
    'Ask God to search you completely today, trusting that His search is aimed at healing, not condemnation.', 'Mintalah Allah menyelidikimu sepenuhnya hari ini, dengan percaya bahwa penyelidikan-Nya bertujuan menyembuhkan, bukan menghukum.',
    'Search me, Lord, and know my heart. Show me every offensive way, even the ones I have dressed up as something more respectable, and lead me, patiently, in the way everlasting. Amen.', 'Selidikilah aku, ya Tuhan, dan kenallah hatiku. Tunjukkan setiap jalan yang serong, bahkan yang telah kubungkus menjadi sesuatu yang tampak lebih terhormat, dan tuntunlah aku, dengan sabar, di jalan yang kekal. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 139:23-24', 'WEB', 'Search me, God, and know my heart; test me and know my anxious thoughts. See if there is any offensive way in me, and lead me in the way everlasting.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 139:23-24', 'TB', 'Selidikilah aku, ya Allah, dan kenallah hatiku, ujilah aku dan kenallah pikiran-pikiranku; lihatlah, apakah jalanku serong, dan tuntunlah aku di jalan yang kekal.');

  -- Plan: Letting the Anger Go
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Letting the Anger Go',
    'Melepaskan Amarah',
    'A week of releasing someone who hurt you',
    'Sepekan melepaskan seseorang yang pernah melukaimu',
    7,
    'A seven-day journey for anyone still carrying real anger toward a specific person — a parent, a friend, a spouse, someone from years ago. Walking through the reunion of Esau and Jacob and the New Testament''s clearest teachings on forgiveness, this plan doesn''t rush the process or minimize the hurt. It simply asks, day by day, for the grip to loosen a little more.',
    'Perjalanan tujuh hari bagi siapa saja yang masih memikul kemarahan nyata terhadap seseorang tertentu — orang tua, sahabat, pasangan, seseorang dari bertahun-tahun lalu. Menelusuri pertemuan kembali Esau dan Yakub serta pengajaran-pengajaran Perjanjian Baru yang paling jelas tentang pengampunan, rencana ini tidak terburu-buru dalam prosesnya maupun mengecilkan lukanya. Ia hanya meminta, hari demi hari, agar genggaman itu sedikit demi sedikit melonggar.',
    '/images/devotions/letting-the-anger-go.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'Twenty Years of Carrying It', 'Dua Puluh Tahun Memikulnya',
    'Few stories in Scripture capture the sheer weight of long-carried anger like the reunion of Esau and Jacob. Decades earlier, Jacob had deceived his father and stolen the blessing meant for his older brother, and Esau''s response at the time was murderous rage — he planned to kill Jacob the moment their father died. Jacob fled. Twenty years passed. And now, on his way home, Jacob hears that Esau is coming to meet him, with four hundred men. He assumes the worst. He prepares for a battle he has been dreading for two decades.

What actually happens is almost jarring in how it defies expectation. Esau runs to meet him, embraces him, falls on his neck, and weeps. Twenty years of imagined vengeance simply are not there when the moment finally arrives. Something happened in Esau over those two decades that Scripture never narrates in detail — we don''t get a play-by-play of his healing. We only get to see its fruit: a man who had every reason to still be furious, and wasn''t.

This week is for anyone who is still carrying anger toward someone — a parent, a former friend, a spouse, a sibling, someone from years ago who is still, somehow, taking up space in your chest. Maybe you''ve imagined the confrontation a hundred times. Maybe you''ve rehearsed exactly what you''d say if you ever saw them again. That rehearsal is exhausting, and it rarely resembles what actually happens when release finally comes.

We don''t know exactly what changed in Esau. But we know this: it is possible to arrive at reunion — literal or simply internal — not with a fist raised, but with open arms. That possibility is not naive optimism. It''s the real, if slow, work this week is inviting you into.', 'Sedikit kisah dalam Alkitab yang menangkap beratnya kemarahan yang dipikul lama seperti pertemuan kembali Esau dan Yakub. Puluhan tahun sebelumnya, Yakub telah menipu ayahnya dan merebut berkat yang seharusnya menjadi hak kakaknya, dan respons Esau saat itu adalah amarah yang membunuh — ia berencana membunuh Yakub segera setelah ayah mereka meninggal. Yakub melarikan diri. Dua puluh tahun berlalu. Kini, dalam perjalanan pulang, Yakub mendengar bahwa Esau akan menemuinya, bersama empat ratus orang. Ia menduga yang terburuk. Ia bersiap untuk pertempuran yang telah ia takutkan selama dua dekade.

Yang sesungguhnya terjadi hampir mengejutkan karena begitu berbeda dari dugaan. Esau berlari menyambutnya, memeluknya, merangkul lehernya, dan menangis. Dua puluh tahun dendam yang dibayangkan ternyata tidak ada lagi saat momen itu tiba. Sesuatu terjadi dalam diri Esau selama dua dekade itu yang tidak diceritakan Alkitab secara rinci — kita tidak mendapat gambaran langkah demi langkah tentang proses pemulihannya. Kita hanya melihat buahnya: seorang lelaki yang punya segala alasan untuk masih marah, tetapi tidak lagi demikian.

Minggu ini untuk siapa saja yang masih membawa kemarahan terhadap seseorang — orang tua, sahabat lama, pasangan, saudara kandung, seseorang dari bertahun-tahun lalu yang entah bagaimana masih memenuhi ruang di dadamu. Mungkin engkau sudah membayangkan konfrontasi itu seratus kali. Mungkin engkau sudah melatih persis apa yang akan kau katakan jika bertemu mereka lagi. Latihan itu melelahkan, dan jarang menyerupai apa yang sesungguhnya terjadi ketika pelepasan akhirnya datang.

Kita tidak tahu persis apa yang berubah dalam diri Esau. Tapi kita tahu ini: mungkin saja tiba di sebuah pertemuan kembali — entah secara nyata atau sekadar dalam batin — bukan dengan kepalan tangan terangkat, melainkan dengan tangan terbuka. Kemungkinan itu bukan optimisme yang naif. Itulah kerja yang nyata, meski perlahan, yang minggu ini mengajakmu masuki.',
    'Notice, without judgment, exactly who and what you are still rehearsing a confrontation with.', 'Sadari, tanpa menghakimi diri, siapa dan apa yang masih kau latih untuk dihadapi dalam bayanganmu.',
    'Lord, You know who I am still carrying in my chest. I don''t know yet how Esau''s heart changed, but I believe You can do in me what You did in him. Begin that slow work today. Amen.', 'Tuhan, Engkau tahu siapa yang masih kupikul di dadaku. Aku belum tahu bagaimana hati Esau bisa berubah, tetapi aku percaya Engkau dapat mengerjakan hal yang sama dalam diriku. Mulailah kerja yang perlahan itu hari ini. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Genesis 33:4', 'WEB', 'But Esau ran to meet Jacob and embraced him; he threw his arms around his neck and kissed him. And they wept.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Kejadian 33:4', 'TB', 'Tetapi Esau berlari mendapatkan dia, didekapnya dia, dipeluknya lehernya, lalu diciumnya dia; dan keduanya pun menangis.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Getting Rid of It', 'Menyingkirkannya',
    'Paul''s instruction to the Ephesians reads almost like a checklist, and there''s something helpful in that bluntness: get rid of bitterness, rage, anger, brawling, slander, and every form of malice. He doesn''t say to feel bad about having them, or to slowly taper them off, or to manage them better. He says get rid of them — the same language you''d use for clearing out something rotting in the back of a refrigerator. It has to go.

But notice what comes immediately after: be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you. The getting-rid-of is not left as an empty space. Something has to fill where bitterness used to live, or the vacancy just invites bitterness back in eventually. Paul doesn''t ask us to hollow ourselves out. He asks us to trade one thing for another — malice for kindness, resentment for compassion.

This is worth sitting with honestly, because sometimes we treat forgiveness as subtraction only, as if the goal is simply to stop feeling the anger, full stop. But an empty heart doesn''t stay empty. If we don''t intentionally fill the space bitterness leaves with something else — kindness toward the person, compassion for their own broken story, even just simple courtesy — we often find the old anger creeping back in, because nothing has actually taken its place.

Today, consider one small, concrete act of kindness or compassion you could extend — even privately, even just in how you think about the person, even if you never say a word to them directly. Not as a performance of having arrived at forgiveness, but as the actual replacement Paul describes: kindness moving into the space where bitterness used to live.', 'Perintah Paulus kepada jemaat di Efesus terasa hampir seperti daftar periksa, dan ada sesuatu yang menolong dalam ketegasannya itu: buanglah kepahitan, kegeraman, kemarahan, pertikaian, fitnah, dan segala kejahatan. Ia tidak berkata untuk merasa bersalah karena memilikinya, atau untuk perlahan menguranginya sedikit demi sedikit. Ia berkata buanglah — bahasa yang sama seperti yang kau pakai untuk membersihkan sesuatu yang membusuk di bagian belakang kulkas. Itu harus disingkirkan.

Namun perhatikan apa yang langsung menyusul: hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu. Perintah untuk membuang itu tidak dibiarkan menjadi ruang kosong. Sesuatu harus mengisi tempat yang dulu ditempati kepahitan, atau kekosongan itu akan mengundang kepahitan kembali pada akhirnya. Paulus tidak meminta kita mengosongkan diri. Ia meminta kita menukar satu hal dengan hal lain — kejahatan dengan keramahan, kebencian dengan kasih mesra.

Ini layak direnungkan dengan jujur, sebab kadang kita memperlakukan pengampunan sebagai pengurangan semata, seolah tujuannya hanyalah berhenti merasakan marah, titik. Namun hati yang kosong tidak akan tetap kosong. Jika kita tidak dengan sengaja mengisi ruang yang ditinggalkan kepahitan dengan sesuatu yang lain — keramahan terhadap orang itu, kasih mesra terhadap kisah patahnya sendiri, bahkan sekadar sopan santun sederhana — kita sering mendapati kemarahan lama menyusup kembali, karena sesungguhnya belum ada yang menggantikan tempatnya.

Hari ini, pikirkan satu tindakan kecil dan nyata dari keramahan atau kasih mesra yang bisa kau berikan — bahkan secara pribadi, bahkan hanya dalam cara kau memikirkan orang itu, bahkan jika kau tak pernah berkata sepatah kata pun kepada mereka secara langsung. Bukan sebagai pertunjukan seolah telah tiba pada pengampunan, tetapi sebagai penggantian nyata yang digambarkan Paulus: keramahan yang berpindah ke ruang yang dulu ditempati kepahitan.',
    'Choose one small act of kindness today to fill the space where bitterness used to live.', 'Pilih satu tindakan kecil berupa keramahan hari ini untuk mengisi ruang yang dulu ditempati kepahitan.',
    'Father, I don''t just want to stop feeling angry — I want kindness to actually fill that space. Show me one small way to be kind today, even toward the person who hurt me. Amen.', 'Bapa, aku tidak hanya ingin berhenti merasa marah — aku ingin keramahan yang sesungguhnya mengisi ruang itu. Tunjukkan padaku satu cara kecil untuk bersikap ramah hari ini, bahkan terhadap orang yang telah melukaiku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Ephesians 4:31-32', 'WEB', 'Get rid of all bitterness, rage and anger, brawling and slander, along with every form of malice. Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Efesus 4:31-32', 'TB', 'Segala kepahitan, kegeraman, kemarahan, pertikaian dan fitnah hendaklah dibuang dari antara kamu, demikian pula segala kejahatan. Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'Leave Room for Justice', 'Beri Tempat bagi Keadilan',
    'One of the quiet reasons we hold onto anger is fear that letting go means letting the wrong go unaddressed — as if forgiveness requires us to pretend nothing bad happened, or worse, to signal that it was fine all along. That fear is understandable, but it misunderstands what Paul is actually offering when he writes: do not take revenge, my dear friends, but leave room for God''s wrath.

Notice what this verse does not say. It doesn''t say the wrong wasn''t wrong. It doesn''t say justice doesn''t matter. It says something almost the opposite: justice matters so much that it shouldn''t be left in our unsteady hands. Vengeance is Mine, God says; I will repay. Releasing our grip on revenge isn''t saying the debt is cancelled and doesn''t matter. It''s saying we trust a more capable Judge to actually settle accounts than we could ever be.

This distinction matters because so many of us hold onto anger as a kind of substitute justice system — as if staying angry is somehow keeping the scales balanced, as if letting go would mean the person got away with it. But our anger was never actually capable of balancing those scales. It mostly just kept us imprisoned alongside the debt we were trying to collect. God doesn''t ask us to release our anger because the wrong didn''t matter. He asks us to release it because He, not us, is the one equipped to deal with it justly and completely.

Today, try naming honestly: what am I afraid will happen if I stop being the one keeping score? Bring that fear to God specifically. Leaving room for His justice isn''t resignation. It''s handing the ledger to Someone who was always more qualified to hold it than we were.', 'Salah satu alasan diam-diam kita terus memegang kemarahan adalah ketakutan bahwa melepaskannya berarti membiarkan kesalahan itu tak tertangani — seolah pengampunan mengharuskan kita berpura-pura tak ada yang salah terjadi, atau lebih buruk, seolah memberi isyarat bahwa itu semua baik-baik saja. Ketakutan itu bisa dipahami, tapi salah memahami apa yang sesungguhnya ditawarkan Paulus ketika ia menulis: janganlah kamu sendiri menuntut pembalasan, saudara-saudaraku yang kekasih, tetapi berilah tempat kepada murka Allah.

Perhatikan apa yang tidak dikatakan ayat ini. Ayat ini tidak berkata kesalahan itu bukan kesalahan. Ayat ini tidak berkata keadilan tidak penting. Ayat ini justru mengatakan hampir sebaliknya: keadilan begitu penting sehingga tidak boleh dibiarkan berada di tangan kita yang goyah. Pembalasan itu ada pada-Ku, kata Allah; Aku yang akan menuntut pembalasan. Melepaskan cengkeraman kita atas pembalasan bukan berarti mengatakan utang itu dihapuskan dan tak penting. Itu berarti kita percaya kepada Hakim yang jauh lebih mampu untuk sungguh-sungguh menyelesaikan perhitungan itu daripada kita.

Perbedaan ini penting sebab banyak dari kita memegang kemarahan sebagai semacam sistem keadilan pengganti — seolah tetap marah entah bagaimana menjaga timbangan tetap seimbang, seolah melepaskannya berarti orang itu lolos begitu saja. Namun kemarahan kita sesungguhnya tidak pernah sanggup menyeimbangkan timbangan itu. Ia sebagian besar hanya memenjarakan kita bersama utang yang sedang berusaha kita tagih. Allah tidak meminta kita melepaskan kemarahan karena kesalahan itu tak penting. Ia memintanya karena Dialah, bukan kita, yang diperlengkapi untuk menanganinya secara adil dan tuntas.

Hari ini, cobalah menyebut dengan jujur: apa yang kutakutkan akan terjadi jika aku berhenti menjadi orang yang menghitung skor? Bawalah ketakutan itu secara khusus kepada Allah. Memberi tempat bagi keadilan-Nya bukanlah kepasrahan. Itu adalah menyerahkan buku catatan kepada Dia yang selalu lebih layak memegangnya daripada kita.',
    'Name what you fear would happen if you stopped keeping score, and hand that fear to God.', 'Sebutkan apa yang kau takutkan akan terjadi jika kau berhenti menghitung skor, dan serahkan ketakutan itu kepada Allah.',
    'Lord, I have been trying to hold the scales myself, and it has exhausted me. I trust You with justice. Take the ledger I''ve been keeping, and let me finally set it down. Amen.', 'Tuhan, aku telah mencoba memegang sendiri timbangan itu, dan itu melelahkanku. Aku memercayakan keadilan kepada-Mu. Ambillah buku catatan yang telah kupegang, dan biarkan aku akhirnya meletakkannya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Romans 12:19', 'WEB', 'Do not take revenge, my dear friends, but leave room for God''s wrath, for it is written: ''It is mine to avenge; I will repay,'' says the Lord.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Roma 12:19', 'TB', 'Saudara-saudaraku yang kekasih, janganlah kamu sendiri menuntut pembalasan, tetapi berilah tempat kepada murka Allah, sebab ada tertulis: Pembalasan itu adalah hak-Ku. Akulah yang akan menuntut pembalasan, firman Tuhan.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 4,
    'How Many Times?', 'Berapa Kali?',
    'Peter''s question to Jesus feels almost generous by ordinary standards: should I forgive as many as seven times? Seven was already a number associated with completeness in Jewish thought — Peter wasn''t lowballing. He was likely expecting to be praised for his generosity. Jesus''s answer instead resets the whole framework: not seven times, but seventy-seven times.

The point is not literally to count to seventy-seven and then stop. The point is that Jesus is describing forgiveness as something that isn''t meant to run out — not a limited resource we dole out carefully and then withhold once we''ve reached our quota of grace. This matters enormously for anyone dealing with a long-carried grudge, because bitterness often keeps a very precise ledger: I forgave them for that, but not for this, and definitely not for the thing after that. Each fresh offense becomes an excuse to reopen the whole account.

This is hard teaching, and it''s worth being honest about that rather than softening it into something easier. Jesus is not saying the hurt didn''t matter, or that we should have no boundaries with someone who repeatedly wounds us. Forgiveness and boundaries are not opposites — we can release someone from our anger while still, wisely, protecting ourselves from continued harm. What Jesus is addressing is the ledger itself — the running tally we keep, deciding whether someone has ''used up'' our forgiveness yet.

If you have been keeping count — consciously or not — of exactly how many times someone has hurt you, and whether they''ve now crossed some invisible line past which you''re finally allowed to stop forgiving, today is an invitation to set the ledger down entirely. Not because the hurts didn''t count, but because forgiveness was never meant to be rationed in the first place.', 'Pertanyaan Petrus kepada Yesus terasa hampir murah hati menurut ukuran biasa: haruskah aku mengampuni sampai tujuh kali? Tujuh sudah menjadi angka yang dikaitkan dengan kesempurnaan dalam pemikiran Yahudi — Petrus sepertinya tidak sedang menawar rendah. Ia mungkin berharap dipuji atas kemurahan hatinya. Jawaban Yesus justru mengatur ulang seluruh kerangka berpikir itu: bukan sampai tujuh kali, melainkan sampai tujuh puluh kali tujuh kali.

Maksudnya bukan secara harfiah menghitung sampai tujuh puluh tujuh lalu berhenti. Maksudnya adalah Yesus sedang menggambarkan pengampunan sebagai sesuatu yang tidak dimaksudkan untuk habis — bukan sumber daya terbatas yang kita bagikan dengan hati-hati lalu ditahan begitu kuota anugerah kita habis. Ini sangat penting bagi siapa pun yang menghadapi dendam yang sudah lama dipikul, sebab kepahitan sering menyimpan buku catatan yang sangat teliti: aku mengampuni mereka untuk hal itu, tapi tidak untuk hal ini, dan pasti tidak untuk hal setelahnya. Setiap pelanggaran baru menjadi alasan untuk membuka kembali seluruh perhitungan.

Ini pengajaran yang berat, dan lebih baik kita jujur tentang itu daripada melunakkannya menjadi sesuatu yang lebih mudah. Yesus tidak sedang berkata bahwa luka itu tidak penting, atau bahwa kita tidak boleh memiliki batasan dengan seseorang yang berulang kali melukai kita. Pengampunan dan batasan bukanlah lawan — kita bisa melepaskan seseorang dari kemarahan kita sambil tetap, dengan bijaksana, melindungi diri dari luka yang terus berlanjut. Yang sedang dibahas Yesus adalah buku catatan itu sendiri — perhitungan yang terus kita jalankan, memutuskan apakah seseorang sudah ''menghabiskan'' pengampunan kita atau belum.

Jika selama ini engkau menghitung — sadar atau tidak — persis berapa kali seseorang telah melukaimu, dan apakah mereka kini telah melewati suatu garis tak terlihat yang membuatmu akhirnya boleh berhenti mengampuni, hari ini adalah ajakan untuk meletakkan buku catatan itu sepenuhnya. Bukan karena luka-luka itu tidak berarti, tetapi karena pengampunan sejak awal memang tidak dimaksudkan untuk dijatah.',
    'Notice if you''ve been keeping a private tally of someone''s offenses, and consider setting the ledger down today.', 'Sadari jika selama ini engkau diam-diam menyimpan catatan pelanggaran seseorang, dan pertimbangkan untuk meletakkan buku catatan itu hari ini.',
    'Jesus, I have been keeping count, deciding when someone finally runs out of my forgiveness. Teach me a forgiveness that isn''t rationed. Help me set down the ledger for good. Amen.', 'Yesus, aku telah menghitung, menentukan kapan seseorang akhirnya kehabisan pengampunanku. Ajarku pengampunan yang tidak dijatah. Tolong aku meletakkan buku catatan itu untuk selamanya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matthew 18:21-22', 'WEB', 'Then Peter came to Jesus and asked, ''Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?'' Jesus answered, ''I tell you, not seven times, but seventy-seven times.''');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Matius 18:21-22', 'TB', 'Kemudian datanglah Petrus dan berkata kepada Yesus, "Tuhan, sampai berapa kali aku harus mengampuni saudaraku jika ia berbuat dosa terhadap aku? Sampai tujuh kali?" Yesus berkata kepadanya, "Bukan sampai tujuh kali, melainkan sampai tujuh puluh kali tujuh kali."');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 5,
    'Before You Pray', 'Sebelum Engkau Berdoa',
    'Jesus links forgiveness and prayer together in a way that can feel uncomfortable at first: when you stand praying, if you hold anything against anyone, forgive them, so that your Father in heaven may forgive you your sins. It''s tempting to read this as a transaction — forgive so that you can be forgiven, as if withholding forgiveness is a bargaining chip we hold over God. But that misses what''s actually happening here.

A heart clenched around an old grievance has a harder time receiving anything, including grace. It''s not that God is refusing to forgive us as punishment for our unforgiveness. It''s that a fist can''t receive a gift while it''s still closed. Holding something against someone keeps our own hands closed, and closed hands, even when reaching toward heaven in prayer, struggle to actually take hold of what''s being offered.

This is why Jesus places this instruction right in the middle of prayer, not as a separate ethical rule filed somewhere else. Prayer is the posture of receiving — asking, listening, opening ourselves to what God wants to give. Unforgiveness is fundamentally a posture of withholding. The two postures fight each other. It''s hard to genuinely open your hands to God while keeping them balled into fists toward someone else.

Before you pray today — really, before, not as an afterthought — take a moment to notice what you might still be holding against someone. You don''t have to resolve it fully in one sitting. But naming it, and asking God to help you loosen your grip even slightly, changes the posture you bring into the rest of your prayer. Open hands receive more than closed ones ever could.', 'Yesus mengaitkan pengampunan dan doa dengan cara yang mula-mula bisa terasa tidak nyaman: apabila kamu berdiri untuk berdoa, ampunilah dahulu barangsiapa yang bersalah kepadamu, supaya Bapamu yang di sorga mengampuni kesalahan-kesalahanmu juga. Ada godaan untuk membaca ini sebagai sebuah transaksi — mengampuni supaya bisa diampuni, seolah menahan pengampunan adalah kartu tawar yang kita pegang atas Allah. Tapi itu melewatkan apa yang sesungguhnya sedang terjadi di sini.

Hati yang mengepal di sekitar keluh kesah lama lebih sulit menerima apa pun, termasuk anugerah. Bukan berarti Allah menolak mengampuni kita sebagai hukuman atas ketidakmauan kita mengampuni. Tapi sebuah kepalan tangan tidak bisa menerima pemberian selama masih terkepal. Menahan sesuatu terhadap seseorang membuat tangan kita sendiri tetap terkepal, dan tangan yang terkepal, bahkan ketika terulur ke surga dalam doa, sulit benar-benar menggenggam apa yang sedang ditawarkan.

Inilah sebabnya Yesus menempatkan pengajaran ini tepat di tengah-tengah doa, bukan sebagai aturan etika terpisah yang disimpan di tempat lain. Doa adalah sikap menerima — meminta, mendengarkan, membuka diri terhadap apa yang ingin Allah berikan. Ketidakmauan mengampuni pada dasarnya adalah sikap menahan. Kedua sikap itu saling berlawanan. Sulit untuk sungguh-sungguh membuka tangan kepada Allah sementara tangan itu tetap mengepal terhadap orang lain.

Sebelum engkau berdoa hari ini — sungguh-sungguh sebelum, bukan sebagai tambahan belakangan — luangkan waktu sejenak untuk menyadari apa yang mungkin masih kau tahan terhadap seseorang. Engkau tidak perlu menyelesaikannya sepenuhnya dalam satu waktu duduk. Tetapi menamainya, dan meminta Allah menolongmu melonggarkan genggamanmu meski sedikit, mengubah sikap yang kau bawa ke dalam sisa doamu. Tangan yang terbuka menerima lebih banyak daripada tangan yang terkepal.',
    'Before you pray today, notice what your hands are still holding against someone, and ask God to loosen your grip.', 'Sebelum engkau berdoa hari ini, sadari apa yang masih dipegang tanganmu terhadap seseorang, dan mintalah Allah melonggarkan genggamanmu.',
    'Father, I want to come to You with open hands, but I notice how tightly I''ve been holding onto this. Loosen my grip, even a little, so I can truly receive what You want to give me. Amen.', 'Bapa, aku ingin datang kepada-Mu dengan tangan terbuka, tetapi aku sadar betapa erat aku memegang ini. Longgarkan genggamanku, meski sedikit, agar aku sungguh-sungguh dapat menerima apa yang ingin Kauberikan kepadaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mark 11:25', 'WEB', 'And when you stand praying, if you hold anything against anyone, forgive them, so that your Father in heaven may forgive you your sins.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Markus 11:25', 'TB', 'Dan jikalau kamu berdiri untuk berdoa, ampunilah dahulu barangsiapa yang bersalah kepadamu, supaya juga Bapamu yang di sorga mengampuni kesalahanmu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 6,
    'The Measure You Use', 'Ukuran yang Kaupakai',
    'Jesus''s teaching on judgment often gets read as a general warning against gossip or criticism, which it is — but there''s a sharper edge to it for anyone nursing a long-carried grudge: do not judge, and you will not be judged. Do not condemn, and you will not be condemned. Forgive, and you will be forgiven. He follows it with an image of measurement: with the measure you use, it will be measured to you.

There''s something almost physical in that image — a measuring cup, pressed down, shaken together, running over. Whatever measure we use on other people, Jesus says, becomes the measure eventually used on us. If we hold people to a standard of permanent guilt, never releasing them, never allowing for change or growth, we are, whether we realize it or not, calibrating the very instrument that will be used to measure our own life.

This isn''t a threat designed to scare us into forgiving out of fear. It''s closer to an observation about how the human heart actually works. A heart that has practiced harshness toward others becomes, gradually, a heart that also expects harshness — that struggles to believe it could ever really be shown mercy, because it has spent so long refusing to extend any. And a heart that has practiced generous judgment of others tends to become more able to receive generous judgment too.

Consider today: what measure have you been using on the person you''re still angry with? Have you left room in your judgment of them for the possibility that they, too, are more than the worst thing they did? Loosening that measure isn''t excusing what happened. It''s recalibrating the instrument you''ll eventually need turned toward you as well.', 'Pengajaran Yesus tentang menghakimi sering dibaca sebagai peringatan umum terhadap gosip atau kritik, dan memang begitu — tetapi ada sisi yang lebih tajam bagi siapa pun yang memikul dendam lama: janganlah kamu menghakimi, maka kamu pun tidak akan dihakimi. Dan janganlah kamu menghukum, maka kamu pun tidak akan dihukum. Ampunilah, dan kamu akan diampuni. Ia melanjutkannya dengan gambaran ukuran: ukuran yang kamu pakai untuk mengukur, akan diukurkan kepadamu.

Ada sesuatu yang hampir terasa nyata dalam gambaran itu — sebuah takaran, ditekan, digoncang, tercurah keluar. Ukuran apa pun yang kita pakai terhadap orang lain, kata Yesus, akhirnya menjadi ukuran yang dipakai terhadap kita. Jika kita memperlakukan orang dengan standar kesalahan yang permanen, tak pernah melepaskan mereka, tak pernah memberi ruang bagi perubahan atau pertumbuhan, kita, sadar atau tidak, sedang mengatur ulang alat ukur yang kelak akan dipakai untuk mengukur hidup kita sendiri.

Ini bukan ancaman yang dirancang untuk menakut-nakuti kita agar mengampuni karena takut. Ini lebih dekat pada sebuah pengamatan tentang bagaimana hati manusia sesungguhnya bekerja. Hati yang telah terbiasa bersikap keras terhadap orang lain, lambat laun, menjadi hati yang juga mengharapkan kekerasan — yang sulit percaya bahwa dirinya bisa benar-benar diperlakukan dengan belas kasihan, karena begitu lama telah menolak memberikannya. Dan hati yang telah terbiasa menghakimi dengan murah hati cenderung menjadi lebih mampu menerima penghakiman yang murah hati juga.

Renungkan hari ini: ukuran apa yang telah kaupakai terhadap orang yang masih membuatmu marah? Sudahkah engkau memberi ruang dalam penilaianmu terhadap mereka untuk kemungkinan bahwa mereka pun lebih dari sekadar hal terburuk yang pernah mereka lakukan? Melonggarkan ukuran itu bukan berarti membenarkan apa yang terjadi. Itu adalah mengatur ulang alat ukur yang kelak juga perlu diarahkan kepadamu.',
    'Consider what measure you''ve been using toward the person you''re angry with, and whether it''s one you''d want used on you.', 'Renungkan ukuran apa yang telah kaupakai terhadap orang yang membuatmu marah, dan apakah itu ukuran yang juga kau inginkan dipakai terhadapmu.',
    'Lord, show me the measure I''ve been using, and help me loosen it. I want to extend the same room for grace and change that I hope You extend to me. Amen.', 'Tuhan, tunjukkan padaku ukuran yang selama ini kupakai, dan tolong aku melonggarkannya. Aku ingin memberi ruang yang sama bagi anugerah dan perubahan, sebagaimana aku berharap Engkau memberikannya kepadaku. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Luke 6:37', 'WEB', 'Do not judge, and you will not be judged. Do not condemn, and you will not be condemned. Forgive, and you will be forgiven.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Lukas 6:37', 'TB', 'Janganlah kamu menghakimi, maka kamu pun tidak akan dihakimi. Dan janganlah kamu menghukum, maka kamu pun tidak akan dihukum; ampunilah, dan kamu akan diampuni.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 7,
    'As Far as a Father''s Compassion', 'Sejauh Belas Kasihan Seorang Bapa',
    'By the end of a week spent looking honestly at anger, it can be tempting to measure our progress by whether the feeling has fully gone — and to feel like a failure if it hasn''t. But release rarely arrives as a single finished event. It''s closer to what the psalmist describes: the Lord is compassionate and gracious, slow to anger, abounding in love. Notice that even God is described as slow — not instantly emptied of any capacity for anger, but patient, restrained, generous in mercy over time.

The psalm goes on to describe a distance almost too large to picture: as far as the heavens are above the earth, so great is his love; as far as the east is from the west, so far has he removed our transgressions from us. This is not a small, careful mercy, doled out in exact proportion to how sorry someone seems. It is vast, extravagant, further than we could travel if we spent our whole life trying to reach the edge of it.

If you began this week still carrying real anger, and you end it having only loosened your grip slightly rather than let go entirely, that is not failure. Esau''s twenty years remind us that release often has its own timeline, mostly hidden from view, working beneath the surface long before it shows up as an embrace instead of a fist. What matters is the direction you''re facing, not how far you''ve already traveled.

As you close this week, consider: the same Father who is slow to anger and abounding in love toward you is inviting you to become, slowly, a little more like Him toward the person who hurt you. Not because the hurt didn''t matter, but because you were made, ultimately, for the same vast, unhurried mercy that has already been extended to you.', 'Menjelang akhir minggu yang dihabiskan untuk melihat kemarahan dengan jujur, ada godaan untuk mengukur kemajuan kita dari apakah perasaan itu sudah sepenuhnya hilang — dan merasa gagal jika belum. Tapi pelepasan jarang datang sebagai satu peristiwa yang selesai sekaligus. Lebih mirip dengan apa yang digambarkan sang pemazmur: Tuhan itu pengasih dan penyayang, panjang sabar dan berlimpah kasih setia. Perhatikan bahkan Allah digambarkan sebagai panjang sabar — bukan seketika kosong dari segala kemungkinan marah, melainkan sabar, tertahan, murah hati dalam belas kasihan seiring waktu.

Mazmur ini melanjutkan dengan menggambarkan jarak yang hampir terlalu besar untuk dibayangkan: setinggi langit di atas bumi, demikian besarnya kasih setia-Nya; sejauh timur dari barat, demikian dijauhkan-Nya dari kita pelanggaran kita. Ini bukan belas kasihan kecil yang diberikan dengan hati-hati sesuai seberapa menyesal seseorang tampaknya. Ini luas, berlimpah, lebih jauh daripada yang bisa kita tempuh sekalipun kita habiskan seumur hidup mencoba mencapai tepinya.

Jika engkau memulai minggu ini dengan masih memikul kemarahan yang nyata, dan mengakhirinya hanya dengan melonggarkan genggamanmu sedikit, bukan sepenuhnya melepaskannya, itu bukanlah kegagalan. Dua puluh tahun Esau mengingatkan kita bahwa pelepasan sering memiliki waktunya sendiri, sebagian besar tersembunyi dari pandangan, bekerja di bawah permukaan jauh sebelum ia tampak sebagai pelukan alih-alih kepalan tangan. Yang penting adalah arah yang kau hadapi, bukan seberapa jauh yang telah kau tempuh.

Saat engkau menutup minggu ini, renungkan: Bapa yang sama, yang panjang sabar dan berlimpah kasih setia terhadapmu, sedang mengundangmu untuk perlahan-lahan menjadi sedikit lebih serupa dengan-Nya terhadap orang yang telah melukaimu. Bukan karena luka itu tidak berarti, tetapi karena engkau diciptakan, pada akhirnya, untuk belas kasihan yang sama luas dan tak tergesa-gesa yang telah diberikan kepadamu.',
    'Measure your progress this week not by whether the anger is gone, but by whether you''re facing the right direction.', 'Ukur kemajuanmu minggu ini bukan dari apakah kemarahan sudah hilang, melainkan dari apakah engkau menghadap ke arah yang benar.',
    'Father, You are slow to anger and abounding in love toward me. Shape me, slowly, into someone who can extend that same patient mercy to the one who hurt me. I release the timeline to You. Amen.', 'Bapa, Engkau panjang sabar dan berlimpah kasih setia terhadapku. Bentuklah aku, perlahan-lahan, menjadi seseorang yang dapat memberikan belas kasihan yang sama sabarnya kepada orang yang telah melukaiku. Aku menyerahkan waktunya kepada-Mu. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Psalm 103:8, 11-12', 'WEB', 'The Lord is compassionate and gracious, slow to anger, abounding in love. For as high as the heavens are above the earth, so great is his love for those who fear him; as far as the east is from the west, so far has he removed our transgressions from us.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Mazmur 103:8, 11-12', 'TB', 'Tuhan adalah pengasih dan penyayang, panjang sabar dan berlimpah kasih setia. Setinggi langit di atas bumi, demikian besarnya kasih setia-Nya atas orang-orang yang takut akan Dia; sejauh timur dari barat, demikian dijauhkan-Nya dari kita pelanggaran kita.');

  -- Plan: Choosing Peace Over the Replay
  INSERT INTO public.devotion_plans (category_id, title, title_id, subtitle, subtitle_id, duration_days, description, description_id, cover_image_url)
  VALUES (
    v_cat_id,
    'Choosing Peace Over the Replay',
    'Memilih Damai di Atas Putaran Ulang',
    'A short reset for the mind that keeps rehearsing the old wound',
    'Pemulihan singkat bagi pikiran yang terus mengulang luka lama',
    3,
    'A brief three-day reset for anyone whose mind keeps returning, almost involuntarily, to an old hurt — replaying the scene, rehearsing what should have been said. Rather than promising instant peace, this short plan interrupts the reflex of the replay and offers a different place for attention to land: what is true and lovely now, the new thing God is doing, and the enormous, settled fact of how much we ourselves have been forgiven.',
    'Pemulihan singkat tiga hari bagi siapa saja yang pikirannya terus kembali, hampir tanpa sadar, pada luka lama — memutar ulang adegan itu, melatih ulang apa yang seharusnya diucapkan. Alih-alih menjanjikan damai instan, rencana singkat ini menyela refleks putar ulang itu dan menawarkan tempat lain bagi perhatian untuk berlabuh: apa yang benar dan indah sekarang, hal baru yang sedang Allah kerjakan, dan fakta besar yang telah mantap tentang betapa besarnya kita sendiri telah diampuni.',
    '/images/devotions/choosing-peace-over-the-replay.jpeg'
  ) RETURNING id INTO v_plan_id;

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 1,
    'The Replay Button', 'Tombol Putar Ulang',
    'There''s a particular kind of mental habit many of us have without ever choosing it deliberately: the replay. A conversation that went badly. A betrayal from years back. A moment someone spoke to us in a way we never should have accepted. We didn''t decide to keep watching it on a loop — it just started running, unbidden, in idle moments: standing in line, lying awake, driving somewhere with nothing else to think about.

Each replay feels, in the moment, like it''s serving some purpose — rehearsing our defense, refining what we should have said, keeping the injustice fresh so we never forget how badly we were treated. But notice what actually happens after each replay. We don''t usually feel more resolved. We feel more agitated, more tired, more convinced the world is unsafe. The replay promises resolution and delivers exhaustion instead.

Paul''s instruction to the Philippians is startlingly practical for something so often treated as merely inspirational: think about whatever is true, noble, right, pure, lovely, admirable, excellent, praiseworthy. This isn''t wishful positivity. It''s a redirection of attention, and attention is one of the few things we actually have some real control over, even when we can''t control what happened to us or how we first felt about it.

This short plan won''t erase the old wound in three days — no honest plan could promise that. But it can begin to interrupt the reflex of the replay, and offer, in its place, a different button to press. Today, simply notice how often your mind reaches for the old scene. You don''t have to fight it yet. Just notice.', 'Ada kebiasaan pikiran tertentu yang dimiliki banyak dari kita tanpa pernah sengaja memilihnya: putar ulang. Sebuah percakapan yang berjalan buruk. Pengkhianatan dari bertahun-tahun lalu. Momen ketika seseorang berbicara kepada kita dengan cara yang seharusnya tak pernah kita terima. Kita tidak memutuskan untuk terus menontonnya berulang-ulang — ia mulai berjalan begitu saja, tanpa diundang, di saat-saat kosong: mengantre, terjaga di malam hari, mengemudi tanpa ada hal lain untuk dipikirkan.

Setiap putaran ulang terasa, pada saat itu, seolah melayani suatu tujuan — melatih pembelaan diri kita, menyempurnakan apa yang seharusnya kita katakan, menjaga ketidakadilan itu tetap segar agar kita tak pernah melupakan betapa buruknya kita diperlakukan. Namun perhatikan apa yang sesungguhnya terjadi setelah setiap putaran ulang itu. Kita biasanya tidak merasa lebih lega. Kita merasa lebih gelisah, lebih lelah, lebih yakin bahwa dunia ini tidak aman. Putaran ulang itu menjanjikan penyelesaian namun sebenarnya hanya memberikan kelelahan.

Perintah Paulus kepada jemaat di Filipi terasa mengejutkan praktisnya untuk sesuatu yang sering diperlakukan hanya sebagai kata-kata penyemangat: pikirkanlah apa yang benar, mulia, adil, suci, manis, sedap didengar, apa yang disebut kebajikan dan patut dipuji. Ini bukan sekadar berpikir positif secara asal. Ini adalah pengalihan perhatian, dan perhatian adalah salah satu dari sedikit hal yang benar-benar bisa kita kendalikan, bahkan ketika kita tidak bisa mengendalikan apa yang terjadi pada kita atau bagaimana perasaan kita mula-mula.

Rencana singkat ini tidak akan menghapus luka lama dalam tiga hari — tak ada rencana yang jujur bisa menjanjikan itu. Tapi ini bisa mulai menyela refleks putar ulang itu, dan menawarkan, sebagai gantinya, tombol lain untuk ditekan. Hari ini, sekadar sadari seberapa sering pikiranmu meraih adegan lama itu. Engkau belum perlu melawannya. Cukup sadari saja.',
    'Simply notice today how often your mind reaches for the old replay, without judging yourself for it.', 'Sekadar sadari hari ini seberapa sering pikiranmu meraih putaran ulang lama itu, tanpa menghakimi dirimu sendiri karenanya.',
    'Lord, I didn''t choose to keep replaying this, but I notice how tired it makes me. Help me simply notice the pattern today, and trust that You can help me redirect it. Amen.', 'Tuhan, aku tidak memilih untuk terus memutar ulang ini, tapi aku sadar betapa itu melelahkanku. Tolong aku sekadar menyadari polanya hari ini, dan percaya Engkau dapat menolongku mengalihkannya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Philippians 4:8', 'WEB', 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Filipi 4:8', 'TB', 'Jadi akhirnya, saudara-saudara, semua yang benar, semua yang mulia, semua yang adil, semua yang suci, semua yang manis, semua yang sedap didengar, semua yang disebut kebajikan dan patut dipuji, pikirkanlah semuanya itu.');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 2,
    'Not the Former Things', 'Bukan Hal-Hal yang Dahulu',
    'There''s a temptation, when we''ve been genuinely wronged, to believe that moving forward requires forgetting — and since forgetting rarely happens on command, we conclude that peace must be permanently out of reach. But when Isaiah writes forget the former things; do not dwell on the past, the word used carries less the sense of erasing memory and more the sense of not building a residence there. Dwelling means living somewhere. God isn''t asking us to pretend the past didn''t happen. He''s asking us to stop making our home in it.

The very next line reveals why: See, I am doing a new thing! Now it springs up; do you not perceive it? This isn''t peace through denial. It''s peace through redirected attention toward something God is actually doing now, in real time, that the old wound has kept us from perceiving because we''ve been so fixed on looking backward.

Many of us have unintentionally built a whole house out of an old hurt — visiting it daily, keeping its furniture arranged just so, maintaining it as though it were still our primary residence rather than a place we passed through once. Isaiah''s invitation is almost architectural: stop dwelling there. Not because the place wasn''t real, but because it was never meant to be lived in permanently.

Today, try naming one ''new thing'' God might actually be doing in your life right now — something small is fine — that the old replay has been crowding out of your view. You don''t have to abandon the memory of what happened. You simply have to stop making it your address.', 'Ada godaan, ketika kita benar-benar disalahi, untuk percaya bahwa melangkah maju berarti harus melupakan — dan karena melupakan jarang terjadi begitu saja atas perintah, kita menyimpulkan bahwa damai pasti selamanya di luar jangkauan. Namun ketika Yesaya menulis janganlah mengingat-ingat hal-hal yang dahulu, janganlah memperhatikan hal-hal yang sudah silam, kata yang dipakai kurang bermakna menghapus ingatan dan lebih bermakna tidak menetap di sana. Menetap berarti tinggal di suatu tempat. Allah tidak meminta kita berpura-pura masa lalu itu tak pernah terjadi. Ia meminta kita berhenti menjadikannya rumah kita.

Baris berikutnya langsung menyingkapkan alasannya: Lihat, Aku hendak membuat sesuatu yang baru, yang sekarang sudah tumbuh, belum jugakah kamu mengetahuinya? Ini bukan damai lewat penyangkalan. Ini damai lewat pengalihan perhatian menuju sesuatu yang sungguh sedang Allah kerjakan sekarang, secara nyata, yang tak bisa kita sadari karena luka lama itu membuat kita terus menoleh ke belakang.

Banyak dari kita tanpa sengaja telah membangun sebuah rumah utuh dari luka lama — mengunjunginya setiap hari, menata perabotnya dengan rapi, merawatnya seolah itu masih tempat tinggal utama kita, bukan sekadar tempat yang pernah kita lewati sekali. Ajakan Yesaya hampir bersifat arsitektural: berhentilah menetap di sana. Bukan karena tempat itu tidak nyata, tetapi karena ia memang tidak pernah dimaksudkan untuk ditinggali selamanya.

Hari ini, cobalah menyebut satu ''hal baru'' yang mungkin sesungguhnya sedang Allah kerjakan dalam hidupmu sekarang — sesuatu yang kecil pun tak apa — yang selama ini terdesak dari pandanganmu oleh putaran ulang lama itu. Engkau tidak perlu meninggalkan ingatan tentang apa yang terjadi. Engkau hanya perlu berhenti menjadikannya alamat tempat tinggalmu.',
    'Name one new thing God may be doing in your life today that the old wound has been crowding out of view.', 'Sebutkan satu hal baru yang mungkin sedang Allah kerjakan dalam hidupmu hari ini, yang selama ini terdesak dari pandangan oleh luka lama.',
    'Lord, I have been living in a place I was only ever meant to pass through. Help me perceive the new thing You are doing, even in small ways, and make my home there instead. Amen.', 'Tuhan, aku telah tinggal di tempat yang seharusnya hanya kulewati. Tolong aku menyadari hal baru yang sedang Kaukerjakan, bahkan dalam cara-cara kecil, dan menjadikan itu rumahku sebagai gantinya. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Isaiah 43:18-19', 'WEB', 'Forget the former things; do not dwell on the past. See, I am doing a new thing! Now it springs up; do you not perceive it?');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Yesaya 43:18-19', 'TB', 'Janganlah mengingat-ingat hal-hal yang dahulu, dan janganlah memperhatikan hal-hal yang sudah silam! Lihat, Aku hendak membuat sesuatu yang baru, yang sekarang sudah tumbuh, belum jugakah kamu mengetahuinya?');

  INSERT INTO public.devotion_plan_days (
    plan_id, day_number, 
    devotional_title, devotional_title_id,
    devotional_content, devotional_content_id,
    reflection, reflection_id,
    prayer, prayer_id
  ) VALUES (
    v_plan_id, 3,
    'As the Lord Forgave You', 'Sebagaimana Tuhan Telah Mengampuni Kamu',
    'By this third day, the invitation isn''t to have arrived at some perfect, effortless peace — that would be a false finish line for a three-day plan, or honestly, for most seasons of real healing. The invitation is simpler: to choose, today, the posture Paul describes — bear with each other and forgive one another if any of you has a grievance against someone. As the Lord forgave you, so you also must forgive.

That last clause is doing the heaviest lifting: as the Lord forgave you. Not as the offense deserved, not once the wound stopped hurting, not after the other person has adequately grovelled. As the Lord forgave you — which is to say, before we had done anything to earn it, extravagantly, completely, at cost to Himself rather than to us. Our forgiveness of others was never meant to be more conditional or more carefully rationed than the forgiveness we''ve received.

This doesn''t erase the reality of the wound, or suggest the hurt wasn''t real and deep — this whole plan has assumed it was. What it offers instead is a different way of carrying it: not replayed daily as a fresh grievance, but set beside the enormous, settled fact of how much we ourselves have already been forgiven. Grievances shrink, a little, next to that comparison. Not because they were small, but because grace is larger.

As you close these three days, consider one small, concrete way to choose peace over the replay today — closing a mental loop, saying a short prayer of release when the old scene surfaces, or simply choosing gratitude instead of rehearsal in one specific moment. Peace, like most things worth having, is rarely won once. It''s chosen, again, today, and probably again tomorrow — and that ongoing choosing is not weakness. It''s the whole of the Christian life, quietly practiced.', 'Sampai hari ketiga ini, ajakannya bukanlah untuk telah tiba pada damai yang sempurna dan tanpa usaha — itu akan menjadi garis akhir yang palsu untuk rencana tiga hari, atau jujur saja, untuk sebagian besar musim penyembuhan yang sesungguhnya. Ajakannya lebih sederhana: memilih, hari ini, sikap yang digambarkan Paulus — sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain apabila yang seorang menaruh dendam terhadap yang lain, sama seperti Tuhan telah mengampuni kamu, kamu perlu saling mengampuni.

Bagian terakhir itulah yang menanggung beban paling berat: sama seperti Tuhan telah mengampuni kamu. Bukan sebanding dengan seberapa pantas kesalahan itu dihukum, bukan setelah luka berhenti terasa sakit, bukan setelah orang lain cukup merendahkan diri. Sama seperti Tuhan telah mengampuni kamu — yang artinya, sebelum kita melakukan apa pun untuk pantas menerimanya, secara berlimpah, secara penuh, dengan harga bagi diri-Nya sendiri, bukan bagi kita. Pengampunan kita terhadap orang lain tidak pernah dimaksudkan untuk lebih bersyarat atau lebih dijatah hati-hati daripada pengampunan yang telah kita terima.

Ini tidak menghapus kenyataan luka itu, atau menyiratkan bahwa rasa sakit itu tidak nyata dan dalam — seluruh rencana ini telah mengasumsikan bahwa memang demikian. Yang ditawarkannya sebagai gantinya adalah cara membawanya yang berbeda: bukan diputar ulang setiap hari sebagai keluhan yang segar, melainkan diletakkan di sisi fakta yang besar dan telah mantap, tentang betapa besarnya kita sendiri telah diampuni. Keluhan itu mengecil, sedikit, di samping perbandingan itu. Bukan karena keluhan itu kecil, melainkan karena anugerah itu lebih besar.

Saat engkau menutup tiga hari ini, pikirkan satu cara kecil dan nyata untuk memilih damai di atas putaran ulang hari ini — menutup lingkaran pikiran, mengucapkan doa pelepasan singkat ketika adegan lama itu muncul, atau sekadar memilih syukur alih-alih pengulangan pada satu momen tertentu. Damai, seperti kebanyakan hal yang layak dimiliki, jarang dimenangkan sekali untuk selamanya. Ia dipilih, lagi, hari ini, dan mungkin lagi besok — dan pemilihan yang terus-menerus itu bukanlah kelemahan. Itulah keseluruhan kehidupan Kristen, yang dipraktikkan dengan tenang.',
    'Choose one small, concrete way today to set the old grievance beside how much you''ve already been forgiven.', 'Pilih satu cara kecil dan nyata hari ini untuk meletakkan keluhan lama itu di samping betapa besarnya kau telah diampuni.',
    'Lord, as You have forgiven me completely and at great cost, help me forgive as You did — not because the hurt was small, but because Your grace is larger. Give me peace today, and again tomorrow. Amen.', 'Tuhan, sebagaimana Engkau telah mengampuniku sepenuhnya dan dengan harga yang besar, tolong aku mengampuni sebagaimana Engkau lakukan — bukan karena luka itu kecil, melainkan karena anugerah-Mu lebih besar. Berikan aku damai hari ini, dan lagi esok hari. Amin.'
  ) RETURNING id INTO v_day_id;

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Colossians 3:13', 'WEB', 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.');

  INSERT INTO public.devotion_plan_day_verses (day_id, verse_reference, translation, verse_content)
  VALUES (v_day_id, 'Kolose 3:13', 'TB', 'Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain apabila yang seorang menaruh dendam terhadap yang lain, sama seperti Tuhan telah mengampuni kamu, kamu perlu saling mengampuni.');

END $$;
