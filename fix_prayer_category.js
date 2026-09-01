const fs = require('fs');
let content = fs.readFileSync('src/lib/types/database.types.ts', 'utf8');

const regexType = /export type PrayerCategory =[\s\S]*?;/m;
const newType = `export type PrayerCategory = 
  | 'basic_prayer'
  | 'doa_harian' 
  | 'doa_ekaristi'
  | 'hati_kudus_yesus' 
  | 'bunda_maria' 
  | 'para_kudus' 
  | 'jalan_salib' 
  | 'rosario'
  | 'roh_kudus' 
  | 'malaikat' 
  | 'keluarga' 
  | 'tobat_syukur';`;

content = content.replace(regexType, newType);
fs.writeFileSync('src/lib/types/database.types.ts', content);
console.log('Fixed PrayerCategory type');

