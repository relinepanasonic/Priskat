/**
 * Ruang Iman bots: accounts that keep the community feed alive with short daily reflections.
 * They are always shown with a "Bot" label, kept out of the leaderboard, friend suggestions and member counts.
 * Nothing here pretends to be a real person's experience: the thoughts are general reflections on the faith.
 */
export type BotPersona = {
  name: string;
  nick: string;
  gender: "male" | "female";
  city: string;
  bio: string;
  verse: string;
  interests: string[];
};

export const BOT_PERSONAS: BotPersona[] = [
  { name: "Maria Lestari Wijaya", nick: "Maria", gender: "female", city: "Jakarta", bio: "Suka duduk tenang di gereja sebelum misa mulai. Belajar percaya dalam hal-hal kecil.", verse: "Tuhan adalah gembalaku, takkan kekurangan aku.", interests: ["doa", "musik gereja"] },
  { name: "Yohanes Budi Santoso", nick: "Yohanes", gender: "male", city: "Surabaya", bio: "Senang membaca Kitab Suci pelan-pelan, satu ayat sehari.", verse: "Firman-Mu itu pelita bagi kakiku.", interests: ["Alkitab", "kopi"] },
  { name: "Agnes Pramesti Hartono", nick: "Agnes", gender: "female", city: "Bandung", bio: "Pengiring koor dan penggemar lagu-lagu Taize.", verse: "Bernyanyilah bagi Tuhan sebuah nyanyian baru.", interests: ["koor", "Taize"] },
  { name: "Antonius Dimas Kusuma", nick: "Dimas", gender: "male", city: "Yogyakarta", bio: "Mahasiswa, lagi belajar mengenal iman lebih dalam lewat komunitas.", verse: "Mintalah, maka kamu akan diberi.", interests: ["komunitas", "buku"] },
  { name: "Theresia Natalia Simanjuntak", nick: "Natalia", gender: "female", city: "Medan", bio: "Suka masak untuk keluarga dan berdoa sambil menunggu masakan matang.", verse: "Berbahagialah orang yang lemah lembut.", interests: ["keluarga", "masak"] },
  { name: "Fransiskus Ardi Pranoto", nick: "Ardi", gender: "male", city: "Semarang", bio: "Bapak dua anak. Belajar sabar dari mereka setiap hari.", verse: "Biarkanlah anak-anak itu datang kepada-Ku.", interests: ["keluarga", "jalan pagi"] },
  { name: "Katarina Putri Susanto", nick: "Putri", gender: "female", city: "Malang", bio: "Mengajar sekolah minggu. Anak-anak mengajarkan arti sederhana.", verse: "Jika kamu tidak menjadi seperti anak kecil, kamu tidak akan masuk Kerajaan Surga.", interests: ["sekolah minggu", "menggambar"] },
  { name: "Petrus Hendra Lim", nick: "Hendra", gender: "male", city: "Jakarta", bio: "Pelayan di paroki. Pelayanan kecil, hati yang besar.", verse: "Siapa yang terbesar di antara kamu, hendaklah ia menjadi pelayanmu.", interests: ["pelayanan", "lektor"] },
  { name: "Stefani Cecilia Tan", nick: "Stefani", gender: "female", city: "Surabaya", bio: "Kerja kantoran, rindu hening. Rosario di perjalanan pulang.", verse: "Tenanglah, dan ketahuilah bahwa Akulah Allah.", interests: ["rosario", "hening"] },
  { name: "Benediktus Raka Nainggolan", nick: "Raka", gender: "male", city: "Medan", bio: "Orang muda Katolik. Suka diskusi iman sambil makan bakso.", verse: "Janganlah takut, sebab Aku menyertai engkau.", interests: ["OMK", "diskusi"] },
  { name: "Veronica Anjani Manurung", nick: "Anjani", gender: "female", city: "Pematang Siantar", bio: "Belajar bersyukur lewat catatan kecil setiap malam.", verse: "Bersyukurlah dalam segala hal.", interests: ["jurnal", "syukur"] },
  { name: "Gregorius Bayu Tampubolon", nick: "Bayu", gender: "male", city: "Bekasi", bio: "Bergabung di komunitas keluarga. Suka mendengarkan homili romo.", verse: "Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada.", interests: ["homili", "komunitas"] },
  { name: "Clara Ayu Wowor", nick: "Clara", gender: "female", city: "Manado", bio: "Suka berdoa dengan nyanyian. Dari Minahasa, tinggal di mana saja.", verse: "Hatiku bersukacita karena Tuhan.", interests: ["nyanyian", "keluarga"] },
  { name: "Ignatius Fajar Kaunang", nick: "Fajar", gender: "male", city: "Manado", bio: "Mengagumi Ignatius dari Loyola. Latihan melihat Tuhan dalam segala hal.", verse: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.", interests: ["spiritualitas", "refleksi"] },
  { name: "Monica Dewi Rumbayan", nick: "Monica", gender: "female", city: "Makassar", bio: "Ibu rumah tangga yang percaya doa seorang ibu tidak pernah sia-sia.", verse: "Doa orang benar sangat besar kuasanya.", interests: ["doa", "keluarga"] },
  { name: "Thomas Aditya Wibowo", nick: "Aditya", gender: "male", city: "Solo", bio: "Dulu banyak ragu, sekarang belajar percaya sedikit demi sedikit.", verse: "Berbahagialah mereka yang tidak melihat, namun percaya.", interests: ["iman", "buku"] },
  { name: "Natalia Sekar Pangestu", nick: "Sekar", gender: "female", city: "Yogyakarta", bio: "Guru bahasa. Suka puisi dan mazmur.", verse: "Langit menceritakan kemuliaan Allah.", interests: ["mazmur", "puisi"] },
  { name: "Paulus Dion Hutapea", nick: "Dion", gender: "male", city: "Jakarta", bio: "Atlet amatir dan misdinar sejak kecil. Disiplin itu juga bentuk doa.", verse: "Aku telah mengakhiri pertandingan yang baik.", interests: ["olahraga", "misdinar"] },
  { name: "Elisabeth Nia Kurniawan", nick: "Nia", gender: "female", city: "Bandung", bio: "Perawat. Belajar melihat wajah Kristus pada setiap orang sakit.", verse: "Ketika Aku sakit, kamu melawat Aku.", interests: ["pelayanan", "kesehatan"] },
  { name: "Andreas Kevin Salim", nick: "Kevin", gender: "male", city: "Pontianak", bio: "Pekerja digital yang sedang belajar menaruh doa di antara notifikasi.", verse: "Serahkanlah segala kekuatiranmu kepada-Nya.", interests: ["teknologi", "doa"] },
  { name: "Lusia Meta Ndun", nick: "Meta", gender: "female", city: "Kupang", bio: "Dari Nusa Tenggara. Rindu kampung dan misa di kapel kecil.", verse: "Aku telah memilih engkau, jangan takut.", interests: ["kampung", "tenun"] },
  { name: "Markus Eka Pangaribuan", nick: "Eka", gender: "male", city: "Bogor", bio: "Pensiunan guru. Setiap pagi mengawali dengan Mazmur.", verse: "Inilah hari yang dijadikan Tuhan, marilah kita bersorak.", interests: ["mazmur", "berkebun"] },
  { name: "Angela Rina Sudarmo", nick: "Rina", gender: "female", city: "Semarang", bio: "Suka mengunjungi gereja-gereja tua dan berdoa di dalamnya.", verse: "Rumah-Ku akan disebut rumah doa.", interests: ["gereja tua", "foto"] },
  { name: "Matius Joel Tarigan", nick: "Joel", gender: "male", city: "Medan", bio: "Gitaris OMK. Musik juga cara untuk berdoa.", verse: "Pujilah Dia dengan gitar dan kecapi.", interests: ["gitar", "OMK"] },
  { name: "Yosefa Tiara Lukito", nick: "Tiara", gender: "female", city: "Jakarta", bio: "Pelan-pelan belajar bahwa istirahat juga bagian dari iman.", verse: "Marilah kepada-Ku, semua yang letih lesu.", interests: ["istirahat", "doa"] },
  { name: "Bernardus Gilang Setiawan", nick: "Gilang", gender: "male", city: "Malang", bio: "Mencari damai di tengah kota yang ramai.", verse: "Damai sejahtera-Ku Kuberikan kepadamu.", interests: ["hening", "jalan kaki"] },
];

/** Short general reflections. Nothing here claims a personal event: they could be said by anyone. */
export const BOT_THOUGHTS: string[] = [
  "Hari ini cukup satu hal: percaya bahwa Tuhan sudah ada di dalam hari ini sebelum kita sampai.",
  "Doa tidak harus panjang. Kadang cukup satu kata: \"Tuhan.\"",
  "Yang kecil dan setia sering lebih berarti daripada yang besar tapi sekali saja.",
  "Bersyukur itu otot. Makin dilatih, makin kuat, bahkan di hari yang berat.",
  "\"Tenanglah, dan ketahuilah bahwa Akulah Allah.\" Ayat favorit untuk menutup hari yang ribut.",
  "Tidak perlu menunggu sempurna untuk mulai berdoa. Mulai saja dari yang ada.",
  "Satu ayat dibaca pelan lebih menyentuh daripada satu bab dibaca terburu-buru.",
  "Kalau hati sedang gelisah, tarik napas dan ucapkan: \"Yesus, aku percaya kepada-Mu.\"",
  "Pelayanan bukan soal siapa yang melihat, tetapi siapa yang terbantu.",
  "Pagi adalah undangan Tuhan untuk mulai lagi. Selamat pagi, selamat mencoba lagi.",
  "Rosario di perjalanan juga doa. Tuhan mendengar di mana saja.",
  "Mengampuni tidak berarti melupakan. Kadang artinya hanya berhenti membawa beban itu sendirian.",
  "Doa bukan untuk membuat Tuhan berubah pikiran, tetapi untuk membuat kita lebih siap menerima-Nya.",
  "Ada damai yang tidak bisa dijelaskan, tetapi bisa dirasakan saat kita menyerahkan semuanya.",
  "Hari Minggu bukan hanya soal datang ke gereja, tetapi membawa gereja pulang ke rumah.",
  "Hening itu bahasa yang dimengerti Tuhan. Sediakan lima menit saja hari ini.",
  "\"Mintalah, maka kamu akan diberi.\" Mulai dari meminta hal yang paling jujur.",
  "Teman seiman itu anugerah. Hubungi satu orang hari ini, sekadar menanyakan kabar.",
  "Setiap tantangan membawa pelajaran. Setiap pelajaran membawa kita lebih dekat kepada-Nya.",
  "Tuhan tidak meminta kita sempurna, hanya setia melangkah satu hari lagi.",
  "Ucapan terima kasih yang tulus bisa jadi doa terpendek dan paling indah.",
  "Kalau tidak tahu bagaimana berdoa, mulailah dengan Salam Maria. Cukup.",
  "Ayat hari ini mengingatkan: kita tidak berjalan sendirian.",
  "Cinta kasih paling nyata ada pada hal-hal kecil: mendengarkan, menyapa, menolong tanpa diminta.",
  "Salib bukan hanya tanda penderitaan, tetapi juga tanda bahwa kita dikasihi sampai habis.",
  "Berdoa untuk orang yang menyulitkan kita adalah latihan iman yang paling jujur.",
  "Kadang jawaban doa datang sebagai kekuatan untuk menanggung, bukan hilangnya beban.",
  "Keluarga adalah gereja kecil pertama. Hari ini, doa singkat bersama sebelum makan.",
  "\"Janganlah takut.\" Kalimat itu muncul ratusan kali dalam Kitab Suci. Mungkin karena kita memang sering takut.",
  "Menunggu dengan percaya itu juga bentuk doa.",
  "Bunda Maria tidak banyak bicara, tetapi menyimpan segala perkara di dalam hatinya.",
  "Hari ini coba satu hal: menyapa seseorang yang jarang disapa.",
  "Pertobatan itu bukan sekali besar, melainkan arah kecil yang kita luruskan tiap hari.",
  "Iman tidak selalu terasa kuat. Itu tidak apa-apa. Yang penting tetap datang kepada-Nya.",
  "Tuhan hadir di tengah kesibukan. Kadang kita hanya perlu berhenti sejenak untuk menyadarinya.",
  "Musik rohani di pagi hari bisa mengubah suasana hati dan arah hari.",
  "Doa malam: terima kasih untuk hari ini, ampuni yang kurang, jagalah yang kukasihi.",
  "Kerendahan hati bukan merasa kecil, tetapi tahu siapa yang memberi segalanya.",
  "Hari yang melelahkan pun bisa ditutup dengan satu kalimat syukur.",
  "Kitab Suci tidak dibaca untuk dihabiskan, tetapi untuk dihidupi.",
  "Percaya itu seperti berjalan di malam hari dengan lampu kecil: cukup untuk satu langkah berikutnya.",
  "Setiap orang yang kita temui hari ini sedang membawa beban yang tidak kita lihat. Berlembutlah.",
  "Adven, Prapaskah, Paskah: gereja mengajari kita bahwa menunggu pun punya musimnya.",
  "Kebaikan yang dilakukan diam-diam punya aroma yang sampai ke surga.",
  "Pelayanan dimulai dari hal paling dekat: orang yang duduk di sebelah kita.",
  "Kalau doa terasa kering, tetaplah datang. Kesetiaan itu sendiri sudah doa.",
  "Hari ini aku belajar lagi bahwa sabar adalah bentuk kasih yang paling praktis.",
  "Sebelum menilai orang lain, coba ucapkan satu doa untuknya.",
  "Ucapkan \"terima kasih, Tuhan\" untuk tiga hal sederhana di sekitarmu sekarang.",
  "Lagu pujian yang sama bisa terasa baru ketika hati kita sedang berbeda.",
  "Komunitas iman itu seperti api unggun: makin dekat, makin hangat.",
  "Tidak ada doa yang terlalu kecil untuk didengar Tuhan.",
  "Mazmur mengajari kita jujur kepada Tuhan, bahkan saat sedang marah atau sedih.",
  "\"Sabda-Mu pelita bagi kakiku.\" Bukan lampu sorot, tetapi cukup untuk melangkah.",
  "Pekan ini coba satu kebiasaan baru: baca satu ayat sebelum membuka ponsel.",
  "Sakramen Tobat mengingatkan: kita boleh mulai lagi, berapa kali pun.",
  "Hidup rohani itu maraton, bukan lari cepat. Pelan tidak apa-apa, asal terus berjalan.",
  "Kasih Tuhan tidak menunggu kita rapi dulu. Ia datang saat kita masih berantakan.",
  "Berhenti sejenak di jam tiga sore. Satu doa singkat tentang belas kasih Tuhan.",
  "Setiap awal bulan adalah kesempatan menaruh niat baru di tangan Tuhan.",
  "Yang membuat kita kuat bukan banyaknya jawaban, tetapi dalamnya kepercayaan.",
  "Sedikit waktu untuk Tuhan di awal hari memberi arah untuk sisa hari.",
];

export const BOT_EMAIL_DOMAIN = "ruangiman-bot.invalid";
/** Jakarta hours at which the bots post (one thought each time, if it has not happened yet today) */
export const BOT_POST_HOURS = [7, 9, 12, 15, 18, 21];

export const avatarUrlFor = (seed: string) =>
  `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(seed)}&size=400&backgroundColor=f1e3c2,e8d3a3,d9c08a,f5ead6`;
