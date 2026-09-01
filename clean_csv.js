const fs = require('fs');
let txt = fs.readFileSync('Gallery/Devotional/forgiveness_devotions.csv', 'utf8');
const searchStr = '"category","category_id"';
const idx = txt.indexOf(searchStr);
if (idx !== -1) {
  let csv = txt.substring(idx).trim();
  fs.writeFileSync('Gallery/Devotional/forgiveness_devotions.csv', csv);
  console.log('Cleaned CSV! Length:', csv.length);
} else {
  console.log('CSV header not found in the raw content.');
}

