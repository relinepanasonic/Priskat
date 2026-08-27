import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

// Old Testament Part 3 (23-39)
const OT_PART_3 = [
  { no: 23, abbr: "yes", name: "Yesaya", chapters: 66 },
  { no: 24, abbr: "yer", name: "Yeremia", chapters: 52 },
  { no: 25, abbr: "rat", name: "Ratapan", chapters: 5 },
  { no: 26, abbr: "yeh", name: "Yehezkiel", chapters: 48 },
  { no: 27, abbr: "dan", name: "Daniel", chapters: 12 },
  { no: 28, abbr: "hos", name: "Hosea", chapters: 14 },
  { no: 29, abbr: "yl", name: "Yoel", chapters: 3 },
  { no: 30, abbr: "am", name: "Amos", chapters: 9 },
  { no: 31, abbr: "ob", name: "Obaja", chapters: 1 },
  { no: 32, abbr: "yun", name: "Yunus", chapters: 4 },
  { no: 33, abbr: "mi", name: "Mikha", chapters: 7 },
  { no: 34, abbr: "nah", name: "Nahum", chapters: 3 },
  { no: 35, abbr: "hab", name: "Habakuk", chapters: 3 },
  { no: 36, abbr: "zef", name: "Zefanya", chapters: 3 },
  { no: 37, abbr: "hag", name: "Hagai", chapters: 2 },
  { no: 38, abbr: "za", name: "Zakharia", chapters: 14 },
  { no: 39, abbr: "mal", name: "Maleakhi", chapters: 4 }
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
  
  for (const book of OT_PART_3) {
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
      fs.writeFileSync(`supabase/014_part_${partIndex}.sql`, header + chunkStr + footer);
      partIndex++;
  }
  
  console.log(`Created ${partIndex - 1} safe chunks for OT Part 3.`);
}

main();
