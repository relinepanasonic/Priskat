export interface BibleBook {
  no: number;
  abbr: string;
  name: string;
  name_en: string;
  chapter: number;
}

export const OLD_TESTAMENT: BibleBook[] = [
  {"no":1,"abbr":"Kej","name":"Kejadian","chapter":50,"name_en":"Genesis"},
  {"no":2,"abbr":"Kel","name":"Keluaran","chapter":40,"name_en":"Exodus"},
  {"no":3,"abbr":"Ima","name":"Imamat","chapter":27,"name_en":"Leviticus"},
  {"no":4,"abbr":"Bil","name":"Bilangan","chapter":36,"name_en":"Numbers"},
  {"no":5,"abbr":"Ula","name":"Ulangan","chapter":34,"name_en":"Deuteronomy"},
  {"no":6,"abbr":"Yos","name":"Yosua","chapter":24,"name_en":"Joshua"},
  {"no":7,"abbr":"Hak","name":"Hakim-hakim","chapter":21,"name_en":"Judges"},
  {"no":8,"abbr":"Rut","name":"Rut","chapter":4,"name_en":"Ruth"},
  {"no":9,"abbr":"1 Sam","name":"1 Samuel","chapter":31,"name_en":"1 Samuel"},
  {"no":10,"abbr":"2 Sam","name":"2 Samuel","chapter":24,"name_en":"2 Samuel"},
  {"no":11,"abbr":"1 Raj","name":"1 Raja-Raja","chapter":22,"name_en":"1 Kings"},
  {"no":12,"abbr":"2 Raj","name":"2 Raja-Raja","chapter":25,"name_en":"2 Kings"},
  {"no":13,"abbr":"1 Taw","name":"1 Tawarikh","chapter":29,"name_en":"1 Chronicles"},
  {"no":14,"abbr":"2 Taw","name":"2 Tawarikh","chapter":36,"name_en":"2 Chronicles"},
  {"no":15,"abbr":"Ezr","name":"Ezra","chapter":10,"name_en":"Ezra"},
  {"no":16,"abbr":"Neh","name":"Nehemia","chapter":13,"name_en":"Nehemiah"},
  {"no":17,"abbr":"Est","name":"Ester","chapter":10,"name_en":"Esther"},
  {"no":18,"abbr":"Ayb","name":"Ayub","chapter":42,"name_en":"Job"},
  {"no":19,"abbr":"Maz","name":"Mazmur","chapter":150,"name_en":"Psalms"},
  {"no":20,"abbr":"Ams","name":"Amsal","chapter":31,"name_en":"Proverbs"},
  {"no":21,"abbr":"Pkh","name":"Pengkhotbah","chapter":12,"name_en":"Ecclesiastes"},
  {"no":22,"abbr":"Kid","name":"Kidung Agung","chapter":8,"name_en":"Song of Solomon"},
  {"no":23,"abbr":"Yes","name":"Yesaya","chapter":66,"name_en":"Isaiah"},
  {"no":24,"abbr":"Yer","name":"Yeremia","chapter":52,"name_en":"Jeremiah"},
  {"no":25,"abbr":"Rat","name":"Ratapan","chapter":5,"name_en":"Lamentations"},
  {"no":26,"abbr":"Yeh","name":"Yehezkiel","chapter":48,"name_en":"Ezekiel"},
  {"no":27,"abbr":"Dan","name":"Daniel","chapter":12,"name_en":"Daniel"},
  {"no":28,"abbr":"Hos","name":"Hosea","chapter":14,"name_en":"Hosea"},
  {"no":29,"abbr":"Yoe","name":"Yoel","chapter":3,"name_en":"Joel"},
  {"no":30,"abbr":"Amo","name":"Amos","chapter":9,"name_en":"Amos"},
  {"no":31,"abbr":"Oba","name":"Obaja","chapter":1,"name_en":"Obadiah"},
  {"no":32,"abbr":"Yun","name":"Yunus","chapter":4,"name_en":"Jonah"},
  {"no":33,"abbr":"Mik","name":"Mikha","chapter":7,"name_en":"Micah"},
  {"no":34,"abbr":"Nah","name":"Nahum","chapter":3,"name_en":"Nahum"},
  {"no":35,"abbr":"Hab","name":"Habakuk","chapter":3,"name_en":"Habakkuk"},
  {"no":36,"abbr":"Zef","name":"Zefanya","chapter":3,"name_en":"Zephaniah"},
  {"no":37,"abbr":"Hag","name":"Hagai","chapter":2,"name_en":"Haggai"},
  {"no":38,"abbr":"Zak","name":"Zakharia","chapter":14,"name_en":"Zechariah"},
  {"no":39,"abbr":"Mal","name":"Maleakhi","chapter":4,"name_en":"Malachi"},
];

