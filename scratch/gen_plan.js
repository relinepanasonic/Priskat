const fs = require("fs");

const csvData = [
  {
    day: 1,
    title_en: "As For My House",
    title_id: "Aku dan Seisi Rumahku",
    content_en: "Near the end of his life, Joshua gathered a whole nation...",
    content_id: "Menjelang akhir hidupnya, Yosua mengumpulkan seluruh bangsa...",
    reflection_en: "Someone in a home usually has to choose God first, and out loud. Today, let that be you — one small, visible choice for the good of your household.",
    reflection_id: "Di sebuah rumah, biasanya harus ada yang memilih Allah lebih dahulu, dan dengan lantang. Hari ini, biarlah itu engkau — satu pilihan kecil yang tampak demi kebaikan rumah tanggamu.",
    prayer_en: "Lord, let me be the one in my home who chooses You out loud, even if I choose alone. Hold the door open behind me, and in Your time, bring my whole household through it. Amen.",
    prayer_id: "Tuhan, jadikanlah aku orang di rumahku yang memilih-Mu dengan lantang, meski aku memilih seorang diri. Tahanlah pintu tetap terbuka di belakangku, dan pada waktu-Mu, bawalah seisi rumahku melaluinya. Amin.",
    verses: [
      { ref: "Joshua 24:15", trans: "WEB" },
      { ref: "Yosua 24:15 TB", trans: "TB" }
    ]
  },
  {
    day: 2,
    title_en: "Sanctifying the Ordinary",
    title_id: "Menguduskan yang Biasa",
    content_en: "For about thirty years, the Son of God lived an ordinary family life...",
    content_id: "Selama kira-kira tiga puluh tahun, Putra Allah menjalani hidup keluarga yang biasa...",
    reflection_en: "God sanctified an ordinary home in Nazareth simply by living in it. Offer Him one routine task in your own home today.",
    reflection_id: "Allah menguduskan sebuah rumah biasa di Nazaret semata dengan tinggal di dalamnya. Persembahkanlah kepada-Nya satu tugas rutin di rumahmu hari ini.",
    prayer_en: "Lord Jesus, You made a home in Nazareth holy simply by living there. Sanctify the ordinary hours of my home too — the meals, the chores, the quiet evenings — and let me find You in them. Amen.",
    prayer_id: "Tuhan Yesus, Engkau menguduskan rumah di Nazaret semata dengan tinggal di sana. Kuduskanlah juga jam-jam biasa di rumahku — makan, tugas, malam-malam yang sunyi — dan biarkan aku menemukan-Mu di dalamnya. Amin.",
    verses: [
      { ref: "Luke 2:51-52", trans: "WEB" },
      { ref: "Lukas 2:51-52 TB", trans: "TB" }
    ]
  },
  {
    day: 3,
    title_en: "Faith Along the Road",
    title_id: "Iman di Sepanjang Jalan",
    content_en: "When God told His people how to pass faith to the next generation...",
    content_id: "Ketika Allah memberi tahu umat-Nya cara meneruskan iman kepada generasi berikutnya...",
    reflection_en: "Faith passes down in ordinary moments, not just solemn ones. Let it surface once today in a normal conversation at home.",
    reflection_id: "Iman diwariskan dalam momen biasa, bukan hanya yang khusyuk. Biarkan ia muncul sekali hari ini dalam percakapan biasa di rumah.",
    prayer_en: "Father, I do not always have the words or the time. Let faith slip naturally into the ordinary hours of my home, so that those I love absorb Your goodness without my forcing it. Amen.",
    prayer_id: "Bapa, aku tak selalu punya kata-kata atau waktu. Biarkan iman menyelinap secara wajar ke dalam jam-jam biasa di rumahku, agar mereka yang kukasihi menyerap kebaikan-Mu tanpa kupaksakan. Amin.",
    verses: [
      { ref: "Deuteronomy 6:6-7", trans: "WEB" },
      { ref: "Ulangan 6:6-7 TB", trans: "TB" }
    ]
  },
  {
    day: 4,
    title_en: "Honor Father and Mother",
    title_id: "Hormati Ayah dan Ibu",
    content_en: "\"Honor your father and your mother\" is the one commandment...",
    content_id: "\"Hormatilah ayahmu dan ibumu\" adalah satu-satunya perintah yang disertai janji...",
    reflection_en: "Honoring parents grows from obedience into patience, gratitude, and sometimes forgiveness. Reach toward yours today in the way this season allows.",
    reflection_id: "Menghormati orang tua bertumbuh dari ketaatan menjadi kesabaran, syukur, dan kadang pengampunan. Ulurkanlah tanganmu kepada orang tuamu hari ini dengan cara yang diizinkan musim ini.",
    prayer_en: "Lord, teach me to honor those who raised me — with patience where it is hard, gratitude where it is deserved, and forgiveness where it is needed. Give me a tender heart toward them today. Amen.",
    prayer_id: "Tuhan, ajarilah aku menghormati mereka yang membesarkanku — dengan kesabaran di tempat yang sulit, syukur di tempat yang layak, dan pengampunan di tempat yang perlu. Berilah aku hati yang lembut terhadap mereka hari ini. Amin.",
    verses: [
      { ref: "Exodus 20:12", trans: "WEB" },
      { ref: "Keluaran 20:12 TB", trans: "TB" },
      { ref: "Sirach 3:12-13", trans: "WEB" },
      { ref: "Sirakh 3:12-13 TB", trans: "TB" }
    ]
  },
  {
    day: 5,
    title_en: "Love Is Patient at Home",
    title_id: "Kasih Itu Sabar di Rumah",
    content_en: "We usually hear Paul's famous words about love at weddings...",
    content_id: "Kita biasanya mendengar kata-kata masyhur Paulus tentang kasih di pesta pernikahan...",
    reflection_en: "The home is where we are most tempted to keep a record of wrongs. Catch yourself once today, and set one small thing down for the peace of your household.",
    reflection_id: "Rumah adalah tempat kita paling tergoda menyimpan catatan kesalahan. Tangkaplah dirimu sekali hari ini, dan letakkanlah satu hal kecil demi damai rumah tanggamu.",
    prayer_en: "Lord, at home I keep a record I should have torn up long ago. Help me set it down today. Make me patient with the ones I live with, and slow to recite their faults. Amen.",
    prayer_id: "Tuhan, di rumah aku menyimpan catatan yang seharusnya sudah lama kurobek. Tolonglah aku meletakkannya hari ini. Jadikanlah aku sabar terhadap mereka yang tinggal bersamaku, dan lambat untuk membacakan kesalahan mereka. Amin.",
    verses: [
      { ref: "1 Corinthians 13:4-5", trans: "WEB" },
      { ref: "1 Korintus 13:4-5 TB", trans: "TB" }
    ]
  },
  {
    day: 6,
    title_en: "Forgive as You've Been Forgiven",
    title_id: "Mengampuni seperti Engkau Telah Diampuni",
    content_en: "No family shares a life without wounding one another...",
    content_id: "Tak ada keluarga yang berbagi hidup tanpa saling melukai...",
    reflection_en: "Forgiveness is the daily maintenance that keeps family love alive. Forgive as you have been forgiven — freely, before it is earned.",
    reflection_id: "Pengampunan adalah perawatan harian yang menjaga kasih keluarga tetap hidup. Ampunilah sebagaimana engkau telah diampuni — dengan cuma-cuma, sebelum ia diusahakan.",
    prayer_en: "Lord, You forgave me before I deserved it, more times than I can count. Give me the grace to forgive the one in my home the same way, and to lay down the grievance I have been holding. Amen.",
    prayer_id: "Tuhan, Engkau mengampuniku sebelum aku layak, lebih sering daripada yang bisa kuhitung. Berilah aku rahmat untuk mengampuni orang di rumahku dengan cara yang sama, dan meletakkan dendam yang selama ini kusimpan. Amin.",
    verses: [
      { ref: "Colossians 3:13-14", trans: "WEB" },
      { ref: "Kolose 3:13-14 TB", trans: "TB" }
    ]
  },
  {
    day: 7,
    title_en: "The Table We Share",
    title_id: "Meja yang Kita Bagi",
    content_en: "The first Christians did not build grand institutions before they built shared tables...",
    content_id: "Umat Kristen perdana tidak membangun lembaga megah sebelum mereka membangun meja bersama...",
    reflection_en: "The shared family table is a small altar of grace. Recover one meal together this week — no screens, a grace said, glad hearts.",
    reflection_id: "Meja keluarga yang dibagi adalah altar rahmat kecil. Rebutlah kembali satu makan bersama minggu ini — tanpa layar, doa diucapkan, hati yang gembira.",
    prayer_en: "Father, gather my family around one table this week, with glad and sincere hearts. Make our shared meals small altars where we remember You, and remember that we belong to each other. Amen.",
    prayer_id: "Bapa, kumpulkanlah keluargaku di satu meja minggu ini, dengan hati yang gembira dan tulus. Jadikanlah makan bersama kami altar-altar kecil tempat kami mengingat-Mu, dan mengingat bahwa kami saling memiliki. Amin.",
    verses: [
      { ref: "Acts 2:46-47", trans: "WEB" },
      { ref: "Kisah Para Rasul 2:46-47 TB", trans: "TB" },
      { ref: "Psalm 133:1", trans: "WEB" },
      { ref: "Mazmur 133:1 TB", trans: "TB" }
    ]
  }
];

