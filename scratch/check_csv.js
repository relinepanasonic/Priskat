const fs = require('fs');
const { parse } = require('csv-parse/sync');

const data = fs.readFileSync('public/data/devotions.csv', 'utf8').replace(/^\uFEFF/, '');
const records = parse(data, { columns: true, skip_empty_lines: true });

const topCats = new Set();
const subCats = new Set();

records.forEach(r => {
  topCats.add(r.category);
  subCats.add(r.sub_category);
});

console.log('Top Categories:', [...topCats]);
console.log('Sub Categories:', [...subCats]);
console.log('Total Books:', new Set(records.map(r => r.plan_title_en)).size);

