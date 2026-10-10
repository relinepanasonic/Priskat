export interface PlanDay {
  dayNumber: number;
  title: string;
  passage: string;
  passageRef: string;
  devotionalText: string;
}

export interface BiblePlan {
  id: string;
  title: string;
  category: string;
  durationDays: number;
  description: string;
  iconEmoji: string;
  coverImage: string;
  days: PlanDay[];
}

export const BIBLE_PLANS: BiblePlan[] = [
  {
    id: "kecemasan-7-hari",
    title: "7 Hari: Mengatasi Kecemasan & Ketakutan",
    category: "Kedamaian Hati",
    durationDays: 7,
    description: "Temukan kedamaian sejati saat menghadapi kekhawatiran hidup melalui Firman Allah yang menguatkan.",
    iconEmoji: "🛡️",
    coverImage: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
    days: [
      {
        dayNumber: 1,
        title: "Jangan Kuatir Tentang Apa Pun",
        passage: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.",
        passageRef: "Filipi 4:6-7",
        devotionalText: "Kekhawatiran tidak merubah masa depan, namun doa mengubah sudut pandang dan membawa damai sejahtera Allah yang melampaui segala akal.",
      },
      {
        dayNumber: 2,
        title: "Tuhan Adalah Gembalaku",
        passage: "Tuhan adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.",
        passageRef: "Mazmur 23:1-3",
        devotionalText: "Ketika kita merasa kewalahan, Gembala yang Baik menuntun kita ke tempat istirahat dan memulihkan jiwa kita.",
      },
      {
        dayNumber: 3,
        title: "Kelegaan Bagi yang Letih Lesu",
        passage: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.",
        passageRef: "Matius 11:28",
        devotionalText: "Datanglah kepada Yesus dengan segala beban beratmu hari ini. Dia tidak pernah menolak hati yang mencari-Nya.",
      },
      {
        dayNumber: 4,
        title: "Allah Menyertai Engkau",
        passage: "Kuatkan dan teguhkanlah hatimu! Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.",
        passageRef: "Yosua 1:9",
        devotionalText: "Keberanian bukanlah ketiadaan rasa takut, tetapi kepastian bahwa Allah berjalan di sampingmu di setiap langkah.",
      },
      {
        dayNumber: 5,
        title: "Kekuatan Baru Bagi yang Menanti",
        passage: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya.",
        passageRef: "Yesaya 40:31",
        devotionalText: "Menantikan Tuhan bukanlah waktu yang terbuang, melainkan proses pembentukan di mana kekuatan baru dicurahkan.",
      },
      {
        dayNumber: 6,
        title: "Menyerahkan Segala Kekuatiran",
        passage: "Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu.",
        passageRef: "1 Petrus 5:7",
        devotionalText: "Tangan Allah cukup kuat untuk memegang seluruh masalah hidupmu. Lepaskanlah kekhawatiranmu dan percayalah.",
      },
      {
        dayNumber: 7,
        title: "Damai Sejahtera Sejati",
        passage: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu. Janganlah gelisah dan gentar hatimu.",
        passageRef: "Yohanes 14:27",
        devotionalText: "Selamat! Kamu telah menyelesaikan 7 hari refleksi. Hiduplah dalam damai sejahtera Kristus yang menetap di dalam hatimu.",
      },
    ],
  },
  {
    id: "pemulihan-keluarga-14",
    title: "14 Hari: Pemulihan Hubungan & Keluarga",
    category: "Keluarga & Kasih",
    durationDays: 14,
    description: "Belajar mengampuni, membangun komunikasi, dan memulihkan ikatan kasih dalam keluarga sesuai firman Tuhan.",
    iconEmoji: "🏠",
    coverImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    days: [
      {
        dayNumber: 1,
        title: "Kasih Itu Sabar dan Murah Hati",
        passage: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.",
        passageRef: "1 Korintus 13:4-5",
        devotionalText: "Kasih sejati diukur bukan saat semuanya mudah, tetapi saat kita belajar bersabar dan mengalah bagi kebaikan bersama.",
      },
      {
        dayNumber: 2,
        title: "Saling Mengampuni",
        passage: "Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah dalam Kristus telah mengampuni kamu.",
        passageRef: "Efesus 4:32",
        devotionalText: "Pengampunan adalah kunci pembuka pintu pemulihan dalam setiap hubungan keluarga.",
      },
    ],
  },
  {
    id: "hikmat-amsal-30",
    title: "30 Hari: Hikmat Kitab Amsal",
    category: "Hikmat Hidup",
    durationDays: 30,
    description: "Dapatkan petunjuk praktis untuk mengambil keputusan bijak dalam karir, keuangan, dan relasi sehari-hari.",
    iconEmoji: "👑",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
    days: [
      {
        dayNumber: 1,
        title: "Permulaan Pengetahuan",
        passage: "Takut akan TUHAN adalah permulaan pengetahuan, tetapi orang bodoh menghina hikmat dan didikan.",
        passageRef: "Amsal 1:7",
        devotionalText: "Hikmat sejati dimulai dari kerendahan hati untuk menghormati dan melibatkan Tuhan dalam setiap keputusan.",
      },
    ],
  },
];
