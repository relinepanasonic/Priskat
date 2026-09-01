const fs = require('fs');

const files = ['generate_faith_sql.js', 'generate_family_sql.js', 'generate_forgiveness_sql.js'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace processVerses definition
  code = code.replace(/function processVerses.*?processVerses\(verses_id, 'TB'\);/s, 
`  let orderIndex = 0;
  function processVerses(verseText, translationLabel) {
    if (!verseText) return;
    const parts = verseText.split('|');
    const ref = parts[0].trim().replace(/'/g, "''");
    if (ref) {
      sql += \`
  INSERT INTO public.devotion_day_verses (day_id, verse_reference, translation, order_index)
  VALUES (v_day_id, '\${ref}', '\${translationLabel}', \${orderIndex});
\`;
      orderIndex++;
    }
  }

  processVerses(verses_en, 'WEB');
  processVerses(verses_id, 'TB');`);

  fs.writeFileSync(file, code);
  console.log('Fixed', file);
}
