/**
 * Curated novel-style Indonesian biographies of beloved Catholic Saints.
 * Written to feel like reading a warm, vivid spiritual biography book inside Ruang Iman.
 */

export type FamousSaint = {
  slug: string;
  name: string;
  subtitle: string;
  feastDay: string;
  era: string;
  patronOf: string;
  quote: string;
  coverFrom: string;
  coverTo: string;
  keywords: string[];
  chapters: { title: string; paragraphs: string[] }[];
  reflection: string;
  prayer: string;
};

export const FAMOUS_SAINTS: FamousSaint[] = [
  {
    slug: "fransiskus-assisi",
    name: "Santo Fransiskus dari Assisi",
    subtitle: "Si Miskin yang Mengasihi Seluruh Ciptaan",
    feastDay: "4 Oktober",
    era: "1181 – 1226",
    patronOf: "Pelindung Alam, Ekologi & Kaum Miskin",
    quote: "Mulailah dengan melakukan apa yang perlu, lalu apa yang mungkin, dan tiba-tiba engkau sedang melakukan yang mustahil.",
    coverFrom: "#2c1e12",
    coverTo: "#120c07",
    keywords: ["fransiskus dari assisi", "fransiskus assisi", "francis of assisi"],
    chapters: [
      {
        title: "Bab I — Pemuda Kaya dari Bukit Umbria",
        paragraphs: [
          "Di kota berbatu Assisi, di lereng hijau Umbria, Italia, lahirlah seorang anak laki-laki bernama Giovanni pada tahun 1181. Ayahnya, Pietro di Bernardone, seorang pedagang kain sutra yang sangat kaya, baru pulang dari Prancis dan langsung memanggil putranya dengan sebutan 'Francesco' — si kecil dari Prancis.",
          "Fransiskus tumbuh menjadi pemuda yang ceria, gemar berpesta, menyanyi di jalanan Assisi bersama teman-temannya, dan bermimpi menjadi ksatria bangsawan yang gagah. Namun Tuhan sedang menulis kisah yang sama sekali berbeda di dalam hatinya.",
          "Ketika perang pecah antara Assisi dan Perugia, Fransiskus tertangkap dan dipenjara selama setahun. Di ruang gelap yang lembap, kesehatan tubuhnya melemah, tetapi keheningan penjara mulai membuka matanya bahwa kemuliaan dunia tidak pernah benar-benar memuaskan dahaga jiwanya.",
        ],
      },
      {
        title: "Bab II — Suara dari Salib San Damiano",
        paragraphs: [
          "Suatu hari, saat berkuda di dataran Assisi, Fransiskus berpapasan dengan seorang penderita kusta — orang yang dulu paling ia takuti dan jauhi. Didorong oleh rahmat yang tiba-tiba memenuhi dadanya, ia turun dari kuda, memeluk orang kusta itu, dan mencium tangannya. Sejak saat itu, apa yang dahulu terasa pahit berubah menjadi manis bagi jiwanya.",
          "Tak lama kemudian, ketika ia berdoa seorang diri di kapel tua San Damiano yang nyaris roboh, ia memandang salib kayu di atas altar. Dari salib itu ia mendengar suara lembut namun tegas: 'Fransiskus, pergilah, perbaikilah rumah-Ku yang seperti kau lihat hampir rubuh.'",
          "Mulanya Fransiskus mengira Tuhan memintanya membangun kembali tembok batu kapel itu. Ia melepaskan seluruh warisan ayahnya di hadapan Uskup Assisi, mengenakan jubah cokelat kasar yang diikat seutas tali, dan memilih hidup miskin total demi mengikuti Kristus.",
        ],
      },
      {
        title: "Bab III — Kidung Saudara Matahari",
        paragraphs: [
          "Kehidupan Fransiskus yang penuh sukacita dalam kemiskinan menarik banyak pengikut, termasuk Santa Klara. Ia mendirikan Ordo Saudara-Saudara Dina (Fransiskan) yang hidup dari kasih persaudaraan dan pelayanan kepada yang tersisih. Ia menyapa matahari sebagai 'Saudara', bulan sebagai 'Saudari', bahkan berkhotbah kepada burung-burung di padang.",
          "Dua tahun sebelum wafatnya, saat berdoa di Gunung La Verna, Fransiskus menerima stigmata — lima luka suci Kristus di tubuhnya. Dalam keadaan hampir buta dan sakit berat, ia menggubah 'Kidung Segala Makhluk' yang memuji Allah atas segala ciptaan. Ia wafat dengan damai pada 3 Oktober 1226 sambil berbaring di atas tanah telanjang, memeluk kemiskinan hingga napas terakhir.",
        ],
      },
    ],
    reflection: "Kebahagiaan sejati tidak lahir dari seberapa banyak yang kita miliki, melainkan dari seberapa bebas hati kita untuk mengasihi Tuhan, sesama, dan alam ciptaan-Nya.",
    prayer: "Tuhan, jadikanlah aku pembawa damai-Mu. Di mana ada kebencian, biarlah aku menabur kasih; di mana ada keputusasaan, biarlah aku membawa harapan. Santo Fransiskus dari Assisi, doakanlah kami. Amin.",
  },
  {
    slug: "theresia-kanak-kanak-yesus",
    name: "Santa Theresia dari Kanak-Kanak Yesus",
    subtitle: "Si Bunga Kecil & Jalan Kecil Menuju Surga",
    feastDay: "1 Oktober",
    era: "1873 – 1897",
    patronOf: "Pelindung Misi & Pujangga Gereja",
    quote: "Aku ingin melewatkan surgaku dengan berbuat baik di bumi. Aku akan menjatuhkan hujan mawar.",
    coverFrom: "#3b1725",
    coverTo: "#160910",
    keywords: ["theresia dari kanak-kanak yesus", "theresia dari lisieux", "therese of lisieux"],
    chapters: [
      {
        title: "Bab I — Putri Bungsu yang Rindu Menjadi Kudus",
        paragraphs: [
          "Theresia Martin lahir di Alençon, Prancis, pada 2 Januari 1873, sebagai anak bungsu dari sembilan bersaudara dari pasangan kudus Santo Louis dan Santa Zélie Martin. Ketika usianya baru empat tahun, ibunya wafat — sebuah luka mendalam yang membuat Theresia tumbuh menjadi anak yang sangat perasa.",
          "Pada malam Natal 1886, sebuah rahmat besar mengubah hidupnya. Ia merasakan kekuatan baru dari Kanak-Kanak Yesus yang membebaskannya dari sifat manja dan rapuh. Sejak malam itu, satu kerinduan membara di hatinya: mengasihi Yesus dan menyelamatkan jiwa-jiwa melalui doa.",
        ],
      },
      {
        title: "Bab II — Mengetuk Pintu Karmel di Usia Lima Belas",
        paragraphs: [
          "Keinginannya masuk biara Karmel di Lisieux ditolak karena usianya terlalu muda. Namun Theresia tidak menyerah. Saat berziarah ke Roma bersama ayahnya, ia berlutut langsung di hadapan Paus Leo XIII dan dengan mata berkaca-kaca memohon izin masuk Karmel pada usia lima belas tahun.",
          "Di balik tembok biara yang sederhana, tidak ada mukjizat megah yang tampak dari luar. Theresia justru menemukan 'Jalan Kecil' (La Petite Voie): melakukan hal-hal paling sederhana setiap hari — mencuci pakaian di air dingin, tersenyum kepada suster yang sulit, menanggung kedinginan tanpa mengeluh — semuanya dengan kasih yang luar biasa besar.",
        ],
      },
      {
        title: "Bab III — Hujan Mawar dari Surga",
        paragraphs: [
          "Atas perintah pemimpin biara, Theresia menuliskan kisah jiwanya dalam buku catatan sederhana yang kelak dikenal dunia sebagai 'Kisah Satu Jiwa' (Histoire d'une Âme). Pada usia 24 tahun, ia menderita tuberkulosis berat yang menguji imannya hingga titik terdalam.",
          "Pada 30 September 1897, dengan mata memandang salib di tangannya, ia berbisik, 'Ya Tuhanku, aku mengasihi-Mu!' dan berpulang dengan damai. Meski tak pernah meninggalkan biara kecilnya, Gereja mengangkatnya sebagai Pelindung Misi sedunia dan Pujangga Gereja.",
        ],
      },
    ],
    reflection: "Kita tidak harus melakukan hal besar untuk menjadi kudus; cukup lakukan tugas kecil hari ini dengan hati yang penuh cinta kepada Tuhan.",
    prayer: "Santa Theresia, ajarkanlah kami menjalani Jalan Kecil dengan kerendahan hati dan kepercayaan penuh seperti anak kecil di pangkuan Bapa. Doakanlah kami. Amin.",
  },
  {
    slug: "padre-pio",
    name: "Santo Padre Pio dari Pietrelcina",
    subtitle: "Imam Berstigmata & Bapa Pengakuan Dosa",
    feastDay: "23 September",
    era: "1887 – 1968",
    patronOf: "Pelindung Relawan, Remaja & Kesembuhan",
    quote: "Berdoalah, berharaplah, dan jangan khawatir. Kekhawatiran tidak berguna; Tuhan itu Maharahim dan akan mendengar doamu.",
    coverFrom: "#2b2016",
    coverTo: "#100c08",
    keywords: ["padre pio", "pio dari pietrelcina", "pio of pietrelcina"],
    chapters: [
      {
        title: "Bab I — Anak Petani yang Melihat Surga",
        paragraphs: [
          "Francesco Forgione lahir di desa kecil Pietrelcina, Italia selatan, pada 25 Mei 1887. Keluarganya sangat sederhana; sang ayah bahkan harus merantau ke Amerika agar bisa membiayai pendidikan imamat putranya.",
          "Sejak kecil, Francesco mencintai keheningan dan doa Rosario. Pada usia 15 tahun, ia masuk novisiat Kapusin dan menerima nama Biarawan Pio. Setelah ditahbiskan menjadi imam pada 1910, ia ditempatkan di biara terpencil San Giovanni Rotondo — tempat ia akan menghabiskan sisa hidupnya selama lebih dari lima puluh tahun.",
        ],
      },
      {
        title: "Bab II — Lima Luka Kristus di Atas Altar",
        paragraphs: [
          "Pada pagi hari 20 September 1918, ketika Padre Pio sedang berdoa syukur sesudah Misa di depan salib, ia menerima stigmata — lima luka terbuka pada kedua tangan, kaki, dan lambungnya yang terus berdarah selama tepat lima puluh tahun.",
          "Berita tentang imam kudus itu menyebar ke seluruh dunia. Ribuan peziarah datang setiap hari ke San Giovanni Rotondo. Padre Pio duduk di ruang pengakuan dosa hingga 12–16 jam sehari. Banyak orang bersaksi bahwa ia mampu membaca isi hati mereka dan mengingatkan dosa yang lupa mereka akui.",
        ],
      },
      {
        title: "Bab III — Rumah Pereda Penderitaan",
        paragraphs: [
          "Bagi Padre Pio, doa harus berbuah nyata dalam kasih. Dari sumbangan umat yang datang, ia membangun sebuah rumah sakit modern di tengah daerah miskin bernama 'Casa Sollievo della Sofferenza' (Rumah Pereda Penderitaan) yang hingga kini masih melayani ribuan pasien.",
          "Ketika ia wafat pada 23 September 1968 sambil menggenggam Rosario dan mengulang nama 'Yesus, Maria', seluruh luka stigmata di tubuhnya lenyap tanpa bekas sedikit pun. Ia dikanonisasi oleh Paus Yohanes Paulus II pada tahun 2002.",
        ],
      },
    ],
    reflection: "Saat hati dilanda cemas, ingatlah nasihat sederhana Padre Pio: serahkan semuanya dalam doa, peliharalah harapan, dan percayalah pada kerahiman Tuhan.",
    prayer: "Santo Padre Pio, engkau yang setia memikul salib Kristus dan tekun berdoa Rosario, doakanlah kami agar selalu tenang dan teguh dalam iman. Amin.",
  },
  {
    slug: "yohanes-paulus-ii",
    name: "Santo Yohanes Paulus II",
    subtitle: "Paus Peziarah & Sahabat Orang Muda",
    feastDay: "22 Oktober",
    era: "1920 – 2005",
    patronOf: "Pelindung Hari Orang Muda Sedunia & Keluarga",
    quote: "Jangan takut! Bukalah pintu-pintu lebar-lebar bagi Kristus!",
    coverFrom: "#291d3a",
    coverTo: "#100b18",
    keywords: ["yohanes paulus ii", "john paul ii", "karol wojtyla"],
    chapters: [
      {
        title: "Bab I — Karol dari Wadowice",
        paragraphs: [
          "Karol Józef Wojtyła lahir di kota kecil Wadowice, Polandia, pada 18 Mei 1920. Masa mudanya penuh kehilangan: ibunya meninggal saat ia berusia 8 tahun, kakaknya menyusul beberapa tahun kemudian, dan ayahnya wafat ketika Perang Dunia II mencengkeram Polandia.",
          "Di bawah pendudukan Nazi, Karol bekerja sebagai buruh tambang batu dan pabrik kimia sambil diam-diam belajar di seminari bawah tanah. Ia gemar bermain sepak bola, mendaki gunung, dan bermain teater — semua pengalaman itu membentuknya menjadi gembala yang sangat dekat dengan dunia nyata.",
        ],
      },
      {
        title: "Bab II — Paus dari Negeri Jauh",
        paragraphs: [
          "Pada 16 Oktober 1978, dunia dikejutkan oleh terpilihnya seorang kardinal Polandia menjadi Paus pertama non-Italia dalam 455 tahun. Dengan motto 'Totus Tuus' (Sepenuhnya Milikmu, dipersembahkan kepada Bunda Maria), ia berdiri di balkon Santo Petrus dan berseru: 'Jangan takut!'",
          "Ia mengunjungi 129 negara — termasuk Indonesia pada tahun 1989 — menjadikannya paus yang paling banyak berziarah dalam sejarah. Ia juga menggagas Hari Orang Muda Sedunia (World Youth Day), mengajak jutaan anak muda untuk berani menjadi saksi Kristus.",
        ],
      },
      {
        title: "Bab III — Pengampunan & Kesaksian dalam Kelemahan",
        paragraphs: [
          "Pada 13 Mei 1981, seorang penembak melukainya dengan parah di Lapangan Santo Petrus. Setelah sembuh, Paus Yohanes Paulus II mengunjungi penembaknya langsung di penjara dan mengampuninya dengan tulus.",
          "Di tahun-tahun terakhirnya, penyakit Parkinson melemahkan tubuh dan suaranya, tetapi ia menolak turun dari salib pelayanannya. Ia menunjukkan kepada dunia bahwa martabat manusia tetap mulia bahkan di dalam penderitaan. Ia wafat pada 2 April 2005, malam Minggu Kerahiman Ilahi yang ia tetapkan sendiri.",
        ],
      },
    ],
    reflection: "Iman sejati bukan berarti hidup tanpa ketakutan, melainkan keberanian untuk tetap membuka pintu hati bagi Kristus dan mengampuni seperti Dia.",
    prayer: "Santo Yohanes Paulus II, doakanlah keluarga-keluarga dan kaum muda kami agar tidak takut melangkah bersama Kristus setiap hari. Amin.",
  },
  {
    slug: "teresa-kalkuta",
    name: "Santa Teresa dari Kalkuta",
    subtitle: "Pensil Kecil di Tangan Tuhan",
    feastDay: "5 September",
    era: "1910 – 1997",
    patronOf: "Pelindung Kaum Miskin & Misionaris Cinta Kasih",
    quote: "Tidak semua dari kita bisa melakukan hal-hal besar. Tetapi kita bisa melakukan hal-hal kecil dengan kasih yang besar.",
    coverFrom: "#102a43",
    coverTo: "#071422",
    keywords: ["teresa dari kalkuta", "bunda teresa", "mother teresa"],
    chapters: [
      {
        title: "Bab I — Panggilan di Dalam Panggilan",
        paragraphs: [
          "Agnes Gonxha Bojaxhiu lahir di Skopje pada 26 Agustus 1910. Pada usia 18 tahun, ia meninggalkan keluarganya untuk menjadi biarawati misionaris di India dan mengajar di sekolah menengah di Kalkuta selama hampir dua puluh tahun.",
          "Pada 10 September 1946, di atas kereta menuju Darjeeling, ia mengalami 'panggilan di dalam panggilan'. Ia mendengar seruan Yesus dari salib, 'Aku haus' — haus akan kasih dan jiwa-jiwa yang paling miskin dan terbuang di jalanan Kalkuta.",
        ],
      },
      {
        title: "Bab II — Sari Putih Bergaris Biru",
        paragraphs: [
          "Dengan hanya lima rupee di saku dan mengenakan sari katun putih murah bergaris biru, Bunda Teresa melangkah keluar dari biara yang nyaman menuju kawasan kumuh. Ia mendirikan Kongregasi Misionaris Cinta Kasih dan membuka Rumah bagi Orang yang Sekarat (Nirmal Hriday), agar mereka yang ditinggalkan dunia bisa wafat dengan bermartabat dan dicintai.",
          "Ketika dunia menganugerahinya Hadiah Nobel Perdamaian pada 1979, ia meminta jamuan makan malam mewah dibatalkan dan dananya diberikan untuk memberi makan ribuan orang miskin di India.",
        ],
      },
      {
        title: "Bab III — Cahaya di Tengah Malam Gelap Jiwa",
        paragraphs: [
          "Setelah wafatnya pada 5 September 1997, surat-surat pribadinya mengungkapkan rahasia rohani yang menggetarkan: selama hampir lima puluh tahun, Bunda Teresa mengalami 'malam gelap jiwa' — kekeringan rohani yang panjang — namun ia tetap tersenyum dan melayani tanpa henti.",
          "Ia menyebut dirinya hanyalah 'sebatang pensil kecil di tangan Tuhan yang sedang menulis surat cinta kepada dunia'.",
        ],
      },
    ],
    reflection: "Kasih sejati tidak menunggu perasaan hangat; kasih adalah keputusan setia untuk melayani wajah Kristus yang tersembunyi dalam diri sesama yang membutuhkan.",
    prayer: "Santa Teresa dari Kalkuta, ajarilah kami melihat wajah Yesus dalam setiap orang yang kami jumpai hari ini, dan melayani mereka dengan senyum tulus. Amin.",
  },
  {
    slug: "carlo-acutis",
    name: "Santo Carlo Acutis",
    subtitle: "Rasul Ekaristi di Era Digital",
    feastDay: "12 Oktober",
    era: "1991 – 2006",
    patronOf: "Pelindung Internet & Kaum Muda Digital",
    quote: "Ekaristi adalah jalan tolku menuju Surga. Semua orang dilahirkan asli, tetapi banyak yang mati sebagai fotokopi.",
    coverFrom: "#153243",
    coverTo: "#0a1922",
    keywords: ["carlo acutis", "beato carlo acutis"],
    chapters: [
      {
        title: "Bab I — Remaja Biasa dengan Cinta Luar Biasa",
        paragraphs: [
          "Carlo Acutis lahir di London pada 3 Mei 1991 dan dibesarkan di Milan, Italia. Ia tampak seperti remaja modern pada umumnya: suka mengenakan jaket olahraga, bermain PlayStation, mencintai anjing peliharaannya, dan sangat berbakat dalam pemrograman komputer.",
          "Namun sejak menerima Komuni Pertama pada usia tujuh tahun, Carlo tidak pernah melewatkan Misa harian. Baginya, Tabernakel bukanlah tempat sunyi yang membosankan, melainkan tempat di mana Sahabat terbaiknya selalu menunggu.",
        ],
      },
      {
        title: "Bab II — Menggunakan Teknologi untuk Tuhan",
        paragraphs: [
          "Alih-alih tenggelam dalam game atau media sosial, Carlo membatasi waktu bermainnya hanya satu jam seminggu. Ia menggunakan bakat komputernya untuk mendokumentasikan lebih dari seratus mukjizat Ekaristi di seluruh dunia ke dalam sebuah situs web yang kini dipamerkan di ribuan paroki.",
          "Di luar dunia maya, Carlo dikenal membela teman sekolah yang dirundung dan menggunakan uang sakunya untuk membeli kantong tidur serta makanan hangat bagi para tunawisma di Milan.",
        ],
      },
      {
        title: "Bab III — Pulang dengan Senyum di Usia 15 Tahun",
        paragraphs: [
          "Pada Oktober 2006, Carlo didiagnosis menderita leukemia akut yang sangat ganas. Dengan ketenangan luar biasa, ia mempersembahkan seluruh rasa sakitnya bagi Paus dan Gereja. Ia berkata kepada ibunya, 'Aku bahagia mati karena aku menjalani hidupku tanpa menyia-nyiakan satu menit pun untuk hal-hal yang tidak berkenan kepada Tuhan.'",
          "Ia wafat pada 12 Oktober 2006 di usia 15 tahun dan dimakamkan di Assisi sesuai keinginannya, menjadi teladan nyata bahwa kekudusan mungkin diraih di zaman ponsel dan internet.",
        ],
      },
    ],
    reflection: "Teknologi dan layar ponsel kita bisa menjadi ladang misi yang indah bila kita memakainya dengan bijak dan selalu mendahulukan Tuhan di atas segalanya.",
    prayer: "Santo Carlo Acutis, doakanlah kami agar mencintai Ekaristi dengan segenap hati dan menggunakan bakat serta teknologi kami untuk kemuliaan Tuhan. Amin.",
  },
  {
    slug: "agustinus-hippo",
    name: "Santo Agustinus dari Hippo",
    subtitle: "Dari Kegelisahan Menuju Cahaya Kebenaran",
    feastDay: "28 Agustus",
    era: "354 – 430",
    patronOf: "Pelindung Para Teolog & Pencari Kebenaran",
    quote: "Engkau telah menciptakan kami bagi-Mu, ya Tuhan, dan hati kami gelisah sampai ia beristirahat di dalam Engkau.",
    coverFrom: "#382214",
    coverTo: "#150c06",
    keywords: ["agustinus dari hippo", "agustinus", "augustine of hippo"],
    chapters: [
      {
        title: "Bab I — Pemuda Cerdas yang Tersesat",
        paragraphs: [
          "Aurelius Agustinus lahir di Tagaste, Afrika Utara, pada tahun 354. Ibunya, Santa Monika, adalah seorang Kristiani yang saleh dan tak pernah berhenti menangis dalam doa bagi pertobatan putranya.",
          "Agustinus memiliki kecerdasan luar biasa sebagai guru retorika, tetapi masa mudanya penuh pencarian yang salah arah: mengejar kesenangan duniawi, ambisi karier, dan ajaran sesat. Meski meraih kesuksesan di Kartago dan Roma, hatinya tetap terasa kosong dan gelisah.",
        ],
      },
      {
        title: "Bab II — Ambillah dan Bacalah!",
        paragraphs: [
          "Di Milan, Agustinus mulai mendengarkan khotbah Uskup Santo Ambrosius yang membuka pikirannya terhadap keindahan Kitab Suci. Suatu sore di taman, dalam pergulatan batin yang hebat, ia mendengar suara anak kecil dari balik tembok berulang kali menyerukan: 'Tolle, lege! Ambillah dan bacalah!'",
          "Ia membuka surat Paulus kepada jemaat di Roma (Rm 13:13-14) dan seketika seluruh keraguan di hatinya sirna. Ia dibaptis pada malam Paskah tahun 387, memenuhi doa panjang ibunya, Santa Monika.",
        ],
      },
      {
        title: "Bab III — Gembala & Pujangga Gereja",
        paragraphs: [
          "Kembali ke Afrika, Agustinus ditahbiskan menjadi imam lalu diangkat menjadi Uskup Hippo. Selama lebih dari tiga puluh tahun ia melayani umatnya dan menulis karya-karya agung seperti 'Pengakuan-Pengakuan' (Confessiones) dan 'Kota Allah' yang membentuk pemikiran Gereja hingga hari ini.",
          "Ia berseru dengan penuh penyesalan sekaligus syukur: 'Terlambat aku mencintai-Mu, ya Keindahan yang begitu purba dan begitu baru!' Ia wafat pada 28 Agustus 430 sambil mendaraskan Mazmur tobat.",
        ],
      },
    ],
    reflection: "Tidak pernah ada kata terlambat untuk kembali kepada Tuhan; kegelisahan hati kita sesungguhnya adalah kerinduan jiwa untuk pulang kepada Sang Pencipta.",
    prayer: "Santo Agustinus, doakanlah kami yang sering bimbang dan lelah, agar hati kami menemukan ketenangan sejati di dalam kasih Allah. Amin.",
  },
  {
    slug: "faustina-kowalska",
    name: "Santa Faustina Kowalska",
    subtitle: "Sekretaris Kerahiman Ilahi",
    feastDay: "5 Oktober",
    era: "1905 – 1938",
    patronOf: "Rasul Kerahiman Ilahi",
    quote: "Yesus, aku percaya kepada-Mu!",
    coverFrom: "#3d1822",
    coverTo: "#121a2d",
    keywords: ["faustina kowalska", "faustina", "maria faustina"],
    chapters: [
      {
        title: "Bab I — Gadis Sederhana dari Głogowiec",
        paragraphs: [
          "Helena Kowalska lahir di sebuah desa miskin di Polandia pada 25 Agustus 1905. Ia hanya mengenyam tiga tahun sekolah dasar dan sejak remaja bekerja sebagai pembantu rumah tangga untuk membantu orang tuanya.",
          "Pada usia 20 tahun, setelah mendapat penglihatan Yesus yang menderita, ia mengetuk pintu berbagai biara hingga akhirnya diterima di Kongregasi Suster-Suster Bunda Belas Kasih dengan nama Suster Maria Faustina. Di biara ia bertugas sebagai juru masak, tukang kebun, dan penjaga pintu.",
        ],
      },
      {
        title: "Bab II — Sinar Merah dan Putih dari Hati Yesus",
        paragraphs: [
          "Pada 22 Februari 1931, di kamar biaranya di Płock, Yesus menampakkan diri kepada Suster Faustina dengan jubah putih, satu tangan terangkat memberkati, dan dari dada-Nya memancar dua berkas sinar — satu pucat (lambang air yang menyucikan jiwa) dan satu merah (lambang darah kehidupan).",
          "Yesus memintanya melukis gambar itu dengan tulisan 'Yesus, Engkau Andalanku' (Yesus, aku percaya kepada-Mu), mengajarkan Doa Koronka Kerahiman Ilahi pada pukul tiga sore, dan mencatat segala pesan kasih-Nya dalam Buku Harian (Diary).",
        ],
      },
      {
        title: "Bab III — Pesan Pengharapan bagi Dunia",
        paragraphs: [
          "Meski tubuhnya rapuh oleh tuberkulosis dan pesannya sempat diragukan, Faustina tetap taat dan rendah hati. Ia wafat pada 5 Oktober 1938 di usia 33 tahun.",
          "Pada tahun 2000, Paus Yohanes Paulus II mengkanonisasikannya dan menetapkan Minggu setelah Paskah sebagai Minggu Kerahiman Ilahi bagi seluruh Gereja di dunia.",
        ],
      },
    ],
    reflection: "Sebesar apa pun dosa atau kegagalan kita, samudra Kerahiman Tuhan jauh lebih luas; yang Dia minta hanyalah kepercayaan kita.",
    prayer: "Yesus, aku percaya kepada-Mu. Santa Faustina, doakanlah kami agar selalu hidup dalam kerahiman Allah dan menjadi saluran belas kasih bagi sesama. Amin.",
  },
  {
    slug: "ignatius-loyola",
    name: "Santo Ignatius dari Loyola",
    subtitle: "Prajurit yang Menjadi Peziarah Kristus",
    feastDay: "31 Juli",
    era: "1491 – 1556",
    patronOf: "Pelindung Retret Rohani & Para Prajurit",
    quote: "Ad Majorem Dei Gloriam — Demi Kemuliaan Allah yang Lebih Besar.",
    coverFrom: "#2e1918",
    coverTo: "#130909",
    keywords: ["ignatius dari loyola", "ignatius loyola", "ignatius of loyola"],
    chapters: [
      {
        title: "Bab I — Peluru Meriam di Pamplona",
        paragraphs: [
          "Íñigo López de Loyola lahir di kastil bangsawan Basque, Spanyol, pada 1491. Ia bermimpi meraih kehormatan sebagai ksatria istana yang gagah berani.",
          "Pada Mei 1521, saat mempertahankan benteng Pamplona melawan pasukan Prancis, sebuah peluru meriam menghantam dan mematahkan kakinya. Pemulihan yang panjang memaksanya terbaring berbulan-bulan di kastil Loyola.",
        ],
      },
      {
        title: "Bab II — Dua Buku yang Mengubah Arah Hidup",
        paragraphs: [
          "Karena bosan, ia meminta novel kisah kepahlawanan, tetapi di kastil itu hanya ada dua buku: Riwayat Hidup Kristus dan Kisah Para Kudus. Saat membacanya, Ignatius mulai memperhatikan gerak hatinya sendiri: khayalan tentang kemuliaan dunia memberi kesenangan sesaat lalu meninggalkan kekosongan, sedangkan membayangkan melayani Kristus meninggalkan damai yang mendalam.",
          "Itulah lahirnya seni 'Diskresi Roh' (pembedaan roh). Setelah sembuh, ia meletakkan pedangnya di altar Bunda Maria di Montserrat dan pergi ke gua Manresa untuk berdoa, tempat ia menuliskan buku klasik 'Latihan Rohani'.",
        ],
      },
      {
        title: "Bab III — Serikat Yesus untuk Seluruh Dunia",
        paragraphs: [
          "Ignatius belajar teologi di Paris bersama sahabat-sahabatnya termasuk Santo Fransiskus Xaverius. Bersama mereka, ia mendirikan Serikat Yesus (Jesuit) pada tahun 1540 dengan semangat menemukan Allah dalam segala hal dan siap diutus ke ujung bumi.",
          "Ia wafat di Roma pada 31 Juli 1556, meninggalkan warisan spiritualitas yang membantu jutaan orang mengenali kehendak Tuhan dalam kehidupan sehari-hari.",
        ],
      },
    ],
    reflection: "Terkadang rencana kita yang patah justru menjadi pintu bagi Tuhan untuk menunjukkan panggilan hidup yang jauh lebih mulia.",
    prayer: "Ambillah, ya Tuhan, kebebasanku, kehendakku, akal budiku, dan seluruh milikku. Berikanlah aku kasih dan rahmat-Mu, sebab itu saja sudah cukup bagiku. Amin.",
  },
  {
    slug: "santo-yosef",
    name: "Santo Yosef",
    subtitle: "Penjaga Hening Keluarga Kudus",
    feastDay: "19 Maret",
    era: "Abad ke-1",
    patronOf: "Pelindung Gereja Semesta, Para Ayah & Pekerja",
    quote: "Dalam keheningan dan ketaatan penuh, ia menjaga Sang Putra Allah dengan tangan pekerja.",
    coverFrom: "#292215",
    coverTo: "#110e08",
    keywords: ["santo yosef", "yosef suami maria", "saint joseph"],
    chapters: [
      {
        title: "Bab I — Tukang Kayu yang Tulus Hati",
        paragraphs: [
          "Di desa kecil Nazaret, hiduplah seorang tukang kayu dari keturunan Raja Daud bernama Yosef. Kitab Suci tidak mencatat satu kata pun yang keluar dari mulutnya, namun menyebutnya dengan gelar paling mulia: 'seorang yang tulus hati'.",
          "Ketika ia mengetahui Maria, tunangannya, mengandung sebelum mereka hidup bersama, Yosef tidak ingin mencemarkan namanya. Dalam mimpi, malaikat Tuhan meyakinkannya bahwa Anak itu berasal dari Roh Kudus. Tanpa ragu, Yosef bangun dan segera melaksanakan perintah Tuhan.",
        ],
      },
      {
        title: "Bab II — Pelindung di Tengah Malam",
        paragraphs: [
          "Yosef membimbing Maria menuju Betlehem, menyediakan tempat berlindung di kandang sederhana saat Yesus lahir, dan segera membawa Keluarga Kudus mengungsi ke Mesir di tengah malam ketika Herodes mengancam nyawa Sang Bayi.",
          "Sekembalinya ke Nazaret, dengan peluh di dahinya sebagai tukang kayu, Yosef mendidik Yesus bekerja, berdoa, dan bertumbuh dalam hikmat.",
        ],
      },
      {
        title: "Bab III — Teladan Kesetiaan Tanpa Sorotan",
        paragraphs: [
          "Tradisi Gereja meyakini Santo Yosef wafat dengan damai dalam pelukan Yesus dan Maria sebelum Yesus memulai karya publik-Nya — karena itulah ia dihormati sebagai pelindung kematian yang bahagia.",
          "Pada tahun 1870, Paus Pius IX mengangkat Santo Yosef sebagai Pelindung Gereja Semesta.",
        ],
      },
    ],
    reflection: "Kesetiaan sejati tidak selalu membutuhkan panggung dan kata-kata; hadir dengan tanggung jawab dan kasih dalam keluarga setiap hari adalah ibadah yang kudus.",
    prayer: "Santo Yosef, penjaga Keluarga Kudus, lindungilah keluarga kami, berkatilah pekerjaan tangan kami, dan bimbinglah kami agar selalu taat kepada kehendak Allah. Amin.",
  },
  {
    slug: "antonius-padua",
    name: "Santo Antonius dari Padua",
    subtitle: "Pengkhotbah Injil & Sahabat Kaum Miskin",
    feastDay: "13 Juni",
    era: "1195 – 1231",
    patronOf: "Pelindung Barang Hilang & Kaum Miskin",
    quote: "Tindakan berbicara lebih lantang daripada kata-kata; biarlah kata-katamu mengajar dan tindakanmu berbicara.",
    coverFrom: "#2a1f16",
    coverTo: "#120d09",
    keywords: ["antonius dari padua", "antonius padua", "anthony of padua"],
    chapters: [
      {
        title: "Bab I — Dari Lisbon Menuju Jubah Fransiskan",
        paragraphs: [
          "Fernando Martins lahir di Lisbon, Portugal, pada 1195 dari keluarga bangsawan. Awalnya ia bergabung dengan biarawan Agustinian dan tekun mempelajari Kitab Suci hingga hafal luar kepala.",
          "Tergerak oleh kesaksian para martir Fransiskan yang gugur di Maroko, ia pindah ke Ordo Fransiskan dan mengambil nama Antonius. Badai laut menggagalkan perjalanannya ke Afrika dan justru membawanya terdampar di Italia.",
        ],
      },
      {
        title: "Bab II — Harta Karun Kitab Suci yang Terungkap",
        paragraphs: [
          "Di Italia, Antonius hidup sangat sederhana mencuci piring di biara terpencil tanpa seorang pun tahu kecerdasannya. Suatu hari pada upacara tahbisan, pembicara yang dijadwalkan berhalangan hadir dan pemimpin menunjuk Antonius untuk berkhotbah secara mendadak.",
          "Begitu ia membuka mulut, kebijaksanaan dan kefasihannya memukau semua orang. Santo Fransiskus sendiri memercayainya mengajar teologi kepada para saudara. Khotbahnya begitu berapi-api hingga gereja-gereja tidak sanggup menampung umat, memaksanya berkhotbah di lapangan terbuka.",
        ],
      },
      {
        title: "Bab III — Roti Santo Antonius",
        paragraphs: [
          "Antonius membela kaum miskin dari penindasan rentenir dan membawa banyak orang kembali kepada pertobatan. Ia wafat di dekat Padua pada 13 Juni 1231 pada usia 35 tahun, dan dikanonisasi kurang dari setahun kemudian — salah satu proses kanonisasi tercepat dalam sejarah Gereja.",
        ],
      },
    ],
    reflection: "Hidup yang selaras antara sabda dan perbuatan memiliki kekuatan luar biasa untuk menyentuh hati orang lain.",
    prayer: "Santo Antonius dari Padua, bantulah kami menemukan kembali apa yang hilang — terutama damai, iman, dan kasih kepada Tuhan. Amin.",
  },
  {
    slug: "yohanes-bosco",
    name: "Santo Yohanes Bosco",
    subtitle: "Bapa dan Guru Kaum Muda",
    feastDay: "31 Januari",
    era: "1815 – 1888",
    patronOf: "Pelindung Kaum Muda, Pelajar & Penerbit",
    quote: "Cukuplah bahwa kalian masih muda agar aku sangat mengasihi kalian.",
    coverFrom: "#182838",
    coverTo: "#0b131b",
    keywords: ["yohanes bosco", "don bosco", "john bosco"],
    chapters: [
      {
        title: "Bab I — Mimpi di Usia Sembilan Tahun",
        paragraphs: [
          "Giovanni Bosco lahir di desa kecil Becchi, Italia, pada 16 Agustus 1815. Ayahnya meninggal saat ia baru berusia dua tahun, sehingga ibunya, Mama Margherita, membesarkannya dalam iman yang hangat dan kerja keras.",
          "Pada usia sembilan tahun, ia mendapat mimpi profetis: sekelompok anak nakal yang berkelahi berubah menjadi domba-domba lembut bukan lewat pukulan, melainkan lewat kebaikan dan kasih sayang. Mimpi itu menuntun seluruh panggilan hidupnya.",
        ],
      },
      {
        title: "Bab II — Oratorium Sukacita di Turin",
        paragraphs: [
          "Setelah ditahbiskan menjadi imam di Turin, Don Bosco melihat ratusan anak muda miskin dan yatim piatu berkeliaran di jalanan kota industri tanpa pendidikan maupun harapan. Ia mengumpulkan mereka di sebuah halaman terbuka yang ia sebut Oratorium.",
          "Ia bermain akrobat, sulap, dan musik bersama mereka, lalu mengajar mereka membaca, keterampilan tukang, dan katekismus. Metode pendidikannya yang terkenal — Sistem Preventif — bertumpu pada tiga pilar: akal budi, iman, dan kasih sayang.",
        ],
      },
      {
        title: "Bab III — Warisan bagi Jutaan Anak Muda",
        paragraphs: [
          "Dari anak-anak didiknya sendiri, Don Bosco mendirikan Serikat Salesian (SDB) dan bersama Santa Maria Mazzarello mendirikan Suster-Suster Putri Maria Penolong Umat Kristiani.",
          "Ia wafat pada 31 Januari 1888 setelah mengabdikan seluruh tenaganya bagi kaum muda. Hingga kini sekolah dan rumah pembinaan Salesian melayani jutaan anak muda di seluruh dunia.",
        ],
      },
    ],
    reflection: "Kebaikan hati, kesabaran, dan sukacita mampu mengubah hati yang paling keras sekalipun jauh lebih efektif daripada kemarahan.",
    prayer: "Santo Yohanes Bosco, doakanlah para orang muda dan pendidik di seluruh dunia agar selalu bertumbuh dalam sukacita dan kasih Kristus. Amin.",
  },
];

export function getFamousSaintBySlug(slug: string): FamousSaint | null {
  return FAMOUS_SAINTS.find((s) => s.slug === slug) ?? null;
}

export function findFamousSaintByName(name: string): FamousSaint | null {
  const norm = name.toLowerCase().trim();
  if (!norm) return null;
  return (
    FAMOUS_SAINTS.find(
      (s) =>
        norm.includes(s.name.toLowerCase()) ||
        s.keywords.some((k) => norm.includes(k)),
    ) ?? null
  );
}
