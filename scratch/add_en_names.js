const fs = require('fs');

const OLD_TESTAMENT_EN = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"];
const NEW_TESTAMENT_EN = ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];
const DEUTEROCANONICA_EN = ["Tobit", "Judith", "Additions to Esther", "Wisdom of Solomon", "Sirach", "Baruch", "Additions to Daniel", "1 Maccabees", "2 Maccabees"];

let content = fs.readFileSync("src/app/(public)/faith/bible/page.tsx", "utf8");

// Parse the arrays out of the file using a regex or just replace lines
function updateArray(text, arrName, enNames) {
  const regex = new RegExp(`const ${arrName} = \\[([\\s\\S]*?)\\];`);
  const match = text.match(regex);
  if (!match) return text;
  
  let rows = match[1].split('\n').filter(r => r.trim().startsWith('{'));
  
  let newRows = rows.map((row, i) => {
    return row.replace('}', `,"name_en":"${enNames[i]}"}`);
  });
  
  return text.replace(match[0], `const ${arrName} = [\n${newRows.join('\n')}\n];`);
}

content = updateArray(content, 'OLD_TESTAMENT', OLD_TESTAMENT_EN);
content = updateArray(content, 'NEW_TESTAMENT', NEW_TESTAMENT_EN);
content = updateArray(content, 'DEUTEROCANONICA', DEUTEROCANONICA_EN);

fs.writeFileSync("src/app/(public)/faith/bible/page.tsx", content);
console.log("Updated page.tsx with en_names");