// Instead of extracting full body text which might have apostrophes messing up SQL, we'll use Postgres dollar quoting $$ $$

const sql = `
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
    'Under One Roof',
    'Di Bawah Satu Atap',
    'Learning to love the people closest to us',
    'Belajar mengasihi orang-orang yang paling dekat dengan kita',
    7,
    'Seven days on the love that is least optional and most tested: the love of family. Home is where we are known most closely, which means it is also where our patience, forgiveness, and faith are worn thin and made strong. Whether your household is full or quiet, whole or wounded, this plan gently turns your heart toward the ordinary, sacred work of loving the people under your roof.',
    'Tujuh hari tentang kasih yang paling tidak bisa dihindari sekaligus paling sering diuji: kasih keluarga. Rumah adalah tempat kita paling dikenal secara dekat, yang berarti di situ pula kesabaran, pengampunan, dan iman kita menipis sekaligus dikuatkan. Entah rumahmu ramai atau sunyi, utuh atau terluka, devosi ini dengan lembut mengarahkan hatimu kepada pekerjaan yang biasa namun kudus: mengasihi orang-orang di bawah atapmu.',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop'
  ) RETURNING id INTO v_plan_id;

${csvData.map(d => `
  -- Day ${d.day}
  INSERT INTO public.devotion_plan_days (plan_id, day_number, devotional_title, devotional_title_id, devotional_content, devotional_content_id, reflection, reflection_id, prayer, prayer_id)
  VALUES (
    v_plan_id,
    ${d.day},
    $q$${d.title_en}$q$,
    $q$${d.title_id}$q$,
    $q$${d.content_en}$q$,
    $q$${d.content_id}$q$,
    $q$${d.reflection_en}$q$,
    $q$${d.reflection_id}$q$,
    $q$${d.prayer_en}$q$,
    $q$${d.prayer_id}$q$
  ) RETURNING id INTO v_day_id;

  ${d.verses.map((v, i) => `INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index) VALUES (v_day_id, $q$${v.ref}$q$, '${v.trans}', ${i});`).join('\n  ')}
`).join('\n')}

END $$;
`;

fs.writeFileSync("supabase/016_seed_under_one_roof.sql", sql);
console.log("SQL generated!");
