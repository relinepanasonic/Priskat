import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

// New Testament (40-66)
const NT_BOOKS = [
  { no: 40, abbr: "mat", name: "Matius", chapters: 28 },
  { no: 41, abbr: "mrk", name: "Markus", chapters: 16 },
  { no: 42, abbr: "luk", name: "Lukas", chapters: 24 },
  { no: 43, abbr: "yoh", name: "Yohanes", chapters: 21 },
  { no: 44, abbr: "kis", name: "Kisah Para Rasul", chapters: 28 },
  { no: 45, abbr: "rm", name: "Roma", chapters: 16 },
  { no: 46, abbr: "1kor", name: "1 Korintus", chapters: 16 },
  { no: 47, abbr: "2kor", name: "2 Korintus", chapters: 13 },
  { no: 48, abbr: "gal", name: "Galatia", chapters: 6 },
  { no: 49, abbr: "ef", name: "Efesus", chapters: 6 },
  { no: 50, abbr: "flp", name: "Filipi", chapters: 4 },
  { no: 51, abbr: "kol", name: "Kolose", chapters: 4 },
  { no: 52, abbr: "1tes", name: "1 Tesalonika", chapters: 5 },
  { no: 53, abbr: "2tes", name: "2 Tesalonika", chapters: 3 },
  { no: 54, abbr: "1tim", name: "1 Timotius", chapters: 6 },
  { no: 55, abbr: "2tim", name: "2 Timotius", chapters: 4 },
  { no: 56, abbr: "tit", name: "Titus", chapters: 3 },
  { no: 57, abbr: "flm", name: "Filemon", chapters: 1 },
  { no: 58, abbr: "ibr", name: "Ibrani", chapters: 13 },
  { no: 59, abbr: "yak", name: "Yakobus", chapters: 5 },
  { no: 60, abbr: "1ptr", name: "1 Petrus", chapters: 5 },
  { no: 61, abbr: "2ptr", name: "2 Petrus", chapters: 3 },
  { no: 62, abbr: "1yoh", name: "1 Yohanes", chapters: 5 },
  { no: 63, abbr: "2yoh", name: "2 Yohanes", chapters: 1 },
  { no: 64, abbr: "3yoh", name: "3 Yohanes", chapters: 1 },
  { no: 65, abbr: "yud", name: "Yudas", chapters: 1 },
  { no: 66, abbr: "why", name: "Wahyu", chapters: 22 }
];

async function scrapeChapter(book, chapterNo) {
  try {
    const url = `http://www.imankatolik.or.id/alkitab.php?k=${book.abbr}&b=${chapterNo}&a1=1&a2=999`;
    console.log(`Fetching ${book.name} ${chapterNo}...`);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const verses = [];
    
    $("table tr").each((i, el) => {
      const cols = $(el).find("td");
      if (cols.length >= 2) {
          let refText = $(cols[0]).text().replace(/\s+/g, ' ').trim();
          let contentText = $(cols[1]).text().trim();
          
          const match = refText.match(/:(\d+)$/);
          if (match) {
              const verseNo = parseInt(match[1]);
              contentText = contentText.replace(/'/g, "''"); // escape single quotes for SQL
              verses.push(`  ('${book.no}', '${book.abbr}', '${book.name}', ${chapterNo}, ${verseNo}, '${contentText}', 'id', 'TB')`);
          }
      }
    });
    return verses;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function main() {
  const allValues = [];
  
  for (const book of NT_BOOKS) {
      for (let c = 1; c <= book.chapters; c++) {
          const verses = await scrapeChapter(book, c);
          allValues.push(...verses);
          // Wait to not overwhelm server
          await new Promise(r => setTimeout(r, 120));
      }
  }

  const header = `INSERT INTO public.bible_verses (book_no, book_abbr, book_name, chapter, verse, content, language, translation)\nVALUES\n`;
  const footer = `\nON CONFLICT DO NOTHING;\n`;
  const chunkSize = 2500;
  let partIndex = 1;

  for (let i = 0; i < allValues.length; i += chunkSize) {
      let chunk = allValues.slice(i, i + chunkSize);
      let chunkStr = chunk.join(",\n");
      fs.writeFileSync(`supabase/015_part_${partIndex}.sql`, header + chunkStr + footer);
      partIndex++;
  }
  
  console.log(`Created ${partIndex - 1} safe chunks for New Testament.`);
}

main();
