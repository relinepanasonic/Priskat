import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

// Old Testament Part 2 (11-22)
const OT_PART_2 = [
  { no: 11, abbr: "1raj", name: "1 Raja-Raja", chapters: 22 },
  { no: 12, abbr: "2raj", name: "2 Raja-Raja", chapters: 25 },
  { no: 13, abbr: "1taw", name: "1 Tawarikh", chapters: 29 },
  { no: 14, abbr: "2taw", name: "2 Tawarikh", chapters: 36 },
  { no: 15, abbr: "ezr", name: "Ezra", chapters: 10 },
  { no: 16, abbr: "neh", name: "Nehemia", chapters: 13 },
  { no: 17, abbr: "est", name: "Ester", chapters: 10 }, // Note: we skip deuterocanonical additions, Protestant Esther is 10 chapters. Imankatolik has "est" with 10 chapters + additions, we just scrape 1-10.
  { no: 18, abbr: "ayb", name: "Ayub", chapters: 42 },
  { no: 19, abbr: "mzm", name: "Mazmur", chapters: 150 },
  { no: 20, abbr: "ams", name: "Amsal", chapters: 31 },
  { no: 21, abbr: "pkh", name: "Pengkhotbah", chapters: 12 },
  { no: 22, abbr: "kid", name: "Kidung Agung", chapters: 8 }
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
  
  for (const book of OT_PART_2) {
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
      fs.writeFileSync(`supabase/013_part_${partIndex}.sql`, header + chunkStr + footer);
      partIndex++;
  }
  
  console.log(`Created ${partIndex - 1} safe chunks for OT Part 2.`);
}

main();
