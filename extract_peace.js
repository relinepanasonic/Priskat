const fs = require('fs');
const logPath = 'C:/Users/nicoj/.gemini/antigravity/brain/1568926b-43b0-49f5-8744-7b0ccdaf7ebf/.system_generated/logs/transcript_full.jsonl';
const txt = fs.readFileSync(logPath, 'utf8');
const lines = txt.split('\n');

const searchStr = '"category","category_id"';
const requestText = 'do the last devotional category Peace';

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes(searchStr) && lines[i].includes(requestText)) {
    try {
      const e = JSON.parse(lines[i]);
      if (e.type === 'USER_INPUT' && e.content) {
        let idx = e.content.indexOf(searchStr);
        let csv = e.content.substring(idx);
        
        let metaIdx = csv.indexOf('</USER_REQUEST>');
        if (metaIdx !== -1) csv = csv.substring(0, metaIdx);
        
        // Strip BOM if present
        csv = csv.trim().replace(/^\uFEFF/, '');
        
        fs.writeFileSync('Gallery/Devotional/peace_devotions.csv', csv);
        console.log('Saved Peace CSV! Length:', csv.length);
        break;
      }
    } catch(err) {
      console.error('Error parsing line:', err);
    }
  }
}

