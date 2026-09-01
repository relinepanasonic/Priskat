const fs = require('fs');
let content = fs.readFileSync('src/lib/types/database.types.ts', 'utf8');

const oldType = `export type PrayerCategory = 
  | 'rosario' 
  | 'bunda_maria' 
  | 'hati_kudus_yesus' 
  | 'roh_kudus' 
  | 'malaikat' 
  | 'jalan_salib' 
  | 'para_kudus' 
  | 'keluarga' 
  | 'doa_harian' 
  | 'tobat_syukur';`;

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
  | 'tobat_syukur';`; // I will keep the old ones in the type just in case the db has them, to avoid TS errors.

const oldConstStart = `export const PRAYER_CATEGORIES: { value: PrayerCategory; label_id: string; label_en: string }[] = [`;
const oldConstRegex = /export const PRAYER_CATEGORIES: \{ value: PrayerCategory; label_id: string; label_en: string \}\[\] = \[\s*\{ value: 'doa_harian'[\s\S]*?\];/m;

const newConst = `export const PRAYER_CATEGORIES: { value: PrayerCategory; label_id: string; label_en: string }[] = [
  { value: 'basic_prayer', label_id: 'Basic Prayer', label_en: 'Basic Prayer' },
  { value: 'doa_harian', label_id: 'Doa Harian', label_en: 'Daily Prayers' },
  { value: 'doa_ekaristi', label_id: 'Doa Ekaristi', label_en: 'Eucharistic Prayer' },
  { value: 'hati_kudus_yesus', label_id: 'Hati Kudus Yesus', label_en: 'Sacred Heart' },
  { value: 'bunda_maria', label_id: 'Bunda Maria', label_en: 'Virgin Mary' },
  { value: 'para_kudus', label_id: 'Para Kudus', label_en: 'Saints' },
  { value: 'jalan_salib', label_id: 'Jalan Salib', label_en: 'Stations of the Cross' },
  { value: 'rosario', label_id: 'Rosario', label_en: 'Rosary' },
];`;

content = content.replace(oldType, newType);
content = content.replace(oldConstRegex, newConst);

fs.writeFileSync('src/lib/types/database.types.ts', content);
console.log('Updated PRAYER_CATEGORIES');

