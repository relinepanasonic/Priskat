const fs = require('fs');
const Papa = require('papaparse');

const content = fs.readFileSync('test.csv', 'utf8');
const results = Papa.parse(content, { header: true, skipEmptyLines: true });

console.log('Fields:', results.meta.fields);
console.log('Rows count:', results.data.length);
console.log('First row:', results.data[0]);

