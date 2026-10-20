/**
 * Basic prayers in Aramaic, in the Syriac (Peshitta) form used by the Syriac and Maronite churches,
 * written in Latin letters. `say` is the same line spelled so that an Indonesian voice reads it close to
 * the real sound (there is no Aramaic text-to-speech voice, so the reading is only an approximation).
 */
export type AramaicLine = { aram: string; say: string; indo: string };
export type AramaicPrayer = { slug: string; title: string; indoTitle: string; lines: AramaicLine[] };

export const ARAMAIC_PRAYERS: AramaicPrayer[] = [
  {
    slug: "tanda-salib",
    title: "Tanda Salib",
    indoTitle: "Dalam nama Bapa",
    lines: [
      {
        aram: "B'shem Abo, wa-Bro, wa-Ruho d'Qudsho, Hodo Aloho. Amin.",
        say: "Besyem Abo, wa Bro, wa Rukho de Kudsyo, Kho do Alo ho. Amin.",
        indo: "Dalam nama Bapa, dan Putra, dan Roh Kudus, satu Allah. Amin.",
      },
    ],
  },
  {
    slug: "bapa-kami",
    title: "Bapa Kami (Abun d'bashmayo)",
    indoTitle: "Doa Tuhan",
    lines: [
      { aram: "Abun d'bashmayo,", say: "Abun debasymayo,", indo: "Bapa kami yang ada di surga," },
      { aram: "nethqadash shmokh.", say: "netkadasy syemokh.", indo: "dimuliakanlah nama-Mu." },
      { aram: "Tete malkuthokh.", say: "Tete malkutokh.", indo: "Datanglah kerajaan-Mu." },
      { aram: "Nehwe sebyonokh aykano d'bashmayo of b'ar'o.", say: "Nehwe sebyonokh aykano debasymayo of bar'o.", indo: "Jadilah kehendak-Mu di atas bumi seperti di dalam surga." },
      { aram: "Hab lan lahmo d'sunqonan yawmono.", say: "Hab lan lakhmo desunkonan yaumono.", indo: "Berilah kami rezeki pada hari ini." },
      { aram: "Washbuq lan hawbayn aykano d'of hnan shbaqan l'hayobayn.", say: "Wasybuk lan haubayn aykano dof khnan syebakan lekhayobayn.", indo: "Dan ampunilah kesalahan kami, seperti kami pun mengampuni yang bersalah kepada kami." },
      { aram: "Wela tahlan l'nesyuno, elo pasan men bisho.", say: "Wela takhlan lenesyuno, elo pasan men bisyo.", indo: "Dan janganlah masukkan kami ke dalam pencobaan, tetapi bebaskanlah kami dari yang jahat." },
      { aram: "Metul d'dilokh hi malkutho wahaylo wateshbuhto l'alam almin. Amin.", say: "Metul didilokh hi malkutho wakhaylo wateysbukhto lealam almin. Amin.", indo: "Sebab Engkaulah yang empunya kerajaan, kuasa, dan kemuliaan, sampai selama-lamanya. Amin." },
    ],
  },
  {
    slug: "salam-maria",
    title: "Salam Maria (Shlomo lekh Maryam)",
    indoTitle: "Doa kepada Bunda Maria",
    lines: [
      { aram: "Shlomo lekh Maryam, malyat taybuto, moran 'amekh.", say: "Syelomo lekh Maryam, malyat taibuto, moran amekh.", indo: "Salam, Maria, penuh rahmat, Tuhan sertamu." },
      { aram: "Mbarakhto at b'nosho, umbarakh hu feroh d'karsekh, Yeshu'.", say: "Mbarakhto at benosyo, umbarakh hu feroh dekarsekh, Yesyu.", indo: "Terpujilah engkau di antara wanita, dan terpujilah buah tubuhmu, Yesus." },
      { aram: "Qadishto Maryam, yoldat Aloho, sli 'layn hatoye,", say: "Kadisyto Maryam, yoldat Alo ho, seli alayn khatoye,", indo: "Santa Maria, Bunda Allah, doakanlah kami yang berdosa ini," },
      { aram: "hosho w'al sa'to d'mawtan. Amin.", say: "khosyo wal saato demautan. Amin.", indo: "sekarang dan waktu kami mati. Amin." },
    ],
  },
];
