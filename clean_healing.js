const fs = require('fs');
let txt = fs.readFileSync('Gallery/Devotional/healing_devotions.csv', 'utf8');
const searchStr = '"category","category_id"';
const startIdx = txt.indexOf(searchStr);
if (startIdx !== -1) {
  txt = txt.substring(startIdx).trim();
  const endIdx = txt.indexOf('</ADDITIONAL_METADATA>');
  if (endIdx !== -1) {
    const lastQuote = txt.lastIndexOf('"', endIdx);
    if (lastQuote !== -1) txt = txt.substring(0, lastQuote + 1);
  }
  fs.writeFileSync('Gallery/Devotional/healing_devotions.csv', txt);
  console.log('Cleaned CSV!');
} else {
  console.log('Header not found');
}

