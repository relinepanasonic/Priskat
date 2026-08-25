const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ensure you have these environment variables set, or replace them with your actual keys temporarily to run the script.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be the service_role key to bypass RLS for inserting

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BOOKS = [
  { id: 1, id_name: 'Kejadian', en_name: 'Genesis', chapters: 50, abbrev: 'kej' },
  { id: 2, id_name: 'Keluaran', en_name: 'Exodus', chapters: 40, abbrev: 'kel' },
  { id: 3, id_name: 'Imamat', en_name: 'Leviticus', chapters: 27, abbrev: 'ima' },
  { id: 4, id_name: 'Bilangan', en_name: 'Numbers', chapters: 36, abbrev: 'bil' },
  { id: 5, id_name: 'Ulangan', en_name: 'Deuteronomy', chapters: 34, abbrev: 'ula' },
  // For a full app, you would add all 66 books here.
  // We'll just seed a few chapters of Genesis, John, and Psalms for demonstration!
  { id: 19, id_name: 'Mazmur', en_name: 'Psalms', chapters: 150, abbrev: 'maz' },
  { id: 43, id_name: 'Yohanes', en_name: 'John', chapters: 21, abbrev: 'yoh' },
];

async function fetchChapter(book, chapter) {
  try {
    // 1. Fetch Indonesian TB
    const tbRes = await fetch(`https://raw.githubusercontent.com/KenCodeDev/alkitab-json/master/alkitab-umum/${book.abbrev}${chapter}.json`);
    if (!tbRes.ok) throw new Error(`TB fetch failed for ${book.abbrev}${chapter}`);
    const tbData = await tbRes.json();
    
    // 2. Fetch English WEB (World English Bible) from bible-api.com
    const enRes = await fetch(`https://bible-api.com/${book.en_name}+${chapter}`);
    if (!enRes.ok) throw new Error(`EN fetch failed for ${book.en_name} ${chapter}`);
    const enData = await enRes.json();

    const verses = [];
    
    // Align verses
    for (const idVerse of tbData.kitab.ayat_ayat) {
      const vNum = parseInt(idVerse.ayat);
      const enVerse = enData.verses.find(v => v.verse === vNum);
      
      verses.push({
        book_id: book.id,
        book_name_id: book.id_name,
        book_name_en: book.en_name,
        chapter: chapter,
        verse: vNum,
        text_id: idVerse.isi,
        text_en: enVerse ? enVerse.text.trim() : null
      });
    }

    return verses;
  } catch (error) {
    console.error(`❌ Error fetching ${book.id_name} ${chapter}: ${error.message}`);
    return [];
  }
}

async function seedBible() {
  console.log("🚀 Starting Bible Seeding Process...");
  
  // For this demonstration, we'll just seed Genesis 1, Psalms 23, and John 3.
  // (In a real scenario, you'd loop through all chapters of all books)
  const targetChapters = [
    { book: BOOKS.find(b => b.abbrev === 'kej'), chapter: 1 },
    { book: BOOKS.find(b => b.abbrev === 'maz'), chapter: 23 },
    { book: BOOKS.find(b => b.abbrev === 'yoh'), chapter: 3 },
  ];

  for (const target of targetChapters) {
    console.log(`⏳ Fetching ${target.book.id_name} chapter ${target.chapter}...`);
    const versesToInsert = await fetchChapter(target.book, target.chapter);
    
    if (versesToInsert.length > 0) {
      const { error } = await supabase.from('bible_verses').insert(versesToInsert);
      if (error) {
        console.error(`❌ Database insert error: ${error.message}`);
      } else {
        console.log(`✅ Successfully inserted ${versesToInsert.length} verses for ${target.book.id_name} ${target.chapter}!`);
      }
    }
  }

  console.log("🎉 Seeding complete!");
}

seedBible();
