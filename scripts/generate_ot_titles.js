const https = require('https');
const fs = require('fs');

const OLD_TESTAMENT = [
  {"no":1,"abbr":"Kej","name":"Kejadian","chapter":50},
  {"no":2,"abbr":"Kel","name":"Keluaran","chapter":40},
  {"no":3,"abbr":"Ima","name":"Imamat","chapter":27},
  {"no":4,"abbr":"Bil","name":"Bilangan","chapter":36},
  {"no":5,"abbr":"Ula","name":"Ulangan","chapter":34},
  {"no":6,"abbr":"Yos","name":"Yosua","chapter":24},
  {"no":7,"abbr":"Hak","name":"Hakim-hakim","chapter":21},
  {"no":8,"abbr":"Rut","name":"Rut","chapter":4},
  {"no":9,"abbr":"1Sam","name":"1 Samuel","chapter":31},
  {"no":10,"abbr":"2Sam","name":"2 Samuel","chapter":24},
  {"no":11,"abbr":"1Raj","name":"1 Raja-Raja","chapter":22},
  {"no":12,"abbr":"2Raj","name":"2 Raja-Raja","chapter":25},
  {"no":13,"abbr":"1Taw","name":"1 Tawarikh","chapter":29},
  {"no":14,"abbr":"2Taw","name":"2 Tawarikh","chapter":36},
  {"no":15,"abbr":"Ezr","name":"Ezra","chapter":10},
  {"no":16,"abbr":"Neh","name":"Nehemia","chapter":13},
  {"no":17,"abbr":"Est","name":"Ester","chapter":10},
  {"no":18,"abbr":"Ayb","name":"Ayub","chapter":42},
  {"no":19,"abbr":"Maz","name":"Mazmur","chapter":150},
  {"no":20,"abbr":"Ams","name":"Amsal","chapter":31},
  {"no":21,"abbr":"Pkh","name":"Pengkhotbah","chapter":12},
  {"no":22,"abbr":"Kid","name":"Kidung Agung","chapter":8},
  {"no":23,"abbr":"Yes","name":"Yesaya","chapter":66},
  {"no":24,"abbr":"Yer","name":"Yeremia","chapter":52},
  {"no":25,"abbr":"Rat","name":"Ratapan","chapter":5},
  {"no":26,"abbr":"Yeh","name":"Yehezkiel","chapter":48},
  {"no":27,"abbr":"Dan","name":"Daniel","chapter":12},
  {"no":28,"abbr":"Hos","name":"Hosea","chapter":14},
  {"no":29,"abbr":"Yoe","name":"Yoel","chapter":3},
  {"no":30,"abbr":"Amo","name":"Amos","chapter":9},
  {"no":31,"abbr":"Oba","name":"Obaja","chapter":1},
  {"no":32,"abbr":"Yun","name":"Yunus","chapter":4},
  {"no":33,"abbr":"Mik","name":"Mikha","chapter":7},
  {"no":34,"abbr":"Nah","name":"Nahum","chapter":3},
  {"no":35,"abbr":"Hab","name":"Habakuk","chapter":3},
  {"no":36,"abbr":"Zef","name":"Zefanya","chapter":3},
  {"no":37,"abbr":"Hag","name":"Hagai","chapter":2},
  {"no":38,"abbr":"Zak","name":"Zakharia","chapter":14},
  {"no":39,"abbr":"Mal","name":"Maleakhi","chapter":4}
];

function fetchChapter(abbr, chapter) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://beeble.vercel.app/api/v1/passage/${abbr}/${chapter}`, (resp) => {
      let data = '';
      resp.on('data', (chunk) => data += chunk);
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(null);
        }
      });
    });
    
    req.on("error", (err) => resolve(null));
    req.setTimeout(5000, () => {
      req.abort();
      resolve(null);
    });
  });
}

async function run() {
  fs.writeFileSync('supabase/066_seed_ot_titles.sql', `-- OLD TESTAMENT BIBLE TITLES\n`);
  
  for (const book of OLD_TESTAMENT) {
    console.log(`Processing ${book.name}...`);
    for (let c = 1; c <= book.chapter; c++) {
      let res = await fetchChapter(book.abbr, c);
      let retries = 3;
      while (!res && retries > 0) {
        console.log(`Retrying ${book.name} ${c}...`);
        await new Promise(r => setTimeout(r, 1000));
        res = await fetchChapter(book.abbr, c);
        retries--;
      }
      
      if (res && res.data && res.data.verses) {
        let sqlChunk = "";
        let currentTitle = null;
        for (const v of res.data.verses) {
          if (v.type === 'title') {
            currentTitle = v.content.replace(/'/g, "''");
          } else if (v.type === 'content') {
            if (currentTitle) {
              sqlChunk += `UPDATE public.bible_verses SET title = '${currentTitle}' WHERE book_no = ${book.no} AND chapter = ${c} AND verse = ${v.verse};\n`;
              currentTitle = null;
            }
          }
        }
        if (sqlChunk) {
          fs.appendFileSync('supabase/066_seed_ot_titles.sql', sqlChunk);
        }
      } else {
        console.log(`Failed to fetch ${book.name} ${c}`);
      }
      // Small delay to prevent rate limit
      await new Promise(r => setTimeout(r, 100)); 
    }
  }
  
  console.log('Done! Generated supabase/066_seed_ot_titles.sql');
}

run();

