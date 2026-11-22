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
  /** picture in /public/people (the 20 portraits made for Ruang Iman) */
  photo?: string;
};

export const BOT_PERSONAS: BotPersona[] = [
  { name: "Yohanes Damar Prasetyo", nick: "Damar", gender: "male", city: "Surabaya", bio: "Capek tapi tenang. Habis rapat paroki biasanya ngopi dulu di aula.", verse: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat.", interests: ["paroki", "kopi"], photo: "/people/damar.jpg" },
  { name: "Yohana Sitompul", nick: "Yohana", gender: "female", city: "Medan", bio: "Mahasiswi pascasarjana. Belajar tenang di tengah tenggat yang menumpuk.", verse: "Tenanglah, dan ketahuilah bahwa Akulah Allah.", interests: ["kuliah", "hening"], photo: "/people/yohana.jpg" },
  { name: "Bernardus Kleden", nick: "Bernardus", gender: "male", city: "Larantuka", bio: "Orang laut dari Flores. Percaya doa dan angin selalu punya arah.", verse: "Ia membangunkan angin ribut, dan laut pun menjadi teduh.", interests: ["laut", "prosesi"], photo: "/people/bernardus.jpg" },
  { name: "Clara Susilowati", nick: "Clara", gender: "female", city: "Jakarta", bio: "Tidak terburu-buru. Suka menyeduh teh sambil berdoa pagi.", verse: "Hati yang gembira adalah obat yang manjur.", interests: ["teh", "doa pagi"], photo: "/people/clara.jpg" },
  { name: "Yosef Yoku", nick: "Yosef", gender: "male", city: "Jayapura", bio: "Dari tepi Danau Sentani. Suka kumpul bareng anak muda sambil main gitar.", verse: "Bernyanyilah bagi Tuhan dengan segenap hatimu.", interests: ["gitar", "orang muda"], photo: "/people/yosef.jpg" },
  { name: "Maria Mandagi", nick: "Maria", gender: "female", city: "Manado", bio: "Anggota koor. Kalau ketawa, satu ruangan ikut ketawa.", verse: "Bersukacitalah senantiasa dalam Tuhan.", interests: ["koor", "musik"], photo: "/people/maria.jpg" },
  { name: "Antonius Hadinata", nick: "Antonius", gender: "male", city: "Bandung", bio: "Suka berpikir panjang soal iman, kadang sambil baca sampai larut.", verse: "Imanku dan pengertianku bertumbuh sedikit demi sedikit.", interests: ["buku", "refleksi"], photo: "/people/antonius.jpg" },
  { name: "Fransiska Kurniasih", nick: "Fransiska", gender: "female", city: "Semarang", bio: "Aktif di komunitas orang muda. Kalau cerita, tangannya ikut bicara.", verse: "Kamu adalah terang dunia.", interests: ["OMK", "diskusi"], photo: "/people/fransiska.jpg" },
  { name: "Gregorius Lembang", nick: "Gregorius", gender: "male", city: "Makassar", bio: "Pendiam, tapi selalu hadir. Pelayanan kecil tiap Minggu.", verse: "Siapa setia dalam perkara kecil, ia setia juga dalam perkara besar.", interests: ["pelayanan", "lektor"], photo: "/people/gregorius.jpg" },
  { name: "Theresia Sri Handayani", nick: "Theresia", gender: "female", city: "Yogyakarta", bio: "Praktis dan penyayang. Percaya pada doa sebelum masak dan sesudah makan.", verse: "Berilah, maka kamu akan diberi.", interests: ["masak", "keluarga"], photo: "/people/theresia.jpg" },
  { name: "Ignasius Sembiring", nick: "Ignasius", gender: "male", city: "Berastagi", bio: "Sabar dengan anak-anak misdinar. Mereka mengajarkan banyak hal.", verse: "Biarkanlah anak-anak itu datang kepada-Ku.", interests: ["misdinar", "kebun"], photo: "/people/ignasius.jpg" },
  { name: "Veronika Halim", nick: "Veronika", gender: "female", city: "Palembang", bio: "Lembut dan teratur. Rosario di meja ruang tamu tidak pernah dipindah.", verse: "Doa orang benar sangat besar kuasanya.", interests: ["rosario", "keluarga"], photo: "/people/veronika.jpg" },
  { name: "Markus Tefa", nick: "Markus", gender: "male", city: "Kupang", bio: "Guru yang sudah beruban. Masih belajar dari murid-muridnya.", verse: "Mulailah dengan Tuhan, hikmat itu permulaannya.", interests: ["mengajar", "membaca"], photo: "/people/markus.jpg" },
  { name: "Agnes Dhae", nick: "Agnes", gender: "female", city: "Denpasar", bio: "Asal Flores, tinggal di Bali. Rindu kampung tapi bersyukur di perantauan.", verse: "Aku tahu rancangan-rancangan apa yang ada pada-Ku mengenai kamu.", interests: ["perantauan", "komunitas"], photo: "/people/agnes.jpg" },
  { name: "Petrus Gebze", nick: "Petrus", gender: "male", city: "Merauke", bio: "Bangga dengan budaya Marind. Misa dengan tifa itu indah.", verse: "Segala bangsa akan datang dan sujud menyembah Engkau.", interests: ["budaya", "tifa"], photo: "/people/petrus.jpg" },
  { name: "Lidwina Pramudita", nick: "Lidwina", gender: "female", city: "Malang", bio: "Mahasiswi. Masih mencari, pelan-pelan, apa arti panggilan.", verse: "Percayalah kepada Tuhan dengan segenap hatimu.", interests: ["kuliah", "pencarian"], photo: "/people/lidwina.jpg" },
  { name: "Stefanus Gunawan", nick: "Stefanus", gender: "male", city: "Pontianak", bio: "Bermain organ di gereja saat sepi. Musik membuatnya hening.", verse: "Mazmur, kidung puji-pujian, dan nyanyian rohani.", interests: ["organ", "hening"], photo: "/people/stefanus.jpg" },
  { name: "Katarina Simorangkir", nick: "Katarina", gender: "female", city: "Balikpapan", bio: "Ramah, mudah ngobrol dengan siapa saja. Anak rantau dari Tapanuli.", verse: "Kasihilah sesamamu manusia seperti dirimu sendiri.", interests: ["keluarga", "rantau"], photo: "/people/katarina.jpg" },
  { name: "Yustinus Pramono", nick: "Yustinus", gender: "male", city: "Solo", bio: "Kerja praktis, lengan baju selalu digulung. Suka bantu-bantu di gereja.", verse: "Apa pun juga yang kamu perbuat, perbuatlah dengan segenap hatimu.", interests: ["kerja bakti", "gereja"], photo: "/people/yustinus.jpg" },
  { name: "Angela Tanjung", nick: "Angela", gender: "female", city: "Batam", bio: "Kerja shift, ke gereja pagi sebelum berangkat. Hangat dan waspada.", verse: "Ia menguatkan yang letih dan memberi kekuatan kepada yang tidak berdaya.", interests: ["kerja", "doa pagi"], photo: "/people/angela.jpg" },
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
