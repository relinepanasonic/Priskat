import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

// Map of our Deuterocanonical books (67-75)
const DEUTERO_BOOKS = [
  { no: 67, abbr: "tob", name: "Tobit", chapters: 14 },
  { no: 68, abbr: "ydt", name: "Yudit", chapters: 16 },
  { no: 69, abbr: "est", name: "Tambahan Ester", chapters: 6 }, 
  { no: 70, abbr: "keb", name: "Kebijaksanaan Salomo", chapters: 19 },
  { no: 71, abbr: "sir", name: "Yesus bin Sirakh", chapters: 51 },
  { no: 72, abbr: "bar", name: "Barukh", chapters: 6 },
  { no: 73, abbr: "dan", name: "Tambahan Daniel", chapters: 3 }, 
  { no: 74, abbr: "1mak", name: "1 Makabe", chapters: 16 },
  { no: 75, abbr: "2mak", name: "2 Makabe", chapters: 15 }
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
          
          // Ref text looks like "Tob 1:2" or "1Mak 2:1"
          // We just need the number after the colon
          const match = refText.match(/:(\d+)$/);
          if (match) {
              const verseNo = parseInt(match[1]);
              // Basic sanitization
              contentText = contentText.replace(/'/g, "''"); // escape single quotes for SQL
              verses.push(`  ('${book.no}', '${book.abbr}', '${book.name}', ${chapterNo}, ${verseNo}, '${contentText}', 'id', 'Deutero')`);
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
  
  for (const book of DEUTERO_BOOKS) {
      // NOTE: Tambahan Ester is Est 11-16 in Catholic bibles, but on imankatolik it might just be the full Ester with Greek additions. 
      // Tambahan Daniel is Dan 3:24-90, 13, 14. 
      // For now, let's just scrape the chapters we mapped.
      // Wait, actually Tambahan Ester and Daniel are merged in imankatolik's "est" and "dan".
      // Let's just scrape Tobit, Yudit, Kebijaksanaan, Sirakh, Barukh, 1 Makabe, 2 Makabe first to avoid complex merging.
      
      if (book.abbr === 'est' || book.abbr === 'dan') {
          console.log(`Skipping ${book.name} for now (needs manual mapping of chapters)`);
          continue;
      }
      
      for (let c = 1; c <= book.chapters; c++) {
          const verses = await scrapeChapter(book, c);
          allValues.push(...verses);
          // Wait a bit to not overwhelm the server
          await new Promise(r => setTimeout(r, 200));
      }
  }
  
  sql += allValues.join(",\n") + ";\n";
  fs.writeFileSync("supabase/seed_deuterocanonicals.sql", sql);
  console.log("Written to supabase/seed_deuterocanonicals.sql");
}

main();
