const fs = require('fs');

const OLD_TESTAMENT = [
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
  {"no":39,"abbr":"Mal","name":"Maleakhi","chapter":4,"name_en":"Malachi"}
];

function getJsonName(otBook) {
  if (otBook.name_en === "Psalms") return "Psalm"; // json uses singular
  return otBook.name_en;
}

const rawData = fs.readFileSync('scratch/nrsvce.json', 'utf8');
const json = JSON.parse(rawData);

let currentPart = 1;
let currentBookCount = 0;
let sql = `-- NRSV-CE OLD TESTAMENT BIBLE VERSES (PART ${currentPart})\n\n`;

for (const ot of OLD_TESTAMENT) {
  console.log(`Processing ${ot.name_en}...`);
  const jsonName = getJsonName(ot);
  const bookData = json.bible.find(b => b.book === jsonName);
  
  if (!bookData) {
    console.log(`WARNING: Could not find ${ot.name_en} in JSON`);
    continue;
  }
  
  for (const chap of bookData.chapters) {
    const c = chap.chapter;
    let chunk = `INSERT INTO public.bible_verses (book_no, book_abbr, book_name, chapter, verse, content, language, translation, title) VALUES\n`;
    const values = [];
    for (const v of chap.verses) {
      let verseNum = v.verse;
      let text = String(v.text);
      let title = "NULL";
      const titleMatch = text.match(/\|\|(.*?)\|\|/);
      if (titleMatch) {
        title = `'${titleMatch[1].replace(/'/g, "''")}'`;
        text = text.replace(/\|\|.*?\|\|/g, '');
      }
      text = text.replace(/\[\^.*?\]/g, '').trim();
      text = text.replace(/'/g, "''"); // escape single quotes
      values.push(`(${ot.no}, '${ot.abbr}', '${ot.name_en}', ${c}, ${verseNum}, '${text}', 'en', 'NRSV-CE', ${title})`);
    }
    chunk += values.join(',\n') + ';\n\n';
    sql += chunk;
  }
  
  currentBookCount++;
  if (currentBookCount >= 2) {
    fs.writeFileSync(`supabase/068_seed_nrsvce_ot_part${currentPart}.sql`, sql);
    console.log(`Generated part ${currentPart}`);
    currentPart++;
    currentBookCount = 0;
    sql = `-- NRSV-CE OLD TESTAMENT BIBLE VERSES (PART ${currentPart})\n\n`;
  }
}

// Write whatever is left
if (currentBookCount > 0) {
  fs.writeFileSync(`supabase/068_seed_nrsvce_ot_part${currentPart}.sql`, sql);
  console.log(`Generated part ${currentPart}`);
}

console.log('Done! Generated split SQL files.');

