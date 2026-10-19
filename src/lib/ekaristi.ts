/**
 * Order of the Mass (Tata Perayaan Ekaristi) for the Ekaristi page.
 * The common texts follow the Indonesian missal; the exact wording can differ slightly by edition,
 * so the page tells people to follow the book used in their parish.
 */
export type SeasonId = "biasa" | "adven" | "natal" | "prapaskah" | "paskah" | "raya";

export type Season = {
  id: SeasonId;
  label: string;
  color: string; // liturgical colour label
  dot: string; // css colour
  gloria: boolean;
  credo: string;
  acclamation: string;
  notes: string[];
};

export const SEASONS: Season[] = [
  {
    id: "biasa", label: "Minggu Biasa", color: "Hijau", dot: "#3f8f5a", gloria: true,
    credo: "Syahadat dibacakan pada hari Minggu dan hari raya.",
    acclamation: "Alleluia",
    notes: ["Madah Kemuliaan dinyanyikan pada hari Minggu (tidak pada hari biasa).", "Hari Minggu: tiga bacaan (Bacaan I, Mazmur, Bacaan II, Injil). Hari biasa: Bacaan I, Mazmur, Injil."],
  },
  {
    id: "adven", label: "Adven", color: "Ungu (Minggu III: merah muda)", dot: "#7a4fa3", gloria: false,
    credo: "Syahadat dibacakan pada hari Minggu.",
    acclamation: "Alleluia",
    notes: ["Madah Kemuliaan tidak dinyanyikan (kecuali pada hari raya/pesta, mis. 8 Desember).", "Karangan Adven dinyalakan, satu lilin tiap pekan. Minggu Adven III (Gaudete) berwarna merah muda.", "Suasana penantian: musik dan hiasan altar sederhana."],
  },
  {
    id: "natal", label: "Natal", color: "Putih", dot: "#e8e2d0", gloria: true,
    credo: "Syahadat dibacakan; pada kata \"dijelmakan ... menjadi manusia\" umat membungkuk (pada Hari Raya Natal berlutut).",
    acclamation: "Alleluia",
    notes: ["Natal punya beberapa Misa: Malam, Fajar, dan Siang, masing-masing dengan bacaan sendiri.", "Madah Kemuliaan kembali dinyanyikan dengan meriah.", "Masa Natal berlangsung sampai Pesta Pembaptisan Tuhan."],
  },
  {
    id: "prapaskah", label: "Prapaskah", color: "Ungu (Minggu IV: merah muda)", dot: "#7a4fa3", gloria: false,
    credo: "Syahadat dibacakan pada hari Minggu.",
    acclamation: "Terpujilah Engkau, Kristus, Raja kemuliaan abadi (tanpa \"Alleluia\")",
    notes: ["Tidak ada Madah Kemuliaan dan tidak ada \"Alleluia\" (kecuali pada hari raya/pesta, mis. St. Yosef 19 Maret, Kabar Sukacita 25 Maret).", "Rabu Abu: pemberkatan dan pengenaan abu. Minggu Palma: perarakan daun palma, kisah sengsara dibacakan.", "Minggu Prapaskah IV (Laetare) boleh berwarna merah muda."],
  },
  {
    id: "paskah", label: "Paskah", color: "Putih", dot: "#e8e2d0", gloria: true,
    credo: "Pada Malam Paskah dan Minggu Paskah, pembaruan janji baptis dapat menggantikan Syahadat.",
    acclamation: "Alleluia (dengan sekuens Paskah pada Minggu Paskah)",
    notes: ["Malam Paskah: berkat api, lilin Paskah, Pujian Paskah, bacaan-bacaan, liturgi baptis, lalu Liturgi Ekaristi.", "\"Alleluia\" ditambahkan pada pengutusan selama Pekan Oktaf Paskah sampai Pentakosta.", "Masa Paskah berlangsung 50 hari sampai Hari Raya Pentakosta."],
  },
  {
    id: "raya", label: "Hari Raya / Pesta", color: "Putih atau merah", dot: "#c0392b", gloria: true,
    credo: "Syahadat dibacakan pada hari raya.",
    acclamation: "Alleluia (di luar Prapaskah)",
    notes: ["Hari raya: Madah Kemuliaan dan Syahadat dibacakan, biasanya ada tiga bacaan.", "Putih untuk Tuhan, Santa Perawan Maria, dan para kudus bukan martir; merah untuk Pentakosta, para rasul, dan martir."],
  },
];