export const NEW_TESTAMENT: BibleBook[] = [
  {"no":40,"abbr":"Mat","name":"Matius","chapter":28,"name_en":"Matthew"},
  {"no":41,"abbr":"Mar","name":"Markus","chapter":16,"name_en":"Mark"},
  {"no":42,"abbr":"Luk","name":"Lukas","chapter":24,"name_en":"Luke"},
  {"no":43,"abbr":"Yoh","name":"Yohanes","chapter":21,"name_en":"John"},
  {"no":44,"abbr":"Kis","name":"Kisah Para Rasul","chapter":28,"name_en":"Acts"},
  {"no":45,"abbr":"Rom","name":"Roma","chapter":16,"name_en":"Romans"},
  {"no":46,"abbr":"1 Kor","name":"1 Korintus","chapter":16,"name_en":"1 Corinthians"},
  {"no":47,"abbr":"2 Kor","name":"2 Korintus","chapter":13,"name_en":"2 Corinthians"},
  {"no":48,"abbr":"Gal","name":"Galatia","chapter":6,"name_en":"Galatians"},
  {"no":49,"abbr":"Efe","name":"Efesus","chapter":6,"name_en":"Ephesians"},
  {"no":50,"abbr":"Flp","name":"Filipi","chapter":4,"name_en":"Philippians"},
  {"no":51,"abbr":"Kol","name":"Kolose","chapter":4,"name_en":"Colossians"},
  {"no":52,"abbr":"1 Tes","name":"1 Tesalonika","chapter":5,"name_en":"1 Thessalonians"},
  {"no":53,"abbr":"2 Tes","name":"2 Tesalonika","chapter":3,"name_en":"2 Thessalonians"},
  {"no":54,"abbr":"1 Tim","name":"1 Timotius","chapter":6,"name_en":"1 Timothy"},
  {"no":55,"abbr":"2 Tim","name":"2 Timotius","chapter":4,"name_en":"2 Timothy"},
  {"no":56,"abbr":"Tit","name":"Titus","chapter":3,"name_en":"Titus"},
  {"no":57,"abbr":"Flm","name":"Filemon","chapter":1,"name_en":"Philemon"},
  {"no":58,"abbr":"Ibr","name":"Ibrani","chapter":13,"name_en":"Hebrews"},
  {"no":59,"abbr":"Yak","name":"Yakobus","chapter":5,"name_en":"James"},
  {"no":60,"abbr":"1 Pet","name":"1 Petrus","chapter":5,"name_en":"1 Peter"},
  {"no":61,"abbr":"2 Pet","name":"2 Petrus","chapter":3,"name_en":"2 Peter"},
  {"no":62,"abbr":"1 Yoh","name":"1 Yohanes","chapter":5,"name_en":"1 John"},
  {"no":63,"abbr":"2 Yoh","name":"2 Yohanes","chapter":1,"name_en":"2 John"},
  {"no":64,"abbr":"3 Yoh","name":"3 Yohanes","chapter":1,"name_en":"3 John"},
  {"no":65,"abbr":"Yud","name":"Yudas","chapter":1,"name_en":"Jude"},
  {"no":66,"abbr":"Wah","name":"Wahyu","chapter":22,"name_en":"Revelation"}
];

export const DEUTEROCANONICA: BibleBook[] = [
  {"no":67,"abbr":"Tob","name":"Tobit","chapter":14,"name_en":"Tobit"},
  {"no":68,"abbr":"Ydt","name":"Yudit","chapter":16,"name_en":"Judith"},
  {"no":69,"abbr":"T.Est","name":"Tambahan Ester","chapter":6,"name_en":"Additions to Esther"},
  {"no":70,"abbr":"Keb","name":"Kebijaksanaan Salomo","chapter":19,"name_en":"Wisdom of Solomon"},
  {"no":71,"abbr":"Sir","name":"Yesus bin Sirakh","chapter":51,"name_en":"Sirach"},
  {"no":72,"abbr":"Bar","name":"Barukh","chapter":6,"name_en":"Baruch"},
  {"no":73,"abbr":"T.Dan","name":"Tambahan Daniel","chapter":3,"name_en":"Additions to Daniel"},
  {"no":74,"abbr":"1 Mak","name":"1 Makabe","chapter":16,"name_en":"1 Maccabees"},
  {"no":75,"abbr":"2 Mak","name":"2 Makabe","chapter":15,"name_en":"2 Maccabees"}
];

export const ALL_BIBLE_BOOKS: BibleBook[] = [...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA];
