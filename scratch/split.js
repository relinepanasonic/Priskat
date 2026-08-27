const fs = require('fs');
const content = fs.readFileSync('supabase/012_seed_ot_part1.sql', 'utf8');

const lines = content.split('\n');

// line 0 and 1 are:
// INSERT INTO ...
// VALUES

const header = lines.slice(0, 2).join('\n') + '\n';
const footer = '\nON CONFLICT DO NOTHING;\n';

// The values start at line 2 and go until the last line (which is ON CONFLICT DO NOTHING;)
// Actually, the last line is ON CONFLICT, the line before that ends with a comma or doesn't have a comma.
// In my script, it was `sql += allValues.join(",\n") + "\nON CONFLICT DO NOTHING;\n";`
// So all values end with comma EXCEPT the last one!

const valueLines = lines.slice(2, lines.length - 2); // Exclude the ON CONFLICT line and trailing empty lines

const mid = Math.floor(valueLines.length / 2);

let partA = valueLines.slice(0, mid);
let partB = valueLines.slice(mid);

// Fix trailing commas
// partA's last line might have a comma, we need to remove it for the first file
if (partA[partA.length - 1].endsWith(',')) {
    partA[partA.length - 1] = partA[partA.length - 1].slice(0, -1);
}

// partB's last line shouldn't have a comma, it already doesn't.

fs.writeFileSync('supabase/012A_seed_ot_kej_im.sql', header + partA.join('\n') + footer);
fs.writeFileSync('supabase/012B_seed_ot_bil_2sam.sql', header + partB.join('\n') + footer);

// Remove the original so it doesn't clutter
fs.unlinkSync('supabase/012_seed_ot_part1.sql');

console.log("Split successfully into 012A and 012B");
