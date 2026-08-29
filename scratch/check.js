const fs = require('fs');
const data = fs.readFileSync('public/data/devotions.csv', 'utf8');
const cats = new Set(data.split('\n').filter(l => l.startsWith('"')).map(l => l.split('","')[0]));
console.log([...cats]);

