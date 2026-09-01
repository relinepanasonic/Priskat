const fs = require('fs');
['faith_devotions.csv', 'family_devotions.csv', 'forgiveness_devotions.csv'].forEach(f => {
  let p = 'Gallery/Devotional/' + f;
  let txt = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  const startIdx = txt.indexOf('"category","category_id"');
  if(startIdx !== -1) {
    txt = txt.substring(startIdx);
  }
  fs.writeFileSync(p, txt);
  console.log('Cleaned ' + f);
});
