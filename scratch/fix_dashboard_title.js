const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', 'utf8');

content = content.replace(
  '<h1 className="text-2xl font-bold text-white mb-2">{camp.camp_name} <span className="text-brand-gold">Angkatan {camp.angkatan}</span></h1>',
  '<h1 className="text-2xl font-bold text-white mb-2">{camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name} {camp.camp_name !== "Other Event" && <span className="text-brand-gold">Angkatan {camp.angkatan}</span>}</h1>'
);

fs.writeFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', content);
