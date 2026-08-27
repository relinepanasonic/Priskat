const BEEBLE_BOOK_IDS: Record<string, number> = {
  "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
  "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
  "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
  "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
  "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22,
  "Isaiah": 23, "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26,
  "Daniel": 27, "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31,
  "Jonah": 32, "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36,
  "Haggai": 37, "Zechariah": 38, "Malachi": 39,
  
  "Matthew": 40, "Mark": 41, "Luke": 42, "John": 43, "Acts": 44,
  "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47, "Galatians": 48,
  "Ephesians": 49, "Philippians": 50, "Colossians": 51, "1 Thessalonians": 52,
  "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55, "Titus": 56,
  "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60, "2 Peter": 61,
  "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65, "Revelation": 66
};

export async function fetchBibleVerse(reference: string, language: "en" | "id"): Promise<string> {
  // Try to parse the reference, e.g. "1 John 4:19" or "Genesis 1:1-3"
  // Remove " TB" if it was appended (user's screenshot shows "1 John 4:19 TB")
  const cleanRef = reference.replace(/\s*TB\s*$/, "").trim();
  const match = cleanRef.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  
  if (!match) {
    return `Could not parse reference: ${reference}`;
  }

  const bookName = match[1];
  const chapter = parseInt(match[2]);
  const verseStart = parseInt(match[3]);
  const verseEnd = match[4] ? parseInt(match[4]) : verseStart;

  if (language === "en") {
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(cleanRef)}?translation=web`);
      if (!res.ok) return "Verse not found in English.";
      const data = await res.json();
      return data.text.trim();
    } catch (e) {
      return "Failed to fetch English Bible text.";
    }
  } else {
    // Indonesian
    const beebleId = BEEBLE_BOOK_IDS[bookName];
    if (!beebleId) {
      return `Buku ${bookName} belum didukung dalam bahasa Indonesia.`;
    }
    
    try {
      const res = await fetch(`https://beeble.vercel.app/api/v1/passage/${beebleId}/${chapter}`);
      if (!res.ok) return "Ayat tidak ditemukan dalam bahasa Indonesia.";
      const json = await res.json();
      const verses = json.data?.verses || [];
      
      const filteredVerses = verses.filter((v: any) => v.type === "content" && v.verse >= verseStart && v.verse <= verseEnd);
      
      if (filteredVerses.length === 0) return "Ayat tidak ditemukan.";
      
      return filteredVerses.map((v: any) => v.content).join(" ");
    } catch (e) {
      return "Gagal mengambil teks Alkitab bahasa Indonesia.";
    }
  }
}
