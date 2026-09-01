const fs = require('fs');
let code = fs.readFileSync('generate_all_sql.js', 'utf8');
code += "\nbuildGenerator('peace_devotions.csv', 'Peace', 'Damai', '053_seed_devotions_peace.sql', '053');\n";
fs.writeFileSync('generate_all_sql.js', code);
console.log('Appended Peace to generator');

