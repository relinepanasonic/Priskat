const fs = require('fs');

let content = fs.readFileSync('src/lib/types/database.types.ts', 'utf8');

const targetStr = `{ value: 'basic_prayer', label_id: 'Basic Prayer', label_en: 'Basic Prayer' }`;
const replacementStr = `{ value: 'basic_prayer', label_id: 'Doa Dasar', label_en: 'Basic Prayer' }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/lib/types/database.types.ts', content);
  console.log('Successfully updated label_id to Doa Dasar');
} else {
  console.log('Target string not found in database.types.ts');
}

