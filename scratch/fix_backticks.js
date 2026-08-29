const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', 'utf8');
content = content.replace(/\\\/g, '\');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', content);
