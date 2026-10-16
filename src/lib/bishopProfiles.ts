// Bishop profiles for the Catholic Indonesia "Uskup" pages.
// Text: excerpts from Indonesian Wikipedia (CC BY-SA 4.0); photos: Wikimedia (free licences, credited in the UI).
// Generated 2026-10-16 — facts may change; admins can correct names in the app.

export type BishopPhoto = { url: string; license: string; credit: string; pageUrl: string };
export type BishopProfile = {
  name: string;
  born: string | null;
  birthPlace: string | null;
  priest: string | null;     // priestly ordination
  bishop: string | null;     // episcopal consecration
  motto: string | null;
  story: string;
  source: { title: string; url: string };
  photo: BishopPhoto | null;
};

export const BISHOP_PROFILES: Record<string, BishopProfile> = {
  "Kornelius Sipayung": {
    "name": "Kornelius Sipayung",
    "born": "26 Agustus 1970",
    "birthPlace": "Bandar Hinalang, Hinalang, Purba, Simalungun, Sumatera Utara",
    "priest": "11 Desember 1999",
    "bishop": "2 Februari 2019",
    "motto": "Deus Meus Et Omnia (Allahku dan Segalaku)",
    "story": "Kornelius Sipayung,  (lahir 26 Agustus 1970) adalah Uskup Agung Medan yang terpilih pada 8 Desember 2018 menggantikan Mgr. Anicetus Bongsu Antonius Sinaga, O.F.M. Cap. Sebelum mengampu jabatan sebagai Uskup, Kornelius merupakan Minister Provinsial Kapusin Medan.\n\nKornelius menjalani masa novisiat di Biara Kapusin Pematang Siantar dan menjalani pendidikan di Seminari Menengah Christus Sacerdos, Pematang Siantar. Ia menempuh studi lanjut di Sekolah Tinggi Filsafat dan Teologi (STFT) Santo Yohanes, Pematang Siantar. Pada 22 Agustus 1998, ia mengucapkan kaul kekalnya sebagai anggota Ordo Kapusin dalam Provinsi Medan.\n\nKornelius menerima Sakramen Imamat pada tanggal 11 Desember 1999 oleh Uskup Agung Medan, Mgr. Pius Datubara, O.F.M. Cap. Ia menerima penugasan perdana di Paroki Santa Perawan Maria diangkat ke Surga, Kabanjahe, Kabupaten Karo.\nPada tahun 2002, ia ditugaskan untuk kembali menjalani studi dalam bidang teologi dogmatik di Universitas Kepausan Gregoriana, Roma dan juga mengikuti pelatihan bahasa Inggris di Brisbane, Australia. Sekembalinya ke Indonesia tahun 2005, ia menjadi formator di Seminari Tinggi Kapusin Pematang Siantar dan dosen dalam bidang...",
    "source": {
      "title": "Kornelius Sipayung",
      "url": "https://id.wikipedia.org/wiki/Kornelius_Sipayung"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Uskup_Cornelius_Sipayung.jpg/330px-Uskup_Cornelius_Sipayung.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Halomoan Nasution",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Uskup_Cornelius_Sipayung.jpg"
    }
  },
  "Fransiskus Tuaman Sinaga": {
    "name": "Fransiskus Tuaman Sasfo Sinaga",
    "born": "22 November 1972",
    "birthPlace": "Penggalangan, Tebing Syahbandar, Serdang Bedagai, Sumatera Utara",
    "priest": "14 Februari 2003",
    "bishop": "29 Juli 2021",
    "motto": "\"Lauderis Domine Deus Meus\" (Semoga Engkau dipuji, ya Tuhanku dan Allahku)|signature =|coat_of_arms = Coat of arms bishop fransiskus sinaga.png",
    "story": "Mgr. Fransiskus Tuaman Sasfo Sinaga (lahir 22 November 1972) adalah Uskup Sibolga yang ditunjuk pada 6 Maret 2021 dan ditahbiskan menjadi Uskup pada 29 Juli 2021. Mgr. Fransiskus merupakan Uskup Sibolga yang ketiga, melanjutkan kepemimpinan Mgr. Ludovicus Simanullang, O.F.M. Cap. Sekaligus ia menjadi uskup pertama di Keuskupan Sibolga yang ditahbiskan dari kalangan imam diosesan. Sebelum menjadi Uskup Sibolga, Mgr. Fransiskus merupakan Rektor Sekolah Tinggi Pastoral (STP) Dian Mandala, Gunungsitoli. Ia ditahbiskan menjadi Uskup Sibolga pada 29 Juli 2021.\n\nFransiskus merupakan anak ketujuh dari sepuluh anak pasangan Gultom Sinaga dan Remsina Simbolon. Ia kemudian menempuh pendidikan dasar dan menengah di Tebing Tinggi, sejak tahun 1980 hingga tahun 1992. Ia kemudian memasuki Seminari Menengah Christus Sacerdos di Pematangsiantar. Ia menjalani Tahun Orientasi Rohani di Sinaksak, sebelum memasuki pendidikan filsafat di Sekolah Tinggi Filsafat dan Teologi (STFT) Santo Yohanes, Pematangsiantar, sejak tahun 1994 hingga 1999. Ia menjalani Tahun Orientasi Pastoral di Paroki Salib Suci, Sirombu, yang disusul dengan pendidikan teologi di STFT Pematangsiantar.\nSinaga menerima...",
    "source": {
      "title": "Fransiskus Tuaman Sinaga",
      "url": "https://id.wikipedia.org/wiki/Fransiskus_Tuaman_Sinaga"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Bishop_Fransiskus_T._S._Sinaga.jpg/330px-Bishop_Fransiskus_T._S._Sinaga.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Studio",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Bishop_Fransiskus_T._S._Sinaga.jpg"
    }
  },
  "Vitus Rubianto Solichin": {
    "name": "Vitus Rubianto Solichin",
    "born": "15 November 1968",
    "birthPlace": "Semarang, Jawa Tengah",
    "priest": "7 Juli 1997",
    "bishop": "7 Oktober 2021",
    "motto": "Misericordia Motus (Tergeraklah hati-Nya oleh belas kasihan)",
    "story": "Vitus Rubianto Solichin,  (lahir 15 November 1968) adalah Uskup Padang yang ditunjuk pada 3 Juli 2021. Ia merupakan Uskup Padang yang ketiga, melanjutkan kepemimpinan Mgr. Martinus Dogma Situmorang, O.F.M. Cap. Sebelum menjadi Uskup Padang, ia merupakan Dosen Kitab Suci di Sekolah Tinggi Filsafat Driyarkara, Jakarta. Ia ditahbiskan menjadi Uskup Keuskupan Padang pada hari Kamis, 7 Oktober 2021.\n\nVitus menyelesaikan pendidikan seminari di Seminari Petrus Kanisius Mertoyudan dan kemudian bergabung ke Serikat Xaverian. Ia lulus studi filsafat dari Sekolah Tinggi Filsafat Driyarkara, Jakarta dan studi teologi di Fakultas Teologi Kepausan Wedabhakti, Universitas Sanata Dharma, Yogyakarta.\nTahun 1988, Mgr Vitus masuk novisiat Serikat Xaverian di Jakarta bersama 11 pemuda dari berbagai pulau, suku, etnis, dan Seminari di Indonesia. Dari 12 calon Serikat Xaverian itu, yang sampai tahbisan Imam hanya dia seorang diri.\nPada 9 Juli 1989, ia mengucapkan kaul pertama di Gereja Paroki Santo Bonaventura Pulomas Jakarta Timur. Kemudian, ia menjalani pendidikan Skolastikat Filsafat di Sekolah Tinggi Filsafat (STF) Jakarta. Tahun 1993, ia menjalani masa Tahun Orientasi Misioner (TOM)...",
    "source": {
      "title": "Vitus Rubianto Solichin",
      "url": "https://id.wikipedia.org/wiki/Vitus_Rubianto_Solichin"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mgr._Vitus_Rubianto_Solichin%2C_S.X._%28cropped%29.jpg/330px-Mgr._Vitus_Rubianto_Solichin%2C_S.X._%28cropped%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Lordship888",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr._Vitus_Rubianto_Solichin,_S.X._(cropped).jpg"
    }
  },
  "Yohanes Harun Yuwono": {
    "name": "Yohanes Harun Yuwono",
    "born": "4 Juli 1964",
    "birthPlace": "Wates, Way Ratai, Pesawaran, Lampung, Indonesia",
    "priest": "8 Desember 1992",
    "bishop": "10 Oktober 2013",
    "motto": "\"Deus Caritas Est'\" (1 Yoh 4:16) (Allah adalah Kasih)",
    "story": "Yohanes Harun Yuwono (lahir 4 Juli 1964) adalah Uskup Agung Gereja Katolik Roma untuk Keuskupan Agung Palembang. Mgr. Yohanes Harun Yuwono kerap disapa dengan panggilan Mgr. Yu. Sebelum menjadi Uskup Agung di Keuskupan Agung Palembang, Mgr. Yu terlebih dahulu menjadi Uskup di Keuskupan Tanjungkarang dari tahun 2013 hingga 2021. Pasca wafatnya Mgr. Hilarius Moa Nurak, S.V.D., Mgr. Yuwono ditugaskan menjadi Administrator Apostolik Keuskupan Pangkalpinang dari 7 Mei 2016 hingga terpilihnya Mgr. Adrianus Sunarko, O.F.M. sebagai Uskup Keuskupan Pangkalpinang yang baru pada 28 Juni 2017. Pada 3 Juli 2021, Mgr. Yu resmi ditunjuk sebagai Uskup Agung Palembang, menggantikan Mgr. Aloysius Sudarso, S.C.J.\n\nSetelah menyelesaikan formasi sebagai calon imam, Mgr. Yuwono menerima tahbisan sebagai imam untuk Keuskupan Pangkal Pinang pada 8 Desember 1992 di Paroki Santo Yusuf dan bertugas di sana hingga tahun 1993.\nPada tahun 1993–1994, Mgr. Yuwono menjadi pastor rekan di Paroki Santa Perawan Maria Pengantara Segala Rahmat, Sungai Liat dalam Keuskupan Pangkal Pinang dan menjadi penanggungjawab Paroki Muntok. Pada tahun 1994 hingga 1998, ia menjalani studi licenciate Islamologi...",
    "source": {
      "title": "Yohanes Harun Yuwono",
      "url": "https://id.wikipedia.org/wiki/Yohanes_Harun_Yuwono"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Mgr_Yohanes_Harun_Yuwono_%282%29.jpg/330px-Mgr_Yohanes_Harun_Yuwono_%282%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Yohanes_Harun_Yuwono_(2).jpg"
    }
  },
  "Adrianus Sunarko": {
    "name": "Adrianus Sunarko",
    "born": "7 Desember 1966",
    "birthPlace": "Merauke, Papua",
    "priest": "8 Juli 1995",
    "bishop": "23 September 2017",
    "motto": "Lætentur insulæ multæ (Biarlah banyak pulau bersukacita)",
    "story": "Adrianus Sunarko,  (lahir 7 Desember 1966) adalah Uskup Pangkal Pinang sejak terpilih pada 28 Juni 2017 menggantikan Mgr. Hilarius Moa Nurak, S.V.D. dan juga menjabat sebagai Sekretaris Jenderal Konferensi Waligereja Indonesia (KWI).\n\nSunarko dilahirkan dari keluarga beretnis Jawa yang berasal dari Sedayu, Bantul, Daerah Istimewa Yogyakarta. Ayahnya, Sumedi, merupakan pendiri dan mantan Kepala Sekolah SMA Pangudi Luhur Sedayu. Ibunya, Suminah, sejak kecil membiasakan agar anak-anaknya mengikuti misa setiap hari. Masa kecil Sunarko dijalankan di tempat kelahirannya, Merauke, Papua, sehingga ia kurang fasih berbahasa Jawa.\nIa memiliki seorang kakak yang juga menjadi imam, yakni R.D. Laurentius Sutadi, Vikaris Jenderal Keuskupan Ketapang.\n\nSunarko menjalani pendidikan di Seminari Menengah Santo Petrus Kanisius, Mertoyudan, Magelang, sejak tahun 1982. Setelah menyelesaikan studi di Seminari Mertoyudan, ia diterima sebagai anggota Fransiskan dan menjalani masa novisiat. Sunarko menjalani studi filsafat di STF Driyarkara, Jakarta.\nIa kembali melanjutkan studi teologi di Fakultas Kepausan Teologi Wedabhakti, Universitas Sanata Dharma, setelah...",
    "source": {
      "title": "Adrianus Sunarko",
      "url": "https://id.wikipedia.org/wiki/Adrianus_Sunarko"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mgr_Adrianus_Sunarko_Portrait.jpg/330px-Mgr_Adrianus_Sunarko_Portrait.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "FelixJL111",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Adrianus_Sunarko_Portrait.jpg"
    }
  },
  "Vinsensius Setiawan Triatmojo": {
    "name": "Vinsensius Setiawan Triatmojo",
    "born": "5 April 1971",
    "birthPlace": "Sindang Jati, Sindang Kelingi, Rejang Lebong, Bengkulu",
    "priest": "25 Januari 2000",
    "bishop": "1 Mei 2023",
    "motto": "In Verbo Tuo Laxabo Rete (Tapi karena Sabda-Mu, kutebarkan jala juga)",
    "story": "Vinsensius Setiawan Triatmojo (lahir 5 April 1971) adalah Uskup Tanjungkarang dari Gereja Katolik Roma yang ditunjuk oleh Paus Fransiskus pada 17 Desember 2022. Ia merupakan Uskup Tanjungkarang yang keempat, melanjutkan kepemimpinan Mgr. Yohanes Harun Yuwono. Ia merupakan anak ketiga dari 9 bersaudara berasal dari keluarga campuran Pakem Sleman, Yogyakarta dan Malang, Jawa Timur. Ia juga kerap disapa Mgr. Avien.\nSesudah Lulus Seminari Menengah Santo Paulus Palembang, ia menyelesaikan studi Teologi dan Filsafat di Seminari Tinggi Antar-Keuskupan, Pematang Siantar, Sumatera Utara. Ia ditahbiskan menjadi Imam Keuskupan Agung Palembang pada 25 Januari 2000.\n\nSebagai imam di Keuskupan Agung Palembang, Mgr. Avien mengawali karyanya menjadi pastor rekan di Gereja Trinitas, Paroki Bangunsari dari tahun 2000 hingga tahun 2001. Tak lama, ia menjadi Pastor Kepala di Gereja Santo Paulus, Paroki Plaju, Sumatera Selatan selama kurang lebih lima tahun, dari tahun 2001 hingga 2006. Mgr. Avien juga menjadi salah satu tokoh penting di Keuskupan Agung Palembang. Ia sempat mengepalai Komisi Kepemudaan Keuskupan Agung Palembang dari tahun 2003 hingga 2009, menjadi Kepala Pembela Ikatan...",
    "source": {
      "title": "Vinsensius Setiawan Triatmojo",
      "url": "https://id.wikipedia.org/wiki/Vinsensius_Setiawan_Triatmojo"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mgr._Avien.jpg/330px-Mgr._Avien.jpg",
      "license": "CC BY 4.0",
      "credit": "Komsos Tanjungkarang",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr._Avien.jpg"
    }
  },
  "Ignatius Suharyo": {
    "name": "Ignatius Suharyo",
    "born": "9 Juli 1950",
    "birthPlace": "Sedayu, Bantul, Daerah Istimewa Yogyakarta, Indonesia",
    "priest": "26 Januari 1976",
    "bishop": "22 Agustus 1997",
    "motto": "Serviens Domino Cum Omni Humilitate (Aku Melayani Tuhan dengan Segala Rendah Hati)",
    "story": "Ignatius Suharyo Hardjoatmodjo (lahir 9 Juli 1950) adalah seorang prelat gerejawi Indonesia dari Gereja Katolik, yang telah menjabat sebagai Uskup Agung Jakarta sejak 29 Juni 2010, menggantikan Kardinal Julius Darmaatmadja, S.J. Sebelum menduduki jabatan ini, Uskup Agung Suharyo adalah Uskup Koajutor Keuskupan Agung Jakarta. Saat ini ia juga menjabat sebagai Ordinaris Militer Indonesia. Sebelumnya, ia menjabat sebagai Uskup Agung Semarang dari tahun 1997 hingga 2009. Ia juga disebut dengan nama Uskup Agung Suharyo.\nSejak 15 November 2012, Suharyo menjabat sebagai Ketua Konferensi Waligereja Indonesia, menggantikan Uskup Martinus Dogma Situmorang, OFM.Cap. Pada tanggal 5 Oktober 2019, ia secara resmi diangkat oleh Paus Fransiskus sebagai kardinal untuk Gereja Katolik di Indonesia. Ia adalah satu-satunya kardinal Indonesia yang berpartisipasi sebagai kardinal elektor dalam Konklaf 2025 setelah kematian Paus Fransiskus, yang akhirnya memilih Paus Leo XIV.\n\nIgnatius Suharyo Hardjoatmodjo lahir pada tanggal 9 Juli 1950 di Sedayu, Bantul, Yogyakarta, Indonesia. Ayahnya bernama Florentinus Amir Hardjodisastra, pegawai Dinas Pengairan Daerah Istimewa Yogyakarta...",
    "source": {
      "title": "Ignatius Suharyo",
      "url": "https://id.wikipedia.org/wiki/Ignatius_Suharyo"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/%2BIgnatius_Kardinal_Suharyo_%28cropped%29.jpg/330px-%2BIgnatius_Kardinal_Suharyo_%28cropped%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Keuskupan Agung Jakarta",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:%2BIgnatius_Kardinal_Suharyo_(cropped).jpg"
    }
  },
  "Antonius Subianto Bunjamin": {
    "name": "Antonius Subianto Bunjamin",
    "born": "14 Februari 1968",
    "birthPlace": "Bandung, Jawa Barat, Indonesia",
    "priest": "26 Juni 1996 |ordinated_by = Alexander Djajasiswaja",
    "bishop": "25 Agustus 2014 |consecrated_by = Ignatius Suharyo",
    "motto": "\"Ut Diligatis Invicem\" |signature =|coat_of_arms = Lambang Mgr. Antonius Subianto Bunjamin, OSC.png",
    "story": "Antonius Subianto Bunjamin,  (lahir 14 Februari 1968) adalah Uskup Keuskupan Bandung, melanjutkan kepemimpinan Mgr. Johannes Pujasumarta yang ditunjuk sebagai Uskup Agung Semarang dan kekosongan tahta diisi oleh Administrator Apostolik Mgr. Ignatius Suharyo. Ia terpilih menjadi Uskup Bandung pada 3 Juni 2014, dan ditahbiskan menjadi Uskup pada 25 Agustus 2014.\n\nMgr. Bunjamin lahir di Kota Bandung, Jawa Barat, pada tanggal 14 Februari 1968. Pada masa kecilnya ia mendapat julukan beké, suatu kata berbahasa Sunda yang berarti pendek, karena postur tubuhnya yang lebih kecil daripada teman-temannya. Ia besar di Gereja Santa Odilia - Paroki Cicadas yang juga masuk dalam wilayah Keuskupan Bandung. Ia sempat menjadi anggota misdinar dan Legio Maria di paroki tersebut. Lukas\n\nMgr. Anton mulai menjalani studinya di Seminari Menengah Santo Petrus Kanisius, Mertoyudan, Magelang, Jawa Tengah pada tahun 1984. Ia memilih moto yang menjadi penyemangat panggilannya, Ubi Ego Sum Ibi Deo Servio (Di Mana pun Saya Berada, Saya Akan Mengabdi Tuhan). Ia sempat juga menjadi bidel angkatan dan bidel umum (sejenis Ketua OSIS) di sana periode Juli 1986 sampai dengan...",
    "source": {
      "title": "Antonius Subianto Bunjamin",
      "url": "https://id.wikipedia.org/wiki/Antonius_Subianto_Bunjamin"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Mgr_Antonius_Subianto_Bunjamin%2C_OSC.jpg/330px-Mgr_Antonius_Subianto_Bunjamin%2C_OSC.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Ignasius Christopher A",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Antonius_Subianto_Bunjamin,_OSC.jpg"
    }
  },
  "Robertus Rubiyatmoko": {
    "name": "Robertus Rubiyatmoko",
    "born": "10 Oktober 1963",
    "birthPlace": "Sleman, Daerah Istimewa Yogyakarta|death_date=|death_place=|buried=|nationality=Indonesia|religion=Katolik Roma|residence=Keuskupan Agung Semarang",
    "priest": "12 Agustus 1992",
    "bishop": "19 Mei 2017",
    "motto": "Quaerere et Salvum Facere |signature=",
    "story": "Robertus Rubiyatmoko (lahir 10 Oktober 1963) adalah Uskup Agung di Keuskupan Agung Semarang. Ia ditahbiskan menjadi Imam pada tanggal 12 Agustus 1992 dengan penahbis Mgr. Julius Darmaatmadja, S.J. dan terpilih menjadi Uskup Agung di Keuskupan Agung Semarang pada tanggal 18 Maret 2017 oleh Paus Fransiskus.\n\nRomo Ruby, panggilan dari Robertus Rubiyatmoko, mengawali pendidikan imamatnya di Seminari Menengah Santo Petrus Kanisius Mertoyudan, Magelang. Usai menyelesaikan pendidikan tahun rohani sebagai calon frater diosesan KAS di Seminari Tahun Rohani Keuskupan Agung Semarang di Wisma Jangli Semarang tahun 1984–1985, ia melanjutkan pendidikan belajar filsafat dan teologi di Fakultas Wedabhakti Universitas Sanata Dharma Yogyakarta dan tinggal di Seminari Tinggi Santo Paulus Kentungan Yogyakarta. Ia ditahbiskan menjadi imam tanggal 12 Agustus 1992.\nSemasa menjadi Imam, Romo Ruby sempat bertugas di Paroki Santa Maria Assumta Pakem pada tahun 1992 hingga 1993. Ia lalu ditugaskan oleh Uskup Agung Keuskupan Agung Semarang waktu itu yakni Mgr. Julius Darmaatmadja, SJ untuk belajar Hukum Gereja di Roma, Italia. Romo Ruby memperoleh gelar Doktor...",
    "source": {
      "title": "Robertus Rubiyatmoko",
      "url": "https://id.wikipedia.org/wiki/Robertus_Rubiyatmoko"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mgr_Robertus_Rubiyatmoko.jpg/330px-Mgr_Robertus_Rubiyatmoko.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Robertus_Rubiyatmoko.jpg"
    }
  },
  "Christophorus Tri Harsono": {
    "name": "Christophorus Tri Harsono",
    "born": "18 Januari 1966",
    "birthPlace": "Bogor, Jawa Barat",
    "priest": "5 Februari 1995",
    "bishop": "16 Oktober 2018",
    "motto": "Fiat mihi secundum verbum Tuum (Terjadilah padaku menurut perkataan-Mu)",
    "story": "Christophorus Tri Harsono (lahir 18 Januari 1966) adalah Uskup Purwokerto sejak terpilih pada 14 Juli 2018 menggantikan Julianus Kema Sunarka, S.J.\nPada 19 Januari 2026, Takhta Suci menunjuk Tri Harsono sebagai Administrator Apostolik Keuskupan Bogor setelah menerima pengunduran diri Paskalis Bruno Syukur, O.F.M.\n\nMgr. Tri Harsono dilahirkan dari ayah yang merupakan seorang anggota Korps Pasukan Khas TNI Angkatan Udara. Ia kemudian tinggal dan dibesarkan di Kompleks Pangkalan Udara Atang Senjaya di daerah Semplak, Bogor Barat, Bogor.\n\nHarsono menjalani pendidikan di Seminari Menengah Stella Maris, Bogor selama empat tahun, kemudian melanjutkannya ke Seminari Tinggi Santo Petrus dan Paulus di Buah Batu, Bandung. Ia lalu melaksanakan studi filsafat dan teologi di Universitas Katolik Parahyangan di Bandung. Ia ditahbiskan menjadi diakon oleh Bapak Uskup Leo Soekoto, S.J. dan ditahbiskan menjadi imam diosesan Keuskupan Bogor pada hari Minggu, 5 Februari 1995 oleh Uskup Bogor, Mgr. Cosmas Michael Angkur, O.F.M. Bersama dengan Harsono, turut ditahbiskan pula R.D. Marcus Santoso dan R.D. Stanislaus Kostka Pujiantoro. Penahbisan berlangsung di...",
    "source": {
      "title": "Christophorus Tri Harsono",
      "url": "https://id.wikipedia.org/wiki/Christophorus_Tri_Harsono"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mgr_Christophorus_Tri_Harsono.jpg/330px-Mgr_Christophorus_Tri_Harsono.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Christophorus_Tri_Harsono.jpg"
    }
  },
  "Henricus Pidyarto Gunawan": {
    "name": "Henricus Pidyarto Gunawan",
    "born": "13 Juli 1955",
    "birthPlace": "Malang, Jawa Timur",
    "priest": "7 Februari 1982",
    "bishop": "3 September 2016",
    "motto": "\"Fideliter Praedicare Evangelium Christi\" (Dengan Setia Mewartakan Injil Kristus)",
    "story": "Henricus Pidyarto Gunawan,  (lahir 13 Juli 1955) adalah teolog Kitab Suci dan merupakan Uskup Gereja Katolik Roma untuk Keuskupan Malang yang terpilih pada 28 Juni 2016.\n\nMgr. Pid mengucapkan kaul pertamanya sehingga menjadi Novis Ordo Karmelit Indonesia pada 15 Januari 1976. Ia resmi menjadi anggota Ordo Karmelit dengan mengucapkan kaul kekal pada 18 Januari 1981. Pada tahun 1982, ia menyelesaikan studi filsafat dan teologi di Sekolah Tinggi Filsafat dan Teologi (STFT) Widya Sasana, Malang, Jawa Timur. Pada hari Minggu, 7 Februari 1982, ia ditahbiskan menjadi Imam di Gereja Katedral Malang oleh Mgr. Fransiscus Xaverius Sudartanta Hadisumarta, O.Carm. Ia ditahbiskan bersama beberapa imam lainnya, termasuk kakaknya R.P. Anton Gunawan, O.Carm. dan R.P. Willy Malim Batuah, CDD.\nIa kemudian melanjutkan studi magister S2 dalam bidang Kitab Suci di Institut Kitab Suci Kepausan, Roma dan lulus pada tahun 1986. Pada tahun 1990, ia menyelesaikan program doktoral Teologi Biblis di Universitas Kepausan Santo Thomas Aquinas, Roma.\nIa mendapat gelar Profesor bidang Kitab Suci Perjanjian Baru pada 14 Maret 2007, pada upacara yang berlangsung di Aula...",
    "source": {
      "title": "Henricus Pidyarto Gunawan",
      "url": "https://id.wikipedia.org/wiki/Henricus_Pidyarto_Gunawan"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Henricus_Pidyarto_Gunawan_in_Malang_Cathedral.jpg/330px-Henricus_Pidyarto_Gunawan_in_Malang_Cathedral.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Diptya",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Henricus_Pidyarto_Gunawan_in_Malang_Cathedral.jpg"
    }
  },
  "Agustinus Tri Budi Utomo": {
    "name": "Agustinus Tri Budi Utomo",
    "born": "12 April 1968",
    "birthPlace": "Pandansari, Sine, Ngawi, Jawa Timur, Indonesia",
    "priest": "27 Agustus 1996",
    "bishop": "22 Januari 2025",
    "motto": "Diligere sicut Christus dilexit (Mencintai seperti Kristus Mencintai)",
    "story": "Agustinus Tri Budi Utomo (lahir 12 April 1968) adalah seorang imam Katolik Indonesia. Pada 29 Oktober 2024, ia terpilih menjadi Uskup Surabaya. Sebelum menduduki jabatan ini, Bapak Uskup Didik adalah Vikaris Pastoral Keuskupan Surabaya. Ia juga pernah menjabat sebagai Vikaris Jenderal dalam keuskupan yang sama.\n\nTri Budi Utomo yang sering disebut dengan nama Didik berasal dari latar belakang keluarga beragama Islam. Ia juga menjalani pendidikan di SMAK Santo Louis, Madiun. Ia kemudian menjalani pendidikan di Seminari Menengah Santo Vincentius a Paulo, Garum pada periode 1987–1988. Dalam seleksi memasuki Seminari Garum, ia diwawancarai oleh Rektor Seminari Garum, R.D. Vincentius Sutikno Wisaksono, yang kelak menjadi Uskup Surabaya. Didik kemudian melanjutkan pendidikan di Seminari Tinggi Interdiosesan San Giovanni XXIII Malang sejak tahun 1989 hingga 1996. Ia lulus program sarjana dari Sekolah Tinggi Filsafat Teologi Widya Sasana pada tahun 1994 dan lulus program magister pada tahun 1996.\n\n Didik ditahbiskan menjadi Diakon pada 15 Februari 1996 oleh Mgr Herman Joseph Sahadat Pandoyoputro, O.Carm dan ditahbiskan menjadi imam diosesan...",
    "source": {
      "title": "Agustinus Tri Budi Utomo",
      "url": "https://id.wikipedia.org/wiki/Agustinus_Tri_Budi_Utomo"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mgr_Agustinus_Tri_Budi_Utomo_2024_%282%29.jpg/330px-Mgr_Agustinus_Tri_Budi_Utomo_2024_%282%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Agustinus_Tri_Budi_Utomo_2024_(2).jpg"
    }
  },
  "Pius Riana Prapdi": {
    "name": "Pius Riana Prapdi",
    "born": "5 Mei 1967",
    "birthPlace": "Paniai, Papua Tengah",
    "priest": "8 Juli 1995",
    "bishop": "9 September 2012",
    "motto": "\"Serviens in Caritate\" (Pelayanan dalam kasih)",
    "story": "Mgr. Pius Riana Prapdi (lahir 5 Mei 1967) adalah Uskup Keuskupan Ketapang dan merupakan imam diosesan.\n\nMeskipun lahir di Kabupaten Paniai, Papua Tengah, hingga masa remajanya, Prapdi besar di Nandan, Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta.\nIa masuk Seminari Menengah Santo Petrus Kanisius, Mertoyudan, Kabupaten Magelang, Jawa Tengah pada tahun 1983. Tamat dari Seminari Menengah pada 1987, ia menjalani pendidikan sebagai imam di Keuskupan Agung Semarang, dan ditahbiskan pada 8 Juli 1995.\nMgr. Riana adalah Vikaris Jenderal semasa Mgr. Ignatius Suharyo menjadi Uskup Agung Semarang. Ketika Mgr. Suharyo ditunjuk menjadi Uskup Agung Koadjutor Jakarta, Mgr. Riana ditunjuk Dewan Imam menjadi Administrator Diosesan Keuskupan Agung Semarang. Uskup penerus, Mgr. Johannes Pujasumarta kembali menunjuk Pius sebagai Vikaris Jenderal Keuskupan Agung Semarang.\nPada 25 Juni 2012, Paus Benediktus XVI menunjuk Pius sebagai Uskup Keuskupan Ketapang menggantikan Mgr. Blasius Pujaraharja yang pensiun, seperti yang disampaikan oleh Nuncio Apostolik Vatikan untuk Indonesia, Mgr. Antonio Guido Filipazzi.\nMottonya sebagai uskup adalah Pelayanan dalam Kasih (Serviens in Caritate...",
    "source": {
      "title": "Pius Riana Prapdi",
      "url": "https://id.wikipedia.org/wiki/Pius_Riana_Prapdi"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Mgr_Pius_Riana_Prapdi.jpg/330px-Mgr_Pius_Riana_Prapdi.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Pius_Riana_Prapdi.jpg"
    }
  },
  "Valentinus Saeng": {
    "name": "Valentinus Saeng",
    "born": "28 Oktober 1969",
    "birthPlace": "Keramuk, Sekadau, Kalimantan Barat, Indonesia",
    "priest": "26 September 1998",
    "bishop": "11 November 2022",
    "motto": "Bonum Depositum Custodi (Peliharalah Harta yang Indah)",
    "story": "Valentinus Saeng,  (lahir 28 Oktober 1969) adalah Uskup Sanggau yang ditunjuk pada 18 Juni 2022. Ia merupakan Uskup Sanggau yang kedua, melanjutkan kepemimpinan Mgr. Giulio Mencuccini, C.P. Sebelum menjadi Uskup Sanggau, ia merupakan Direktur Rumah Spiritualitas Passionis di Malang, Jawa Timur sekaligus dosen Filsafat di STFT Widya Sasana Malang, Jawa Timur. Dia lahir di Desa Keramuk, Kabupaten Sekadau, Provinsi Kalimantan Barat.\n\nDia meraih gelar master filsafat di Universitas Santo Thomas Aquino (Angelicum), Roma pada tahun 2005. Kemudian belajar bahasa Jerman di Universitas Maximilian, München, Jerman. Ia meraih gelar doktor filsafat pada 2008 di Universitas Santo Thomas Aquino (Angelicum), Roma.\n\nIa meniti perjalanan studi calon imam di Seminari Menengah Santo Gabriel Passionis, Sekadau, Kalimantan Barat. Ia bergabung masuk Kongregasi Sengsara Yesus Kristus (Passionis) tahun 1989; melanjutkan studi filosofi dan teologis di Seminari Interdiosesan di Malang, Jawa Timur.\nIa mengucapkan kaul kekal di Kongregasi Passionis (CP) pada hari Kamis, 22 Agustus 1996. Ia menerima Sakramen Imamat dan ditahbiskan menjadi imam pada hari Sabtu, 26 September...",
    "source": {
      "title": "Valentinus Saeng",
      "url": "https://id.wikipedia.org/wiki/Valentinus_Saeng"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Mgr._Valentinus_Saeng%2C_CP.png/330px-Mgr._Valentinus_Saeng%2C_CP.png",
      "license": "CC BY-SA 4.0",
      "credit": "Majalah Hidup",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr._Valentinus_Saeng,_CP.png"
    }
  },
  "Samuel Oton Sidin": {
    "name": "Samuel Oton Sidin",
    "born": "12 Desember 1954",
    "birthPlace": "Peranuk, Setia Jaya, Teriak, Bengkayang, Kalimantan Barat, Indonesia",
    "priest": "1 Juli 1984",
    "bishop": "22 Maret 2017",
    "motto": "\"Non ego sed Christus in me\" (Bukan aku tetapi Kristus di dalam aku)",
    "story": "Samuel Oton Sidin,  (lahir 12 Desember 1954) adalah Uskup Keuskupan Sintang yang terpilih pada 21 Desember 2016, setelah Uskup sebelumnya Agustinus Agus terpilih menjadi Uskup Agung Pontianak. Sebelum terpilih menjadi Uskup Sintang, Sidin merupakan pastor kepala Gereja Santo Fransiskus Asisi, Paroki Tebet, Menteng Dalam.\nSejak 30 Agustus 2025, Mgr. Samuel ditunjuk sebagai Administrator Apostolik Keuskupan Agung Pontianak berkenaan dengan diterimanya surat pengunduran diri Mgr. Agustinus Agus oleh Paus Leo XIV.\n\nSamuel menjalani pendidikan dasar di Kabupaten Bengkayang, Kalimantan Barat. Ia kemudian masuk ke Seminari Menengah Santo Paulus Nyarumkop, Singkawang, Kalimantan Barat. Pada 12 Januari 1977, Samuel masuk ke dalam Novisiat Kapusin Santo Fidelis Sigmaringen di Parapat, Kabupaten Simalungun, Sumatera Utara. Satu tahun kemudian, ia mengucapkan kaul pertamanya, tepatnya pada 13 Januari 1978. Ia melanjutkan pendidikan di Seminari Tinggi Interdiosesan Santo Petrus Pematangsiantar di Sinaksak, Tapian Dolok, Simalungun, Sumatera Utara. Ia mengucapkan kaul kekal pada 18 Juli 1982, dan ditahbiskan menjadi imam di Peranuk, Bengkayang pada hari Minggu...",
    "source": {
      "title": "Samuel Oton Sidin",
      "url": "https://id.wikipedia.org/wiki/Samuel_Oton_Sidin"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Mgr_SOS_Ungu.jpg/330px-Mgr_SOS_Ungu.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Keuskupan Sintang",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_SOS_Ungu.jpg"
    }
  },
  "Yustinus Harjosusanto": {
    "name": "Yustinus Harjosusanto",
    "born": "5 September 1953",
    "birthPlace": "Srumbung, Magelang, Jawa Tengah, Indonesia",
    "priest": null,
    "bishop": "14 April 2002",
    "motto": "\"Fiat Voluntas Tua\"",
    "story": "Yustinus Tarmono Harjosusanto,  (lahir 5 September 1953) adalah Uskup Agung Samarinda. Ia ditahbiskan menjadi Imam pada tanggal 6 Januari 1982 dan terpilih menjadi Uskup Tanjung Selor pada tanggal 9 Januari 2002. Ia merupakan uskup pertama di Keuskupan Tanjung Selor sejak terbentuknya keuskupan ini yang merupakan pengembangan dari Keuskupan Agung Samarinda.\nPada tanggal 16 Februari 2015, Paus Fransiskus menunjuknya sebagai Uskup Agung Samarinda, menggantikan Mgr. Florentinus Sului Hajang Hau, M.S.F.\n\nTerlahir sebagai orang Jawa, Harjosusanto memulai karya pelayanan pastoralnya di Paroki Santo Petrus Purwosari, Surakarta. Setelah itu ia ditunjuk sebagai sekretaris Keuskupan Agung Semarang. Ketika umat Katolik di Kalimantan Utara semakin banyak dan meningkat, ia kemudian ditunjuk sebagai uskup Tanjung Selor yang pertama.\nPada hari Rabu, 9 Januari 2002, Harjosusanto ditunjuk sebagai Uskup Tanjung Selor. Ia ditahbiskan menjadi Uskup pada hari Minggu, 14 April 2002 oleh Julius Kardinal Darmaatmadja, S.J., Uskup Agung Jakarta, bersama dengan Mgr. Hieronymus Herculanus Bumbun, Uskup Agung Pontianak dan Mgr. Florentinus Sului Hajang Hau, M.S.F., Uskup Agung Samarinda.\nIa kemudian...",
    "source": {
      "title": "Yustinus Harjosusanto",
      "url": "https://id.wikipedia.org/wiki/Yustinus_Harjosusanto"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Yustinus_Harjosusanto_%282024%29.jpg/330px-Yustinus_Harjosusanto_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Yustinus_Harjosusanto_(2024).jpg"
    }
  },
  "Victorius Dwiardy": {
    "name": "Victorius Dwiardy",
    "born": "14 Desember 1968",
    "birthPlace": "Sebalos, Sango, Sanggau Ledo, Bengkayang, Kalimantan Barat",
    "priest": null,
    "bishop": null,
    "motto": "\"Ardere Et Lucere\" (Berkobar dan Bercahaya)",
    "story": "Victorius Dwiardy,  (lahir 14 Desember 1968) adalah rohaniwan Katolik Indonesia. Ia terpilih menjadi Uskup Banjarmasin pada 8 Juli 2023, menggantikan Petrus Boddeng Timang yang memasuki usia pensiun. Sebelum menjadi uskup, ia merupakan Anggota Konsili Umum Ordo Saudara Dina Kapusin di Roma, Italia.\n\nDwiardy lahir di Sebalos, Sango, Sanggau Ledo, Bengkayang, Kalimantan Barat pada tanggal 14 Desember 1968. Ia lahir dari keluarga petani dan merupakan umat dari Gereja Santo Pius X, Bengkayang. Ia pernah menjalani pendidikan di SMP Negeri Sanggau Ledo dan dilanjutkan di SMA Seminari Santo Paulus, Nyarumkop, Singkawang. Ia menjalani tahun novisiat di Parapat, Kabupaten Simalungun. Studi filsafat dan teologi dijalaninya di Sekolah Tinggi Filsafat dan Teologi (STFT) Santo Yohanes Pematangsiantar sejak tahun 1989 hingga 1998, di mana tahun 1990 hingga 1995 ia menjalani pendidikan filsafat dan tahun 1996–1998 ia menjalani studi teologi. Ia mengucapkan kaul perdana pada 2 Agustus 1990 dan kaul kekal dalam Ordo Saudara Dina Kapusin pada tanggal 23 Agustus 1997.\n\nDwiardy ditahbiskan menjadi imam pada 10 Oktober 1998 di Gereja Santo Pius X, Bengkayang...",
    "source": {
      "title": "Victorius Dwiardy",
      "url": "https://id.wikipedia.org/wiki/Victorius_Dwiardy"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mgr._Victorius_Dwiardy%2C_OFMCap_%28cropped%29.jpg/330px-Mgr._Victorius_Dwiardy%2C_OFMCap_%28cropped%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Officials of Banjarmasin Diocese",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr._Victorius_Dwiardy,_OFMCap_(cropped).jpg"
    }
  },
  "Aloysius Sutrisnaatmaka": {
    "name": "Aloysius Maryadi Sutrisnaatmaka",
    "born": "18 Mei 1953",
    "birthPlace": "Pandes, Wedi, Klaten, Jawa Tengah, Indonesia",
    "priest": "6 Januari 1981",
    "bishop": "7 Mei 2001",
    "motto": "\"Ut permanerent in gratia Dei\" (Tetap tinggal dalam Kasih Karunia Allah)",
    "story": "Aloysius Maryadi Sutrisnaatmaka,  (lahir 18 Mei 1953) adalah Uskup Keuskupan Palangkaraya.\n\nMgr. Trisna ditahbiskan menjadi imam pada hari Selasa, 6 Januari 1981 di Skolastikat MSF, Yogyakarta. Ia kemudian bertugas di Paroki Santa Theresia, Balikpapan pada tahun 1981 hingga 1982. Ia meraih gelar doktor dalam bidang misiologi dari Universitas Kepausan Gregoriana di Roma. Selama 11 tahun, sejak 1990, Mgr Trisna menjabat di Komisi Liturgi KWI sebagai Wakil Ketua, sementara juga menjadi dosen di Yogyakarta. Ia turun berperan dalam peluncuran Puji Syukur. Ia sempat ditugaskan untuk mendampingi kelompok imam-imam Balita (tahbisan Bawah Lima Tahun) MSF termasuk di Kalimantan (Samarinda, Banjarmasin, dan Palangka Raya) serta menjadi nara sumber pada perayaan Yubileum tingkat Keuskupan Palangkaraya bulan Oktober 2000.\nIa terpilih menjadi Uskup Palangkaraya pada hari Selasa, 23 Januari 2001. Ia ditahbiskan menjadi Uskup di Gereja Katedral Santa Maria Palangka Raya, pada hari Senin, 7 Mei 2001, di mana Julius Kardinal Darmaatmadja, S.J., Uskup Agung Jakarta sekaligus Uskup Ordinariat Militer Indonesia menjadi Uskup Penahbis Utama, sementara Uskup Agung Pontianak, Mgr. Hieronymus Herculanus...",
    "source": {
      "title": "Aloysius Sutrisnaatmaka",
      "url": "https://id.wikipedia.org/wiki/Aloysius_Sutrisnaatmaka"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Bishop_Sutrisnaatmaka.jpg/330px-Bishop_Sutrisnaatmaka.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Bishop_Sutrisnaatmaka.jpg"
    }
  },
  "Paulinus Yan Olla": {
    "name": "Paulinus Yan Olla",
    "born": "22 Juni 1963",
    "birthPlace": "Seoam, Sallu, Miomaffo Barat, Timor Tengah Utara, Nusa Tenggara Timur, Indonesia",
    "priest": "28 Agustus 1992",
    "bishop": "5 Mei 2018",
    "motto": "\"Servus veritatis\" (bds. ) (Pelayan kebenaran) |signature =|coat_of_arms = Lambang-Mgr-Yan-Olla-MSF.png",
    "story": "Paulinus Yan Olla,  (lahir 22 Juni 1963) adalah Uskup Keuskupan Tanjung Selor, melanjutkan kepemimpinan Mgr. Yustinus Harjosusanto, M.S.F. yang ditunjuk sebagai Uskup Agung Samarinda. Ia terpilih menjadi Uskup Tanjung Selor pada Pesta Takhta Santo Petrus, 22 Februari 2018.\n\nYan Olla lahir sebagai anak sulung dari enam bersaudara, pasangan Amatus K. Olla dan Theresia Naben. Amatus merupakan seorang guru di SD Katolik Seoam I selama 30 tahun, juga sempat menjabat sebagai Kepala Kantor Pendidikan dan Kebudayaan Kecamatan Miomaffo Barat, serta menjadi Anggota DPRD Kabupaten Timor Tengah Utara. Kelima adiknya meliputi Margaretha Olla, Regina Olla, Beatriks Olla, Ursula Maria Olla, dan Herman Yoseph Olla. Regina menjadi seorang biarawati kongregasi Puteri Reinha Rosari (PRR) dan menempuh pendidikan di Universitas Sanata Dharma Yogyakarta. Theresia meninggal dunia saat Olla menjalani pendidikan tingkat SMP tahun 1976. Sementara, Amatus meninggal dunia pada tahun 2008 akibat penyakit gula darah.\n\nYan Olla menjalani pendidikan tingkat SMP di SMP Xaverius Kota Kefamenanu sejak Januari 1976 hingga Juli 1979. Ia kemudian masuk dalam Seminari Santa Maria Immaculata...",
    "source": {
      "title": "Paulinus Yan Olla",
      "url": "https://id.wikipedia.org/wiki/Paulinus_Yan_Olla"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Paulinus_Yan_Olla_%282024%29.jpg/330px-Paulinus_Yan_Olla_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Paulinus_Yan_Olla_(2024).jpg"
    }
  },
  "Fransiskus Nipa": {
    "name": "Fransiskus Nipa",
    "born": "29 Januari 1964",
    "birthPlace": "Makale, Tana Toraja, Sulawesi Selatan, Indonesia",
    "priest": "3 Juli 1990",
    "bishop": "1 Februari 2024",
    "motto": "\"Misericordiam Volo\" (Yang Kukehendaki ialah Belas Kasihan)",
    "story": "Fransiskus Nipa (lahir 29 Januari 1964) adalah seorang rohaniwan Katolik Indonesia. Ia merupakan Uskup Agung Makassar sejak 17 Oktober 2024. Ia sebelumnya telah ditunjuk menjadi Uskup Agung Koajutor Makassar pada 21 Oktober 2023 dan ditahbiskan menjadi uskup pada 1 Februari 2024. Sebelum ditahbiskan menjadi uskup, ia merupakan Vikaris Yudisial Keuskupan Agung Makassar dan Pastor Kepala Paroki Katedral Makassar.\n\nFrans lahir di Makale, Tana Toraja pada tanggal 29 Januari 1964 dari pasangan Yakobus Duma' Nipa dan Yohana Maria Angka sebagai anak ke-4 dari 7 bersaudara. Ia menjalani pendidikan dasar di SD Katolik Mareali, Makale dan dilanjutkan di SMP Katolik Mandetek, Tana Toraja. Ia kemudian melanjutkan pendidikannya dengan memasuki Seminari Menengah Santo Petrus Claver yang ada di Kota Makassar. Ia kemudian bergabung dengan Seminari Tinggi Anging Mammiri yang ada di Yogyakarta sejak tahun 1983 hingga 1990. Pendidikan dalam bidang filsafat dan teologi dijalaninya di Fakultas Teologi Wedhabakti, Kentungan. Fransiskus Nipa ditahbiskan sebagai Diakon Diosesan Keuskupan Agung Ujung Pandang pada 24 Januari 1990 oleh Uskup Agung Semarang, Julius Darmaatmadja...",
    "source": {
      "title": "Fransiskus Nipa",
      "url": "https://id.wikipedia.org/wiki/Fransiskus_Nipa"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Fransiskus_Nipa_%282024%29.jpg/330px-Fransiskus_Nipa_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Fransiskus_Nipa_(2024).jpg"
    }
  },
  "Inno Ngutra": {
    "name": "Seno Ngutra",
    "born": "7 November 1970",
    "birthPlace": "Waur, Kei Besar, Maluku Tenggara, Maluku, Indonesia",
    "priest": "6 Oktober 2001",
    "bishop": "23 April 2022",
    "motto": "Duc in altum (Bertolak ke tempat yang dalam)",
    "story": "Mgr. Seno \"Inno\" Ngutra (lahir 7 November 1970), adalah Uskup Amboina yang ditunjuk pada 8 Desember 2021. Ia merupakan Uskup Amboina yang keempat, melanjutkan kepemimpinan Mgr. Petrus Canisius Mandagi, M.S.C. Sebelum menjadi Uskup Amboina, ia merupakan Sekretaris Keuskupan Amboina sekaligus Dosen Hukum Gereja Seminari Tinggi Santo Fransiskus Xaverius, Poka Rumah Tiga, Ambon.\n\n Media terkait Inno Ngutra di Wikimedia Commons",
    "source": {
      "title": "Inno Ngutra",
      "url": "https://id.wikipedia.org/wiki/Inno_Ngutra"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Seno_Ngutra_%28cropped%29.png/330px-Seno_Ngutra_%28cropped%29.png",
      "license": "CC BY-SA 4.0",
      "credit": "Silsurya",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Seno_Ngutra_(cropped).png"
    }
  },
  "Benedictus Estephanus Rolly Untu": {
    "name": "Benedictus Estephanus Rolly Untu",
    "born": "4 Januari 1957",
    "birthPlace": "Lembean, Kauditan, Minahasa Utara, Sulawesi Utara",
    "priest": "29 Juni 1983",
    "bishop": "8 Juli 2017",
    "motto": "\"In lumine Tuo, videmus lumen\" (Dalam terang-Mu, kami melihat cahaya)",
    "story": "Benedictus Estephanus Rolly Untu,  (lahir 4 Januari 1957) adalah Uskup Manado sejak terpilih pada 12 April 2017.\n\nRolly Untu dilahirkan dari pasangan suami-istri Gerardus Damianus Untu dan Geertruida Lasut sebagai anak ke-5 dari 12 bersaudara. Orang tua Rolly bekerja sebagai Guru SD dan tinggal di Kota Manado Selatan.\nRolly Untu menjalani pendidikan di Seminari Santo Fransiskus Xaverius di Kakaskasen untuk pendidikan setingkat SMP dan SMA. Ia kemudian diterima menjadi calon imam dalam Kongregasi MSC di Manado. Setelah menjalani masa Novisiat, ia menjalani studi filsafat dan teologi. Ia mengucapkan kaul kekal sebagai anggota MSC pada 15 Januari 1983.\nRolly Untu ditahbiskan menjadi Imam MSC pada Hari Raya Santo Petrus dan Paulus, 29 Juni 1983 oleh Mgr. Theodorus Hubertus Moors, M.S.C.\n\nSetelah ditahbiskan menjadi Imam, Rolly Untu menjabat sebagai Pastor Pembantu di Gereja Katedral Manado hingga tahun 1984, kemudian bertugas di Paroki Ratu Rosario Suci, Tuminting, sebagai Pastor Kepala. Ia kemudian ditugaskan untuk melanjutkan studi di Adhyatma Vidya Peetham (Institut Internasional Spiritualitas) di Bangalore, India pada tahun 1985 hingga...",
    "source": {
      "title": "Benedictus Estephanus Rolly Untu",
      "url": "https://id.wikipedia.org/wiki/Benedictus_Estephanus_Rolly_Untu"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Portrait_of_Benedictus_Estephanus_Rolly_Untu%2C_Bishop_of_Manado.jpg/330px-Portrait_of_Benedictus_Estephanus_Rolly_Untu%2C_Bishop_of_Manado.jpg",
      "license": "CC0",
      "credit": "Vanes23",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Portrait_of_Benedictus_Estephanus_Rolly_Untu,_Bishop_of_Manado.jpg"
    }
  },
  "Paulus Budi Kleden": {
    "name": "Paulus Budi Kleden",
    "born": "16 November 1965",
    "birthPlace": "Waibalun, Larantuka, Flores Timur, Nusa Tenggara Timur",
    "priest": null,
    "bishop": null,
    "motto": "\"Caritas Fraternitatis Maneat in Vobis\" (Peliharalah Kasih Persaudaraan)",
    "story": "Paulus Budi Kleden,  (lahir 16 November 1965) adalah uskup petahana Keuskupan Agung Ende. Ia terpilih menjadi Uskup Agung Ende pada 25 Mei 2024. Sebelum menjadi uskup, ia merupakan Superior Jenderal Serikat Sabda Allah yang ia jalani mulai tahun 2018 hingga saat ia terpilih menjadi Uskup Agung Ende. Ia ditahbiskan menjadi uskup pada 22 Agustus 2024.\n\nPaulus Budi Kleden lahir sebagai anak kelima dari tujuh bersaudara dari pasangan Petrus Sina Kleden dan Dorotea Sea Halan. Oleh keluarga dan orang-orang sekampungnya di Waibalun, ia disapa dengan nama \"No Oce\". Ia dinamai menurut saudara sulung dari ayahnya, yakni Paulus Sani Kleden, rohaniwan Serikat Sabda Allah (SVD) yang pernah menjabat sebagai Uskup Denpasar periode 1961–1972.\n\nBudi Kleden menempuh pendidikan di Seminari Menengah San Domingo, Hokeng, Larantuka (1981–1985). Ia kemudian memutuskan untuk bergabung dengan Serikat Sabda Allah dengan menjalani masa novisiat di Biara SVD Ledalero, Maumere, pada tahun 1985.\nSejak tahun 1986 hingga 1988, ia menempuh studi dalam bidang filsafat di Seminari Tinggi Santo Paulus, Ledalero. Pada 1 Agustus 1987, ia mengucapkan kaul pertama sebagai...",
    "source": {
      "title": "Paulus Budi Kleden",
      "url": "https://id.wikipedia.org/wiki/Paulus_Budi_Kleden"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Paulus_Budi_Kleden_%282024%29.jpg/330px-Paulus_Budi_Kleden_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Paulus_Budi_Kleden_(2024).jpg"
    }
  },
  "Silvester Tung Kiem San": {
    "name": "Silvester San",
    "born": "14 Agustus 1961",
    "birthPlace": "Mauponggo, Nagekeo, Nusa Tenggara Timur, Indonesia",
    "priest": "29 Juli 1988",
    "bishop": "19 Februari 2009",
    "motto": "Deus incrementum dedit (Allah yang Memberi Pertumbuhan)",
    "story": "Silvester San (lahir 14 Agustus 1961) adalah Uskup Denpasar yang terpilih pada 22 November 2008. Sejak 11 Agustus 2017 hingga 19 Maret 2020, Mgr. San juga merangkap sebagai Administrator Apostolik Keuskupan Ruteng.\n\nMgr. Silvester San lahir di Mauponggo, Nagekeo, Flores, Nusa Tenggara Timur, pada tanggal 14 Agustus 1961. Ia adalah anak laki-laki ketiga dari sembilan bersaudara, dari pasangan Roben Robo (ayah) dan Katharina No'o Nore (ibu).\nMgr. Silvester San menyelesaikan pendidikan di SDK Maukeli, Seminari Menengah Santo Yohanes Berkmans Todabelu Mataloko Ngada (SMP-SMA), Sekolah Tinggi Filsafat Katolik (STFK) Ledalero Maumere dan ditahbiskan menjadi imam diosesan Keuskupan Agung Ende pada tanggal 29 Juli 1988 oleh Mgr. Donatus Djagom, S.V.D., Uskup Agung Ende waktu itu.\n\nSetelah ditahbiskan sebagai imam, ia ditugaskan sebagai pastor pembantu di Paroki Roh Kudus Mataloko sambil mengajar di Seminari Santo Yohanes Berkhmans Todabelu. Pada tahun 1990, ia melanjutkan studi ke Universitas Kepausan Urbanianum Roma, mengambil spesialisasi Teologi Biblis dan tahun 1992 memperoleh gelar licenciat dengan tesis “The Mercy of God in the Parables of Luke 15\". Setelah...",
    "source": {
      "title": "Silvester Tung Kiem San",
      "url": "https://id.wikipedia.org/wiki/Silvester_Tung_Kiem_San"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mgr_Silvester_San_03.jpg/330px-Mgr_Silvester_San_03.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Silvester_San_03.jpg"
    }
  },
  "Yohanes Hans Monteiro": {
    "name": "Yohanes Hans Monteiro",
    "born": "15 April 1971",
    "birthPlace": "Larantuka, Nusa Tenggara Timur",
    "priest": "14 Juli 1999",
    "bishop": "11 Februari 2026",
    "motto": "Unum Corpus, Unus Spiritus, Una Spes (Ef 4:4, bahasa Indonesia: Satu Tubuh, Satu Roh dan Satu Pengharapan)",
    "story": "Yohanes Hans Monteiro (lahir 15 April 1971) adalah Uskup Larantuka yang ditunjuk pada 22 November 2025. Ia merupakan Uskup Larantuka yang keempat, melanjutkan kepemimpinan Mgr. Fransiskus Kopong Kung Sebelum menjadi Uskup Larantuka, ia merupakan Dosen Kitab Suci di Institut Filsafat dan Teknologi Kreatif, Ledalero. Ia ditahbiskan menjadi Uskup Keuskupan Larantuka pada hari Rabu, 11 Februari 2026.\n\nIa menempuh pendidikan di Seminari Menengah Santo Dominggo Hokeng. Ia kemudian melanjutkan studi filsafat dan teologi di Institut Filsafat Katolik Ledalero. Ia ditahbiskan menjadi imam Keuskupan Larantuka pada hari Rabu, 14 Juli 1999 di Gereja Katedral Larantuka. Tahbisan Imamat ia terima dari Mgr. Darius Nggawa, S.V.D. Selama beberapa tahun, ia bertugas sebagai pengajar di Seminari Menengah Santo Dominggo Hokeng. Ia melanjutkan studi lanjut di Universitas Wina, Austria. Ia menerima gelar Licentiate dan Doktor Liturgi.\nSelama lebih dari satu dasawarsa, ia memegang jabatan sebagai vikaris paroki di Franz-von-Assisi-Kirche (Mexikoplatz) dan Maria Himmelfahrt di Bad Deutsch-Altenburg. Setelah pulang ke Indonesia pada 2018, ia mengajar Liturgi di IFTK Ledalero serta menjadi...",
    "source": {
      "title": "Yohanes Hans Monteiro",
      "url": "https://id.wikipedia.org/wiki/Yohanes_Hans_Monteiro"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/id/thumb/b/bf/Mgr._Yohanes_Hans_Monteiro.jpg/330px-Mgr._Yohanes_Hans_Monteiro.jpg",
      "license": "CC-BY-SA-4.0",
      "credit": "NTT Bicara",
      "pageUrl": "https://id.wikipedia.org/wiki/Berkas:Mgr._Yohanes_Hans_Monteiro.jpg"
    }
  },
  "Ewaldus Martinus Sedu": {
    "name": "Ewaldus Martinus Sedu",
    "born": "30 Juli 1963",
    "birthPlace": "Bajawa, Nusa Tenggara Timur",
    "priest": "7 Juli 1991",
    "bishop": "26 September 2018",
    "motto": "Duc in altum (Bertolak ke tempat yang dalam)",
    "story": "Ewaldus Martinus Sedu (lahir 30 Juli 1963) adalah Uskup Maumere sejak terpilih pada 14 Juli 2018 menggantikan Mgr. Gerulfus Kherubim Pareira, S.V.D. Sebelum mengampu jabatan sebagai Uskup, Ewaldus merupakan Vikaris Jenderal (VikJen) pada Keuskupan yang sama.\n\nSedu menjalani pendidikan di Seminari Menengah Mataloko, Bajawa sejak tahun 1977 hingga 1981 untuk pendidikan setingkat SMP dan hingga tahun 1983 untuk setingkat SMA, juga di Seminari Mataloko. Ia kemudian melanjutkan pendidikannya dalam bidang filsafat dan teologi di Sekolah Tinggi Filsafat Katolik Ledalero setelah menjalani Tahun Orientasi Rohani di Seminari Tinggi Interdiosesan Santo Petrus Ritapiret, Flores, di mana ia sempat terpilih menjadi ketua kelas dan ketua umum. Sedu kembali menjalani TOP di Seminari Menengah Santo Yohanes Brekmans Toda Belu, Mataloko pada tahun 1988–1989. Ia ditahbiskan menjadi diakon pada hari Sabtu, 21 Oktober 1989, sebelum ditahbiskan menjadi imam diosesan Keuskupan Agung Ende pada hari Minggu, 7 Juli 1991 di Paroki Santo Yosef, Bajawa. Ia juga menjalani pendidikan di Universitas Kepausan Salesian Roma pada tahun 1997 hingga 2001.",
    "source": {
      "title": "Ewaldus Martinus Sedu",
      "url": "https://id.wikipedia.org/wiki/Ewaldus_Martinus_Sedu"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ewaldus_Martinus_Sedu_%282024%29.jpg/330px-Ewaldus_Martinus_Sedu_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Ewaldus_Martinus_Sedu_(2024).jpg"
    }
  },
  "Siprianus Hormat": {
    "name": "Siprianus Hormat",
    "born": "16 Juli 1965",
    "birthPlace": "Cibal, Manggarai, Nusa Tenggara Timur",
    "priest": "8 Oktober 1995",
    "bishop": "19 Maret 2020",
    "motto": "\"Omnia in Caritate\" (\"Lakukanlah segala pekerjaanmu dalam kasih\")",
    "story": "Siprianus Hormat (lahir 16 Juli 1965) adalah Uskup Ruteng sejak 13 November 2019. Saat ditunjuk sebagai Uskup oleh Tahta Suci, Siprianus masih menjabat sebagai Sekretaris Eksekutif Konferensi Waligereja Indonesia. Dia menggantikan Mgr. Hubertus Leteng yang mengundurkan diri pada 11 Oktober 2017.\n\nSiprianus lahir sebagai anak kedua dari tujuh bersaudara pasangan Mikael Mahar dan Yuliana Nahus. Latar belakang keluarga Katolik yang sederhana tetapi menjalankan disiplin yang ketat menjadi dasar kehidupan berkeluarga Siprianus.\n\nSiprianus menjalani pendidikan sekolah dasar di SDK Ri'I (1974–1980). Ia kemudian masuk ke Seminari Pius XII Kisol untuk menjalani pendidikan tingkat SMP dan SMA sejak 1980 hingga 1986. Ia mendaftarkan diri untuk menjadi imam diosesan Keuskupan Ruteng dan melanjutkan studi filsafat di STFK Ledalero sejak tahun 1987 hingga 1991, disusul dengan studi teologi juga di Ledalero sejak 1993 hingga 1995. Ia menjalani masa Tahun Orientasi Pastoral (TOP) juga di Seminari Pius XII Kisol pada tahun 1991 hingga 1993. Pada April 1995 di Kapel Seminari Tinggi Santo Petrus, Ritapiret, ia menerima tahbisan diakonat dari tangan Mgr. Anton Pain Ratu,...",
    "source": {
      "title": "Siprianus Hormat",
      "url": "https://id.wikipedia.org/wiki/Siprianus_Hormat"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Uskup_Ruteng_%28cropped%29.jpg/330px-Uskup_Ruteng_%28cropped%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Halomoan Nasution Edited by FelixJL111",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Uskup_Ruteng_(cropped).jpg"
    }
  },
  "Maksimus Regus": {
    "name": "Maksimus Regus",
    "born": "23 September 1973",
    "birthPlace": "Todo, Satar Mese Barat, Manggarai, Nusa Tenggara Timur",
    "priest": null,
    "bishop": null,
    "motto": "\"Ut Salvatus Mundus Per Ipsum\" (bdk. ) (Supaya Dunia diselamatkan oleh-Nya)",
    "story": "Maksimus Regus (lahir 23 September 1973) adalah uskup pertama Keuskupan Labuan Bajo. Ia terpilih menjadi Uskup Labuan Bajo pada 21 Juni 2024. Sebelum menjadi uskup, ia merupakan Rektor Universitas Katolik Santu Paulus Ruteng.\n\nMaksimus menjalani pendidikan filsafat di Sekolah Tinggi Filsafat Katolik (STFK) Ledalero sejak tahun 1993 hingga 1997. Ia kemudian menjalani pendidikan teologi di tempat yang sama sejak tahun 1999 hingga 2001.\nSebagai diakon, ia menjalani tugas diakonat di Gereja Kristus Raja, Ruteng sejak Mei hingga Agustus 2001. Ia menerima tahbisan imamat dari Eduardus Sangsun, S.V.D. pada 10 Agustus 2001 di Gereja Katedral Ruteng. Tugas pertamanya setelah ditahbiskan ialah sebagai imam kapelan di Gereja Kristus Raja, Ruteng yang ia jalani hingga Agustus 2007. Sejak tahun 2002 ia menjadi Ketua Komisi Hubungan antar Agama dan Kepercayaan Keuskupan Ruteng dan sejak tahun 2005 ia juga menjadi Koordinator Dialog Antaragama Keuskupan Ruteng serta Koordinator untuk Kegiatan Kaum Muda Lintas Agama.\nSejak tahun 2007, Maksimus menjalani tugas studi magister dalam bidang sosiologi pembangunan di Universitas Indonesia. Pada tahun 2012, ia menjadi fellow dalam...",
    "source": {
      "title": "Maksimus Regus",
      "url": "https://id.wikipedia.org/wiki/Maksimus_Regus"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Maksimus_Regus%2C_Uskup_Labuan_Bajo_%282024%29.jpg/330px-Maksimus_Regus%2C_Uskup_Labuan_Bajo_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Maksimus_Regus,_Uskup_Labuan_Bajo_(2024).jpg"
    }
  },
  "Hironimus Pakaenoni": {
    "name": "Hironimus Pakaenoni",
    "born": "14 April 1969",
    "birthPlace": "Noemuti, Timor Tengah Utara, Nusa Tenggara Timur, Indonesia",
    "priest": "8 September 1997",
    "bishop": "9 Mei 2024",
    "motto": "\"Pasce Oves Meas\" (Gembalakanlah domba-domba-Ku)",
    "story": "Hironimus Pakaenoni (lahir 14 April 1969) adalah seorang rohaniwan Katolik Indonesia. Pada 9 Maret 2024, ia terpilih menjadi Uskup Agung Kupang. Sebelum menduduki jabatan ini, Mgr. Roni adalah seorang dosen pada Fakultas Filsafat Universitas Katolik Widya Mandira Kupang dan juga menjadi formator pada Seminari Tinggi Interdiosesan Santo Mikhael, Penfui, Kupang.\n\nPerjalanan pendidikan Hironimus Pakaenoni dimulai di SDK Noemuti (1976–1982), dilanjutkan ke SMPK Santo Yoseph Noemuti (1982–1985). Setelah itu, menempuh pendidikan di Seminari Menengah Santa Maria Imaculata Lalian (1985–1989), yang menjadi landasan awal dalam panggilan hidup membiara.\nPada tahun 1989–1990, ia mengikuti Tahun Orientasi Rohani (TOR) di Lela, Sikka, Flores, sebagai langkah awal mendalami kehidupan religius. Kemudian, ia melanjutkan studi filsafat di Sekolah Tinggi Filsafat Katolik (STFK) Ledalero, Maumere, Flores, selama empat tahun sejak tahun 1990 hingga 1994. Setelah menyelesaikan studi filsafat, ia menjalani Tahun Orientasi Pastoral (TOP) di Paroki Santo Yohanes Pemandi, Buraen (1994–1995) untuk mendapatkan pengalaman praktik langsung bersama umat.\nIa kemudian menjalani pendidikan dalam bidang...",
    "source": {
      "title": "Hironimus Pakaenoni",
      "url": "https://id.wikipedia.org/wiki/Hironimus_Pakaenoni"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/id/thumb/a/a1/IMG-20240322-WA0029_%28cropped%29.jpg/330px-IMG-20240322-WA0029_%28cropped%29.jpg",
      "license": "CC-BY-SA-4.0",
      "credit": "Komsos Keuskupan Atambua Crop by FelixJL111",
      "pageUrl": "https://id.wikipedia.org/wiki/Berkas:IMG-20240322-WA0029_(cropped).jpg"
    }
  },
  "Dominikus Saku": {
    "name": "Dominikus Saku",
    "born": "3 April 1960",
    "birthPlace": "Taekas, Miomaffo Timur, Timor Tengah Utara, Nusa Tenggara Timur, Indonesia",
    "priest": "29 September 1992",
    "bishop": "21 September 2007",
    "motto": "Vos Amici Mei Estis",
    "story": "Dominikus Saku (lahir 3 April 1960) adalah Uskup Atambua petahana yang telah menjabat sejak ditunjuk pada 2 Juni 2007.\n\nSaku menjalani pendidikan dasar di seminari diosesan lokal. Ia kemudian melanjutkan studi teologi dan filsafat di Seminari Santo Petrus, Ritapiriet, Maumere.\n\nSaku ditahbiskan menjadi imam diosesan Keuskupan Atambua pada tanggal 29 September 1992. Ia kemudian menjadi asisten di Seminari Santo Damian, Atambua, lalu melanjutkan pendidikan hingga tahun 1999 di Universitas Kepausan Urbaniana, Roma. Sejak 1999, ia menjadi profesor filsafat di Seminari Tinggi Kupang dan Universitas Katolik Widya Mandira. Sejak 2001, ia bertugas dalam bidang disiplin di Seminari Kupang, lalu sejak 2003 menjadi pastor rekan di Baun dan Katedral Kupang. Terakhir, ia menjadi Profesor dan Formatur Seminari Tinggi Kupang.\nIa kemudian terpilih menjadi Uskup Atambua pada tanggal 2 Juni 2007 menggantikan pendahulunya Anton Pain Ratu, S.V.D. Pain Ratu kemudian menjadi Penahbis Utamanya, dengan didampingi Uskup Agung Petrus Turang dari Kupang dan Uskup Gerulfus Kherubim Pareira, S.V.D. dari Weetebula. Penahbisan berlangsung pada 21 September 2007.\n\n��2...",
    "source": {
      "title": "Dominikus Saku",
      "url": "https://id.wikipedia.org/wiki/Dominikus_Saku"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Mgr_Dominikus_Saku_03.jpg/330px-Mgr_Dominikus_Saku_03.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Dominikus_Saku_03.jpg"
    }
  },
  "Edmund Woga": {
    "name": "Edmund Woga",
    "born": "17 November 1950",
    "birthPlace": "Hewokloang, Sikka, Nusa Tenggara Timur, Indonesia",
    "priest": "29 November 1977",
    "bishop": "16 Juli 2009",
    "motto": "(Mewartakan Penebusan)",
    "story": "Edmund Woga,  (lahir 17 November 1950) adalah seorang uskup Katolik Roma Indonesia bagi Keuskupan Weetebula.\n\nWoga ditahbiskan menjadi imam pada tanggal 29 November 1977. Pada tahun 1985 Woga mengucapkan kaul dan mengaku sebagai anggota Kongregasi Sang Penebus Mahakudus.\nPada tanggal 4 April 2009 diumumkan bahwa Woga telah dipilih sebagai uskup baru Keuskupan Weetebula, menggantikan Gerulfus Kherubim Pareira yang telah dilantik sebagai Uskup Maumere. Pada tanggal 16 Juli 2009, Woga ditahbiskan menjadi uskup oleh Pareira dan dilantik sebagai pemimpin Keuskupan Weetebula. Sebagai bagian dari pentahbisan di keuskupan di pulau Sumba, Woga bersumpah untuk membantu orang-orang miskin dan terpinggirkan di pulau itu, meningkatkan hubungan antaragama dengan Protestan dan Muslim, serta pembentukan iman yang lebih baik bagi anak-anak Katolik.\nWoga juga seorang penulis, setelah menerbitkan buku pada Januari 2009 berjudul Misi, misiologi, dan evangelisasi di Indonesia, atau Misi dan Evangelisasi Gereja Katolik di Indonesia. Mottonya adalah \"Praedicare Redemptionem\" (Memproklamirkan Penebusan).\nPada bulan September 2013, Woga mengalami kecelakaan sepeda motor yang serius saat melakukan...",
    "source": {
      "title": "Edmund Woga",
      "url": "https://id.wikipedia.org/wiki/Edmund_Woga"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mgr_Edmund_Woga.jpg/330px-Mgr_Edmund_Woga.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Edmund_Woga.jpg"
    }
  },
  "Petrus Canisius Mandagi": {
    "name": "Petrus Canisius Mandagi",
    "born": "27 April 1949",
    "birthPlace": "Kamangta, Tombulu, Minahasa, Sulawesi Utara, Indonesia",
    "priest": "18 Desember 1975",
    "bishop": "18 September 1994",
    "motto": "Nil Nisi Christum (Tidak ada apapun selain Kristus)",
    "story": "Mgr. Petrus Canisius Mandagi,  (lahir 27 April 1949) adalah Uskup Agung Gereja Katolik Roma untuk Keuskupan Agung Merauke. Sebelum menjadi Uskup Agung di Keuskupan Agung Merauke, Mgr. Mandagi terlebih dahulu menjadi Uskup di Keuskupan Amboina dari tahun 1994 hingga 2020. Pada 11 November 2020, Mgr. Mandagi resmi ditunjuk sebagai Uskup Agung Merauke, menggantikan Mgr. Nicolaus Adi Seputra, M.S.C.\n\nMandagi menjalani pendidikan sekolah dasar di SD Katolik Kamangta sejak tahun 1954 hingga tamat 1960. Setelah lulus, ia meneruskan pendidikan di Seminari Menengah Kakaskasen, Tomohon hingga tahun 1967, dilanjutkan dengan pendidikan filsafat dan teologi di Seminari Tinggi Pineleng, Kabupaten Minahasa, Sulawesi Utara hingga tahun 1975.\n\nIa ditahbiskan menjadi imam pada tanggal 18 Desember 1975 di Manado. Setelah tahbisan, ia diangkat menjadi socius sekaligus pembina para calon anggota tarekat MSC di Karanganyar sejak 1976 hingga 1977. Ia kemudian ditugaskan Pastor Paroki Gereja Bunda Hati Kudus, Kemakmuran, Jakarta hingga tahun 1978.\nIa kembali menjalani studi, kali ini di Leuven, Belgia sejak tahun 1978 hingga 1981, dan meraih gelar MA dalam Studi...",
    "source": {
      "title": "Petrus Canisius Mandagi",
      "url": "https://id.wikipedia.org/wiki/Petrus_Canisius_Mandagi"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Uskup_Agung_Merauke_Petrus_Canisius_Mandagi_%28November_2024%29.jpg/330px-Uskup_Agung_Merauke_Petrus_Canisius_Mandagi_%28November_2024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Uskup_Agung_Merauke_Petrus_Canisius_Mandagi_(November_2024).jpg"
    }
  },
  "Aloysius Murwito": {
    "name": "Aloysius Murwito",
    "born": "20 Desember 1950",
    "birthPlace": "Sleman, Daerah Istimewa Yogyakarta, Indonesia",
    "priest": "7 Juli 1982",
    "bishop": "15 September 2002",
    "motto": "\"In Deo Speravi, non timebo\" (Aku percaya pada Allah, aku tidak takut cfr. Te Deum)",
    "story": "Aloysius Murwito,  (lahir 20 Desember 1950) adalah seorang imam Katolik Roma dan Uskup Agats kedua di Indonesia.\nMasalah kesehatan pendahulunya Alphonsus Augustus Sowada, termasuk operasi bypass jantung empat kali pada tahun 1999, menyebabkan ia pensiun pada tanggal 9 Mei 2001. Murwito menggantikannya sebagai Uskup Agats pada tahun 2002.\n\nIa menjalani pendidikan menengah di SMP Kanisius, Sleman. Ia kemudian melanjutkan pendidikan di Sekolah Pendidikan Guru van Lith, Muntilan, lalu di Sekolah Tinggi Pengembangan Sosial, Malang. Ia kemudian belajar di Sekolah Tinggi Filsafat dan Teologi Fajar Timur, Abepura. Ia berkuliah filsafat dan teologi di Yogyakarta, yang diikuti dengan praktik lapangan di Jayapura pada tahun 1970-an.\n\nIa ditahbiskan menjadi imam pada tanggal 7 Juli 1982. Ia sempat berkarya di beberapa paroki di Flores dan Papua. Ia sempat menjabat sebagai Minister Provinsi Indonesia dari Ordo Fransiskan.\nIa terpilih menjadi Uskup Agats pada tanggal 7 Juni 2002, meneruskan kepemimpinan Mgr. Alphonsus Augustus Sowada, O.S.C.. Berita pengangkatan diumumkan secara resmi di Roma pada tanggal 8 Juni 2002. Ia memilih kutipan dari Mazmur 56:5, \"In Deo Speravi...",
    "source": {
      "title": "Aloysius Murwito",
      "url": "https://id.wikipedia.org/wiki/Aloysius_Murwito"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mgr_Aloysius_Murwito_%281%29.jpg/330px-Mgr_Aloysius_Murwito_%281%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr_Aloysius_Murwito_(1).jpg"
    }
  },
  "Yanuarius You": {
    "name": "Yanuarius You",
    "born": "1 Januari 1961",
    "birthPlace": "Uwebutu, Deiyai Miyo, Paniai, Papua Tengah",
    "priest": "16 Juni 1991",
    "bishop": "2 Februari 2023",
    "motto": "Ego Vobiscum Sum (Aku Menyertai Kamu)",
    "story": "Yanuarius Teofilus Matopai You (lahir 1 Januari 1961) adalah Uskup Jayapura yang ditunjuk oleh Paus Fransiskus pada 29 Oktober 2022 menggantikan Leo Laba Ladjar O.F.M. yang berhenti karena pensiun. Ia merupakan Uskup Jayapura pertama yang berasal dari suku Mee. Sebelum menjadi Uskup Jayapura, ia merupakan Ketua Sekolah Tinggi Filsafat Teologi \"Fajar Timur\" di Abepura.\n\nYanuarius You ditahbiskan Imam Diosesan Keuskupan Jayapura di Gereja Kristus Sahabat Kita Nabire pada hari Minggu, 16 Juni 1991. You menghabiskan masa mudanya sebagai mahasiswa STFT Fajar Timur hingga tahun 1987. You kemudian menjalani masa spiritual dan pendidikan lanjutannya di Seminari Pineleng.\nSesudah ditahbiskan sebagai imam, You kemudian diterima sebagai mahasiswa jenjang pendidikan Master di Fakultas Psikologi di Universitas Gadjah Mada di tahun 2007. You kemudian meraih gelar masternya di tahun 2010 setelah berhasil mempertahankan tesis kuantitatifnya mengenai \"efektivitas pendidikan seksualitas untuk meningkatkan kontrol diri terhadap perilaku seks remaja seminari\" di bawah bimbingan Maria Goretti Adiyanti.\nYou diberi gelar sebagai Doktor Antropologi di Universitas Cendrawasih pada tahun 2020...",
    "source": {
      "title": "Yanuarius You",
      "url": "https://id.wikipedia.org/wiki/Yanuarius_You"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Mgr._Jan_You.jpg/330px-Mgr._Jan_You.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Lordship888",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr._Jan_You.jpg"
    }
  },
  "Hilarion Datus Lega": {
    "name": "Hilarion Datus Lega",
    "born": "21 Oktober 1956",
    "birthPlace": "Oeba, Kupang, Nusa Tenggara Timur, Indonesia",
    "priest": "15 Juni 1984",
    "bishop": "7 September 2003",
    "motto": "\"Nomen Tuum Glorificetur\" (Dimuliakanlah Nama-Mu, bdk. Mazmur 113:1)",
    "story": "Hilarion Datus Lega (lahir 21 Oktober 1956) adalah Uskup Petahana Keuskupan Manokwari-Sorong yang telah ditunjuk pada 30 Juni 2003.\n\nIa ditahbiskan menjadi imam diosesan Keuskupan Ruteng pada tanggal 15 Juni 1984. Ia terpilih menjadi Uskup Manokwari-Sorong pada tanggal 30 Juni 2003. Ia ditahbiskan pada hari Minggu, 7 September 2003 oleh pendahulunya, Mgr. Fransiscus Xaverius Sudartanta Hadisumarta, O.Carm. dengan didampingi oleh Uskup Agung Jakarta, Julius Kardinal Darmaatmadja, S.J. dan Uskup Agung Merauke, Jacobus Duivenvoorde, M.S.C. di Gereja Katedral Kristus Raja, Sorong.\nMgr. Datus menjadi Uskup Penahbis Pendamping bagi Mgr. Hubertus Leteng sebagai Uskup Ruteng pada 14 April 2010 dan Mgr. Bernardus Bofitwos Baru, O.S.A. sebagai Uskup Timika pada 14 Mei 2025\n\n(Inggris) Entri Hilarion Datus Lega pada situs web Catholic-Hierarchy",
    "source": {
      "title": "Hilarion Datus Lega",
      "url": "https://id.wikipedia.org/wiki/Hilarion_Datus_Lega"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Hilarion_Datus_Lega_%282024%29.jpg/330px-Hilarion_Datus_Lega_%282024%29.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Medelam",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Hilarion_Datus_Lega_(2024).jpg"
    }
  },
  "Bernardus Bofitwos Baru": {
    "name": "Bernardus Bofitwos Baru",
    "born": "22 Agustus 1969",
    "birthPlace": "Bakrabi, Mare, Maybrat, Papua Barat",
    "priest": null,
    "bishop": null,
    "motto": "Ego Sum Ostium (Aku adalah Pintu)",
    "story": "Bernardus Bofitwos Baru,  (lahir 22 Agustus 1969) adalah seorang prelat Gereja Katolik asal Indonesia. Pada 8 Maret 2025, ia terpilih menjadi Uskup Timika. Sebelum menduduki jabatan ini, Mgr. Bernardus adalah Ketua Sekolah Tinggi Filsafat Teologi Fajar Timur yang telah ia mulai sejak 25 Januari 2023.\n\nBernardus lahir dari pasangan Awitaya Amos Baru dan Bohoato Salomina Bame di Kampung Bakrabi yang merupakan bagian dari Distrik Mare, Kabupaten Maybrat, Papua Barat, pada 22 Agustus 1969. Ia memulai pendidikannya di SD YPPK (Yayasan Pendidikan dan Persekolahan Katolik) Suswa. Ia kemudian melanjutkan ke SMP YPPK Santo Don Bosco yang terletak di Kabupaten Fakfak, sehingga ia meninggalkan Suswa dengan perjalanan udara pada Juni 1984. Pendidikan tingkat SMA dijalaninya di SMA YPPK Agustinus, Kota Sorong.\nPada tahun 1990, Bernardus melanjutkan studi ke Institut Pastoral Indonesia (IPI) Filial Malang di Kota Semarang, Jawa Tengah. Di sana, ia menyelesaikan pendidikan Diploma Tiga pada tahun 1995. Ia kemudian meneruskan pendidikannya ke jenjang S-1 di Sekolah Tinggi Filsafat Teologi Fajar Timur di Abepura, Jayapura, dan lulus pada tahun 1999.\nBernardus bergabung dengan Ordo...",
    "source": {
      "title": "Bernardus Bofitwos Baru",
      "url": "https://id.wikipedia.org/wiki/Bernardus_Bofitwos_Baru"
    },
    "photo": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mgr.Bernardus_Bovitwos_Baru.jpg/330px-Mgr.Bernardus_Bovitwos_Baru.jpg",
      "license": "CC BY-SA 4.0",
      "credit": "Yokohe",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:Mgr.Bernardus_Bovitwos_Baru.jpg"
    }
  }
};
