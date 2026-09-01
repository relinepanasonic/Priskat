const fs = require('fs');
const logPath = 'C:/Users/nicoj/.gemini/antigravity/brain/1568926b-43b0-49f5-8744-7b0ccdaf7ebf/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const entry = JSON.parse(lines[i]);
    const searchString = '"category","category_id"';
    if (entry.type === 'USER_INPUT' && entry.content && entry.content.includes(searchString)) {
      const idx = entry.content.indexOf(searchString);
      let csv = entry.content.substring(idx).trim();
      fs.writeFileSync('Gallery/Devotional/faith_devotions.csv', csv, 'utf8');
      console.log('Saved CSV! Length: ' + csv.length);
      break;
    }
  } catch (e) {
    console.error(e);
  }
}

