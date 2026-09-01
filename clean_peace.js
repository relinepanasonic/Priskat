const fs = require('fs');
let p = 'Gallery/Devotional/peace_devotions.csv';
let txt = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const startIdx = txt.indexOf('"category","category_id"');
if(startIdx !== -1) {
  txt = txt.substring(startIdx);
}
fs.writeFileSync(p, txt);
console.log('Cleaned peace_devotions.csv');

