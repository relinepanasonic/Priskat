const fs = require('fs');
let content = fs.readFileSync('supabase/016_seed_under_one_roof.sql', 'utf8');
content = content.replace(/\?"/g, '—');
content = content.replace(/\?/g, '—');
fs.writeFileSync('supabase/016_seed_under_one_roof.sql', content);