export type Part = {
  title: string;
  what: string; // what happens
  text?: string; // common text, if any
  onlyIf?: "gloria" | "credo-sunday";
  link?: { href: string; label: string };
};
export type Group = { title: string; parts: Part[] };

export const MASS: Group[] = [
  {
    title: "Ritus Pembuka",
    parts: [
      { title: "Perarakan masuk & lagu pembuka", what: "Imam, petugas liturgi, dan umat berdiri. Perarakan masuk diiringi lagu pembuka. Imam menghormati altar dengan membungkuk dan menciumnya." },
      {
        title: "Tanda Salib & Salam",
        what: "Imam memulai dengan tanda salib, lalu menyalami umat.",
        text: "Imam: Dalam nama Bapa dan Putra dan Roh Kudus.\nUmat: Amin.\n\nImam: Tuhan beserta Anda.\nUmat: Dan beserta Anda juga.",
      },
      {
        title: "Pernyataan tobat",
        what: "Hening sejenak, lalu seluruh umat mengakui dosa dan memohon belas kasih Allah.",
        text: "Saya mengaku kepada Allah yang mahakuasa dan kepada saudara sekalian, bahwa saya telah berdosa dengan pikiran dan perkataan, dengan perbuatan dan kelalaian, saya berdosa, saya berdosa, saya sungguh berdosa. Oleh sebab itu, saya mohon kepada Santa Perawan Maria, kepada para malaikat dan orang kudus, dan kepada Saudara sekalian, supaya mendoakan saya kepada Tuhan, Allah kita.",
      },
      {
        title: "Tuhan, kasihanilah kami (Kyrie)",
        what: "Seruan singkat memohon belas kasih, biasanya dinyanyikan.",
        text: "Tuhan, kasihanilah kami.\nKristus, kasihanilah kami.\nTuhan, kasihanilah kami.",
      },
      {
        title: "Madah Kemuliaan (Gloria)",
        what: "Madah pujian kepada Allah Tritunggal. Dinyanyikan pada hari Minggu di luar Adven dan Prapaskah, hari raya, dan pesta.",
        onlyIf: "gloria",
        text: "Kemuliaan kepada Allah di surga, dan damai di bumi kepada orang yang berkenan pada-Nya.\nKami memuji Dikau, kami meluhurkan Dikau, kami menyembah Dikau, kami memuliakan Dikau, kami bersyukur kepada-Mu karena kemuliaan-Mu yang besar.\nYa Tuhan Allah, raja surgawi, Allah Bapa yang mahakuasa.\nYa Tuhan, Putra Tunggal, Yesus Kristus. Ya Tuhan Allah, Anak Domba Allah, Putra Bapa.\nEngkau yang menghapus dosa dunia, kasihanilah kami.\nEngkau yang menghapus dosa dunia, sambutlah doa kami.\nEngkau yang duduk di sisi Bapa, kasihanilah kami.\nSebab hanya Engkaulah Yang Kudus, hanya Engkaulah Tuhan, hanya Engkaulah Yang Mahatinggi, Yesus Kristus, bersama dengan Roh Kudus, dalam kemuliaan Allah Bapa. Amin.",
      },
      { title: "Doa Pembuka (Kolekta)", what: "Imam mengajak umat berdoa dalam hening sejenak, lalu mengucapkan doa pembuka yang mengumpulkan doa seluruh umat. Umat menjawab: Amin." },
    ],
  },
  {
    title: "Liturgi Sabda",
    parts: [
      { title: "Bacaan I", what: "Biasanya dari Perjanjian Lama (pada masa Paskah dari Kisah Para Rasul). Pembaca menutup: \"Demikianlah sabda Tuhan.\" Umat: \"Syukur kepada Allah.\"", link: { href: "/faith/bible/bacaan", label: "Lihat bacaan hari ini" } },
      { title: "Mazmur Tanggapan", what: "Pemazmur melagukan mazmur, umat menanggapi dengan ulangan (refren)." },
      { title: "Bacaan II", what: "Dari surat para rasul atau Kitab Wahyu. Dibacakan pada hari Minggu dan hari raya." },
      {
        title: "Bait Pengantar Injil",
        what: "Umat berdiri dan menyambut Injil dengan nyanyian.",
        text: "Alleluia, alleluia ... (pada Prapaskah: \"Terpujilah Engkau, Kristus, Raja kemuliaan abadi\")",
      },
      {
        title: "Injil",
        what: "Imam atau diakon membacakan Injil. Umat membuat tanda salib kecil di dahi, mulut, dan dada.",
        text: "Imam: Tuhan beserta Anda.\nUmat: Dan beserta Anda juga.\nImam: Inilah Injil Yesus Kristus menurut ...\nUmat: Dimuliakanlah Tuhan.\n...\nImam: Demikianlah sabda Tuhan.\nUmat: Terpujilah Kristus.",
      },
      { title: "Homili", what: "Imam menguraikan sabda Tuhan dan menerapkannya dalam hidup umat. Hening sejenak sesudahnya." },
      {
        title: "Syahadat (Aku Percaya)",
        what: "Pengakuan iman umat. Pada hari Minggu dan hari raya.",
        onlyIf: "credo-sunday",
        text: "Aku percaya akan satu Allah, Bapa yang mahakuasa, pencipta langit dan bumi, dan segala sesuatu yang kelihatan dan tak kelihatan.\nAku percaya akan satu Tuhan, Yesus Kristus, Putra Allah yang tunggal, lahir dari Bapa sebelum segala abad. Allah dari Allah, Terang dari Terang, Allah benar dari Allah benar, dilahirkan, bukan dijadikan, sehakikat dengan Bapa; segala sesuatu dijadikan oleh-Nya.\nDemi kita manusia dan demi keselamatan kita, Ia turun dari surga, dan dijelmakan oleh Roh Kudus dari Perawan Maria, dan menjadi manusia.\nIa pun disalibkan untuk kita, waktu Pontius Pilatus; Ia wafat sengsara dan dimakamkan. Pada hari ketiga Ia bangkit menurut Kitab Suci. Ia naik ke surga, duduk di sisi Bapa. Ia akan kembali dengan mulia, mengadili orang yang hidup dan yang mati; kerajaan-Nya takkan berakhir.\nAku percaya akan Roh Kudus, Ia Tuhan yang menghidupkan; Ia berasal dari Bapa dan Putra, yang serta Bapa dan Putra disembah dan dimuliakan; Ia bersabda dengan perantaraan para nabi.\nAku percaya akan Gereja yang satu, kudus, katolik, dan apostolik. Aku mengakui satu pembaptisan akan penghapusan dosa. Aku menantikan kebangkitan orang mati dan hidup di akhirat. Amin.",
      },
      { title: "Doa Umat", what: "Umat berdoa untuk Gereja, pemimpin bangsa, mereka yang menderita, dan kebutuhan jemaat. Umat menjawab setiap intensi dengan seruan doa." },
    ],
  },
  {
    title: "Liturgi Ekaristi",
    parts: [
      { title: "Persiapan persembahan", what: "Umat membawa roti dan anggur ke altar, sering bersama kolekte. Imam mempersiapkan altar dan mencampur sedikit air ke dalam anggur." },
      {
        title: "Ajakan berdoa & Doa atas Persembahan",
        what: "Imam mengajak umat mendoakan kurban, lalu membawakan doa atas persembahan.",
        text: "Imam: Berdoalah, Saudara-saudari, supaya persembahanku dan persembahanmu ini diterima oleh Allah, Bapa yang mahakuasa.\nUmat: Semoga persembahan ini diterima demi pujian dan kemuliaan nama-Nya, demi kesejahteraan kita, dan seluruh umat-Nya yang kudus.",
      },
      { title: "Prefasi", what: "Pembukaan Doa Syukur Agung berupa madah syukur yang berubah menurut masa liturgi (Adven, Natal, Prapaskah, Paskah, hari raya, dan lain-lain).", text: "Imam: Tuhan beserta Anda.\nUmat: Dan beserta Anda juga.\nImam: Angkatlah hatimu.\nUmat: Kami mengarahkannya kepada Tuhan.\nImam: Marilah bersyukur kepada Tuhan, Allah kita.\nUmat: Sudah layak dan sepantasnya." },
      {
        title: "Kudus (Sanctus)",
        what: "Seluruh umat menyanyikan madah kudus bersama para malaikat.",
        text: "Kudus, kudus, kuduslah Tuhan, Allah semesta alam.\nSurga dan bumi penuh dengan kemuliaan-Mu.\nHosana di surga.\nTerpujilah yang datang dalam nama Tuhan.\nHosana di surga.",
      },
      {
        title: "Doa Syukur Agung",
        what: "Inti perayaan: imam mendoakan epiklesis (memohon Roh Kudus), kisah institusi (roti menjadi Tubuh dan anggur menjadi Darah Kristus), anamnesis, dan permohonan bagi Gereja, yang hidup, dan yang meninggal. Ada beberapa Doa Syukur Agung (I sampai X).",
        link: { href: "/faith/prayers", label: "Teks Doa Syukur Agung I–X" },
      },
      { title: "Aklamasi anamnesis", what: "Setelah konsekrasi, umat menyatakan misteri iman.", text: "Imam: Misteri iman.\nUmat: Sebagaimana Engkau telah wafat dan bangkit, kami mewartakan Engkau, ya Tuhan, sampai Engkau datang kembali." },
      { title: "Doksologi & Amin", what: "Penutup Doa Syukur Agung. Imam mengangkat Tubuh dan Darah Kristus.", text: "Imam: Dengan perantaraan Kristus, bersama Kristus, dan dalam Kristus, bagi-Mu, Allah Bapa yang mahakuasa, dalam persekutuan Roh Kudus, segala hormat dan kemuliaan, sepanjang segala masa.\nUmat: Amin." },
      {
        title: "Bapa Kami",
        what: "Doa Tuhan, didoakan atau dinyanyikan seluruh umat.",
        text: "Bapa kami yang ada di surga, dimuliakanlah nama-Mu, datanglah kerajaan-Mu, jadilah kehendak-Mu di atas bumi seperti di dalam surga.\nBerilah kami rezeki pada hari ini, dan ampunilah kesalahan kami, seperti kami pun mengampuni yang bersalah kepada kami; dan janganlah masukkan kami ke dalam pencobaan, tetapi bebaskanlah kami dari yang jahat.\n\nImam: Ya Tuhan, bebaskanlah kami dari segala yang jahat ...\nUmat: Sebab Engkaulah yang empunya kerajaan dan kuasa dan kemuliaan, kini dan sepanjang masa.",
      },
      { title: "Doa damai & Salam damai", what: "Imam mendoakan damai, lalu umat saling memberi salam damai sesuai kebiasaan setempat.", text: "Imam: Damai Tuhan bersamamu selalu.\nUmat: Dan bersama rohmu." },
      {
        title: "Anak Domba Allah (Agnus Dei) & Komuni",
        what: "Selama pemecahan roti, umat menyanyikan Anak Domba Allah. Imam mengundang umat menyambut komuni, dan umat menjawab.",
        text: "Anak Domba Allah, yang menghapus dosa dunia, kasihanilah kami.\nAnak Domba Allah, yang menghapus dosa dunia, kasihanilah kami.\nAnak Domba Allah, yang menghapus dosa dunia, berilah kami damai.\n\nImam: Inilah Anak Domba Allah, yang menghapus dosa dunia. Berbahagialah kita yang diundang ke perjamuan-Nya.\nUmat: Ya Tuhan, saya tidak pantas Tuhan datang kepada saya, tetapi bersabdalah saja, maka saya akan sembuh.\n\nImam: Tubuh Kristus.\nUmat: Amin.",
      },
      { title: "Doa sesudah komuni", what: "Hening syukur sesudah komuni, lalu imam membawakan doa sesudah komuni. Umat menjawab: Amin." },
    ],
  },
  {
    title: "Ritus Penutup",
    parts: [
      { title: "Pengumuman", what: "Pengumuman singkat bagi umat." },
      {
        title: "Berkat",
        what: "Imam memberkati umat. Pada hari raya dapat dipakai berkat meriah.",
        text: "Imam: Tuhan beserta Anda.\nUmat: Dan beserta Anda juga.\nImam: Semoga Anda sekalian diberkati oleh Allah yang mahakuasa, Bapa dan Putra + dan Roh Kudus.\nUmat: Amin.",
      },
      {
        title: "Pengutusan",
        what: "Imam atau diakon mengutus umat, lalu perarakan keluar.",
        text: "Imam: Perayaan Ekaristi sudah selesai. Marilah pergi dalam damai.\nUmat: Syukur kepada Allah.\n\n(Masa Paskah: \"... dalam damai, alleluia, alleluia.\" Umat: \"Syukur kepada Allah, alleluia, alleluia.\")",
      },
    ],
  },
];

/** Pick the liturgical season from the name of today's celebration (as written on the Indonesian calendar). */
export function seasonFromCelebration(name: string | null | undefined): SeasonId {
  const n = (name ?? "").toLowerCase();
  if (/adven/.test(n)) return "adven";
  if (/prapaskah|rabu abu|palma/.test(n)) return "prapaskah";
  if (/natal|epifani|pembaptisan tuhan/.test(n)) return "natal";
  if (/paskah|pentakosta|kenaikan/.test(n)) return "paskah";
  if (/hari raya|pesta|peringatan wajib|santo|santa/.test(n) && !/minggu biasa/.test(n)) return "raya";
  return "biasa";
}
