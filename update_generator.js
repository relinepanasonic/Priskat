const fs = require('fs');
let code = fs.readFileSync('generate_all_sql.js', 'utf8');
code += "\nbuildGenerator('hope_devotions.csv', 'Hope', 'Pengharapan', '047_seed_devotions_hope.sql', '047');\n";
fs.writeFileSync('generate_all_sql.js', code);
console.log('Appended Hope to generator');

