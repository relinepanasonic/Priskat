const fs = require('fs');
const logPath = 'C:/Users/nicoj/.gemini/antigravity/brain/1568926b-43b0-49f5-8744-7b0ccdaf7ebf/.system_generated/logs/transcript_full.jsonl';
const txt = fs.readFileSync(logPath, 'utf8');
const lines = txt.split('\n');

const searchStr = '"category","category_id"';

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('category healing')) {
    try {
      const e = JSON.parse(lines[i]);
      if (e.type === 'USER_INPUT' && e.content) {
        fs.writeFileSync('Gallery/Devotional/healing_devotions.csv', e.content);
        console.log('Saved raw content to csv file!');
        break;
      }
    } catch(err) {}
  }
}

