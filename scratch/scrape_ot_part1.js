import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

// Old Testament Part 1
const OT_PART_1 = [
  { no: 1, abbr: "kej", name: "Kejadian", chapters: 50 },
  { no: 2, abbr: "kel", name: "Keluaran", chapters: 40 },
  { no: 3, abbr: "im", name: "Imamat", chapters: 27 },
  { no: 4, abbr: "bil", name: "Bilangan", chapters: 36 },
  { no: 5, abbr: "ul", name: "Ulangan", chapters: 34 },
  { no: 6, abbr: "yos", name: "Yosua", chapters: 24 },
  { no: 7, abbr: "hak", name: "Hakim-Hakim", chapters: 21 },
  { no: 8, abbr: "rut", name: "Rut", chapters: 4 },
  { no: 9, abbr: "1sam", name: "1 Samuel", chapters: 31 },
  { no: 10, abbr: "2sam", name: "2 Samuel", chapters: 24 }
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
  let sql = `INSERT INTO public.bible_verses (book_no, book_abbr, book_name, chapter, verse, content, language, translation)\nVALUES\n`;
  const allValues = [];
  
  for (const book of OT_PART_1) {
      for (let c = 1; c <= book.chapters; c++) {
          const verses = await scrapeChapter(book, c);
          allValues.push(...verses);
          // Wait to not overwhelm server
          await new Promise(r => setTimeout(r, 150));
      }
  }
  
  sql += allValues.join(",\n") + "\nON CONFLICT DO NOTHING;\n";
  fs.writeFileSync("supabase/012_seed_ot_part1.sql", sql);
  console.log("Written to supabase/012_seed_ot_part1.sql");
}

main();
