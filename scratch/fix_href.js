const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/ongoing/page.tsx', 'utf8');
content = content.replace(/href=\{\\\\/camp\/ongoing\/\\\$\\{camp\.id\\}\\\\}/, 'href={/camp/ongoing/}');
fs.writeFileSync('src/app/(public)/camp/ongoing/page.tsx', content);
