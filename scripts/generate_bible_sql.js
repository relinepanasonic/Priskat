const fs = require('fs');

const BOOKS = [
  { id: 1, id_name: 'Kejadian', en_name: 'Genesis', abbrev: 'kej' },
  { id: 19, id_name: 'Mazmur', en_name: 'Psalms', abbrev: 'maz' },
  { id: 43, id_name: 'Yohanes', en_name: 'John', abbrev: 'yoh' },
];

async function generateSQL() {
  console.log("Fetching Bible data to generate SQL...");
  
  const targetChapters = [
    { book: BOOKS.find(b => b.abbrev === 'kej'), chapter: 3 },
    { book: BOOKS.find(b => b.abbrev === 'maz'), chapter: 23 },
    { book: BOOKS.find(b => b.abbrev === 'yoh'), chapter: 3 },
  ];

  let sqlString = `-- ==========================================\n`;
  sqlString += `-- BIBLE VERSES SEED DATA (TB & WEB)\n`;
  sqlString += `-- ==========================================\n\n`;

  for (const target of targetChapters) {
    const book = target.book;
    const chapter = target.chapter;
    console.log(`⏳ Fetching ${book.id_name} chapter ${chapter}...`);
    
    try {
      const tbRes = await fetch(`https://raw.githubusercontent.com/KenCodeDev/alkitab-json/master/alkitab-umum/${book.abbrev}${chapter}.json`);
      const tbData = await tbRes.json();
      
      const enRes = await fetch(`https://bible-api.com/${book.en_name}+${chapter}`);
      const enData = await enRes.json();

      for (const idVerse of tbData.kitab.ayat_ayat) {
        const vNum = parseInt(idVerse.ayat);
        const enVerse = enData.verses.find(v => v.verse === vNum);
        
        let idText = idVerse.isi.replace(/'/g, "''");
        let enText = enVerse ? enVerse.text.trim().replace(/'/g, "''") : "";

        sqlString += `INSERT INTO public.bible_verses (book_id, book_name_id, book_name_en, chapter, verse, text_id, text_en) VALUES `;
        sqlString += `(${book.id}, '${book.id_name}', '${book.en_name}', ${chapter}, ${vNum}, '${idText}', '${enText}');\n`;
      }
      
      sqlString += `\n`;
    } catch (error) {
      console.error(`Error fetching ${book.id_name} ${chapter}: ${error.message}`);
    }
  }

  fs.writeFileSync('supabase/migrations/007_seed_bible.sql', sqlString);
  console.log("✅ Created supabase/migrations/007_seed_bible.sql successfully!");
}

generateSQL();
